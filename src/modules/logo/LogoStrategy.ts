import { ModuleStrategy, GenerationContext } from "../../types/generation";
import { compile } from "./LogoPromptCompiler";
import { GLOBAL_NEGATIVE_PROMPT } from "../../lib/constants";

export const LogoModule: ModuleStrategy = {
  id: 'logo design',
  name: 'Logo Design',
  
  constructPrompt: (context: GenerationContext) => {
    const { prompt, preset, base64Image, strictMode, isSubjectOnly, renderMode, isSynthesisEnabled, selectedPalette, promptIntensity } = context;
    
    // Defer all preset matching and compilation to LogoPromptCompiler
    const palette = selectedPalette && selectedPalette.name !== 'Default' ? selectedPalette.colors : undefined;
    let finalPrompt = compile(preset.name, prompt, { palette, isSynthesis: isSynthesisEnabled, renderMode, intensity: promptIntensity });

    if (isSubjectOnly) {
      finalPrompt += `\n\n### SUBJECT ISOLATION ACTIVE\nSubject isolation, transparent-style solid background, zero background clutter. Focus ONLY on the logo mark and typographic elements.`;
    }

    if (base64Image) {
      finalPrompt = `Redesign this logo/image into a professional vector logo.\n${strictMode ? "STRICTLY COPY the reference logo structure/composition." : "Use the reference image as a structural guide."}\n\n${finalPrompt}`;
    }

    return finalPrompt;
  },

  constructNegativePrompt: (context: GenerationContext) => {
    const { preset } = context;
    const presetNegative = preset.negativePrompt ? `${preset.negativePrompt}, ` : '';
    return `${presetNegative}${GLOBAL_NEGATIVE_PROMPT}`.trim();
  },

  shouldSkipTurbo: () => false
};
