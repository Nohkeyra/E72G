import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

/**
 * Hook to calculate average brightness of an image from a URL
 * Calculates brightness on a scale of 0 to 1
 */
export function useImageBrightness(imageUrl: string | string[] | null) {
  const { imageBrightness, setImageBrightness } = useAppStore();

  useEffect(() => {
    if (!imageUrl || typeof imageUrl !== 'string') {
      // Default to neutral brightness if no image or multiple images (not supported yet)
      if (imageBrightness !== 0.5) {
        setImageBrightness(0.5);
      }
      return;
    }

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Small sample size for performance
      canvas.width = 40;
      canvas.height = 40;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      let r, g, b, avg;
      let colorSum = 0;

      for (let x = 0, len = data.length; x < len; x += 4) {
        r = data[x];
        g = data[x + 1];
        b = data[x + 2];

        // Perceptive brightness (HSP)
        // http://alienryderflex.com/hsp.html
        avg = Math.sqrt(
          0.299 * (r * r) +
          0.587 * (g * g) +
          0.114 * (b * b)
        );
        colorSum += avg;
      }

      const brightness = colorSum / (canvas.width * canvas.height) / 255;
      if (Math.abs(imageBrightness - brightness) > 0.02) {
        setImageBrightness(brightness);
      }
    };

    img.onerror = () => {
      console.error('Failed to load image for brightness calculation');
      if (imageBrightness !== 0.5) {
        setImageBrightness(0.5);
      }
    };
  }, [imageUrl, imageBrightness, setImageBrightness]);
}
