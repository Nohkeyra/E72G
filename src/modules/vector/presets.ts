import { PresetCategory, Preset } from "../../types/presets";

const rawVectorPresets: PresetCategory[] = [
  {
    category: "1. UI & Web",
    presets: [
      {
        name: "Cyber Neon",
        basePrompt: "A professional vector illustration of [Subject]. Cyberpunk neon aesthetic, high-contrast electric luminescence, sharp geometric primitives, glowing cyan and magenta edge-accents, layered digital vector topography, controlled gradient fields, crisp vector-line precision, 2D flat layered composition.",
        designIntent: "High-energy cyber visual prioritizing neon contrast and geometric digital structure.",
        dna: "Neon contrast, geometric layering, digital topography, sharp silhouettes",
        aspectRatio: "1:1",
        negativePrompt: "soft glows, fuzzy edges, volumetric fog, photographic lighting, depth of field"
      },
      {
        name: "Glassmorphism Flat",
        basePrompt: "A professional vector illustration of [Subject]. Glassmorphism UI design, frosted translucent vector panels, soft geometric depth separation, subtle light diffusion, cool monochromatic color palette, rounded geometric precision, minimal visual noise, clean vector layers.",
        designIntent: "Construct a soft, translucent interface aesthetic featuring layered depth.",
        dna: "Frosted panels, soft depth, translucent UI, minimal geometry",
        aspectRatio: "1:1",
        negativePrompt: "heavy textures, photographic glass, realistic refraction, lens flare, blur"
      },
      {
        name: "Technical Circuitry",
        basePrompt: "A professional vector illustration of [Subject]. Technical circuitry layout, PCB-inspired geometry, 45-degree angular routing, circular node terminals, high-tech monochromatic palette, precision engineering language.",
        designIntent: "Deliver a high-tech engineering aesthetic utilizing circuit-inspired paths and precision layouts.",
        dna: "PCB routing, 45-degree angles, node terminals, engineering precision",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, texture noise, painterly shading, organic forms"
      },
      {
        name: "Claymorphism UI",
        basePrompt: "A professional vector illustration of [Subject]. Soft clay-inspired UI, rounded volumetric shapes, subtle shadow layering, pastel color palette, smooth artificial depth, minimal interface layout, clean vector structure.",
        designIntent: "Create a friendly, tactile UI visual featuring gentle depth and rounded forms without realistic rendering.",
        dna: "Soft volume, rounded geometry, pastel UI, gentle shadows",
        aspectRatio: "1:1",
        negativePrompt: "photo, realism, 3d render, heavy texture, noise, physical material detail"
      },
      {
        name: "Bento Grid Minimalist",
        basePrompt: "A professional vector illustration of [Subject]. Bento grid composition, modular rectangular cells, clean rounded corners, structured information hierarchy, pastel segmentation, minimalist iconography, balanced negative space.",
        designIntent: "Organize visual elements into a modular grid system emphasizing clean cell-based containment.",
        dna: "Modular grid, rounded cells, information hierarchy, layout balance",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, texture noise, painterly effects, organic chaos"
      },
      {
        name: "Brutalist Wireframe",
        basePrompt: "A professional vector illustration of [Subject]. Brutalist web aesthetic, raw structural wireframes, bold black strokes, exposed grid architecture, functional typography, utilitarian geometry, stark minimalism.",
        designIntent: "Evoke a raw, anti-design structural aesthetic using bold wireframes and functional elements.",
        dna: "Structural wireframe, bold strokes, utilitarian geometry, anti-design",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, texture, gradients, soft shading, painterly effects"
      },
      {
        name: "Swiss Typographic Grid",
        basePrompt: "A professional vector illustration of [Subject]. Swiss International Style, strict modular grid alignment, heavy grotesk typography, asymmetric balance, red-and-black accent palette, clean geometric precision.",
        designIntent: "Execute a rational, grid-based layout prioritizing typographic hierarchy and Swiss design precision.",
        dna: "Modular grids, typographic graphics, asymmetric balance, Swiss precision",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, texture, painterly effects, organic forms"
      }
    ]
  },
  {
    category: "2. Minimalist & Flat",
    presets: [
      {
        name: "Ultra-Flat 2.0",
        basePrompt: "A professional vector illustration of [Subject]. Ultra-flat aesthetic, solid color blocking, zero gradients, bold simplified forms, saturated palette, minimal interface logic, sharp geometric edges, high-contrast.",
        designIntent: "Generate a strictly flat graphic leveraging solid colors, bold forms, and zero shading.",
        dna: "Solid colors, zero gradients, bold forms, high-contrast",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, shading, texture, painterly effects"
      },
      {
        name: "Monoline Icon",
        basePrompt: "A professional vector illustration of [Subject]. Monoline icon style, uniform stroke weight, rounded caps and joins, zero fill, clean continuous paths, geometric precision, highly legible minimalism.",
        designIntent: "Produce clean, scalable symbology using uniform stroke weights and precise pathing.",
        dna: "Uniform strokes, rounded joins, zero fill, continuous paths",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, shading, texture, painterly effects"
      },
      {
        name: "DuoTone Graphic",
        basePrompt: "A professional vector illustration of [Subject]. Duotone graphic design, bold two-color mapping, sharp tonal transitions, vibrant contrast, simplified form extraction, clean vector finish.",
        designIntent: "Apply a high-impact, two-color tonal mapping system with vibrant contrast.",
        dna: "Two-color mapping, sharp transitions, vibrant contrast, simplified forms",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, painterly effects"
      },
      {
        name: "Minimalist Silhouette",
        basePrompt: "A professional vector illustration of [Subject]. Minimalist silhouette, solid black form extraction, deliberate negative space, zero internal detail, bold graphic reduction, high-contrast figure-ground.",
        designIntent: "Extract bold, iconic silhouettes emphasizing negative space and strict graphic reduction.",
        dna: "Solid silhouette, negative space, zero internal detail, bold reduction",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, internal detail, shading"
      },
      {
        name: "Negative Space Art",
        basePrompt: "A professional vector illustration of [Subject]. Negative space design, clever figure-ground reversal, hidden secondary forms, sharp silhouette edges, minimal optical illusion, high-contrast impact.",
        designIntent: "Embed dual-reading optical illusions through precise figure-ground reversal.",
        dna: "Figure-ground reversal, hidden forms, optical illusion, sharp edges",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, painterly effects"
      },
      {
        name: "Eco-Minimalist Mono",
        basePrompt: "A professional vector illustration of [Subject]. Eco-minimalist monoline, single continuous stroke, smooth organic curves, generous white space, zero fill, subtle green brand palette, unbroken path flow.",
        designIntent: "Express organic, eco-friendly concepts using single continuous lines and ample white space.",
        dna: "Continuous stroke, organic curves, zero fill, eco-palette",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, painterly effects"
      }
    ]
  },
  {
    category: "3. Geometric & Dimensional",
    presets: [
      {
        name: "Low Poly Faceted",
        basePrompt: "A professional vector illustration of [Subject]. Low-poly faceted mesh, triangulated geometry, sharp angular planes, flat color per facet, bold depth illusion, architectural precision, structured abstraction.",
        designIntent: "Render angular geometric depth using a triangulated mesh of flat-colored facets.",
        dna: "Triangulated facets, angular planes, flat color mesh, structured depth",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, organic forms, painterly effects"
      },
      {
        name: "Bauhaus Geometric",
        basePrompt: "A professional vector illustration of [Subject]. Bauhaus geometric style, primary colors (red/yellow/blue), strict circle/square/triangle construction, grid alignment, functional abstract art, clean composition.",
        designIntent: "Emulate classic Bauhaus abstraction relying on primary colors and basic geometric primitives.",
        dna: "Primary colors, geometric primitives, grid alignment, functional abstraction",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, organic forms, painterly effects"
      },
      {
        name: "Prism Isometric",
        basePrompt: "A professional vector illustration of [Subject]. Isometric prism geometry, axonometric faces, flat color refraction, jewel-like angular planes, architectural clarity, zero perspective distortion.",
        designIntent: "Construct sharp, crystalline geometry using isometric perspective and flat color refraction.",
        dna: "Axonometric geometry, flat refraction, jewel facets, isometric clarity",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, organic forms, painterly effects"
      },
      {
        name: "Low-Poly Sunset",
        basePrompt: "A professional vector illustration of [Subject]. Low-poly landscape, triangular facets, flat color per triangle, digital origami aesthetic, crisp silhouette layering, vibrant sunset palette.",
        designIntent: "Abstract environmental landscapes into triangulated, digital origami terrain.",
        dna: "Triangular facets, digital origami, angular landscapes, flat shading",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, organic forms, painterly effects"
      },
      {
        name: "Low-Poly Crystal",
        basePrompt: "A professional vector illustration of [Subject]. Low-poly crystal structure, sharp angular facets, jewel-tone color per face, isometric perspective, gemological precision, vibrant saturated palette.",
        designIntent: "Generate vibrant, gemological structures utilizing sharp isometric polygons.",
        dna: "Sharp facets, jewel tones, gemological precision, isometric mesh",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, organic forms, painterly effects"
      },
      {
        name: "Poly-Art Animal",
        basePrompt: "A professional vector illustration of [Subject]. Poly-art animal portrait, triangulated geometric mesh, flat solid color facets, sharp angular construction, recognizable anatomy via digital origami.",
        designIntent: "Preserve anatomical subject recognition strictly through angular polygon mesh construction.",
        dna: "Triangulated mesh, flat facets, digital origami anatomy, sharp construction",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, organic forms, painterly effects"
      },
      {
        name: "Neon Polygon Mesh",
        basePrompt: "A professional vector illustration of [Subject]. Neon polygon mesh, dark background, glowing edge lines, sharp low-poly wireframe, emissive electric blue and magenta, zero solid fills, cybernetic grid.",
        designIntent: "Create an emissive, cybernetic wireframe mesh utilizing glowing edges and zero solid fills.",
        dna: "Neon edges, low-poly wireframe, emissive grid, zero-fill cyber",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, texture, organic forms, painterly effects"
      }
    ]
  },
  {
    category: "4. Retro & Vintage",
    presets: [
      {
        name: "WPA Poster Art",
        basePrompt: "A professional vector illustration of [Subject]. WPA poster style, bold flat color planes, 3-color screen print aesthetic, heroic simplified silhouettes, strong horizontal-vertical composition, 1930s government art influence.",
        designIntent: "Replicate 1930s WPA-style poster art featuring heroic silhouettes and limited color palettes.",
        dna: "WPA planes, 3-color print, heroic silhouettes, 1930s layout",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, painterly effects"
      },
      {
        name: "Groovy 70s Retro",
        basePrompt: "A professional vector illustration of [Subject]. Groovy 1970s aesthetic, bubbly organic rounded forms, avocado and burnt orange palette, psychedelic swirls, flat chunky shapes, vintage sticker energy.",
        designIntent: "Evoke 1970s nostalgia through bubbly forms, psychedelic motifs, and warm retro colors.",
        dna: "Bubbly forms, warm retro palette, psychedelic swirls, vintage sticker",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, painterly effects"
      },
      {
        name: "Mid-Century Modern",
        basePrompt: "A professional vector illustration of [Subject]. Mid-century modern style, atomic age starbursts, amoeba shapes, muted mustard-teal-coral palette, Saul Bass graphic simplicity, 1950s poster layout.",
        designIntent: "Deliver mid-century abstraction utilizing atomic motifs and bold graphic simplicity.",
        dna: "Atomic starbursts, amoeba shapes, muted palette, Saul Bass simplicity",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, painterly effects"
      },
      {
        name: "Retro-Duo Grainy Flat",
        basePrompt: "A professional vector illustration of [Subject]. Vintage 70s retro-duo, two-color burnt orange and cream palette, rounded thick shapes, heavy stipple grain overlay, aged paper print simulation.",
        designIntent: "Combine a two-color retro palette with heavy stipple texturing for a distressed vintage feel.",
        dna: "Two-color retro, thick outlines, stipple grain, aged paper",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, organic forms, painterly effects"
      },
      {
        name: "Art Deco Geometric",
        basePrompt: "A professional vector illustration of [Subject]. Art Deco geometry, symmetrical gold-and-black composition, repeating sunbursts, sharp elongated vertical lines, stepped chevrons, 1920s luxury poster.",
        designIntent: "Design streamlined, symmetrical geometry inspired by 1920s luxury and Gatsby-era ornamentation.",
        dna: "Streamlined geometry, gold-black palette, Gatsby ornament, symmetry",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, painterly effects"
      }
    ]
  },
  {
    category: "5. Illustration & Comic",
    presets: [
      {
        name: "Corporate Memphis",
        basePrompt: "A professional vector illustration of [Subject]. Corporate Memphis flat style, exaggerated elongated limbs, diverse abstract figures, floating geometric shapes, startup editorial aesthetic, pastel-coral palette.",
        designIntent: "Generate a modern, friendly startup illustration featuring abstract proportions and flat geometry.",
        dna: "Exaggerated limbs, abstract shapes, startup aesthetic, pastel-coral palette",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, heavy shading, painterly effects"
      },
      {
        name: "Ligne Claire",
        basePrompt: "A professional vector illustration of [Subject]. Ligne Claire aesthetic, uniform medium-weight black outlines, flat color fills, zero shading, Hergé-inspired European comic illustration, clean readability.",
        designIntent: "Emulate classic European comics using uniform outlines and strictly flat color fills.",
        dna: "Uniform outlines, zero shading, flat fills, European comic clarity",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, painterly effects"
      },
      {
        name: "Thick Outline Pop",
        basePrompt: "A professional vector illustration of [Subject]. Thick outline pop art, ultra-bold black strokes, flat saturated primary colors, Ben-Day dot shading, high-contrast comic aesthetic, heavy ink energy.",
        designIntent: "Deliver high-impact pop art characterized by heavy ink strokes and primary color saturation.",
        dna: "Thick strokes, primary colors, Ben-Day dots, pop art contrast",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, painterly effects"
      },
      {
        name: "Kawaii Pastel",
        basePrompt: "A professional vector illustration of [Subject]. Kawaii pastel chibi style, ultra-rounded blobby shapes, oversized heads, pastel pink-mint-lavender palette, cute mascot aesthetic, zero sharp edges.",
        designIntent: "Create ultra-cute, friendly mascots utilizing hyper-rounded forms and soft pastel colors.",
        dna: "Ultra-rounded shapes, chibi proportions, pastel palette, mascot aesthetic",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, painterly effects"
      },
      {
        name: "Pop-Art Halftone",
        basePrompt: "A professional vector illustration of [Subject]. Roy Lichtenstein-inspired pop art, thick black outlines, vibrant primary fills, oversized Ben-Day halftone dot patterns, 1960s comic panel styling.",
        designIntent: "Recreate 1960s comic panels featuring prominent halftone dots and vibrant primary blocking.",
        dna: "Thick outlines, primary fills, oversized halftone dots, 1960s comic",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, painterly effects"
      },
      {
        name: "Rubberhose Retro-Toon",
        basePrompt: "A professional vector illustration of [Subject]. 1930s rubberhose animation style, pie-cut eyes, jointless limbs, thick black ink outlines, high-contrast black-and-white palette, bouncy vintage energy.",
        designIntent: "Revive 1930s vintage animation aesthetics utilizing jointless characters and high-contrast ink.",
        dna: "Pie-cut eyes, rubberhose limbs, thick ink, 1930s high-contrast",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, painterly effects"
      },
      {
        name: "Die-Cut Sticker",
        basePrompt: "A professional vector illustration of [Subject]. Die-cut vinyl sticker, thick clean white halo border, bold black inner outlines, bright flat solid colors, sticker-quality graphic clarity.",
        designIntent: "Produce a crisp vinyl sticker graphic featuring a defining white knockout border.",
        dna: "White halo border, bold inner outlines, flat colors, sticker clarity",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, painterly effects"
      },
      {
        name: "Sticker-Bomb Flat",
        basePrompt: "A professional vector illustration of [Subject]. Sticker-bomb composition, dense overlapping cartoon graphics, vibrant mixed palette, 2D flat icons, high-energy layered aesthetic.",
        designIntent: "Create a chaotic but cohesive layered aesthetic using overlapping flat sticker graphics.",
        dna: "Dense overlapping, mixed cartoon palette, flat icons, layered energy",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, painterly effects"
      },
      {
        name: "Streetwear Graphic",
        basePrompt: "A professional vector illustration of [Subject]. Streetwear screen-print graphic, bold high-contrast design, underground skate culture attitude, distressed outlines, limited color palette, t-shirt art.",
        designIntent: "Design edgy, high-contrast apparel graphics utilizing distressed lines and limited palettes.",
        dna: "High-contrast graphics, skate aesthetic, distressed lines, limited palette",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, painterly effects"
      },
      {
        name: "Urban Poster Portrait",
        basePrompt: "A professional vector illustration of [Subject]. Urban poster portrait, bold illustration, flat-shaded figures, thick dark outlines, dramatic high-contrast composition, gritty city attitude.",
        designIntent: "Render a dramatic urban portrait characterized by flat shading and thick, gritty outlines.",
        dna: "Bold portraiture, flat shading, thick outlines, gritty urban contrast",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, painterly effects"
      },
      {
        name: "Urban Ensemble Loading Screen",
        basePrompt: "A professional vector illustration of [Subject]. Urban loading screen ensemble, multiple figures in a bold city scene, thick outlines, flat color blocking per zone, retro-modern action poster.",
        designIntent: "Compose a dynamic multi-character action scene utilizing distinct flat color zones.",
        dna: "Multi-figure composition, thick outlines, flat blocking, action poster",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, painterly effects"
      }
    ]
  },
  {
    category: "6. Craft & flat color blocks",
    presets: [
      {
        name: "Papercut Layers",
        basePrompt: "A professional vector illustration of [Subject]. Multi-layer papercut, stacked flat silhouette layers, subtle layer separation, varying solid colors, craft-knife precision, shadowbox diorama depth.",
        designIntent: "Construct a digital diorama mimicking precision-cut, stacked paper silhouettes.",
        dna: "Stacked paper layers, layer separation, shadowbox depth, clean edges",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, organic forms, painterly effects"
      },
      {
        name: "Stained Glass Vector",
        basePrompt: "A professional vector illustration of [Subject]. Stained glass window aesthetic, thick solid black lead channel lines, vibrant translucent color segments, geometric mosaic composition, jewel-toned panes.",
        designIntent: "Simulate a cathedral stained glass aesthetic utilizing bold lead lines and jewel-toned fills.",
        dna: "Thick black lines, translucent segments, jewel-toned mosaic, cathedral style",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, organic forms, painterly effects"
      },
      {
        name: "Risograph Flat",
        basePrompt: "A professional vector illustration of [Subject]. Risograph print aesthetic, flat fluorescent pink and teal inks, intentional slight misregistration, coarse halftone screen, overlapping transparency.",
        designIntent: "Replicate the textured, imperfect charm of a risograph print with bold, overlapping inks.",
        dna: "Fluorescent inks, misregistration, coarse halftone, overlapping transparency",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, organic forms, painterly effects"
      },
      {
        name: "Monochrome Linocut",
        basePrompt: "A professional vector illustration of [Subject]. Linocut relief print, stark black-and-white, bold hand-carved gouge marks, rough organic cut edges, high-contrast old print aesthetic.",
        designIntent: "Produce a high-contrast relief print aesthetic characterized by rough, hand-carved textures.",
        dna: "Black-and-white relief, gouge marks, rough edges, high-contrast print",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, organic forms, painterly effects"
      },
      {
        name: "Etched Cross-Hatch",
        basePrompt: "A professional vector illustration of [Subject]. Copper engraving cross-hatch style, fine parallel hatching lines, perpendicular deep shading layers, precise intaglio etching, antique print quality.",
        designIntent: "Generate classical shading and depth utilizing strict cross-hatched line systems.",
        dna: "Fine parallel hatching, perpendicular cross-hatch, intaglio etching, antique print",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, organic forms, painterly effects"
      }
    ]
  },
  {
    category: "7. Sci-Fi & Cyberpunk",
    presets: [
      {
        name: "Cyberpunk Flat",
        basePrompt: "A professional vector illustration of [Subject]. Cyberpunk flat design, dystopian near-future cityscape, neon pink-cyan-yellow color blocking, razor-sharp shapes on black, layered kanji signage.",
        designIntent: "Deliver a striking cyberpunk visual relying on sharp geometry and neon flat color blocking.",
        dna: "Neon color blocking, razor-sharp shapes, kanji signage, dystopian urban",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, organic forms, painterly effects"
      },
      {
        name: "Vaporwave Wireframe",
        basePrompt: "A professional vector illustration of [Subject]. Vaporwave digital aesthetic, perspective grid floor, pixelated elements, pastel pink-lavender-teal palette, 1990s lo-fi nostalgia, retrowave composition.",
        designIntent: "Evoke 1990s digital nostalgia through perspective grids and a pastel retrowave palette.",
        dna: "Perspective grids, pastel palette, 1990s lo-fi, retrowave nostalgia",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, organic forms, painterly effects"
      },
      {
        name: "Glitch Vector",
        basePrompt: "A professional vector illustration of [Subject]. Digital glitch art, RGB channel offset ghosts, horizontal slice displacement, sharp geometric data corruption, chromatic aberration, system-failure visual.",
        designIntent: "Simulate high-tech digital failure using precise chromatic aberration and geometric tearing.",
        dna: "RGB offsets, slice displacement, data corruption, chromatic aberration",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, organic forms, painterly effects"
      },
      {
        name: "Neon Glitch Wireframe",
        basePrompt: "A professional vector illustration of [Subject]. Cyberpunk wireframe glitch, shattered low-poly mesh, distorted neon edge lines, purple-lime scan-line interference, fractured geometric data corruption.",
        designIntent: "Combine emissive wireframes with aggressive digital glitch textures and scan-lines.",
        dna: "Shattered wireframe, distorted neon edges, scan-line interference, data noise",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, organic forms, painterly effects"
      },
      {
        name: "Retro-Future Synthwave",
        basePrompt: "A professional vector illustration of [Subject]. Synthwave outrun aesthetic, chrome vanishing-point horizon, receding grid floor, electric blue-pink palette, stylized digital sunset, 1980s retro-future.",
        designIntent: "Capture the 1980s synthwave outrun aesthetic focusing on neon grids and infinite horizons.",
        dna: "Chrome horizons, receding grids, neon palette, 1980s outrun",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, organic forms, painterly effects"
      },
      {
        name: "Anamorphic Glitch",
        basePrompt: "A professional vector illustration of [Subject]. Anamorphic lens glitch, strong horizontal chromatic stretch, sharp cyan-magenta fringes, elongated light streaks, high-velocity digital tearing.",
        designIntent: "Mimic anamorphic lens distortions featuring stretched light streaks and heavy chromatic fringing.",
        dna: "Horizontal stretch, chromatic fringes, elongated streaks, digital tearing",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, organic forms, painterly effects"
      }
    ]
  },
  {
    category: "8. Abstract & Art",
    presets: [
      {
        name: "Abstract Blob-Work",
        basePrompt: "A professional vector illustration of [Subject]. Abstract biomorphic blobs, Matisse-inspired cutout shapes, overlapping translucent flat forms, muted earthy tones, generous white space, modern gallery poster.",
        designIntent: "Create flowing, organic abstraction using overlapping translucent shapes and natural palettes.",
        dna: "Biomorphic blobs, translucent cutouts, earthy tones, generous white space",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, organic forms, painterly effects"
      },
      {
        name: "Deconstructed Cubism",
        basePrompt: "A professional vector illustration of [Subject]. Cubist deconstruction, fragmented simultaneous viewpoints, angular flat color planes, Picasso influence, high-contrast earth tones and black, intersecting geometry.",
        designIntent: "Abstract the subject through fragmented, multi-perspective angular color planes.",
        dna: "Fragmented viewpoints, angular color planes, cubist geometry, high-contrast tones",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, organic forms, painterly effects"
      },
      {
        name: "Optical Op-Art",
        basePrompt: "A professional vector illustration of [Subject]. Op Art optical illusion, black-and-white repeating concentric lines, Bridget Riley influence, mathematical precision, illusory depth and motion.",
        designIntent: "Design precise, high-contrast geometric patterns that create illusions of depth and motion.",
        dna: "Black-and-white patterns, optical illusion, mathematical precision, perceptual motion",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, organic forms, painterly effects"
      },
      {
        name: "Biomorphic Abstract",
        basePrompt: "A professional vector illustration of [Subject]. Biomorphic abstraction, smooth flowing cellular forms, liquid path transitions, vibrant neon color blocking on white, surreal geometry.",
        designIntent: "Blend surreal, cellular flow aesthetics with sharp, vibrant color blocking.",
        dna: "Cellular forms, liquid transitions, neon color blocking, surreal geometry",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, organic forms, painterly effects"
      },
      {
        name: "Fluid Liquid Abstract",
        basePrompt: "A professional vector illustration of [Subject]. Fluid liquid abstraction, swirling amorphous forms, smooth color transitions, modern digital flow, curved contours, high-contrast energy.",
        designIntent: "Illustrate dynamic, liquid-like motion using swirling gradients and clean contours.",
        dna: "Swirling forms, liquid motion, smooth transitions, high-contrast flow",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, organic forms, painterly effects"
      },
      {
        name: "Geometric Minimalism",
        basePrompt: "A professional vector illustration of [Subject]. Geometric minimalism, clean lines, simple balanced shapes, muted color palette, generous white space, modern high-impact graphic design.",
        designIntent: "Achieve refined visual balance using strict geometric primitives and ample white space.",
        dna: "Clean lines, balanced shapes, muted palette, generous white space",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, organic forms, painterly effects"
      },
      {
        name: "Surrealist Collage",
        basePrompt: "A professional vector illustration of [Subject]. Surrealist collage, dreamlike unexpected object combinations, vintage poster elements, clean outlines, flat color fills, imaginative structured composition.",
        designIntent: "Combine disparate elements into a cohesive, dreamlike flat-color composition.",
        dna: "Dreamlike combinations, vintage elements, clean outlines, flat fills",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, organic forms, painterly effects"
      },
      {
        name: "Vibrant Gradient Flow",
        basePrompt: "A professional vector illustration of [Subject]. Vibrant gradient flow, smooth color transitions, energetic modern graphic design, clean contours, saturated playful palette, structured visual rhythm.",
        designIntent: "Generate an energetic, modern composition relying heavily on saturated, smooth gradient transitions.",
        dna: "Smooth transitions, vibrant palette, energetic flow, clean contours",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, organic forms, painterly effects"
      }
    ]
  },
  {
    category: "9. Traditional & Cultural",
    presets: [
      {
        name: "Ukiyo-e Modern",
        basePrompt: "A professional vector illustration of [Subject]. Modern Ukiyo-e woodblock print, clean bold black outlines, flat muted indigo-ochre-salmon planes, atmospheric layered bands, classic Japanese motifs.",
        designIntent: "Modernize classic Japanese woodblock prints utilizing bold linework and muted natural palettes.",
        dna: "Woodblock outlines, muted indigo-ochre palette, atmospheric bands, Japanese motifs",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, organic forms, painterly effects"
      },
      {
        name: "Folklore Decorative",
        basePrompt: "A professional vector illustration of [Subject]. Folk art decoration, mirror-symmetrical botanical motifs, bold vibrant red-green-yellow palette, stylized floral forms, structured Eastern European ornament.",
        designIntent: "Produce vibrant, symmetrical folk art patterns featuring highly stylized floral geometry.",
        dna: "Symmetrical botanicals, vibrant folk palette, stylized florals, structured ornament",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, organic forms, painterly effects"
      },
      {
        name: "Celtic Knotwork Emblem",
        basePrompt: "A professional vector illustration of [Subject]. Celtic interlace knotwork, continuous over-under weaving strands, bilateral symmetry, precise clean linework, illuminated manuscript emblem.",
        designIntent: "Construct precise, continuous weaving patterns typical of classic Celtic manuscript emblems.",
        dna: "Weaving strands, bilateral symmetry, precise linework, manuscript emblem",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, organic forms, painterly effects"
      },
      {
        name: "Minimalist Zen Ink",
        basePrompt: "A professional vector illustration of [Subject]. Sumi-e inspired minimalism, bold black calligraphic brushstrokes, high-pressure tapering, strong white negative space, meditative zen ink aesthetic.",
        designIntent: "Capture the elegance of traditional sumi-e wash using tapered, vector-based calligraphic strokes.",
        dna: "Calligraphic strokes, tapering paths, negative space, zen ink aesthetic",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, organic forms, painterly effects"
      },
      {
        name: "Celtic Knotwork Dense Field",
        basePrompt: "A professional vector illustration of [Subject]. Celtic interlace field, complex interlocking continuous strands, dense all-over knot coverage, sharp clean strokes, zero strand breaks.",
        designIntent: "Generate a dense, unbroken field of complex interlocking Celtic knots.",
        dna: "Interlocking strands, dense knot coverage, sharp strokes, zero breaks",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, organic forms, painterly effects"
      },
      {
        name: "Luxury Gold Filigree",
        basePrompt: "A professional vector illustration of [Subject]. Luxury gold filigree, intricate symmetrical scrollwork, curling flourishes, engraved botanical aesthetics, deep black background, prestige brand rendering.",
        designIntent: "Design highly detailed, symmetrical golden scrollwork suited for luxury and prestige branding.",
        dna: "Gold scrollwork, symmetrical flourishes, engraved botanicals, prestige aesthetic",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, organic forms, painterly effects"
      }
    ]
  },
  {
    category: "10. Paper Craft & Origami",
    presets: [
      {
        name: "Origami Fold",
        basePrompt: "A professional vector illustration of [Subject]. Origami folded paper, crisp sharp crease lines, angular folded faces, flat matte color per face, minimalist paper craft, generous white space.",
        designIntent: "Simulate crisp origami folds using geometric faces and distinct matte coloring.",
        dna: "Crisp creases, angular faces, matte colors, minimalist paper craft",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, organic forms, painterly effects"
      },
      {
        name: "Origami Geometric",
        basePrompt: "A professional vector illustration of [Subject]. Geometric origami, complex angular folding planes, precise crease geometry, varied flat matte colors for depth, professional paper construction.",
        designIntent: "Build complex paper depth utilizing advanced, multi-plane geometric origami folds.",
        dna: "Angular planes, precise creases, matte color depth, complex geometry",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, organic forms, painterly effects"
      },
      {
        name: "Layered Papercut Surface",
        basePrompt: "A professional vector illustration of [Subject]. Layered papercut surface, horizontal paper strip marks, soft lumpy geometry, handmade folk art aesthetic, muted earthy palette, structured tactile depth.",
        designIntent: "Emulate a handmade, layered paper surface featuring soft geometry and visible strip marks.",
        dna: "Paper strips, soft geometry, handmade aesthetic, muted palette",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, organic forms, painterly effects"
      },
      {
        name: "Layered Papercut Figure",
        basePrompt: "A professional vector illustration of [Subject]. Layered papercut figure, organic layered forms, visible torn paper blocks, sequential layer build-up, muted earthy palette, folk art visual.",
        designIntent: "Construct characters or figures using distinct, organically torn paper layer buildups.",
        dna: "Organic layers, torn paper blocks, sequential build-up, folk art aesthetic",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, organic forms, painterly effects"
      },
      {
        name: "Flat Papercut Collage",
        basePrompt: "A professional vector illustration of [Subject]. Papercut collage, varied flat shapes, overlapping silhouettes in solid colors, mixed torn-and-cut edges, casual handmade energy.",
        designIntent: "Assemble a casual, energetic composition using mixed torn and cleanly cut paper silhouettes.",
        dna: "Varied shapes, overlapping silhouettes, mixed edges, collage energy",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, organic forms, painterly effects"
      },
      {
        name: "Scenic Layered Papercut",
        basePrompt: "A professional vector illustration of [Subject]. Scenic layered papercut, stacked silhouette landscapes, distinct flat color per layer, clean craft-knife edges, progressive diorama depth illusion.",
        designIntent: "Create deep scenic landscapes utilizing progressively stacked, distinct paper silhouettes.",
        dna: "Stacked landscapes, distinct layer colors, clean edges, diorama depth",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, organic forms, painterly effects"
      },
      {
        name: "Kirigami Cutout",
        basePrompt: "A professional vector illustration of [Subject]. Kirigami paper cutting, intricate negative-space patterns, highly symmetrical cutout design, stark white on colored background, precise die-cut lines.",
        designIntent: "Generate highly intricate, symmetrical geometric patterns emphasizing precise negative-space cutouts.",
        dna: "Negative-space cutouts, symmetrical patterns, white on color, precise die-cuts",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, organic forms, painterly effects"
      },
      {
        name: "Offset Stacked Papercut",
        basePrompt: "A professional vector illustration of [Subject]. Stacked papercut geometry, multiple flat silhouette layers, slight offset for shadow depth, bold composition, distinct flat colors, clean cuts.",
        designIntent: "Highlight artificial depth by slightly offsetting stacked, cleanly cut paper silhouettes.",
        dna: "Silhouette layers, depth offsets, distinct colors, clean cuts",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, organic forms, painterly effects"
      },
      {
        name: "Shadowbox Papercut",
        basePrompt: "A professional vector illustration of [Subject]. Shadowbox papercut, heavy-gauge paper silhouette stacks, pronounced layer separation, bold contrasting colors, dramatic diorama lighting, sharp edges.",
        designIntent: "Maximize depth and drama by simulating heavy-gauge paper separated in a lit shadowbox.",
        dna: "Heavy-gauge stacks, pronounced separation, dramatic diorama, sharp edges",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, organic forms, painterly effects"
      }
    ]
  },
  {
    category: "11. General Styles",
    presets: [
      {
        name: "Minimalist Line Art",
        basePrompt: "A professional vector illustration of [Subject]. Minimalist line art, clean single-weight black lines, generous white space, elegant simple forms, modern high-contrast aesthetic.",
        designIntent: "Deliver pure, elegant simplicity using unbroken single-weight linework and ample negative space.",
        dna: "Single-weight lines, generous white space, elegant forms, modern aesthetic",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, painterly effects"
      },
      {
        name: "Bold Geometric",
        basePrompt: "A professional vector illustration of [Subject]. Bold geometric design, strong primitive shapes, clean lines, vibrant palette, balanced modern composition, high visual impact.",
        designIntent: "Construct impactful modern graphics utilizing strong geometric primitives and vibrant colors.",
        dna: "Strong shapes, clean lines, vibrant palette, modern impact",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, painterly effects"
      },
      {
        name: "Soft Gradient",
        basePrompt: "A professional vector illustration of [Subject]. Soft gradient aesthetic, smooth color transitions, subtle elegance, modern UI influence, clean professional visual flow.",
        designIntent: "Establish a smooth, elegant visual flow utilizing pristine gradient transitions without harsh edges.",
        dna: "Smooth transitions, subtle elegance, UI influence, professional flow",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, texture, painterly effects"
      },
      {
        name: "Vibrant Pop",
        basePrompt: "A professional vector illustration of [Subject]. Vibrant pop aesthetic, bold energetic colors, high contrast, comic-inspired graphic design, clean linework, high visual energy.",
        designIntent: "Inject extreme energy and playfulness into subjects using highly saturated, comic-inspired pop colors.",
        dna: "Bold colors, energetic contrast, comic-inspired, clean linework",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, painterly effects"
      },
      {
        name: "Retro Synthwave",
        basePrompt: "A professional vector illustration of [Subject]. Retro synthwave style, 1980s neon aesthetics, grid patterns, nostalgic futuristic mood, structured graphic design.",
        designIntent: "Evoke 1980s retro-futurism utilizing neon color palettes and structured grid lines.",
        dna: "1980s neon, grid patterns, nostalgic mood, structured design",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, painterly effects"
      },
      {
        name: "Precision Monolith",
        basePrompt: "A professional vector illustration of [Subject]. Precision monolith, mathematically precise paths, zero-gap terminals, massive geometric scale, high-tech pristine vector finish.",
        designIntent: "Design imposing, flawless geometric structures characterized by mathematical path precision.",
        dna: "Precise paths, zero-gap terminals, monolithic scale, high-tech finish",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, painterly effects"
      }
    ]
  },
  {
    category: "12. graphic design & Experimental",
    presets: [
      {
        name: "Noir High-Contrast",
        basePrompt: "A professional vector illustration of [Subject]. Noir graphic design, extreme high-contrast duality, deep black shading blocks, razor-sharp white highlights, dramatic moody silhouettes.",
        designIntent: "Create a dramatic, cinematic mood utilizing strictly binary black-and-white tonal contrast.",
        dna: "High-contrast duality, deep black blocks, sharp white highlights, noir silhouettes",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, painterly effects"
      },
      {
        name: "Cyberpunk Glitch",
        basePrompt: "A professional vector illustration of [Subject]. Cyberpunk glitch art, anamorphic lens flares, severe chromatic aberration, neon cyan-magenta mapping, high-velocity digital tearing, sharp geometric fragments.",
        designIntent: "Simulate an aggressive digital malfunction leveraging chromatic aberration and geometric tearing.",
        dna: "Chromatic aberration, cyan-magenta mapping, digital tearing, sharp fragments",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, painterly effects"
      },
      {
        name: "Epic Scale Monolith",
        basePrompt: "A professional vector illustration of [Subject]. Epic scale monolith, massive geometric planes, atmospheric perspective, grand sci-fi composition, tiny human for scale, awe-inspiring depth.",
        designIntent: "Establish a grand sense of awe and massive scale using towering geometry and atmospheric depth.",
        dna: "Massive planes, atmospheric perspective, sci-fi scale, deep framing",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, painterly effects"
      },
      {
        name: "Technicolor Poster",
        basePrompt: "A professional vector illustration of [Subject]. Technicolor poster design, mid-century cinema aesthetic, ultra-vibrant hyper-saturated palette, bold primary blocking, golden age movie look.",
        designIntent: "Replicate the hyper-saturated, primary-heavy look of golden age mid-century cinematic posters.",
        dna: "Ultra-vibrant palette, bold blocking, mid-century cinema, golden age",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, painterly effects"
      },
      {
        name: "Ethereal Dreamscape",
        basePrompt: "A professional vector illustration of [Subject]. Ethereal dreamscape, soft layered gradients, atmospheric fog, surreal aesthetic, deep emotional resonance, gentle color palette, clean shape separation.",
        designIntent: "Evoke a soft, emotional dream state utilizing layered atmospheric gradients and gentle colors.",
        dna: "Layered gradients, atmospheric fog, surreal mood, ethereal palette",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, painterly effects"
      },
      {
        name: "Action Frame Velocity",
        basePrompt: "A professional vector illustration of [Subject]. Action frame velocity, directional motion streaks, exaggerated wide-angle perspective, high-speed sequence, dynamic framing, high-energy graphic lines.",
        designIntent: "Capture high-speed kinetic energy through exaggerated perspectives and directional motion lines.",
        dna: "Motion streaks, wide-angle perspective, high-speed sequence, dynamic framing",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, painterly effects"
      },
      {
        name: "Gothic Horror Shading",
        basePrompt: "A professional vector illustration of [Subject]. Gothic horror aesthetic, eerie high-contrast flat tones, dark charcoal and crimson palette, sharp edge definition, bone-white highlights, macabre graphics.",
        designIntent: "Deliver a macabre, unsettling aesthetic using strict high-contrast dark palettes and sharp highlights.",
        dna: "Eerie contrast, dark palette, sharp edges, bone highlights, macabre",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, painterly effects"
      },
      {
        name: "Golden Hour Glow",
        basePrompt: "A professional vector illustration of [Subject]. Golden hour glow, magic hour flat graphic tones, long soft shading, rich amber color scheme, warm backlighting, sun-drenched aesthetic.",
        designIntent: "Simulate a cinematic, sun-drenched magic hour using rich amber tones and long, soft shading.",
        dna: "Magic hour tones, long soft shading, amber palette, warm backlighting",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, painterly effects"
      },
      {
        name: "Interstellar Void",
        basePrompt: "A professional vector illustration of [Subject]. Interstellar void aesthetic, deep space visuals, gravitational distortion arcs, extreme tonal contrast, sci-fi event composition, sharp geometric light.",
        designIntent: "Visualize high-impact cosmic anomalies using extreme contrast and geometric gravitational distortions.",
        dna: "Deep space, distortion arcs, extreme contrast, cosmic composition",
        aspectRatio: "1:1",
        negativePrompt: "photo, 3d render, realism, gradients, texture, painterly effects"
      }
    ]
  }
];

