import test from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import {
  buildCloudflarePrompt,
  resolveCloudflareCredentials,
  executeCloudflareGenerateImage,
  executeCloudflareEditImage,
  getDimensionsForAspectRatio,
  CLOUDFLARE_FLUX_MAX_PROMPT_LENGTH
} from "../server/cloudflareBackend";
import { resolveModelRoute, modelRegistry } from "../src/services/modelRegistry";

test("Cloudflare: Prompt builder appends aspect ratio descriptors correctly", () => {
  assert.equal(buildCloudflarePrompt("A sleek modern logo"), "A sleek modern logo");
  assert.equal(
    buildCloudflarePrompt("A sleek modern logo", "1:1"),
    "A sleek modern logo, square 1:1 aspect ratio"
  );
  assert.equal(
    buildCloudflarePrompt("A cinematic scene", "16:9"),
    "A cinematic scene, widescreen 16:9 aspect ratio"
  );
  assert.equal(
    buildCloudflarePrompt("A portrait design", "3:4"),
    "A portrait design, portrait 3:4 aspect ratio"
  );
});

test("Cloudflare: Prompt below the 2048 character limit is preserved intact", () => {
  const shortPrompt = "A minimalist cyberpunk samurai logo with bold red typography and sharp geometric vector outlines.";
  const result = buildCloudflarePrompt(shortPrompt, "1:1");
  assert.ok(result.length <= CLOUDFLARE_FLUX_MAX_PROMPT_LENGTH);
  assert.ok(result.startsWith(shortPrompt));
  assert.ok(result.endsWith("square 1:1 aspect ratio"));
});

test("Cloudflare: Prompt exactly at the 2048 character limit is returned at exactly 2048 characters", () => {
  const ratioSuffix = ", square 1:1 aspect ratio";
  const exactLengthPrompt = "a".repeat(CLOUDFLARE_FLUX_MAX_PROMPT_LENGTH - ratioSuffix.length);
  const result = buildCloudflarePrompt(exactLengthPrompt, "1:1");
  assert.equal(result.length, CLOUDFLARE_FLUX_MAX_PROMPT_LENGTH);
  assert.ok(result.endsWith(ratioSuffix));
});

test("Cloudflare: Prompt above 2048 characters is deterministically reduced to <= 2048 characters", () => {
  const longBaseText = "Professional high quality vector art logo design featuring a futuristic mechanical wolf emblem. ".repeat(30);
  const totalLengthOriginal = longBaseText.length;
  assert.ok(totalLengthOriginal > 2048);

  const result = buildCloudflarePrompt(longBaseText, "16:9");
  assert.ok(result.length <= CLOUDFLARE_FLUX_MAX_PROMPT_LENGTH);
  assert.ok(result.startsWith("Professional high quality vector art logo design"));
  assert.ok(result.endsWith("widescreen 16:9 aspect ratio"));
});

test("Cloudflare: Prompts expanded by automatic Vectorize instructions are safely reduced <= 2048 chars", () => {
  const userPrompt = "A sleek metallic crest logo";
  const vectorizeVisionAudit = `
## GEMINI 3.8 FLASH VISION AUDIT:
- Subject Morphology: Detailed mechanical eagle shield with layered chrome feather plates, sharp angular wings, and polished obsidian beak.
- Dominant Color Palette: Metallic gold, brushed silver, midnight dark navy blue, and glowing neon amber highlights.
- Vector Outline: Sharp precision paths, uniform stroke density, isometric symmetry, and bold outer silhouette contours.
DIRECTIVE: Recreate this subject as clean, flat 2D vector art with solid fills, crisp geometry, and zero gradient artifacts.
  `.repeat(10); // Exceeds 2,048 characters when combined

  const fullPrompt = `${userPrompt}\n\n${vectorizeVisionAudit}\n\nNEGATIVE PROMPT:\nphotorealistic 3D render, noisy gradients, blur, signature, watermark`;

  const result = buildCloudflarePrompt(fullPrompt, "1:1");
  assert.ok(result.length <= CLOUDFLARE_FLUX_MAX_PROMPT_LENGTH);
  assert.ok(result.includes("A sleek metallic crest logo"));
  assert.ok(result.endsWith("square 1:1 aspect ratio"));
});

