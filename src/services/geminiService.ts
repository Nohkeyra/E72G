import { apiUrl, getApiHeaders } from "../utils/apiBase";

/**
 * Valid Aspect Ratios for Gemini Image Generation
 */
export const VALID_ASPECT_RATIOS = ["1:1", "3:4", "4:3", "9:16", "16:9"] as const;
export type AspectRatio = typeof VALID_ASPECT_RATIOS[number];

/**
 * Client-side interface to Centralized Backend Gemini Synthesis API.
 * All operations execute server-side; secrets never touch the browser bundle.
 */
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
  const { model, prompt, base64Image, mimeType, aspectRatio, apiKeyOverride, signal } = args;

  const url = apiUrl("/api/gemini/generate");
  const headers = getApiHeaders(apiKeyOverride);

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        prompt,
        base64Image,
        mimeType,
        aspectRatio
      }),
      signal
    });
  } catch (netErr: unknown) {
    if (signal?.aborted) {
      throw new Error("Generation cancelled by user");
    }
    const msg = netErr instanceof Error ? netErr.message : String(netErr);
    throw new Error(`Failed to connect to backend service: ${msg}`);
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || `Server responded with status ${response.status}`;
    if (response.status === 401) {
      throw new Error(`Invalid personal Gemini API key. Please check your key in Settings.`);
    }
    if (response.status === 429) {
      throw new Error(`Rate limit reached: ${errorMsg}`);
    }
    throw new Error(errorMsg);
  }

  if (data.image) {
    return {
      image: data.image,
      modelUsed: data.modelUsed || model
    };
  }

  throw new Error("Gemini Image engine was unable to produce an image. Please verify your prompt or API key.");
}

/**
 * Lightweight Connection & Diagnostic Check via Backend API.
 * Tests personal key if provided; otherwise tests server default key.
 */
export async function checkGeminiConnection(apiKeyOverride?: string): Promise<{ success: boolean; latency: number; details: string }> {
  const start = Date.now();
  try {
    const url = apiUrl("/api/gemini/verify-key");
    const headers = getApiHeaders(apiKeyOverride);

    const response = await fetch(url, {
      method: "POST",
      headers
    });

    const data = await response.json().catch(() => ({}));
    if (response.ok && data.success) {
      return {
        success: true,
        latency: data.latency ?? (Date.now() - start),
        details: data.details || "Connected to Gemini API"
      };
    }

    return {
      success: false,
      latency: data.latency ?? (Date.now() - start),
      details: data.details || data.error || "Connection failed"
    };
  } catch (err: unknown) {
    const latency = Date.now() - start;
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, latency, details: `Network error: ${msg}` };
  }
}

/**
 * Image Structure Analysis using Backend Gemini Vision Route
 */
export async function analyzeImage(
  base64Image: string,
  mimeType: string,
  activeTab: string = "vectorize",
  apiKeyOverride?: string,
  signal?: AbortSignal
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  const url = apiUrl("/api/gemini/analyze");
  const headers = getApiHeaders(apiKeyOverride);

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      base64Image,
      mimeType,
      activeTab
    }),
    signal
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || `Analysis failed (${response.status})`;
    throw new Error(errorMsg);
  }

  return data;
}

export interface VectorAnalysisResult {
  subjectName?: string;
  description: string;
  silhouette?: string;
  distinctiveDetails?: string;
  colors: string;
  shapes: string;
  vectorAdvice?: string;
}

/**
 * Direct Vector Subject Analysis via Backend Route
 */
export async function analyzeVectorSubject(
  base64Image: string,
  mimeType: string,
  apiKeyOverride?: string
): Promise<VectorAnalysisResult | null> {
  try {
    const url = apiUrl("/api/gemini/analyze-vector");
    const headers = getApiHeaders(apiKeyOverride);

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        base64Image,
        mimeType
      })
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json().catch(() => null);
    return data;
  } catch (err) {
    console.warn("[GEMINI BACKEND CLIENT] Vector subject analysis notice:", err);
    return null;
  }
}

/**
 * Typography Prompt Refinement Loop via Backend Route
 */
export async function refineTypographyPrompt(
  base64Image: string,
  mimeType: string,
  originalPrompt: string,
  targetText: string,
  targetPreset: string,
  apiKeyOverride?: string,
  signal?: AbortSignal
): Promise<string> {
  try {
    const url = apiUrl("/api/gemini/refine-typography");
    const headers = getApiHeaders(apiKeyOverride);

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        base64Image,
        mimeType,
        originalPrompt,
        targetText,
        targetPreset
      }),
      signal
    });

    if (!response.ok) {
      return originalPrompt;
    }

    const data = await response.json().catch(() => null);
    return data?.refinedPrompt || originalPrompt;
  } catch (err) {
    console.error("Refinement Loop Error:", err);
    return originalPrompt;
  }
}
