import { useState, useEffect } from 'react';
import { getSignedUrl } from '@/lib/signedUrlCache';
import { Image as ImageIcon } from 'lucide-react';

interface CapsuleThumbnailProps {
  thumbnailUrl: string | null | undefined;
  fallbackIcon: React.ReactNode;
  className?: string;
}

const CapsuleThumbnail = ({ thumbnailUrl, fallbackIcon, className = '' }: CapsuleThumbnailProps) => {
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
  }, [thumbnailUrl]);

  if (!thumbnailUrl || error) {
    return <>{fallbackIcon}</>;
  }

  if (loading) {
    return (
      <div className={`bg-muted animate-pulse ${className}`} />
    );
  }

  return (
    <div className={`overflow-hidden ${className}`}>
      <img
        src={signedUrl || ''}
        alt="Thumbnail"
        className="w-full h-full object-cover"
        onError={() => setError(true)}
      />
    </div>
  );
};

export default CapsuleThumbnail;
