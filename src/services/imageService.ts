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

  // 2. Reference image presence check (Excludes previewImagePath which is a UI thumbnail card asset)
  const hasReference = Boolean(
    base64Image ||
    preset?.sourceImagePath ||
    preset?.referenceImagePath
  );

  // Capability gate: never send a reference-image request to a model that cannot condition on it.
  // A text description is not equivalent to an image reference, so fail loudly instead of degrading.
  if (hasReference && registryEntry.supportsReferenceImages === false) {
    throw new Error(
      `${registryEntry.label} does not support reference-image generation, so your uploaded image cannot be used with it. Select a model that supports reference images.`
    );
  }

  // 3. Cloudflare Execution Path
  if (isCloudflare) {
    const finalPrompt = buildFinalPrompt(prompt, negativePrompt);

    if (hasReference) {
      const { finalBase64, finalMimeType } = await prepareReferenceImageData(params, signal);
      if (!finalBase64) {
        throw new Error("Failed to resolve reference image for generation.");
      }

      const cfRes = await fetch(apiUrl("/api/cloudflare/edit-image"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: finalPrompt,
          base64Image: finalBase64,
          mimeType: finalMimeType,
          aspectRatio: preset?.aspectRatio
        }),
        signal
      });

      if (!cfRes.ok) {
        const errData = await cfRes.json().catch(() => ({}));
        throw new Error(
          errData.error || `Cloudflare image editing failed with HTTP status ${cfRes.status}`
        );
      }

      const cfData = await cfRes.json();
      if (!cfData.image) {
        throw new Error("Cloudflare did not return image data");
      }

      return {
        image: cfData.image,
        provider: 'cloudflare',
        modelUsed: cfData.modelUsed || '@cf/black-forest-labs/flux-2-klein-4b'
      };
    } else {
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
        modelUsed: cfData.modelUsed || '@cf/black-forest-labs/flux-1-schnell'
      };
    }
  }

  // 4. Google Gemini Execution Path
  const { finalBase64, finalMimeType } = await prepareReferenceImageData(params, signal);
  if (hasReference && !finalBase64) {
    throw new Error("Failed to resolve reference image for generation.");
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

export async function prepareReferenceImageData(params: any, signal?: AbortSignal) {
  const { base64Image, mimeType, preset } = params;
  let finalBase64 = base64Image;
  let finalMimeType = mimeType;

  if (!finalBase64 && (preset?.sourceImagePath || preset?.referenceImagePath)) {
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
                referenceImagePath: preset.referenceImagePath,
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
        const imgPath = preset.referenceImagePath || preset.sourceImagePath;
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

  return { finalBase64, finalMimeType };
}
