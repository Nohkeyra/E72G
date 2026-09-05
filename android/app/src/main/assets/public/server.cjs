var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_sharp = __toESM(require("sharp"), 1);
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
        await (0, import_sharp.default)(svgPath).resize(192, 192).png().toFile(icon192Path);
        console.log("Successfully generated icon-192.png");
      }
      if (!import_fs.default.existsSync(icon512Path)) {
        await (0, import_sharp.default)(svgPath).resize(512, 512).png().toFile(icon512Path);
        console.log("Successfully generated icon-512.png");
      }
      if (!import_fs.default.existsSync(maskablePath)) {
        await (0, import_sharp.default)(svgPath).resize(512, 512, {
          fit: "contain",
          background: "#09090B"
        }).png().toFile(maskablePath);
        console.log("Successfully generated maskable-icon-512.png");
      }
    } catch (err) {
      console.error("Error generating icons:", err);
    }
  } else {
    console.warn("icon.svg not found, skipping icon generation");
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
</svg>
    `.trim();
    try {
      await (0, import_sharp.default)(Buffer.from(desktopSvg)).png().toFile(screenshotDesktopPath);
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
</svg>
    `.trim();
    try {
      await (0, import_sharp.default)(Buffer.from(mobileSvg)).png().toFile(screenshotMobilePath);
      console.log("Successfully generated screenshot-mobile.png");
    } catch (err) {
      console.error("Error generating mobile screenshot:", err);
    }
  }
}
async function startServer() {
  await ensurePremiumPwaAssets();
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json({ limit: "50mb" }));
  app.use(import_express.default.urlencoded({ limit: "50mb", extended: true }));
  app.use("/Elite_72_Library_Organized", import_express.default.static(import_path.default.join(process.cwd(), "Elite_72_Library_Organized")));
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });
  app.post("/api/prepare-reference", async (req, res) => {
    try {
      const { referenceImagePath, sourceImagePath, cropBox } = req.body;
      const libraryDir = import_path.default.join(process.cwd(), "Elite_72_Library_Organized");
      const allowedBaseDir = import_path.default.resolve(libraryDir);
      let finalBase64 = "";
      let finalMimeType = "";
      if (cropBox && sourceImagePath) {
        const cleanSourcePath = (sourceImagePath || "").split("?")[0].replace(/\\/g, "/");
        const imgPathRel = import_path.default.join(libraryDir, cleanSourcePath.replace(/^\/?Elite_72_Library_Organized\//, ""));
        const resolvedPath = import_path.default.resolve(imgPathRel);
        if (!resolvedPath.startsWith(allowedBaseDir)) {
          return res.status(403).json({ error: "Access denied" });
        }
        if (!import_fs.default.existsSync(resolvedPath)) {
          return res.status(404).json({ error: "Source image not found" });
        }
        const { x, y, width, height } = cropBox;
        const imageMetadata = await (0, import_sharp.default)(resolvedPath).metadata();
        if (!imageMetadata.width || !imageMetadata.height) {
          return res.status(500).json({ error: "Failed to read dimensions" });
        }
        const safeX = Math.min(Math.max(0, Math.round(x)), imageMetadata.width - 1);
        const safeY = Math.min(Math.max(0, Math.round(y)), imageMetadata.height - 1);
        const safeWidth = Math.min(Math.round(width), imageMetadata.width - safeX);
        const safeHeight = Math.min(Math.round(height), imageMetadata.height - safeY);
        const croppedBuffer = await (0, import_sharp.default)(resolvedPath).extract({ left: safeX, top: safeY, width: safeWidth, height: safeHeight }).png().toBuffer();
        finalBase64 = croppedBuffer.toString("base64");
        finalMimeType = "image/png";
      } else if (referenceImagePath) {
        let imagePathExt = referenceImagePath;
        let fileData;
        let resolvedPathForExt = "";
        if (imagePathExt.startsWith("http://") || imagePathExt.startsWith("https://")) {
          const res2 = await fetch(imagePathExt);
          if (!res2.ok) throw new Error("Failed to fetch reference image: " + res2.statusText);
          const arrayBuffer = await res2.arrayBuffer();
          fileData = Buffer.from(arrayBuffer);
          resolvedPathForExt = imagePathExt;
        } else {
          const cleanRefPath = (referenceImagePath || "").split("?")[0].replace(/\\/g, "/");
          imagePathExt = import_path.default.join(libraryDir, cleanRefPath.replace(/^\/?Elite_72_Library_Organized\//, ""));
          const resolvedPath = import_path.default.resolve(imagePathExt);
          if (!resolvedPath.startsWith(allowedBaseDir)) {
            return res.status(403).json({ error: "Access denied" });
          }
          if (!import_fs.default.existsSync(resolvedPath)) {
            console.error("Reference file not found at:", resolvedPath);
            return res.status(404).json({ error: "Reference not found" });
          }
          fileData = import_fs.default.readFileSync(resolvedPath);
          resolvedPathForExt = resolvedPath;
        }
        finalBase64 = fileData.toString("base64");
        const ext = import_path.default.extname(resolvedPathForExt).split("?")[0].toLowerCase();
        if (ext === ".jpg" || ext === ".jpeg") finalMimeType = "image/jpeg";
        else if (ext === ".png") finalMimeType = "image/png";
        else if (ext === ".webp") finalMimeType = "image/webp";
        else finalMimeType = "image/jpeg";
      } else {
        return res.status(400).json({ error: "Missing reference parameters" });
      }
      res.json({ base64: finalBase64, mimeType: finalMimeType });
    } catch (error) {
      console.error("Preparation Error:", error);
      res.status(500).json({ error: error.message || "Failed to prepare reference" });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
    app.use(import_express.default.static(import_path.default.join(process.cwd(), "public")));
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.use(import_express.default.static(import_path.default.join(process.cwd(), "public")));
    app.get("*all", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
