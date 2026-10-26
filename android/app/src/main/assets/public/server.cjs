var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server.ts
var server_exports = {};
__export(server_exports, {
  createApp: () => createApp
});
module.exports = __toCommonJS(server_exports);
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_sharp2 = __toESM(require("sharp"), 1);

// server/ssrfValidator.ts
var import_dns = __toESM(require("dns"), 1);
var import_http = __toESM(require("http"), 1);
var import_https = __toESM(require("https"), 1);
var import_url = require("url");
function isPrivateOrReservedIPv4(ip) {
  const parts = ip.split(".").map((p) => parseInt(p, 10));
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    return true;
  }
  const [b0, b1, b2, b3] = parts;
  if (b0 === 0) return true;
  if (b0 === 10) return true;
  if (b0 === 100 && b1 >= 64 && b1 <= 127) return true;
  if (b0 === 127) return true;
  if (b0 === 169 && b1 === 254) return true;
  if (b0 === 172 && b1 >= 16 && b1 <= 31) return true;
  if (b0 === 192 && b1 === 0 && b2 === 0) return true;
  if (b0 === 192 && b1 === 0 && b2 === 2) return true;
  if (b0 === 192 && b1 === 88 && b2 === 99) return true;
  if (b0 === 192 && b1 === 168) return true;
  if (b0 === 198 && (b1 === 18 || b1 === 19)) return true;
  if (b0 === 198 && b1 === 51 && b2 === 100) return true;
  if (b0 === 203 && b1 === 0 && b2 === 113) return true;
  if (b0 >= 224 && b0 <= 239) return true;
  if (b0 >= 240) return true;
  if (b0 === 255 && b1 === 255 && b2 === 255 && b3 === 255) return true;
  return false;
}
function isPrivateOrReservedIPv6(ip) {
  const normalized = ip.toLowerCase().trim();
  if (normalized === "::" || normalized === "0000:0000:0000:0000:0000:0000:0000:0000") return true;
  if (normalized === "::1" || normalized === "0:0:0:0:0:0:0:1") return true;
  const mappedMatch = normalized.match(/::ffff:(\d+\.\d+\.\d+\.\d+)/);
  if (mappedMatch) {
    return isPrivateOrReservedIPv4(mappedMatch[1]);
  }
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;
  if (/^fe[89ab]/i.test(normalized)) return true;
  if (normalized.startsWith("ff")) return true;
  if (normalized.startsWith("2001:db8:") || normalized.startsWith("2001:0db8:")) return true;
  if (normalized.startsWith("100:")) return true;
  return false;
}
function isPrivateOrReservedIp(ip) {
  if (ip.includes(":")) {
    return isPrivateOrReservedIPv6(ip);
  }
  return isPrivateOrReservedIPv4(ip);
}
async function validateSafeUrl(urlString) {
  let parsedUrl;
  try {
    parsedUrl = new import_url.URL(urlString);
  } catch {
    throw new Error("Invalid URL format");
  }
  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    throw new Error(`Unsupported URL protocol: '${parsedUrl.protocol}'. Only http: and https: are allowed.`);
  }
  const hostname = parsedUrl.hostname.toLowerCase();
  if (hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".local") || hostname.endsWith(".internal")) {
    throw new Error("Access to local destinations is blocked for security.");
  }
  let records;
  try {
    records = await import_dns.default.promises.lookup(hostname, { all: true });
  } catch (err) {
    throw new Error(`Failed to resolve host '${hostname}': ${err.message}`);
  }
  if (!records || records.length === 0) {
    throw new Error(`No DNS records found for host '${hostname}'`);
  }
  for (const record of records) {
    if (isPrivateOrReservedIp(record.address)) {
      throw new Error(`Access to destination IP ${record.address} is blocked (private/reserved address).`);
    }
  }
  return parsedUrl;
}
async function fetchSafeImage(initialUrl, options = {}) {
  const maxBytes = options.maxBytes ?? 20 * 1024 * 1024;
  const timeoutMs = options.timeoutMs ?? 1e4;
  const maxRedirects = options.maxRedirects ?? 3;
  let currentUrl = initialUrl;
  let redirectsRemaining = maxRedirects;
  while (true) {
    const validatedUrl = await validateSafeUrl(currentUrl);
    const client = validatedUrl.protocol === "https:" ? import_https.default : import_http.default;
    const result = await new Promise((resolve, reject) => {
      const req = client.get(
        validatedUrl,
        {
          timeout: timeoutMs,
          headers: {
            "User-Agent": "Elite72-DesignIntelligence/1.0",
            Accept: "image/*"
          }
        },
        (res) => {
          if (res.statusCode && [301, 302, 303, 307, 308].includes(res.statusCode)) {
            const location = res.headers.location;
            if (!location) {
              res.resume();
              return reject(new Error(`Redirect response missing Location header (status ${res.statusCode})`));
            }
            const nextUrl = new import_url.URL(location, validatedUrl).toString();
            res.resume();
            return resolve({ redirectUrl: nextUrl });
          }
          if (res.statusCode !== 200) {
            res.resume();
            return reject(new Error(`Remote image server responded with status ${res.statusCode}`));
          }
          const rawContentType = (res.headers["content-type"] || "").toLowerCase();
          const mime = rawContentType.split(";")[0].trim();
          const validMimes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif",
            "image/avif",
            "image/svg+xml"
          ];
          if (!mime.startsWith("image/") && !validMimes.includes(mime)) {
            res.resume();
            return reject(new Error(`Invalid content type '${rawContentType}'. Expected an image format.`));
          }
          const contentLengthHeader = res.headers["content-length"];
          if (contentLengthHeader) {
            const len = parseInt(contentLengthHeader, 10);
            if (!isNaN(len) && len > maxBytes) {
              res.resume();
              return reject(new Error(`Remote image exceeds maximum allowed size of ${maxBytes} bytes.`));
            }
          }
          const chunks = [];
          let totalBytes = 0;
          res.on("data", (chunk) => {
            totalBytes += chunk.length;
            if (totalBytes > maxBytes) {
              req.destroy();
              return reject(new Error(`Image download exceeded size limit of ${maxBytes} bytes.`));
            }
            chunks.push(chunk);
          });
          res.on("end", () => {
            resolve({
              buffer: Buffer.concat(chunks),
              contentType: mime
            });
          });
          res.on("error", (err) => {
            reject(err);
          });
        }
      );
      req.on("timeout", () => {
        req.destroy();
        reject(new Error(`Request timed out after ${timeoutMs}ms`));
      });
      req.on("error", (err) => {
        reject(err);
      });
    });
    if ("redirectUrl" in result) {
      if (redirectsRemaining <= 0) {
        throw new Error("Too many redirects encountered while fetching reference image.");
      }
      redirectsRemaining -= 1;
      currentUrl = result.redirectUrl;
      continue;
    }
    return result;
  }
}

