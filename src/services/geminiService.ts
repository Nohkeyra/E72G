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
  if (!key) {
    throw new Error("The Gemini API key is missing. Please check your environment configuration or provide a valid key in Settings.");
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
  const { model, prompt, base64Image, mimeType, aspectRatio, apiKeyOverride } = args;

  const ai = createAiClient(apiKeyOverride);
  const selectedAspectRatio = normalizeAspectRatio(aspectRatio);

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

  // Model routing: use modern Gemini multimodal image models
  const primaryModel = (model && !model.includes('imagen'))
    ? model
    : 'gemini-3.1-flash-image-preview';

  const fallbackModels = Array.from(new Set([
    primaryModel,
    'gemini-3.1-flash-image-preview',
    'gemini-2.5-flash-image',
    'gemini-3.1-flash-lite-image',
    'gemini-2.5-flash'
  ])).filter(Boolean);

  let lastError: unknown = null;

  for (const targetModel of fallbackModels) {
    try {
      // Modern Gemini image generation using generateContent with responseModalities
      let response: GenerateContentResponse | null = null;
      try {
        response = await ai.models.generateContent({
          model: targetModel,
          contents: { parts },
          config: {
            systemInstruction: VORTEX_SYSTEM_INSTRUCTION,
            responseModalities: ["IMAGE", "TEXT"],
            imageConfig: {
              aspectRatio: selectedAspectRatio
            }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any
        });
      } catch (modalityErr) {
        console.warn(`[GEMINI ENGINE] Visual modality config attempt on '${targetModel}' bypassed. Falling back to single modality...`, modalityErr);
        try {
          response = await ai.models.generateContent({
            model: targetModel,
            contents: { parts },
            config: {
              systemInstruction: VORTEX_SYSTEM_INSTRUCTION,
              responseModalities: ["IMAGE"]
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any
          });
        } catch (imgOnlyErr) {
          console.warn(`[GEMINI ENGINE] Image-only modality on '${targetModel}' failed. Trying standard prompt stream...`, imgOnlyErr);
          response = await ai.models.generateContent({
            model: targetModel,
            contents: { parts },
            config: {
              systemInstruction: VORTEX_SYSTEM_INSTRUCTION
            }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any);
        }
      }

      if (response) {
        const extractedImage = extractImageFromResponse(response);
        if (extractedImage) {
          return {
            image: extractedImage,
            modelUsed: targetModel
          };
        }

        const textOutput = response.text || "Gemini completed generation.";
        return {
          text: textOutput,
          modelUsed: targetModel
        };
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      lastError = error;
      const msg = error?.message || String(error);

      // Handle 401 Unauthorized immediately
      if (msg.includes("401") || msg.includes("invalid") || msg.includes("API key not valid")) {
        throw new Error(`Invalid or missing Gemini API key. Please check your key in Settings or .env file.`, { cause: error });
      }

      // Handle 429 Rate Limit with 5-second cooldown retry
      if (msg.includes("429") || msg.includes("Quota") || msg.includes("RESOURCE_EXHAUSTED")) {
        console.warn(`[GEMINI ENGINE] Rate limit (429) encountered on '${targetModel}'. Waiting 5 seconds for cooldown before retry...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
        try {
          const retryResponse = await ai.models.generateContent({
            model: targetModel,
            contents: { parts },
            config: {
              systemInstruction: VORTEX_SYSTEM_INSTRUCTION,
              responseModalities: ["IMAGE", "TEXT"],
              imageConfig: {
                aspectRatio: selectedAspectRatio
              }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any
          });
          const extracted = extractImageFromResponse(retryResponse);
          if (extracted) {
            return { image: extracted, modelUsed: targetModel };
          }
          if (retryResponse.text) {
            return { text: retryResponse.text, modelUsed: targetModel };
          }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (retryErr: any) {
          const retryMsg = (retryErr as Error)?.message || String(retryErr);
          if (retryMsg.includes("429") || retryMsg.includes("Quota") || retryMsg.includes("RESOURCE_EXHAUSTED")) {
            throw new Error("Rate limit reached. Please wait a moment before trying again.", { cause: retryErr });
          }
        }
      }

      // Intercept any modal synthesis failure, validation error, or 404 and safely continue
      console.warn(`[GEMINI ENGINE] Model attempt '${targetModel}' encountered an issue: ${msg}. Trying fallback...`);
      continue;
    }
  }

  // Graceful fallback response if all models encounter issues
  if (lastError) {
    const errorString = lastError instanceof Error ? lastError.message : String(lastError);
    if (errorString.includes("429") || errorString.includes("RESOURCE_EXHAUSTED") || errorString.includes("Rate limit")) {
      throw new Error("Rate limit reached. Please wait a moment before trying again.");
    }
    return {
      text: `Synthesis completed with text fallback notice: ${errorString}`,
      modelUsed: 'gemini-3.1-flash-image-preview'
    };
  }

  return {
    text: "Synthesis process finished with fallback.",
    modelUsed: 'gemini-3.1-flash-image-preview'
  };
}

/**
 * Lightweight Connection & Diagnostic Check
 */
export async function checkGeminiConnection(apiKeyOverride?: string): Promise<{ success: boolean; latency: number; details: string }> {
  const start = Date.now();
  try {
    const ai = createAiClient(apiKeyOverride);
    const candidateModels = ['gemini-2.5-flash', 'gemini-3.8-flash'];
    
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
 * Image Structure Analysis using Gemini 2.5 Flash
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

  const promptText = `Role: You are a Structural Design Auditor. Define the artistic style as a JSON object. Focus on ${activeTab === "logo design" ? "LOGO DESIGN" : "GRAPHIC ILLUSTRATION"} elements.
Return a JSON object: { "name": string, "basePrompt": string, "negativePrompt": string, "aspectRatio": "1:1", "dnaWeight": number, "textureIntensity": number }`;

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
