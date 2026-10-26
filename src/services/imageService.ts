/* eslint-disable @typescript-eslint/no-explicit-any */
import { resolveModelRoute } from './modelRegistry';
import { callGemini } from './geminiService';
import { cropImage } from './imageUtils';
import { apiUrl } from '../utils/apiBase';

export const generateImage = async (params: any, signal?: AbortSignal) => {
  const { modelId, prompt, base64Image, negativePrompt, preset, apiKeyOverride, providerOverride } = params;
  
  // 1. Model Routing & Provider Selection
  const effectiveModelId = providerOverride === 'cloudflare' ? 'cf-flux' : (modelId || 'cf-flux');
  const registryEntry = resolveModelRoute(effectiveModelId);

  const isCloudflare = registryEntry.provider === 'cloudflare' || providerOverride === 'cloudflare';

  // 2. Reference image presence check
  const hasReference = Boolean(
    base64Image ||
    preset?.sourceImagePath ||
    preset?.referenceImagePath ||
    preset?.previewImagePath
  );

  // 3. Guardrail: Cloudflare FLUX does not support reference-image editing
  if (isCloudflare && hasReference) {
    throw new Error(
      "Cloudflare FLUX.1 [schnell] is a text-to-image model and does not support reference-image editing or variation. Please switch provider to Gemini Image or remove the reference image to proceed."
    );
  }

  // 4. Cloudflare Execution Path
  if (isCloudflare) {
    const finalPrompt = buildFinalPrompt(prompt, negativePrompt);
    const cfRes = await fetch(apiUrl("/api/cloudflare/generate-image"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: finalPrompt,
        aspectRatio: preset?.aspectRatio
      }),
      signal
    });

    if (!cfRes.ok) {
      const errData = await cfRes.json().catch(() => ({}));
      throw new Error(
        errData.error || `Cloudflare image generation failed with HTTP status ${cfRes.status}`
      );
    }

    const cfData = await cfRes.json();
    if (!cfData.image) {
      throw new Error("Cloudflare did not return image data");
    }

    return {
      image: cfData.image,
      provider: 'cloudflare',
      modelUsed: cfData.model || '@cf/black-forest-labs/flux-1-schnell'
    };
  }

  // 5. Google Gemini Execution Path
  let finalBase64 = base64Image;
  let finalMimeType = params.mimeType;

  if (!finalBase64 && (preset?.sourceImagePath || preset?.referenceImagePath || preset?.previewImagePath)) {
    try {
      if (preset.cropBox && preset.sourceImagePath) {
        try {
          const croppedBaseUrl = await cropImage(
            preset.sourceImagePath,
            preset.cropBox,
            'image/jpeg',
            0.95
          );
          finalBase64 = croppedBaseUrl.split(',')[1] || croppedBaseUrl;
          finalMimeType = 'image/jpeg';
        } catch (cropErr) {
          console.warn("Frontend canvas crop failed, attempting backend fallback:", cropErr);
          try {
            const prepRes = await fetch(apiUrl("/api/prepare-reference"), {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                sourceImagePath: preset.sourceImagePath,
                referenceImagePath: preset.referenceImagePath || preset.previewImagePath,
                cropBox: preset.cropBox
              }),
              signal
            });
            if (prepRes.ok) {
              const data = await prepRes.json();
              finalBase64 = data.base64;
              finalMimeType = data.mimeType;
            }
          } catch (apiErr) {
            console.warn("API fallback skipped in current environment:", apiErr);
          }
        }
      } else {
        const imgPath = preset.referenceImagePath || preset.previewImagePath;
        if (imgPath) {
          try {
            const res = await fetch(imgPath, { signal });
            if (res.ok) {
              const blob = await res.blob();
              finalBase64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                  const result = reader.result as string;
                  resolve(result.includes(',') ? result.split(',')[1] : result);
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
              });
              finalMimeType = blob.type || 'image/jpeg';
            }
          } catch (clientFetchErr) {
            console.warn("Client-side image fetch failed, attempting API fallback:", clientFetchErr);
          }

          if (!finalBase64) {
            try {
              const prepRes = await fetch(apiUrl("/api/prepare-reference"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  sourceImagePath: preset.sourceImagePath,
                  referenceImagePath: imgPath,
                  cropBox: preset.cropBox
                }),
                signal
              });
              if (prepRes.ok) {
                const data = await prepRes.json();
                finalBase64 = data.base64;
                finalMimeType = data.mimeType;
              }
            } catch (apiErr) {
              console.warn("API fallback skipped:", apiErr);
            }
          }
        }
      }
    } catch (e) {
      console.warn("Failed to prepare reference image:", e);
    }
  } else if (finalBase64 && preset?.cropBox) {
    try {
      const croppedBaseUrl = await cropImage(
        finalBase64.startsWith('data:') ? finalBase64 : `data:${finalMimeType || 'image/jpeg'};base64,${finalBase64}`,
        preset.cropBox,
        'image/jpeg',
        0.95
      );
      finalBase64 = croppedBaseUrl.split(',')[1] || croppedBaseUrl;
      finalMimeType = 'image/jpeg';
    } catch (e) {
      console.warn("Failed to crop user base64 image:", e);
    }
  }

  const actualGeminiModel = registryEntry.provider === 'google_gemini' ? registryEntry.modelId : 'gemini-3.1-flash-lite-image';

  const result = await callGemini({
    model: actualGeminiModel,
    prompt: buildFinalPrompt(prompt, negativePrompt),
    base64Image: finalBase64,
    mimeType: finalMimeType,
    aspectRatio: preset?.aspectRatio,
    apiKeyOverride,
    signal
  });

  if (result.image) {
    return { 
      image: result.image, 
      provider: 'google_gemini', 
      modelUsed: result.modelUsed 
    };
  } else {
    throw new Error(result.text || "Gemini returned text only");
  }
};

export function buildFinalPrompt(base: string, neg: string): string {
  const maxLen = 4000;
  const compact = (text: string) => (text || '').replace(/\r/g, '').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
  if (!neg) return compact(base).slice(0, maxLen);
  return compact(`${base}\n\nNEGATIVE PROMPT:\n${neg}`).slice(0, maxLen);
}
