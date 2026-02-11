import { Clock, Image, Video, FileText, Music, Layers, Play, Quote } from 'lucide-react';
import CapsuleThumbnail from '@/components/capsule/CapsuleThumbnail';
import AudioWaveBackground from '@/components/capsule/AudioWaveBackground';
import { cn } from '@/lib/utils';

export type CapsuleCardType = 'photo' | 'video' | 'text' | 'audio' | 'mixed';

export interface CapsuleVisualData {
  type: CapsuleCardType;
  thumbnail?: string;
  content?: string;
  firstMediaUrl?: string;
  firstVideoUrl?: string;
  youtubeId?: string;
}

export const getTypeIcon = (type: CapsuleCardType) => {
  switch (type) {
    case 'photo': return Image;
    case 'video': return Video;
    case 'audio': return Music;
    case 'mixed': return Layers;
    case 'text': return FileText;
  }
};

export const getTypeStyles = (type: CapsuleCardType) => {
  switch (type) {
    case 'photo': return { bg: 'bg-sky-500', text: 'text-white' };
    case 'video': return { bg: 'bg-violet-500', text: 'text-white' };
    case 'audio': return { bg: 'bg-orange-500', text: 'text-white' };
    case 'mixed': return { bg: 'bg-emerald-500', text: 'text-white' };
    case 'text': return { bg: 'bg-amber-500', text: 'text-white' };
  }
};

// --- Visual thumbnail component ---

export const CapsuleVisual = ({ capsule, className, iconSize = 'md' }: { capsule: CapsuleVisualData; className?: string; iconSize?: 'sm' | 'md' }) => {
  const Icon = getTypeIcon(capsule.type);
  const iconClasses = iconSize === 'sm' ? 'w-10 h-10' : 'w-16 h-16';
  const innerIconClasses = iconSize === 'sm' ? 'w-5 h-5' : 'w-8 h-8';

  if (capsule.thumbnail) {
    return (
      <CapsuleThumbnail
        thumbnailUrl={capsule.thumbnail}
        fallbackIcon={null}
        className={cn("w-full h-full object-cover transition-transform duration-700 group-hover:scale-105", className)}
      />
    );
  }
  if (capsule.youtubeId) {
    return (
      <div className="relative w-full h-full">
        <img
          src={`https://img.youtube.com/vi/${capsule.youtubeId}/hqdefault.jpg`}
          alt="YouTube"
          className={cn("w-full h-full object-cover transition-transform duration-700 group-hover:scale-105", className)}
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className={cn("rounded-full bg-red-600 flex items-center justify-center shadow-2xl", iconClasses)}>
            <Play className={cn("text-white fill-white ml-0.5", innerIconClasses)} />
          </div>
        </div>
      </div>
    );
  }
  if (capsule.firstVideoUrl) {
    return (
      <div className="relative w-full h-full">
        <video
          src={capsule.firstVideoUrl}
          className={cn("w-full h-full object-cover transition-transform duration-700 group-hover:scale-105", className)}
          muted
          preload="metadata"
          onMouseEnter={(e) => { e.currentTarget.currentTime = 0; e.currentTarget.play().catch(() => {}); }}
          onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:opacity-0 transition-opacity duration-300">
          <div className={cn("rounded-full bg-foreground/80 backdrop-blur-sm flex items-center justify-center shadow-2xl", iconClasses)}>
            <Play className={cn("text-background fill-background ml-0.5", innerIconClasses)} />
          </div>
        </div>
      </div>
    );
  }
  if (capsule.firstMediaUrl) {
    return (
      <CapsuleThumbnail
        thumbnailUrl={capsule.firstMediaUrl}
        fallbackIcon={null}
        className={cn("w-full h-full object-cover transition-transform duration-700 group-hover:scale-105", className)}
      />
    );
  }
  if (capsule.type === 'audio') {
    return (
      <div className="w-full h-full relative bg-gradient-to-br from-orange-100 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/20">
        <AudioWaveBackground animated={false} barCount={40} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={cn("rounded-full bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30", iconClasses)}>
            <Music className={cn("text-white", innerIconClasses)} />
          </div>
        </div>
      </div>
    );
  }
  if (capsule.type === 'text' && capsule.content) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-900/30 dark:via-orange-900/20 dark:to-yellow-900/20 p-6">
        <div className="relative">
          <Quote className="absolute -top-2 -left-2 w-8 h-8 text-amber-300 dark:text-amber-600" />
          <p className="text-base text-foreground/80 line-clamp-4 text-center italic leading-relaxed max-w-[240px]">
            {capsule.content.slice(0, 120)}{capsule.content.length > 120 ? '…' : ''}
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-muted to-muted/50 gap-3">
      <div className={cn("rounded-full bg-muted-foreground/10 flex items-center justify-center", iconClasses)}>
        <Icon className={cn("text-muted-foreground/40", innerIconClasses)} />
      </div>
    </div>
  );
};

// --- Type badge ---

export const TypeBadge = ({ type, t }: { type: CapsuleCardType; t: (key: string) => string }) => {
  const Icon = getTypeIcon(type);
  const styles = getTypeStyles(type);
  const getTypeLabel = (type: CapsuleCardType) => {
    switch (type) {
      case 'photo': return t('types.photo');
      case 'video': return t('types.video');
      case 'audio': return t('types.audio');
      case 'mixed': return t('types.mixed');
      case 'text': return t('types.text');
    }
  };
  return (
    <div className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-sm", styles.bg, styles.text)}>
      <Icon className="w-3.5 h-3.5" />
      <span className="text-xs font-semibold tracking-wide uppercase">{getTypeLabel(type)}</span>
    </div>
  );
};
