import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  resolveCloudflareCredentials,
  buildCloudflarePrompt,
  CLOUDFLARE_FLUX_MAX_PROMPT_LENGTH
} from "../server/cloudflareBackend";
import { createRateLimiter } from "../server/rateLimiter";
import { createApp } from "../server";

test("Security: Cloudflare credentials resolution from environment and overrides", () => {
  const originalAccount = process.env.CLOUDFLARE_ACCOUNT_ID;
  const originalToken = process.env.CLOUDFLARE_API_TOKEN;

  process.env.CLOUDFLARE_ACCOUNT_ID = "env-account-123";
  process.env.CLOUDFLARE_API_TOKEN = "env-token-456";

  const resolvedEnv = resolveCloudflareCredentials();
  assert.equal(resolvedEnv.accountId, "env-account-123");
  assert.equal(resolvedEnv.apiToken, "env-token-456");

  const resolvedOverride = resolveCloudflareCredentials({
    accountIdOverride: "custom-acc",
    apiTokenOverride: "custom-token"
  });
  assert.equal(resolvedOverride.accountId, "custom-acc");
  assert.equal(resolvedOverride.apiToken, "custom-token");

  process.env.CLOUDFLARE_ACCOUNT_ID = originalAccount;
  process.env.CLOUDFLARE_API_TOKEN = originalToken;
});

test("Security: Cloudflare prompt formatting and aspect ratio handling", () => {
  const prompt = buildCloudflarePrompt("A futuristic vector cybernetic owl", "16:9");
  assert.match(prompt, /widescreen 16:9 aspect ratio/);
  assert.ok(prompt.length <= CLOUDFLARE_FLUX_MAX_PROMPT_LENGTH);
});

test("Security: In-memory rate limiter enforces request limits", () => {
  const limiter = createRateLimiter({
    windowMs: 1000,
    maxRequests: 2,
    message: "Rate limit test exceeded"
  });

  // Mock express request helper
  function createMockRequest(ip = "10.99.99.1") {
    return {
      headers: {},
      ip,
      socket: { remoteAddress: ip }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
  }

  const req = createMockRequest("10.99.99.1");
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
    "src/store/useAppStore.ts",
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
