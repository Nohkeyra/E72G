import { PresetCategory, Preset } from "../../types/presets";
import { logoPresets } from "./legacy_presets";
import { LOGO_TYPE_PRESETS, LOGO_LAYOUT_PRESETS } from "./options";
import { LOGO_PRESETS_V2 } from "./LOGO_PRESETS_V2";

export const LOGO_PRESETS: PresetCategory[] = [
  {
    category: "Master VORTEX-PRO V2",
    presets: Object.entries(LOGO_PRESETS_V2).map(([name, p]) => ({
      name,
      basePrompt: p.Positive_Prompt,
      negativePrompt: p.Negative_Prompt,
      aspectRatio: "1:1",
      type: "logo design",
      v2SynthesisActive: true,
      taxonomyFamily: 'vortex_v2_master'
    })) as Preset[]
  },
  {
    category: "Elite 72 Systems",
    presets: logoPresets.map((p) => ({
      name: p.presetName,
      basePrompt: `Style: ${p.presetName}. Font Hint: ${p.fontHint}. Fill: ${p.fillType}. Depth: ${p.extrusionDepth}. Outline: ${p.strokeOutline}. Layout: ${p.overlapLayout}. Composition: ${p.logoComposition || ''}. Background: ${p.backgroundHex}. Notes: ${p.promptingNotes}`,
      aspectRatio: "1:1",
      type: "logo design",
      colorPalette: p.colorPalette,
      backgroundHex: p.backgroundHex,
      presetDetails: p,
      taxonomyFamily: 'vortex_v2_synthesis',
      v2SynthesisActive: true
    })) as Preset[],
  },
  {
    category: "Logo Anatomy & Types",
    presets: LOGO_TYPE_PRESETS.map(p => ({
      name: p.name,
      basePrompt: p.prompt,
      negativePrompt: p.negativePrompt,
      aspectRatio: "1:1",
      type: "logo design",
      accessibilityNote: p.accessibilityNote,
      system: true,
      locked: true
    })) as Preset[]
  },
  {
    category: "Logo Layouts",
    presets: LOGO_LAYOUT_PRESETS.map(p => ({
      name: p.name,
      basePrompt: p.prompt,
      negativePrompt: p.negativePrompt,
      aspectRatio: "1:1",
      type: "logo design",
      accessibilityNote: p.accessibilityNote,
      system: true,
      locked: true
    })) as Preset[]
  }
];
