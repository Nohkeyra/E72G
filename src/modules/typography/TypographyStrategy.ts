import { ModuleStrategy, GenerationContext } from '../../types/generation';
import { compile } from './TypographyPromptCompiler';

/**
 * TYPOGRAPHY CORE STRATEGY
 * Handles the logic for prompt synthesis and system behavior.
 */
export const TypographyModule: ModuleStrategy = {
  id: 'typography',
  name: 'Typography',
  description: 'AI-powered Typography',
  constructPrompt: (context: GenerationContext) => {
    const palette = context.selectedPalette && context.selectedPalette.name !== 'Default' ? context.selectedPalette.colors : undefined;
    return compile(context.preset.name, context.prompt, { 
      palette, 
      renderMode: context.renderMode,
      intensity: context.promptIntensity 
    });
  },
  constructNegativePrompt: (context: GenerationContext) => {
    const base = "gradients, drop shadows, thin lines, sketched, drawn, messy, uneven, spelling errors, wrong letters, background noise, construction lines, grids, artifacts, blurry, soft focus";
    if (context.renderMode === 'identity') {
      return base;
    }
    return `flat, 2D, ${base}`;
  },
  shouldSkipTurbo: () => false,
};