// server/rateLimiter.ts
function createRateLimiter(options) {
  const { windowMs, maxRequests, message = "Rate limit exceeded. Please wait a moment before retrying." } = options;
  const store = /* @__PURE__ */ new Map();
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      if (now > record.resetTime) {
        store.delete(key);
      }
    }
  }, 5 * 60 * 1e3).unref();
  return (req, res, next) => {
    const personalKey = req.headers["x-gemini-api-key"];
    const ip = req.ip || req.socket.remoteAddress || "unknown-ip";
    const clientKey = typeof personalKey === "string" && personalKey.trim() ? `key:${personalKey.trim().slice(-8)}` : `ip:${ip}`;
    const now = Date.now();
    let record = store.get(clientKey);
    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + windowMs
      };
      store.set(clientKey, record);
    } else {
      record.count += 1;
    }
    const remaining = Math.max(0, maxRequests - record.count);
    const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1e3);
    res.setHeader("X-RateLimit-Limit", maxRequests);
    res.setHeader("X-RateLimit-Remaining", remaining);
    res.setHeader("X-RateLimit-Reset", Math.ceil(record.resetTime / 1e3));
    if (record.count > maxRequests) {
      res.setHeader("Retry-After", retryAfterSeconds);
      return res.status(429).json({
        error: message,
        retryAfter: retryAfterSeconds
      });
    }
    next();
  };
}

