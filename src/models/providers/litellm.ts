import { LLMProvider, ProviderOptions, ModelInfo, ApiStream, StreamChunk } from './types';

export interface LiteLLMProviderOptions extends ProviderOptions {
  proxyUrl: string; // LiteLLM proxy URL
  modelName: string; // Model name to use with LiteLLM proxy
  customModels?: Array<{
    id: string;
    name: string;
    inputPrice?: number;
    outputPrice?: number;
    maxTokens?: number;
    contextWindow?: number;
    supportsImages?: boolean;
    isReasoningModel?: boolean;
  }>;
}

export class LiteLLMProvider implements LLMProvider {
  private options: LiteLLMProviderOptions;

  constructor(options: LiteLLMProviderOptions) {
    this.options = options;
  }

  static getAvailableModels(options?: LiteLLMProviderOptions): {id: string, name: string}[] {
    if (!options?.customModels) {
      return [];
    }
    
    return options.customModels.map(model => ({
      id: model.id,
      name: model.name
    }));
  }

  async *createMessage(systemPrompt: string, messages: any[], tools?: any[]): ApiStream {
    const model = this.getModel();
    
    // Filter out system instructions
    const filteredMessages = messages.filter(message => 
      !(message.role === "user" && 
        typeof message.content === "string" && 
        message.content.startsWith("[SYSTEM INSTRUCTION:"))
    );
    
    // Convert messages to OpenAI format (LiteLLM uses OpenAI-compatible API)
    const openaiMessages = [
      { role: "system", content: systemPrompt },
      ...filteredMessages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    // Configure options for the API request
    const requestBody: any = {
      model: this.options.modelName,
      messages: openaiMessages,
      stream: true,
      max_tokens: model.info.maxTokens || 4096,
      temperature: 0,
    };

    // Add tools configuration if tools are provided
    if (tools && tools.length > 0) {
      const openAITools = tools.map(tool => ({
        type: "function",
        function: {
          name: tool.name,
          description: tool.description,
          parameters: {
            type: "object",
            properties: {
              input: {
                type: "string",
                description: "The input to the tool"
              },
              requires_approval: {
                type: "boolean",
                description: "Whether this tool call requires user approval"
              }
            },
            required: ["input"]
          }
        }
      }));
      
      requestBody.tools = openAITools;
      requestBody.tool_choice = "auto";
    }

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if API key is provided
      if (this.options.apiKey) {
        headers['Authorization'] = `Bearer ${this.options.apiKey}`;
      }

      const url = `${this.options.proxyUrl}/chat/completions`;
      console.log(`[LiteLLM] Making request to: ${url}`);
      console.log(`[LiteLLM] Request body:`, JSON.stringify(requestBody, null, 2));
      console.log(`[LiteLLM] Headers:`, headers);

      // Use globalThis.fetch to ensure compatibility in service worker environment
      const fetchFn = globalThis.fetch || fetch;
      const response = await fetchFn(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      console.log(`[LiteLLM] Response status: ${response.status}`);
      console.log(`[LiteLLM] Response headers:`, Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[LiteLLM] Error response:`, errorText);
        throw new Error(`LiteLLM API error: ${response.status} - ${errorText}`);
      }

      if (!response.body) {
        throw new Error('No response body from LiteLLM API');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let toolCallId = null;
      let toolName = null;
      let toolArguments = '';
      let isCollectingToolCall = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.trim() || !line.startsWith('data: ')) continue;
          
          const data = line.slice(6); // Remove 'data: ' prefix
          if (data === '[DONE]') break;

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices[0]?.delta;

            // Handle text content
            if (delta?.content) {
              yield {
                type: "text",
                text: delta.content,
              };
            }

            // Handle tool calls
            if (delta?.tool_calls && delta.tool_calls.length > 0) {
              const toolCall = delta.tool_calls[0];
              
              // Start of a tool call
              if (toolCall.index === 0 && toolCall.function?.name) {
                isCollectingToolCall = true;
                toolCallId = toolCall.id;
                toolName = toolCall.function.name;
                toolArguments = toolCall.function.arguments || "";
              } 
              // Continue collecting tool call
              else if (isCollectingToolCall && toolCall.function?.arguments) {
                toolArguments += toolCall.function.arguments;
              }
              
              // End of tool call
              if (parsed.choices[0]?.finish_reason === "tool_calls" && isCollectingToolCall) {
                try {
                  const args = JSON.parse(toolArguments || "{}");
                  const input = args.input || "";
                  const requiresApproval = args.requires_approval === true ? "true" : "false";
                  
                  const xmlToolCall = `<tool>${toolName}</tool>\n<input>${input}</input>\n<requires_approval>${requiresApproval}</requires_approval>`;
                  
                  yield {
                    type: "text",
                    text: xmlToolCall,
                  };
                  
                  // Reset tool call collection
                  isCollectingToolCall = false;
                  toolCallId = null;
                  toolName = null;
                  toolArguments = '';
                } catch (error) {
                  console.error("Error parsing tool arguments:", error);
                  yield {
                    type: "text",
                    text: "Error: Failed to parse tool call. Please try again.",
                  };
                }
              }
            }

            // Handle usage information
            if (parsed.usage) {
              yield {
                type: "usage",
                inputTokens: parsed.usage.prompt_tokens || 0,
                outputTokens: parsed.usage.completion_tokens || 0,
              };
            }
          } catch (parseError) {
            // Ignore JSON parsing errors for incomplete chunks
            continue;
          }
        }
      }
    } catch (error) {
      console.error("[LiteLLM] Error in stream:", error);
      
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Provide more specific error messages based on common issues
        if (error.message.includes('Failed to fetch')) {
          errorMessage = `Network error: Could not connect to LiteLLM proxy at ${this.options.proxyUrl}. 
Please check:
1. Is your LiteLLM proxy server running?
2. Is the URL correct?
3. Are there any CORS issues?
4. Is the proxy accessible from the browser?`;
        }
      }
      
      yield {
        type: "text",
        text: `❌ LiteLLM Error: ${errorMessage}`,
      };
    }
  }

  getModel(): { id: string; info: ModelInfo } {
    const modelName = this.options.modelName;
    
    // Try to find custom model info
    const customModel = this.options.customModels?.find(model => model.id === modelName);
    
    if (customModel) {
      return {
        id: modelName,
        info: {
          name: customModel.name,
          inputPrice: customModel.inputPrice || 0.01, // Default pricing
          outputPrice: customModel.outputPrice || 0.03,
          maxTokens: customModel.maxTokens || 4096,
          contextWindow: customModel.contextWindow || 8192,
          supportsImages: customModel.supportsImages || false,
          isReasoningModel: customModel.isReasoningModel || false,
        },
      };
    }

    // Default model info if not found in custom models
    return {
      id: modelName,
      info: {
        name: modelName,
        inputPrice: 0.01, // Default pricing per million tokens
        outputPrice: 0.03,
        maxTokens: 4096,
        contextWindow: 8192,
        supportsImages: false,
        isReasoningModel: false,
      },
    };
  }
}