const MAX_IMAGE_SIZE_BYTES = 3 * 1024 * 1024; // 3 MB
const MAX_DIMENSION = 2048;
const WEBP_QUALITY = 0.82;

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

/**
 * Optimize an image for upload: resize to 2048px max dimension and convert to WebP.
 * Always runs on compressible image types. Returns the original file for non-images or on failure.
 */
export async function optimizeImageForUpload(file: File): Promise<File> {
  const compressibleTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!compressibleTypes.includes(file.type)) return file;

  try {
    const img = await loadImage(file);

    // Calculate new dimensions (cap at MAX_DIMENSION)
    let width = img.width;
    let height = img.height;
    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      if (width > height) {
        height = Math.round(height * (MAX_DIMENSION / width));
        width = MAX_DIMENSION;
      } else {
        width = Math.round(width * (MAX_DIMENSION / height));
        height = MAX_DIMENSION;
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;

    ctx.drawImage(img, 0, 0, width, height);

    // Try WebP first
    let blob = await canvasToBlob(canvas, 'image/webp', WEBP_QUALITY);
    let outputType = 'image/webp';
    let ext = '.webp';

    // Fallback to JPEG if WebP not supported
    if (!blob || blob.size === 0) {
      blob = await canvasToBlob(canvas, 'image/jpeg', 0.85);
      outputType = 'image/jpeg';
      ext = '.jpg';
    }

    if (!blob) return file;

    // Only use optimized version if it's actually smaller
    if (blob.size >= file.size && width === img.width && height === img.height) {
      return file;
    }

    const newName = file.name.replace(/\.[^.]+$/, '') + ext;
    return new File([blob], newName, { type: outputType });
  } catch {
    return file;
  }
}

const THUMBNAIL_MAX_WIDTH = 400;
const THUMBNAIL_QUALITY = 0.75;

/**
 * Generate a 400px-wide JPEG thumbnail from an image File.
 * Returns null for non-image files or on failure.
 */
export async function generateThumbnail(file: File): Promise<File | null> {
  if (!file.type.startsWith('image/')) return null;

  try {
    const img = await loadImage(file);

    // Skip if already smaller than thumbnail size
    if (img.width <= THUMBNAIL_MAX_WIDTH) return null;

    const scale = THUMBNAIL_MAX_WIDTH / img.width;
    const thumbWidth = THUMBNAIL_MAX_WIDTH;
    const thumbHeight = Math.round(img.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = thumbWidth;
    canvas.height = thumbHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(img, 0, 0, thumbWidth, thumbHeight);

    const blob = await canvasToBlob(canvas, 'image/jpeg', THUMBNAIL_QUALITY);
    if (!blob) return null;

    const thumbName = file.name.replace(/\.[^.]+$/, '') + '_thumb.jpg';
    return new File([blob], thumbName, { type: 'image/jpeg' });
  } catch {
    return null;
  }
}

/**
 * Derive the thumbnail storage path from the original path.
 * e.g. "userId/abc123.jpg" → "userId/abc123_thumb.jpg"
 */
export function getThumbnailPath(originalPath: string): string {
  return originalPath.replace(/\.[^.]+$/, '_thumb.jpg');
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
