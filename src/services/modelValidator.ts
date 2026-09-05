import { modelRegistry, ModelInfo, ImageModel } from './modelRegistry';

class ModelValidationError extends Error {
  public blockedByFreeOnlyMode?: boolean;
  constructor(message: string, blockedByFreeOnlyMode?: boolean) {
    super(message);
    this.name = 'ModelValidationError';
    this.blockedByFreeOnlyMode = blockedByFreeOnlyMode;
  }
}

export function validateModelCall(modelId: string, hasKey: boolean = false): ModelInfo {
  const modelInfo = modelRegistry[modelId as ImageModel];

  if (!modelInfo) {
    throw new ModelValidationError(`Model '${modelId}' is not registered.`);
  }

  if (modelInfo.requiresApiKey && !hasKey) {
    throw new ModelValidationError(`The model '${modelInfo.label}' requires a custom Gemini API key. Please add it in Settings.`);
  }

  return modelInfo;
}
