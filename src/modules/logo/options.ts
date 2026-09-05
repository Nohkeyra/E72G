export interface LogoTypePreset {
  name: string;
  description: string;
  prompt: string;
  negativePrompt?: string;
  accessibilityNote?: string;
  system?: true;
  locked?: true;
}

export interface LogoLayoutPreset {
  name: string;
  description: string;
  prompt: string;
  negativePrompt?: string;
  accessibilityNote?: string;
  system?: true;
  locked?: true;
}

const normalizeToken = (value: string): string =>
  value.trim().replace(/\s+/g, " ").toLowerCase();

const mergeNegativePrompts = (...parts: Array<string | undefined>): string => {
  const seen = new Set<string>();
  const merged: string[] = [];

  for (const part of parts) {
    if (!part) continue;

    for (const rawToken of part.split(",")) {
      const token = normalizeToken(rawToken);
      if (!token || seen.has(token)) continue;
      seen.add(token);
      merged.push(token);
    }
  }

  return merged.join(", ");
};

const logoTypeDefaults = <T extends LogoTypePreset>(preset: T): Readonly<T> =>
  Object.freeze({
    ...preset,
    negativePrompt: mergeNegativePrompts(
      preset.negativePrompt,
      "blurry, low contrast, watermark, mockup scene, wall, floor, props, clutter, raster artifacts"
    ),
    system: true,
    locked: true
  });

const logoLayoutDefaults = <T extends LogoLayoutPreset>(preset: T): Readonly<T> =>
  Object.freeze({
    ...preset,
    negativePrompt: mergeNegativePrompts(
      preset.negativePrompt,
      "blurry, low contrast, watermark, mockup scene, wall, floor, props, clutter, raster artifacts"
    ),
    system: true,
    locked: true
  });

export const LOGO_TYPE_PRESETS: readonly LogoTypePreset[] = Object.freeze([
  logoTypeDefaults({
    name: "Wordmark",
    description: "Text-only logo",
    prompt: "typographic wordmark logo, custom letterforms, no icon, clean vector, professional brand mark, high contrast, geometric precision, strong kerning discipline, readable silhouette, scalable mark construction",
    negativePrompt: "pictorial elements, icons, illustrations, decorative flourishes, 3d render, photorealistic, gradients, shadows",
    accessibilityNote: "Clear letter spacing and strong contrast help the wordmark remain readable at small brand sizes."
  }),
  logoTypeDefaults({
    name: "Pictorial Mark",
    description: "Icon-only logo",
    prompt: "pictorial icon logo, recognizable symbol, no text, clean vector, high contrast, geometric precision, simplified silhouette, strong figure-ground contrast, scalable brand icon",
    negativePrompt: "text elements, typography, words, letterforms, photorealistic, 3d render, complex details, gradients",
    accessibilityNote: "A simplified silhouette improves recognition across app icons, favicons, and print applications."
  }),
  logoTypeDefaults({
    name: "Combination Mark",
    description: "Icon + Text",
    prompt: "combination mark logo, icon and text together, balanced composition, clean vector, high contrast, geometric precision, clear spacing relationship, scalable lockup, professional brand system",
    negativePrompt: "unbalanced layout, overlapping elements, photorealistic, 3d render, complex textures, gradients, shadows",
    accessibilityNote: "Clear separation between icon and text helps the lockup stay readable in responsive brand layouts."
  }),
  logoTypeDefaults({
    name: "Monogram",
    description: "Letter-based icon",
    prompt: "monogram logo, initials-based icon, elegant ligature, clean vector, high contrast, geometric precision, minimalist design, strong letter fusion, premium brand mark construction",
    negativePrompt: "separate letters, no ligature, photorealistic, 3d render, complex details, gradients, shadows",
    accessibilityNote: "Distinct letter construction helps initials remain legible in compact luxury-brand use cases."
  }),
  logoTypeDefaults({
    name: "Abstract Mark",
    description: "Geometric shape icon",
    prompt: "abstract geometric logo, non-representational shape, clean vector, high contrast, geometric precision, minimalist design, balanced proportions, memorable silhouette, modern brand symbol",
    negativePrompt: "representational elements, photorealistic, 3d render, complex textures, gradients, shadows, organic shapes",
    accessibilityNote: "Simple geometric balance improves recognition even when the mark is viewed quickly or at small size."
  }),
  logoTypeDefaults({
    name: "Mascot",
    description: "Character-based logo",
    prompt: "mascot character logo, friendly or aggressive, clean vector, high contrast, geometric precision, stylized cartoon, bold outer silhouette, readable facial simplification, merch-ready emblem",
    negativePrompt: "photorealistic, 3d render, complex textures, gradients, shadows, realistic anatomy, detailed features",
    accessibilityNote: "Bold character silhouettes help the mascot stay recognizable across thumbnails, jerseys, and merchandise."
  }),
  logoTypeDefaults({
    name: "Emblem",
    description: "Badge-style logo",
    prompt: "emblem badge logo, text inside shape, clean vector, high contrast, geometric precision, badge design, contained composition, strong border shape, heritage-ready brand seal",
    negativePrompt: "open layout, no badge shape, photorealistic, 3d render, gradients, shadows, complex textures",
    accessibilityNote: "A contained badge shape improves clarity when the mark is used as a seal, patch, or stamp."
  }),
  logoTypeDefaults({
    name: "Negative Space",
    description: "Hidden icon logo",
    prompt: "negative space logo, hidden symbol inside shape, clever optical illusion, clean vector, high contrast, geometric precision, strong figure-ground design, logo-grade readability, memorable dual reading",
    negativePrompt: "obvious direct depiction, no hidden elements, photorealistic, 3d render, gradients, shadows, complex textures",
    accessibilityNote: "Strong figure-ground contrast helps the primary form stay clear before the hidden symbol is discovered."
  }),
  logoTypeDefaults({
    name: "Golden Ratio",
    description: "Fibonacci geometric logo",
    prompt: "golden ratio geometric logo, Fibonacci spiral construction lines, overlapping circles derived from golden rectangle, harmonically proportioned logo mark, clean professional minimal aesthetic, precise compass geometry, vector precision",
    negativePrompt: "complex details, photorealistic, 3d render, gradients, shadows, busy background, clutter",
    accessibilityNote: "Mathematical geometric symmetry makes the mark highly versatile and clean at small sizes."
  })
]);

