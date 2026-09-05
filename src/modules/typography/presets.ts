import { PresetCategory, Preset as UI_Preset } from "../../types/presets";
import { referenceImageManifest } from "./referenceImageManifest";

export type OverlapMode =
  | "none" | "interlock" | "unified-block" | "drip" | "shape-mask" 
  | "icon-overlap" | "letter-replace" | "full-frame" | "snake-wrap" 
  | "stacked-shadow" | "stacked" | "touching" | "varied" | "interweave" 
  | "interlock-sides" | "overlap-letters" | "drip-overlap" | "merge-strokes" 
  | "overlap-illustration" | "tile" | "negative-cut" | "illustration-overlap" | "mask-illustration"
  | "layered-stack" | "fused-illustration";

export interface ElitePreset {
  presetId: string;
  displayName: string;
  category?: "Retro" | "Organic" | "Geometric" | "Street" | "Brutalist" | "Hybrid";
  textExample: string;
  fontHint: string;
  strokePx: number;
  outlinePx: number;
  extrusionPx: number; // NORMALIZED: 0 is flat, 100 is maximum depth.
  extrusionLayers: string[];
  overlapMode: OverlapMode | string;
  fillType: string;
  colorPalette: string[];
  backgroundHex: string;
  // --- IDEOGRAM 3.0 DIRECTOR DNA ---
  materialIOR?: number;      
  reflectance?: number;     
  surfaceRoughness?: number; 
  lightingStyle?: string;   
  surfaceDistortion?: string; 
  bevelLogic?: "sharp" | "rounded" | "none"; 
  renderMode?: "execution" | "identity"; // Preferred default mode
  identity: string; // GRAPHIC_IDENTITY_MASTER (Flat 2D)
  execution: string; // PHYSICAL_EXECUTION_MOCKUP (3D VORTEX)
  negativePrompt?: string; // Specific negative constraints (e.g., "no double-text")
  notes?: string;
}

