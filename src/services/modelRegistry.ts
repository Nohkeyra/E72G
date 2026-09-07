export type ImageModel = 'gemini' | 'gemini-flash' | 'gemini-image';

export type BillingStatus = 
  | 'Free / no billing' 
  | 'Free tier with quota' 
  | 'Requires billing' 
  | 'Unknown, blocked';

export interface ModelInfo {
  id: ImageModel;
  label: string;
  provider: 'google_gemini';
  modelId: string;
  requiresApiKey: boolean;
  previewCompatible?: boolean;
  hidden?: boolean;
  billingStatus: BillingStatus;
}

export const modelRegistry: Record<ImageModel, ModelInfo> = {
  gemini: {
    id: 'gemini',
    label: 'Gemini 2.5 Flash Image (Free Tier)',
    provider: 'google_gemini',
    modelId: 'gemini-2.5-flash-image',
    requiresApiKey: false,
    previewCompatible: true,
    billingStatus: 'Free tier with quota'
  },
  'gemini-flash': {
    id: 'gemini-flash',
    label: 'Gemini 2.5 Flash Image',
    provider: 'google_gemini',
    modelId: 'gemini-2.5-flash-image',
    requiresApiKey: false,
    previewCompatible: true,
    billingStatus: 'Free tier with quota'
  },
  'gemini-image': {
    id: 'gemini-image',
    label: 'Gemini 3.1 Flash Image (High Quality)',
    provider: 'google_gemini',
    modelId: 'gemini-3.1-flash-image',
    requiresApiKey: false,
    previewCompatible: true,
    billingStatus: 'Free tier with quota'
  },
};

export function resolveModelRoute(modelId: string): ModelInfo {
  if (modelId === 'imagen') {
    return modelRegistry['gemini'];
  }
  return modelRegistry[modelId as ImageModel] || modelRegistry['gemini'];
}
