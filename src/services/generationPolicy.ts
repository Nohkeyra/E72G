import { ImageModel, modelRegistry } from './modelRegistry';
import { isPreviewEnvironment } from '../utils/apiBase';
import { getModelCapabilities, supportsUploadedImageVectorization } from './modelCapabilities';

export interface PolicyResult {
  model: ImageModel;
  reason: string;
}

export type GenerationProfile = 'default_safe' | 'creative' | 'strict' | 'fast';

function isModelKnown(modelId: string): modelId is ImageModel {
  return modelId in modelRegistry;
}

function isModelCompatible(modelId: ImageModel, hasBaseImage: boolean): boolean {
  if (!isModelKnown(modelId)) return false;

  if (hasBaseImage && !supportsUploadedImageVectorization(modelId)) {
    return false;
  }

  return true;
}

function getPreferredFallbackOrder(
  activeTab: string,
  hasBaseImage: boolean
): ImageModel[] {
  const tab = activeTab.toLowerCase();

  if (hasBaseImage) {
    if (tab.includes('vector')) {
      return [
        'gemini',
      ].filter(isModelKnown);
    }

    return [
      'gemini',
    ].filter(isModelKnown);
  }

  if (tab.includes('logo') || tab.includes('vector')) {
    return [
      'gemini',
    ].filter(isModelKnown);
  }

  return [
    'gemini',
  ].filter(isModelKnown);
}

export function selectModelByPolicy(
  activeTab: string,
  hasBaseImage: boolean,
  requestedModel: ImageModel | null
): PolicyResult {
  const isPreview = isPreviewEnvironment();

  if (requestedModel && isModelCompatible(requestedModel, hasBaseImage)) {
    return {
      model: requestedModel,
      reason: 'User-selected model is valid and compatible.'
    };
  }

  if (requestedModel && !isModelKnown(requestedModel)) {
    // fall through to fallback selection
  }

  if (requestedModel && hasBaseImage && !supportsUploadedImageVectorization(requestedModel)) {
    // fall through to compatible image-edit fallback
  }

  const preferredFallbacks = getPreferredFallbackOrder(activeTab, hasBaseImage);
  const compatiblePreferredFallback = preferredFallbacks.find((modelId) =>
    isModelCompatible(modelId, hasBaseImage)
  );

  if (compatiblePreferredFallback) {
    const capabilities = getModelCapabilities(compatiblePreferredFallback);
    const capabilityNote =
      hasBaseImage && capabilities?.supportsImageInput
        ? ' Supports uploaded-image workflows.'
        : '';

    return {
      model: compatiblePreferredFallback,
      reason: `Selected compatible fallback for ${activeTab || 'current'} workflow.${capabilityNote}`
    };
  }

  const allModels = Object.keys(modelRegistry) as ImageModel[];
  const compatibleModels = allModels.filter((modelId) =>
    isModelCompatible(modelId, hasBaseImage)
  );

  if (compatibleModels.length > 0) {
    return {
      model: compatibleModels[0],
      reason: `Rerouted to compatible model: ${compatibleModels[0]}.`
    };
  }

  if (isModelKnown('gemini')) {
    return {
      model: 'gemini',
      reason: hasBaseImage
        ? 'No fully compatible models found for uploaded-image flow. Defaulting to gemini as safest fallback.'
        : 'No compatible models found. Defaulting to gemini.'
    };
  }

  const firstKnownModel = (Object.keys(modelRegistry)[0] as ImageModel | undefined);

  if (firstKnownModel) {
    return {
      model: firstKnownModel,
      reason: 'No preferred fallback was available. Defaulting to first registered model.'
    };
  }

  throw new Error(
    `No models are registered${isPreview ? ' in preview environment' : ''}, so generation policy could not select a model.`
  );
}