import { logoPresets, LogoPreset } from './legacy_presets';
import { LOGO_PRESETS_V2 } from './LOGO_PRESETS_V2';
import { LOGO_TYPE_PRESETS, LOGO_LAYOUT_PRESETS } from './options';

export type ExtendedLogoPreset = 
  | LogoPreset 
  | { name: string; Positive_Prompt: string; Negative_Prompt: string }
  | { name: string; prompt: string; negativePrompt?: string };

export function getPreset(idOrName: string): ExtendedLogoPreset | undefined {
  // 1. Check legacy presets
  const legacy = logoPresets.find(p => p.id === idOrName || p.presetName === idOrName);
  if (legacy) return legacy;

  // 2. Check V2 presets
  if (LOGO_PRESETS_V2[idOrName]) {
    return { name: idOrName, ...LOGO_PRESETS_V2[idOrName] };
  }

  // 3. Check Logo Types
  const logoType = LOGO_TYPE_PRESETS.find(p => p.name === idOrName);
  if (logoType) return logoType;

  // 4. Check Logo Layouts
  const logoLayout = LOGO_LAYOUT_PRESETS.find(p => p.name === idOrName);
  if (logoLayout) return logoLayout;

  return undefined;
}

export function compile(presetName: string, userText: string, options: { palette?: string[], isSynthesis?: boolean, renderMode?: "execution" | "identity" | null, intensity?: number } = {}): string {
  const preset = getPreset(presetName);
  const isIdentity = options.renderMode === 'identity';
  const intensity = options.intensity || 1.0;

  const identityStyleInjection = `\n[STYLE: FLAT_VECTOR_IDENTITY] Flat vector style illustration, sharp clean edges, solid blocks of color, minimalist graphic design, 2D vector path layout, zero photographic textures, no 3D gradients, isolated on a clean solid background.`;
  const identityNegativeEnemies = `\n[NEGATIVE: complex backgrounds, textures, patterns, environmental scenes, 3D depth, shadows, noise, gradients, realistic rooms, photographic elements]`;

  if (!preset) {
    // If it's a user-defined preset not in our library, handle it gracefully
    const synthesisHint = options.isSynthesis ? "\nSYNTHESIS ACTIVE: Blend and merge the elements into a complex, high-density unified brand mark." : "";
    return `Create a professional logo design for the brand: "${userText}"
${isIdentity ? identityStyleInjection : ''}

STYLE & MOOD: ${presetName}.
([STYLE_REFERENCE: AUTHORITATIVE]:${intensity})
${synthesisHint}

CRITICAL RULES:
- The design MUST feature the exact brand name: "${userText}".
- The design must be a clean, high-quality final logo mark.
${isIdentity ? '- BACKGROUND_POLICY: No-Background, strictly isolated on solid white or transparent-ready master substrate.' : '- MUST be isolated on clean background.'}
- NO CONSTRUCTION LINES: Do not include grid marks, crosshairs, layout guides, framing lines, bounding boxes, or draft sketches.${isIdentity ? `\n\nNEGATIVE CONSTRAINTS: ${identityNegativeEnemies}` : ''}`.trim();
  }

  // Handle V2 / Options Preset
  let positiveBase: string;
  let negativeBase = '';
  let colors = '';
  let fontHint = '';
  let layout = '';
  let composition = '';
  let fillType = '';
  let background = '';
  let depth = '';
  let outline = '';
  let notes = '';

  if ('Positive_Prompt' in preset) {
    // V2 Preset
    positiveBase = preset.Positive_Prompt.replace('[BRAND_NAME]', userText).replace('[ICON]', 'relevant branding icon');
    negativeBase = preset.Negative_Prompt;
  } else if ('prompt' in preset) {
    // LogoType / LogoLayout Preset
    positiveBase = preset.prompt;
    negativeBase = preset.negativePrompt || '';
  } else {
    // Legacy LogoPreset
    const p = preset as LogoPreset;
    colors = options.palette && options.palette.length > 0 ? options.palette.join(', ') : p.colorPalette.join(', ');
    fontHint = p.fontHint;
    layout = p.overlapLayout;
    composition = p.logoComposition || 'Centered, balanced composition';
    fillType = p.fillType;
    background = p.backgroundHex;
    depth = p.extrusionDepth;
    outline = p.strokeOutline;
    notes = p.promptingNotes;
    
    positiveBase = `STYLE & MOOD: ${p.presetName}.\n${notes}`;
  }

  const synthesisHint = options.isSynthesis ? "\nSYNTHESIS ACTIVE: Blend and merge the elements into a complex, high-density unified brand mark." : "";

  if ('Positive_Prompt' in preset || 'prompt' in preset) {
     return `${isIdentity ? `[GRAPHIC_IDENTITY_MASTER]${identityStyleInjection}\n` : ''}${positiveBase}
([STYLE_REFERENCE: AUTHORITATIVE]:${intensity})
${synthesisHint}

CRITICAL RULES:
- The design MUST feature the exact brand name: "${userText}".
- The design must be a clean, high-quality final logo mark.
${isIdentity ? '- BACKGROUND_POLICY: No-Background, strictly isolated on solid white or transparent-ready master substrate.' : '- MUST be isolated on clean background.'}
- NO CONSTRUCTION LINES: Do not include grid marks, crosshairs, layout guides, framing lines, bounding boxes, or draft sketches.${(negativeBase || isIdentity) ? `\n\nNEGATIVE CONSTRAINTS: ${negativeBase}${isIdentity ? `, ${identityNegativeEnemies}` : ''}` : ''}`.trim();
  }

  return `Create a professional logo design for the brand: "${userText}"
${isIdentity ? `[GRAPHIC_IDENTITY_MASTER]${identityStyleInjection}` : ''}

STYLE & MOOD: ${presetName}.
([STYLE_REFERENCE: AUTHORITATIVE]:${intensity})
${notes}
${synthesisHint}

FONT & COMPOSITION:
${fontHint}
Layout: ${layout}
Composition: ${composition}

RENDERING & EFFECTS:
Fill & Texture: ${isIdentity ? 'Solid Vector / Flat Graphic' : fillType}
Colors: ${colors} on ${isIdentity ? 'Solid White/Transparent Background' : `a background of ${background}`}
Depth/3D: ${isIdentity ? 'NONE (PERFECTLY FLAT 2D)' : depth}
Outline: ${outline}

CRITICAL RULES:
- The design MUST feature the exact brand name: "${userText}".
- The design must be a clean, high-quality final logo mark.
- Strictly adhere to the requested font hint, illustration style, and composition.
- MUST use the exact colors specified above.
- ${isIdentity ? 'BACKGROUND_POLICY: No-Background, strictly isolated on solid white or transparent-ready master substrate.' : 'MUST be isolated on clean background.'}
- NO CONSTRUCTION LINES: Do not include grid marks, crosshairs, layout guides, framing lines, bounding boxes, or draft sketches. The background must be clean.
- Ensure strong figure-ground contrast and bold silhouette, suitable for scalable branding.${isIdentity ? `\n\nNEGATIVE CONSTRAINTS: ${identityNegativeEnemies}` : ''}`.trim();
}
