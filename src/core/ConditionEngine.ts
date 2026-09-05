import { Preset } from '../types/presets';
import { ColorPalette } from '@/src/lib/colorPalettes';
import { ImageModel } from '@/src/services/modelRegistry';

export interface GenerationConfig {
  readonly prompt: string;
  readonly preset: Preset;
  readonly palette?: ColorPalette;
  readonly base64Image?: string;
  readonly mimeType?: string;
  readonly strictMode: boolean;
  readonly model: ImageModel;
}

export interface EnginePayload {
  readonly finalPrompt: string;
  readonly preset: Preset;
  readonly base64Image?: string;
  readonly mimeType?: string;
  readonly strictMode: boolean;
  readonly model: ImageModel;
}

// KSD definition (unchanged from your earlier version, but now inside this file)
export const KSD = {
  version: "2.2-neutral",
  name: "KSD_Unified",
  description: "Unified Knowledge Structure Definition for Vector and Logo Design.",

  globalRules: {
    no_text_response: true,
    geometry_priority: true,
    vector_safe: true,
    no_style_drift: true,
    logo_standards: "strict",
    path_quantization: "strict",
    color_limit: 16
  },

  structuralLayers: {
    vector_base: [
      "mathematically precise paths",
      "45-degree shears",
      "zero-gap terminals",
      "monolithic mass",
      "interlocking geometry"
    ]
  },

  modules: {
    "logo design": {
      merge: "anchor_based_overlap",
      symmetry: "vertical",
      stroke_uniform: true,
      path_fidelity: "High",
      additionalRules: [
        "Monochrome-first logic",
        "Perfectly centered and symmetrical",
        "Razor-sharp vector edges"
      ]
    },
    "vectorize": {
      shape_language: "geometric",
      anchor_precision: "high",
      scalable: true,
      additionalRules: [
        "LINE WORK: Use clean, closed-path strokes with consistent line weights. No sketchy or organic brushstrokes.",
        "EDGE DEFINITION: All edges must be razor-sharp and aliased. Avoid all depth-of-field, lens blur, or soft focus.",
        "LIGHTING & SHADOWS: Use cel-shading or hard-edge shadows only. No realistic global illumination or soft drop shadows.",
        "TECHNICAL FINISH: The final output must resemble a finished 2D digital graphic (Adobe Illustrator style). It must be uncluttered, minimalist, and high-contrast.",
        "CRITICAL: The result MUST look like high-end, professional graphic design. It MUST NOT look like photography, stock clipart, or amateur art."
      ]
    }
  }
};

export class ConditionEngine {
  static applyKSD(finalPrompt: string, moduleId: string, presetName?: string): string {
    let enhancedPrompt = finalPrompt;

    // Apply Global Rules
    if (KSD.globalRules.geometry_priority) {
      enhancedPrompt += "\n\n[KSD: GEOMETRY PRIORITY ACTIVE]";
    }

    // Gradient Ban (Task 1)
    if (moduleId === 'vector-style' || moduleId === 'vectorize') {
      if (presetName !== 'Vibrant Gradient Flow') {
        enhancedPrompt += "\n\nCRITICAL BANNED ELEMENT: No gradients allowed. Use only solid, flat colors and posterized tones. Zero color transitions.";
      }
    }

    // Map module IDs to KSD keys
    let ksdModuleId = moduleId;
    if (moduleId === 'vector-style') ksdModuleId = 'vectorize';

    // Apply Module-Specific Rules
    const moduleRules = KSD.modules[ksdModuleId as keyof typeof KSD.modules];
    if (moduleRules) {
      enhancedPrompt += `\n\n### KSD MODULE LOGIC: ${ksdModuleId.toUpperCase()}`;
      const rules = moduleRules as Record<string, unknown>;
      enhancedPrompt += `\n- Shape Language: ${rules.shape_language || 'Standard'}`;
      enhancedPrompt += `\n- Path Fidelity: ${rules.path_fidelity || 'Standard'}`;
      if (rules.additionalRules && Array.isArray(rules.additionalRules)) {
        enhancedPrompt += `\n- ${rules.additionalRules.join('\n- ')}`;
      }
    }

    // Apply Structural Layers based on module
    if (ksdModuleId === 'vectorize') {
      enhancedPrompt += `\n\n### KSD STRUCTURAL LAYER: VECTOR BASE\n- ${KSD.structuralLayers.vector_base.join('\n- ')}`;
    }

    return enhancedPrompt;
  }

  static build(config: GenerationConfig): EnginePayload {
    let finalPrompt = config.prompt.trim();

    if (config.palette && config.palette.name !== 'Default') {
      finalPrompt += `\n\n### CRITICAL PALETTE LOCK (HEX ONLY)
STRICTLY USE ONLY these exact hex codes: ${config.palette.colors.join(', ')}. 
Do NOT introduce any other colors, shades, or tints. Every single pixel must map to one of these provided hex values. 
Enforce perfect color-blocking with these absolute values.`;
    }

    if (config.strictMode && !config.base64Image) {
      console.warn("ConditionEngine: strictMode is true but no reference image provided.");
    }

    return Object.freeze({
      finalPrompt,
      preset: config.preset,
      base64Image: config.base64Image,
      mimeType: config.mimeType,
      strictMode: config.strictMode,
      model: config.model
    });
  }
}