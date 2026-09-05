// src/types/presets.ts

export type AspectRatio = "1:1" | "16:9" | "4:5" | "3:4" | "9:16" | string;

export type AspectRatioVariant = {
  aspectRatio: AspectRatio;
  promptHint?: string;
  negativePromptHint?: string;
};

export interface Preset {
  name: string;
  basePrompt?: string;
  dna?: string;
  aspectRatio: AspectRatio;
  negativePrompt?: string;
  type?: string;
  taxonomyFamily?: string;
  designIntent?: string;
  accessibilityNote?: string;
  altAspectRatios?: readonly AspectRatio[];
  aspectRatioVariants?: readonly AspectRatioVariant[];
  ratioPromptHints?: Readonly<Record<AspectRatio, string>>;
  ratioNegativeHints?: Readonly<Record<AspectRatio, string>>;
  compilerHints?: Readonly<Record<string, unknown>>;
  system?: boolean;
  locked?: boolean;
  v2SynthesisActive?: boolean;
  colorPalette?: string[];
  backgroundHex?: string;
  styleCategory?: string;
  referenceImagePath?: string;
  previewImagePath?: string;
  sourceImagePath?: string;
  cropBox?: { x: number; y: number; width: number; height: number };
  tags?: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  presetDetails?: ElitePreset | any;
}

import type { ElitePreset, OverlapMode } from '../modules/typography/presets';
export type { ElitePreset, OverlapMode };

export interface PresetCategory {
  category: string;
  presets: Preset[] | readonly Preset[];
}

