import { referenceImageManifest } from './src/modules/typography/referenceImageManifest';

const images = new Map<string, string[]>();

Object.values(referenceImageManifest).forEach(category => {
  category.forEach(preset => {
    if (!images.has(preset.previewImagePath)) {
      images.set(preset.previewImagePath, []);
    }
    images.get(preset.previewImagePath)!.push(preset.id);
  });
});

images.forEach((ids, path) => {
  if (ids.length > 1) {
    console.log(`Duplicate image: ${path} used by ${ids.join(', ')}`);
  }
});
