export interface StylePreset {
  id: string;
  name: string;
  modifiers: string;
  basePrompt?: string;
  dna?: string;
  taxonomyFamily?: string;
}

export const STYLE_PRESETS: StylePreset[] = [
  { id: 'none', name: 'None', modifiers: '', taxonomyFamily: 'ui' },
  { id: 'vibrant', name: 'Vibrant', modifiers: 'high saturation, vibrant colors, energetic', taxonomyFamily: 'ui' },
  { id: 'muted', name: 'Muted', modifiers: 'low saturation, pastel colors, soft tones', taxonomyFamily: 'ui' },
  { id: 'monochrome', name: 'Monochrome', modifiers: 'black and white, grayscale, high contrast', taxonomyFamily: 'ui' },
  { id: 'neon', name: 'Neon', modifiers: 'glowing neon colors, dark background, electric', taxonomyFamily: 'ui' },
  { id: 'vintage', name: 'Vintage', modifiers: 'retro colors, aged paper texture, nostalgic', taxonomyFamily: 'ui' },
  { 
    id: 'structural-tactical', 
    name: 'Structural Tactical', 
    modifiers: 'high-contrast vector execution, precise geometric letterforms, maximum clarity',
    basePrompt: 'Structural Tactical Typography: [WORD] rendered with high-contrast geometric letterforms and precise baseline alignment. Focus on logical pathing, even kerning, and razor-sharp anchor points. Clean monochromatic presentation, high-contrast figure-ground relationship.',
    dna: 'Structural Tactical Architecture: Evaluate geometric consistency and stroke precision. Audit letterform pathing for minimal anchor points and maximum typographic clarity.',
    taxonomyFamily: 'shape'
  },
  { 
    id: 'shape-constrained', 
    name: 'Shape-Constrained', 
    modifiers: 'negative space logic, background silhouette creates letterforms, minimal anchor points',
    basePrompt: 'Shape-Constrained Typography: Negative space logic, background silhouette creates letterforms, minimal anchor points, geometric typographic clarity, precise kerning.',
    dna: 'Shape-Constrained Typography: Audit interaction between positive vector mass and negative typographic voids, evaluate optical balance and closure principle for letterform legibility.',
    taxonomyFamily: 'shape'
  },
  { 
    id: 'shape-constrained-calligram', 
    name: 'Shape-Constrained Calligram', 
    modifiers: 'anatomical liquification, interlocking ligatures, zero-gap packing, circular counter-forms',
    basePrompt: 'Shape-Constrained Calligram: ANATOMICAL LIQUIFICATION: [WORD] is surgically warped to flush-fill the [SHAPE] silhouette with 100% occupancy and zero dead space. Letters must interlock with variable stroke weights and swirling fluid terminals. Include circular eye-like counter-forms for a 1960s psychedelic soul. High-contrast monochromatic ink, razor-sharp vector paths, isolated on plain background.',
    dna: 'Shape-Constrained Calligram: Audit letterform pathing for anatomical liquification and zero-gap density. Verify silhouette boundary adherence and inclusion of circular counter-forms. Ensure interlocking ligatures with no standard font geometry or straight baselines.',
    taxonomyFamily: 'shape'
  },
];