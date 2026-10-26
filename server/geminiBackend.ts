import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import type { Request } from "express";

export interface ResolvedKey {
  key: string;
  isPersonal: boolean;
}

export function resolveApiKey(req: Request): ResolvedKey {
  const headerKey = req.headers["x-gemini-api-key"];
  const personalKey = typeof headerKey === "string" ? headerKey.trim() : "";

  if (personalKey) {
    return { key: personalKey, isPersonal: true };
  }

  const defaultKey = (process.env.GEMINI_API_KEY || "").trim();
  return { key: defaultKey, isPersonal: false };
}

export function createAiClient(apiKey: string): GoogleGenAI {
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build-elite72"
      }
    }
  });
}

// Allowed models allowlist to prevent arbitrary model abuse
export const ALLOWED_IMAGE_MODELS = new Set([
  "gemini-3.1-flash-lite-image",
  "gemini-nano-banana-2.1",
  "gemini-3-pro-image",
  "imagen-3.0-generate-002",
  // Frontend aliases mapped to gemini-3.1-flash-lite-image
  "gemini",
  "gemini-flash",
  "gemini-image"
]);

export const ALLOWED_TEXT_MODELS = new Set([
  "gemini-3.8-flash"
]);

export function mapImageModel(model?: string): string {
  if (!model) return "gemini-3.1-flash-lite-image";
  if (model === "gemini" || model === "gemini-flash" || model === "gemini-image") {
    return "gemini-3.1-flash-lite-image";
  }
  return model;
}

export function isAuthError(error: unknown): boolean {
  if (!error) return false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const err = error as any;
  const msg = (err.message || String(error)).toUpperCase();
  const status = err.status || err.statusCode || err.code || err.response?.status;
  return (
    status === 401 ||
    status === "401" ||
    status === 403 ||
    status === "403" ||
    msg.includes("401") ||
    msg.includes("API_KEY_INVALID") ||
    msg.includes("API KEY NOT VALID") ||
    msg.includes("INVALID API KEY") ||
    msg.includes("UNAUTHENTICATED") ||
    msg.includes("PERMISSION_DENIED")
  );
}

export function isQuotaError(error: unknown): boolean {
  if (!error) return false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const err = error as any;
  const msg = (err.message || String(error)).toUpperCase();
  const status = err.status || err.statusCode || err.code || err.response?.status;
  return (
    status === 429 ||
    status === "429" ||
    msg.includes("429") ||
    msg.includes("RESOURCE_EXHAUSTED") ||
    msg.includes("RATE LIMIT") ||
    msg.includes("QUOTA EXCEEDED")
  );
}

export function isNotFoundError(error: unknown): boolean {
  if (!error) return false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const err = error as any;
  const msg = (err.message || String(error)).toUpperCase();
  const status = err.status || err.statusCode || err.code || err.response?.status;
  return (
    status === 404 ||
    status === "404" ||
    msg.includes("NOT_FOUND") ||
    msg.includes("NOT FOUND") ||
    msg.includes("UNSUPPORTED MODEL")
  );
}

export function handleGeminiError(error: unknown, isPersonal: boolean): { status: number; message: string } {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const err = error as any;
  const rawMsg = err?.message || String(error);
  const upperMsg = rawMsg.toUpperCase();

  const isDailyQuota = upperMsg.includes("DAILY") || upperMsg.includes("QUOTA EXCEEDED") || upperMsg.includes("BILLING") || upperMsg.includes("RESOURCE_EXHAUSTED");
  const isRateLimit = upperMsg.includes("RATE LIMIT") || upperMsg.includes("429") || upperMsg.includes("PER MINUTE");

  if (isPersonal) {
    if (isAuthError(error)) {
      return {
        status: 401,
        message: "Invalid personal Gemini API key. Please check your key in Settings."
      };
    }
    if (isQuotaError(error)) {
      if (isDailyQuota && !isRateLimit) {
        return {
          status: 429,
          message: "Personal Gemini API key daily free quota limit reached. Please wait for quota reset, enable billing on your Google Cloud project, or switch to Cloudflare Workers AI."
        };
      }
      return {
        status: 429,
        message: "Personal Gemini API key rate limit reached (HTTP 429). Please wait a moment before sending more requests."
      };
    }
    return {
      status: 500,
      message: `Personal key generation error: ${rawMsg.replace(/AIza[0-9A-Za-z-_]{20,}/g, "[REDACTED]")}`
    };
  }

  // Application-owned default key
  if (isAuthError(error)) {
    return {
      status: 502,
      message: "Server default Gemini API key authentication failed. Please check server configuration or provide a personal key in Settings."
    };
  }
  if (isQuotaError(error)) {
    if (isDailyQuota && !isRateLimit) {
      return {
        status: 429,
        message: "Google Gemini API daily free quota reached (HTTP 429). The shared API key has exceeded Google's free daily quota. Please add your personal Gemini API key in Settings (⚙) or switch to Cloudflare Workers AI (Zero-Cost Tier) for reliable image generation."
      };
    }
    return {
      status: 429,
      message: "Google Gemini API rate limit reached (HTTP 429 - Requests Per Minute). Please wait a moment, or switch to Cloudflare Workers AI."
    };
  }

  return {
    status: 500,
    message: `Synthesis engine error: ${rawMsg.replace(/AIza[0-9A-Za-z-_]{20,}/g, "[REDACTED]")}`
  };
}