const CATEGORY_RENAMES: Record<string, string> = {
  "1. UI & Web": "1. UI & Web",
  "2. Minimalist & Flat": "2. Minimalist & Flat",
  "3. Geometric & Dimensional": "3. Geometric & Dimensional",
  "4. Retro & Vintage": "4. Retro & Vintage",
  "5. Illustration & Comic": "5. Illustration & Comic",
  "6. Craft & flat color blocks": "6. Craft & flat color blocks",
  "7. Sci-Fi & Cyberpunk": "7. Sci-Fi & Cyberpunk",
  "8. Abstract & Art": "8. Abstract & Art",
  "9. Traditional & Cultural": "9. Traditional & Cultural",
  "10. Paper Craft & Origami": "10. Paper Craft & Origami",
  "11. General Styles": "11. General Styles",
  "12. graphic design & Experimental": "12. graphic design & Experimental"
};

// --- THE NEGATIVE MATRIX ---

// 1. Global: Absolute non-negotiables for ALL vector work
const GLOBAL_NEGATIVES = "photo, photography, 3d render, realism, texture, noise, blur, depth of field, photographic, painterly, brush strokes, canvas grain, volumetric lighting, subsurface scattering";

// 2. Category-Specific: Prevents entire genres of "error"
const CATEGORY_NEGATIVES: Record<string, string> = {
  "1. UI & Web": "heavy shadows, complex textures, organic chaos, messy edges, perspective distortion",
  "2. Minimalist & Flat": "gradients, shading, 3d effects, bevels, emboss, drop shadows, depth",
  "3. Geometric & Dimensional": "organic forms, soft edges, fluid blobs, hand-drawn feel",
  "4. Retro & Vintage": "modernist digital aesthetic, high-tech, neon, ultra-sharp 4k rendering",
  "5. Illustration & Comic": "hyper-realism, cinematic lighting, realistic skin textures, photorealistic faces",
  "6. Craft & flat color blocks": "digital smooth gradients, photographic textures, high-gloss",
  "7. Sci-Fi & Cyberpunk": "naturalism, pastoral scenes, soft lighting, vintage organic aesthetic",
  "8. Abstract & Art": "representational realism, literal depictions, recognizable objects (unless specified)",
  "9. Traditional & Cultural": "modern digital UI, sci-fi elements, futuristic tech",
  "10. Paper Craft & Origami": "liquid textures, metal, plastic, glass, smooth digital gradients",
  "11. General Styles": "photographic noise, 3d models, depth of field",
  "12. graphic design & Experimental": "standard layouts, traditional composition, boring symmetry"
};

