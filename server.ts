import express from "express";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import { fetchSafeImage } from "./server/ssrfValidator";
import { createRateLimiter } from "./server/rateLimiter";
import {
  resolveApiKey,
  executeGenerateImage,
  executeVerifyKey,
  executeAnalyze,
  executeAnalyzeVector,
  executeRefineTypography,
  executeVisionAnalysis,
  handleGeminiError,
  ALLOWED_IMAGE_MODELS
} from "./server/geminiBackend";
import { executeCloudflareGenerateImage } from "./server/cloudflareBackend";

async function ensurePremiumPwaAssets() {
  const publicDir = path.join(process.cwd(), "public");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const svgPath = path.join(publicDir, "icon.svg");
  const icon192Path = path.join(publicDir, "icon-192.png");
  const icon512Path = path.join(publicDir, "icon-512.png");
  const maskablePath = path.join(publicDir, "maskable-icon-512.png");
  const screenshotDesktopPath = path.join(publicDir, "screenshot-desktop.png");
  const screenshotMobilePath = path.join(publicDir, "screenshot-mobile.png");

  if (fs.existsSync(svgPath)) {
    try {
      if (!fs.existsSync(icon192Path)) {
        await sharp(svgPath).resize(192, 192).png().toFile(icon192Path);
        console.log("Successfully generated icon-192.png");
      }
      if (!fs.existsSync(icon512Path)) {
        await sharp(svgPath).resize(512, 512).png().toFile(icon512Path);
        console.log("Successfully generated icon-512.png");
      }
      if (!fs.existsSync(maskablePath)) {
        await sharp(svgPath)
          .resize(512, 512, { fit: "contain", background: "#09090B" })
          .png()
          .toFile(maskablePath);
        console.log("Successfully generated maskable-icon-512.png");
      }
    } catch (err) {
      console.error("Error generating icons:", err);
    }
  }

  if (!fs.existsSync(screenshotDesktopPath)) {
    const desktopSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 800" width="1280" height="800">
  <rect width="1280" height="800" fill="#09090B"/>
  <rect width="1280" height="64" fill="#0E0E11" stroke="#1E1E24" stroke-width="1"/>
  <text x="40" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="bold" font-size="18" fill="#FFFFFF">ELITE 72 | DESIGN INTELLIGENCE</text>
  <text x="1100" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" fill="#A1A1AA" text-anchor="end">v1.1.0 • Workspace Active</text>
  <circle cx="1140" cy="34" r="6" fill="#10B981" />
  <text x="1155" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" fill="#10B981">Online</text>
  <rect x="0" y="64" width="280" height="736" fill="#0E0E11" stroke="#1E1E24" stroke-width="1"/>
  <text x="30" y="110" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="bold" font-size="12" fill="#52525B" letter-spacing="1.5">VECTORS / ASSETS</text>
  <rect x="20" y="130" width="240" height="40" rx="8" fill="#18181B" stroke="#27272A" stroke-width="1"/>
  <circle cx="40" cy="150" r="4" fill="#F59E0B" />
  <text x="60" y="155" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="500" font-size="14" fill="#FFFFFF">Brand Workspace 01</text>
  <rect x="20" y="180" width="240" height="40" rx="8" fill="none" stroke="none"/>
  <circle cx="40" cy="200" r="4" fill="#A1A1AA" />
  <text x="60" y="205" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" fill="#A1A1AA">Typography Playground</text>
  <rect x="300" y="84" width="960" height="696" rx="12" fill="#121214" stroke="#1E1E24" stroke-width="1"/>
  <g transform="translate(680, 240)">
    <circle cx="100" cy="100" r="140" fill="none" stroke="#2D2D34" stroke-width="1.5" stroke-dasharray="6 6"/>
    <circle cx="100" cy="100" r="80" fill="none" stroke="#2D2D34" stroke-width="1.5" stroke-dasharray="6 6"/>
    <line x1="100" y1="-80" x2="100" y2="280" stroke="#2D2D34" stroke-width="1" stroke-dasharray="4 4"/>
    <line x1="-80" y1="100" x2="280" y2="100" stroke="#2D2D34" stroke-width="1" stroke-dasharray="4 4"/>
    <g transform="translate(-28, -28)" stroke="#FFFFFF" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <path d="M 120 20 A 100 100 0 0 1 220 120" stroke="#F59E0B" stroke-width="8" />
      <path d="M 120 220 A 100 100 0 0 1 20 120" stroke="#3B82F6" stroke-width="8" />
      <path d="M 60 70 L 140 70 M 60 120 L 125 120 M 60 170 L 140 170 M 60 70 L 60 170" stroke="#FFFFFF" stroke-width="12"/>
      <path d="M 155 70 L 205 70 L 175 170" stroke="#E2E8F0" stroke-width="12"/>
      <path d="M 155 130 C 155 115, 190 115, 190 135 C 190 155, 155 155, 155 170 L 200 170" stroke="#E2E8F0" stroke-width="12"/>
    </g>
  </g>
  <rect x="320" y="694" width="920" height="66" rx="8" fill="#18181B" stroke="#27272A" stroke-width="1"/>
  <text x="340" y="733" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" fill="#71717A">Type brand instruction or design directive...</text>
  <rect x="1110" y="704" width="120" height="46" rx="6" fill="#FFFFFF"/>
  <text x="1170" y="732" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="bold" font-size="14" fill="#09090B" text-anchor="middle">Synthesize</text>
</svg>`.trim();
    try {
      await sharp(Buffer.from(desktopSvg)).png().toFile(screenshotDesktopPath);
      console.log("Successfully generated screenshot-desktop.png");
    } catch (err) {
      console.error("Error generating desktop screenshot:", err);
    }
  }

  if (!fs.existsSync(screenshotMobilePath)) {
    const mobileSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 1280" width="720" height="1280">
  <rect width="720" height="1280" fill="#09090B"/>
  <rect width="720" height="88" fill="#0E0E11" stroke="#1E1E24" stroke-width="1"/>
  <text x="360" y="52" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="bold" font-size="20" fill="#FFFFFF" text-anchor="middle">Elite 72 Studio</text>
  <circle cx="660" cy="46" r="6" fill="#10B981" />
  <rect x="30" y="118" width="660" height="860" rx="16" fill="#121214" stroke="#1E1E24" stroke-width="1"/>
  <g transform="translate(360, 520)">
    <circle cx="0" cy="0" r="160" fill="none" stroke="#2D2D34" stroke-width="1.5" stroke-dasharray="6 6"/>
    <circle cx="0" cy="0" r="100" fill="none" stroke="#2D2D34" stroke-width="1.5" stroke-dasharray="6 6"/>
    <line x1="0" y1="-220" x2="0" y2="220" stroke="#2D2D34" stroke-width="1" stroke-dasharray="4 4"/>
    <line x1="-220" y1="0" x2="220" y2="0" stroke="#2D2D34" stroke-width="1" stroke-dasharray="4 4"/>
    <g transform="translate(-128, -128)" stroke="#FFFFFF" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <path d="M 120 20 A 100 100 0 0 1 220 120" stroke="#F59E0B" stroke-width="10" />
      <path d="M 120 220 A 100 100 0 0 1 20 120" stroke="#3B82F6" stroke-width="10" />
      <path d="M 60 70 L 140 70 M 60 120 L 125 120 M 60 170 L 140 170 M 60 70 L 60 170" stroke="#FFFFFF" stroke-width="14"/>
      <path d="M 155 70 L 205 70 L 175 170" stroke="#E2E8F0" stroke-width="14"/>
      <path d="M 155 130 C 155 115, 190 115, 190 135 C 190 155, 155 155, 155 170 L 200 170" stroke="#E2E8F0" stroke-width="14"/>
    </g>
  </g>
  <rect x="30" y="1008" width="660" height="120" rx="12" fill="#18181B" stroke="#27272A" stroke-width="1"/>
  <text x="60" y="1058" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" fill="#71717A">Select active reference or command...</text>
  <rect x="30" y="1156" width="660" height="64" rx="12" fill="#FFFFFF"/>
  <text x="360" y="1195" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="bold" font-size="18" fill="#09090B" text-anchor="middle">Generate Intelligent Design</text>
</svg>`.trim();
    try {
      await sharp(Buffer.from(mobileSvg)).png().toFile(screenshotMobilePath);
      console.log("Successfully generated screenshot-mobile.png");
    } catch (err) {
      console.error("Error generating mobile screenshot:", err);
    }
  }
}

