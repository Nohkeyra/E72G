# Elite 72 Design Intelligence — Revised Cloudflare Workers AI FLUX.1 [schnell] Integration Plan

Revised architectural blueprint for integrating Cloudflare Workers AI (`@cf/black-forest-labs/flux-1-schnell`) as a zero-cost text-to-image synthesis provider for Elite 72 Design Intelligence. This plan enables standalone mobile (Android APK via Capacitor) and web generation without requiring paid Gemini API keys or Google Cloud image billing.

---

## Key Revisions & Confirmed Directives

1. **API Contract Grounding (`@cf/black-forest-labs/flux-1-schnell`)**:
   - REST Endpoint: `POST https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/run/@cf/black-forest-labs/flux-1-schnell`
   - Authentication: `Authorization: Bearer {api_token}`
   - Input Payload: `{ "prompt": string, "num_steps": number (default 4, max 8) }`
   - Contract Constraint: FLUX.1 [schnell] on Cloudflare Workers AI receives text `prompt` and `num_steps`. Aspect ratios and reference image inputs are handled via server-side prompt enrichment or capability guardrails rather than unsupported request parameters.

2. **Guaranteed PNG Signature & Conversion**:
   - The backend (`server/cloudflareBackend.ts`) receives raw binary data from Workers AI.
   - Uses `sharp` server-side to inspect image metadata (`sharp(buffer).metadata()`).
   - If the returned format is not PNG (e.g. JPEG), converts the image buffer directly to PNG using `sharp(buffer).png().toBuffer()`.
   - Validates the 8-byte PNG signature (`89 50 4E 47 0D 0A 1A 0A`) before constructing the base64 `data:image/png;base64,...` payload.

3. **Quota & Account Limits**:
   - Cloudflare Workers AI free tier provides 10,000 Neurons/day. FLUX.1 [schnell] consumes ~90 Neurons per 4-step generation (~110 free images/day per Cloudflare account).
   - When quota is exhausted (HTTP 429), the server returns a clear message explaining the quota limit.
   - **Never auto-switch to paid Gemini** on quota failure; explicit user selection is required.

4. **Deterministic Provider Selection Rules**:
   - Default provider selection for text-to-image: Cloudflare FLUX.1 [schnell] when free generation is requested or Gemini billing is unconfigured.
   - Explicit user toggle (`Cloudflare FLUX` vs `Gemini Image`) across all image tabs.
   - Presence of a Gemini API key does NOT imply billing enablement; Gemini remains an opt-in choice when billing is enabled by the user.

5. **Reference-Image Capability Guardrails**:
   - FLUX.1 [schnell] is strictly text-to-image.
   - If a reference image, cropped sample, or logo base is attached in any section (Image Generation, Vectorize, Logo, Typography), selecting Cloudflare displays an inline warning:
     > *"Cloudflare FLUX.1 [schnell] supports text-to-image synthesis only. Please switch to Gemini Image or remove the reference image to proceed."*
   - Form inputs, text prompts, and uploaded reference assets are fully preserved when displaying this warning.

6. **Preservation of Four Core UI Sections**:
   - Retains all existing controls, workflows, reference image handling, and PNG downloads in:
     - **Image Generation**
     - **Vectorize** (vector-styled image generation; no SVG tracing substitution)
     - **Logo Workspace**
     - **Typography Playground**

7. **Credential Security & Mobile Protection**:
   - `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` are stored exclusively on the server (`server.ts` / `.env`).
   - Zero credentials, tokens, or private secrets in frontend JavaScript or Android APK bundles.

---

## System Architecture Diagram