// 2. Prompt Stabilizer (clean up text only, no style injection)
const appendPromptDetails = (basePrompt: string): string => {
  return basePrompt
    .replace(/\b2D flat graphic\b/gi, "")
    .replace(/\s+,/g, ",")
    .replace(/,\s*,/g, ",")
    .replace(/\s{2,}/g, " ")
    .trim()
    .replace(/,\s*$/, "");
};

// 3. UI Accessibility Hints (Kept intact for your frontend display)
const buildAccessibilityNote = (preset: Preset, category: string): string => {
  const joined = `${category} ${preset.name} ${preset.basePrompt || ""}`.toLowerCase();

  if (joined.includes("high contrast") || joined.includes("black on white")) {
    return "High-contrast shapes and simplified structure improve readability for low-vision users.";
  }
  if (joined.includes("ui") || joined.includes("infographic") || joined.includes("grid")) {
    return "Clear hierarchy and structured spacing help users scan information quickly and accurately.";
  }
  if (joined.includes("monoline") || joined.includes("line art")) {
    return "Consistent stroke logic helps preserve legibility across small and large display sizes.";
  }
  if (joined.includes("papercut") || joined.includes("origami") || joined.includes("kirigami")) {
    return "Distinct layer separation supports clearer edge recognition and shape perception.";
  }
  if (joined.includes("glitch") || joined.includes("cyberpunk") || joined.includes("neon")) {
    return "Strong foreground-background contrast helps intense color effects remain more readable on dark themes.";
  }

  return "Simplified forms and controlled contrast improve general visual clarity across digital and print use.";
};

