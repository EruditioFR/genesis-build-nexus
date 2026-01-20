import { useState, useEffect, useRef } from 'react';
import { Play } from 'lucide-react';
import { getSignedUrl } from '@/lib/signedUrlCache';

interface VideoPreviewCardProps {
  videoUrl: string;
  thumbnailUrl?: string | null;
  className?: string;
}

const VideoPreviewCard = ({ videoUrl, thumbnailUrl, className = '' }: VideoPreviewCardProps) => {
  const [signedVideoUrl, setSignedVideoUrl] = useState<string | null>(null);
  const [signedThumbnailUrl, setSignedThumbnailUrl] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const loadUrls = async () => {
      setLoading(true);
      
      const [videoSigned, thumbnailSigned] = await Promise.all([
        getSignedUrl('capsule-medias', videoUrl),
        thumbnailUrl ? getSignedUrl('capsule-medias', thumbnailUrl) : Promise.resolve(null),
      ]);
      
      setSignedVideoUrl(videoSigned);
      setSignedThumbnailUrl(thumbnailSigned);
      setLoading(false);
    };

    loadUrls();
  }, [videoUrl, thumbnailUrl]);

  useEffect(() => {
    if (!videoRef.current || !signedVideoUrl) return;
    
    if (isHovering) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isHovering, signedVideoUrl]);

  if (loading) {
    return <div className={`bg-muted animate-pulse ${className}`} />;
  }

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Video element - plays on hover */}
      {signedVideoUrl && (
        <video
          ref={videoRef}
          src={signedVideoUrl}
          className={`w-full h-full object-cover transition-opacity duration-300 ${isHovering ? 'opacity-100' : 'opacity-0'}`}
          muted
          playsInline
          loop
          preload="metadata"
        />
      )}
      
      {/* Thumbnail overlay - visible when not hovering */}
      {signedThumbnailUrl && (
        <img
          src={signedThumbnailUrl}
          alt="Video thumbnail"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isHovering ? 'opacity-0' : 'opacity-100'}`}
        />
      )}
      
      {/* Fallback gradient when no thumbnail */}
      {!signedThumbnailUrl && (
        <div className={`absolute inset-0 bg-gradient-to-br from-purple-500/20 to-purple-700/30 transition-opacity duration-300 ${isHovering ? 'opacity-0' : 'opacity-100'}`} />
      )}
      
      {/* Play button overlay - visible when not hovering */}
      <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isHovering ? 'opacity-0' : 'opacity-100'}`}>
        <div className="w-14 h-14 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <Play className="w-6 h-6 text-white fill-white ml-1" />
        </div>
      </div>
    </div>
  );
};

export default VideoPreviewCard;
