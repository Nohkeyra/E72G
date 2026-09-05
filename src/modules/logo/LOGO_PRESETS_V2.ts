// LOGO_PRESETS_V2.ts - Enhanced with Master VORTEX-PRO protocols
export const MASTER_LOGO_2D = "Strict 2D vector logo anatomy, precise strokes, uniform geometric weight and structural flatness. clear flatlay illustration. Isolated on clear solid background. High-impact minimalist silhouette. evenly balanced geometry. Precision vector paths. no gradients, no shadows, no 3D effects.";
export const MASTER_LOGO_3D = "Professional 3D Ray-traced logo design. skilled material synthesis. Advanced global illumination and caustic reflections. Tactile depth and volume. Isolated on clear solid background. Physically based materials, precise volumetric depth.";

export const MASTER_NEGATIVE_2D = "3d render, shadows, photography, realistic, depth of field, blurry, low contrast, messy, noisy, gradients, textures.";
export const MASTER_NEGATIVE_3D = "flat 2d, vector, cartoon, unshaded, 2d graphic, blurry, low contrast, messy, noisy, flat color.";

export const LOGO_PRESETS_V2: Record<string, { Positive_Prompt: string, Negative_Prompt: string }> = {
  "Heritage Badge": {
    Positive_Prompt: "A prestigious circular heritage badge logo for '[BRAND_NAME]' featuring a central '[ICON]'. Classic ornate border, sophisticated serif typography wrapping the perimeter. Aesthetic: Heritage, Legacy, Traditional Excellence. Fine linework, balanced historical emblem composition, timeless brand authority. " + MASTER_LOGO_2D,
    Negative_Prompt: MASTER_NEGATIVE_2D
  },
  "2D Precision Vector": {
    Positive_Prompt: "A high-end professional 2D vector brand mark for '[BRAND_NAME]' incorporating '[ICON]'. " + MASTER_LOGO_2D,
    Negative_Prompt: MASTER_NEGATIVE_2D
  },
  "3D Ray-Traced Identity": {
    Positive_Prompt: "A high-fidelity 3D brand identity for '[BRAND_NAME]' featuring '[ICON]'. " + MASTER_LOGO_3D,
    Negative_Prompt: MASTER_NEGATIVE_3D
  }
};
