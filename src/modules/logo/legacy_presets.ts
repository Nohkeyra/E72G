export interface LogoPreset {
  id: string;
  presetName: string;
  fontHint: string;
  fillType: string;
  colorPalette: string[];
  backgroundHex: string;
  extrusionDepth: string;
  strokeOutline: string;
  overlapLayout: string;
  logoComposition?: string;
  promptingNotes: string;
}

export const logoPresets: LogoPreset[] = [
  {
    id: "logo_mascot_badge",
    presetName: "Mascot Badge Logo",
    fontHint: "Extra-bold condensed italic display slab or sans — all uppercase; letters lean 10–15 degrees right; stroke weight extremely heavy with minimal inner curvature giving a slightly inflated billboard quality; the word sits below or beside a central mascot character illustration; font size is secondary to the mascot but still occupies 40–50% of the total badge area",
    fillType: "Warm 2-stop gradient on letter face — bright yellow-gold at top transitioning to deep amber-red at bottom; the mascot illustration is rendered in full color with shading and highlights, clearly the hero of the composition",
    colorPalette: ["#FFD000", "#FF8C00", "#FF4500", "#3D1A00", "#FFFFFF"],
    backgroundHex: "#F5ECD7",
    extrusionDepth: "Moderate extrusion on the wordmark only — 10–15% of letter height, lower-right; mascot illustration has a soft drop shadow to separate it from the background",
    strokeOutline: "Heavy 5–7px dark brown or near-black outline on the entire wordmark; the mascot illustration also has a matching 3–4px outline to unify both elements visually",
    overlapLayout: "Mascot overlaps the wordmark slightly — one limb, tool, or object from the mascot breaks over the top edge of the wordmark to create depth; wordmark is 1–2 lines stacked below the mascot",
    logoComposition: "Vertical stacked badge: mascot on top, wordmark below, optional tagline in a small banner at the base; the entire composition fits within a shield, circle, or rounded rectangle silhouette",
    promptingNotes: "mascot logo badge, food brand, illustrated character, gradient wordmark, heavy outline unifier, dynamic italic type, cheerful energetic tone, street food or sports brand, vector illustration, sticker-ready silhouette, warm color palette"
  },
  {
    id: "logo_minimal_icon_wordmark",
    presetName: "Minimal Icon + Wordmark",
    fontHint: "Clean medium-weight geometric sans-serif or humanist sans — NOT bold; letter spacing is generous (tracking approximately +50 to +100); all lowercase or small caps; the font is contemporary, undecorated, and designed to be a quiet companion to the icon — NOT the hero of the composition; stroke weight is medium and uniform",
    fillType: "Flat solid matte — single color, typically white on dark or dark on light; no gradient, no texture, no decoration",
    colorPalette: ["#FFFFFF", "#F5F5F5", "#1A1A1A", "#4CAF50", "#FF6600"],
    backgroundHex: "#0D1F0D",
    extrusionDepth: "Flat / None",
    strokeOutline: "None on the wordmark; the icon may have a very thin 1px stroke if it is outline-style",
    overlapLayout: "Icon centered above wordmark OR icon left-aligned beside wordmark; icon is 2–3× the cap height of the wordmark; generous whitespace between icon and wordmark; the two elements are never touching",
    logoComposition: "Horizontal lockup (icon left, wordmark right) OR vertical lockup (icon top, wordmark bottom); the icon is a simple geometric shape, negative space mark, or stylized letter/monogram; optionally a thin horizontal rule separates the icon from the wordmark",
    promptingNotes: "minimal logo design, geometric icon, clean sans wordmark, flat vector, wide letter spacing, contemporary brand identity, tech or food startup, two-color maximum, scalable at any size, whitespace is intentional, no drop shadows, no gradients"
  },
  {
    id: "logo_circular_badge_seal",
    presetName: "Circular Badge Seal",
    fontHint: "Medium-weight condensed display serif or slab — all uppercase; letters are set on a circular arc following the outer ring of the badge; letter spacing is expanded to fill the arc evenly; a second shorter arc of text (tagline or date) runs along the inner bottom arc of the circle; the font has authority and heritage — it reads like a government seal or craft brewery label",
    fillType: "Flat solid matte on the text arcs — white or off-white letters against a dark ring; the central circular area of the badge contains the primary icon or illustration",
    colorPalette: ["#F5ECD7", "#FFD700", "#1A1A1A", "#2E6B3E", "#8B0000"],
    backgroundHex: "#1A1A1A",
    extrusionDepth: "Flat / None for text; the badge may have a subtle emboss or deboss effect on the outer ring border",
    strokeOutline: "Thin 1–2px stroke on the circular border rings; the arced text has no additional stroke beyond the font itself",
    overlapLayout: "Text is arranged exclusively on the circular arcs — never in the center; the center is reserved for the primary icon, monogram, or illustration; divider ornaments (stars, diamonds, dashes) separate the top arc from the bottom arc at the 3 o'clock and 9 o'clock positions",
    logoComposition: "Concentric circle badge: outer arc (brand name, top), inner arc (tagline or founding year, bottom), central icon or illustration, divider ornaments at left and right, optional inner ring border; optionally enclosed in a shield shape",
    promptingNotes: "circular badge logo, seal typography, arc text, heritage brand, craft brewery label, circular seal, vintage badge, outer ring wordmark, inner arc tagline, divider ornaments, monochrome or 2-color, emboss texture optional, government seal aesthetic"
  },
  {
    id: "logo_geometric_monogram",
    presetName: "Geometric Monogram",
    fontHint: "Single letter or 2-letter monogram constructed from geometric shapes — the letterform is deconstructed into its component lines and arcs, then rebuilt using uniform-thickness geometric elements (equal-weight bars, circles, triangles); the result reads as a letter but also as an abstract geometric symbol; stroke weight is medium-heavy and absolutely uniform throughout",
    fillType: "Flat solid matte — single accent color OR a two-tone geometric color split within the monogram itself (each geometric element may be a different shade of the same hue); NO gradients",
    colorPalette: ["#FF6600", "#66CC00", "#FFD700", "#1A1A1A", "#FFFFFF"],
    backgroundHex: "#F5F5F5",
    extrusionDepth: "Flat / None — the geometric color split provides inherent depth",
    strokeOutline: "None externally; the seam between colored geometric zones within the monogram acts as an internal divider; optionally a very thin 1px outer border in a neutral dark color",
    overlapLayout: "Single centered mark — no wordmark in the primary lockup; optionally a minimal wordmark in clean tracking beneath the monogram as a secondary lockup",
    logoComposition: "Square or circular frame containing the geometric monogram; the mark is symmetrically centered; a secondary full-name wordmark in clean sans may appear beneath in a horizontal lockup variant",
    promptingNotes: "geometric monogram, lettermark logo, modular letterform, tanagram construction, uniform stroke weight, abstract symbol, tech brand, sports brand, color-split geometric, flat vector, scalable mark, favicon quality, app icon potential"
  },
  {
    id: "logo_negative_space_mark",
    presetName: "Negative Space Mark",
    fontHint: "Bold or extra-bold display sans or slab — the letterform(s) are used as a mask through which a second meaningful shape is revealed in the counter or negative space; the trick is that both the positive letter shape AND the negative counter shape are intentional and recognizable; the font must be heavy enough to have substantial counter areas worth filling with a secondary concept",
    fillType: "Flat solid matte — single color for the letter fill; the negative space reveals either the background color or a second carefully positioned illustration within the counter; NO gradients",
    colorPalette: ["#FF5722", "#FF7043", "#1A1A1A", "#FFFFFF", "#4CAF50"],
    backgroundHex: "#FFFFFF",
    extrusionDepth: "Flat / None — the negative space concept requires a completely flat 2D approach to avoid visual confusion",
    strokeOutline: "None; the hard edge between letter fill and background is the precise graphic element that makes the negative space readable",
    overlapLayout: "Typically a single letter or 2-letter combination; the composition is compact and icon-like; the entire mark fits within a square bounding box",
    logoComposition: "Square or circular badge format; the negative space mark is centered; minimal wordmark in a contrasting weight of the same font sits beneath or beside the mark; the concept should be immediately comprehensible without explanation",
    promptingNotes: "negative space logo, counter space concept, hidden shape in letterform, dual meaning mark, clever logo design, flat 2D, single color, arrow in FedEx style, shape within shape, conceptual branding, icon logomark, no gradients, pure graphic wit"
  },
  {
    id: "logo_illustrated_letterform",
    presetName: "Illustrated Letterform Logo",
    fontHint: "Bold or extra-bold serif, sans, or slab single letter — the letterform is the hero and serves as the structural armature for an integrated illustration; a recognizable object, animal, or scene is embedded INTO the letter shape by modifying one or more strokes to become that object; the letter remains fully legible while also being clearly a specific illustration",
    fillType: "Flat solid matte with clean vector illustration style — the object integrated into the letter is rendered in a simplified 2-color or 3-color illustration; no photorealism; the illustration style is flat with optional 1-tone shadow",
    colorPalette: ["#1A1A1A", "#FFFFFF", "#FF5722", "#4CAF50", "#FFD700"],
    backgroundHex: "#FFFFFF",
    extrusionDepth: "Flat / None",
    strokeOutline: "Medium 2–3px outline on the letter body; the integrated illustration elements share the same stroke weight for visual unity",
    overlapLayout: "Single letter mark with the illustration element either replacing one stroke, emerging from a terminal, or wrapping around the letter from outside; the illustration and the letter are inseparable",
    logoComposition: "Single letter plus integrated illustration as the primary mark; optionally a full brand name wordmark in a matching weight sans below as the secondary lockup; the combination fits within a square or portrait rectangle",
    promptingNotes: "illustrated letter logo, letter with integrated illustration, animal in letterform, object as letter stroke, serpent wrapping letter, clever lettering mark, black and white primary, flat vector, fashion brand or studio logo aesthetic, single initial mark"
  },
  {
    id: "logo_retro_wordmark_banner",
    presetName: "Retro Wordmark Banner",
    fontHint: "Bold wide rounded sans-serif or condensed slab — all uppercase; letters are optically equal in height and width where possible; the wordmark is enclosed in or sits on a banner, ribbon, or stadium shape that functions as the background container; the font reads as a 1970s–80s sports franchise or theme park wordmark with a friendly, confident character",
    fillType: "Flat solid matte on the letter face — a single warm saturated color (red, yellow, or orange); the banner/container behind the letters is a darker or contrasting color creating a strong figure-ground separation",
    colorPalette: ["#E8000A", "#FFD700", "#FF8C00", "#1A1A1A", "#FFFFFF"],
    backgroundHex: "#1A0A00",
    extrusionDepth: "Flat / None on the letters themselves; the banner/container shape has a bottom-drop shadow of 6–10px in a darker version of the banner color, making it appear to float slightly off the background",
    strokeOutline: "Bold 3–5px outline around the entire banner/container shape; the letters inside the banner have a thin 1–2px outline in a contrasting color to separate them from the banner fill",
    overlapLayout: "All letters of the brand name are contained within the banner shape in a single horizontal line; if a tagline exists it sits in a separate smaller banner directly below the primary one",
    logoComposition: "Horizontal stadium-shape or rectangular banner as the container; wordmark in single line inside the banner; the container has a slightly angled bottom edge (parallelogram) for dynamism; optional small icon or star mark at the top-center of the banner",
    promptingNotes: "retro wordmark logo, stadium banner shape, 1970s franchise typography, sports brand, theme park sign, bold rounded sans, warm red and gold palette, flat banner container, dark warm background, vintage Americana brand feel, no serif, strong figure-ground"
  },
  {
    id: "logo_flat_icon_system",
    presetName: "Flat Icon System Logo",
    fontHint: "Medium-weight clean rounded sans-serif or geometric sans — all lowercase or mixed-case; the wordmark is secondary to the icon; letter spacing is normal to slightly open; the font is chosen for neutrality and legibility rather than personality — it is a quiet typographic foundation that allows the icon to be the brand personality carrier",
    fillType: "Flat solid matte — the wordmark is always a single neutral color (typically white or dark grey); the icon is rendered in 2–3 flat colors with no gradients; the icon colors are the brand's primary identity colors",
    colorPalette: ["#FF6600", "#88CC00", "#1A1A1A", "#FFFFFF", "#F5F5F5"],
    backgroundHex: "#0D1F0A",
    extrusionDepth: "Flat / None",
    strokeOutline: "None on the wordmark; the icon may use a thin 1px outline or be fully filled flat shapes — both approaches are valid",
    overlapLayout: "Icon positioned to the left of the wordmark in a horizontal lockup OR centered above the wordmark in a vertical lockup; the icon is 1.5–2.5× the cap height of the wordmark; a consistent vertical alignment grid holds all elements",
    logoComposition: "The icon is a simplified flat illustration of the brand concept (leaf, fork-and-spoon, lightning bolt, wave) built from 2–4 geometric shapes; the wordmark sits in clean tracking beside or below; the system scales from app icon (icon only) to full horizontal lockup",
    promptingNotes: "flat icon logo system, minimal illustration mark, geometric icon, clean wordmark, food or tech startup aesthetic, two or three brand colors, scalable vector, dark background version, app icon potential, no gradients, modern and friendly tone"
  },
  {
    id: "logo_blackletter_crest",
    presetName: "Blackletter Crest Logo",
    fontHint: "Authentic blackletter or Old English display font — heavy angular strokes with pronounced diamond-shaped serifs; tall x-height with very short descenders; strong vertical emphasis; the overall impression is authoritative, historic, and serious; letter weight is heavy but each stroke is precisely constructed, NOT blurry or rough; the font evokes Medieval manuscripts, German newspapers, or luxury fashion houses",
    fillType: "Flat solid matte — primary version in black with white counter spaces; premium version may use a metallic gold fill with a slight linear highlight on each downstroke to suggest embossing; NO photographs or complex gradients",
    colorPalette: ["#0A0A0A", "#1A1A1A", "#C9A84C", "#B8960C", "#FFFFFF"],
    backgroundHex: "#F5F0E8",
    extrusionDepth: "Flat / None on the letterforms; the crest or shield background shape may have a subtle emboss or bevel effect in 2D",
    strokeOutline: "Fine 1px outline in a slightly lighter version of the fill for black version; for gold version, a thin dark outline at 1px provides crispness at small sizes",
    overlapLayout: "Brand name set in blackletter occupies the horizontal center of a shield, crest, or coat-of-arms compositional frame; a thin horizontal rule divides the brand name from a secondary tagline in a smaller clean sans beneath",
    logoComposition: "Shield or crest outer frame; blackletter brand name centered horizontally in the upper half of the shield; a secondary element (animal illustration, geometric device, or monogram) in the lower half; horizontal rule divider; all enclosed within the shield silhouette",
    promptingNotes: "blackletter crest logo, Old English letterform, medieval heraldic, shield composition, luxury brand heritage, German newspaper masthead, fashion house logotype, flat vector, black and gold, emboss feel, coat of arms aesthetic, authority and tradition"
  },
  {
    id: "logo_organic_hand_lettered",
    presetName: "Organic Hand-Lettered Stamp",
    fontHint: "Casual bold mixed-case hand-lettered font — a hybrid of a wide brush marker capital letter style combined with a fluid casual lowercase connector; strokes are thick and confident with slight edge wobble and deliberate imperfections that communicate authenticity; NO calligraphic hairlines — all strokes are thick; the capital letters have a slight block quality while lowercase letters have flowing connections",
    fillType: "Flat solid matte — primary in dark near-black on a textured off-white or kraft paper background; the fill itself is clean and even but the letterform edges carry the hand-crafted character",
    colorPalette: ["#1A1A1A", "#2B2B2B", "#F5F0E8", "#E8DCC8", "#FFFFFF"],
    backgroundHex: "#F0E8D8",
    extrusionDepth: "Flat / None for the letters; the entire composition may be placed on a secondary oval, rectangle, or banner shape with a rough torn-paper or stamp-pad edge texture",
    strokeOutline: "None formal; the slightly uneven brush or marker edge IS the boundary; a light paper grain or ink texture overlay covers the entire composition to enhance the handmade quality",
    overlapLayout: "Multi-line stacked layout — primary brand name in large mixed-case display, a secondary descriptor word in a smaller italic or script below; the two lines are centered and the taller primary word overlaps or very nearly touches the secondary descriptor",
    logoComposition: "Oval or rounded rectangle stamp frame; mixed-case hand-lettered primary name at full width; smaller secondary word or tagline below; the stamp frame has a rough inked edge or distressed border texture; optional small crown, star, or registered mark symbol above the primary name",
    promptingNotes: "hand-lettered stamp logo, organic brush marker, mixed-case casual display, craft brand, artisan food or apparel, stamp ink texture, rough oval border, authentic handmade quality, black on kraft paper feel, brush imperfection, small business brand energy"
  }
];
