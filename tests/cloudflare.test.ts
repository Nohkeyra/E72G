import test from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import {
  buildCloudflarePrompt,
  resolveCloudflareCredentials,
  executeCloudflareGenerateImage
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

test("Model Registry: Cloudflare FLUX model registered with zero-cost tier and no reference support", () => {
  const cfEntry = modelRegistry["cf-flux"];
  assert.ok(cfEntry);
  assert.equal(cfEntry.provider, "cloudflare");
  assert.equal(cfEntry.modelId, "@cf/black-forest-labs/flux-1-schnell");
  assert.equal(cfEntry.supportsReferenceImages, false);
  assert.equal(cfEntry.billingStatus, "Free tier with quota");

  // Route resolution test
  assert.equal(resolveModelRoute("cf-flux").id, "cf-flux");
  assert.equal(resolveModelRoute("cloudflare").id, "cf-flux");
  assert.equal(resolveModelRoute("flux").id, "cf-flux");
});
