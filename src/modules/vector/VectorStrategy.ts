import { ModuleStrategy, GenerationContext } from "../../types/generation";
import { ConditionEngine } from "../../core/ConditionEngine";
import { GLOBAL_NEGATIVE_PROMPT } from "../../lib/constants";

export const VectorModule: ModuleStrategy = {
  id: 'vectorize',
  name: 'Vector',
  
  constructPrompt: (context: GenerationContext) => {
    const {
      prompt,
      preset,
      base64Image,
      strictMode,
      isSubjectOnly,
      selectedPalette,
      isSynthesisEnabled,
      isVisualFidelity,
      vectorAnalysis
    } = context;
    
    // 1. Resolve meaningful subject identification
    const trimmedPrompt = (prompt || '').trim();
    const isGenericPrompt = !trimmedPrompt || [
      'vectorize',
      'vectorize this image',
      'vector',
      'vectorize this',
      'vector art',
      'vectorize image'
    ].includes(trimmedPrompt.toLowerCase());

    const detectedSubject = vectorAnalysis?.subjectName;
    const taskSubject = !isGenericPrompt
      ? trimmedPrompt
      : (detectedSubject || (base64Image ? "the subject in the reference image" : "graphic subject"));

    const processedBasePrompt = (preset.basePrompt || '').replace(/\[Subject\]/g, taskSubject);

    // 2. THE SUBJECT PRESERVATION DIRECTIVE (Mandatory for reference images)
    let identityAnchor = "";
    if (base64Image) {
      const fidelityInstruction = strictMode
        ? "STRICT FIDELITY: Mirror the exact pose, geometry, contours, and physical composition of the reference subject. Zero creative deviation from the source subject."
        : "CORE IDENTITY: Maintain the exact recognizable subject identity, proportions, silhouette, and primary morphology of the reference.";

      identityAnchor = `[SUBJECT_PRESERVATION_DIRECTIVE]\n`;
      identityAnchor += `- REFERENCE IMAGE IS THE GROUND TRUTH: The uploaded image defines the subject identity.\n`;
      identityAnchor += `- ${fidelityInstruction}\n`;
      identityAnchor += `- STRUCTURAL INTEGRITY: Maintain original relative proportions, limb/component counts, orientation, and distinguishing features. Do not invent unrelated objects, extra limbs, or arbitrary background clutter.\n`;
      identityAnchor += `- VECTOR-ART TREATMENT: Translate the subject into clean, professional 2D vector-style artwork. Render crisp outlines, smooth contours, cleanly separated color regions, and polished graphic shapes. Output format is PNG.\n\n`;
    }

    // 3. COLOR PROTOCOL
    let colorProtocol = "COLOR EXECUTION: Use clean, well-defined color regions with smooth transitions and zero photographic noise.";
    if (selectedPalette && selectedPalette.name !== 'Default') {
      colorProtocol = `STRICT COLOR PALETTE: ${selectedPalette.name} (${selectedPalette.colors.join(', ')}). MANDATORY: Base the artwork on these colors. Form shading must be achieved through structured color layering, not photorealistic grain.`;
    }

    // 4. THE COMMAND HIERARCHY
    let finalPrompt = `${identityAnchor}# PRIMARY MISSION\nILLUSTRATE "${taskSubject.toUpperCase()}" IN A PROFESSIONAL VECTOR ART STYLE.\n`;
    finalPrompt += `STYLE DIRECTIVE: ${processedBasePrompt}\n`;
    finalPrompt += `VECTOR EXECUTION: Clean vector-style contours, crisp delineated edges, clearly separated color regions, controlled shading, zero photographic noise or film grain, balanced graphic composition.\n\n`;

    // 5. MORPHOLOGY & REFERENCE ANCHORS (From vision analysis when available)
    if (vectorAnalysis) {
      finalPrompt += `## SUBJECT MORPHOLOGY & REFERENCE ANCHORS\n`;
      if (vectorAnalysis.subjectName) finalPrompt += `- Subject Identification: ${vectorAnalysis.subjectName}\n`;
      if (vectorAnalysis.description) finalPrompt += `- Pose & Structure: ${vectorAnalysis.description}\n`;
      if (vectorAnalysis.silhouette) finalPrompt += `- Silhouette & Contours: ${vectorAnalysis.silhouette}\n`;
      if (vectorAnalysis.distinctiveDetails) finalPrompt += `- Distinctive Details (Must Retain): ${vectorAnalysis.distinctiveDetails}\n`;
      if (vectorAnalysis.colors) finalPrompt += `- Color Scheme: ${vectorAnalysis.colors}\n`;
      if (vectorAnalysis.shapes) finalPrompt += `- Geometric & Line Architecture: ${vectorAnalysis.shapes}\n`;
      if (vectorAnalysis.vectorAdvice) finalPrompt += `- Vector Translation Guide: ${vectorAnalysis.vectorAdvice}\n`;
      finalPrompt += `\n`;
    }

    finalPrompt += `## STYLISTIC ENFORCEMENT PROTOCOLS\n`;
    finalPrompt += `1. VECTOR NATIVITY: Every edge must be a clean, deliberate contour path. Smooth bezier curves and crisp boundaries without photographic fuzziness.\n`;
    finalPrompt += `2. DIMENSIONALITY CONTROL: 2D or controlled layered 2.5D vector illustration aesthetic. Avoid realistic volumetric physical light or camera blur.\n`;
    finalPrompt += `3. ${colorProtocol}\n\n`;

    // 6. CONDITIONAL MODULES
    if (isSubjectOnly) {
      finalPrompt += `## SUBJECT ISOLATION\n- Isolate the subject cleanly on a solid, flat, monochromatic background.\n- Eliminate all environmental noise.\n\n`;
    }

    if (isSynthesisEnabled) {
      finalPrompt += `## SYNTHESIS HARMONY\n- Harmonize the subject's contours into clean geometric rhythms while retaining recognizable subject identity.\n\n`;
    }

    if (isVisualFidelity) {
      finalPrompt += `## CRITICAL: VISUAL FIDELITY OVERRIDE\n`;
      finalPrompt += `DIRECTIVE: Output must be a pristine, ultra-clean vector-style illustration.\n`;
      finalPrompt += `STRICTLY PROHIBITED: Photographic grain, paper/wood textures, camera depth-of-field, realistic volumetric light, lens flare, or organic shadows. Any photographic noise is unacceptable.\n\n`;
    }

    if (base64Image && !isGenericPrompt) {
      finalPrompt += `## USER DIRECTIVE MODIFICATIONS\n`;
      finalPrompt += `- USER COMMAND: ${trimmedPrompt}\n`;
      finalPrompt += `- Note: Apply the requested modification while strictly preserving the underlying subject identity.\n\n`;
    }

    // 7. BOUNDARIES & BACKGROUND
    finalPrompt += `## BOUNDARY CONSTRAINTS\n`;
    finalPrompt += `- BACKGROUND: Clean, solid, or softly textured graphic backdrop designed to make the subject pop.\n`;
    finalPrompt += `- EDGE DEFINITION: High-contrast boundaries separating internal forms and outer silhouettes.\n\n`;

    // 8. PRE-RENDER AUDIT
    finalPrompt += `## FINAL AUDIT CHECK (PRE-RENDER VERIFICATION)\n`;
    finalPrompt += `[ ] SUBJECT ACCURACY: Does the generated subject match the reference identity and silhouette? (Must preserve).\n`;
    finalPrompt += `[ ] ZERO REAL-WORLD NOISE: Are there real camera artifacts or photo grain? (Flatten to clean vector fills).\n`;
    finalPrompt += `[ ] CONTOUR CLARITY: Are outlines and color boundaries sharply delineated?\n`;
    finalPrompt += `[ ] COLOR SEPARATION: Are color zones distinct and harmonious?\n`;

    // 9. COMPOSITION GUIDE
    try {
      const hints = (preset.ratioPromptHints as Record<string, string> | undefined);
      const ratioHint = hints?.[preset.aspectRatio];
      if (ratioHint) {
        finalPrompt += `\n\n### COMPOSITION GUIDE (${preset.aspectRatio})\n${ratioHint}\n`;
      }
    } catch {
      // ratio hints are optional
    }

    // 10. KSD APPLICATION
    try {
      finalPrompt = ConditionEngine.applyKSD(finalPrompt, 'vectorize', preset.name);
    } catch (e) {
      console.warn("KSD enforcement failed.", e);
    }

    return finalPrompt;
  },

  constructNegativePrompt: (context: GenerationContext) => {
    const { preset } = context;
    const vectorNegatives = "photorealistic camera capture, photo noise, photographic grain, lens blur, depth of field, messy organic texture, distorted anatomy, extra limbs, missing components, altered subject identity, pixelation, low-quality compression artifacts";
    const presetNegative = preset.negativePrompt ? `${preset.negativePrompt}, ` : '';
    return `${presetNegative}${vectorNegatives}, ${GLOBAL_NEGATIVE_PROMPT}`.trim();
  },

  shouldSkipTurbo: () => false
};
