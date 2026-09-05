import type { GeminiAnalysisResult } from "../services/GeminiVisionHandler";
import type { AspectRatio, Preset } from "./presets";

export type EditOperation =
  | "remove"
  | "replace"
  | "add"
  | "change"
  | "transform"
  | "restyle"
  | "cleanup"
  | "unknown";

export type EditIntent = {
  isEditRequest: boolean;
  operation: EditOperation;
  target?: string;
  replacement?: string;
  styleTarget?: string;
  preserveComposition: boolean;
  preserveIdentity: boolean;
  preserveLayout: boolean;
  rawPrompt: string;
};

export type EditCompileInput = {
  prompt: string;
  hasReferenceImage: boolean;
  detectedSubject?: string;

  // ✅ Existing compatibility fields (DO NOT REMOVE)
  activePresetPrompt?: string;
  activeStyleModifiers?: string[];
  mode?: "vector" | "typography" | "logo";

  // ✅ NEW (safe optional fields)
  activePreset?: Preset | null;
  selectedAspectRatio?: AspectRatio;
};

export type EditCompileResult = {
  isEditRequest: boolean;
  intent: EditIntent;
  compiledPrompt: string;
  negativePrompt?: string;
  debug?: {
    normalizedPrompt: string;
    detectedOperation: EditOperation;
    target?: string;
    replacement?: string;
  };
};

export type TypographyIntent =
  | "wordmark"
  | "poster_type"
  | "experimental_type"
  | "letter_to_shape"
  | "logo_type"
  | "distorted_display"
  | "clean_editorial";

export type TypographyCompileInput = {
  text: string;
  presetName?: string;
  presetBasePrompt?: string;
  modelFamily?: "flux" | "sd" | "gemini" | "other";
  styleIntensity?: number;
  readabilityPriority?: "low" | "medium" | "high";
  distortionLevel?: "low" | "medium" | "high" | "shape_morph";
  compositionDensity?: "low" | "medium" | "high";
  layout?: "horizontal" | "stacked" | "square" | "free";
  colorDirective?: string;
  referenceImageAnalysis?: string;
  prioritizeSpelling?: boolean;
  hasReferenceImage?: boolean;
  isCalligram?: boolean;
  geminiAnalysis?: GeminiAnalysisResult;
  aesthetic?: "illustration" | "realistic";
};

export type TypographyCompileResult = {
  prompt: string;
  negativePrompt?: string;
  debug: {
    textBlock: string;
    wordCountBlock: string;
    styleBlock: string;
    layoutBlock: string;
    readabilityBlock: string;
    negativeBlock: string;
    modelFamily: string;
    appliedStrategies: string[];
    intent: TypographyIntent;
  };
};