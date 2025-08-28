import { AnthropicProvider } from './anthropic';
import { GeminiProvider } from './gemini';
import { LiteLLMProvider, LiteLLMProviderOptions } from './litellm';
import { OllamaProvider, OllamaProviderOptions } from './ollama';
import { OpenAIProvider } from './openai';
import { OpenAICompatibleProvider, OpenAICompatibleProviderOptions } from './openai-compatible';
import { LLMProvider, ProviderOptions } from './types';

export async function createProvider(
  provider: 'anthropic' | 'openai' | 'gemini' | 'ollama' | 'openai-compatible' | 'litellm',
  options: ProviderOptions | OpenAICompatibleProviderOptions | LiteLLMProviderOptions
): Promise<LLMProvider> {
  switch (provider) {
    case 'anthropic':
      return new AnthropicProvider(options);
    case 'openai':
      return new OpenAIProvider(options);
    case 'gemini':
      return new GeminiProvider(options);
      case 'ollama':
        {
          // Get custom Ollama models from storage
          const ollamaCustomModels = await chrome.storage.sync.get({ ollamaCustomModels: [] });
          return new OllamaProvider({
            ...options,
            ollamaCustomModels: ollamaCustomModels.ollamaCustomModels || []
          } as OllamaProviderOptions);
        }
    case 'openai-compatible':
      return new OpenAICompatibleProvider(options as OpenAICompatibleProviderOptions);
    case 'litellm':
      return new LiteLLMProvider(options as LiteLLMProviderOptions);
    default:
      throw new Error(`Provider ${provider} not supported`);
  }
}