export const VALID_ASPECT_RATIOS = ["1:1", "3:4", "4:3", "9:16", "16:9"] as const;
export type AspectRatio = typeof VALID_ASPECT_RATIOS[number];

export function normalizeAspectRatio(ratio?: string): AspectRatio {
  if (!ratio) return "1:1";
  if (VALID_ASPECT_RATIOS.includes(ratio as AspectRatio)) {
    return ratio as AspectRatio;
  }
  // Map common alternative aspect ratios to closest native Gemini supported ratios
  if (ratio === "4:5" || ratio === "2:3") {
    return "3:4";
  }
  if (ratio === "5:4" || ratio === "3:2") {
    return "4:3";
  }
  return "1:1";
}

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

export function extractImageFromResponse(response: GenerateContentResponse): string | null {
  const candidates = response.candidates || [];
  for (const candidate of candidates) {
    const parts = candidate.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        const mime = part.inlineData.mimeType || "image/png";
        return `data:${mime};base64,${part.inlineData.data}`;
      }
    }
  }

  const text = response.text || "";
  if (text) {
    const dataUriMatch = text.match(/data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+/);
    if (dataUriMatch) {
      return dataUriMatch[0];
    }
  }

  return null;
}

export async function executeGenerateImage(params: {
  model?: string;
  prompt: string;
  base64Image?: string;
  mimeType?: string;
  aspectRatio?: string;
  apiKey: string;
  isPersonal: boolean;
}): Promise<{ image: string; modelUsed: string }> {
  const { model, prompt, base64Image, mimeType, aspectRatio, apiKey, isPersonal } = params;

  if (!apiKey) {
    throw new Error(isPersonal ? "Missing personal API key" : "Server GEMINI_API_KEY is not configured");
  }

  const ai = createAiClient(apiKey);
  const selectedAspectRatio = normalizeAspectRatio(aspectRatio);
  const mappedModel = mapImageModel(model);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parts: any[] = [];
  if (base64Image && mimeType) {
    const formattedBase64 = base64Image.includes(",") ? base64Image.split(",")[1] : base64Image;
    parts.push({
      inlineData: {
        data: formattedBase64,
        mimeType
      }
    });

    const isSubjectPreservation = prompt.includes("[SUBJECT_PRESERVATION_DIRECTIVE]") || prompt.includes("[IDENTITY_LOCK");
    const instructionText = isSubjectPreservation
      ? `[SUBJECT_REFERENCE_GROUND_TRUTH]: The attached image is the primary visual subject. Preserve this exact subject's identity, silhouette, proportions, pose, structure, and distinctive features while translating it into the requested vector art style.\n[TRANSFORMATION_INSTRUCTIONS]: ${prompt}`
      : `[STYLE_REFERENCE_DETECTED] Follow the visual DNA of the attached reference image.\n[CONTENT_INSTRUCTION]: ${prompt}`;

    parts.push({
      text: instructionText
    });
  } else {
    parts.push({ text: prompt });
  }

  const targetModels = [
    mappedModel,
    "gemini-3.1-flash-lite-image",
    "gemini-nano-banana-2.1",
    "gemini-3-pro-image"
  ].filter((m, idx, arr) => m && arr.indexOf(m) === idx);

  let lastError: unknown = null;

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
        if (isAuthError(modalityErr) || isQuotaError(modalityErr)) {
          throw modalityErr;
        }
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
        const extracted = extractImageFromResponse(response);
        if (extracted) {
          return { image: extracted, modelUsed: targetModel };
        }
      }
    } catch (err) {
      lastError = err;
      if (isAuthError(err)) {
        // If the key is invalid, do not waste time cycling through other models
        throw err;
      }
      if (isQuotaError(err)) {
        throw err;
      }
      console.warn(`[GEMINI BACKEND] Model '${targetModel}' attempt skipped:`, err instanceof Error ? err.message : err);
    }
  }

  // Safety net fallback to Imagen 3 if supported by the key
  try {
    const imagenFallback = await ai.models.generateImages({
      model: "imagen-3.0-generate-002",
      prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: "image/jpeg",
        aspectRatio: selectedAspectRatio
      }
    });

    if (imagenFallback.generatedImages?.[0]?.image?.imageBytes) {
      const b64 = imagenFallback.generatedImages[0].image.imageBytes;
      return {
        image: `data:image/jpeg;base64,${b64}`,
        modelUsed: "imagen-3.0-generate-002"
      };
    }
  } catch (imgErr) {
    if (isAuthError(imgErr) || isQuotaError(imgErr)) {
      throw imgErr;
    }
    console.warn("[GEMINI BACKEND] Imagen 3 fallback skipped:", imgErr);
  }

  if (lastError) {
    throw lastError;
  }

  throw new Error("Gemini Image engine was unable to produce an image. Please verify your prompt or API key.");
}

