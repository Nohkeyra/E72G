
export type EngineFamily = 'gemini';

export interface ModelCapabilities {
  family: EngineFamily;
  prefersNaturalLanguagePrompt: boolean;
  supportsNegativePrompt: boolean;
  supportsGuidanceScale: boolean;
  supportsSteps: boolean;
  supportsSeed: boolean;
  defaultWidth: number;
  defaultHeight: number;
  defaultSteps: number;
  defaultGuidanceScale?: number;
  supportsImg2Img: boolean;
  supportsImageEditing?: boolean;
  engineFamily?: "generic";
  goodForLogos?: boolean;
  goodForAnalysis?: boolean;
  goodForVector?: boolean;
  supportsImageInput?: boolean;
}

const GEMINI_CAPABILITIES: ModelCapabilities = {
  family: 'gemini',
  prefersNaturalLanguagePrompt: true,
  supportsNegativePrompt: false,
  supportsGuidanceScale: false,
  supportsSteps: false,
  supportsSeed: false,
  defaultWidth: 1024,
  defaultHeight: 1024,
  defaultSteps: 0,
  supportsImg2Img: true,
  supportsImageEditing: true,
  engineFamily: "generic",
  goodForLogos: true,
  goodForAnalysis: true,
  goodForVector: true,
};

export function supportsUploadedImageVectorization(model: string): boolean {
  const capabilities = getModelCapabilities(model);
  return Boolean(capabilities.supportsImg2Img || capabilities.supportsImageEditing);
}

export function isVectorSafeModel(): boolean {
  return false; // Gemini models don't typically use the same vectorization pipeline as SD/Flux
}

export function isModelSuitedForModule(model: string, tab: string, hasImage: boolean): boolean {
  const capabilities = getModelCapabilities(model);

  switch (tab) {
    case 'vectorize':
      if (hasImage && !capabilities.supportsImg2Img) return false;
      return Boolean(capabilities.goodForVector);

    case 'logo design':
      return Boolean(capabilities.goodForLogos);

    default:
      return true;
  }
}

export function getModelCapabilities(model: string): ModelCapabilities {
  const id = String(model || '').toLowerCase();

  if (id.includes('gemini')) {
    const capabilities = { ...GEMINI_CAPABILITIES };
    return capabilities;
  }

  return GEMINI_CAPABILITIES;
}

export function joinPromptParts(...parts: Array<string | undefined>): string {
  return parts
    .map((part) => String(part || '').trim())
    .filter(Boolean)
    .join(', ')
    .replace(/\s*,\s*,+/g, ', ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function buildCompiledPrompt(args: {
  prompt: string;
  presetBasePrompt?: string;
  presetNegativePrompt?: string;
  model: string;
}): { prompt: string; negativePrompt: string } {
  const prompt = joinPromptParts(args.presetBasePrompt, args.prompt);
  return {
    prompt,
    negativePrompt: '',
  };
}
