import { useState, useEffect } from 'react';
import { getSignedUrl } from '@/lib/signedUrlCache';

/**
 * Hook to resolve a family photo path to a signed URL.
 * Handles both legacy public URLs and new relative paths.
 */
export function useFamilyPhotoUrl(photoPath: string | null | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!photoPath) {
      setUrl(null);
      return;
    }

    // Legacy: if it's already a full URL (from when bucket was public), use it as-is
    // but try to extract the relative path for signed URL
    let relativePath = photoPath;
    const publicUrlMarker = '/object/public/family-photos/';
    const idx = photoPath.indexOf(publicUrlMarker);
    if (idx !== -1) {
      relativePath = photoPath.substring(idx + publicUrlMarker.length);
    }

    // If it starts with http but doesn't contain our marker, it might be external
    if (photoPath.startsWith('http') && idx === -1) {
      setUrl(photoPath);
      return;
    }

    let cancelled = false;
    getSignedUrl('family-photos', relativePath).then((signedUrl) => {
      if (!cancelled) {
        setUrl(signedUrl);
      }
    });

    return () => { cancelled = true; };
  }, [photoPath]);

  return url;
}
