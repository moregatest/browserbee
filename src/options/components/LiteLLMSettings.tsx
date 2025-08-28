import React from 'react';

export interface LiteLLMModel {
  id: string;
  name: string;
  inputPrice?: number;
  outputPrice?: number;
  maxTokens?: number;
  contextWindow?: number;
  supportsImages?: boolean;
  isReasoningModel?: boolean;
}

interface LiteLLMSettingsProps {
  litellmApiKey: string;
  setLitellmApiKey: (key: string) => void;
  litellmProxyUrl: string;
  setLitellmProxyUrl: (url: string) => void;
  litellmModelName: string;
  setLitellmModelName: (name: string) => void;
  litellmCustomModels: LiteLLMModel[];
  setLitellmCustomModels: (models: LiteLLMModel[]) => void;
  newLitellmModel: LiteLLMModel;
  setNewLitellmModel: React.Dispatch<React.SetStateAction<LiteLLMModel>>;
  handleAddLitellmModel: () => void;
  handleRemoveLitellmModel: (id: string) => void;
  handleEditLitellmModel: (idx: number, field: string, value: any) => void;
}

export function LiteLLMSettings({
  litellmApiKey,
  setLitellmApiKey,
  litellmProxyUrl,
  setLitellmProxyUrl,
  litellmModelName,
  setLitellmModelName,
  litellmCustomModels,
  setLitellmCustomModels,
  newLitellmModel,
  setNewLitellmModel,
  handleAddLitellmModel,
  handleRemoveLitellmModel,
  handleEditLitellmModel
}: LiteLLMSettingsProps) {
  return (
    <>
      <div className="form-control mb-4">
        <label className="label">
          <span className="label-text font-medium">Proxy URL:</span>
        </label>
        <input 
          type="url" 
          placeholder="http://localhost:4000 or https://your-litellm-proxy.com" 
          className="input input-bordered" 
          value={litellmProxyUrl}
          onChange={(e) => setLitellmProxyUrl(e.target.value)}
        />
        <label className="label">
          <span className="label-text-alt">The URL where your LiteLLM proxy is hosted</span>
        </label>
      </div>

      <div className="form-control mb-4">
        <label className="label">
          <span className="label-text font-medium">API Key (Optional):</span>
        </label>
        <input 
          type="password" 
          placeholder="Your LiteLLM proxy API key (if required)" 
          className="input input-bordered" 
          value={litellmApiKey}
          onChange={(e) => setLitellmApiKey(e.target.value)}
        />
        <label className="label">
          <span className="label-text-alt">Leave empty if your proxy doesn't require authentication</span>
        </label>
      </div>

      <div className="form-control mb-4">
        <label className="label">
          <span className="label-text font-medium">Current Model:</span>
        </label>
        <select 
          className="select select-bordered" 
          value={litellmModelName} 
          onChange={(e) => setLitellmModelName(e.target.value)}
        >
          <option value="">Select a model</option>
          {litellmCustomModels.map(model => (
            <option key={model.id} value={model.id}>
              {model.name} ({model.id})
            </option>
          ))}
        </select>
      </div>

      {/* Custom Models Section */}
      <div className="divider">Model Configuration</div>
      
      <div className="card bg-base-100 border-2 border-base-300 mb-4">
        <div className="card-body">
          <h3 className="card-title text-base">Add New Model</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Model ID:</span>
              </label>
              <input 
                type="text" 
                placeholder="e.g., gpt-4o, claude-3-sonnet" 
                className="input input-bordered input-sm" 
                value={newLitellmModel.id}
                onChange={(e) => setNewLitellmModel(prev => ({ ...prev, id: e.target.value }))}
              />
            </div>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text">Display Name:</span>
              </label>
              <input 
                type="text" 
                placeholder="e.g., GPT-4o, Claude 3 Sonnet" 
                className="input input-bordered input-sm" 
                value={newLitellmModel.name}
                onChange={(e) => setNewLitellmModel(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Input Price (per 1M tokens):</span>
              </label>
              <input 
                type="number" 
                step="0.001" 
                placeholder="e.g., 0.01" 
                className="input input-bordered input-sm" 
                value={newLitellmModel.inputPrice || ''}
                onChange={(e) => setNewLitellmModel(prev => ({ ...prev, inputPrice: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text">Output Price (per 1M tokens):</span>
              </label>
              <input 
                type="number" 
                step="0.001" 
                placeholder="e.g., 0.03" 
                className="input input-bordered input-sm" 
                value={newLitellmModel.outputPrice || ''}
                onChange={(e) => setNewLitellmModel(prev => ({ ...prev, outputPrice: parseFloat(e.target.value) || 0 }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Max Tokens:</span>
              </label>
              <input 
                type="number" 
                placeholder="e.g., 4096" 
                className="input input-bordered input-sm" 
                value={newLitellmModel.maxTokens || ''}
                onChange={(e) => setNewLitellmModel(prev => ({ ...prev, maxTokens: parseInt(e.target.value) || 4096 }))}
              />
            </div>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text">Context Window:</span>
              </label>
              <input 
                type="number" 
                placeholder="e.g., 8192" 
                className="input input-bordered input-sm" 
                value={newLitellmModel.contextWindow || ''}
                onChange={(e) => setNewLitellmModel(prev => ({ ...prev, contextWindow: parseInt(e.target.value) || 8192 }))}
              />
            </div>
          </div>

          <div className="flex gap-4 mb-4">
            <div className="form-control">
              <label className="cursor-pointer label">
                <input 
                  type="checkbox" 
                  className="checkbox checkbox-sm" 
                  checked={newLitellmModel.supportsImages || false}
                  onChange={(e) => setNewLitellmModel(prev => ({ ...prev, supportsImages: e.target.checked }))}
                />
                <span className="label-text ml-2">Supports Images</span>
              </label>
            </div>
            
            <div className="form-control">
              <label className="cursor-pointer label">
                <input 
                  type="checkbox" 
                  className="checkbox checkbox-sm" 
                  checked={newLitellmModel.isReasoningModel || false}
                  onChange={(e) => setNewLitellmModel(prev => ({ ...prev, isReasoningModel: e.target.checked }))}
                />
                <span className="label-text ml-2">Reasoning Model</span>
              </label>
            </div>
          </div>

          <button 
            className="btn btn-primary btn-sm"
            onClick={handleAddLitellmModel}
            disabled={!newLitellmModel.id || !newLitellmModel.name}
          >
            Add Model
          </button>
        </div>
      </div>

      {/* Existing Models List */}
      {litellmCustomModels.length > 0 && (
        <div className="card bg-base-100 border-2 border-base-300">
          <div className="card-body">
            <h3 className="card-title text-base">Configured Models</h3>
            <div className="overflow-x-auto">
              <table className="table table-compact w-full">
                <thead>
                  <tr>
                    <th>Model ID</th>
                    <th>Display Name</th>
                    <th>Input Price</th>
                    <th>Output Price</th>
                    <th>Max Tokens</th>
                    <th>Context Window</th>
                    <th>Features</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {litellmCustomModels.map((model, idx) => (
                    <tr key={model.id}>
                      <td>
                        <input
                          className="input input-bordered input-xs w-full"
                          value={model.id}
                          onChange={(e) => handleEditLitellmModel(idx, 'id', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          className="input input-bordered input-xs w-full"
                          value={model.name}
                          onChange={(e) => handleEditLitellmModel(idx, 'name', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          className="input input-bordered input-xs w-20"
                          type="number"
                          step="0.001"
                          value={model.inputPrice || ''}
                          onChange={(e) => handleEditLitellmModel(idx, 'inputPrice', parseFloat(e.target.value) || 0)}
                        />
                      </td>
                      <td>
                        <input
                          className="input input-bordered input-xs w-20"
                          type="number"
                          step="0.001"
                          value={model.outputPrice || ''}
                          onChange={(e) => handleEditLitellmModel(idx, 'outputPrice', parseFloat(e.target.value) || 0)}
                        />
                      </td>
                      <td>
                        <input
                          className="input input-bordered input-xs w-20"
                          type="number"
                          value={model.maxTokens || ''}
                          onChange={(e) => handleEditLitellmModel(idx, 'maxTokens', parseInt(e.target.value) || 4096)}
                        />
                      </td>
                      <td>
                        <input
                          className="input input-bordered input-xs w-20"
                          type="number"
                          value={model.contextWindow || ''}
                          onChange={(e) => handleEditLitellmModel(idx, 'contextWindow', parseInt(e.target.value) || 8192)}
                        />
                      </td>
                      <td>
                        <div className="flex gap-1">
                          <input
                            type="checkbox"
                            className="checkbox checkbox-xs"
                            checked={model.supportsImages || false}
                            onChange={(e) => handleEditLitellmModel(idx, 'supportsImages', e.target.checked)}
                            title="Supports Images"
                          />
                          <input
                            type="checkbox"
                            className="checkbox checkbox-xs"
                            checked={model.isReasoningModel || false}
                            onChange={(e) => handleEditLitellmModel(idx, 'isReasoningModel', e.target.checked)}
                            title="Reasoning Model"
                          />
                        </div>
                      </td>
                      <td>
                        <button
                          className="btn btn-error btn-xs"
                          onClick={() => handleRemoveLitellmModel(model.id)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}