test("Cloudflare: Empty or malformed prompts throw actionable validation errors", () => {
  assert.throws(
    () => buildCloudflarePrompt(""),
    /Prompt is required and must be a non-empty string/
  );
  assert.throws(
    () => buildCloudflarePrompt("   \n\t  "),
    /Prompt is required and must be a non-empty string/
  );
  assert.throws(
    () => buildCloudflarePrompt(null as unknown as string),
    /Prompt is required and must be a non-empty string/
  );
  assert.throws(
    () => buildCloudflarePrompt(undefined as unknown as string),
    /Prompt is required and must be a non-empty string/
  );
});

test("Cloudflare: Aspect ratio dimension mapper returns correct pixel bounds for FLUX.2 klein 4B", () => {
  assert.deepEqual(getDimensionsForAspectRatio("1:1"), { width: 1024, height: 1024 });
  assert.deepEqual(getDimensionsForAspectRatio("16:9"), { width: 1024, height: 576 });
  assert.deepEqual(getDimensionsForAspectRatio("4:3"), { width: 1024, height: 768 });
  assert.deepEqual(getDimensionsForAspectRatio("3:4"), { width: 768, height: 1024 });
  assert.deepEqual(getDimensionsForAspectRatio("9:16"), { width: 576, height: 1024 });
});

test("Cloudflare: Image editing throws error when reference image is missing or invalid", async () => {
  const origAccount = process.env.CLOUDFLARE_ACCOUNT_ID;
  const origToken = process.env.CLOUDFLARE_API_TOKEN;

  process.env.CLOUDFLARE_ACCOUNT_ID = "test-acc";
  process.env.CLOUDFLARE_API_TOKEN = "test-tok";

  await assert.rejects(
    async () => {
      await executeCloudflareEditImage({ prompt: "Recolor decal" });
    },
    /Reference image is required for Cloudflare image-to-image editing/
  );

  await assert.rejects(
    async () => {
      await executeCloudflareEditImage({
        prompt: "Recolor decal",
        imageBuffer: Buffer.from("invalid non-image bytes")
      });
    },
    /Unsupported or corrupted reference image format/
  );

  process.env.CLOUDFLARE_ACCOUNT_ID = origAccount;
  process.env.CLOUDFLARE_API_TOKEN = origToken;
});

test("Cloudflare: Image editing successfully processes valid PNG image buffer and constructs FLUX.2 klein payload", async () => {
  const origAccount = process.env.CLOUDFLARE_ACCOUNT_ID;
  const origToken = process.env.CLOUDFLARE_API_TOKEN;

  process.env.CLOUDFLARE_ACCOUNT_ID = "mock-acc-123";
  process.env.CLOUDFLARE_API_TOKEN = "mock-tok-456";

  // Create a 16x16 valid dummy PNG buffer with sharp
  const validPngBuffer = await sharp({
    create: {
      width: 16,
      height: 16,
      channels: 4,
      background: { r: 0, g: 128, b: 255, alpha: 1 }
    }
  })
    .png()
    .toBuffer();

  const originalFetch = globalThis.fetch;
  let interceptedUrl = "";
  let interceptedHeaders: Record<string, string> = {};
  let interceptedBody: FormData | null = null;

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    interceptedUrl = String(input);
    interceptedHeaders = (init?.headers as Record<string, string>) || {};
    interceptedBody = (init?.body as FormData) || null;

    return new Response(validPngBuffer, {
      status: 200,
      headers: { "Content-Type": "image/png" }
    });
  };

  try {
    const result = await executeCloudflareEditImage({
      prompt: "Recolor fairing to electric blue with sharp white vector decals",
      imageBuffer: validPngBuffer,
      aspectRatio: "16:9"
    });

    assert.equal(result.provider, "cloudflare");
    assert.equal(result.modelUsed, "@cf/black-forest-labs/flux-2-klein-4b");
    assert.ok(result.image.startsWith("data:image/png;base64,"));

    assert.ok(interceptedUrl.includes("@cf/black-forest-labs/flux-2-klein-4b"));
    assert.equal(interceptedHeaders.Authorization, "Bearer mock-tok-456");
    assert.ok(interceptedBody !== null);
    assert.equal(interceptedBody.get("prompt")?.toString().includes("Recolor fairing"), true);
    assert.equal(interceptedBody.get("width"), "1024");
    assert.equal(interceptedBody.get("height"), "576");
    assert.ok(interceptedBody.get("image_1") !== null);
  } finally {
    globalThis.fetch = originalFetch;
    process.env.CLOUDFLARE_ACCOUNT_ID = origAccount;
    process.env.CLOUDFLARE_API_TOKEN = origToken;
  }
});

