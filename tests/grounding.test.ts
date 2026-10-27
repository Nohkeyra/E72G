import test from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import {
  executeAnalyzeVector,
  parseVectorAnalysisText,
  sha256OfBase64Image,
  VectorAnalysisError,
  type VectorVisionCall
} from "../server/geminiBackend";
import {
  VectorAnalysisCache,
  fingerprintImage,
  groundVectorSubject,
  sha256OfImage
} from "../src/services/vectorGrounding";
import type { VectorAnalyzeOutcome } from "../src/services/geminiService";
import { VectorModule } from "../src/modules/vector/VectorStrategy";
import { generateImage } from "../src/services/imageService";
import { modelRegistry } from "../src/services/modelRegistry";

// NOTE: every test here uses MOCKED vision/provider calls. None of them is a live inference test.

/** Deterministic synthetic "glass of water" stand-in: a pale blue rounded rectangle on a dark background. */
async function makeImage(color: { r: number; g: number; b: number }): Promise<string> {
  const buf = await sharp({ create: { width: 64, height: 96, channels: 3, background: color } })
    .png()
    .toBuffer();
  return `data:image/png;base64,${buf.toString("base64")}`;
}

const GLASS_TEXT = `SUBJECT: glass of water
DESCRIPTION: A clear drinking glass filled with water, upright
SILHOUETTE: Tall cylindrical tumbler
DETAILS: Transparent rim, water line
COLORS: pale blue, white highlights
SHAPES: cylinder
VECTOR_ADVICE: flat fills`;

function scriptedVision(answers: string[]): { call: VectorVisionCall; calls: unknown[][] } {
  const calls: unknown[][] = [];
  let i = 0;
  return {
    calls,
    call: async (parts) => {
      calls.push(parts);
      return answers[i++] ?? "";
    }
  };
}

test("Grounding: analysis of a glass-of-water image is bound to the exact uploaded bytes and sent image is identical", async () => {
  const img = await makeImage({ r: 180, g: 220, b: 255 });
  const v = scriptedVision([GLASS_TEXT, '{"observedSubject":"glass of water","matches":true}']);

  const result = await executeAnalyzeVector({ base64Image: img, mimeType: "image/png", apiKey: "k" }, v.call);

  assert.equal(result.subjectName, "glass of water");
  assert.equal(result.imageSha256, sha256OfBase64Image(img));
  assert.equal(result.imageSha256, await sha256OfImage(img), "server and client hashes agree");

  // The image part sent to the vision model (both the analysis and verification calls) is the uploaded image.
  const raw = img.split(",")[1];
  for (const parts of v.calls) {
    const inline = (parts[0] as { inlineData: { data: string } }).inlineData;
    assert.equal(inline.data, raw);
  }

  // The generation prompt names the verified subject.
  const prompt = VectorModule.constructPrompt({
    prompt: "vectorize this image",
    preset: { name: "p", basePrompt: "Vector illustration of [Subject].", aspectRatio: "1:1" },
    base64Image: img,
    vectorAnalysis: result
  } as never);
  assert.ok(prompt.includes("GLASS OF WATER"));
});

