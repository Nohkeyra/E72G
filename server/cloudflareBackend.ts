import sharp from "sharp";

export interface CloudflareGenerateParams {
  prompt: string;
  aspectRatio?: string;
  accountIdOverride?: string;
  apiTokenOverride?: string;
}

export interface CloudflareGenerateResult {
  image: string; // data:image/png;base64,...
  provider: "cloudflare";
  modelUsed: string;
}

export function resolveCloudflareCredentials(params?: { accountIdOverride?: string; apiTokenOverride?: string }) {
  const accountId = (params?.accountIdOverride || process.env.CLOUDFLARE_ACCOUNT_ID || "").trim();
  const apiToken = (params?.apiTokenOverride || process.env.CLOUDFLARE_API_TOKEN || "").trim();
  return { accountId, apiToken };
}

export const CLOUDFLARE_FLUX_MAX_PROMPT_LENGTH = 2048;

export function buildCloudflarePrompt(prompt: string, aspectRatio?: string): string {
  if (prompt === null || prompt === undefined || typeof prompt !== "string") {
    throw new Error("Prompt is required and must be a non-empty string");
  }

  let cleanPrompt = prompt
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (!cleanPrompt) {
    throw new Error("Prompt is required and must be a non-empty string");
  }

  // Determine aspect ratio descriptor suffix
  let ratioSuffix = "";
  if (aspectRatio) {
    const ratioMap: Record<string, string> = {
      "1:1": "square 1:1 aspect ratio",
      "16:9": "widescreen 16:9 aspect ratio",
      "4:3": "standard 4:3 aspect ratio",
      "3:4": "portrait 3:4 aspect ratio",
      "9:16": "vertical 9:16 aspect ratio"
    };
    const ratioDescriptor = ratioMap[aspectRatio] || `${aspectRatio} aspect ratio`;
    ratioSuffix = `, ${ratioDescriptor}`;
  }

  // Avoid duplicating ratio descriptor if already appended at end
  if (ratioSuffix && cleanPrompt.endsWith(ratioSuffix.trim())) {
    ratioSuffix = "";
  }

  const initialAssembled = `${cleanPrompt}${ratioSuffix}`;
  if (initialAssembled.length <= CLOUDFLARE_FLUX_MAX_PROMPT_LENGTH) {
    return initialAssembled;
  }

  // --- Deterministic Reduction for Oversized Prompts (> 2,048 chars) ---
  const budget = CLOUDFLARE_FLUX_MAX_PROMPT_LENGTH - ratioSuffix.length;
  if (budget <= 0) {
    throw new Error("Aspect ratio parameter is too long for Cloudflare FLUX.1 [schnell] prompt constraints.");
  }

  // 1. Strip optional NEGATIVE PROMPT block if present (FLUX focuses primarily on positive prompt directives)
  if (cleanPrompt.includes("NEGATIVE PROMPT:")) {
    cleanPrompt = cleanPrompt.split("NEGATIVE PROMPT:")[0].trim();
  }

  // 2. Compact vision audit & section headers (e.g., from automatic Vectorize image analysis)
  cleanPrompt = cleanPrompt
    .replace(/## (?:GEMINI [0-9.]+ FLASH )?VISION AUDIT:\s*/gi, "Vision Audit: ")
    .replace(/## SUBJECT MORPHOLOGY & REFERENCE ANCHORS:\s*/gi, "Anchors: ")
    .replace(/\n*-\s*Subject (?:Morphology|Identification):\s*/gi, " Subject: ")
    .replace(/\n*-\s*Pose & Structure:\s*/gi, " Pose: ")
    .replace(/\n*-\s*Silhouette & Contours:\s*/gi, " Silhouette: ")
    .replace(/\n*-\s*Distinctive Details[^:]*:\s*/gi, " Details: ")
    .replace(/\n*-\s*Dominant Color Palette:\s*|\n*-\s*Color Scheme:\s*/gi, " Colors: ")
    .replace(/\n*-\s*Vector Outline:\s*|\n*-\s*Geometric & Line Architecture:\s*/gi, " Shapes: ")
    .replace(/\n*-\s*Vector Translation Guide:\s*/gi, " Vector Guide: ")
    .replace(/\s+/g, " ")
    .trim();

  if (`${cleanPrompt}${ratioSuffix}`.length <= CLOUDFLARE_FLUX_MAX_PROMPT_LENGTH) {
    return `${cleanPrompt}${ratioSuffix}`;
  }

  // 3. Intelligently trim cleanPrompt at a safe word/separator boundary to fit budget
  let targetText = cleanPrompt.slice(0, budget);
  const lastSpaceOrSep = Math.max(
    targetText.lastIndexOf(" "),
    targetText.lastIndexOf(","),
    targetText.lastIndexOf(".")
  );

  if (lastSpaceOrSep > Math.floor(budget * 0.5)) {
    targetText = targetText.slice(0, lastSpaceOrSep).trim();
  } else {
    targetText = targetText.trim();
  }

  targetText = targetText.replace(/[,.;:]+$/, "").trim();

  if (!targetText) {
    throw new Error("Prompt exceeds the maximum allowed length of 2,048 characters for Cloudflare FLUX.1 [schnell] and could not be safely reduced.");
  }

  const finalPrompt = `${targetText}${ratioSuffix}`;

  if (finalPrompt.length > CLOUDFLARE_FLUX_MAX_PROMPT_LENGTH) {
    throw new Error("Prompt exceeds the maximum allowed length of 2,048 characters for Cloudflare FLUX.1 [schnell] and could not be safely reduced.");
  }

  return finalPrompt;
}

export async function executeCloudflareGenerateImage(
  params: CloudflareGenerateParams
): Promise<CloudflareGenerateResult> {
  const { prompt, aspectRatio } = params;
  const { accountId, apiToken } = resolveCloudflareCredentials(params);

  if (!accountId || !apiToken) {
    throw new Error(
      "Cloudflare Workers AI credentials are not configured on the server. Please set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN in server environment variables."
    );
  }

  // Validates empty/malformed prompts and enforces <= 2048 character limit
  const finalPrompt = buildCloudflarePrompt(prompt, aspectRatio);
  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/black-forest-labs/flux-1-schnell`;

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt: finalPrompt,
        steps: 4
      })
    });
  } catch (netErr: unknown) {
    throw new Error(
      `Failed to connect to Cloudflare Workers AI: ${netErr instanceof Error ? netErr.message : "Network error"}`
    );
  }

  if (response.status === 429) {
    throw new Error(
      "Cloudflare Workers AI free daily quota limit or rate limit reached (HTTP 429). Please wait a moment or explicitly switch to Gemini."
    );
  }

  if (response.status === 401 || response.status === 403) {
    throw new Error("Cloudflare Workers AI authentication failed (401/403). Please verify CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID.");
  }

  if (!response.ok) {
    let errorText = "";
    try {
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const jsonRes = await response.json();
        errorText = jsonRes.errors?.[0]?.message || jsonRes.error || JSON.stringify(jsonRes);
      } else {
        const rawText = await response.text();
        errorText = rawText.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 300);
      }
    } catch {
      errorText = response.statusText || "Upstream request failed";
    }
    throw new Error(`Cloudflare Workers AI error (${response.status}): ${errorText || response.statusText}`);
  }

  const contentType = response.headers.get("content-type") || "";
  let rawBuffer: Buffer;

  if (contentType.includes("application/json")) {
    const jsonRes = await response.json();
    if (jsonRes.result && jsonRes.result.image) {
      rawBuffer = Buffer.from(jsonRes.result.image, "base64");
    } else if (jsonRes.errors && jsonRes.errors.length > 0) {
      throw new Error(`Cloudflare Workers AI returned error: ${jsonRes.errors[0].message}`);
    } else {
      throw new Error("Unexpected JSON structure returned from Cloudflare Workers AI");
    }
  } else {
    const arrayBuf = await response.arrayBuffer();
    rawBuffer = Buffer.from(arrayBuf);
  }

  if (!rawBuffer || rawBuffer.length === 0) {
    throw new Error("Cloudflare Workers AI returned an empty response buffer");
  }

  // Inspect image format using sharp
  let pngBuffer: Buffer = rawBuffer;
  try {
    const metadata = await sharp(rawBuffer).metadata();
    if (metadata.format !== "png") {
      pngBuffer = await sharp(rawBuffer).png().toBuffer();
    }
  } catch (formatErr) {
    console.warn("Sharp failed to read image format, attempting direct PNG conversion:", formatErr);
    pngBuffer = await sharp(rawBuffer).png().toBuffer();
  }

  // Validate PNG magic bytes
  if (
    pngBuffer.length < 8 ||
    pngBuffer[0] !== 0x89 ||
    pngBuffer[1] !== 0x50 ||
    pngBuffer[2] !== 0x4e ||
    pngBuffer[3] !== 0x47 ||
    pngBuffer[4] !== 0x0d ||
    pngBuffer[5] !== 0x0a ||
    pngBuffer[6] !== 0x1a ||
    pngBuffer[7] !== 0x0a
  ) {
    throw new Error("Image buffer from Cloudflare does not contain valid PNG magic bytes");
  }

  const base64Png = pngBuffer.toString("base64");
  return {
    image: `data:image/png;base64,${base64Png}`,
    provider: "cloudflare",
    modelUsed: "@cf/black-forest-labs/flux-1-schnell"
  };
}

export interface CloudflareEditParams {
  prompt: string;
  imageBuffer?: Buffer;
  base64Image?: string;
  mimeType?: string;
  aspectRatio?: string;
  accountIdOverride?: string;
  apiTokenOverride?: string;
}

export function getDimensionsForAspectRatio(aspectRatio?: string): { width: number; height: number } {
  switch (aspectRatio) {
    case "16:9":
      return { width: 1024, height: 576 };
    case "4:3":
      return { width: 1024, height: 768 };
    case "3:4":
      return { width: 768, height: 1024 };
    case "9:16":
      return { width: 576, height: 1024 };
    case "1:1":
    default:
      return { width: 1024, height: 1024 };
  }
}

/** Longest edge for reference images sent to FLUX.2 [klein] (Cloudflare documents inputs smaller than 512x512). */
export const CLOUDFLARE_KLEIN_MAX_REFERENCE_EDGE = 512;

/** Documented reference-image field name for FLUX.2 [klein] on Workers AI (index 0 = first reference). */
export const CLOUDFLARE_KLEIN_REFERENCE_FIELD = "input_image_0";

export function buildKleinEditFormData(args: {
  prompt: string;
  image: Buffer;
  mimeType: string;
  width: number;
  height: number;
}): FormData {
  const formData = new FormData();
  formData.append("prompt", args.prompt);
  const ext = args.mimeType === "image/jpeg" ? "jpg" : "png";
  const blob = new Blob([new Uint8Array(args.image)], { type: args.mimeType });
  formData.append(CLOUDFLARE_KLEIN_REFERENCE_FIELD, blob, `reference_image.${ext}`);
  formData.append("width", String(args.width));
  formData.append("height", String(args.height));
  return formData;
}

export async function executeCloudflareEditImage(
  params: CloudflareEditParams
): Promise<CloudflareGenerateResult> {
  const { prompt, aspectRatio } = params;
  const { accountId, apiToken } = resolveCloudflareCredentials(params);

  if (!accountId || !apiToken) {
    throw new Error(
      "Cloudflare Workers AI credentials are not configured on the server. Please set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN in server environment variables."
    );
  }

  // 1. Validate prompt and enforce 2048 character limit
  const finalPrompt = buildCloudflarePrompt(prompt, aspectRatio);

  // 2. Resolve input image buffer
  let inputBuffer: Buffer;
  if (params.imageBuffer && params.imageBuffer.length > 0) {
    inputBuffer = params.imageBuffer;
  } else if (params.base64Image && typeof params.base64Image === "string") {
    const cleanB64 = params.base64Image.replace(/^data:image\/[a-zA-Z0-9+-]+;base64,/, "").trim();
    if (!cleanB64) {
      throw new Error("Reference image is required for Cloudflare image-to-image editing.");
    }
    inputBuffer = Buffer.from(cleanB64, "base64");
  } else {
    throw new Error("Reference image is required for Cloudflare image-to-image editing.");
  }

  if (!inputBuffer || inputBuffer.length === 0) {
    throw new Error("Reference image buffer is empty or invalid.");
  }

  // Enforce 20MB max upload limit
  if (inputBuffer.length > 20 * 1024 * 1024) {
    throw new Error("Reference image exceeds maximum allowed upload size of 20MB.");
  }

  // 3. Validate image format & dimensions with sharp, preprocess (max 512px longest edge per Cloudflare's documented
  //    FLUX.2 [klein] reference-image limit, preserve transparency)
  let verifiedMime = "image/png";
  let processedBuffer: Buffer;
  try {
    const imageInstance = sharp(inputBuffer);
    const metadata = await imageInstance.metadata();
    if (!metadata || !metadata.format || !metadata.width || !metadata.height) {
      throw new Error("Corrupted or invalid image metadata.");
    }

    if (metadata.width < 16 || metadata.height < 16) {
      throw new Error("Reference image dimensions are too small (minimum 16x16 pixels required).");
    }
    if (metadata.width > 4096 || metadata.height > 4096) {
      throw new Error("Reference image dimensions exceed maximum allowed size of 4096x4096 pixels.");
    }

    // Resize to the documented reference-image bound while preserving aspect ratio, without enlargement
    const resized = imageInstance.resize(CLOUDFLARE_KLEIN_MAX_REFERENCE_EDGE, CLOUDFLARE_KLEIN_MAX_REFERENCE_EDGE, {
      fit: "inside",
      withoutEnlargement: true
    });

    // Preserve transparency / quality by exporting as PNG for vector/logo/transparent assets
    if (metadata.hasAlpha || metadata.format === "png" || metadata.format === "webp" || metadata.format === "svg") {
      processedBuffer = await resized.png().toBuffer();
      verifiedMime = "image/png";
    } else if (metadata.format === "jpeg" || metadata.format === "jpg") {
      processedBuffer = await resized.jpeg({ quality: 92 }).toBuffer();
      verifiedMime = "image/jpeg";
    } else {
      processedBuffer = await resized.png().toBuffer();
      verifiedMime = "image/png";
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Unsupported or corrupted reference image format: ${msg}`);
  }

  // 4. Build multipart/form-data payload for FLUX.2 [klein] 4B.
  //    Documented schema (developers.cloudflare.com/changelog/post/2026-01-15-flux-2-klein-4b-workers-ai):
  //    reference images MUST be named input_image_0..input_image_3 (binary). Any other field name is not
  //    a reference image, so the model would silently run as text-to-image.
  const { width, height } = getDimensionsForAspectRatio(aspectRatio);
  const formData = buildKleinEditFormData({
    prompt: finalPrompt,
    image: processedBuffer,
    mimeType: verifiedMime,
    width,
    height
  });

  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/black-forest-labs/flux-2-klein-4b`;

  // 5. Execute request with timeout, retry policy (exponential backoff + jitter), and Retry-After handling
  const maxAttempts = 3;
  const overallDeadlineMs = 90000;
  const startTime = Date.now();
  let attempt = 0;
  let response: Response | null = null;
  let lastError: Error | null = null;

  while (attempt < maxAttempts) {
    attempt++;
    if (Date.now() - startTime > overallDeadlineMs) {
      throw new Error("Cloudflare Workers AI request timed out (overall deadline exceeded).");
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);

    try {
      response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`
        },
        body: formData,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      // Emit sanitized diagnostic logging
      try {
        const origMeta = await sharp(inputBuffer).metadata().catch(() => ({ width: 0, height: 0, format: "unknown" }));
        const procMeta = await sharp(processedBuffer).metadata().catch(() => ({ width: 0, height: 0, format: "unknown" }));
        const diagMeta = {
          requestId: `cf_req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
          provider: "cloudflare",
          modelUsed: "@cf/black-forest-labs/flux-2-klein-4b",
          hasReference: true,
          editEndpointSelected: true,
          before: {
            width: origMeta.width || 0,
            height: origMeta.height || 0,
            mimeType: origMeta.format || "unknown",
            byteSize: inputBuffer.length
          },
          after: {
            width: procMeta.width || 0,
            height: procMeta.height || 0,
            mimeType: verifiedMime,
            byteSize: processedBuffer.length
          },
          imageInputIncluded: true,
          httpStatus: response.status
        };
        console.log("[Cloudflare Diagnostics]", JSON.stringify(diagMeta));
      } catch (logErr) {
        console.warn("Failed to emit Cloudflare diagnostics log:", logErr);
      }

      if (response.ok || response.status === 400 || response.status === 401 || response.status === 403) {
        break; // Non-retryable status or success
      }

      // Check if retryable (429 or 5xx)
      if (response.status === 429 || (response.status >= 500 && response.status <= 599)) {
        if (attempt >= maxAttempts) break;

        let retryAfterMs = 2000 * Math.pow(2, attempt - 1) + Math.random() * 1000;
        const retryAfterHeader = response.headers.get("retry-after");
        if (retryAfterHeader) {
          const parsedSeconds = parseInt(retryAfterHeader, 10);
          if (!isNaN(parsedSeconds)) {
            retryAfterMs = Math.max(retryAfterMs, parsedSeconds * 1000);
          } else {
            const parsedDate = Date.parse(retryAfterHeader);
            if (!isNaN(parsedDate)) {
              retryAfterMs = Math.max(retryAfterMs, parsedDate - Date.now());
            }
          }
        }

        await new Promise((resolve) => setTimeout(resolve, Math.min(retryAfterMs, 15000)));
        continue;
      } else {
        break;
      }
    } catch (netErr: unknown) {
      clearTimeout(timeoutId);
      lastError = netErr instanceof Error ? netErr : new Error("Network error");
      if (attempt >= maxAttempts) {
        throw new Error(`Failed to connect to Cloudflare Workers AI after ${maxAttempts} attempts: ${lastError.message}`);
      }
      const backoffMs = 1500 * Math.pow(2, attempt - 1) + Math.random() * 500;
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
    }
  }

  if (!response) {
    throw new Error(`Failed to connect to Cloudflare Workers AI: ${lastError?.message || "No response received"}`);
  }

  if (response.status === 429) {
    throw new Error(
      "Cloudflare Workers AI free daily quota limit or rate limit reached (HTTP 429). Please wait a moment or explicitly switch to Gemini."
    );
  }

  if (response.status === 401 || response.status === 403) {
    throw new Error("Cloudflare Workers AI authentication failed (401/403). Please verify CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID.");
  }

  if (!response.ok) {
    let errorText = "";
    try {
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const jsonRes = await response.json();
        errorText = jsonRes.errors?.[0]?.message || jsonRes.error || JSON.stringify(jsonRes);
      } else {
        const rawText = await response.text();
        errorText = rawText.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 300);
      }
    } catch {
      errorText = response.statusText || "Upstream request failed";
    }
    throw new Error(`Cloudflare Workers AI error (${response.status}): ${errorText || response.statusText}`);
  }

  const contentType = response.headers.get("content-type") || "";
  let rawBuffer: Buffer;

  if (contentType.includes("application/json")) {
    const jsonRes = await response.json();
    if (jsonRes.result && jsonRes.result.image) {
      rawBuffer = Buffer.from(jsonRes.result.image, "base64");
    } else if (jsonRes.errors && jsonRes.errors.length > 0) {
      throw new Error(`Cloudflare Workers AI returned error: ${jsonRes.errors[0].message}`);
    } else {
      throw new Error("Unexpected JSON structure returned from Cloudflare Workers AI");
    }
  } else {
    const arrayBuf = await response.arrayBuffer();
    rawBuffer = Buffer.from(arrayBuf);
  }

  if (!rawBuffer || rawBuffer.length === 0) {
    throw new Error("Cloudflare Workers AI returned an empty response buffer");
  }

  // Inspect image format using sharp & convert to verified PNG
  let pngBuffer: Buffer;
  try {
    const metadata = await sharp(rawBuffer).metadata();
    if (!metadata || !metadata.format) {
      throw new Error("Upstream response is not a valid image format.");
    }
    pngBuffer = await sharp(rawBuffer).png().toBuffer();
  } catch (formatErr) {
    const msg = formatErr instanceof Error ? formatErr.message : String(formatErr);
    throw new Error(`Failed to decode image response from Cloudflare Workers AI: ${msg}`);
  }

  // Validate PNG magic bytes
  if (
    pngBuffer.length < 8 ||
    pngBuffer[0] !== 0x89 ||
    pngBuffer[1] !== 0x50 ||
    pngBuffer[2] !== 0x4e ||
    pngBuffer[3] !== 0x47 ||
    pngBuffer[4] !== 0x0d ||
    pngBuffer[5] !== 0x0a ||
    pngBuffer[6] !== 0x1a ||
    pngBuffer[7] !== 0x0a
  ) {
    throw new Error("Image buffer from Cloudflare does not contain valid PNG magic bytes");
  }

  const base64Png = pngBuffer.toString("base64");
  return {
    image: `data:image/png;base64,${base64Png}`,
    provider: "cloudflare",
    modelUsed: "@cf/black-forest-labs/flux-2-klein-4b"
  };
}

