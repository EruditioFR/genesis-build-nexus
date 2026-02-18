import { useEffect, useRef } from 'react';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';

declare global {
  interface Window {
    adsbygoogle: Array<Record<string, unknown>>;
  }
}

interface AdBannerProps {
  className?: string;
}

const AdBanner = ({ className = '' }: AdBannerProps) => {
  const { limits } = useFeatureAccess();
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (!limits.hasAds || pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // AdSense not loaded or blocked
    }
  }, [limits.hasAds]);

  // Don't render anything for paying users
  if (!limits.hasAds) return null;

  return (
    <div className={`w-full flex justify-center ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-4098943542122113"
        data-ad-slot="5792686335"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdBanner;
