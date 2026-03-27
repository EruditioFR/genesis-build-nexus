const MAX_IMAGE_SIZE_BYTES = 3 * 1024 * 1024; // 3 MB

/**
 * Compress an image file to fit under the max size (3 MB).
 * Uses Canvas API with iterative quality reduction.
 * Returns the original file if already small enough or if not a compressible image.
 */
export async function compressImageIfNeeded(file: File): Promise<File> {
  // Only compress JPEG, PNG, WEBP
  const compressibleTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!compressibleTypes.includes(file.type) || file.size <= MAX_IMAGE_SIZE_BYTES) {
    return file;
  }

  const img = await loadImage(file);
  
  // Calculate scale factor based on how much we need to reduce
  const ratio = MAX_IMAGE_SIZE_BYTES / file.size;
  // Scale dimensions if file is very large (>2x the limit)
  const scaleFactor = ratio < 0.5 ? Math.sqrt(ratio) * 1.2 : 1;
  
  const targetWidth = Math.round(img.width * Math.min(scaleFactor, 1));
  const targetHeight = Math.round(img.height * Math.min(scaleFactor, 1));

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;

  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  // Output as JPEG for best compression (unless it's a PNG with transparency needs)
  const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';

  // Iteratively reduce quality until under limit
  let quality = outputType === 'image/jpeg' ? 0.85 : undefined;
  let blob: Blob | null = null;

  for (let attempt = 0; attempt < 5; attempt++) {
    blob = await canvasToBlob(canvas, outputType, quality);
    if (!blob) return file;
    
    if (blob.size <= MAX_IMAGE_SIZE_BYTES) break;

    // Reduce quality for JPEG, or scale down for PNG
    if (outputType === 'image/jpeg' && quality) {
      quality -= 0.15;
      if (quality < 0.3) quality = 0.3;
    } else {
      // For PNG, scale down further
      const newScale = 0.8;
      canvas.width = Math.round(canvas.width * newScale);
      canvas.height = Math.round(canvas.height * newScale);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
  }

  if (!blob || blob.size > MAX_IMAGE_SIZE_BYTES) {
    // Last resort: force JPEG at low quality
    blob = await canvasToBlob(canvas, 'image/jpeg', 0.3);
    if (!blob || blob.size > MAX_IMAGE_SIZE_BYTES) return file;
  }

  const ext = outputType === 'image/png' ? '.png' : '.jpg';
  const newName = file.name.replace(/\.[^.]+$/, '') + '_compressed' + ext;
  
  return new File([blob], newName, { type: outputType });
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve(img);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob | null> {
  return new Promise(resolve => {
    canvas.toBlob(resolve, type, quality);
  });
}
