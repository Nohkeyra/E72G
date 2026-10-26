import test from "node:test";
import assert from "node:assert/strict";
import { VectorModule } from "../src/modules/vector/VectorStrategy";
import { GenerationContext } from "../src/types/generation";

test("VectorStrategy: constructPrompt incorporates vectorAnalysis when present", () => {
  const context: GenerationContext = {
    prompt: "A cool logo",
    preset: {
      name: "Test Preset",
      basePrompt: "A high quality vector illustration of [Subject].",
      aspectRatio: "1:1",
      negativePrompt: "blur, noise"
    },
    base64Image: "data:image/png;base64,dummy",
    vectorAnalysis: {
      subjectName: "Bionic Bulldog",
      description: "standing, spiked collar",
      silhouette: "broad-shouldered, muscular",
      distinctiveDetails: "spiked collar, metallic texture",
      colors: "crimson, chrome",
      shapes: "angular",
      vectorAdvice: "flat solid fills"
    }
  };

  const prompt = VectorModule.constructPrompt(context);
  assert.ok(prompt.includes("Bionic Bulldog"));
  assert.ok(prompt.includes("standing, spiked collar"));
  assert.ok(prompt.includes("Vector Translation Guide: flat solid fills"));
});

test("VectorStrategy: constructNegativePrompt includes vector-specific negatives", () => {
  const context: GenerationContext = {
    prompt: "Test",
    preset: {
      name: "Test",
      basePrompt: "Test",
      aspectRatio: "1:1",
      negativePrompt: "bad"
    }
  };

  const negPrompt = VectorModule.constructNegativePrompt!(context);
  assert.ok(negPrompt.includes("bad"));
  assert.ok(negPrompt.includes("photorealistic camera capture"));
  assert.ok(negPrompt.includes("pixelation"));
});