test("Cloudflare: Credential resolution checks overrides and environment variables", () => {
  const origAccount = process.env.CLOUDFLARE_ACCOUNT_ID;
  const origToken = process.env.CLOUDFLARE_API_TOKEN;

  process.env.CLOUDFLARE_ACCOUNT_ID = "env-acc-123";
  process.env.CLOUDFLARE_API_TOKEN = "env-tok-456";

  const resolvedEnv = resolveCloudflareCredentials();
  assert.equal(resolvedEnv.accountId, "env-acc-123");
  assert.equal(resolvedEnv.apiToken, "env-tok-456");

  const resolvedOverride = resolveCloudflareCredentials({
    accountIdOverride: "override-acc-789",
    apiTokenOverride: "override-tok-012"
  });
  assert.equal(resolvedOverride.accountId, "override-acc-789");
  assert.equal(resolvedOverride.apiToken, "override-tok-012");

  process.env.CLOUDFLARE_ACCOUNT_ID = origAccount;
  process.env.CLOUDFLARE_API_TOKEN = origToken;
});

test("Cloudflare: Missing credentials throw an informative error", async () => {
  const origAccount = process.env.CLOUDFLARE_ACCOUNT_ID;
  const origToken = process.env.CLOUDFLARE_API_TOKEN;

  delete process.env.CLOUDFLARE_ACCOUNT_ID;
  delete process.env.CLOUDFLARE_API_TOKEN;

  await assert.rejects(
    async () => {
      await executeCloudflareGenerateImage({ prompt: "Test prompt" });
    },
    /Cloudflare Workers AI credentials are not configured/
  );

  await assert.rejects(
    async () => {
      await executeCloudflareEditImage({
        prompt: "Test prompt",
        base64Image: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
      });
    },
    /Cloudflare Workers AI credentials are not configured/
  );

  process.env.CLOUDFLARE_ACCOUNT_ID = origAccount;
  process.env.CLOUDFLARE_API_TOKEN = origToken;
});

test("Cloudflare: Sharp verifies and converts non-PNG buffers into valid PNG magic bytes", async () => {
  // Create a 10x10 dummy JPEG buffer with sharp
  const jpegBuffer = await sharp({
    create: {
      width: 10,
      height: 10,
      channels: 4,
      background: { r: 255, g: 0, b: 0, alpha: 1 }
    }
  })
    .jpeg()
    .toBuffer();

  // Confirm input is JPEG (magic bytes 0xFF, 0xD8)
  assert.equal(jpegBuffer[0], 0xff);
  assert.equal(jpegBuffer[1], 0xd8);

  // Convert JPEG to PNG with sharp
  const convertedPng = await sharp(jpegBuffer).png().toBuffer();

  // Validate PNG magic bytes: 0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A
  assert.equal(convertedPng[0], 0x89);
  assert.equal(convertedPng[1], 0x50); // 'P'
  assert.equal(convertedPng[2], 0x4e); // 'N'
  assert.equal(convertedPng[3], 0x47); // 'G'
  assert.equal(convertedPng[4], 0x0d);
  assert.equal(convertedPng[5], 0x0a);
  assert.equal(convertedPng[6], 0x1a);
  assert.equal(convertedPng[7], 0x0a);
});

