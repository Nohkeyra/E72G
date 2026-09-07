import { GoogleGenAI, GenerateContentResponse } from '@google/genai';

/**
 * Valid Aspect Ratios for Gemini Image Generation
 */
const VALID_ASPECT_RATIOS = ['1:1', '3:4', '4:3', '9:16', '16:9'] as const;
type AspectRatio = typeof VALID_ASPECT_RATIOS[number];

function normalizeAspectRatio(ratio?: string): AspectRatio {
  if (ratio && VALID_ASPECT_RATIOS.includes(ratio as AspectRatio)) {
    return ratio as AspectRatio;
  }
  return '1:1';
}

const DEFAULT_GEMINI_KEY = 'AIzaSyCUvwDsFotH6xez4SqxfkKn27A1HJYunOo';

/**
 * Clean API Key Retrieval
 */
function getApiKey(apiKeyOverride?: string): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const key = apiKeyOverride || (process.env as any).GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY || (import.meta as any).env?.VITE_API_KEY || DEFAULT_GEMINI_KEY;
  if (!key || key === 'AIzaSyCUvwDsFotH6xez4SqxfkKn27A1HJYunOo') {
    throw new Error("Gemini API key is required. Please tap Settings (gear icon) and enter your Gemini API key.");
  }
  return key;
}

/**
 * Clean GoogleGenAI Client Factory
 * Modern @google/genai SDK configuration with AI Studio User-Agent telemetry.
 */
