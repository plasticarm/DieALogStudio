/**
 * Downscales a base64 image to a maximum width/height while maintaining aspect ratio.
 * Useful for saving storage space in localStorage.
 */
export const downscaleImage = (base64: string, maxDimension: number = 800, quality: number = 0.8): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!base64 || !base64.startsWith('data:image')) {
      return reject(new Error('Invalid image data URL. Not an image file.'));
    }

    const img = new Image();
    if (!base64.startsWith('data:') && !base64.startsWith('blob:')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => {
      if (img.naturalWidth === 0 || img.naturalHeight === 0) {
        return reject(new Error('Image loaded but has zero dimensions. It might be corrupted.'));
      }

      let width = img.naturalWidth;
      let height = img.naturalHeight;

      if (width > height) {
        if (width > maxDimension) {
          height *= maxDimension / width;
          width = maxDimension;
        }
      } else {
        if (height > maxDimension) {
          width *= maxDimension / height;
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Could not get canvas context'));
      }

      ctx.drawImage(img, 0, 0, width, height);
      const resultDataUrl = canvas.toDataURL('image/jpeg', quality);
      
      if (!resultDataUrl || resultDataUrl === 'data:,') {
        return reject(new Error('Failed to generate data URL from canvas.'));
      }
      
      resolve(resultDataUrl);
    };
    img.onerror = () => reject(new Error('The source image cannot be decoded. Please use a standard image format (PNG, JPG).'));
    img.src = base64;
  });
};
