# Vectorize Workflow Performance & Reliability Optimization

Optimize the Vectorize image-to-image pipeline for Cloudflare Workers AI (`@cf/black-forest-labs/flux-2-klein-4b`), implementing optimized source image preprocessing (resizing/compression), robust error handling, bounded exponential-backoff retries with jitter for transient errors, appropriate timeouts, and clear progress/failure feedback.

## User Review & Critical Decisions

> [!IMPORTANT]
> - **Preprocessing Optimization**: Source reference images will be resized and compressed prior to uploading/transmitting to avoid oversized payloads and slow round-trips.
> - **Error Recovery & Retries**: Transient network errors or rate limits (HTTP 429) will use bounded exponential-backoff retries with jitter respecting `Retry-After`. Non-retryable errors (such as HTTP 400) will fail immediately without retry loops.
> - **Zero Paid Fallback**: Cloudflare errors will be cleanly parsed and presented with actionable failure messages without silent fallback to paid Gemini providers.

- **Confirmed Decision 1**: Optimized source image preprocessing and robust timeout/retry handling.
- **Confirmed Decision 2**: Actionable error reporting and zero silent paid provider fallback.

---

## 1. Overview & Core Concept

- **What It Does**: Enhances the Vectorize image-to-image pipeline (`/api/cloudflare/edit-image`) with efficient image preprocessing (resizing, compression, format normalization), robust timeout management, clean error parsing for Cloudflare Workers AI, and intelligent bounded retry logic for transient failures.
- **Target Audience / Persona**: Designers and creators using Elite 72 Studio to convert raster artwork or reference photos into clean 2D vector illustrations.
- **Key Value**: Fast, reliable, and predictable Vectorize generations with clear progress states and actionable error messages when upstream quotas or timeouts occur.

## 2. User Experience & Visual Design

- **Key User Flows**: 
  1. User uploads or selects a reference image in Vector mode and clicks "Synthesize" or "Vectorize".
  2. Frontend compresses/resizes image if oversized and displays active progress indicator.
  3. Backend processes reference image via Sharp (resizing to max 1024px, optimizing PNG/JPEG quality), executes Cloudflare `flux-2-klein-4b` generation with proper timeout handling.
  4. On success, high-precision vector PNG is displayed in canvas. On error, descriptive actionable toast/alert is shown.
- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Utilitarian, high-performance professional design workspace.
  - *Color Palette & Mood*: Dark-mode obsidian backgrounds (`#09090B`), amber/gold accents (`#F59E0B`), and crystal-clear status feedback indicators.

## 3. Key Product Decisions & Trade-Offs

- **Decision 1**: Client/Server Image Preprocessing
  - *Chosen Approach*: Resize reference images to max 1024px and compress with Sharp on both client upload preparation and server-side receipt.
  - *Why*: Drastically reduces payload size, network transfer latency, and Cloudflare memory pressure.
- **Decision 2**: Bounded Retries for Transient Errors
  - *Chosen Approach*: Implement exponential-backoff retries with jitter specifically for HTTP 429 / network timeouts, while failing fast on HTTP 400 bad requests.
  - *Why*: Prevents infinite request loops and unnecessary quota exhaustion while gracefully recovering from transient network blips.

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

```
┌─────────────────────────┐          ┌─────────────────────────┐          ┌──────────────────────────┐
│   Vector UI Component   │ ───────> │ Express Backend Proxy   │ ───────> │ Cloudflare Workers AI    │
│  (Upload & Preprocess)  │          │ (/api/cloudflare/edit)  │          │ (FLUX.2 Klein 4B Model)  │
└─────────────────────────┘          └─────────────────────────┘          └──────────────────────────┘
             │                                    │                                    │
             ▼                                    ▼                                    ▼
┌─────────────────────────┐          ┌─────────────────────────┐          ┌──────────────────────────┐
│ Client-Side Compression │          │ Sharp Resize/Normalize  │          │ Response Validation &    │
│ & Payload Size Check    │          │ & Timeout & Retry Logic │          │ PNG Magic Byte Checks    │
└─────────────────────────┘          └─────────────────────────┘          └──────────────────────────┘
```

- **Data Model & State**: Reference images, crop parameters, base64 data buffers, active generation states, and error states.
- **Interactive Component & State Mapping**:
  - `VectorStrategy`: Constructs precise identity lock prompts for vectorization.
  - `executeCloudflareEditImage`: Handles Sharp image optimization, timeout setup, fetch request with retry-with-jitter policy, and response validation.
- **Key Sequences & Integrations**: Image upload -> Sharp compression -> Cloudflare multipart form request -> PNG validation -> Canvas render.
