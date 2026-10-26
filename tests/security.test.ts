import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  resolveApiKey,
  handleGeminiError,
  mapImageModel,
  normalizeAspectRatio,
  ALLOWED_IMAGE_MODELS
} from "../server/geminiBackend";
import { createRateLimiter } from "../server/rateLimiter";
import { createApp } from "../server";

// Mock express request helper
function createMockRequest(headers: Record<string, string> = {}, ip = "192.0.2.1") {
  return {
    headers,
    ip,
    socket: { remoteAddress: ip }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}

test("Security: Default backend key selection when no personal key supplied", () => {
  const originalEnv = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = "server-owned-default-key-12345";

  const req = createMockRequest({});
  const resolved = resolveApiKey(req);

  assert.equal(resolved.isPersonal, false);
  assert.equal(resolved.key, "server-owned-default-key-12345");

  process.env.GEMINI_API_KEY = originalEnv;
});

test("Security: Personal-key precedence when personal key is supplied", () => {
  const originalEnv = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = "server-owned-default-key-12345";

  const req = createMockRequest({
    "x-gemini-api-key": "user-custom-personal-key-67890"
  });
  const resolved = resolveApiKey(req);

  assert.equal(resolved.isPersonal, true);
  assert.equal(resolved.key, "user-custom-personal-key-67890");

  process.env.GEMINI_API_KEY = originalEnv;
});

test("Security: Clearing a personal key restores default-key behavior", () => {
  const originalEnv = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = "server-owned-default-key-12345";

  // When personal key is cleared / empty string
  const reqEmpty = createMockRequest({
    "x-gemini-api-key": "   "
  });
  const resolved = resolveApiKey(reqEmpty);

  assert.equal(resolved.isPersonal, false);
  assert.equal(resolved.key, "server-owned-default-key-12345");

  process.env.GEMINI_API_KEY = originalEnv;
});

test("Security: Missing default-key and missing personal-key handling", () => {
  const originalEnv = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;

  const req = createMockRequest({});
  const resolved = resolveApiKey(req);

  assert.equal(resolved.isPersonal, false);
  assert.equal(resolved.key, "");

  process.env.GEMINI_API_KEY = originalEnv;
});

test("Security: Invalid personal key returns 401 and NEVER falls back to default key", () => {
  const originalEnv = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = "server-owned-default-key-12345";

  const simulatedAuthError = new Error("API_KEY_INVALID: The provided API key is expired or invalid");
  const sanitized = handleGeminiError(simulatedAuthError, true); // isPersonal = true

  assert.equal(sanitized.status, 401);
  assert.match(sanitized.message, /Invalid personal Gemini API key/);
  // Must NOT suggest server key was used
  assert.doesNotMatch(sanitized.message, /server-owned-default/i);

  process.env.GEMINI_API_KEY = originalEnv;
});

test("Security: Server default key auth failure returns 502 with sanitized message", () => {
  const simulatedAuthError = new Error("API_KEY_INVALID: The provided API key is expired or invalid");
  const sanitized = handleGeminiError(simulatedAuthError, false); // isPersonal = false

  assert.equal(sanitized.status, 502);
  assert.match(sanitized.message, /Server default Gemini API key/);
});

test("Security: Error sanitization redacts raw API keys", () => {
  const fakeToken = "AIzaSy" + "TESTMOCKKEY_12345678901234567890";
  const sensitiveError = new Error(`Call failed with key ${fakeToken} at /internal/path`);
  const sanitized = handleGeminiError(sensitiveError, false);

  assert.doesNotMatch(sanitized.message, new RegExp(fakeToken));
  assert.match(sanitized.message, /\[REDACTED\]/);
});

test("Security: Request validation and model allowlisting", () => {
  assert.equal(ALLOWED_IMAGE_MODELS.has("gemini-3.1-flash-lite-image"), true);
  assert.equal(ALLOWED_IMAGE_MODELS.has("gemini-nano-banana-2.1"), true);
  assert.equal(ALLOWED_IMAGE_MODELS.has("gemini-3-pro-image"), true);
  assert.equal(ALLOWED_IMAGE_MODELS.has("imagen-3.0-generate-002"), true);

  // Deprecated or arbitrary models must be rejected
  assert.equal(ALLOWED_IMAGE_MODELS.has("gemini-1.5-flash"), false);
  assert.equal(ALLOWED_IMAGE_MODELS.has("gemini-pro"), false);
  assert.equal(ALLOWED_IMAGE_MODELS.has("untrusted-custom-model"), false);

  // Alias mappings
  assert.equal(mapImageModel("gemini"), "gemini-3.1-flash-lite-image");
  assert.equal(mapImageModel("gemini-flash"), "gemini-3.1-flash-lite-image");
  assert.equal(mapImageModel("gemini-image"), "gemini-3.1-flash-lite-image");
});

test("Security: In-memory rate limiter enforces request limits", () => {
  const limiter = createRateLimiter({
    windowMs: 1000,
    maxRequests: 2,
    message: "Rate limit test exceeded"
  });

  const req = createMockRequest({}, "10.99.99.1");
  const resHeaders: Record<string, string | number> = {};
  let statusSent = 200;
  let jsonSent: Record<string, unknown> = {};

  const res = {
    setHeader(k: string, v: string | number) {
      resHeaders[k] = v;
    },
    status(code: number) {
      statusSent = code;
      return this;
    },
    json(data: Record<string, unknown>) {
      jsonSent = data;
      return this;
    }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;

  let nextCalledCount = 0;
  const next = () => { nextCalledCount++; };

  // Call 1: OK
  limiter(req, res, next);
  assert.equal(nextCalledCount, 1);
  assert.equal(resHeaders["X-RateLimit-Limit"], 2);
  assert.equal(resHeaders["X-RateLimit-Remaining"], 1);

  // Call 2: OK
  limiter(req, res, next);
  assert.equal(nextCalledCount, 2);
  assert.equal(resHeaders["X-RateLimit-Remaining"], 0);

  // Call 3: Exceeded -> 429
  limiter(req, res, next);
  assert.equal(nextCalledCount, 2); // Not called
  assert.equal(statusSent, 429);
  assert.equal(jsonSent.error, "Rate limit test exceeded");
});

test("Security: Express server endpoints validation", async () => {
  const app = createApp();

  // Test GET /api/health
  await new Promise<void>((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const req: any = { method: "GET", url: "/api/health", headers: {} };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res: any = {
      statusCode: 200,
      headers: {},
      setHeader(k: string, v: string) { this.headers[k] = v; },
      json(data: { status: string }) {
        try {
          assert.equal(data.status, "ok");
          resolve();
        } catch (e) {
          reject(e);
        }
      }
    };
    app.handle(req, res);
  });
});

test("Security: No hardcoded credentials remain in source files", () => {
  const trackedFiles = [
    "src/services/geminiService.ts",
    "src/services/GeminiVisionHandler.ts",
    "src/store/useAppStore.ts",
    "src/hooks/useGeminiKeys.ts",
    "src/components/ui/Settings.tsx",
    "vite.config.ts",
    ".env.example",
    "server.ts"
  ];

  for (const relPath of trackedFiles) {
    const fullPath = path.join(process.cwd(), relPath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, "utf-8");
      assert.doesNotMatch(
        content,
        /AIzaSy[0-9A-Za-z-_]{33}/,
        `File ${relPath} still contains a hardcoded Google API key pattern!`
      );
    }
  }
});

test("Image Model: Aspect ratio normalization maps supported and unsupported formats safely", () => {
  assert.equal(normalizeAspectRatio("1:1"), "1:1");
  assert.equal(normalizeAspectRatio("3:4"), "3:4");
  assert.equal(normalizeAspectRatio("4:3"), "4:3");
  assert.equal(normalizeAspectRatio("9:16"), "9:16");
  assert.equal(normalizeAspectRatio("16:9"), "16:9");
  
  // Non-native portrait ratios map to closest supported portrait 3:4
  assert.equal(normalizeAspectRatio("4:5"), "3:4");
  assert.equal(normalizeAspectRatio("2:3"), "3:4");

  // Non-native landscape ratios map to closest supported landscape 4:3
  assert.equal(normalizeAspectRatio("5:4"), "4:3");
  assert.equal(normalizeAspectRatio("3:2"), "4:3");

  // Undefined or invalid inputs safely fall back to 1:1
  assert.equal(normalizeAspectRatio(undefined), "1:1");
  assert.equal(normalizeAspectRatio("invalid-ratio"), "1:1");
});

test("Image Model: Map image models to officially supported Gemini image models", () => {
  assert.equal(mapImageModel("gemini"), "gemini-3.1-flash-lite-image");
  assert.equal(mapImageModel("gemini-flash"), "gemini-3.1-flash-lite-image");
  assert.equal(mapImageModel("gemini-image"), "gemini-3.1-flash-lite-image");
  assert.equal(mapImageModel(undefined), "gemini-3.1-flash-lite-image");
  assert.equal(mapImageModel("imagen-3.0-generate-002"), "imagen-3.0-generate-002");
});