// THE ELITE 72 SYNTHESIS ARRAY
export const PRESETS: ElitePreset[] = [
  // --- RETRO CATEGORY (30) ---
  {
    presetId: "RT_C01", displayName: "Beer Mug White Street", category: "Retro",
    textExample: "BREW", fontHint: "Hand-drawn Street Style",
    strokePx: 0, outlinePx: 0, extrusionPx: 0, extrusionLayers: ["Flat Color"],
    overlapMode: "none", fillType: "Solid Graphic", colorPalette: ["#FFFFFF", "#000000"], backgroundHex: "#000000",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nHand-drawn street stlye lettering, loose and expressive brush strokes, white ink on solid black. Street art sticker aesthetic. 2D flat vector graphic.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\n3D Rendered Vinyl Sticker. White hand-drawn lettering on matte black surface, realistic thick sticker edges with white border, studio lighting."
  },
  {
    presetId: "RT_C02", displayName: "Yellow Circular Wordmark", category: "Retro",
    textExample: "CIRCLE", fontHint: "Bold Geometric Sans",
    strokePx: 0, outlinePx: 0, extrusionPx: 0, extrusionLayers: ["Flat Color"],
    overlapMode: "none", fillType: "Solid Graphic", colorPalette: ["#FFFF00", "#000000"], backgroundHex: "#000000",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nBold geometric sans-serif typeface, clean uniform stroke weight. Yellow circular wordmark, retro modernist aesthetic. 2D flat vector.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\n3D Enamel Pin. Polished yellow enamel filling the bold sans-serif letters, raised black metal borders, glossy finish, studio lighting."
  },
  {
    presetId: "RT_C03", displayName: "Red Apple Badge", category: "Retro",
    textExample: "APPLE", fontHint: "Playful Rounded Block",
    strokePx: 1, outlinePx: 0, extrusionPx: 10, extrusionLayers: ["Badge Edge"],
    overlapMode: "none", fillType: "Solid Graphic", colorPalette: ["#FF0000", "#FFFFFF"], backgroundHex: "#FFFFFF",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nPlayful rounded block lettering, soft corners and friendly proportions. Red and white badge aesthetic. 2D flat vector sticker.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\n3D Silicon Badge. Soft-touch red silicon material, embossed white rounded block lettering, tactile surface, natural soft shadows."
  },
  {
    presetId: "RT_C04", displayName: "White Circle Wordmark", category: "Retro",
    textExample: "CORE", fontHint: "Clean Swiss Sans",
    strokePx: 0, outlinePx: 0, extrusionPx: 0, extrusionLayers: ["Negative Space"],
    overlapMode: "none", fillType: "Solid Graphic", colorPalette: ["#FFFFFF", "#000000"], backgroundHex: "#000000",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nClean Swiss-style sans-serif, high legibility, negative space letterforms cut from a white circular background. Minimalist retro. 2D flat vector.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\n3D Machined Metal. Precision circular cutouts of Swiss sans-serif letters in white polished aluminum, sharp internal edges, studio lighting."
  },
  {
    presetId: "RT_C05", displayName: "Another Zone Sneaker", category: "Retro",
    textExample: "ZONE", fontHint: "Dynamic Italic Display",
    strokePx: 0, outlinePx: 0, extrusionPx: 0, extrusionLayers: ["Illustration"],
    overlapMode: "illustration-overlap", fillType: "Solid Color", colorPalette: ["#FFFFFF", "#FF0000"], backgroundHex: "#111111",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nDynamic italic display typography, sharp terminals and forward-leaning posture. Retro athletic sneaker culture aesthetic. 2D vector art.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\n3D Embroidered Patch. Detailed stitching of dynamic italic letters, thread texture, white and red threads, athletic apparel vibe."
  },
  {
    presetId: "RT_C06", displayName: "Orange Lightning Nameplate", category: "Retro",
    textExample: "BOLT", fontHint: "Sharp Angular Display",
    strokePx: 0, outlinePx: 0, extrusionPx: 15, extrusionLayers: ["Power Glow"],
    overlapMode: "none", fillType: "Orange Gradient", colorPalette: ["#FF8C00", "#FFFFFF"], backgroundHex: "#000000",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nSharp angular display typeface with lightning bolt motifs integrated into stroke terminals. Orange-hot energy aesthetic. 2D flat vector.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\n3D Backlit Acrylic Nameplate. Sharp angular orange letters made of translucent acrylic, glowing internal light source, sharp edges."
  },
  {
    presetId: "RT_C07", displayName: "White Bubbly Street Word", category: "Retro",
    textExample: "BUBBLE", fontHint: "Soft Bubbly Hand-style",
    strokePx: 2, outlinePx: 0, extrusionPx: 0, extrusionLayers: ["Ink Outine"],
    overlapMode: "touching", fillType: "Solid Graphic", colorPalette: ["#FFFFFF", "#000000"], backgroundHex: "#0066FF",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nSoft bubbly hand-style lettering, rounded liquid forms, graffiti-influenced retro script. Clean white on blue aesthetic. 2D flat vector.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\n3D Puffy Sticker. White vinyl letters with air-filled volume, soft rounded specular highlights, smooth blue background."
  },
  {
    presetId: "RT_C08", displayName: "Skull Time To Die", category: "Retro",
    textExample: "DOOM", fontHint: "Raw Heavy Display",
    strokePx: 0, outlinePx: 0, extrusionPx: 0, extrusionLayers: ["Dark Illustration"],
    overlapMode: "overlap-illustration", fillType: "Solid Black", colorPalette: ["#000000", "#FFFFFF"], backgroundHex: "#FFFFFF",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nRaw heavy display typeface, distressed edges and brutal weights. Skull motifs, punk underground aesthetic. 2D flat vector.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\n3D Screen-Print on Paper. Thick black ink with heavy display lettering on rough white paper grain, visible ink bleed, studio lighting."
  },
  {
    presetId: "RT_C09", displayName: "Mouth Wordmark", category: "Retro",
    textExample: "MOUTH", fontHint: "Bold Pop Sans",
    strokePx: 0, outlinePx: 0, extrusionPx: 0, extrusionLayers: ["Pop Art"],
    overlapMode: "illustration-overlap", fillType: "Red Vinyl", colorPalette: ["#FF0000", "#FFFFFF", "#000000"], backgroundHex: "#FFFFFF",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nBold pop-style sans-serif, high-impact curves, mouth illustration background. Red and white vibrant aesthetic. 2D flat vector graphic.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\n3D Glossy Vinyl Decal. High-gloss bold red sans-serif letters, reflecting studio softbox light, vibrant pop-art color palette."
  },
  {
    presetId: "RT_C10", displayName: "Summer Circular Badge", category: "Retro",
    textExample: "SUMMER", fontHint: "Vintage Serif Badge",
    strokePx: 0, outlinePx: 0, extrusionPx: 0, extrusionLayers: ["Vintage Seal"],
    overlapMode: "none", fillType: "Sunset Gradient", colorPalette: ["#FFA500", "#FFD700"], backgroundHex: "#FFFFFF",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nVintage serif badge typography, high-contrast stems and sharp serifs. Warm sunset gradient, nostalgic retro seal. 2D flat vector.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\n3D Embossed Premium Seal. Vintage serif lettering pressed into thick watercolor paper, soft shadows, warm natural sunset lighting."
  },
  {
    presetId: "RT_C11", displayName: "Golden Sunrise Badge", category: "Retro",
    textExample: "RISE", fontHint: "Elegant Decorative Display",
    strokePx: 1, outlinePx: 0, extrusionPx: 5, extrusionLayers: ["Metallic Foil"],
    overlapMode: "none", fillType: "Golden Foil", colorPalette: ["#FFD700", "#DAA520"], backgroundHex: "#111111",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nElegant decorative display typeface, high contrast and intricate terminals. Golden sunrise motifs, premium retro badge. 2D flat vector.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\n3D Gold Leaf Lettering. Real-world gold foil texture on decorative display letters, micro-reflections, textured black background."
  },
  {
    presetId: "RT_C12", displayName: "Orange Stacked Vertical Type", category: "Retro",
    textExample: "TALL", fontHint: "Heavy Stacked Block",
    strokePx: 0, outlinePx: 0, extrusionPx: 20, extrusionLayers: ["Stacked Layer"],
    overlapMode: "stacked", fillType: "Orange Layered", colorPalette: ["#FF4500", "#FF8C00"], backgroundHex: "#FFFFFF",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nHeavy stacked block lettering, ultra-bold stroke weight, vertically oriented character arrangement. Layered orange aesthetic. 2D flat vector.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\n3D Hand-Painted Wooden Blocks. Heavy block letters stacked vertically, vibrant orange paint with matte finish, studio lighting."
  },
  {
    presetId: "RT_C13", displayName: "Blue Shark Fish Type", category: "Retro",
    textExample: "SHARK", fontHint: "Agile Dynamic Sans",
    strokePx: 0, outlinePx: 0, extrusionPx: 0, extrusionLayers: ["Aqua Illustration"],
    overlapMode: "illustration-overlap", fillType: "Cold Blue", colorPalette: ["#0000FF", "#00FFFF"], backgroundHex: "#FFFFFF",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nAgile dynamic sans-serif, aerodynamic stroke terminals, forward slant. Blue and white shark-inspired sleekness. 2D flat vector.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\n3D Sleek Enamel Finish. Dynamic sans letters with a deep ocean blue iridescent coating, high specular highlights, studio lighting."
  },
  {
    presetId: "RT_C14", displayName: "Flame Wordmark", category: "Retro",
    textExample: "FIRE", fontHint: "Burning Script Display",
    strokePx: 0, outlinePx: 0, extrusionPx: 0, extrusionLayers: ["Flame Pattern"],
    overlapMode: "none", fillType: "Fire Gradient", colorPalette: ["#FF0000", "#FFFF00"], backgroundHex: "#000000",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nBurning script display typography, fluid calligraphic strokes that transition into flame silhouettes. Red-hot street aesthetic. 2D flat vector.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\n3D Hot Rod Paint. Deep red metallic lettering with real fire and flame effects growing from the curves, glossy finish, dark studio set."
  },
  {
    presetId: "RT_C15", displayName: "Yellow Lightning Script", category: "Retro",
    textExample: "ZAP", fontHint: "Fast Electric Script",
    strokePx: 0, outlinePx: 0, extrusionPx: 0, extrusionLayers: ["Voltage"],
    overlapMode: "none", fillType: "Electric Yellow", colorPalette: ["#FFFF00", "#FFFFFF"], backgroundHex: "#000066",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nFast electric script lettering, jagged energy-filled terminals and lightning bolt connections. Yellow high-voltage aesthetic. 2D flat vector.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\n3D Neon Plasma Tube. Fast jagged script rendered as a glowing yellow plasma tube with internal electrical sparks, dark studio background."
  },
  {
    presetId: "RT_C16", displayName: "Red Distorted Banner", category: "Retro",
    textExample: "RUSH", fontHint: "Warped Heavy Sans",
    strokePx: 0, outlinePx: 0, extrusionPx: 0, extrusionLayers: ["Banner Warp"],
    overlapMode: "shape-mask", fillType: "Solid Red", colorPalette: ["#FF0000", "#FFFFFF"], backgroundHex: "#111111",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nWarped heavy sans-serif, liquid distortion applied to a massive block typeface. Red banner aesthetic, high energy. 2D flat vector.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\n3D Liquid Metal Banner. Massive red chrome letters with heavy surface distortion, reflecting a red studio light, high-gloss surface."
  },
  {
    presetId: "RT_C17", displayName: "Yellow Hand Surf Mark", category: "Retro",
    textExample: "WAVE", fontHint: "Surf Culture Script",
    strokePx: 0, outlinePx: 0, extrusionPx: 0, extrusionLayers: ["Hand Motif"],
    overlapMode: "illustration-overlap", fillType: "Yellow Ink", colorPalette: ["#FBC02D", "#000000"], backgroundHex: "#FFFFFF",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nSurf culture script, hand-penned with casual loose strokes, yellow sun-drenched aesthetic. Coastal retro lifestyle. 2D flat vector.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\n3D Sand Carved Type. Casual surf script deeply carved into wet coastal sand, macro focus on grain and water moisture, morning side-lighting."
  },
  {
    presetId: "RT_03", displayName: "Elite Vortex Glass", category: "Retro",
    textExample: "ELITE", fontHint: "Heavy Geometric Block Sans",
    strokePx: 0, outlinePx: 0, extrusionPx: 80, extrusionLayers: ["Rainbow Glass Stack"],
    overlapMode: "none", fillType: "Borosilicate Glass", colorPalette: ["#FF6D00", "#FFD700", "#1A237E"], backgroundHex: "#0D1117",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\n2D Flat vector representation of rainbow glass stacking. High contrast, sharp edges. No depth.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\n3D extruded rainbow glass. Sequential colored glass layers stacked horizontally. High refraction, crystal clear material, studio lighting."
  },
  {
    presetId: "RT_04", displayName: "Groovy Script Flow", category: "Retro",
    textExample: "VIBES", fontHint: "Bell Bottom Script",
    strokePx: 0, outlinePx: 0, extrusionPx: 0, extrusionLayers: ["Ink"],
    overlapMode: "interweave", fillType: "Satin Finish", colorPalette: ["#4CAF50", "#795548", "#F5F5DC"], backgroundHex: "#FFFFFF",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nPsychadelic 60s Script. Liquid flow, organic curves, interweaving letters. Earth tone color palette. Flat ink look.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\nEmbossed Leather Book Cover. The script is toolled into a rich brown leather surface. Subtle macro grain and lighting."
  },
  {
    presetId: "RT_05", displayName: "Checkerboard Pop", category: "Retro",
    textExample: "SKATE", fontHint: "Heavy Block Gothic",
    strokePx: 1, outlinePx: 0, extrusionPx: 0, extrusionLayers: ["Pattern Fill"],
    overlapMode: "none", fillType: "Checkerboard Grid", colorPalette: ["#FFC107", "#FF5722", "#D84315"], backgroundHex: "#F5F5F5",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\n80s Ska Aesthetic. Bold block text with internal black and white checkerboard pattern. 2D vector graphic.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\nEnamel Pin Badge. Metal borders around checkerboard enamel fill. Macro shot with professional studio rim light."
  },
  {
    presetId: "RT_06", displayName: "Sunset Wave", category: "Retro",
    textExample: "RIDE", fontHint: "Italic Speed Sans",
    strokePx: 0, outlinePx: 0, extrusionPx: 0, extrusionLayers: ["Gradient"],
    overlapMode: "none", fillType: "Horizontal Stripe Gradient", colorPalette: ["#FF5722", "#FFFFFF", "#D32F2F"], backgroundHex: "#080321",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nSynthwave Speed lines. Letters sliced by thin horizontal sunset-colored gradients. Hyper-flat vector.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\nBacklit Neon Sign. Horizontal laser-etched lines in glowing acrylic. Moody night environment with fog."
  },
  {
    presetId: "RT_07", displayName: "Arcade Glow", category: "Retro",
    textExample: "PLAY", fontHint: "Pixel Block Mono",
    strokePx: 2, outlinePx: 0, extrusionPx: 10, extrusionLayers: ["Phosphor Glow"],
    overlapMode: "none", fillType: "Digital Scanline", colorPalette: ["#FFEB3B", "#8BC34A", "#1A237E"], backgroundHex: "#0D0208",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\n8-Bit Computer Graphics. Pixel-perfect rendering with simulation of CRT scanlines. Cyber-blue monochrome. Flat.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\nVintage Arcade Monitor. Close-up macro of CRT phosphor subpixels. Authentic blue digital glow and screen glass curves."
  },
  {
    presetId: "RT_08", displayName: "Pulp Fiction Ink", category: "Retro",
    textExample: "STORY", fontHint: "Condensed Slab Serif",
    strokePx: 0, outlinePx: 0, extrusionPx: 0, extrusionLayers: ["Distressed Ink"],
    overlapMode: "stacked-shadow", fillType: "Worn Paper Texture", colorPalette: ["#FFFFFF", "#FFEB3B", "#D32F2F"], backgroundHex: "#FFFFF0",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nVintage paperback book aesthetic. Rough edges, misaligned ink, cream background. Flat vector graphic.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\nMacro Paper Texture. Ink sinking into yellowed book fibers. Tactile print quality under warm incandescent light."
  },
  {
    presetId: "RT_09", displayName: "Chrome Bumper", category: "Retro",
    textExample: "CRUISER", fontHint: "Script Deco",
    strokePx: 1, outlinePx: 0, extrusionPx: 40, extrusionLayers: ["Polished Chrome"],
    overlapMode: "interlock", fillType: "Sky-Blue Metal Reflection", colorPalette: ["#000000", "#FF5722", "#00BCD4"], backgroundHex: "#000000",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\n50s Car Emblem Illustration. Airbrushed chrome gradient, sharp vector highlights. 2D digital painting.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\nDie-Cast Chrome Emblem. Real-world metal physics, high IOR, reflecting a blue desert sky. Macro shallow depth of field."
  },
  {
    presetId: "RT_10", displayName: "Neon Pink Sign", category: "Retro",
    textExample: "OPEN", fontHint: "Geometric Circular Sans",
    strokePx: 0, outlinePx: 0, extrusionPx: 0, extrusionLayers: ["Neon Pulse"],
    overlapMode: "none", fillType: "Glowing Gas Tube", colorPalette: ["#FF5252", "#FFC107", "#3E2723"], backgroundHex: "#000000",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nRetro Neon Signage. Hot pink glowing gas tubes forming a circular composition. High contrast on black. 2D vector neon.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\nReal flickering neon tube. Macro of glass electrodes with intense pink-magenta light emission. Reflecting on dark brick and wet pavement."
  },
  {
    presetId: "RT_11", displayName: "VHS Glitch", category: "Retro",
    textExample: "TAPE", fontHint: "Heavy Italic Impact",
    strokePx: 0, outlinePx: 0, extrusionPx: 0, extrusionLayers: ["Signal Noise"],
    overlapMode: "varied", fillType: "Smeared Color Bars", colorPalette: ["#FFEB3B", "#9C27B0", "#E91E63"], backgroundHex: "#000000",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\n90s Home Video Glitch. Color-fringing, chromatic aberration, horizontal signal smear. Flat digital art.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\nFaulty Analog Television. Macro shot of RGB glowing pixels on a CRT screen during a signal drop. Kinetic energy."
  },
  {
    presetId: "RT_12", displayName: "Soft Airbrush Gradient", category: "Retro",
    textExample: "SOFT", fontHint: "Soft Bubbly Display — smooth airbrushed color transitions",
    strokePx: 0, outlinePx: 0, extrusionPx: 5, extrusionLayers: ["Soft Shade"],
    overlapMode: "none", fillType: "Airbrush Gradient", colorPalette: ["#FFFFFF", "#000000"], backgroundHex: "#000000",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nSoft airbrushed typography. Smooth gradients from amber to deep orange. Bubbly 70s display. Flat 2D airbrush art.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\n3D soft-touch plastic letters. Airbrushed gradient finish, subtle matte sheen, studio lighting with soft shadows."
  },
  {
    presetId: "RT_13", displayName: "Disco Ball Flash", category: "Retro",
    textExample: "DISCO", fontHint: "Flashy 70s Display Serif",
    strokePx: 1, outlinePx: 0, extrusionPx: 15, extrusionLayers: ["Mirror Tiles"],
    overlapMode: "none", fillType: "Mirror Tile Shading", colorPalette: ["#FF9800", "#00BCD4", "#1A237E"], backgroundHex: "#111111",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nDisco ball aesthetic. Letters filled with silver mirror tiles. High contrast sparkles. 2D flat vector disco style.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\n3D letters covered in real mirror glass tiles. Reflecting multi-colored disco lights, intense specular highlights, dark environment."
  },
  {
    presetId: "RT_14", displayName: "Lava Lamp Glow", category: "Retro",
    textExample: "GLOW", fontHint: "Organic Liquid Script — letters filled with flowing orange and yellow energy",
    strokePx: 0, outlinePx: 0, extrusionPx: 20, extrusionLayers: ["Liquid Bubble"],
    overlapMode: "none", fillType: "Lava Lamp Fluid", colorPalette: ["#FFFFFF", "#000000", "#FF5722"], backgroundHex: "#000000",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nRetro lava lamp script. Flowing orange and yellow liquid shapes inside organic letters. 2D flat graphic.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\n3D glowing glass letters. Filled with internal orange and yellow liquid blobs, realistic light emission, dark studio background."
  },
  {
    presetId: "RT_15", displayName: "Golden Glitter Shine", category: "Retro",
    textExample: "SHINE", fontHint: "Flashy Decorative Serif",
    strokePx: 2, outlinePx: 0, extrusionPx: 10, extrusionLayers: ["Gold Glitter"],
    overlapMode: "none", fillType: "Sparkling Gold Foil", colorPalette: ["#FFFFFF", "#4CAF50", "#FFEB3B", "#F44336"], backgroundHex: "#0D1117",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nGolden glitter typography. Flat vector sparkles on a gold gradient base. High-end decorative retro style.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\nReal gold glitter letters. Macro shot of metallic flakes reflecting studio light, premium tactile texture, dark background."
  },
  // --- ORGANIC CATEGORY (14) ---
  {
    presetId: "OR_01", displayName: "Flame Silhouette", category: "Organic",
    textExample: "FLAME", fontHint: "Curved Flame Calligram",
    strokePx: 0, outlinePx: 0, extrusionPx: 0, extrusionLayers: ["Fire"],
    overlapMode: "shape-mask", fillType: "Fire Gradient", colorPalette: ["#FF9800", "#E91E63", "#1A237E"], backgroundHex: "#121212",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nFlame silhouette calligram. Text curves and warps to form the shape of a single fire flame. High contrast orange and yellow on black background. 2D vector graphic.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\n3D rendered flame logo. Glassy fire material with internal glow. Smooth polished surface with caustic light reflections on a dark reflective floor."
  },
  {
    presetId: "OR_02", displayName: "Pink Slime Drip", category: "Organic",
    textExample: "SLIME", fontHint: "Melting Liquid Sans",
    strokePx: 0, outlinePx: 0, extrusionPx: 50, extrusionLayers: ["Gooey Matrix"],
    overlapMode: "merge-strokes", fillType: "Viscous Pink Liquid", colorPalette: ["#00E5FF", "#FF4081"], backgroundHex: "#FCE4EC",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nOrganic Slime Typography. Hyper-flat vector drips and pooling at the base. High contrast pink and black. 2D liquid logic.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\n3D Rendered Pink Slime. Translucent gooey material with specular highlights. Studio lighting on a reflective surface."
  },
  {
    presetId: "OR_03", displayName: "Ice Crystal", category: "Organic",
    textExample: "FROST", fontHint: "Jagged Crystal Serif",
    strokePx: 1, outlinePx: 0, extrusionPx: 15, extrusionLayers: ["Frozen Facet"],
    overlapMode: "none", fillType: "Translucent Ice Texture", colorPalette: ["#00E5FF", "#E040FB", "#FFEB3B", "#000000"], backgroundHex: "#01579B",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nWinter Branding. Sharp, jagged letterforms that look like they've been carved from solid ice. Blue and white. 2D vector graphic with facet simulation.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\nMacro Ice Sculpture. Detailed frost crystals on the surface of translucent ice letters. Cold blue lighting, realistic refractions, and subsurface scattering."
  },
  {
    presetId: "OR_04", displayName: "Lava Flow", category: "Organic",
    textExample: "MAGMA", fontHint: "Heavy Molten Sans",
    strokePx: 0, outlinePx: 0, extrusionPx: 40, extrusionLayers: ["Molten Core", "Cracked Crust"],
    overlapMode: "none", fillType: "Glowing Magma Pattern", colorPalette: ["#FF3D00", "#FFD600", "#1A1A1A"], backgroundHex: "#000000",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nVolcanic Aesthetic. Heavy, thick-set sans-serif letters with a cracked black stone surface revealing glowing orange-red magma flows. 2D flat vector.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\nMolten Lava Text. 3D heavy stone letters with glowing liquid magma oozing between physical cracks. Intense orange light refractions, heat haze, and dark volcanic environment."
  },
  {
    presetId: "OR_05", displayName: "Watermelon Slice", category: "Organic",
    textExample: "FRESH", fontHint: "Round Bubbly Soft Sans",
    strokePx: 2, outlinePx: 0, extrusionPx: 5, extrusionLayers: ["Fruit Rind"],
    overlapMode: "none", fillType: "Red Fruit Grain", colorPalette: ["#F44336", "#4CAF50", "#FFFFFF"], backgroundHex: "#FFFFFF",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nSummer Flat Illustration. Letters that look like slices of watermelon — red flesh, black seeds, green rind edge. Minimalist 2D playful graphic.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\nMacro Fruit Photography. Letters carved from real watermelon. Crisp detail of seeds and rind. Overhead studio lighting, condensation droplets, fresh look."
  },
  {
    presetId: "OR_06", displayName: "Slime Green", category: "Organic",
    textExample: "TOXIC", fontHint: "Warped Liquid Script",
    strokePx: 0, outlinePx: 0, extrusionPx: 20, extrusionLayers: ["Neon Goo"],
    overlapMode: "interweave", fillType: "Radioactive Slime", colorPalette: ["#76FF03", "#CCFF90", "#000000"], backgroundHex: "#000000",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nBiohazard Graphic. Liquid, glowing neon green script lettering with distorted, melted stroke weights. High contrast on black. 2D vector goo aesthetic.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\nGlowing UV Slime. 3D viscous neon green liquid forming warped script letters under blacklight. Intense fluorescence, oily surface refractions, dark studio environment."
  },
  {
    presetId: "OR_07", displayName: "Cloud Puff", category: "Organic",
    textExample: "SOFT", fontHint: "Billowing Cloud Sans",
    strokePx: 0, outlinePx: 0, extrusionPx: 60, extrusionLayers: ["Vapor"],
    overlapMode: "interweave", fillType: "Wispy Smoke Texture", colorPalette: ["#FFFFFF", "#E3F2FD", "#03A9F4"], backgroundHex: "#03A9F4",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nSky Typography. Puffy, billowing cloud-shaped sans-serif letters, soft rounded forms. Light blue on white. 2D flat vector iconography.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\nVolumetric Cloud Sculpt. Soft-body letters made of real vapor/cloud material. Real-world atmospheric scattering, soft light penetration, wispy edges. Dreamy blue sky environment."
  },
  {
    presetId: "OR_08", displayName: "Liquid Mercury", category: "Organic",
    textExample: "FLOW", fontHint: "Ultra-Fluid Metal Script",
    strokePx: 0, outlinePx: 0, extrusionPx: 10, extrusionLayers: ["Mirror Metal"],
    overlapMode: "interweave", fillType: "Chrome Mercury Liquid", colorPalette: ["#FFFFFF", "#B0BEC5", "#37474F"], backgroundHex: "#000000",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nSci-Fi Organic. Highly reflective liquid metal letters with fluid, non-uniform script strokes that pool at the bottom. Pure chrome mirror effect on black. 2D flat vector.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\nMercury Sculpture. Macro shot of liquid mercury forming fluid script letters. Flawless mirror reflections of the studio, high surface tension, sharp specular highlights."
  },
  {
    presetId: "OR_09", displayName: "Moss Green", category: "Organic",
    textExample: "MOSS", fontHint: "Rough Natural Sans",
    strokePx: 0, outlinePx: 0, extrusionPx: 15, extrusionLayers: ["Fuzz"],
    overlapMode: "none", fillType: "Organic Moss Texture", colorPalette: ["#64DD17", "#9C27B0", "#1A1A1A"], backgroundHex: "#1B5E20",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nForest Branding. Thick letters with heavy organic moss and lichen texture simulation. Muted greens. Flat illustration of miniature forest floor.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\nMacro Moss Growth. Real 3D velvet moss covering stone letterforms. Close-up of individual spores and damp green textures. Soft forest lighting."
  },
  {
    presetId: "OR_10", displayName: "Honey Amber", category: "Organic",
    textExample: "GOLD", fontHint: "Slow Liquid Script",
    strokePx: 0, outlinePx: 0, extrusionPx: 30, extrusionLayers: ["Golden Syrup"],
    overlapMode: "none", fillType: "Translucent Honey Gradient", colorPalette: ["#000000", "#FFEB3B"], backgroundHex: "#FFFFFF",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nSweet Organic aesthetic. Viscous golden honey forming slow-flowing letters. Flat vector translucent amber tones.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\nMacro Honey Drip. Real honey letters with golden internal refractions and light caustic patterns. Sticky, glossy, and warm studio lighting."
  },
  {
    presetId: "OR_11", displayName: "Jelly Translucent", category: "Organic",
    textExample: "WIGGLE", fontHint: "Bubbly Gelatinous Sans",
    strokePx: 0, outlinePx: 0, extrusionPx: 25, extrusionLayers: ["Inner Gel"],
    overlapMode: "none", fillType: "Translucent Jelly Shading", colorPalette: ["#FFEB3B", "#FFF9C4", "#FBC02D"], backgroundHex: "#FFFFFF",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nPlayful Food Typography. Translucent yellow jelly letters with rounded, bubbly sans-serif forms and internal specular highlights. Clean 2D flat vector.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\nWiggling Jelly. 3D translucent yellow gelatin letters in bubbly sans-serif shapes. Soft subsurface scattering, caustic light patterns, studio macro photography."
  },
  {
    presetId: "OR_12", displayName: "Neural Web", category: "Organic",
    textExample: "BRAIN", fontHint: "Web-Like Fine Script",
    strokePx: 1, outlinePx: 0, extrusionPx: 0, extrusionLayers: ["Synapse Trace"],
    overlapMode: "none", fillType: "Organic Network Fill", colorPalette: ["#E91E63", "#4CAF50", "#2196F3", "#FFEB3B"], backgroundHex: "#0D47A1",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nBio-Tech Hybrid. Letters formed by complex organic networks of fine white lines. Connective tissue aesthetic. Flat 2D vector on blue.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\nGlowing Neural Network. Microscopic view of bioluminescent white fibers forming the text in a deep blue biological fluid. Macro photography."
  },
  {
    presetId: "OR_13", displayName: "Soft Pillowy", category: "Organic",
    textExample: "PUFF", fontHint: "Inflated Pillow Sans",
    strokePx: 0, outlinePx: 0, extrusionPx: 50, extrusionLayers: ["Puffin Padding"],
    overlapMode: "touching", fillType: "Matte Pastel Fabric", colorPalette: ["#64DD17", "#E040FB"], backgroundHex: "#FCE4EC",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nTactile Branding. Soft, pillowy pink letters that look like inflated cushions. Minimalist pastel 2D graphic. Light pink on white.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\nPillow Sculpture. Soft pink fabric letters with realistic cloth wrinkles and seams. Studio lighting with gentle shadows, soft-touch material."
  },
  {
    presetId: "OR_14", displayName: "Meat Steak", category: "Organic",
    textExample: "RAW", fontHint: "Heavy Marbled Block",
    strokePx: 2, outlinePx: 0, extrusionPx: 35, extrusionLayers: ["Flesh", "Fat"],
    overlapMode: "unified-block", fillType: "Wagyu Marbling Pattern", colorPalette: ["#B71C1C", "#FFEBEE", "#EF5350"], backgroundHex: "#111111",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nButcher Shop Branding. Heavy marbled slab block lettering with flat vector meat fat patterns. High contrast red and white. Brutalist culinary aesthetic. 2D vector.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\nMacro Raw Steak Shot. Letters carved from raw beef. Realistic meat fibers, glossy fat marbling, studio food styling. Shallow depth of field."
  },
  // --- GEOMETRIC CATEGORY (13) ---
  {
    presetId: "GE_01", displayName: "Void Slab Monolith", category: "Geometric",
    textExample: "VOID", fontHint: "Ultra-Heavy Geometric Slab",
    strokePx: 0, outlinePx: 0, extrusionPx: 0, extrusionLayers: ["Negative Cut"],
    overlapMode: "negative-cut", fillType: "Solid Block with Hole", colorPalette: ["#FFFFFF", "#D32F2F"], backgroundHex: "#000000",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nNegative Space Typography. White text 'cut out' from a perfectly solid black rectangle. Pure vector binary logic. 2D master logo.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\nMachined Steel Slab. The text is laser-cut through a 10mm thick industrial steel plate. Light shining from behind the cuts. Ray-traced shadows.",
    negativePrompt: "double-text, blurred edges, glow bleeding, messy cuts, uneven spacing"
  },
  {
    presetId: "GE_02", displayName: "Circle Packed Logic", category: "Geometric",
    textExample: "ATOM", fontHint: "Abstract Circular Sans",
    strokePx: 0, outlinePx: 0, extrusionPx: 0, extrusionLayers: ["Point-Cloud"],
    overlapMode: "none", fillType: "Packed Circles Fill", colorPalette: ["#D32F2F", "#FFFFFF", "#B71C1C"], backgroundHex: "#212121",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nGenerative Geometry. Abstract circular sans-serif forms constructed entirely from varied size flat vector circles. Bold red and white. 2D Swiss modernism.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\nPrecision Ball Bearing Sculpture. Thousands of polished red and steel spheres arranged to form the text in a circular sans-serif arrangement. High-key studio lighting."
  },
  {
    presetId: "GE_03", displayName: "Monoline Architecture", category: "Geometric",
    textExample: "GRID", fontHint: "Thin Technical Mono",
    strokePx: 1, outlinePx: 0, extrusionPx: 0, extrusionLayers: ["Blueprint Line"],
    overlapMode: "none", fillType: "Pure Stroke", colorPalette: ["#00E5FF", "#B2EBF2", "#006064"], backgroundHex: "#1A1A1A",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nArchitectural Blueprint Style. Thin, constant-width cyan technical mono letters on dark grid. Drafting aesthetic. 2D vector CAD precision.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\nFine Wire Neon. Micro-thin glowing cyan filaments in high-tech sans mono shapes, suspended in a vacuum chamber. Macro photography."
  },
  {
    presetId: "GE_04", displayName: "Bauhaus Primary", category: "Geometric",
    textExample: "MODERN", fontHint: "Bauhaus Geometric Sans",
    strokePx: 0, outlinePx: 0, extrusionPx: 0, extrusionLayers: ["Primary Shapes"],
    overlapMode: "touching", fillType: "Solid Primary Colors", colorPalette: ["#000000", "#FFEB3B"], backgroundHex: "#FFFFFF",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nBauhaus School Aesthetic. Bold geometric forms using only circles, squares, and triangles. Red, blue, yellow colors. Perfectly flat 2D.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\nAcrylic Desktop Toy. Primary colored semi-translucent plastic blocks stacked to form letters. Studio lighting, soft depth of field."
  },
  {
    presetId: "GE_05", displayName: "Wireframe Logic", category: "Geometric",
    textExample: "MESH", fontHint: "Outline Sans",
    strokePx: 1, outlinePx: 0, extrusionPx: 30, extrusionLayers: ["Wireframe Structure"],
    overlapMode: "none", fillType: "Transparent Wireframe", colorPalette: ["#FFEB3B", "#FBC02D", "#FFF59D"], backgroundHex: "#212121",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nDigital Topology Illustration. Bright yellow vector outline sans letters showing the skeletal wireframe structure. Flat 2D representation of complex 3D data.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\nStructural Rebar Sculpture. Welded metal wires in outline sans-serif shapes, forming the skeleton of the text. Industrial workshop lighting."
  },
  {
    presetId: "GE_06", displayName: "Isometric Cube", category: "Geometric",
    textExample: "BUILD", fontHint: "Blocky Isometric Mono",
    strokePx: 0, outlinePx: 0, extrusionPx: 40, extrusionLayers: ["Cube Face A", "Cube Face B"],
    overlapMode: "tile", fillType: "3-Tone Matte Shading", colorPalette: ["#FF9800", "#F44336", "#FFEB3B", "#000000"], backgroundHex: "#F5F5F5",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nFixed Isometric Projection. Letters built from modular cubic blocks. Clean 3-tone flat shading to simulate 3D. Vector precision.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\nConcrete Architectural Model. Brutalist concrete blocks arranged in isometric perspective. Natural daylight, harsh shadows."
  },
  {
    presetId: "GE_07", displayName: "Golden Ratio Spiral", category: "Geometric",
    textExample: "DIVINE", fontHint: "Elegant Serif Layout",
    strokePx: 0.5, outlinePx: 0, extrusionPx: 0, extrusionLayers: ["Fibonacci Line"],
    overlapMode: "none", fillType: "Lowe-Opacity Lines", colorPalette: ["#D4AF37", "#FFD700", "#FFFFFF"], backgroundHex: "#FFFFFF",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nDivine Proportion Geometry. Elegant serif letters with high-contrast stems, inscribed within golden ratio spirals and circular arcs. Thin gold vector lines on white base. 2D Renaissance logic.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\nEtched Brass Plate. The geometric construction lines and elegant serif characters are precisely engraved into a polished brass surface. Macro detail of the grooves."
  },
  {
    presetId: "GE_08", displayName: "Dotted Matrix", category: "Geometric",
    textExample: "SIGNAL", fontHint: "Dotted Grid Sans",
    strokePx: 0, outlinePx: 0, extrusionPx: 0, extrusionLayers: ["Point Grid"],
    overlapMode: "none", fillType: "Uniform Dot Grid", colorPalette: ["#FF6D00", "#B0BEC5", "#37474F"], backgroundHex: "#F5F5F5",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nDigital Display Logic. Dotted grid sans-serif letters formed by selective removal from a uniform grid. High-contrast orange on light gray. Pure flat 2D vector.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\nDrilled Aluminum Panel. Text formed by precision holes in an airplane fuselage panel, following a dotted grid sans arrangement. Light leaking through the holes. Industrial macro."
  },
  {
    presetId: "GE_09", displayName: "Diagonal Slash", category: "Geometric",
    textExample: "MAP", fontHint: "Heavy Geometric Sans",
    strokePx: 1, outlinePx: 0, extrusionPx: 10, extrusionLayers: ["Topo Layer 1", "Topo Layer 2", "Topo Layer 3"],
    overlapMode: "stacked", fillType: "Terrain Map Shading", colorPalette: ["#1B5E20", "#F5F5DC"], backgroundHex: "#E8F5E9",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nTopographic Contour Map. Letters represented as elevation layers on a flat green map. Clean vector lines. 2D cartography aesthetic.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\nLayered Paper-Cut Model. 3D physical model made of stacked green cardstock layers. Soft shadows between layers, macro studio lighting."
  },
  {
    presetId: "GE_10", displayName: "Prism Refraction", category: "Geometric",
    textExample: "LIGHT", fontHint: "Thin Geometric Sans",
    strokePx: 0, outlinePx: 0, extrusionPx: 0, extrusionLayers: ["Refractive Wash"],
    overlapMode: "interweave", fillType: "Rainbow Spectrum Gradient", colorPalette: ["#FF0000", "#00FF00", "#0000FF", "#FFFFFF"], backgroundHex: "#FFFFFF",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nOptical Physics Illustration. Thin geometric sans lettering with flat vector rainbow spectrum bending with the letterforms. Pure white and primary RGB light colors.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\nCrystal Prism. Thin geometric letters etched inside an optical glass block. Sunlight passing through, creating real spectrum dispersion and rainbows in the environment."
  },
  {
    presetId: "GE_11", displayName: "Stencil Split", category: "Geometric",
    textExample: "CARGO", fontHint: "Military Stencil Sans",
    strokePx: 0, outlinePx: 0, extrusionPx: 0, extrusionLayers: ["Cut Stencil"],
    overlapMode: "none", fillType: "Solid Matte Ink", colorPalette: ["#000000", "#FFD600", "#FFC107"], backgroundHex: "#FFFF00",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nIndustrial Stencil Logic. Military-style stencil sans letters split into modular segments. Bold black on hazard yellow. 2D flat vector construction.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\nSpray-Painted Shipping Container. Thick black enamel paint stencil on a corrugated yellow metal surface. Overspray details and realistic metal texture."
  },
  {
    presetId: "GE_12", displayName: "Circuit Board", category: "Geometric",
    textExample: "TECH", fontHint: "Square Terminal Sans",
    strokePx: 2, outlinePx: 0, extrusionPx: 5, extrusionLayers: ["Copper Trace"],
    overlapMode: "none", fillType: "Microchip Circuitry", colorPalette: ["#FFEB3B", "#4CAF50", "#1A1A1A"], backgroundHex: "#1B5E20",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nPCB Design Illustration. Flat vector copper traces and solder pads forming the text. Dark green masking. Electronics aesthetic.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\nMacro Computer Hardware. Text built from copper paths on a real green motherboard. Realistic soldering iron details and micro-components."
  },
  {
    presetId: "GE_13", displayName: "Origami Fold", category: "Geometric",
    textExample: "FOLD", fontHint: "Angular Paper-Fold Sans",
    strokePx: 0, outlinePx: 0, extrusionPx: 10, extrusionLayers: ["Paper Crease"],
    overlapMode: "interlock-sides", fillType: "Light/Shadow Paper Planes", colorPalette: ["#F5F5DC", "#FF5722"], backgroundHex: "#F5F5F5",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nJapanese Origami Art. Flat vector shapes with varied gray tones to simulate folded white paper. Minimalist and sharp geometry.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\nActual Folded Paper. Macro of white cardstock with sharp creases and subsurface light scattering. Studio photography with soft shadows."
  },
  // --- STREET CATEGORY (18) ---
  {
    presetId: "ST_01", displayName: "Flame Script Cool", category: "Street",
    textExample: "COOL", fontHint: "Bold Retro Script Caps — yellow body with red flame tops",
    strokePx: 2, outlinePx: 2, extrusionPx: 10, extrusionLayers: ["Yellow Fill", "Red Flame Crown"],
    overlapMode: "none", fillType: "Flame Top Retro Script", colorPalette: ["#FFEB3B", "#FF5722", "#1A1A1A"], backgroundHex: "#212121",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nBold retro script caps with thick, oily flourishes. Yellow letter body with organic red and orange flame shapes growing from the top edge of each character. 2D street art vector.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\n3D retro script letters with real flame crowns. Yellow glossy letter bodies; realistic fire and embers burning from the top edge. High-reflectance surface."
  },
  {
    presetId: "ST_02", displayName: "Gothic Calligraphy", category: "Street",
    textExample: "REGAL", fontHint: "Fraktur Blackletter",
    strokePx: 0, outlinePx: 0, extrusionPx: 0, extrusionLayers: ["Ink"],
    overlapMode: "none", fillType: "Solid Black Ink", colorPalette: ["#AEEA00", "#000000"], backgroundHex: "#FFFFFF",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nHigh-Contrast Gothic Calligraphy. Sharp Fraktur strokes with expressive flourishes. Minimalist vector blackletter logo. Perfectly flat.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\nBlack Ink on Parchment. Macro shot of wet ink bleeding slightly into paper fibers. Natural daylight, shallow depth of field."
  },
  {
    presetId: "ST_03", displayName: "Kronic Bubble Throw", category: "Street",
    textExample: "KRONIC", fontHint: "Bubbly 3D Graffiti Script — spiky comic explosion badge",
    strokePx: 3, outlinePx: 4, extrusionPx: 25, extrusionLayers: ["Glossy Vinyl", "Black Spike Border"],
    overlapMode: "shape-mask", fillType: "3D Graffiti Explosion Badge", colorPalette: ["#D32F2F", "#B71C1C", "#FFFFFF", "#000000"], backgroundHex: "#FFFFFF",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nBubbly, rounded graffiti script enclosed inside a spiky comic book explosion shape. Bold red letters with white specular highlights and streaks. 2D vector graphic.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\n3D bubbly graffiti script letters inside a sculpted spiky explosion badge. Red glossy vinyl inflated letters with soft highlights."
  },
  {
    presetId: "ST_04", displayName: "Fire Stone Gothic", category: "Street",
    textExample: "FIRE", fontHint: "Heavy Gothic Display — cracked volcanic stone texture with fire border",
    strokePx: 2, outlinePx: 3, extrusionPx: 15, extrusionLayers: ["Cracked Stone", "Fire Border"],
    overlapMode: "none", fillType: "Lava Cracked Stone with Fire", colorPalette: ["#424242", "#FF9800", "#FFEB3B"], backgroundHex: "#000000",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nHeavy, angular gothic letters filled with a cracked volcanic stone texture. Glowing orange-yellow fire and flame border surrounding the letterforms. 2D flat illustration.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\n3D cracked volcanic stone letters engulfed in real fire corona. Lava cracks glow intense orange-red from within the stone surface. Low-key dramatic lighting."
  },
  {
    presetId: "ST_05", displayName: "Coming Soon Graffiti", category: "Street",
    textExample: "SOON", fontHint: "Hand-drawn Bubbly Graffiti — ink-rendered inside spiky explosion cloud",
    strokePx: 3, outlinePx: 3, extrusionPx: 0, extrusionLayers: ["Flat Hand Ink"],
    overlapMode: "shape-mask", fillType: "Hand-Drawn Graffiti Bubble Fill", colorPalette: ["#D32F2F", "#FFFFFF", "#000000"], backgroundHex: "#FFFFFF",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nHand-drawn bubbly graffiti lettering with irregular strokes, enclosed in a spiky ink explosion cloud. Red letters with thick black outlines and white highlights. 2D flat ink art.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\nHand-inked graffiti badge representation. Red bubbly letters with varied stroke widths and thick black ink contours. Spiky cloud explosion border."
  },
  {
    presetId: "ST_06", displayName: "Silver Hand-Style Script", category: "Street",
    textExample: "SOUTH", fontHint: "Chicano Hand-style",
    strokePx: 0, outlinePx: 0, extrusionPx: 0, extrusionLayers: ["Ink Flow"],
    overlapMode: "interweave", fillType: "Uniform Fluid Ink", colorPalette: ["#FFFFFF", "#000000"], backgroundHex: "#FFFFFF",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nChicano Hand-style Calligraphy. Fluid, interweaving script with sharp loops and decorative bars. 2D vector master logo.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\nEngraved Silver Plate. The script is toolled into a polished silver surface. Macro detail of the engraving with rim light."
  },
  {
    presetId: "ST_07", displayName: "Chrome Bubble Throw", category: "Street",
    textExample: "KING", fontHint: "Graffiti Bubble Script",
    strokePx: 4, outlinePx: 0, extrusionPx: 5, extrusionLayers: ["Chrome Fill", "Black Outline"],
    overlapMode: "touching", fillType: "Metallic Chrome Spray", colorPalette: ["#FFFFFF", "#9E9E9E", "#000000"], backgroundHex: "#333333",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nGraffiti Throw-Up. Rounded bubble letters with thick black outlines and chrome fill simulation. 2D street art vector.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\nPolished Bumper Chrome. 3D letters reflecting an urban street at night. Neon glows and street light caustics."
  },
  {
    presetId: "ST_08", displayName: "Lorn Slap Sticker", category: "Street",
    textExample: "SLAP", fontHint: "Bold DIY Sans",
    strokePx: 1, outlinePx: 4, extrusionPx: 2, extrusionLayers: ["Vinyl Surface", "Peeling Edge"],
    overlapMode: "stacked-shadow", fillType: "Worn Paper Finish", colorPalette: ["#000000", "#FFFFFF"], backgroundHex: "#212121",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nDIY Sticker Aesthetic. Bold text with white paper border 'sticker' edge. Flat vector illustration of a slap tag.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\nPeeling Street Sticker. Close-up of a weather-worn sticker on a rusty metal post. Realistic peeling corners and paper grain."
  },
  {
    presetId: "ST_09", displayName: "Shine Graffiti Burner", category: "Street",
    textExample: "SHINE", fontHint: "Flashy Graffiti Display",
    strokePx: 3, outlinePx: 1, extrusionPx: 10, extrusionLayers: ["Paint Gradient"],
    overlapMode: "interlock", fillType: "Spray Paint Burner", colorPalette: ["#FFEB3B", "#FF9800", "#000000"], backgroundHex: "#111111",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nHigh-gloss graffiti burner. Chrome-gold fill with orange gradient. Sharp aggressive letters. 2D vector street art.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\nGraffiti on Steel. Metallic gold letters with reflective highlights on a dark industrial surface. Spray paint grit and overlapping tags."
  },
  {
    presetId: "ST_10", displayName: "Neon Blue Le", category: "Street",
    textExample: "NIGHT", fontHint: "Cursive Monoline Neon",
    strokePx: 3, outlinePx: 0, extrusionPx: 5, extrusionLayers: ["Glass Tube"],
    overlapMode: "interweave", fillType: "Cyan Neon Glow", colorPalette: ["#00E5FF", "#B2EBF2", "#006064"], backgroundHex: "#050505",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nNightlife Aesthetics. Glowing cyan-blue neon sign in monoline cursive script. High contrast on deep black. 2D flat vector glow.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\nActual Neon Gas Tube. Cursive script letters made of real glowing glass tubes. Flickering light, wall reflections, wiring details. Dark brick wall environment."
  },
  {
    presetId: "ST_11", displayName: "Elden Lightning Strike", category: "Street",
    textExample: "ELDEN", fontHint: "Chunky 3D Comic Block Letters — cracked stone surface with diagonal lightning bolt slash",
    strokePx: 3, outlinePx: 2, extrusionPx: 30, extrusionLayers: ["Cracked Comic Stone", "Flat Shadow"],
    overlapMode: "none", fillType: "Comic Book Stone Block", colorPalette: ["#4FC3F7", "#1A237E", "#FFEB3B", "#000000"], backgroundHex: "#FFFFFF",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nChunky comic-book block lettering with cracked stone texture fill. Sky blue face, dark navy shadow side. Yellow lightning bolt flashing diagonally across the forms. 2D flat comic art.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\n3D chunky block letters with cracked stone material. Sky blue face, dark navy extruded sides. Bright yellow diagonal lightning bolt cutting across. White studio background."
  },
  {
    presetId: "ST_12", displayName: "Lorn Drip Calligraphy", category: "Street",
    textExample: "LORN", fontHint: "Liquid Formal Script",
    strokePx: 0, outlinePx: 0, extrusionPx: 0, extrusionLayers: ["Liquid Ink"],
    overlapMode: "drip-overlap", fillType: "Opaque Black Viscosity", colorPalette: ["#000000", "#FFFFFF"], backgroundHex: "#FFFFFF",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nLiquified Formal Script. Calligraphy strokes that melt into perfectly vertical 2D drips. High contrast black ink.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\nThick Enamel Paint. Liquid black paint on a white ceramic surface. Macro focus on surface tension and wet reflections."
  },
  {
    presetId: "ST_13", displayName: "Lorn Block Poster", category: "Street",
    textExample: "BLOCK", fontHint: "Brutalist Stencil Sans",
    strokePx: 4, outlinePx: 0, extrusionPx: 0, extrusionLayers: ["Heavy Ink"],
    overlapMode: "none", fillType: "Solid Matte Ink", colorPalette: ["#000000", "#1A1A1A"], backgroundHex: "#F5F5DC",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nDIY Protest Poster. Heavy, raw stencil sans letters with ink-bleed edges. Solid black on cream paper surface. Brutalist 2D graphic.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\nWheat-Pasted Poster. Heavy black stencil art on aged cream paper, stuck to a street wall. Realistic paper wrinkles, glue marks, and outdoor lighting."
  },
  {
    presetId: "ST_NEW_01", displayName: "Wawasan Explosion", category: "Street",
    textExample: "FRESH", fontHint: "Bubbly 3D Graffiti Script — glossy inflated letters inside spiky comic explosion badge",
    strokePx: 3, outlinePx: 4, extrusionPx: 25, extrusionLayers: ["Glossy Vinyl", "Black Spike Border"],
    overlapMode: "shape-mask", fillType: "3D Graffiti Explosion Badge", colorPalette: ["#D32F2F", "#B71C1C", "#FFFFFF", "#000000"], backgroundHex: "#FFFFFF",
    renderMode: "execution",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nBubbly graffiti script enclosed inside a spiky comic explosion shape. Bold red letters with white highlight streaks. Thick black spiky outer border with white cloudy fringe. 2D flat street art graphic on white background.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\n3D bubbly graffiti script letters inside a sculpted spiky explosion badge. Red glossy vinyl inflated letters with specular white highlights. Black extruded spiky shape border. White matte cloudy fringe around explosion edge. Product-shot lighting on white studio background."
  },
  {
    presetId: "ST_NEW_02", displayName: "Flame Stone Letters", category: "Street",
    textExample: "FIRE", fontHint: "Heavy Gothic Display — cracked volcanic stone texture with fire and flame border",
    strokePx: 2, outlinePx: 3, extrusionPx: 15, extrusionLayers: ["Cracked Stone", "Fire Border"],
    overlapMode: "none", fillType: "Lava Cracked Stone with Fire", colorPalette: ["#424242", "#FF9800", "#FFEB3B"], backgroundHex: "#000000",
    renderMode: "execution",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nHeavy gothic letters filled with cracked stone texture. Orange-yellow fire and flame border surrounding each letterform. Dark graphic on black background. 2D flat illustration.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\n3D cracked volcanic stone letters engulfed in real fire. Lava cracks glow orange-red inside the stone surface. Realistic flame particles and fire corona frame each letter. Dark smoky black background. Dramatic low-key lighting with fire as the light source."
  },
  {
    presetId: "ST_NEW_03", displayName: "Brick Wall Graffiti", category: "Street",
    textExample: "SOON", fontHint: "Hand-drawn Bubbly Graffiti Script — ink-rendered inside spiky explosion cloud shape",
    strokePx: 3, outlinePx: 3, extrusionPx: 0, extrusionLayers: ["Flat Hand Ink"],
    overlapMode: "shape-mask", fillType: "Hand-Drawn Graffiti Bubble Fill", colorPalette: ["#D32F2F", "#FFFFFF", "#000000"], backgroundHex: "#FFFFFF",
    renderMode: "identity",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nHand-drawn bubbly graffiti lettering inside a spiky ink explosion cloud shape. Red letters with black outlines and white highlight marks. Dotted speckle texture on the black spike border. Pure flat hand-ink 2D illustration on white background.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\nHand-inked graffiti badge. Red bubbly letters with thick black ink outline. Spiky cloud explosion border with stippled texture. White background. Flat illustration style — authentic hand-craft feel."
  },
  {
    presetId: "ST_NEW_04", displayName: "Storm Bolt Strike", category: "Street",
    textExample: "POWER", fontHint: "Chunky 3D Comic Block Letters — cracked stone surface with diagonal yellow lightning bolt slash",
    strokePx: 3, outlinePx: 2, extrusionPx: 30, extrusionLayers: ["Cracked Comic Stone", "Flat Shadow"],
    overlapMode: "none", fillType: "Comic Book Stone Block", colorPalette: ["#4FC3F7", "#FFEB3B", "#FFFFFF"], backgroundHex: "#FFFFFF",
    renderMode: "execution",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nChunky comic-book block letters with cracked stone texture fill. Blue gradient face, dark navy shadow side. Yellow lightning bolt slashing diagonally across the letterforms. Yellow starburst sparks at lightning endpoints. Black outline. 2D flat comic illustration on white background.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\n3D chunky block letters with cracked stone material. Sky blue face with visible crack lines, dark navy extruded sides. Yellow diagonal lightning bolt cutting across letters. Starburst spark explosions at bolt ends. White studio background. Comic-book hero product shot lighting."
  },
  {
    presetId: "ST_NEW_05", displayName: "Inferno Script Cool", category: "Street",
    textExample: "COOL", fontHint: "Bold Retro Script Caps — yellow body with red flame tops and dashed inner contour outline",
    strokePx: 2, outlinePx: 2, extrusionPx: 10, extrusionLayers: ["Yellow Fill", "Red Flame Crown", "Shadow Base"],
    overlapMode: "none", fillType: "Flame Top Retro Script", colorPalette: ["#FFEB3B", "#FF5722", "#1A1A1A"], backgroundHex: "#212121",
    renderMode: "identity",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nBold retro script caps. Yellow letter body with red and orange flame shapes growing from the top of each letter. Dashed inner outline contour inside each letterform. Multiple red layered drop shadows. Dark charcoal background. 2D flat retro street graphic.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\n3D retro script letters with real flame crowns. Yellow glossy letter bodies with realistic fire burning from the top edge of each letter. Red gradient layered shadow base. Dashed contour engraved on letter face. Dark studio background with flame as primary light source."
  },

  // --- BRUTALIST CATEGORY (9) ---
  {
    presetId: "BT_01", displayName: "Loud Era Block", category: "Brutalist",
    textExample: "LOUD", fontHint: "Ultra-Compressed Heavy Sans",
    strokePx: 0, outlinePx: 0, extrusionPx: 0, extrusionLayers: ["Pure Ink"],
    overlapMode: "none", fillType: "Solid Graphic", colorPalette: ["#000000", "#FFFFFF"], backgroundHex: "#FFFFFF",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nLoud Era Typography. Massive, ultra-compressed heavy sans-serif block lettering with extreme vertical proportions and tight tracking. High contrast black on white. 2D master logo.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\nBrutalist Concrete Monolith. Huge cast concrete letters in ultra-compressed heavy sans shapes, standing in a vast industrial hall. Harsh top-down lighting."
  },
  {
    presetId: "BT_02", displayName: "Industrial Slab", category: "Brutalist",
    textExample: "STEEL", fontHint: "Heavy Industrial Slab Serif",
    strokePx: 0, outlinePx: 0, extrusionPx: 30, extrusionLayers: ["Iron Ore"],
    overlapMode: "unified-block", fillType: "Rusted Corten Steel", colorPalette: ["#FFFFFF", "#000000"], backgroundHex: "#212121",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nIndustrial Brutalism. Heavy blocky slab-serif forms with rust-textured simulation. Muted iron and orange tones. Flat vector construction.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\nWeathered Corten Steel. Realistic rust oxidation, welding seams, and industrial bolts. Macro shot under overcast sky lighting."
  },
  {
    presetId: "BT_03", displayName: "Stacked Warehouse", category: "Brutalist",
    textExample: "BOX", fontHint: "Impact Heavy Sans",
    strokePx: 1, outlinePx: 0, extrusionPx: 50, extrusionLayers: ["Cardboard", "Tape"],
    overlapMode: "stacked", fillType: "Corrugated Fiberboard", colorPalette: ["#8D6E63", "#D7CCC8", "#5D4037"], backgroundHex: "#BCAAA4",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nLogistics Brutalism. Impact-style heavy sans letters stacked and overlapping like industrial shipping boxes. Tan and brown corrugated paper palette. 2D flat vector.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\nIndustrial Box Stack. Heavy sans letters built from real corrugated cardboard, adhesive tape, and shipping stamps. Studio lighting in a dusty warehouse."
  },
  {
    presetId: "BT_04", displayName: "Glitch Brutal", category: "Brutalist",
    textExample: "ERROR", fontHint: "Distorted Heavy Mono",
    strokePx: 0, outlinePx: 0, extrusionPx: 0, extrusionLayers: ["Static Noise"],
    overlapMode: "none", fillType: "Horizontal Data Glitch", colorPalette: ["#D32F2F", "#FFEB3B", "#000000", "#FFFFFF"], backgroundHex: "#000000",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nDigital Brutalism. Heavy mono-spaced type with aggressive horizontal pixel-sort glitches. RGB channel splitting. Pure flat 2D.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\nGlitching LED Billboard. Macro shot of faulty LED diodes and pixel clusters. Intense electronic glow and motion blur."
  },
  {
    presetId: "BT_05", displayName: "Raw Plywood", category: "Brutalist",
    textExample: "RAW", fontHint: "Rough Cut Wood Sans",
    strokePx: 0, outlinePx: 0, extrusionPx: 15, extrusionLayers: ["Veneer Shell"],
    overlapMode: "touching", fillType: "Raw Plywood Grain", colorPalette: ["#FFFFFF", "#FFEB3B", "#000000"], backgroundHex: "#FFFFFF",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nConstruction Site Logo. Flat vector wood-veneer patterns and rough jagged edges. Light wood tones. Minimalist workshop style.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\nCNC Cut Plywood. Letters cut from raw 18mm plywood, visible wood layers on the edges. Macro focus on splinters and grain."
  },
  {
    presetId: "BT_06", displayName: "Asphalt Heavy", category: "Brutalist",
    textExample: "ROAD", fontHint: "Bold Highway Gothic",
    strokePx: 0, outlinePx: 0, extrusionPx: 5, extrusionLayers: ["Bitumen"],
    overlapMode: "none", fillType: "Gritty Asphalt Texture", colorPalette: ["#FF9800", "#FFEB3B", "#FFF8E1"], backgroundHex: "#0D0D0D",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nInfrastructure Graphics. Bold highway-style type on top of a gritty 2D asphalt texture. High contrast white on black background.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\nRoad Markings. Thick reflective white paint on a coarse, damp asphalt road surface. Macro side-lighting, realistic street mood."
  },
  {
    presetId: "BT_07", displayName: "Blueprint Brutal", category: "Brutalist",
    textExample: "BUILD", fontHint: "Drafting Sans Mono",
    strokePx: 1, outlinePx: 0, extrusionPx: 0, extrusionLayers: ["X-Ray Line"],
    overlapMode: "none", fillType: "Translucent Grid", colorPalette: ["#FFFFFF", "#4FC3F7", "#0D47A1"], backgroundHex: "#1A1A1A",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nArchitecture Brutalism. Technical drafting lines and hidden geometry construction. White vector lines on dark gray. Pure 2D precision.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\nEngraved Slate. The technical drawings are etched into a dark slate stone surface. Macro detail of the white dust in the grooves."
  },
  {
    presetId: "BT_08", displayName: "Brutalist Neon Grid", category: "Brutalist",
    textExample: "GUARD", fontHint: "Flickering Neon Matrix Sans",
    strokePx: 2, outlinePx: 0, extrusionPx: 10, extrusionLayers: ["Metal Lattice"],
    overlapMode: "none", fillType: "Expanded Metal Mesh", colorPalette: ["#00838F", "#FFEB3B"], backgroundHex: "#111111",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nSecurity Aesthetics. Industrial stencil type with cyan neon glow, filled with a flat vector diamond mesh pattern. Tactical gray and black. High contrast.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\nIndustrial Fence Logo. Text formed by industrial expanded metal mesh with internal cyan neon light source. 3D depth, studio rim lighting, realistic metallic reflections."
  },
  {
    presetId: "BT_09", displayName: "Rubber Mat", category: "Brutalist",
    textExample: "GRIP", fontHint: "Heavy Square Sans",
    strokePx: 0, outlinePx: 0, extrusionPx: 5, extrusionLayers: ["Vulcanized Rubber"],
    overlapMode: "none", fillType: "Diamond Plate Pattern", colorPalette: ["#FFEB3B", "#1A237E", "#FFFFFF"], backgroundHex: "#FAFAFA",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nIndustrial Grip Logo. Deep black text with internal diamond-plate texture simulation. Tech-wear aesthetic. Flat vector.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\nCustom Rubber Floor Mat. The text is embossed into a heavy duty vulcanized rubber surface. Macro focus on the grip texture and dust."
  },
  // --- HYBRID CATEGORY (8) ---
  {
    presetId: "HB_01", displayName: "Vortex Flame Hybrid", category: "Hybrid",
    textExample: "VORTEX", fontHint: "Curved Flame Calligram Sans",
    strokePx: 0, outlinePx: 0, extrusionPx: 30, extrusionLayers: ["Plastic", "Fire"],
    overlapMode: "shape-mask", fillType: "Glossy Geometric Fire", colorPalette: ["#FF9800", "#E91E63", "#1A1A1A"], backgroundHex: "#000000",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nHybrid Aesthetic. Perfect geometric circles and squares that melt into flat vector flame silhouettes. High contrast 2D graphic.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\n3D Hybrid Sculpture. Solid plastic shapes that are melting into translucent glowing fire material. Studio lighting with caustic refractions."
  },
  {
    presetId: "HB_02", displayName: "Brutalist Neon", category: "Hybrid",
    textExample: "INDUSTRIAL", fontHint: "Heavy Block Stencil Neon",
    strokePx: 2, outlinePx: 0, extrusionPx: 40, extrusionLayers: ["Concrete", "Neon Gas"],
    overlapMode: "none", fillType: "Emissive Concrete", colorPalette: ["#00E5FF", "#E040FB", "#FF4081"], backgroundHex: "#111111",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nCyber-Brutalism. Massive concrete blocks with internal neon glowing channels. Flat vector cyan on dark gray. 2D master logo.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\nFuturistic Dam Wall. Text built into a massive concrete structure with glowing cyan energy paths. Moody night environment, fog, atmospheric depth."
  },
  {
    presetId: "HB_03", displayName: "Retro Metal Mesh", category: "Hybrid",
    textExample: "FUTURE", fontHint: "70s High-Contrast Sans Mono",
    strokePx: 1, outlinePx: 0, extrusionPx: 15, extrusionLayers: ["Steel Mesh", "Phosphor"],
    overlapMode: "none", fillType: "Industrial Screen Texture", colorPalette: ["#00BCD4", "#FF5252", "#FFEB3B"], backgroundHex: "#212121",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nVintage Tech Hybrid. 70s futuristic mono-spacing with industrial metal mesh textures. Flat vector orange on black. 2D graphic.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\nMechanical Computer Display. Macro shot of a backlit metal screen from a 1970s mainframe. Orange glow through industrial mesh."
  },
  {
    presetId: "HB_04", displayName: "Sticker Slap Hybrid", category: "Hybrid",
    textExample: "STICKER", fontHint: "Bold DIY Sticker Sans",
    strokePx: 1, outlinePx: 4, extrusionPx: 2, extrusionLayers: ["Vinyl", "Paper"],
    overlapMode: "stacked-shadow", fillType: "Worn Paper Label", colorPalette: ["#000000", "#FFFFFF"], backgroundHex: "#212121",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nUrban Sticker Culture. Bold text with white paper border 'sticker' edge. Flat vector illustration of a slap tag.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\nWeathered Street Sticker. Close-up of a paper sticker on a dark metal post. Realistic peeling corners and paper grain."
  },
  {
    presetId: "HB_05", displayName: "Silver Calligraphy Hybrid", category: "Hybrid",
    textExample: "SILVER", fontHint: "Fluid Chicano Hand-style",
    strokePx: 0, outlinePx: 0, extrusionPx: 0, extrusionLayers: ["Polished Steel"],
    overlapMode: "interweave", fillType: "Uniform Silver Ink", colorPalette: ["#FFFFFF", "#000000"], backgroundHex: "#000000",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nHigh-end Street Calligraphy. Fluid interweaving script with sharp loops. 2D vector silver on black. Flat.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\nEngraved Silver Plate. The script is toolled into a polished silver surface. Macro detail of the engraving with rim light."
  },
  {
    presetId: "HB_06", displayName: "Pixel Chrome Synth", category: "Hybrid",
    textExample: "CHROME", fontHint: "Pixel Block Mono — letters with liquid chrome mirror finish",
    strokePx: 0, outlinePx: 0, extrusionPx: 30, extrusionLayers: ["Mirror Pixel"],
    overlapMode: "none", fillType: "Digital Mercury Chrome", colorPalette: ["#000000", "#FF5722", "#00BCD4", "#FFFFFF"], backgroundHex: "#000000",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nCyber-Retro Hybrid. 8-bit pixel fonts with a 50s airbrushed chrome gradient effect. 2D vector graphic of digital chrome. Flat.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\nLiquid Mirror Pixels. 3D pixel cubes with flawless chrome mirror finish. Reflecting a neon city. Sharp macro photography."
  },
  {
    presetId: "HB_07", displayName: "Soft Pastel Hybrid", category: "Hybrid",
    textExample: "BLOOM", fontHint: "Extra-Heavy Stamped Block with Soft Edges",
    strokePx: 0, outlinePx: 0, extrusionPx: 20, extrusionLayers: ["Vapor Overlay"],
    overlapMode: "fused-illustration", fillType: "Soft Cloud Textures", colorPalette: ["#F8BBD0", "#F48FB1", "#FFFFFF"], backgroundHex: "#FCE4EC",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nSoft Brutalism. Extra-heavy monolithic blocks with rounded, soft-stamped edges integrated with flat vector pink cloud illustrations. High contrast 2D graphic.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\n3D volumetric cloud sculpture. Massive extra-heavy block letters with soft edges, built from millions of soft pink cloud particles. Organic depth, studio lighting."
  },
  {
    presetId: "HB_08", displayName: "Bauhaus Primary Hybrid", category: "Hybrid",
    textExample: "BAUHAUS", fontHint: "Modular Primary Geometric Sans",
    strokePx: 0, outlinePx: 0, extrusionPx: 0, extrusionLayers: ["Primary Blocks"],
    overlapMode: "touching", fillType: "Primary Colored Plastic", colorPalette: ["#000000", "#FFEB3B"], backgroundHex: "#FFFFFF",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nModernist Hybrid. Bold modular geometry using only primary colors. Bauhaus school aesthetic. Perfectly flat 2D graphic.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\nRefractive Bauhaus Toy. Primary colored translucent acrylic blocks stacked to form letters. Studio lighting with soft caustics."
  },
  {
    presetId: "PX_01", 
    displayName: "PREMIUM_VORTEX_GLASS_v1", 
    category: "Hybrid",
    textExample: "ELITE", 
    fontHint: "Heavy Geometric Block Sans",
    strokePx: 0, outlinePx: 0, extrusionPx: 80, 
    extrusionLayers: ["Rainbow Glass Stack"],
    overlapMode: "none", 
    fillType: "Borosilicate Glass", 
    colorPalette: ["#FF0000", "#FF7F00", "#FFFF00", "#00FF00", "#0000FF", "#4B0082", "#9400D3"], 
    backgroundHex: "#F5F5F5",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\n[GEOMETRY: EXTREME] 2D Flat vector representation of rainbow glass stacking. High contrast, sharp edges. No depth.",
    execution: "[DIRECTIVE: 3D_DISPLAY_TYPOGRAPHY_SYNTHESIS]\n[TARGET_TEXT: \"{userText}\"]\n[PRECISION: 100% LITERAL SPELLING - NO DEVIATION]\n\n[GEOMETRY: EXTREME] Front-facing, bold, hyper-thick, 0-degree axis, non-slanted.\n[MATERIAL_SCIENCE: BOROSILICATE_GLASS] Horizontal sequential rainbow stacking, optical refraction.\n[PHYSICS: RAY_TRACED] Prismatic light splits, caustics mapping.\n\n[EXECUTION_INSTRUCTION]: Create a commercial-grade 3D product shot of the text \"{userText}\". Apply the material physics and geometry defined above."
  },

  // ── RETRO NEW (Retro_16–19) ────────────────────────────────────────────────
  {
    presetId: "RT_16", displayName: "Stylish Rainbow Extrusion", category: "Retro",
    textExample: "STYLISH", fontHint: "Bold Condensed Italic Display Sans — ultra-heavy weight, strong forward slant",
    strokePx: 0, outlinePx: 2, extrusionPx: 70, extrusionLayers: ["White Face", "Rainbow Gradient Shadow"],
    overlapMode: "none", fillType: "White Matte Face with Rainbow Extrusion", colorPalette: ["#FFFFFF", "#F44336", "#FFEB3B", "#2196F3"], backgroundHex: "#000000",
    renderMode: "execution",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nBold condensed italic sans-serif. White letter face with thick rainbow-colored shadow extrusion angled lower-right. Flat 2D poster art on black background.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\n3D extruded typography. White matte letter face. Deep rainbow gradient extrusion — purple to magenta to orange — extruded lower-right at strong angle. Black studio background. Dramatic side-lit commercial poster look. Bold italic condensed athletic proportions."
  },
  {
    presetId: "RT_17", displayName: "Isometric Glow Type", category: "Retro",
    textExample: "SEPTEMBER", fontHint: "Bold Condensed Display — rendered on 45-degree isometric axis",
    strokePx: 0, outlinePx: 0, extrusionPx: 60, extrusionLayers: ["Isometric Face", "Glow Shadow Plane"],
    overlapMode: "stacked", fillType: "Isometric Gradient Glow", colorPalette: ["#FCE4EC", "#E91E63", "#1A1A1A"], backgroundHex: "#1A0A1E",
    renderMode: "execution",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nIsometric flat 2D projection. Bold letters on 45-degree axis. Pink pastel face on dark purple. Flat graphic, no realistic depth.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\n3D isometric typography. Bold condensed letters extruded along a 45-degree isometric axis. Pink pastel letter face. Deep magenta glow shadow plane beneath each letter fading into darkness. Dark moody purple studio environment. Dramatic spotlight emanating upward from ground plane."
  },
  {
    presetId: "RT_18", displayName: "Retro Shadow Block", category: "Retro",
    textExample: "JUICE", fontHint: "Bold Rounded Retro Caps — thick strokes, minimal inner curves",
    strokePx: 2, outlinePx: 3, extrusionPx: 30, extrusionLayers: ["Cream Border", "Deep Burgundy Shadow"],
    overlapMode: "stacked-shadow", fillType: "Retro Orange Shadow Block", colorPalette: ["#FF9800", "#F44336", "#FFEB3B"], backgroundHex: "#FF8F00",
    renderMode: "execution",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nBold retro block font. Thick orange letters, cream white border, deep burgundy drop shadow. All-caps. Stacked tight layout. 2D flat retro poster vector style.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\n3D retro block letters. Orange rounded main face with cream white inner border and thick deep burgundy extruded shadow base. Warm amber background. 1970s food poster typography. Studio product lighting."
  },
  {
    presetId: "RT_19", displayName: "Hero Pop Bold", category: "Retro",
    textExample: "HERO", fontHint: "Rounded Bold Display Caps — uniform stroke weight, tight letter spacing",
    strokePx: 4, outlinePx: 2, extrusionPx: 20, extrusionLayers: ["White Face", "Black Outline", "Red Offset Shadow"],
    overlapMode: "none", fillType: "Pop Art Bold Outline", colorPalette: ["#FFFFFF", "#000000", "#F44336"], backgroundHex: "#D32F2F",
    renderMode: "identity",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nPop-art bold rounded caps. White letter face, thick black outline, solid red offset shadow. Bright red background. High contrast flat 2D graphic. Comic book poster energy.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\n3D pop-art lettering. White glossy rounded letters, thick extruded black border walls, red shadow plane offset lower-right. Bright red studio background. Commercial comic-book product shot lighting."
  },

  // ── ORGANIC NEW (Organic_15–18) ───────────────────────────────────────────
  {
    presetId: "OR_15", displayName: "Brain Inflate", category: "Organic",
    textExample: "GENIUS", fontHint: "Bubbly Inflated Graffiti Caps — anatomically warped to fill brain folds",
    strokePx: 3, outlinePx: 2, extrusionPx: 20, extrusionLayers: ["Inflated Vinyl", "Ink Drip"],
    overlapMode: "shape-mask", fillType: "Puffy Organic Anatomical Fill", colorPalette: ["#E91E63", "#4CAF50", "#03A9F4"], backgroundHex: "#29B6F6",
    renderMode: "identity",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nInflated bubbly lettering surgically warped to fill a brain silhouette, following anatomical folds. Hot pink inflated letters with green ink drips hanging from terminals. Sky blue solid background. 2D flat graphic illustration.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\n3D inflated bubble letters shaped into brain anatomy. Hot pink glossy vinyl surface with green liquid dripping from terminals. Sky blue studio background. Tactile puffy depth."
  },
  {
    presetId: "OR_16", displayName: "Sushi Calligram", category: "Organic",
    textExample: "SUSHI", fontHint: "Mixed Display Lettering — words flow along curved silhouette contours",
    strokePx: 0, outlinePx: 0, extrusionPx: 0, extrusionLayers: ["Flat Ink"],
    overlapMode: "shape-mask", fillType: "Silhouette Word Calligram", colorPalette: ["#F44336", "#4CAF50", "#FFFFFF"], backgroundHex: "#D4A017",
    renderMode: "identity",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nCalligram typography. The word \"{userText}\" and related words arranged tightly to form a sushi roll silhouette. Words flow along curved contours. Red, white, and green text on warm golden background. 2D flat graphic poster.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\nCalligram word-art poster. Text arranged to form a sushi roll illustration. Words in white, green, and red on a warm golden amber background. Clean editorial aesthetic."
  },
  {
    presetId: "OR_17", displayName: "Fuzzy Felt Script", category: "Organic",
    textExample: "GROWTH", fontHint: "Flowing Script — thick strokes with dense felt/velvet surface texture",
    strokePx: 0, outlinePx: 0, extrusionPx: 15, extrusionLayers: ["Felt Fiber", "Velvet Pile"],
    overlapMode: "none", fillType: "Fuzzy Felt Texture Fill", colorPalette: ["#E64A19", "#BF360C"], backgroundHex: "#000000",
    renderMode: "execution",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nBold script lettering with dense fuzzy felt surface texture. Deep orange color. Fluffy fibrous fill inside each letterform. Flat 2D illustration on black background.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\n3D bold script letters made entirely of real orange felt or velvet material. Dense fiber pile visible across each letterform surface. Micro-texture fibers catch studio lighting. Deep orange-red hue. Black studio background. Macro material photography."
  },
  {
    presetId: "OR_18", displayName: "Fur Script", category: "Organic",
    textExample: "VIBE", fontHint: "Flowing Casual Script — strokes formed from directional fur/hair strands",
    strokePx: 0, outlinePx: 0, extrusionPx: 10, extrusionLayers: ["Fur Strand", "Hair Fiber"],
    overlapMode: "none", fillType: "Directional Fur Fiber Fill", colorPalette: ["#FFFFFF", "#E0E0E0"], backgroundHex: "#1A1A1A",
    renderMode: "execution",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nScript lettering constructed from white fur or hair strands. Fibers flow in the direction of each stroke. 2D graphic illustration on dark background.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\n3D script letters made of real white fur or animal hair. Individual strands visible, flowing along stroke direction. Realistic fur physics — longer strands at terminals, compressed at joints. Dark textured leather studio surface. Macro studio photography with rim lighting catching individual fibers."
  },

  // ── GEOMETRIC NEW (Geometric_14–17) ──────────────────────────────────────
  {
    presetId: "GE_14", displayName: "Echo Slice", category: "Geometric",
    textExample: "ECHO", fontHint: "Bold Geometric Sans — clean uniform strokes horizontally sliced at regular intervals",
    strokePx: 0, outlinePx: 0, extrusionPx: 0, extrusionLayers: ["Flat Slice"],
    overlapMode: "stacked", fillType: "Horizontal Slice Negative Space", colorPalette: ["#FFFFFF", "#000000"], backgroundHex: "#000000",
    renderMode: "identity",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nBold white geometric sans letters horizontally sliced by thin black cuts at precise regular intervals. The same word stacked in multiple rows — each row slightly offset — creating an echo repetition effect. Pure negative space logic. Monochrome 2D flat graphic on black background.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\nSliced 3D letter blocks. Bold white letters cut by precision horizontal planes revealing black gaps. Stacked repetition creates echo shadow effect. Black studio background. Razor-sharp edges. Hard directional studio lighting."
  },
  {
    presetId: "GE_15", displayName: "Double Line Outline", category: "Geometric",
    textExample: "ARTIST", fontHint: "Double-Stroke Thin Outline Geometric Sans — no fill, parallel lines only",
    strokePx: 1, outlinePx: 0, extrusionPx: 0, extrusionLayers: ["Flat Line"],
    overlapMode: "none", fillType: "Double Parallel Outline No Fill", colorPalette: ["#FFFFFF", "#000000"], backgroundHex: "#000000",
    renderMode: "identity",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nDouble-stroke outline typography. Each letterform drawn with two thin parallel white lines — no fill inside the letters. Geometric construction, uniform spacing. Minimal clean 2D graphic on black background.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\nNeon wire-frame letters. Double-line outline geometry rendered as glowing white light tubes on matte black. Subtle neon glow in the gap between the two parallel strokes. Studio macro lighting."
  },
  {
    presetId: "GE_16", displayName: "Geometric Shape Overlap", category: "Geometric",
    textExample: "NATURE", fontHint: "Geometric Primitive Shapes as Letterforms — circles rectangles triangles overlapping",
    strokePx: 0, outlinePx: 0, extrusionPx: 0, extrusionLayers: ["Flat Color"],
    overlapMode: "overlap-letters", fillType: "Transparent Geometric Shape Overlap", colorPalette: ["#4CAF50", "#FF9800", "#E91E63", "#FFEB3B"], backgroundHex: "#FFF8E1",
    renderMode: "identity",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nLetterforms built entirely from overlapping geometric shapes — circles, rectangles, triangles. Each letter is a different solid bright color. Where shapes overlap the colors blend creating a transparent layer effect. Light cream background. Flat 2D Bauhaus-inspired graphic.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\n3D geometric shape letters. Each letterform built from stacked translucent colored plastic geometric primitives. Overlapping regions show additive color blending. Warm cream studio background, soft diffused overhead lighting."
  },
  {
    presetId: "GE_17", displayName: "Bauhaus Block Stamp", category: "Geometric",
    textExample: "FORM", fontHint: "Pure Geometric Primitive Alphabet — each letter is one dominant shape: triangle circle square rectangle",
    strokePx: 0, outlinePx: 0, extrusionPx: 0, extrusionLayers: ["Flat Stamp"],
    overlapMode: "none", fillType: "Solid Geometric Letterpress Stamp", colorPalette: ["#3E2723", "#D7CCC8"], backgroundHex: "#E8D5A3",
    renderMode: "identity",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nBauhaus geometric alphabet. Each letter is reduced to a single dominant geometric primitive — triangle, circle, rectangle, square. Dark brown-black ink on aged cream paper texture. Heavy solid fills. Early 20th century modernist letterpress aesthetic.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\nLetterpress-printed Bauhaus block type. Dark brown ink stamped onto cream textured paper. Visible ink pressure variation and paper grain. Each letter is one bold geometric primitive shape. Macro studio photography, warm diffused light."
  },

  // ── STREET NEW (Street_14–18) ─────────────────────────────────────────────
  // (DELETED - Moved to main ST block above)


  // ── BRUTALIST NEW (Brutalist_10) ───────────────────────────────────────────
  {
    presetId: "BT_10", displayName: "Embossed Monolith", category: "Brutalist",
    textExample: "POWER", fontHint: "Ultra-Wide Condensed Athletic Sans — letterforms debossed into same-color material surface",
    strokePx: 0, outlinePx: 0, extrusionPx: 10, extrusionLayers: ["Debossed Surface Carve"],
    overlapMode: "none", fillType: "Monochromatic Material Deboss", colorPalette: ["#FFB300", "#FFA000"], backgroundHex: "#FF8F00",
    renderMode: "execution",
    identity: "[GRAPHIC_IDENTITY_MASTER]\n[TARGET_TEXT: \"{userText}\"]\nMonochromatic debossed letterpress. Letters are the same color as the background — visible only through shadow depth. Single amber-orange tone. Flat 2D illusion of surface carving.",
    execution: "[PHYSICAL_EXECUTION_MOCKUP]\n[TARGET_TEXT: \"{userText}\"]\nPhoto-real debossed typography carved into a textured material surface. Letters are same hue as background — monochromatic amber orange. Visible only through directional hard shadow cast inside the carved letterforms. Tactile surface grain, studio side-lighting raking across the material at low angle."
  }
];

// UI WRAPPER: Matches your specific folder structure
export const TYPOGRAPHY_PRESETS: PresetCategory[] = [
  "Retro", "Organic", "Geometric", "Street", "Brutalist", "Hybrid"
].map(cat => ({
  category: `${cat} Series`,
  presets: PRESETS.filter(p => p.category === cat).map((p, idx) => {
    const images = referenceImageManifest[cat as keyof typeof referenceImageManifest] || [];
    // IDENTIFICATION FIRST: Match by Preset ID to ensure perfectly locked previews
    const eliteImage = images.find(img => img.id === p.presetId) 
      || (images.length > 0 ? images[idx % images.length] : undefined);
    
    return {
      name: p.displayName,
      aspectRatio: "1:1",
      type: "typography",
      colorPalette: p.colorPalette,
      backgroundHex: p.backgroundHex,
      styleCategory: p.category,
      referenceImagePath: eliteImage?.referenceImagePath,
      previewImagePath: eliteImage?.previewImagePath,
      cropBox: eliteImage?.cropBox,
      sourceImagePath: eliteImage?.sourceImagePath,
      tags: eliteImage?.tags,
      presetDetails: p
    };
  }) as UI_Preset[]
}));

