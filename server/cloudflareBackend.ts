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

export function buildCloudflarePrompt(prompt: string, aspectRatio?: string): string {
  const cleanPrompt = (prompt || "").trim();
  if (!aspectRatio) return cleanPrompt;

  const ratioMap: Record<string, string> = {
    "1:1": "square 1:1 aspect ratio",
    "16:9": "widescreen 16:9 aspect ratio",
    "4:3": "standard 4:3 aspect ratio",
    "3:4": "portrait 3:4 aspect ratio",
    "9:16": "vertical 9:16 aspect ratio"
  };

  const ratioDescriptor = ratioMap[aspectRatio] || `${aspectRatio} aspect ratio`;
  return `${cleanPrompt}, ${ratioDescriptor}`;
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

  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    throw new Error("Prompt is required and must be a non-empty string");
  }

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
        num_steps: 4
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
    const errorText = await response.text().catch(() => "");
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
