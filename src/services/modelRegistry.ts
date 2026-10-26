export type ProviderType = 'cloudflare' | 'google_gemini';

export type ImageModel = 'gemini' | 'gemini-flash' | 'gemini-image' | 'cf-flux';

export type BillingStatus = 
  | 'Free / no billing' 
  | 'Free tier with quota' 
  | 'Requires billing' 
  | 'Unknown, blocked';

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
    label: 'Cloudflare FLUX.1 [schnell] (Free)',
    provider: 'cloudflare',
    modelId: '@cf/black-forest-labs/flux-1-schnell',
    requiresApiKey: false,
    supportsReferenceImages: false,
    previewCompatible: true,
    billingStatus: 'Free tier with quota'
  },
  gemini: {
    id: 'gemini',
    label: 'Gemini 3.1 Flash Lite Image (Billing Required)',
    provider: 'google_gemini',
    modelId: 'gemini-3.1-flash-lite-image',
    requiresApiKey: false,
    supportsReferenceImages: true,
    previewCompatible: true,
    billingStatus: 'Requires billing'
  },
  'gemini-flash': {
    id: 'gemini-flash',
    label: 'Gemini 3.1 Flash Image',
    provider: 'google_gemini',
    modelId: 'gemini-3.1-flash-lite-image',
    requiresApiKey: false,
    supportsReferenceImages: true,
    previewCompatible: true,
    billingStatus: 'Requires billing'
  },
  'gemini-image': {
    id: 'gemini-image',
    label: 'Gemini 3.1 Flash Image (High Quality)',
    provider: 'google_gemini',
    modelId: 'gemini-3.1-flash-lite-image',
    requiresApiKey: false,
    supportsReferenceImages: true,
    previewCompatible: true,
    billingStatus: 'Requires billing'
  },
};

export function resolveModelRoute(modelId: string): ModelInfo {
  if (modelId === 'cf-flux' || modelId === 'cloudflare' || modelId === 'flux') {
    return modelRegistry['cf-flux'];
  }
  if (modelId === 'imagen') {
    return modelRegistry['gemini'];
  }
  return modelRegistry[modelId as ImageModel] || modelRegistry['cf-flux'];
}
