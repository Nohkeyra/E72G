// src/modules/typography/TypographyPromptCompiler.ts

import { PRESETS as elitePresets, ElitePreset } from './presets';

/**
 * Utility to fetch the correct preset logic by ID or Display Name.
 */
export function getPreset(idOrName: string): ElitePreset | undefined {
  return elitePresets.find(p => p.presetId === idOrName || p.displayName === idOrName);
}

/**
 * Sanitizes user text and handles length checks while preserving weighting syntax.
 */
function sanitizeText(text: string): string {
  // Escape double quotes to prevent breaking [TARGET_TEXT: "text"] blocks
  const escaped = text.replace(/"/g, '\\"').trim();
  
  // For length check, we look at the "cleaned" version (without weighting syntax)
  const cleaned = escaped.replace(/\(([^:)]+)(?::([\d.]+))?\)/g, '$1');
  
  // Guard against extreme length (AI models usually fail above ~50 chars for typography)
  // We allow up to 80 chars for the raw string if the cleaned version is under 60
  if (cleaned.length > 60) {
    return cleaned.substring(0, 57) + "...";
  }
  
  // If raw is too long (e.g. lots of weights), we might need to truncate slightly but keep it balanced
  if (escaped.length > 150) {
    return escaped.substring(0, 147) + "...";
  }

  return escaped;
}

/**
 * The Core Synthesis Engine. 
 * Converts UI-driven JSON data into High-Fidelity Rendering Instructions.
 */
