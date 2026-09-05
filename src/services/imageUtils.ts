export interface CropCoordinates {
  x: number;
  y: number;
  width: number; // Width of the crop area
  height: number; // Height of the crop area
  unit?: 'px' | '%'; // Whether the coordinates are in pixels or percentages
}

export function compressImage(dataUrl: string, quality: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Could not get canvas context'));
      }
      ctx.drawImage(img, 0, 0);
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };
    img.onerror = (err) => {
      reject(err);
    };
    img.src = dataUrl;
  });
}

export function resizeImage(dataUrl: string, maxSize: number = 768): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { alpha: false }); // Optimize for opaque images
      if (!ctx) return reject(new Error('No context'));
      
      // Fast smoothing
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, width, height);
      
      // Aggressive compression for latency reduction (0.6 instead of 0.8)
      resolve(canvas.toDataURL('image/jpeg', 0.6));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

/**
 * Slices an image based on crop coordinates and compiles it into Base64 format.
 * Coordinates can be either percentages or exact pixels.
 */
export function cropImage(
  dataUrl: string,
  cropParams: CropCoordinates,
  outputFormat: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg',
  outputQuality: number = 0.9
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      let sx, sy, sWidth, sHeight;

      if (cropParams.unit === '%') {
        const xPercent = Math.max(0, Math.min(100, cropParams.x)) / 100;
        const yPercent = Math.max(0, Math.min(100, cropParams.y)) / 100;
        const widthPercent = Math.max(0, Math.min(100 - cropParams.x, cropParams.width)) / 100;
        const heightPercent = Math.max(0, Math.min(100 - cropParams.y, cropParams.height)) / 100;

        sx = img.width * xPercent;
        sy = img.height * yPercent;
        sWidth = img.width * widthPercent;
        sHeight = img.height * heightPercent;
      } else {
        // Defaults to 'px'
        sx = Math.max(0, cropParams.x);
        sy = Math.max(0, cropParams.y);
        sWidth = Math.min(img.width - sx, cropParams.width);
        sHeight = Math.min(img.height - sy, cropParams.height);
      }

      // Ensure cropped area is valid
      if (sWidth <= 0 || sHeight <= 0) {
        return reject(new Error('Invalid crop dimensions resulting in zero width or height.'));
      }

      const canvas = document.createElement('canvas');
      canvas.width = sWidth;
      canvas.height = sHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Could not get canvas context for cropping.'));
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      ctx.drawImage(
        img,
        sx,
        sy,
        sWidth,
        sHeight,
        0, // dx
        0, // dy
        sWidth, // dWidth
        sHeight // dHeight
      );

      const croppedBase64 = canvas.toDataURL(outputFormat, outputQuality);
      resolve(croppedBase64);
    };
    img.onerror = (err) => {
      reject(new Error('Failed to load image for cropping: ' + String(err)));
    };
    img.src = dataUrl;
  });
}