export const LOGO_LAYOUT_PRESETS: readonly LogoLayoutPreset[] = Object.freeze([
  logoLayoutDefaults({
    name: "Interlocking Stack",
    description: "Unified interlocking letter mass",
    prompt: "interlocking-stack layout, unified interlocking mass, focus distributed across whole wordmark, depth layers drawing eye sequentially, multi-layer interlock, letters overlap from back to front in z-space, asymmetrical, letters overlap intentionally, glyphs share space, contiguous block, visible outlines or distinct fill boundaries, consistent baseline for stacked arrangements, z-index shifts for depth, cast shadows, occlusion, extrusion.",
    negativePrompt: "isolated letters, uniform spacing, no overlap, flat layout, separated glyphs, thin airy composition",
    accessibilityNote: "Dense composition requires high-contrast outlines to distinguish letterforms within the interlocking mass."
  }),
  logoLayoutDefaults({
    name: "Stacked",
    description: "Icon above text",
    prompt: "stacked layout, icon centered above text, balanced composition, clean vector, high contrast, geometric precision, clear vertical hierarchy, centered brand lockup",
    negativePrompt: "unbalanced layout, overlapping elements, photorealistic, 3d render, complex textures, gradients, shadows",
    accessibilityNote: "A strong top-to-bottom hierarchy improves scanning and readability in vertical brand placements."
  }),
  logoLayoutDefaults({
    name: "Side-by-Side",
    description: "Icon left of text",
    prompt: "side-by-side layout, icon to the left of text, balanced composition, clean vector, high contrast, geometric precision, consistent alignment, horizontal brand lockup clarity",
    negativePrompt: "unbalanced layout, overlapping elements, photorealistic, 3d render, complex textures, gradients, shadows",
    accessibilityNote: "Left-to-right structure supports quick recognition in headers, nav bars, and website branding."
  }),
  logoLayoutDefaults({
    name: "Enclosed",
    description: "Icon inside text",
    prompt: "enclosed layout, icon integrated into text, seamless integration, clean vector, high contrast, geometric precision, unified mark construction, controlled spacing relationship",
    negativePrompt: "separate elements, no integration, photorealistic, 3d render, complex textures, gradients, shadows",
    accessibilityNote: "A unified construction helps the icon-text relationship stay coherent when scaled down."
  }),
  logoLayoutDefaults({
    name: "Circular",
    description: "Text around icon",
    prompt: "circular layout, text following a path around icon, balanced composition, clean vector, high contrast, geometric precision, readable curved baseline, badge-ready symmetry",
    negativePrompt: "linear text, no circular path, photorealistic, 3d render, complex textures, gradients, shadows",
    accessibilityNote: "A clear circular reading path helps preserve structure in seals, patches, and profile marks."
  }),
  logoLayoutDefaults({
    name: "Minimalist Rail",
    description: "Small text on a line",
    prompt: "minimalist rail layout, icon above a thin line with small text, clean vector, high contrast, geometric precision, restrained editorial spacing, refined modern balance",
    negativePrompt: "complex layout, no rail line, photorealistic, 3d render, complex textures, gradients, shadows",
    accessibilityNote: "Strong line separation helps distinguish the icon from supporting text in minimal brand systems."
  }),
  logoLayoutDefaults({
    name: "Diagonal Dynamic",
    description: "45-degree tilt",
    prompt: "dynamic diagonal layout, 45-degree shear, balanced composition, clean vector, high contrast, geometric precision, directional energy, controlled asymmetry",
    negativePrompt: "horizontal layout, vertical layout, no diagonal, photorealistic, 3d render, complex textures, gradients, shadows",
    accessibilityNote: "Clear directional structure helps the composition feel energetic without losing overall readability."
  }),
  logoLayoutDefaults({
    name: "Mirrored Symmetrical",
    description: "Balanced symmetry",
    prompt: "mirrored symmetrical layout, perfectly balanced, clean vector, high contrast, geometric precision, centered axis, formal visual stability",
    negativePrompt: "asymmetrical layout, unbalanced, photorealistic, 3d render, complex textures, gradients, shadows",
    accessibilityNote: "A strong center axis improves visual stability and recognition in formal or luxury marks."
  }),
  logoLayoutDefaults({
    name: "Asymmetrical Modern",
    description: "Unbalanced but clean",
    prompt: "asymmetrical modern layout, clean but dynamic, balanced composition, clean vector, high contrast, geometric precision, intentional offset hierarchy, contemporary brand tension",
    negativePrompt: "symmetrical layout, rigid, photorealistic, 3d render, complex textures, gradients, shadows",
    accessibilityNote: "Intentional hierarchy helps the mark remain readable even when the composition avoids symmetry."
  })
]);