test("Model Registry: Cloudflare FLUX model registered with zero-cost tier and supports reference images", () => {
  const cfEntry = modelRegistry["cf-flux"];
  assert.ok(cfEntry);
  assert.equal(cfEntry.provider, "cloudflare");
  assert.equal(cfEntry.modelId, "@cf/black-forest-labs/flux-1-schnell");
  assert.equal(cfEntry.supportsReferenceImages, true);
  assert.equal(cfEntry.billingStatus, "Free tier with quota");

  // Route resolution test
  assert.equal(resolveModelRoute("cf-flux").id, "cf-flux");
  assert.equal(resolveModelRoute("cloudflare").id, "cf-flux");
  assert.equal(resolveModelRoute("flux").id, "cf-flux");
});

test("Image Service: Preset with previewImagePath ONLY uses text-to-image (FLUX.1 schnell) without reference bytes", async () => {
  const { generateImage } = await import("../src/services/imageService");
  const originalFetch = globalThis.fetch;
  let targetEndpoint = "";

  globalThis.fetch = async (input: RequestInfo | URL): Promise<Response> => {
    targetEndpoint = String(input);
    return new Response(JSON.stringify({ image: "data:image/png;base64,dummyPngData", modelUsed: "@cf/black-forest-labs/flux-1-schnell" }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  };

  try {
    const res = await generateImage({
      providerOverride: "cloudflare",
      prompt: "Brutalist poster",
      preset: {
        name: "Brutalist Preset",
        previewImagePath: "/Elite_72_Library_Organized/Brutalist/Brutalist_01.jpg"
      }
    });

    assert.equal(res.provider, "cloudflare");
    assert.equal(res.modelUsed, "@cf/black-forest-labs/flux-1-schnell");
    assert.ok(targetEndpoint.includes("/api/cloudflare/generate-image"));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("Image Service: User-uploaded base64Image routes to image editing (FLUX.2 klein 4B)", async () => {
  const { generateImage } = await import("../src/services/imageService");
  const originalFetch = globalThis.fetch;
  let targetEndpoint = "";

  const dummyB64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

  globalThis.fetch = async (input: RequestInfo | URL): Promise<Response> => {
    targetEndpoint = String(input);
    return new Response(JSON.stringify({ image: "data:image/png;base64,editedPngData", modelUsed: "@cf/black-forest-labs/flux-2-klein-4b" }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  };

  try {
    const res = await generateImage({
      providerOverride: "cloudflare",
      prompt: "Make background neon yellow",
      base64Image: dummyB64,
      mimeType: "image/png"
    });

    assert.equal(res.provider, "cloudflare");
    assert.equal(res.modelUsed, "@cf/black-forest-labs/flux-2-klein-4b");
    assert.ok(targetEndpoint.includes("/api/cloudflare/edit-image"));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("Image Service: Failed reference resolution throws explicit error without falling back to text-to-image or Gemini", async () => {
  const { generateImage } = await import("../src/services/imageService");
  const originalFetch = globalThis.fetch;

  // Mock fetch to simulate failed reference download
  globalThis.fetch = async (): Promise<Response> => {
    return new Response("Not found", { status: 404 });
  };

  try {
    await assert.rejects(
      async () => {
        await generateImage({
          providerOverride: "cloudflare",
          prompt: "Style transfer",
          preset: {
            name: "Unresolvable Reference Preset",
            referenceImagePath: "http://localhost/non-existent-image.jpg"
          }
        });
      },
      /Failed to resolve reference image for generation/
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});



