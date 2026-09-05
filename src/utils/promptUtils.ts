/**
 * Utility to handle prompt weighting and attention mechanisms.
 * Supports syntax like (word:1.5) or [word] for emphasis.
 */

/**
 * Utility to calculate luminance of a hex color.
 */
export const isColorDark = (hex: string): boolean => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance < 0.5;
};

/**
 * Utility to select material based on color luminance.
 */
export const getProFinishMaterial = (hex: string): string => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  if (luminance < 0.2) {
    return `dark physical material infused with the color ${hex}, such as polished obsidian, anodized metal, or deep tinted glass, bright rim-lit edges, highly reflective surface, studio lighting`;
  } else if (luminance > 0.8) {
    return `bright physical material infused with the color ${hex}, such as iridescent pearl polycarbonate, milky glass, or bright ceramic, prismatic light scattering, soft subsurface scattering`;
  } else {
    return `vibrant physical material densely pigmented with the color ${hex}, such as liquid-filled glass, premium color-infused resin, or polished glossy polymer, translucent depth, hyper-realistic refraction`;
  }
};

export interface WeightedPrompt {
  original: string;
  cleaned: string;
  weights: Array<{ word: string; weight: number }>;
}

export const parsePromptWeights = (prompt: string): WeightedPrompt => {
  const weights: Array<{ word: string; weight: number }> = [];
  
  // Match (word:1.5) or (word)
  const weightRegex = /\(([^:)]+)(?::([\d.]+))?\)/g;
  let match;
  
  // Create a copy to find matches without modifying the original yet
  const tempPrompt = prompt;

  while ((match = weightRegex.exec(tempPrompt)) !== null) {
    const word = match[1].trim();
    const weight = match[2] ? parseFloat(match[2]) : 1.2;
    weights.push({ word, weight });
  }

  // Clean the prompt for models that don't support this syntax natively (but preserve square brackets)
  const cleanedPrompt = prompt
    .replace(/\(([^:)]+)(?::([\d.]+))?\)/g, '$1');

  return {
    original: prompt,
    cleaned: cleanedPrompt,
    weights
  };
};

export const stripMarkdown = (prompt: string): string => {
  return prompt
    .replace(/### \d+\. .*/g, '') // Remove headers like ### 1. PRIMARY OBJECTIVE
    .replace(/\n\n/g, ' ') // Replace double newlines with space
    .replace(/\n/g, ' ') // Replace single newlines with space
    .replace(/- /g, '') // Remove bullet points
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
};

/**
 * Specifically cleans the prompt for Flux models by removing technical jargon
 * and keeping only the visual descriptions.
 */
export const formatForGeminiAttention = (prompt: string): string => {
  const { cleaned, weights } = parsePromptWeights(prompt);
  
  if (weights.length === 0) return prompt;

  let attentionInstruction = "\n\nCRITICAL ATTENTION INSTRUCTIONS:";
  weights.forEach(({ word, weight }) => {
    const level = weight > 1.5 ? "EXTREME" : weight > 1.2 ? "HIGH" : "MODERATE";
    attentionInstruction += `\n- Focus ${level} attention on: "${word}" (Priority Weight: ${weight})`;
  });

  return `${cleaned}${attentionInstruction}`;
};

/**
 * Formats the prompt for Stable Diffusion (BytePlus) which often supports (word:weight) natively.
 */
export const formatForSDAttention = (prompt: string): string => {
  // Most SD implementations support (word:weight)
  // We'll leave brackets alone to avoid breaking audit tags
  return prompt;
};