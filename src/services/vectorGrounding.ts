import type { VectorAnalysisResult, VectorAnalyzeOutcome } from "./geminiService";

/** Cheap synchronous fingerprint over the WHOLE data URL (length + two 32-bit FNV-style hashes). Cache keys only; not security. */
export function fingerprintImage(dataUrl: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < dataUrl.length; i++) {
    const c = dataUrl.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0;
    h2 = Math.imul(h2 + c, 0x85ebca6b) >>> 0;
  }
  return `${dataUrl.length}:${h1.toString(16)}:${h2.toString(16)}`;
}

/** SHA-256 (hex) of the decoded image bytes. Matches the server's hash of the same upload. */
export async function sha256OfImage(dataUrlOrBase64: string): Promise<string> {
  const raw = dataUrlOrBase64.includes(",") ? dataUrlOrBase64.split(",")[1] : dataUrlOrBase64;
  const bin = atob(raw);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Single-slot cache keyed by image content hash: a different upload can never hit another image's analysis. */
export class VectorAnalysisCache {
  private key: string | null = null;
  private value: VectorAnalysisResult | null = null;

  get(imageSha256: string): VectorAnalysisResult | null {
    return this.key === imageSha256 ? this.value : null;
  }

  set(imageSha256: string, analysis: VectorAnalysisResult): void {
    this.key = imageSha256;
    this.value = analysis;
  }

  clear(): void {
    this.key = null;
    this.value = null;
  }
}

export type GroundingResult =
  | { status: "grounded"; analysis: VectorAnalysisResult; imageSha256: string; fromCache: boolean }
  /** Analysis could not be obtained (no key, network, server error). The image itself is still the only grounding. */
  | { status: "unavailable"; reason: string }
  /** Analysis exists but must not be used (failed verification, unparseable, or bound to a different image). */
  | { status: "rejected"; reason: string };

export async function groundVectorSubject(args: {
  imageDataUrl: string;
  mimeType: string;
  cache: VectorAnalysisCache;
  analyze: (imageDataUrl: string, mimeType: string) => Promise<VectorAnalyzeOutcome>;
}): Promise<GroundingResult> {
  const { imageDataUrl, mimeType, cache, analyze } = args;
  const imageSha256 = await sha256OfImage(imageDataUrl);

  const cached = cache.get(imageSha256);
  if (cached) {
    return { status: "grounded", analysis: cached, imageSha256, fromCache: true };
  }

  const outcome = await analyze(imageDataUrl, mimeType);
  if (outcome.ok === false) {
    return outcome.kind === "rejected"
      ? { status: "rejected", reason: outcome.error }
      : { status: "unavailable", reason: outcome.error };
  }

  const { imageSha256: analyzedSha, ...analysis } = outcome.data;
  if (!analyzedSha) {
    return { status: "rejected", reason: "Subject analysis was not bound to an image; discarded." };
  }
  if (analyzedSha !== imageSha256) {
    return { status: "rejected", reason: "Subject analysis belongs to a different image than the one uploaded; discarded." };
  }
  if (!analysis.subjectName || !analysis.subjectName.trim()) {
    return { status: "rejected", reason: "Subject analysis did not identify a subject." };
  }

  cache.set(imageSha256, analysis);
  return { status: "grounded", analysis, imageSha256, fromCache: false };
}