export async function executeVerifyKey(apiKey: string, isPersonal: boolean): Promise<{ success: boolean; latency: number; details: string }> {
  if (!apiKey) {
    return {
      success: false,
      latency: 0,
      details: isPersonal ? "No personal key provided" : "Server default key is not configured"
    };
  }

  const start = Date.now();
  try {
    const ai = createAiClient(apiKey);
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: "ping"
    });
    const latency = Date.now() - start;

    if (response?.text) {
      return {
        success: true,
        latency,
        details: isPersonal ? "Personal Gemini API key verified" : "Server default Gemini API key verified"
      };
    }
    return {
      success: false,
      latency,
      details: "Empty response from Gemini API"
    };
  } catch (err: unknown) {
    const latency = Date.now() - start;
    if (isAuthError(err)) {
      return { success: false, latency, details: "Invalid API Key" };
    }
    if (isQuotaError(err)) {
      return { success: false, latency, details: "Rate Limited (HTTP 429)" };
    }
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, latency, details: msg.replace(/AIza[0-9A-Za-z-_]{20,}/g, "[REDACTED]") };
  }
}

export async function executeAnalyze(params: {
  base64Image: string;
  mimeType: string;
  activeTab?: string;
  apiKey: string;
}): Promise<Record<string, unknown>> {
  const { base64Image, mimeType, activeTab = "vectorize", apiKey } = params;
  const ai = createAiClient(apiKey);
  const formattedBase64 = base64Image.includes(",") ? base64Image.split(",")[1] : base64Image;

  const promptText = activeTab === "vectorize"
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

  const response = await ai.models.generateContent({
    model: "gemini-3.8-flash",
    contents: {
      parts: [
        {
          inlineData: {
            data: formattedBase64,
            mimeType: mimeType || "image/png"
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

  const parseJson = (str: string) => {
    try {
      return JSON.parse(str);
    } catch {
      const match = str.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match && match[1]) return JSON.parse(match[1]);
      throw new Error("Failed to parse JSON response from analysis");
    }
  };

  return parseJson(text);
}

export interface VectorAnalysisResult {
  subjectName: string;
  description: string;
  silhouette: string;
  distinctiveDetails: string;
  colors: string;
  shapes: string;
  vectorAdvice: string;
}

export async function executeAnalyzeVector(params: {
  base64Image: string;
  mimeType: string;
  apiKey: string;
}): Promise<VectorAnalysisResult | null> {
  const { base64Image, mimeType, apiKey } = params;
  const ai = createAiClient(apiKey);
  const formattedBase64 = base64Image.includes(",") ? base64Image.split(",")[1] : base64Image;

  const response = await ai.models.generateContent({
    model: "gemini-3.8-flash",
    contents: {
      parts: [
        {
          inlineData: {
            data: formattedBase64,
            mimeType: mimeType || "image/png"
          }
        },
        {
          text: `You are an expert Vector Art & Visual Morphology Auditor.
Analyze this reference image to prepare it for intelligent 2D vector-style illustration generation.
Extract the subject's exact visual morphology so the generative model can faithfully preserve it.

Provide a breakdown formatted strictly as:
SUBJECT: [Concise 2-6 word identification of the primary subject, e.g. "standing bulldog with spiked collar" or "vintage red sports coupe"]
DESCRIPTION: [Accurate description of the subject's pose, orientation, proportions, and placement in the frame]
SILHOUETTE: [Detailed outline and outer contour description, proportions, posture, and spatial composition]
DETAILS: [Crucial distinctive features, component counts, emblems, markings, or textures that define the subject's identity and must be preserved]
COLORS: [3 to 5 dominant colors and their relationship, e.g. "Crimson red body, gloss black trim, chrome accents, charcoal background"]
SHAPES: [Geometric primitives, curve dynamics, and outline boundary rules]
VECTOR_ADVICE: [Instructions on translating this subject into clean vector planes, smooth bezier contours, and solid or cel-shaded fills without photographic noise]`
        }
      ]
    }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);

  const text = response.text || "";
  if (!text) return null;

  // Support both JSON output (if model formatted as JSON) and KEY: VALUE lines
  let parsedJson: Partial<VectorAnalysisResult> = {};
  try {
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      parsedJson = JSON.parse(jsonMatch[1].trim());
    } else if (text.trim().startsWith("{") && text.trim().endsWith("}")) {
      parsedJson = JSON.parse(text.trim());
    }
  } catch {
    // Non-JSON response, continue with regex parsing
  }

  const subjectMatch = text.match(/SUBJECT(?:_NAME)?:\s*([^\n]+)/i);
  const descMatch = text.match(/DESCRIPTION:\s*([^\n]+)/i);
  const silMatch = text.match(/SILHOUETTE(?:_AND_CONTOURS)?:\s*([^\n]+)/i);
  const detailsMatch = text.match(/(?:DISTINCTIVE_)?DETAILS:\s*([^\n]+)/i);
  const colorsMatch = text.match(/COLORS(?:_PALETTE)?:\s*([^\n]+)/i);
  const shapesMatch = text.match(/SHAPES(?:_AND_GEOMETRY)?:\s*([^\n]+)/i);
  const adviceMatch = text.match(/VECTOR_ADVICE:\s*([^\n]+)/i);

  const subjectName = parsedJson.subjectName || (subjectMatch ? subjectMatch[1].trim() : "the reference subject");
  const silhouette = parsedJson.silhouette || (silMatch ? silMatch[1].trim() : "Accurate subject contour and proportions");
  const distinctiveDetails = parsedJson.distinctiveDetails || (detailsMatch ? detailsMatch[1].trim() : "Core identifying features and structure");
  const colors = parsedJson.colors || (colorsMatch ? colorsMatch[1].trim() : "Cohesive flat palette");
  const shapes = parsedJson.shapes || (shapesMatch ? shapesMatch[1].trim() : "Clean 2D vector paths");
  const vectorAdvice = parsedJson.vectorAdvice || (adviceMatch ? adviceMatch[1].trim() : "Render with crisp bezier curves and solid color blocking");
  const description = parsedJson.description || (descMatch ? descMatch[1].trim() : `${subjectName}. ${silhouette}`);

  return {
    subjectName,
    description,
    silhouette,
    distinctiveDetails,
    colors,
    shapes,
    vectorAdvice
  };
}

export async function executeRefineTypography(params: {
  base64Image: string;
  mimeType: string;
  originalPrompt: string;
  targetText: string;
  targetPreset: string;
  apiKey: string;
}): Promise<{ refinedPrompt: string }> {
  const { base64Image, mimeType, originalPrompt, targetText, targetPreset, apiKey } = params;
  const ai = createAiClient(apiKey);
  const formattedBase64 = base64Image.includes(",") ? base64Image.split(",")[1] : base64Image;

  const response = await ai.models.generateContent({
    model: "gemini-3.8-flash",
    contents: {
      parts: [
        {
          inlineData: {
            data: formattedBase64,
            mimeType: mimeType || "image/png"
          }
        },
        {
          text: `Role: Typographic Quality Auditor. Refine the prompt for better spelling of "${targetText}" and matching "${targetPreset}" style. Original: ${originalPrompt}`
        }
      ]
    }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);

  return { refinedPrompt: response.text || originalPrompt };
}

export async function executeVisionAnalysis(params: {
  base64Image: string;
  mimeType: string;
  apiKey: string;
}): Promise<Record<string, unknown>> {
  const { base64Image, mimeType, apiKey } = params;
  const ai = createAiClient(apiKey);
  const formattedBase64 = base64Image.includes(",") ? base64Image.split(",")[1] : base64Image;

  const response = await ai.models.generateContent({
    model: "gemini-3.8-flash",
    contents: {
      parts: [
        {
          inlineData: {
            data: formattedBase64,
            mimeType
          }
        },
        {
          text: `Analyze this image and return a JSON object with the following structure:
          {
            "global_context": {
              "scene_description": "string",
              "color_palette": { "dominant_hex_estimates": ["#HEX1", "#HEX2"] }
            },
            "objects": [
              { "id": "obj_001", "label": "string", "pose_orientation": "string", "box_2d": [0, 0, 1000, 1000] }
            ]
          }`
        }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          global_context: {
            type: Type.OBJECT,
            properties: {
              scene_description: { type: Type.STRING },
              color_palette: {
                type: Type.OBJECT,
                properties: {
                  dominant_hex_estimates: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                }
              }
            }
          },
          objects: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                label: { type: Type.STRING },
                pose_orientation: { type: Type.STRING },
                box_2d: {
                  type: Type.ARRAY,
                  items: { type: Type.NUMBER }
                }
              }
            }
          }
        }
      }
    }
  });

  return JSON.parse(response.text!);
}
