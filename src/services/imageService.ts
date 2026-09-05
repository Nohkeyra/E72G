/* eslint-disable @typescript-eslint/no-explicit-any */
import { resolveModelRoute } from './modelRegistry';
import { callGemini } from './geminiService';
import { cropImage } from './imageUtils';

export const generateImage = async (params: any, signal?: AbortSignal) => {
  const { modelId, prompt, base64Image, negativePrompt, preset, apiKeyOverride } = params;
  
  // 1. Model Routing
  const registryEntry = resolveModelRoute(modelId);
  const actualModelId = registryEntry?.modelId || modelId;

  // 2. Prepare reference image if needed
  let finalBase64 = base64Image;
  let finalMimeType = params.mimeType;

  if (!finalBase64 && (preset?.sourceImagePath || preset?.referenceImagePath || preset?.previewImagePath)) {
    try {
      if (preset.cropBox && preset.sourceImagePath) {
        // Frontend Image Processing Engine: crop directly via Canvas
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
          const prepRes = await fetch("/api/prepare-reference", {
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
        }
      } else {
        const imgPath = preset.referenceImagePath || preset.previewImagePath;
        if (imgPath) {
          // 1. First try client-side fetch (works in Android APK and Web directly)
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

          // 2. Fallback to API if client-side didn't resolve base64
          if (!finalBase64) {
            const prepRes = await fetch("/api/prepare-reference", {
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
          }
        }
      }
    } catch (e) {
      console.warn("Failed to prepare reference image:", e);
    }
  } else if (finalBase64 && preset?.cropBox) {
      // If user provided a base64 image and a crop box is selected somehow
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

  // 3. Synthesis Call
  const result = await callGemini({
    model: actualModelId,
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