```
┌────────────────────────────────────────────────────────┐
│                   Frontend Client                      │
│   (Image Generation / Logo / Vectorize / Typography)   │
└───────────────────────────┬────────────────────────────┘
                            │
              ┌─────────────┴─────────────┐
              │  src/services/imageService│
              └─────────────┬─────────────┘
                            │
            Provider Switch & Capability Check
           ┌────────────────┴────────────────┐
           │                                 │
 [Cloudflare FLUX.1]                 [Google Gemini]
 (Text-to-Image Only)                (Text & Image-to-Image)
           │                                 │
           ▼                                 ▼
POST /api/cloudflare/generate-image  POST /api/gemini/generate
           │                                 │
           ▼                                 ▼
 ┌──────────────────────┐          ┌───────────────────┐
 │ server/              │          │ server/           │
 │ cloudflareBackend.ts │          │ geminiBackend.ts  │
 └──────────┬───────────┘          └─────────┬─────────┘
            │                                │
      sharp Inspection &               Gemini SDK
      PNG Validation                   (Imagen 3 / 3.1)
            │                                │
            ▼                                ▼
 Cloudflare Workers AI               Google Gemini API
 @cf/black-forest-labs/
 flux-1-schnell
```

---

## Detailed Implementation Plan

### Step 1: Server-Side Cloudflare Integration (`server/cloudflareBackend.ts` & `server.ts`)
- Implement `executeCloudflareGenerateImage({ prompt, aspectRatio })` in `server/cloudflareBackend.ts`:
  - Validate `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN`.
  - Format prompt (incorporating aspect ratio guidance into prompt descriptors, e.g. "square 1:1 aspect ratio", "cinematic 16:9 widescreen").
  - `POST https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/black-forest-labs/flux-1-schnell` with body `{ "prompt": prompt, "num_steps": 4 }`.
  - Read response buffer.
  - Inspect with `sharp(buffer).metadata()`. If not PNG, convert with `sharp(buffer).png().toBuffer()`.
  - Confirm PNG header bytes (`0x89, 0x50, 0x4E, 0x47`).
  - Return JSON `{ image: "data:image/png;base64,...", provider: "cloudflare", modelUsed: "@cf/black-forest-labs/flux-1-schnell" }`.
- Mount route `POST /api/cloudflare/generate-image` in `server.ts` with rate-limiting and error handling.

### Step 2: Model Registry & Client Service Routing (`src/services/modelRegistry.ts` & `src/services/imageService.ts`)
- Update `modelRegistry.ts` to include `'cf-flux'` (`@cf/black-forest-labs/flux-1-schnell`, label: "Cloudflare FLUX.1 [schnell] (Free)", billingStatus: "Free tier with quota").
- Update `imageService.ts`:
  - Support `providerOverride: 'cloudflare' | 'google_gemini'`.
  - Perform capability check: if `base64Image` or reference preset is provided and provider is `'cloudflare'`, throw a clear capability error before making a network call.
  - Proxy request to `/api/cloudflare/generate-image` when Cloudflare is selected.

### Step 3: Frontend UI Components across Image Tabs
- Add provider selection toggle component in:
  - `src/components/ImageGenerationTab.tsx`
  - `src/components/VectorizeTab.tsx`
  - `src/components/LogoTab.tsx`
  - `src/components/TypographyTab.tsx`
- Display inline capability warning when reference image is uploaded and Cloudflare is active.

### Step 4: Comprehensive Test Suite (`tests/cloudflare.test.ts`)
- Unit tests using Node test runner (`tsx --test`):
  - Cloudflare request payload formatting & header construction.
  - Image buffer inspection and PNG conversion via `sharp`.
  - Quota error (HTTP 429) & timeout handling.
  - Reference image guardrail validation.
  - Regression checks for existing Gemini endpoints.

### Step 5: Verification & Production Build
- Run `npm test`, `npm run typecheck`, `npm run lint`, and `compile_applet`.
- Verify build artifacts in `dist/`.

### Step 6: Deployment & GitHub Actions Documentation
- Update `README.md` with Cloudflare account creation, API token generation (`Workers AI Read` permissions), environment variables (`CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`), free tier limits (10,000 Neurons/day), and GitHub Actions secret configuration for Android APK releases.