export function createApp() {
  const app = express();

  // CORS middleware supporting Web and Capacitor Android APK
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    // Allow Capacitor mobile origins and standard web origins
    if (origin) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    } else {
      res.setHeader("Access-Control-Allow-Origin", "*");
    }
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-gemini-api-key, Authorization");
    res.setHeader("Access-Control-Max-Age", "86400");

    if (req.method === "OPTIONS") {
      return res.status(204).end();
    }
    next();
  });

  // Request limits
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Static serving for the library
  app.use("/Elite_72_Library_Organized", express.static(path.join(process.cwd(), "Elite_72_Library_Organized")));

  // Rate limiter for expensive operations (60 requests/minute)
  const apiLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 60,
    message: "Rate limit reached. Please wait a moment before sending more requests."
  });

  // 1. Health check (reports if server-side key or Cloudflare credentials are available)
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      hasDefaultKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim()),
      hasCloudflareConfigured: Boolean(
        process.env.CLOUDFLARE_ACCOUNT_ID &&
        process.env.CLOUDFLARE_ACCOUNT_ID.trim() &&
        process.env.CLOUDFLARE_API_TOKEN &&
        process.env.CLOUDFLARE_API_TOKEN.trim()
      )
    });
  });

  // Cloudflare Workers AI FLUX.1 [schnell] Image Generation
  app.post("/api/cloudflare/generate-image", apiLimiter, async (req, res) => {
    const { prompt, aspectRatio } = req.body || {};
    try {
      const result = await executeCloudflareGenerateImage({ prompt, aspectRatio });
      return res.json(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Cloudflare image generation failed";
      const status = message.includes("429") || message.includes("quota") ? 429 : 500;
      return res.status(status).json({ error: message });
    }
  });

  // 2. Prepare reference with strict SSRF protection and path traversal protection
  app.post("/api/prepare-reference", apiLimiter, async (req, res) => {
    try {
      const { referenceImagePath, sourceImagePath, cropBox } = req.body || {};
      const libraryDir = path.join(process.cwd(), "Elite_72_Library_Organized");
      const allowedBaseDir = path.resolve(libraryDir);

      let finalBase64 = "";
      let finalMimeType = "";

      if (cropBox && sourceImagePath) {
        if (typeof sourceImagePath !== "string") {
          return res.status(400).json({ error: "Invalid sourceImagePath parameter" });
        }

        const cleanSourcePath = sourceImagePath.split("?")[0].replace(/\\/g, "/");
        const imgPathRel = path.join(libraryDir, cleanSourcePath.replace(/^\/?Elite_72_Library_Organized\//, ""));
        const resolvedPath = path.resolve(imgPathRel);

        if (!resolvedPath.startsWith(allowedBaseDir)) {
          return res.status(403).json({ error: "Access denied: Path outside allowed directory" });
        }
        if (!fs.existsSync(resolvedPath)) {
          return res.status(404).json({ error: "Source image not found" });
        }

        const { x, y, width, height } = cropBox;
        if (typeof x !== "number" || typeof y !== "number" || typeof width !== "number" || typeof height !== "number") {
          return res.status(400).json({ error: "Invalid cropBox parameters" });
        }

        const imageMetadata = await sharp(resolvedPath).metadata();
        if (!imageMetadata.width || !imageMetadata.height) {
          return res.status(500).json({ error: "Failed to read image dimensions" });
        }

        const safeX = Math.min(Math.max(0, Math.round(x)), imageMetadata.width - 1);
        const safeY = Math.min(Math.max(0, Math.round(y)), imageMetadata.height - 1);
        const safeWidth = Math.min(Math.max(1, Math.round(width)), imageMetadata.width - safeX);
        const safeHeight = Math.min(Math.max(1, Math.round(height)), imageMetadata.height - safeY);

        const croppedBuffer = await sharp(resolvedPath)
          .extract({ left: safeX, top: safeY, width: safeWidth, height: safeHeight })
          .png()
          .toBuffer();

        finalBase64 = croppedBuffer.toString("base64");
        finalMimeType = "image/png";
      } else if (referenceImagePath) {
        if (typeof referenceImagePath !== "string") {
          return res.status(400).json({ error: "Invalid referenceImagePath parameter" });
        }

        let fileData: Buffer;
        let mime = "image/jpeg";

        if (referenceImagePath.startsWith("http://") || referenceImagePath.startsWith("https://")) {
          // SSRF-safe remote image fetch
          try {
            const fetched = await fetchSafeImage(referenceImagePath, {
              maxBytes: 20 * 1024 * 1024,
              timeoutMs: 10000,
              maxRedirects: 3
            });
            fileData = fetched.buffer;
            mime = fetched.contentType;
          } catch (ssrfErr) {
            console.warn(`[SSRF BLOCKED] fetchSafeImage rejected '${referenceImagePath}':`, ssrfErr instanceof Error ? ssrfErr.message : ssrfErr);
            return res.status(400).json({
              error: `Remote reference fetch failed: ${ssrfErr instanceof Error ? ssrfErr.message : "Blocked destination"}`
            });
          }
        } else {
          // Local library asset path
          const cleanRefPath = referenceImagePath.split("?")[0].replace(/\\/g, "/");
          const imagePathExt = path.join(libraryDir, cleanRefPath.replace(/^\/?Elite_72_Library_Organized\//, ""));
          const resolvedPath = path.resolve(imagePathExt);

          if (!resolvedPath.startsWith(allowedBaseDir)) {
            return res.status(403).json({ error: "Access denied: Path outside allowed directory" });
          }
          if (!fs.existsSync(resolvedPath)) {
            return res.status(404).json({ error: "Reference file not found" });
          }

          fileData = fs.readFileSync(resolvedPath);
          const ext = path.extname(resolvedPath).toLowerCase();
          if (ext === ".png") mime = "image/png";
          else if (ext === ".webp") mime = "image/webp";
          else if (ext === ".gif") mime = "image/gif";
          else mime = "image/jpeg";
        }

        finalBase64 = fileData.toString("base64");
        finalMimeType = mime;
      } else {
        return res.status(400).json({ error: "Missing reference parameters" });
      }

      res.json({ base64: finalBase64, mimeType: finalMimeType });
    } catch (error: unknown) {
      console.error("Preparation Error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to prepare reference" });
    }
  });

  // 3. Centralized Gemini Image Generation
  app.post("/api/gemini/generate", apiLimiter, async (req, res) => {
    const { key, isPersonal } = resolveApiKey(req);
    const { model, prompt, base64Image, mimeType, aspectRatio } = req.body || {};

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({ error: "Prompt is required and must be a non-empty string" });
    }

    if (prompt.length > 10000) {
      return res.status(400).json({ error: "Prompt exceeds maximum allowed length of 10,000 characters" });
    }

    if (model && typeof model === "string" && !ALLOWED_IMAGE_MODELS.has(model)) {
      return res.status(400).json({ error: `Model '${model}' is not in the allowed models list.` });
    }

    if (base64Image && (typeof base64Image !== "string" || base64Image.length > 35 * 1024 * 1024)) {
      return res.status(400).json({ error: "base64Image payload exceeds maximum size limit" });
    }

    if (!key) {
      return res.status(503).json({
        error: "Gemini API key is not configured on the server. Please add your personal Gemini API key in Settings (⚙)."
      });
    }

    try {
      const result = await executeGenerateImage({
        model,
        prompt: prompt.trim(),
        base64Image,
        mimeType,
        aspectRatio,
        apiKey: key,
        isPersonal
      });

      return res.json(result);
    } catch (err) {
      const sanitized = handleGeminiError(err, isPersonal);
      return res.status(sanitized.status).json({ error: sanitized.message });
    }
  });

  // 4. API Key Verification / Diagnostics
  app.post("/api/gemini/verify-key", apiLimiter, async (req, res) => {
    const { key, isPersonal } = resolveApiKey(req);
    const result = await executeVerifyKey(key, isPersonal);
    res.json(result);
  });

  // 5. Image Style DNA Analysis
  app.post("/api/gemini/analyze", apiLimiter, async (req, res) => {
    const { key, isPersonal } = resolveApiKey(req);
    const { base64Image, mimeType, activeTab } = req.body || {};

    if (!base64Image || typeof base64Image !== "string") {
      return res.status(400).json({ error: "base64Image is required for analysis" });
    }

    if (!key) {
      return res.status(503).json({
        error: "Gemini API key is not configured on the server. Please provide a personal key in Settings."
      });
    }

    try {
      const result = await executeAnalyze({
        base64Image,
        mimeType: mimeType || "image/png",
        activeTab: activeTab || "vectorize",
        apiKey: key
      });
      res.json(result);
    } catch (err) {
      const sanitized = handleGeminiError(err, isPersonal);
      res.status(sanitized.status).json({ error: sanitized.message });
    }
  });

  // 6. Vector Subject Breakdown
  app.post("/api/gemini/analyze-vector", apiLimiter, async (req, res) => {
    const { key, isPersonal } = resolveApiKey(req);
    const { base64Image, mimeType } = req.body || {};

    if (!base64Image || typeof base64Image !== "string") {
      return res.status(400).json({ error: "base64Image is required" });
    }

    if (!key) {
      return res.status(503).json({
        error: "Gemini API key is not configured on the server. Please provide a personal key in Settings."
      });
    }

    try {
      const result = await executeAnalyzeVector({
        base64Image,
        mimeType: mimeType || "image/png",
        apiKey: key
      });
      res.json(result);
    } catch (err) {
      const sanitized = handleGeminiError(err, isPersonal);
      res.status(sanitized.status).json({ error: sanitized.message });
    }
  });

  // 7. Typography Prompt Refinement
  app.post("/api/gemini/refine-typography", apiLimiter, async (req, res) => {
    const { key, isPersonal } = resolveApiKey(req);
    const { base64Image, mimeType, originalPrompt, targetText, targetPreset } = req.body || {};

    if (!base64Image || typeof base64Image !== "string") {
      return res.status(400).json({ error: "base64Image is required" });
    }

    if (!key) {
      return res.status(503).json({
        error: "Gemini API key is not configured on the server. Please provide a personal key in Settings."
      });
    }

    try {
      const result = await executeRefineTypography({
        base64Image,
        mimeType: mimeType || "image/png",
        originalPrompt: originalPrompt || "",
        targetText: targetText || "",
        targetPreset: targetPreset || "",
        apiKey: key
      });
      res.json(result);
    } catch (err) {
      const sanitized = handleGeminiError(err, isPersonal);
      res.status(sanitized.status).json({ error: sanitized.message });
    }
  });

  // 8. Vision Object Detection
  app.post("/api/gemini/vision-analysis", apiLimiter, async (req, res) => {
    const { key, isPersonal } = resolveApiKey(req);
    const { base64Image, mimeType } = req.body || {};

    if (!base64Image || typeof base64Image !== "string") {
      return res.status(400).json({ error: "base64Image is required" });
    }

    if (!key) {
      return res.status(503).json({
        error: "Gemini API key is not configured on the server. Please provide a personal key in Settings."
      });
    }

    try {
      const result = await executeVisionAnalysis({
        base64Image,
        mimeType: mimeType || "image/png",
        apiKey: key
      });
      res.json(result);
    } catch (err) {
      const sanitized = handleGeminiError(err, isPersonal);
      res.status(sanitized.status).json({ error: sanitized.message });
    }
  });

  // Explicit service worker endpoint with proper headers
  app.get("/sw.js", (req, res) => {
    const swPath = path.join(process.cwd(), "public", "sw.js");
    if (fs.existsSync(swPath)) {
      res.setHeader("Content-Type", "application/javascript");
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Service-Worker-Allowed", "/");
      res.sendFile(swPath);
    } else {
      res.status(404).send("Not found");
    }
  });

  return app;
}

async function startServer() {
  ensurePremiumPwaAssets().catch((err) => console.warn("PWA asset check:", err));
  const app = createApp();
  const PORT = 3000;

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(express.static(path.join(process.cwd(), "public")));
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.use(express.static(path.join(process.cwd(), "public")));
    app.get("*all", (req, res, next) => {
      if (req.originalUrl.startsWith("/api/") || req.originalUrl.startsWith("/Elite_72_Library_Organized/")) {
        return next();
      }
      const indexPath = path.join(distPath, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send("Application build in progress. Please refresh shortly.");
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

const isDirectExecution = Boolean(
  process.env.NODE_ENV !== "test" &&
  process.argv[1] &&
  (process.argv[1].endsWith("server.ts") ||
   process.argv[1].endsWith("server.cjs") ||
   process.argv[1].endsWith("server.js"))
);

if (isDirectExecution) {
  startServer();
}
