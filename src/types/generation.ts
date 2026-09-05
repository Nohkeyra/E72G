import { Preset } from "./presets";
import { EnginePayload } from "../core/ConditionEngine";
import { ColorPalette } from "../lib/colorPalettes";
import type { GeminiAnalysisResult } from "../services/GeminiVisionHandler";

export interface GenerationContext {
  prompt: string;
  preset: Preset;
  base64Image?: string;
  mimeType?: string;
  strictMode?: boolean;
  isSubjectOnly?: boolean;
  isSynthesisEnabled?: boolean;
  selectedPalette?: ColorPalette | null;
  logoType?: string;
  logoLayout?: string;
  editInstruction?: string;
  selectedModel?: string;
  geminiAnalysis?: GeminiAnalysisResult;
  renderMode?: "execution" | "identity" | null;
  isProFinish?: boolean;
  promptIntensity?: number;
  isFastTrack?: boolean;
  isSimplifiedMode?: boolean;
  activeTab?: string;
  isVisualFidelity?: boolean;
}

export interface ModuleStrategy {
  id: string;
  name: string;
  description?: string;
  constructPrompt(context: GenerationContext): string;
  constructNegativePrompt?(context: GenerationContext): string;
  shouldSkipTurbo(context: GenerationContext): boolean;
  generate?(payload: EnginePayload, apiKey?: string): Promise<string>;
}