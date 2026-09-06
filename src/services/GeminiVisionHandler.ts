import { GoogleGenAI, Type } from "@google/genai";

export interface GeminiAnalysisResult {
  global_context: {
    scene_description: string;
    color_palette: { dominant_hex_estimates: string[] };
  };
  objects: Array<{ id: string; label: string; pose_orientation: string; box_2d: [number, number, number, number] }>;
}

const DEFAULT_GEMINI_KEY = 'AIzaSyCUvwDsFotH6xez4SqxfkKn27A1HJYunOo';

export async function analyzeImage(base64Image: string, mimeType: string, apiKeyOverride?: string, retries = 3, delay = 1000): Promise<GeminiAnalysisResult> {
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const apiKey = apiKeyOverride || (typeof process !== 'undefined' ? (process.env as any).GEMINI_API_KEY : '') || (import.meta as any).env?.VITE_GEMINI_API_KEY || (import.meta as any).env?.VITE_API_KEY || DEFAULT_GEMINI_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key not found.");
  }
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); 

  try {
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: {
        parts: [
          {
            inlineData: { 
              data: base64Image.includes(",") ? base64Image.split(",")[1] : base64Image, 
              mimeType 
            },
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
            }`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            global_context: {
              type: Type.OBJECT,
              properties: {
                scene_description: { type: Type.STRING },
                color_palette: {
                  type: Type.OBJECT,
                  properties: {
                    dominant_hex_estimates: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                  },
                },
              },
            },
            objects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  label: { type: Type.STRING },
                  pose_orientation: { type: Type.STRING },
                  box_2d: {
                    type: Type.ARRAY,
                    items: { type: Type.NUMBER },
                  },
                },
              },
            },
          },
        },
      },
    });

    clearTimeout(timeoutId);
    return JSON.parse(response.text!) as GeminiAnalysisResult;
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    let errMsg = err instanceof Error ? err.message : String(err);
    if (typeof err === 'object' && err !== null && 'error' in err) {
      const gErr = err as { error?: { message?: string } };
      if (gErr.error?.message) {
        errMsg = `${errMsg} | ${gErr.error.message}`;
      }
    }
    
    if ((errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('Rpc failed due to xhr error') || errMsg.includes('ProxyUnaryCall')) && retries > 0) {
      console.warn(`[GeminiVision] Analysis error. Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return analyzeImage(base64Image, mimeType, apiKeyOverride, retries - 1, delay * 2);
    }
    throw err;
  }
}
