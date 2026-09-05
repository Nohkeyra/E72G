import { ModuleStrategy, GenerationContext } from "../../types/generation";
import { ConditionEngine } from "../../core/ConditionEngine";
import { GLOBAL_NEGATIVE_PROMPT } from "../../lib/constants";

export const VectorModule: ModuleStrategy = {
  id: 'vectorize',
  name: 'Vector',
  
  constructPrompt: (context: GenerationContext) => {
    const { prompt, preset, base64Image, strictMode, isSubjectOnly, selectedPalette, isSynthesisEnabled, isVisualFidelity } = context;
    
    // 1. THE IDENTITY ANCHOR (The most important change)
    let identityAnchor = "";
    if (base64Image) {
      identityAnchor = `[IDENTITY_LOCK: REFERENCE_IMAGE_IS_THE_SOURCE_OF_TRUTH]\n[TASK: Transform the subject of the attached image into a vector graphic. Maintain the exact silhouette, proportions, and core morphology of the reference subject.]\n\n`;
    }

    const taskSubject = prompt.trim().length > 0 ? prompt : "the subject in the reference image";
    const processedBasePrompt = (preset.basePrompt || '').replace(/\[Subject\]/g, taskSubject);

    // COLOR PROTOCOL
    let colorProtocol = "COLOR EXECUTION: Use clean, solid, flat color fills. Zero photographic shading.";
    if (selectedPalette && selectedPalette.name !== 'Default') {
      colorProtocol = `STRICT COLOR PALETTE: ${selectedPalette.name} (${selectedPalette.colors.join(', ')}). MANDATORY: Use ONLY these hex/color values. All shading must be achieved through flat color layering, NOT gradients.`;
    }

    // 2. THE COMMAND HIERARCHY
    let finalPrompt = `${identityAnchor}# PRIMARY MISSION\nTRANSFORM "${taskSubject.toUpperCase()}" INTO A HIGH-PRECISION 2D VECTOR ILLUSTRATION.\n`;
    finalPrompt += `DIRECTIVE: Flat vector style illustration, sharp clean edges, solid blocks of color, minimalist graphic design, 2D vector path layout, zero photographic textures, no 3D gradients, isolated on a clean solid background.\n`;
    finalPrompt += `STYLISTIC CORE: ${processedBasePrompt}\n\n`;

    finalPrompt += `## STYLISTIC ENFORCEMENT PROTOCOLS\n`;
    finalPrompt += `1. VECTOR NATIVITY: Every edge must be a clean, mathematically precise path. No hand-drawn wobbles.\n`;
    finalPrompt += `2. DIMENSIONALITY CONTROL: Strictly 2D or controlled 2.5D (layered) vector aesthetic. Absolutely no real-world 3D depth.\n`;
    finalPrompt += `3. ${colorProtocol}\n\n`;

    // 4. CONDITIONAL MODULES (Subject, Synthesis, Fidelity)
    if (isSubjectOnly) {
      finalPrompt += `## SUBJECT ISOLATION\n- ISOLATE subject on a solid, flat, monochromatic background.\n- Eliminate all environmental context.\n\n`;
    }

    if (isSynthesisEnabled) {
      finalPrompt += `## SYNTHESIS MODE\n- RECOMBINE elements into a high-density, cohesive geometric abstraction.\n- Prioritize pattern, shape, and vector rhythm over literal representation.\n\n`;
    }

    if (isVisualFidelity) {
      // BUG FIXED: Changed "is allowed" to "is strictly prohibited"
      finalPrompt += `## CRITICAL: VISUAL FIDELITY OVERRIDE\n`;
      finalPrompt += `DIRECTIVE: Output must be a sterile, ultra-clean, professional vector-path-compliant graphic.\n`;
      finalPrompt += `STRICTLY PROHIBITED: Photographic grain, paper/cardboard/wood micro-textures, camera depth-of-field, realistic volumetric light, lens flare, or organic shadows. ANY presence of photographic noise will be considered a failure.\n\n`;
    }

    if (base64Image) {
      const fidelityInstruction = strictMode 
        ? "IDENTITY LOCK: Mirror the exact pose, geometry, and composition of the reference image. Do not deviate."
        : "IDENTITY LOCK: Maintain the core morphological features and silhouette of the reference image.";

      finalPrompt += `## IDENTITY LOCK (IMAGE-TO-VECTOR)\n`;
      finalPrompt += `- THE REFERENCE IMAGE IS THE ABSOLUTE GROUND TRUTH.\n`;
      finalPrompt += `- ${fidelityInstruction}\n`;
      if (prompt && !['vectorize', 'vectorize this image'].includes(prompt.toLowerCase())) {
        finalPrompt += `- USER MODIFICATION COMMAND: ${prompt}\n`;
      }
      finalPrompt += `\n`;
    }

    // 5. FINAL BOUNDARIES & BACKGROUND
    finalPrompt += `## BOUNDARY CONSTRAINTS\n`;
    finalPrompt += `- BACKGROUND: Must be a 100% solid, flat, non-textured color.\n`;
    finalPrompt += `- EDGE DEFINITION: Use high-contrast boundaries to separate all forms.\n\n`;

    // 6. THE POST-GENERATION AUDIT (High-Intensity Version)
    finalPrompt += `## FINAL AUDIT CHECK (PRE-RENDER VERIFICATION)\n`;
    finalPrompt += `Before completing, verify the following:\n`;
    finalPrompt += `[ ] ZERO PHOTOREALISM: Are there any photographic gradients or real-world light behaviors? (If yes $\rightarrow$ Flatten immediately).\n`;
    finalPrompt += `[ ] VECTOR INTEGRITY: Do the edges behave like paths? (If they look like brush strokes $\rightarrow$ Sharpen to vector lines).\n`;
    finalPrompt += `[ ] COLOR SEPARATION: Is every color zone clearly defined? (If colors bleed $\rightarrow$ Apply hard edges).\n`;
    finalPrompt += `[ ] ANTI-REALISM THRESHOLD: Convert all organic/material textures (skin, wood, fabric) into flat, posterized vector color blocks.\n`;

    // 7. COMPOSITION HINTS
    try {
      const hints = (preset.ratioPromptHints as Record<string, string> | undefined);
      const ratioHint = hints?.[preset.aspectRatio];
      if (ratioHint) {
        finalPrompt += `\n\n### COMPOSITION GUIDE (${preset.aspectRatio})\n${ratioHint}\n`;
      }
    } catch {
      // ratio hints are optional
    }

    // 8. KSD APPLICATION
    try {
      finalPrompt = ConditionEngine.applyKSD(finalPrompt, 'vectorize', preset.name);
    } catch (e) {
      console.warn("KSD enforcement failed.", e);
    }

    return finalPrompt;
  },

  constructNegativePrompt: (context: GenerationContext) => {
    const { preset } = context;
    // Using the hierarchical negative prompt generated in the refactor
    return `${preset.negativePrompt}, ${GLOBAL_NEGATIVE_PROMPT}`.trim();
  },

  shouldSkipTurbo: () => false
};
