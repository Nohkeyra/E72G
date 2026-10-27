/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiUrl } from '../utils/apiBase';

export interface VectorAnalysisResult {
  subjectName: string;
  visualDescriptor: string;
  distinctiveTraits: string[];
}

export type VectorAnalyzeOutcome =
  | { ok: true; data: VectorAnalysisResult & { imageSha256: string } }
  | { ok: false; kind: 'rejected' | 'unavailable'; error: string };

export async function checkGeminiConnection(apiKey?: string): Promise<{ success: boolean; latency: number; details: string }> {
  const start = Date.now();
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (apiKey) {
      headers['x-gemini-api-key'] = apiKey;
    }
    const res = await fetch(apiUrl('/api/cloudflare/generate-image'), {
      method: 'POST',
      headers,
      body: JSON.stringify({ prompt: 'ping' })
    });
    const latency = Date.now() - start;
    if (res.ok) {
      return { success: true, latency, details: 'Connection verified successfully.' };
    }
    const err = await res.json().catch(() => ({}));
    return { success: false, latency, details: err.error || `HTTP ${res.status}` };
  } catch (err: any) {
    return { success: false, latency: Date.now() - start, details: err.message || 'Network error' };
  }
}

export async function analyzeVectorSubjectCloudflare(
  imageDataUrl: string,
  mimeType: string,
  signal?: AbortSignal
): Promise<VectorAnalyzeOutcome> {
  try {
    const base64Image = imageDataUrl.includes(',') ? imageDataUrl.split(',')[1] : imageDataUrl;
    const res = await fetch(apiUrl('/api/cloudflare/analyze-vector'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64Image, mimeType }),
      signal
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      if (res.status === 422) {
        return { ok: false, kind: 'rejected', error: err.error || 'Vector analysis rejected' };
      }
      return { ok: false, kind: 'unavailable', error: err.error || `HTTP ${res.status}` };
    }
    const data = await res.json();
    return { ok: true, data };
  } catch (err: any) {
    return { ok: false, kind: 'unavailable', error: err.message || 'Subject analysis request failed' };
  }
}

export async function analyzeVectorSubject(
  imageDataUrl: string,
  mimeType: string,
  _apiKey?: string,
  signal?: AbortSignal
): Promise<VectorAnalyzeOutcome> {
  return analyzeVectorSubjectCloudflare(imageDataUrl, mimeType, signal);
}

export async function callGemini(params: {
  model: string;
  prompt: string;
  base64Image?: string;
  mimeType?: string;
  aspectRatio?: string;
  apiKeyOverride?: string;
  signal?: AbortSignal;
}): Promise<{ image?: string; text?: string; modelUsed: string }> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (params.apiKeyOverride) {
    headers['x-gemini-api-key'] = params.apiKeyOverride;
  }
  const endpoint = params.base64Image ? '/api/cloudflare/edit-image' : '/api/cloudflare/generate-image';
  const res = await fetch(apiUrl(endpoint), {
    method: 'POST',
    headers,
    body: JSON.stringify({
      prompt: params.prompt,
      base64Image: params.base64Image,
      mimeType: params.mimeType,
      aspectRatio: params.aspectRatio
    }),
    signal: params.signal
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Image generation failed with HTTP ${res.status}`);
  }
  const data = await res.json();
  return { image: data.image, modelUsed: data.modelUsed || 'cf-flux' };
}