// 4. UI Aspect Ratio Hints (Kept intact for your frontend display)
const buildAspectRatioHints = (category: string): Readonly<Record<string, string>> => {
  if (category.includes("UI & Web")) {
    return Object.freeze({
      "16:9": "wide dashboard layout, horizontal content zones, generous side margins",
      "4:5": "tall product card composition, stacked information hierarchy, mobile-friendly framing",
      "3:4": "editorial tablet-style layout, balanced vertical blocks, clear typographic containers",
      "9:16": "mobile-first vertical UI, full-height content stream, bottom-heavy interaction zone"
    });
  }

  if (category.includes("Illustration & Comic") || category.includes("Sci-Fi & Cyberpunk")) {
    return Object.freeze({
      "16:9": "graphic design wide composition, lateral motion, background elements spread across frame",
      "4:5": "poster-style portrait crop, strong vertical focal hierarchy, centered hero emphasis",
      "3:4": "classic book-style portrait illustration, balanced background depth, focused subject framing",
      "9:16": "strong vertical reel-style composition, soaring vertical perspective, dynamic top-to-bottom energy"
    });
  }

  if (category.includes("Paper Craft & Origami") || category.includes("Craft & flat color blocks")) {
    return Object.freeze({
      "16:9": "wide layered diorama layout, foreground-midground-background separation",
      "4:5": "tall craft poster framing, stacked layers rising vertically, centered handcrafted subject",
      "3:4": "balanced flat vector shading-box portrait framing, layered craft depth, focused textural details",
      "9:16": "tall vertical paper sculpture, ascending layered composition, mobile wallpaper aesthetic"
    });
  }

  return Object.freeze({
    "16:9": "wide landscape layout, balanced negative space, horizontal composition flow",
    "4:5": "tall editorial framing, centered focal subject, vertical composition emphasis",
    "3:4": "classic vertical art print framing, balanced focal weight, standard portrait layout",
    "9:16": "ultra-tall vertical composition, strong verticality, mobile-optimized framing"
  });
};

