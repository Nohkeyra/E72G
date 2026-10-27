export type ProviderType = 'cloudflare' | 'google_gemini';

export type ImageModel = 'cf-flux' | 'gemini';

export type BillingStatus = 
  | 'Free / no billing' 
  | 'Free tier with quota';

export interface ModelInfo {
  id: ImageModel;
  label: string;
  provider: ProviderType;
  modelId: string;
  requiresApiKey: boolean;
  supportsReferenceImages: boolean;
  previewCompatible?: boolean;
  hidden?: boolean;
  billingStatus: BillingStatus;
}

export const modelRegistry: Record<ImageModel, ModelInfo> = {
  'cf-flux': {
    id: 'cf-flux',
    label: 'Cloudflare FLUX',
    provider: 'cloudflare',
    modelId: '@cf/black-forest-labs/flux-1-schnell',
    requiresApiKey: false,
    supportsReferenceImages: true,
    previewCompatible: true,
    billingStatus: 'Free tier with quota'
  },
  gemini: {
    id: 'gemini',
    label: 'Google Gemini',
    provider: 'google_gemini',
    modelId: 'gemini-3.1-flash-lite-image',
    requiresApiKey: false,
    supportsReferenceImages: true,
    previewCompatible: true,
    billingStatus: 'Free tier with quota'
  },
};

export function resolveModelRoute(modelId: string): ModelInfo {
  if (modelId === 'cf-flux' || modelId === 'cloudflare' || modelId === 'flux') {
    return modelRegistry['cf-flux'];
  }
  if (modelId === 'gemini' || modelId === 'gemini-flash' || modelId === 'gemini-image' || modelId === 'imagen') {
    return modelRegistry['gemini'];
  }
  return modelRegistry[modelId as ImageModel] || modelRegistry['cf-flux'];
}