// server/geminiBackend.ts
var import_genai = require("@google/genai");
function resolveApiKey(req) {
  const headerKey = req.headers["x-gemini-api-key"];
  const personalKey = typeof headerKey === "string" ? headerKey.trim() : "";
  if (personalKey) {
    return { key: personalKey, isPersonal: true };
  }
  const defaultKey = (process.env.GEMINI_API_KEY || "").trim();
  return { key: defaultKey, isPersonal: false };
}
function createAiClient(apiKey) {
  return new import_genai.GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build-elite72"
      }
    }
  });
}
var ALLOWED_IMAGE_MODELS = /* @__PURE__ */ new Set([
  "gemini-3.1-flash-lite-image",
  "gemini-nano-banana-2.1",
  "gemini-3-pro-image",
  "imagen-3.0-generate-002",
  // Frontend aliases mapped to gemini-3.1-flash-lite-image
  "gemini",
  "gemini-flash",
  "gemini-image"
]);
function mapImageModel(model) {
  if (!model) return "gemini-3.1-flash-lite-image";
  if (model === "gemini" || model === "gemini-flash" || model === "gemini-image") {
    return "gemini-3.1-flash-lite-image";
  }
  return model;
}
function isAuthError(error) {
  if (!error) return false;
  const err = error;
  const msg = (err.message || String(error)).toUpperCase();
  const status = err.status || err.statusCode || err.code || err.response?.status;
  return status === 401 || status === "401" || status === 403 || status === "403" || msg.includes("401") || msg.includes("API_KEY_INVALID") || msg.includes("API KEY NOT VALID") || msg.includes("INVALID API KEY") || msg.includes("UNAUTHENTICATED") || msg.includes("PERMISSION_DENIED");
}
function isQuotaError(error) {
  if (!error) return false;
  const err = error;
  const msg = (err.message || String(error)).toUpperCase();
  const status = err.status || err.statusCode || err.code || err.response?.status;
  return status === 429 || status === "429" || msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED") || msg.includes("RATE LIMIT") || msg.includes("QUOTA EXCEEDED");
}
function handleGeminiError(error, isPersonal) {
  const err = error;
  const rawMsg = err?.message || String(error);
  if (isPersonal) {
    if (isAuthError(error)) {
      return {
        status: 401,
        message: "Invalid personal Gemini API key. Please check your key in Settings."
      };
    }
    if (isQuotaError(error)) {
      return {
        status: 429,
        message: "Personal Gemini API key quota or rate limit exceeded (429). Please check your Google AI Studio quota."
      };
    }
    return {
      status: 500,
      message: `Personal key generation error: ${rawMsg.replace(/AIza[0-9A-Za-z-_]{20,}/g, "[REDACTED]")}`
    };
  }
  if (isAuthError(error)) {
    return {
      status: 502,
      message: "Server default Gemini API key authentication failed. Please check server configuration or provide a personal key in Settings."
    };
  }
  if (isQuotaError(error)) {
    return {
      status: 429,
      message: "Google Gemini API quota reached (HTTP 429). Image generation requires a billing-enabled Gemini API key. Please check your project billing or add your personal Gemini API key in Settings."
    };
  }
  return {
    status: 500,
    message: `Synthesis engine error: ${rawMsg.replace(/AIza[0-9A-Za-z-_]{20,}/g, "[REDACTED]")}`
  };
}
var VALID_ASPECT_RATIOS = ["1:1", "3:4", "4:3", "9:16", "16:9"];
function normalizeAspectRatio(ratio) {
  if (!ratio) return "1:1";
  if (VALID_ASPECT_RATIOS.includes(ratio)) {
    return ratio;
  }
  if (ratio === "4:5" || ratio === "2:3") {
    return "3:4";
  }
  if (ratio === "5:4" || ratio === "3:2") {
    return "4:3";
  }
  return "1:1";
}
var VORTEX_SYSTEM_INSTRUCTION = `[IDEOGRAM 3.0 / VORTEX RENDERING ENGINE]
[ROLE: ELITE GRAPHIC DESIGNER & ARCHITECTURAL RENDERER]

You are a high-performance visual synthesis engine specialized in extreme-fidelity graphic identity, layout design, and typography.
Your primary mandate is LITERAL TRANSLATION of the provided concept into a professional visual asset.

OPERATIONAL PARAMETERS:
1. IMAGE-STYLE COUPLING: If a reference image is provided, your MISSION-CRITICAL task is to synthesize the final output by grafting the new content onto the visual DNA of the reference. Maintain lighting, material, and compositional properties of the reference.
2. LITERAL FIDELITY: Follow every keyword in the prompt with 100% precision. Zero creative drift unless requested.
3. CINEMATIC AUTHORITY: Use professional studio lighting (softbox, rim, backlighting) and intentional focal depth.
4. MATERIAL INTEGRITY: Physics-accurate material representation (Glass, Chrome, Matte, Liquid, Iridescent).
5. COMPOSITIONAL INTENT: Subject-first hierarchy. Rule of thirds or centered symmetry based on type.

[TYPOGRAPHY_LOGIC]: When generating text or layout coordinates, maintain razor-sharp font edges. Verify character count with extreme precision. 
If 3D is requested, use high IOR (Index of Refraction) and caustic reflections. 
If 2D is requested, use vector-smooth curves and clean silhouettes.`;
function extractImageFromResponse(response) {
  const candidates = response.candidates || [];
  for (const candidate of candidates) {
    const parts = candidate.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        const mime = part.inlineData.mimeType || "image/png";
        return `data:${mime};base64,${part.inlineData.data}`;
      }
    }
  }
  const text = response.text || "";
  if (text) {
    const dataUriMatch = text.match(/data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+/);
    if (dataUriMatch) {
      return dataUriMatch[0];
    }
  }
  return null;
}
async function executeGenerateImage(params) {
  const { model, prompt, base64Image, mimeType, aspectRatio, apiKey, isPersonal } = params;
  if (!apiKey) {
    throw new Error(isPersonal ? "Missing personal API key" : "Server GEMINI_API_KEY is not configured");
  }
  const ai = createAiClient(apiKey);
  const selectedAspectRatio = normalizeAspectRatio(aspectRatio);
  const mappedModel = mapImageModel(model);
  const parts = [];
  if (base64Image && mimeType) {
    const formattedBase64 = base64Image.includes(",") ? base64Image.split(",")[1] : base64Image;
    parts.push({
      inlineData: {
        data: formattedBase64,
        mimeType
      }
    });
    parts.push({
      text: `[STYLE_REFERENCE_DETECTED] Follow the visual DNA of the attached reference image.
[CONTENT_INSTRUCTION]: ${prompt}`
    });
  } else {
    parts.push({ text: prompt });
  }
  const targetModels = [
    mappedModel,
    "gemini-3.1-flash-lite-image",
    "gemini-nano-banana-2.1",
    "gemini-3-pro-image"
  ].filter((m, idx, arr) => m && arr.indexOf(m) === idx);
  let lastError = null;
  for (const targetModel of targetModels) {
    try {
      let response = null;
      try {
        response = await ai.models.generateContent({
          model: targetModel,
          contents: { parts },
          config: {
            systemInstruction: VORTEX_SYSTEM_INSTRUCTION,
            imageConfig: {
              aspectRatio: selectedAspectRatio
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          }
        });
      } catch (modalityErr) {
        if (isAuthError(modalityErr) || isQuotaError(modalityErr)) {
          throw modalityErr;
        }
        response = await ai.models.generateContent({
          model: targetModel,
          contents: { parts },
          config: {
            systemInstruction: VORTEX_SYSTEM_INSTRUCTION,
            responseModalities: ["IMAGE", "TEXT"]
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        });
      }
      if (response) {
        const extracted = extractImageFromResponse(response);
        if (extracted) {
          return { image: extracted, modelUsed: targetModel };
        }
      }
    } catch (err) {
      lastError = err;
      if (isAuthError(err)) {
        throw err;
      }
      if (isQuotaError(err)) {
        throw err;
      }
      console.warn(`[GEMINI BACKEND] Model '${targetModel}' attempt skipped:`, err instanceof Error ? err.message : err);
    }
  }
  try {
    const imagenFallback = await ai.models.generateImages({
      model: "imagen-3.0-generate-002",
      prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: "image/jpeg",
        aspectRatio: selectedAspectRatio
      }
    });
    if (imagenFallback.generatedImages?.[0]?.image?.imageBytes) {
      const b64 = imagenFallback.generatedImages[0].image.imageBytes;
      return {
        image: `data:image/jpeg;base64,${b64}`,
        modelUsed: "imagen-3.0-generate-002"
      };
    }
  } catch (imgErr) {
    if (isAuthError(imgErr) || isQuotaError(imgErr)) {
      throw imgErr;
    }
    console.warn("[GEMINI BACKEND] Imagen 3 fallback skipped:", imgErr);
  }
  if (lastError) {
    throw lastError;
  }
  throw new Error("Gemini Image engine was unable to produce an image. Please verify your prompt or API key.");
}
async function executeVerifyKey(apiKey, isPersonal) {
  if (!apiKey) {
    return {
      success: false,
      latency: 0,
      details: isPersonal ? "No personal key provided" : "Server default key is not configured"
    };
  }
  const start = Date.now();
  try {
    const ai = createAiClient(apiKey);
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: "ping"
    });
    const latency = Date.now() - start;
    if (response?.text) {
      return {
        success: true,
        latency,
        details: isPersonal ? "Personal Gemini API key verified" : "Server default Gemini API key verified"
      };
    }
    return {
      success: false,
      latency,
      details: "Empty response from Gemini API"
    };
  } catch (err) {
    const latency = Date.now() - start;
    if (isAuthError(err)) {
      return { success: false, latency, details: "Invalid API Key" };
    }
    if (isQuotaError(err)) {
      return { success: false, latency, details: "Rate Limited (HTTP 429)" };
    }
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, latency, details: msg.replace(/AIza[0-9A-Za-z-_]{20,}/g, "[REDACTED]") };
  }
}
async function executeAnalyze(params) {
  const { base64Image, mimeType, activeTab = "vectorize", apiKey } = params;
  const ai = createAiClient(apiKey);
  const formattedBase64 = base64Image.includes(",") ? base64Image.split(",")[1] : base64Image;
  const promptText = activeTab === "vectorize" ? `Role: You are a Vector Graphics & Visual Morphology Auditor. Analyze the uploaded reference image for precision 2D vectorization.
Extract:
1. "name": A concise vector style name (e.g. "Flat Geometric Vector", "Minimalist Dual-Tone Vector", "Modern Mascot Vector")
2. "basePrompt": A descriptive, high-precision visual directive capturing the subject's exact silhouette, geometry, dominant forms, and flat color blocks for vector generation
3. "negativePrompt": Elements to strictly avoid (photorealistic shading, grainy textures, realistic 3D volume, photo noise, complex gradients)
4. "aspectRatio": "1:1"
5. "dnaWeight": 95
6. "textureIntensity": 0
Return strict JSON: { "name": string, "basePrompt": string, "negativePrompt": string, "aspectRatio": "1:1", "dnaWeight": number, "textureIntensity": number }` : `Role: You are a Structural Design Auditor. Define the artistic style as a JSON object. Focus on ${activeTab === "logo design" ? "LOGO DESIGN" : "GRAPHIC ILLUSTRATION"} elements.
Return a JSON object: { "name": string, "basePrompt": string, "negativePrompt": string, "aspectRatio": "1:1", "dnaWeight": number, "textureIntensity": number }`;
  const response = await ai.models.generateContent({
    model: "gemini-3.8-flash",
    contents: {
      parts: [
        {
          inlineData: {
            data: formattedBase64,
            mimeType: mimeType || "image/png"
          }
        },
        { text: promptText }
      ]
    },
    config: {
      systemInstruction: "You are an expert design auditor who analyzes images and outputs strict JSON specifications."
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  });
  const text = response.text || "";
  if (!text) throw new Error("No analysis generated");
  const parseJson = (str) => {
    try {
      return JSON.parse(str);
    } catch {
      const match = str.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match && match[1]) return JSON.parse(match[1]);
      throw new Error("Failed to parse JSON response from analysis");
    }
  };
  return parseJson(text);
}
async function executeAnalyzeVector(params) {
  const { base64Image, mimeType, apiKey } = params;
  const ai = createAiClient(apiKey);
  const formattedBase64 = base64Image.includes(",") ? base64Image.split(",")[1] : base64Image;
  const response = await ai.models.generateContent({
    model: "gemini-3.8-flash",
    contents: {
      parts: [
        {
          inlineData: {
            data: formattedBase64,
            mimeType: mimeType || "image/png"
          }
        },
        {
          text: `Analyze this image for 2D vector conversion.
Provide a concise breakdown formatted as:
DESCRIPTION: [Describe the primary subject, pose, silhouette, and composition]
COLORS: [List the 3-5 dominant colors in hex or clean color names]
SHAPES: [List key geometric forms and outline characteristics]`
        }
      ]
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  });
  const text = response.text || "";
  if (!text) return null;
  const descMatch = text.match(/DESCRIPTION:\s*([^\n]+)/i);
  const colorsMatch = text.match(/COLORS:\s*([^\n]+)/i);
  const shapesMatch = text.match(/SHAPES:\s*([^\n]+)/i);
  return {
    description: descMatch ? descMatch[1].trim() : text.slice(0, 200),
    colors: colorsMatch ? colorsMatch[1].trim() : "Flat solid palette",
    shapes: shapesMatch ? shapesMatch[1].trim() : "Clean 2D vector paths"
  };
}
async function executeRefineTypography(params) {
  const { base64Image, mimeType, originalPrompt, targetText, targetPreset, apiKey } = params;
  const ai = createAiClient(apiKey);
  const formattedBase64 = base64Image.includes(",") ? base64Image.split(",")[1] : base64Image;
  const response = await ai.models.generateContent({
    model: "gemini-3.8-flash",
    contents: {
      parts: [
        {
          inlineData: {
            data: formattedBase64,
            mimeType: mimeType || "image/png"
          }
        },
        {
          text: `Role: Typographic Quality Auditor. Refine the prompt for better spelling of "${targetText}" and matching "${targetPreset}" style. Original: ${originalPrompt}`
        }
      ]
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  });
  return { refinedPrompt: response.text || originalPrompt };
}
async function executeVisionAnalysis(params) {
  const { base64Image, mimeType, apiKey } = params;
  const ai = createAiClient(apiKey);
  const formattedBase64 = base64Image.includes(",") ? base64Image.split(",")[1] : base64Image;
  const response = await ai.models.generateContent({
    model: "gemini-3.8-flash",
    contents: {
      parts: [
        {
          inlineData: {
            data: formattedBase64,
            mimeType
          }
        },
        {
          text: `Analyze this image and return a JSON object with the following structure:
          {
            "global_context": {
              "scene_description": "string",
              "color_palette": { "dominant_hex_estimates": ["#HEX1", "#HEX2"] }
            },
            "objects": [
              { "id": "obj_001", "label": "string", "pose_orientation": "string", "box_2d": [0, 0, 1000, 1000] }
            ]
          }`
        }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: import_genai.Type.OBJECT,
        properties: {
          global_context: {
            type: import_genai.Type.OBJECT,
            properties: {
              scene_description: { type: import_genai.Type.STRING },
              color_palette: {
                type: import_genai.Type.OBJECT,
                properties: {
                  dominant_hex_estimates: {
                    type: import_genai.Type.ARRAY,
                    items: { type: import_genai.Type.STRING }
                  }
                }
              }
            }
          },
          objects: {
            type: import_genai.Type.ARRAY,
            items: {
              type: import_genai.Type.OBJECT,
              properties: {
                id: { type: import_genai.Type.STRING },
                label: { type: import_genai.Type.STRING },
                pose_orientation: { type: import_genai.Type.STRING },
                box_2d: {
                  type: import_genai.Type.ARRAY,
                  items: { type: import_genai.Type.NUMBER }
                }
              }
            }
          }
        }
      }
    }
  });
  return JSON.parse(response.text);
}

// server/cloudflareBackend.ts
var import_sharp = __toESM(require("sharp"), 1);
function resolveCloudflareCredentials(params) {
  const accountId = (params?.accountIdOverride || process.env.CLOUDFLARE_ACCOUNT_ID || "").trim();
  const apiToken = (params?.apiTokenOverride || process.env.CLOUDFLARE_API_TOKEN || "").trim();
  return { accountId, apiToken };
}
var CLOUDFLARE_FLUX_MAX_PROMPT_LENGTH = 2048;
function buildCloudflarePrompt(prompt, aspectRatio) {
  if (prompt === null || prompt === void 0 || typeof prompt !== "string") {
    throw new Error("Prompt is required and must be a non-empty string");
  }
  let cleanPrompt = prompt.replace(/\r/g, "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  if (!cleanPrompt) {
    throw new Error("Prompt is required and must be a non-empty string");
  }
  let ratioSuffix = "";
  if (aspectRatio) {
    const ratioMap = {
      "1:1": "square 1:1 aspect ratio",
      "16:9": "widescreen 16:9 aspect ratio",
      "4:3": "standard 4:3 aspect ratio",
      "3:4": "portrait 3:4 aspect ratio",
      "9:16": "vertical 9:16 aspect ratio"
    };
    const ratioDescriptor = ratioMap[aspectRatio] || `${aspectRatio} aspect ratio`;
    ratioSuffix = `, ${ratioDescriptor}`;
  }
  if (ratioSuffix && cleanPrompt.endsWith(ratioSuffix.trim())) {
    ratioSuffix = "";
  }
  const initialAssembled = `${cleanPrompt}${ratioSuffix}`;
  if (initialAssembled.length <= CLOUDFLARE_FLUX_MAX_PROMPT_LENGTH) {
    return initialAssembled;
  }
  const budget = CLOUDFLARE_FLUX_MAX_PROMPT_LENGTH - ratioSuffix.length;
  if (budget <= 0) {
    throw new Error("Aspect ratio parameter is too long for Cloudflare FLUX.1 [schnell] prompt constraints.");
  }
  if (cleanPrompt.includes("NEGATIVE PROMPT:")) {
    cleanPrompt = cleanPrompt.split("NEGATIVE PROMPT:")[0].trim();
  }
  cleanPrompt = cleanPrompt.replace(/## GEMINI 3.8 FLASH VISION AUDIT:\s*/gi, "Vision Audit: ").replace(/\n*-\s*Subject Morphology:\s*/gi, " Subject: ").replace(/\n*-\s*Dominant Color Palette:\s*/gi, " Colors: ").replace(/\n*-\s*Vector Outline:\s*/gi, " Shapes: ").replace(/\s+/g, " ").trim();
  if (`${cleanPrompt}${ratioSuffix}`.length <= CLOUDFLARE_FLUX_MAX_PROMPT_LENGTH) {
    return `${cleanPrompt}${ratioSuffix}`;
  }
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
async function executeCloudflareGenerateImage(params) {
  const { prompt, aspectRatio } = params;
  const { accountId, apiToken } = resolveCloudflareCredentials(params);
  if (!accountId || !apiToken) {
    throw new Error(
      "Cloudflare Workers AI credentials are not configured on the server. Please set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN in server environment variables."
    );
  }
  const finalPrompt = buildCloudflarePrompt(prompt, aspectRatio);
  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/black-forest-labs/flux-1-schnell`;
  let response;
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
  } catch (netErr) {
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
      const contentType2 = response.headers.get("content-type") || "";
      if (contentType2.includes("application/json")) {
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
  let rawBuffer;
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
  let pngBuffer = rawBuffer;
  try {
    const metadata = await (0, import_sharp.default)(rawBuffer).metadata();
    if (metadata.format !== "png") {
      pngBuffer = await (0, import_sharp.default)(rawBuffer).png().toBuffer();
    }
  } catch (formatErr) {
    console.warn("Sharp failed to read image format, attempting direct PNG conversion:", formatErr);
    pngBuffer = await (0, import_sharp.default)(rawBuffer).png().toBuffer();
  }
  if (pngBuffer.length < 8 || pngBuffer[0] !== 137 || pngBuffer[1] !== 80 || pngBuffer[2] !== 78 || pngBuffer[3] !== 71 || pngBuffer[4] !== 13 || pngBuffer[5] !== 10 || pngBuffer[6] !== 26 || pngBuffer[7] !== 10) {
    throw new Error("Image buffer from Cloudflare does not contain valid PNG magic bytes");
  }
  const base64Png = pngBuffer.toString("base64");
  return {
    image: `data:image/png;base64,${base64Png}`,
    provider: "cloudflare",
    modelUsed: "@cf/black-forest-labs/flux-1-schnell"
  };
}
function getDimensionsForAspectRatio(aspectRatio) {
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
async function executeCloudflareEditImage(params) {
  const { prompt, aspectRatio, mimeType } = params;
  const { accountId, apiToken } = resolveCloudflareCredentials(params);
  if (!accountId || !apiToken) {
    throw new Error(
      "Cloudflare Workers AI credentials are not configured on the server. Please set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN in server environment variables."
    );
  }
  const finalPrompt = buildCloudflarePrompt(prompt, aspectRatio);
  let inputBuffer;
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
  if (inputBuffer.length > 20 * 1024 * 1024) {
    throw new Error("Reference image exceeds maximum allowed upload size of 20MB.");
  }
  let verifiedMime = mimeType || "image/png";
  try {
    const metadata = await (0, import_sharp.default)(inputBuffer).metadata();
    if (!metadata || !metadata.format) {
      throw new Error("Corrupted metadata");
    }
    if (metadata.format === "jpeg" || metadata.format === "jpg") {
      verifiedMime = "image/jpeg";
    } else if (metadata.format === "png") {
      verifiedMime = "image/png";
    } else if (metadata.format === "webp") {
      verifiedMime = "image/webp";
    } else if (metadata.format === "gif") {
      verifiedMime = "image/gif";
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Unsupported or corrupted reference image format: ${msg}`);
  }
  const { width, height } = getDimensionsForAspectRatio(aspectRatio);
  const formData = new FormData();
  formData.append("prompt", finalPrompt);
  const imageBlob = new Blob([new Uint8Array(inputBuffer)], { type: verifiedMime });
  formData.append("image_1", imageBlob, "reference_image.png");
  formData.append("width", String(width));
  formData.append("height", String(height));
  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/black-forest-labs/flux-2-klein-4b`;
  let response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`
      },
      body: formData
    });
  } catch (netErr) {
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
      const contentType2 = response.headers.get("content-type") || "";
      if (contentType2.includes("application/json")) {
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
  let rawBuffer;
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
  let pngBuffer = rawBuffer;
  try {
    const metadata = await (0, import_sharp.default)(rawBuffer).metadata();
    if (metadata.format !== "png") {
      pngBuffer = await (0, import_sharp.default)(rawBuffer).png().toBuffer();
    }
  } catch (formatErr) {
    console.warn("Sharp failed to read image format, attempting direct PNG conversion:", formatErr);
    pngBuffer = await (0, import_sharp.default)(rawBuffer).png().toBuffer();
  }
  if (pngBuffer.length < 8 || pngBuffer[0] !== 137 || pngBuffer[1] !== 80 || pngBuffer[2] !== 78 || pngBuffer[3] !== 71 || pngBuffer[4] !== 13 || pngBuffer[5] !== 10 || pngBuffer[6] !== 26 || pngBuffer[7] !== 10) {
    throw new Error("Image buffer from Cloudflare does not contain valid PNG magic bytes");
  }
  const base64Png = pngBuffer.toString("base64");
  return {
    image: `data:image/png;base64,${base64Png}`,
    provider: "cloudflare",
    modelUsed: "@cf/black-forest-labs/flux-2-klein-4b"
  };
}

// server.ts
async function ensurePremiumPwaAssets() {
  const publicDir = import_path.default.join(process.cwd(), "public");
  if (!import_fs.default.existsSync(publicDir)) {
    import_fs.default.mkdirSync(publicDir, { recursive: true });
  }
  const svgPath = import_path.default.join(publicDir, "icon.svg");
  const icon192Path = import_path.default.join(publicDir, "icon-192.png");
  const icon512Path = import_path.default.join(publicDir, "icon-512.png");
  const maskablePath = import_path.default.join(publicDir, "maskable-icon-512.png");
  const screenshotDesktopPath = import_path.default.join(publicDir, "screenshot-desktop.png");
  const screenshotMobilePath = import_path.default.join(publicDir, "screenshot-mobile.png");
  if (import_fs.default.existsSync(svgPath)) {
    try {
      if (!import_fs.default.existsSync(icon192Path)) {
        await (0, import_sharp2.default)(svgPath).resize(192, 192).png().toFile(icon192Path);
        console.log("Successfully generated icon-192.png");
      }
      if (!import_fs.default.existsSync(icon512Path)) {
        await (0, import_sharp2.default)(svgPath).resize(512, 512).png().toFile(icon512Path);
        console.log("Successfully generated icon-512.png");
      }
      if (!import_fs.default.existsSync(maskablePath)) {
        await (0, import_sharp2.default)(svgPath).resize(512, 512, { fit: "contain", background: "#09090B" }).png().toFile(maskablePath);
        console.log("Successfully generated maskable-icon-512.png");
      }
    } catch (err) {
      console.error("Error generating icons:", err);
    }
  }
  if (!import_fs.default.existsSync(screenshotDesktopPath)) {
    const desktopSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 800" width="1280" height="800">
  <rect width="1280" height="800" fill="#09090B"/>
  <rect width="1280" height="64" fill="#0E0E11" stroke="#1E1E24" stroke-width="1"/>
  <text x="40" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="bold" font-size="18" fill="#FFFFFF">ELITE 72 | DESIGN INTELLIGENCE</text>
  <text x="1100" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" fill="#A1A1AA" text-anchor="end">v1.1.0 \u2022 Workspace Active</text>
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
      await (0, import_sharp2.default)(Buffer.from(desktopSvg)).png().toFile(screenshotDesktopPath);
      console.log("Successfully generated screenshot-desktop.png");
    } catch (err) {
      console.error("Error generating desktop screenshot:", err);
    }
  }
  if (!import_fs.default.existsSync(screenshotMobilePath)) {
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
      await (0, import_sharp2.default)(Buffer.from(mobileSvg)).png().toFile(screenshotMobilePath);
      console.log("Successfully generated screenshot-mobile.png");
    } catch (err) {
      console.error("Error generating mobile screenshot:", err);
    }
  }
}
function createApp() {
  const app = (0, import_express.default)();
  app.use((req, res, next) => {
    const origin = req.headers.origin;
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
  app.use(import_express.default.json({ limit: "50mb" }));
  app.use(import_express.default.urlencoded({ limit: "50mb", extended: true }));
  app.use("/Elite_72_Library_Organized", import_express.default.static(import_path.default.join(process.cwd(), "Elite_72_Library_Organized")));
  const apiLimiter = createRateLimiter({
    windowMs: 60 * 1e3,
    maxRequests: 60,
    message: "Rate limit reached. Please wait a moment before sending more requests."
  });
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      hasDefaultKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim()),
      hasCloudflareConfigured: Boolean(
        process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_ACCOUNT_ID.trim() && process.env.CLOUDFLARE_API_TOKEN && process.env.CLOUDFLARE_API_TOKEN.trim()
      )
    });
  });
  app.post("/api/cloudflare/generate-image", apiLimiter, async (req, res) => {
    const { prompt, aspectRatio } = req.body || {};
    try {
      const result = await executeCloudflareGenerateImage({ prompt, aspectRatio });
      return res.json(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Cloudflare image generation failed";
      let status = 500;
      if (message.includes("is required") || message.includes("exceeds the maximum allowed length") || message.includes("must be a non-empty string") || message.includes("could not be safely reduced") || message.includes("too long for Cloudflare")) {
        status = 400;
      } else if (message.includes("429") || message.includes("quota") || message.includes("rate limit")) {
        status = 429;
      } else if (message.includes("401") || message.includes("403") || message.includes("authentication failed")) {
        status = 401;
      }
      return res.status(status).json({ error: message });
    }
  });
  app.post("/api/cloudflare/edit-image", apiLimiter, async (req, res) => {
    const { prompt, base64Image, mimeType, aspectRatio } = req.body || {};
    try {
      const result = await executeCloudflareEditImage({ prompt, base64Image, mimeType, aspectRatio });
      return res.json(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Cloudflare image editing failed";
      let status = 500;
      if (message.includes("is required") || message.includes("exceeds the maximum allowed length") || message.includes("must be a non-empty string") || message.includes("could not be safely reduced") || message.includes("too long for Cloudflare") || message.includes("Unsupported") || message.includes("corrupted") || message.includes("exceeds maximum allowed upload size") || message.includes("Reference image is required")) {
        status = 400;
      } else if (message.includes("429") || message.includes("quota") || message.includes("rate limit")) {
        status = 429;
      } else if (message.includes("401") || message.includes("403") || message.includes("authentication failed")) {
        status = 401;
      }
      return res.status(status).json({ error: message });
    }
  });
  app.post("/api/prepare-reference", apiLimiter, async (req, res) => {
    try {
      const { referenceImagePath, sourceImagePath, cropBox } = req.body || {};
      const libraryDir = import_path.default.join(process.cwd(), "Elite_72_Library_Organized");
      const allowedBaseDir = import_path.default.resolve(libraryDir);
      let finalBase64 = "";
      let finalMimeType = "";
      if (cropBox && sourceImagePath) {
        if (typeof sourceImagePath !== "string") {
          return res.status(400).json({ error: "Invalid sourceImagePath parameter" });
        }
        const cleanSourcePath = sourceImagePath.split("?")[0].replace(/\\/g, "/");
        const imgPathRel = import_path.default.join(libraryDir, cleanSourcePath.replace(/^\/?Elite_72_Library_Organized\//, ""));
        const resolvedPath = import_path.default.resolve(imgPathRel);
        if (!resolvedPath.startsWith(allowedBaseDir)) {
          return res.status(403).json({ error: "Access denied: Path outside allowed directory" });
        }
        if (!import_fs.default.existsSync(resolvedPath)) {
          return res.status(404).json({ error: "Source image not found" });
        }
        const { x, y, width, height } = cropBox;
        if (typeof x !== "number" || typeof y !== "number" || typeof width !== "number" || typeof height !== "number") {
          return res.status(400).json({ error: "Invalid cropBox parameters" });
        }
        const imageMetadata = await (0, import_sharp2.default)(resolvedPath).metadata();
        if (!imageMetadata.width || !imageMetadata.height) {
          return res.status(500).json({ error: "Failed to read image dimensions" });
        }
        const safeX = Math.min(Math.max(0, Math.round(x)), imageMetadata.width - 1);
        const safeY = Math.min(Math.max(0, Math.round(y)), imageMetadata.height - 1);
        const safeWidth = Math.min(Math.max(1, Math.round(width)), imageMetadata.width - safeX);
        const safeHeight = Math.min(Math.max(1, Math.round(height)), imageMetadata.height - safeY);
        const croppedBuffer = await (0, import_sharp2.default)(resolvedPath).extract({ left: safeX, top: safeY, width: safeWidth, height: safeHeight }).png().toBuffer();
        finalBase64 = croppedBuffer.toString("base64");
        finalMimeType = "image/png";
      } else if (referenceImagePath) {
        if (typeof referenceImagePath !== "string") {
          return res.status(400).json({ error: "Invalid referenceImagePath parameter" });
        }
        let fileData;
        let mime = "image/jpeg";
        if (referenceImagePath.startsWith("http://") || referenceImagePath.startsWith("https://")) {
          try {
            const fetched = await fetchSafeImage(referenceImagePath, {
              maxBytes: 20 * 1024 * 1024,
              timeoutMs: 1e4,
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
          const cleanRefPath = referenceImagePath.split("?")[0].replace(/\\/g, "/");
          const imagePathExt = import_path.default.join(libraryDir, cleanRefPath.replace(/^\/?Elite_72_Library_Organized\//, ""));
          const resolvedPath = import_path.default.resolve(imagePathExt);
          if (!resolvedPath.startsWith(allowedBaseDir)) {
            return res.status(403).json({ error: "Access denied: Path outside allowed directory" });
          }
          if (!import_fs.default.existsSync(resolvedPath)) {
            return res.status(404).json({ error: "Reference file not found" });
          }
          fileData = import_fs.default.readFileSync(resolvedPath);
          const ext = import_path.default.extname(resolvedPath).toLowerCase();
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
    } catch (error) {
      console.error("Preparation Error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to prepare reference" });
    }
  });
  app.post("/api/gemini/generate", apiLimiter, async (req, res) => {
    const { key, isPersonal } = resolveApiKey(req);
    const { model, prompt, base64Image, mimeType, aspectRatio } = req.body || {};
    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({ error: "Prompt is required and must be a non-empty string" });
    }
    if (prompt.length > 1e4) {
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
        error: "Gemini API key is not configured on the server. Please add your personal Gemini API key in Settings (\u2699)."
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
  app.post("/api/gemini/verify-key", apiLimiter, async (req, res) => {
    const { key, isPersonal } = resolveApiKey(req);
    const result = await executeVerifyKey(key, isPersonal);
    res.json(result);
  });
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
  app.get("/sw.js", (req, res) => {
    const swPath = import_path.default.join(process.cwd(), "public", "sw.js");
    if (import_fs.default.existsSync(swPath)) {
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
  const PORT = 3e3;
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(import_express.default.static(import_path.default.join(process.cwd(), "public")));
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.use(import_express.default.static(import_path.default.join(process.cwd(), "public")));
    app.get("*all", (req, res, next) => {
      if (req.originalUrl.startsWith("/api/") || req.originalUrl.startsWith("/Elite_72_Library_Organized/")) {
        return next();
      }
      const indexPath = import_path.default.join(distPath, "index.html");
      if (import_fs.default.existsSync(indexPath)) {
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
var isDirectExecution = Boolean(
  process.env.NODE_ENV !== "test" && process.argv[1] && (process.argv[1].endsWith("server.ts") || process.argv[1].endsWith("server.cjs") || process.argv[1].endsWith("server.js"))
);
if (isDirectExecution) {
  startServer();
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createApp
});
//# sourceMappingURL=server.cjs.map