// 5. Final Preset Compiler (Thin and direct)
const refinePreset = <T extends Preset>(preset: T, category: string): Readonly<T> => {
  // 1. Build the Hierarchical Negative Prompt
  const catNegatives = CATEGORY_NEGATIVES[category] || "";
  const presetNegatives = preset.negativePrompt || "";
  
  // Clean and merge the matrix
  const masterNegativePrompt = [
    GLOBAL_NEGATIVES,
    catNegatives,
    presetNegatives
  ].filter(Boolean).join(", ");

  // 2. Determine logic-based defaults
  const isExperimental = category.includes("Experimental") || category.includes("Abstract");
  const isCrafty = category.includes("Paper") || category.includes("Craft");

  const defaultIntent = isExperimental 
    ? "Creative focus on adaptive geometry and experimental flat color blocks."
    : isCrafty
    ? "Focus on layered depth, visual edges, and material flat color blocks."
    : "Consistent geometric and vector enforcement for a clean graphic finish.";

  const defaultDna = isCrafty
    ? "Distinct layered construction, believable flat vector shading, material feel."
    : "Clean vector paths, sharp edges, solid color blocking, professional graphic finish.";

  return Object.freeze({
    ...preset,
    designIntent: preset.designIntent || defaultIntent,
    dna: preset.dna || defaultDna,
    basePrompt: appendPromptDetails(preset.basePrompt || ""),
    negativePrompt: masterNegativePrompt,
    accessibilityNote: buildAccessibilityNote(preset, category),
    altAspectRatios: Object.freeze(["16:9", "4:5", "3:4", "9:16"]),
    ratioPromptHints: buildAspectRatioHints(category),
    system: true,
    locked: true
  } as T);
};

export const VECTOR_PRESETS: readonly Readonly<PresetCategory>[] = Object.freeze(
  rawVectorPresets.map((cat) => {
    const renamedCategory = CATEGORY_RENAMES[cat.category] ?? cat.category;

    return Object.freeze({
      category: renamedCategory,
      presets: Object.freeze(cat.presets.map((preset) => refinePreset(preset, renamedCategory))) as readonly Preset[]
    });
  })
);
