import { useState, useEffect } from 'react';
import { getSignedUrl } from '@/lib/signedUrlCache';
import { getThumbnailPath } from '@/lib/imageCompression';

interface CapsuleThumbnailProps {
  thumbnailUrl: string | null | undefined;
  fallbackIcon: React.ReactNode;
  className?: string;
  /** When true, try to load _thumb variant first (for list views) */
  preferThumbnail?: boolean;
}

const CapsuleThumbnail = ({ thumbnailUrl, fallbackIcon, className = '', preferThumbnail = true }: CapsuleThumbnailProps) => {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(!!thumbnailUrl);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadThumbnail = async () => {
      if (!thumbnailUrl) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(false);

      try {
        // Try thumbnail variant first for images (smaller file, faster loading)
        if (preferThumbnail && isImagePath(thumbnailUrl)) {
          const thumbPath = getThumbnailPath(thumbnailUrl);
          const thumbUrl = await getSignedUrl('capsule-medias', thumbPath);
          if (thumbUrl) {
            // Verify the thumbnail actually exists with a HEAD check
            const exists = await checkImageExists(thumbUrl);
            if (exists) {
              setSignedUrl(thumbUrl);
              return;
            }
          }
        }

        // Fallback to original
        const url = await getSignedUrl('capsule-medias', thumbnailUrl);
        if (url) {
          setSignedUrl(url);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Error loading thumbnail:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadThumbnail();
  }, [thumbnailUrl, preferThumbnail]);

  if (!thumbnailUrl || error) {
    return <>{fallbackIcon}</>;
  }

  if (loading) {
    return (
      <div className={`bg-muted animate-pulse ${className}`} />
    );
  }

  return (
    <div className="w-full h-full overflow-hidden">
      <img
        src={signedUrl || ''}
        alt="Thumbnail"
        className={`w-full h-full object-cover object-center ${className}`}
        onError={() => setError(true)}
      />
    </div>
  );
};

/** Check if a path looks like an image file */
function isImagePath(path: string): boolean {
  return /\.(jpe?g|png|webp|gif)$/i.test(path);
}

/** Quick check if an image URL is loadable */
function checkImageExists(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    // Timeout after 2s to avoid blocking
    const timeout = setTimeout(() => resolve(false), 2000);
    img.onload = () => { clearTimeout(timeout); resolve(true); };
    img.onerror = () => { clearTimeout(timeout); resolve(false); };
    img.src = url;
  });
}

export default CapsuleThumbnail;