export function compile(presetName: string, userText: string, options: { palette?: string[], isSynthesis?: boolean, renderMode?: "execution" | "identity" | null, intensity?: number } = {}): string {
  const sanitizedText = sanitizeText(userText);
  const preset = getPreset(presetName);
  const effectiveRenderMode = options.renderMode || preset?.renderMode || 'execution';
  const intensity = options.intensity || 1.0;
  
  const isIdentity = effectiveRenderMode === 'identity';

  // [PRECISION MODULE] MANDATORY PERSPECTIVE LOCK (Global Injection)
  // [REF protocol v2.2-neutral]: Inject Bounding Box for high-viscosity styles, dynamic tilt for organic/fluid.
  const isOrganic = preset?.presetId?.toLowerCase().includes('organic') || preset?.displayName?.toLowerCase().includes('organic');
  const dynamicTilt = isOrganic ? `\n[GEOMETRY: DYNAMIC_TILT] 5-10 degree tilt for visual flow.` : `\n[GEOMETRY: FORCE_ZERO_AXIS] 0-degree axis, strictly front-facing, orthographic camera, non-slanted.`;
  const typographyArchitecture = `\n[TYPOGRAPHY: ARCHITECTURAL_LAYOUT] Treat each character as an isolated 3D object to prevent unwanted merging. Ensure professional smooth kerning. For multi-word text, apply extreme tight leading and stack the words vertically. Use professional interlocking of the letters to create a cohesive typographic lockup.`;
  
  const perspectiveLock = `\n${dynamicTilt}${typographyArchitecture}`;
  const perspectiveNegative = `\n[NEGATIVE: isometric, 3/4 view, tilted, slanted, perspective distortion, side-angle, 3D extrusion toward corner]`;
  
  const identityStyleInjection = `\n[STYLE: GRAPHIC_IDENTITY] Refined graphic execution, solid background, razor-sharp silhouettes.`;
  const identityNegativeEnemies = `\n[NEGATIVE: complex environments, realistic rooms, photographic scenes, noise, artifacts, blurry focus]`;

  // 1. THE MANDATE (The most important change)
  // We move the text to the very top and wrap it in a "Mandate" block
  const subjectMandate = `[CRITICAL_CONTENT_MANDATE: "${sanitizedText}"]\n[PRIMARY_TASK: Render the exact characters/text provided in the mandate above with 100% spelling accuracy.]\n`;

  // 2. THE HEADER
  const header = `[DIRECTIVE: ${isIdentity ? 'GRAPHIC_IDENTITY_SYNTHESIS' : '3D_DISPLAY_TYPOGRAPHY_SYNTHESIS'}]\n${subjectMandate}[STYLE_REFERENCE: ${presetName}]
([STYLE_REFERENCE: AUTHORITATIVE]:${intensity})
${perspectiveLock}${isIdentity ? identityStyleInjection : ''}`;

  if (!preset) {
    // OLD 24 LOGIC PURGED: No fallback to legacy vectorPresets.
    return `${header}
[STYLE_FALLBACK: NEO_BRUTALIST_BASE]
[RENDER: Render "${sanitizedText}" as extra-bold geometric sans-serif text. Balanced commercial shot.]`;
  }

  // Use user-selected palette or fall back to preset defaults
  const finalColors = options.palette?.length ? options.palette.join(', ') : preset.colorPalette.join(', ');
  
  // Append preset-specific negative constraints if they exist
  const negativePromptSection = (preset.negativePrompt 
    ? `\n\n[NEGATIVE_PROMPT_ADDENDUM]: ${preset.negativePrompt}`
    : "") + perspectiveNegative + (isIdentity ? identityNegativeEnemies : "");

  // 1.1 SPECIAL OVERRIDES: Patch for PREMIUM_VORTEX_GLASS_v1 (PX_01)
  const isPremiumVortex = preset.presetId === "PX_01" || preset.displayName === "PREMIUM_VORTEX_GLASS_v1";
  if (isPremiumVortex) {
    // Force-Zero-Axis Block
    const negativePromptOverride = `\n\n[STRICT_NEGATIVE_PROMPTING]: [NEGATIVE: isometric, 3/4 view, slanted, perspective, perspective lines, tilted, side-view, blocky geometry, sharp edges, 3D extruded depth towards camera]`;
    const geometryAnchor = `\n\n[GEOMETRY_ANCHOR]: [GEOMETRY: 2D Orthographic Projection, flat frontal plane, 0.0 degree camera rotation, zero-perspective distortion.]`;
    const materialCorrection = `\n\n[MATERIAL_CORRECTION]: [EXECUTION: Maintain bulbous bubble-glass inflation. Avoid flat-front 3D faces.]`;
    
    if (effectiveRenderMode === 'execution' || !effectiveRenderMode) {
       if (preset.execution) {
         return preset.execution.replace(/\{userText\}/g, sanitizedText) + geometryAnchor + materialCorrection + negativePromptOverride;
       }
    }
  }

  // LOGIC SPLIT: Identity (2D Illustration) vs Execution (3D Physics)
  if (effectiveRenderMode === 'identity' && preset.identity) {
    const parts = preset.identity.split('\n');
    if (parts.length >= 3) {
      // Strip the first sentence (e.g., "Preset Name style.")
      const descPart = parts[2];
      const dotIndex = descPart.indexOf('.');
      if (dotIndex !== -1) {
        parts[2] = descPart.substring(dotIndex + 1).trim();
      }
    }
    return parts.join('\n').replace(/\{userText\}/g, sanitizedText) + negativePromptSection;
  }
  if (effectiveRenderMode === 'execution' && preset.execution) {
    return preset.execution.replace(/\{userText\}/g, sanitizedText) + negativePromptSection;
  }

  // Fallback to dynamic generation if hard-coded strings aren't present
  if (effectiveRenderMode === 'identity') {
    return `[GRAPHIC_IDENTITY_MASTER]
[TARGET_TEXT: "${sanitizedText}"]
[PRECISION: 100% LITERAL SPELLING - NO DEVIATION]
${identityStyleInjection}

<VISUAL_MANDATE>
- AESTHETIC: High-fidelity graphic identity, clean vector-inspired finish, master logo quality.
- TYPOGRAPHY_LOGIC: Interlocking letterforms, professional spacing, defined terminals.
- SHADING: Subtle gradients and micro-textures allowed for depth.
- BACKGROUND_POLICY: strictly isolated on solid background.
</VISUAL_MANDATE>

<GEOMETRY_LOCK>
- TYPEFACE_SKELETON: ${preset.fontHint}
- COMPOSITION: ${preset.overlapMode}
- EXTRUSION: Minimal (Graphic Depth)
- BEVEL: Subtle
</GEOMETRY_LOCK>

<MATERIAL_SCIENCE>
- SURFACE_FINISH: Matte Graphic Finish
- COLOR_DNA: ${finalColors} on ${preset.backgroundHex}
</MATERIAL_SCIENCE>

[NEGATIVE_PROMPT_EMBED]: complex environments, realistic photorealism, environmental reflections, motion blur, messy textures, noisy backgrounds.${negativePromptSection}

[EXECUTION_INSTRUCTION]:
Create a sharp, high-contrast graphic identity of the text "${sanitizedText}". 
Visual focus is on clean form and color fidelity.`.trim();
  }

  // DEFAULT OR EXECUTION MODE
  const extrusionValue = preset.extrusionPx / 100;
  const bevelInstruction = preset.bevelLogic === "sharp" 
    ? "- BEVEL: 0.05 Sharp Industrial Bevel"
    : preset.bevelLogic === "rounded" 
    ? "- BEVEL: 0.1 Rounded Polished Bevel"
    : "- BEVEL: 0.0 (Zero Bevel/Sharp 2D Edges)";
  
  const surfaceDistortion = preset.surfaceDistortion ? `- DISTORTION: ${preset.surfaceDistortion}` : "";

  return `[PHYSICAL_EXECUTION_MOCKUP]
${header}

<GEOMETRY_LOCK>
- TYPEFACE_SKELETON: ${preset.fontHint}
- COMPOSITION: ${preset.overlapMode}
- EXTRUSION_Z_DEPTH: ${extrusionValue} (Relative Units)
${bevelInstruction}
- LAYER_STACK: ${preset.extrusionLayers.join(' > ')}
</GEOMETRY_LOCK>

<MATERIAL_SCIENCE>
- SURFACE_FINISH: ${preset.fillType} (Liquid Glass/Acrylic Architecture)
${surfaceDistortion}
- REFRACTIVE_INDEX (IOR): ${preset.materialIOR || 1.45}
- SPECULAR_REFLECTANCE: ${preset.reflectance || 0.6}
- MICRO_ROUGHNESS: ${preset.surfaceRoughness || 0.2}
- COLOR_DNA: ${finalColors} on ${preset.backgroundHex}
</MATERIAL_SCIENCE>

<ENVIRONMENT_CONFIG>
- LIGHTING_ENGINE: ${preset.lightingStyle || 'High-Key Studio'} (Caustic lighting, studio environment reflections)
- SHADOW_MODE: Hard Ray-Traced Contact Shadows
- PERSPECTIVE: Low-Angle Cinematic Macro Photography Shot
</ENVIRONMENT_CONFIG>
${negativePromptSection}

[EXECUTION_INSTRUCTION]: 
Create a commercial-grade 3D product shot of the text "${sanitizedText}". 
Apply the material physics and geometry defined above. 
Zero-tolerance for construction lines, grids, or background noise.`.trim();
}