test("Grounding: the same uploaded bytes reach the Cloudflare edit endpoint unchanged", async () => {
  const img = await makeImage({ r: 180, g: 220, b: 255 });
  const originalFetch = globalThis.fetch;
  let url = "";
  let sent: { base64Image?: string; mimeType?: string } = {};
  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    url = String(input);
    sent = JSON.parse(String(init?.body));
    return new Response(JSON.stringify({ image: "data:image/png;base64,AA==", modelUsed: "@cf/black-forest-labs/flux-2-klein-4b" }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  };
  try {
    await generateImage({ providerOverride: "cloudflare", prompt: "vector glass", base64Image: img, mimeType: "image/png" });
    assert.ok(url.includes("/api/cloudflare/edit-image"));
    assert.equal(sent.base64Image, img);
    assert.equal(sent.mimeType, "image/png");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("Grounding: analysis that fails verification is rejected, not used", async () => {
  const img = await makeImage({ r: 180, g: 220, b: 255 });
  const wrong = GLASS_TEXT.replace("glass of water", "young woman portrait");
  const v = scriptedVision([wrong, '{"observedSubject":"glass of water","matches":false}']);

  await assert.rejects(
    () => executeAnalyzeVector({ base64Image: img, mimeType: "image/png", apiKey: "k" }, v.call),
    (e: unknown) => e instanceof VectorAnalysisError && e.code === "inconsistent" && e.observedSubject === "glass of water"
  );
});

test("Grounding: unparseable analysis is rejected instead of filled with fabricated defaults", () => {
  assert.throws(() => parseVectorAnalysisText("I cannot describe this."), (e: unknown) => e instanceof VectorAnalysisError && e.code === "unparseable");
  const ok = parseVectorAnalysisText(GLASS_TEXT);
  assert.equal(ok.subjectName, "glass of water");
});

test("Grounding: unreadable verification response is rejected", async () => {
  const img = await makeImage({ r: 1, g: 2, b: 3 });
  const v = scriptedVision([GLASS_TEXT, "looks fine to me"]);
  await assert.rejects(
    () => executeAnalyzeVector({ base64Image: img, mimeType: "image/png", apiKey: "k" }, v.call),
    (e: unknown) => e instanceof VectorAnalysisError && e.code === "unparseable"
  );
});

test("Grounding cache: a different upload never reuses another image's analysis", async () => {
  const imgA = await makeImage({ r: 10, g: 20, b: 30 });
  const imgB = await makeImage({ r: 200, g: 100, b: 50 });
  assert.notEqual(fingerprintImage(imgA), fingerprintImage(imgB));

  const cache = new VectorAnalysisCache();
  let analyzeCalls = 0;
  const analyzeFor = (name: string) => async (image: string): Promise<VectorAnalyzeOutcome> => {
    analyzeCalls++;
    return { ok: true, data: { subjectName: name, description: name, colors: "", shapes: "", imageSha256: await sha256OfImage(image) } };
  };

  const a1 = await groundVectorSubject({ imageDataUrl: imgA, mimeType: "image/png", cache, analyze: analyzeFor("glass of water") });
  assert.equal(a1.status === "grounded" && a1.fromCache, false);

  const a2 = await groundVectorSubject({ imageDataUrl: imgA, mimeType: "image/png", cache, analyze: analyzeFor("SHOULD NOT RUN") });
  assert.ok(a2.status === "grounded" && a2.fromCache && a2.analysis.subjectName === "glass of water");
  assert.equal(analyzeCalls, 1);

  const b = await groundVectorSubject({ imageDataUrl: imgB, mimeType: "image/png", cache, analyze: analyzeFor("red apple") });
  assert.ok(b.status === "grounded" && !b.fromCache && b.analysis.subjectName === "red apple");
  assert.equal(analyzeCalls, 2);
});

test("Grounding cache: images sharing the first 100 characters (old cache key) are still distinguished", async () => {
  const base = await makeImage({ r: 0, g: 0, b: 0 });
  const twin = base.slice(0, 120) + (base[120] === "A" ? "B" : "A") + base.slice(121);
  assert.equal(base.slice(0, 100), twin.slice(0, 100));
  assert.equal(base.length, twin.length);
  assert.notEqual(fingerprintImage(base), fingerprintImage(twin));
});

test("Grounding: stale/mismatched analysis (bound to a different image) is discarded", async () => {
  const imgA = await makeImage({ r: 10, g: 20, b: 30 });
  const imgB = await makeImage({ r: 200, g: 100, b: 50 });
  const cache = new VectorAnalysisCache();
  const res = await groundVectorSubject({
    imageDataUrl: imgB,
    mimeType: "image/png",
    cache,
    analyze: async () => ({
      ok: true,
      data: { subjectName: "glass of water", description: "x", colors: "", shapes: "", imageSha256: await sha256OfImage(imgA) }
    })
  });
  assert.equal(res.status, "rejected");
  assert.equal(cache.get(await sha256OfImage(imgB)), null);

  const unbound = await groundVectorSubject({
    imageDataUrl: imgB,
    mimeType: "image/png",
    cache,
    analyze: async () => ({ ok: true, data: { subjectName: "x", description: "x", colors: "", shapes: "" } })
  });
  assert.equal(unbound.status, "rejected");
});

test("Grounding: rejected vs unavailable analysis outcomes are distinguished", async () => {
  const img = await makeImage({ r: 5, g: 5, b: 5 });
  const cache = new VectorAnalysisCache();
  const rejected = await groundVectorSubject({
    imageDataUrl: img, mimeType: "image/png", cache,
    analyze: async () => ({ ok: false, kind: "rejected", error: "mismatch" })
  });
  assert.deepEqual(rejected, { status: "rejected", reason: "mismatch" });
  const unavailable = await groundVectorSubject({
    imageDataUrl: img, mimeType: "image/png", cache,
    analyze: async () => ({ ok: false, kind: "unavailable", error: "no key" })
  });
  assert.deepEqual(unavailable, { status: "unavailable", reason: "no key" });
});

test("Capability: a model without reference-image support gives a clear error and sends no request", async () => {
  const originalFetch = globalThis.fetch;
  let fetched = false;
  globalThis.fetch = async () => { fetched = true; return new Response("{}"); };
  const entry = modelRegistry["cf-flux"];
  const prev = entry.supportsReferenceImages;
  entry.supportsReferenceImages = false;
  try {
    await assert.rejects(
      () => generateImage({ modelId: "cf-flux", prompt: "p", base64Image: "AAAA", mimeType: "image/png" }),
      /does not support reference-image generation/
    );
    assert.equal(fetched, false);
  } finally {
    entry.supportsReferenceImages = prev;
    globalThis.fetch = originalFetch;
  }
});

test("Gemini path: text-only Imagen fallback is NOT used when a reference image is present (mocked HTTP)", async () => {
  const { executeGenerateImage } = await import("../server/geminiBackend");
  const originalFetch = globalThis.fetch;
  const urls: string[] = [];
  globalThis.fetch = async (input: RequestInfo | URL): Promise<Response> => {
    urls.push(String(input));
    return new Response(JSON.stringify({ error: { code: 404, message: "model not found", status: "NOT_FOUND" } }), {
      status: 404,
      headers: { "Content-Type": "application/json" }
    });
  };
  try {
    const img = await makeImage({ r: 1, g: 2, b: 3 });
    await assert.rejects(() =>
      executeGenerateImage({ prompt: "p", base64Image: img, mimeType: "image/png", apiKey: "fake", isPersonal: true })
    );
    assert.ok(urls.length > 0);
    assert.equal(urls.some((u) => u.toLowerCase().includes("imagen")), false);

    urls.length = 0;
    await assert.rejects(() => executeGenerateImage({ prompt: "p", apiKey: "fake", isPersonal: true }));
    assert.equal(urls.some((u) => u.toLowerCase().includes("imagen")), true, "text-only requests keep the Imagen fallback");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

// ---- Optional Cloudflare vision analysis + analysis mode (mocked HTTP; NOT live) ----

test("Analysis mode & default model: defaults to off and cf-flux", async () => {
  const { useAppStore } = await import("../src/store/useAppStore");
  assert.equal(useAppStore.getState().vectorAnalysisMode, "off");
  assert.equal(useAppStore.getState().selectedModel, "cf-flux");
});

test("Cloudflare vision: sends documented tutorial shape (messages + image data URL) and parses result.response", async () => {
  const { executeCloudflareAnalyzeVector, CLOUDFLARE_VISION_MODEL } = await import("../server/cloudflareBackend");
  const img = await makeImage({ r: 180, g: 220, b: 255 });
  const originalFetch = globalThis.fetch;
  const bodies: { url: string; body: Record<string, unknown> }[] = [];
  const replies = [GLASS_TEXT, '{"observedSubject":"glass of water","matches":true}'];
  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    bodies.push({ url: String(input), body: JSON.parse(String(init?.body)) });
    return new Response(JSON.stringify({ success: true, result: { response: replies.shift() } }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  };
  try {
    const out = await executeCloudflareAnalyzeVector({
      base64Image: img,
      mimeType: "image/png",
      accountIdOverride: "acct",
      apiTokenOverride: "tok"
    });
    assert.equal(out.subjectName, "glass of water");
    assert.equal(out.imageSha256, sha256OfBase64Image(img));
    for (const b of bodies) {
      assert.ok(b.url.endsWith(`/accounts/acct/ai/run/${CLOUDFLARE_VISION_MODEL}`));
      assert.equal(b.body.image, img);
      assert.ok(Array.isArray(b.body.messages));
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("Cloudflare vision: empty model output is an error, never an empty analysis", async () => {
  const { executeCloudflareAnalyzeVector } = await import("../server/cloudflareBackend");
  const img = await makeImage({ r: 9, g: 9, b: 9 });
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ success: true, result: { response: null } }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  try {
    await assert.rejects(
      () => executeCloudflareAnalyzeVector({ base64Image: img, mimeType: "image/png", accountIdOverride: "a", apiTokenOverride: "t" }),
      /empty response/
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("Cloudflare vision: missing credentials produce a clear error", async () => {
  const { executeCloudflareAnalyzeVector } = await import("../server/cloudflareBackend");
  const prevA = process.env.CLOUDFLARE_ACCOUNT_ID;
  const prevT = process.env.CLOUDFLARE_API_TOKEN;
  delete process.env.CLOUDFLARE_ACCOUNT_ID;
  delete process.env.CLOUDFLARE_API_TOKEN;
  try {
    await assert.rejects(
      () => executeCloudflareAnalyzeVector({ base64Image: "AAAA", mimeType: "image/png" }),
      /credentials are not configured/
    );
  } finally {
    if (prevA !== undefined) process.env.CLOUDFLARE_ACCOUNT_ID = prevA;
    if (prevT !== undefined) process.env.CLOUDFLARE_API_TOKEN = prevT;
  }
});