function createAiClient(apiKeyOverride?: string): GoogleGenAI {
  const apiKey = getApiKey(apiKeyOverride);
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

/**
 * IDEOGRAM 3.0 / VORTEX RENDERING ENGINE INSTRUCTIONS
 */
const VORTEX_SYSTEM_INSTRUCTION = `[IDEOGRAM 3.0 / VORTEX RENDERING ENGINE]
[ROLE: ELITE GRAPHIC DESIGNER & ARCHITECTURAL RENDERER]

You are a high-performance visual synthesis engine specialized in extreme-fidelity graphic identity, layout design, and typography.
Your primary mandate is LITERAL TRANSLATION of the provided concept into a professional visual asset.

OPERATIONAL PARAMETERS:
1. IMAGE-STYLE COUPLING: If a reference image is provided, your MISSION-CRITICAL task is to synthesize the final output by grafting the new content onto the visual DNA of the reference. Maintain lighting, material, and compositional properties of the reference.
2. LITERAL FIDELITY: Follow every keyword in the prompt with 100% precision. Zero creative drift unless requested.
3. CINEMATIC AUTHORITY: Use professional studio lighting (softbox, rim, backlighting) and intentional focal depth.
4. MATERIAL INTEGRITY: Physics-accurate material representation (Glass, Chrome, Matte, Liquid, Iridescent).
5. COMPOSITIONAL INTENT: Subject-first hierarchy. Rule of thirds or centered symmetry based on type.

[TYPOGRAPHY_LOGIC]: When generating text or layout coordinates, maintain razor-sharp font edges. Verify character count with extreme precision. 
If 3D is requested, use high IOR (Index of Refraction) and caustic reflections. 
If 2D is requested, use vector-smooth curves and clean silhouettes.`;

/**
 * Check if error is a 404 / Model Not Found error
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isNotFoundError(error: any): boolean {
  if (!error) return false;
  const msg = (error?.message || String(error)).toUpperCase();
  const status = error?.status || error?.statusCode || error?.code || error?.response?.status;
  return (
    status === 404 ||
    status === '404' ||
    msg.includes('404') ||
    msg.includes('NOT_FOUND') ||
    msg.includes('NOT FOUND') ||
    msg.includes('REQUESTED ENTITY WAS NOT FOUND') ||
    msg.includes('UNSUPPORTED MODEL') ||
    msg.includes('IS NOT FOUND') ||
    msg.includes('NOT SUPPORTED')
  );
}

/**
 * Extract image data from GenerateContentResponse
 * Extracts generated image from inlineData returned in candidate parts.
 */
function extractImageFromResponse(response: GenerateContentResponse): string | null {
  // 1. Check for inlineData binary image in candidate parts
  const candidates = response.candidates || [];
  for (const candidate of candidates) {
    const parts = candidate.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        const mime = part.inlineData.mimeType || 'image/png';
        return `data:${mime};base64,${part.inlineData.data}`;
      }
    }
  }

  // 2. Check if the text output contains an SVG markup or data URI
  const text = response.text || '';
  if (text) {
    // Check for inline data URI
    const dataUriMatch = text.match(/data:image\/(?:png|jpeg|webp|svg\+xml);base64,[A-Za-z0-9+/=]+/);
    if (dataUriMatch) {
      return dataUriMatch[0];
    }

    // Check for SVG markup and encode as data URL
    const svgMatch = text.match(/<svg[\s\S]*?<\/svg>/i);
    if (svgMatch) {
      const encodedSvg = encodeURIComponent(svgMatch[0])
        .replace(/'/g, '%27')
        .replace(/"/g, '%22');
      return `data:image/svg+xml;charset=utf-8,${encodedSvg}`;
    }
  }

  return null;
}

export async function callGemini(args: {
  model: string;
  prompt: string;
  base64Image?: string;
  mimeType?: string;
  aspectRatio?: string;
  imageSize?: string;
  apiKeyOverride?: string;
  signal?: AbortSignal;
}): Promise<{ image?: string; text?: string; modelUsed: string }> {
  const { prompt, base64Image, mimeType, aspectRatio, apiKeyOverride } = args;

  const ai = createAiClient(apiKeyOverride);
  const selectedAspectRatio = normalizeAspectRatio(aspectRatio);

  let lastError: unknown = null;

  // Multimodal Gemini synthesis pipeline using Gemini 3.6 Flash
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parts: any[] = [];

  if (base64Image && mimeType) {
    const formattedBase64 = base64Image.includes(",") ? base64Image.split(",")[1] : base64Image;
    parts.push({
      inlineData: {
        data: formattedBase64,
        mimeType: mimeType
      }
    });

    parts.push({
      text: `[STYLE_REFERENCE_DETECTED] Follow the visual DNA of the attached reference image.\n[CONTENT_INSTRUCTION]: ${prompt}`
    });
  } else {
    parts.push({ text: prompt });
  }

  const targetModels = [
    'gemini-2.5-flash-image',
    'gemini-3.1-flash-lite-image',
    'gemini-3.1-flash-image'
  ];

  for (const targetModel of targetModels) {
    try {
      let response: GenerateContentResponse | null = null;
      try {
        response = await ai.models.generateContent({
          model: targetModel,
          contents: { parts },
          config: {
            systemInstruction: VORTEX_SYSTEM_INSTRUCTION,
            imageConfig: {
              aspectRatio: selectedAspectRatio
            }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any
        });
      } catch (modalityErr) {
        console.warn(`[GEMINI ENGINE] imageConfig on '${targetModel}' warning. Trying with responseModalities...`, modalityErr);
        response = await ai.models.generateContent({
          model: targetModel,
          contents: { parts },
          config: {
            systemInstruction: VORTEX_SYSTEM_INSTRUCTION,
            responseModalities: ["IMAGE", "TEXT"]
          }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);
      }

      if (response) {
        const extractedImage = extractImageFromResponse(response);
        if (extractedImage) {
          return {
            image: extractedImage,
            modelUsed: targetModel
          };
        }
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      lastError = error;
      const msg = error?.message || String(error);

      if (msg.includes("401") || msg.includes("invalid") || msg.includes("API key not valid")) {
        throw new Error(`Invalid Gemini API key. Please check your key in Settings.`, { cause: error });
      }

      if (msg.includes("429") || msg.includes("Quota") || msg.includes("RESOURCE_EXHAUSTED")) {
        console.warn(`[GEMINI ENGINE] Rate limit (429) encountered on '${targetModel}'.`);
        throw new Error("Free tier daily quota or rate limit reached. Please wait a moment before trying again.", { cause: error });
      }

      console.warn(`[GEMINI ENGINE] Model '${targetModel}' attempt issue: ${msg}. Trying next fallback...`);
      continue;
    }
  }

  // Safety net: Try imagen-3.0-generate-002 if the user's key supports Imagen
  try {
    const imagenFallback = await ai.models.generateImages({
      model: 'imagen-3.0-generate-002',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: selectedAspectRatio,
      }
    });

    if (imagenFallback.generatedImages?.[0]?.image?.imageBytes) {
      const b64 = imagenFallback.generatedImages[0].image.imageBytes;
      return {
        image: `data:image/jpeg;base64,${b64}`,
        modelUsed: 'imagen-3.0-generate-002'
      };
    }
  } catch (imgErr) {
    console.warn('[GEMINI ENGINE] Imagen 3 fallback also skipped:', imgErr);
  }

  if (lastError) {
    const errorString = lastError instanceof Error ? lastError.message : String(lastError);
    if (errorString.includes("429") || errorString.includes("RESOURCE_EXHAUSTED") || errorString.includes("Rate limit")) {
      throw new Error("Free tier daily quota or rate limit reached. Please wait a moment before trying again.");
    }
    if (errorString.includes("401") || errorString.includes("invalid") || errorString.includes("API key not valid")) {
      throw new Error("Invalid Gemini API key. Please check your key in Settings.");
    }
    throw new Error(`Synthesis error: ${errorString}`);
  }

  throw new Error("Gemini Image engine was unable to produce an image. Please verify your prompt or API key.");
}

/**
 * Lightweight Connection & Diagnostic Check
 */
export async function checkGeminiConnection(apiKeyOverride?: string): Promise<{ success: boolean; latency: number; details: string }> {
  const start = Date.now();
  try {
    const ai = createAiClient(apiKeyOverride);
    const candidateModels = ['gemini-2.5-flash', 'gemini-2.5-flash-image'];
    
    let lastResponse: GenerateContentResponse | null = null;
    for (const model of candidateModels) {
      try {
        lastResponse = await ai.models.generateContent({
          model,
          contents: "ping"
        });
        if (lastResponse?.text) break;
      } catch (e) {
        if (isNotFoundError(e)) continue;
        throw e;
      }
    }
    
    const latency = Date.now() - start;
    if (lastResponse?.text) {
      return { 
        success: true, 
        latency, 
        details: 'Connected to Gemini API' 
      };
    }
    return { success: false, latency, details: 'Empty Response' };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    const latency = Date.now() - start;
    let details = err.message || String(err);
    if (details.includes('401') || details.includes('key not valid') || details.includes('invalid')) details = 'Invalid API Key';
    else if (details.includes('429')) details = 'Rate Limited (Please wait a moment)';
    
    return { success: false, latency, details };
  }
}

/**
 * Image Structure Analysis using Gemini 3.8 Flash
 */
export async function analyzeImage(
  base64Image: string, 
  mimeType: string, 
  activeTab: string = 'vectorize',
  apiKeyOverride?: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  signal?: AbortSignal
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  const ai = createAiClient(apiKeyOverride);
  const formattedBase64 = base64Image.includes(",") ? base64Image.split(",")[1] : base64Image;

  const promptText = activeTab === 'vectorize'
    ? `Role: You are a Vector Graphics & Visual Morphology Auditor. Analyze the uploaded reference image for precision 2D vectorization.
Extract:
1. "name": A concise vector style name (e.g. "Flat Geometric Vector", "Minimalist Dual-Tone Vector", "Modern Mascot Vector")
2. "basePrompt": A descriptive, high-precision visual directive capturing the subject's exact silhouette, geometry, dominant forms, and flat color blocks for vector generation
3. "negativePrompt": Elements to strictly avoid (photorealistic shading, grainy textures, realistic 3D volume, photo noise, complex gradients)
4. "aspectRatio": "1:1"
5. "dnaWeight": 95
6. "textureIntensity": 0
Return strict JSON: { "name": string, "basePrompt": string, "negativePrompt": string, "aspectRatio": "1:1", "dnaWeight": number, "textureIntensity": number }`
    : `Role: You are a Structural Design Auditor. Define the artistic style as a JSON object. Focus on ${activeTab === "logo design" ? "LOGO DESIGN" : "GRAPHIC ILLUSTRATION"} elements.
Return a JSON object: { "name": string, "basePrompt": string, "negativePrompt": string, "aspectRatio": "1:1", "dnaWeight": number, "textureIntensity": number }`;

  const candidateModels = ['gemini-3.8-flash', 'gemini-2.5-flash'];

  for (const model of candidateModels) {
    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model,
        contents: {
          parts: [
            {
              inlineData: {
                data: formattedBase64,
                mimeType: mimeType || 'image/png'
              }
            },
            { text: promptText }
          ]
        },
        config: {
          systemInstruction: "You are an expert design auditor who analyzes images and outputs strict JSON specifications."
        }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      const text = response.text || "";
      if (!text) throw new Error("No analysis generated");

      const parseAIJSON = (str: string) => {
        try {
          return JSON.parse(str);
        } catch (e) {
          const match = str.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
          if (match && match[1]) return JSON.parse(match[1]);
          throw e;
        }
      };
      return parseAIJSON(text);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (isNotFoundError(error)) {
        continue;
      }
      console.error("Analysis Error:", error);
      throw error;
    }
  }

  throw new Error("Unable to analyze image with available models.");
}

/**
 * Direct Vector Subject Analysis with Gemini 3.8 Flash
 */
export async function analyzeVectorSubject(
  base64Image: string,
  mimeType: string,
  apiKeyOverride?: string
): Promise<{ description: string; colors: string; shapes: string } | null> {
  const ai = createAiClient(apiKeyOverride);
  const formattedBase64 = base64Image.includes(",") ? base64Image.split(",")[1] : base64Image;

  const candidateModels = ['gemini-3.8-flash', 'gemini-2.5-flash'];

  for (const model of candidateModels) {
    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model,
        contents: {
          parts: [
            {
              inlineData: {
                data: formattedBase64,
                mimeType: mimeType || 'image/png'
              }
            },
            {
              text: `Analyze this image for 2D vector conversion.
Provide a concise breakdown formatted as:
DESCRIPTION: [Describe the primary subject, pose, silhouette, and composition]
COLORS: [List the 3-5 dominant colors in hex or clean color names]
SHAPES: [List key geometric forms and outline characteristics]`
            }
          ]
        }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      const text = response.text || "";
      if (!text) continue;

      const descMatch = text.match(/DESCRIPTION:\s*([^\n]+)/i);
      const colorsMatch = text.match(/COLORS:\s*([^\n]+)/i);
      const shapesMatch = text.match(/SHAPES:\s*([^\n]+)/i);

      return {
        description: descMatch ? descMatch[1].trim() : text.slice(0, 200),
        colors: colorsMatch ? colorsMatch[1].trim() : "Flat solid palette",
        shapes: shapesMatch ? shapesMatch[1].trim() : "Clean 2D vector paths"
      };
    } catch (err) {
      console.warn(`[GEMINI 3.8 FLASH] Vector subject analysis notice on ${model}:`, err);
    }
  }
  return null;
}

/**
 * Typography Prompt Refinement Loop using Gemini 2.5 Flash
 */
export async function refineTypographyPrompt(
  base64Image: string,
  mimeType: string,
  originalPrompt: string,
  targetText: string,
  targetPreset: string,
  apiKeyOverride?: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  signal?: AbortSignal
): Promise<string> {
  let apiKey: string;
  try {
    apiKey = getApiKey(apiKeyOverride);
  } catch {
    return originalPrompt;
  }

  try {
    const ai = createAiClient(apiKey);
    const formattedBase64 = base64Image.includes(",") ? base64Image.split(",")[1] : base64Image;

    const candidateModels = ['gemini-2.5-flash', 'gemini-3.8-flash'];
    for (const model of candidateModels) {
      try {
        const response: GenerateContentResponse = await ai.models.generateContent({
          model,
          contents: {
            parts: [
              {
                inlineData: {
                  data: formattedBase64,
                  mimeType: mimeType || 'image/png'
                }
              },
              {
                text: `Role: Typographic Quality Auditor. Refine the prompt for better spelling of "${targetText}" and matching "${targetPreset}" style. Original: ${originalPrompt}`
              }
            ]
          }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);

        if (response.text) return response.text;
      } catch (e) {
        if (isNotFoundError(e)) continue;
        throw e;
      }
    }
    return originalPrompt;
  } catch (error) {
    console.error("Refinement Loop Error:", error);
    return originalPrompt;
  }
}
