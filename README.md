<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Elite 72 | Design Intelligence

A visual synthesis studio for branding, vector art, and typography. Built with React, TypeScript, Tailwind CSS, Vite, and an Express proxy backend, packaged for mobile via Capacitor Android.

---

## Architecture & Security Model

All interactions with Google Gemini and Imagen models route through a secure, centralized Express backend boundary.

### 1. Application-Owned Default Key
- Configured in the server runtime environment as `GEMINI_API_KEY`.
- Used automatically when incoming client requests do not include a personal API key.
- **Strictly isolated:** Never embedded into frontend bundles, Vite client definitions, Android assets, APK binaries, public configuration, or source maps.
- Never logged or returned in responses.

### 2. User-Owned Personal Key (Optional)
- Users can enter a personal Google Gemini API key in **Settings (⚙) -> API Keys**.
- **Precedence:** When provided, the personal key takes precedence over the application default key for that request.
- **Fail-Safe Integrity:** If a personal key is explicitly provided but invalid (e.g., HTTP 401/403), the backend returns a clear, sanitized error. **It never silently falls back to the server default key.**
- **Restoration:** Clearing the personal key restores usage of the application-owned default key.
- **Transmission:** Sent via HTTP header `x-gemini-api-key` over TLS/HTTPS (never via URL query parameters or body logs).
- **Client Storage Advisory:** Personal keys are saved locally in browser `localStorage` to persist across page reloads. Browser `localStorage` is unencrypted and accessible to same-origin scripts. Never store sensitive credentials on shared or untrusted workstations.

### 3. Backend Abuse & SSRF Safeguards
- **Server-Side Request Forgery (SSRF) Prevention:** Remote reference image fetching (`/api/prepare-reference`) validates URL protocols (HTTP/HTTPS only) and verifies that all resolved DNS addresses do not belong to loopback (`127.0.0.0/8`, `::1`), private networks (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), link-local/cloud metadata (`169.254.169.254`), or multicast ranges. Redirects are capped and each target is strictly re-validated.
- **Rate Limiting:** Sliding-window rate limiter prevents abuse on compute-intensive synthesis and analysis endpoints.
- **Model Allowlisting:** Backend enforces an allowlist of approved models (`gemini-3.1-flash-lite-image`, `gemini-nano-banana-2.1`, `gemini-3-pro-image`, `imagen-3.0-generate-002`, `gemini-3.8-flash`).
- **Sanitized Errors:** Error messages redact internal stack traces, private paths, and credential strings.

---

## Environment Setup

Copy `.env.example` to `.env`:

```bash
# Server-side Gemini API key (Application default key)
GEMINI_API_KEY=your_gemini_api_key_here

# Cloudflare Workers AI Credentials (Free FLUX.1 [schnell] text-to-image synthesis)
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id_here
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token_here

# Optional: Public backend URL when packaging for Capacitor Android APK
VITE_API_URL=https://your-deployed-server.run.app
```

---

## Cloudflare Workers AI Setup & Free Tier Limits

### 1. Cloudflare Account & API Token Setup
1. Sign up for or log in to a [Cloudflare Account](https://dash.cloudflare.com/).
2. Locate your **Account ID** in the Cloudflare Dashboard under **Workers & Pages** -> Overview.
3. Go to **My Profile** -> **API Tokens** -> **Create Token**.
4. Select or create a token with **Workers AI (Read)** permission.
5. Set `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` in your server environment variables or server `.env`.

### 2. Quota & Capability Rules
- **Free Tier Quota:** Cloudflare Workers AI provides 10,000 Neurons/day free. FLUX.1 [schnell] (`@cf/black-forest-labs/flux-1-schnell`) consumes ~90 Neurons per 4-step image synthesis (~110 free images/day per Cloudflare account).
- **Text-to-Image Only:** FLUX.1 [schnell] synthesizes images purely from text prompts. It does **not** support reference-image editing or variation.
- **Reference Guardrails:** When reference images are attached in the app, the UI alerts the user to switch to Gemini Image for reference-based editing.
- **Guaranteed PNG Format:** The backend inspects output bytes using `sharp` and converts non-PNG streams into PNG before returning base64 image data to the client.

---

## Local Development

```bash
# Install dependencies
npm install

# Run the development server (runs Express with Vite middleware on port 3000)
npm run dev
```

---

## Building for Production

### Web Build
```bash
npm run build
```
This runs TypeScript type-checking, builds the frontend bundle into `dist/`, and bundles `server.ts` into `dist/server.cjs`.

### Running Production Server
```bash
npm start
```

---

## Android APK Build & Packaging (Capacitor)

The mobile application is packaged using Capacitor. Because Android WebView runs local web assets (`capacitor://localhost`), API requests to `/api/*` need to reach your deployed HTTPS backend:

1. Build the production web bundle with your deployed backend URL:
   ```bash
   VITE_API_URL=https://your-backend-service.run.app npm run build
   ```
2. Synchronize the built assets into the Android native project:
   ```bash
   npx cap sync android
   ```
3. Alternatively, users running the APK can configure their backend URL directly inside **Settings -> System -> Public Backend URL**.
4. The automated GitHub Actions workflow (`.github/workflows/build-debug-apk.yml`) compiles the debug APK and uploads it as an artifact. Notice that secrets (`GEMINI_API_KEY`) are **not** injected into the web bundle during the APK build.

---

## Credential Rotation Notice

If any Gemini API key was previously committed to git history or shared in source code, treat it as compromised:
1. Open [Google AI Studio](https://aistudio.google.com/) -> **Get API key**.
2. Revoke and delete the compromised key.
3. Generate a new API key.
4. Set the new key as `GEMINI_API_KEY` in your secure server environment (e.g., Cloud Run environment variables or server `.env`).
