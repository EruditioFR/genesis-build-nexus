import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Clock, Image, Video, FileText, Plus, ArrowRight, Music, Layers, Play, Quote, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import CapsuleThumbnail from '@/components/capsule/CapsuleThumbnail';
import CategoryBadge from '@/components/capsule/CategoryBadge';
import AudioWaveBackground from '@/components/capsule/AudioWaveBackground';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import type { Category } from '@/hooks/useCategories';

interface Capsule {
  id: string;
  title: string;
  type: 'photo' | 'video' | 'text' | 'audio' | 'mixed';
  date: string;
  thumbnail?: string;
  content?: string;
  firstMediaUrl?: string;
  firstVideoUrl?: string;
  youtubeId?: string;
}

interface RecentCapsulesProps {
  capsules: Capsule[];
}

interface CapsuleCategoryData {
  capsule_id: string;
  is_primary: boolean;
  category: Category;
}

// --- Shared helpers ---

const getTypeIcon = (type: Capsule['type']) => {
  switch (type) {
    case 'photo': return Image;
    case 'video': return Video;
    case 'audio': return Music;
    case 'mixed': return Layers;
    case 'text': return FileText;
  }
};

const getTypeStyles = (type: Capsule['type']) => {
  switch (type) {
    case 'photo': return { bg: 'bg-sky-500', text: 'text-white' };
    case 'video': return { bg: 'bg-violet-500', text: 'text-white' };
    case 'audio': return { bg: 'bg-orange-500', text: 'text-white' };
    case 'mixed': return { bg: 'bg-emerald-500', text: 'text-white' };
    case 'text': return { bg: 'bg-amber-500', text: 'text-white' };
  }
};

// --- Visual thumbnail component ---

const CapsuleVisual = ({ capsule, className, iconSize = 'md' }: { capsule: Capsule; className?: string; iconSize?: 'sm' | 'md' }) => {
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

const TypeBadge = ({ type, t }: { type: Capsule['type']; t: (key: string) => string }) => {
  const Icon = getTypeIcon(type);
  const styles = getTypeStyles(type);
  const getTypeLabel = (type: Capsule['type']) => {
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

// --- Featured (hero) card ---

const FeaturedCard = ({ capsule, category, t }: { capsule: Capsule; category?: Category; t: (key: string) => string }) => (
  <Link to={`/capsules/${capsule.id}`} className="block group">
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative rounded-2xl border-2 border-border bg-card overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-foreground/5 hover:-translate-y-1 hover:border-foreground/10"
    >
      {/* Visual - large hero area */}
      <div className="relative aspect-[16/9] sm:aspect-[2/1] overflow-hidden">
        <CapsuleVisual capsule={capsule} />
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        {/* Type badge - top left */}
        <div className="absolute top-4 left-4">
          <TypeBadge type={capsule.type} t={t} />
        </div>

        {/* Content overlay - bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
          <h4 className="font-bold text-white text-xl sm:text-2xl line-clamp-2 leading-snug mb-2 drop-shadow-lg">
            {capsule.title}
          </h4>
          {capsule.content && capsule.type === 'text' && (
            <p className="text-white/80 text-sm sm:text-base line-clamp-2 leading-relaxed mb-3 max-w-lg">
              {capsule.content.slice(0, 150)}{capsule.content.length > 150 ? '…' : ''}
            </p>
          )}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-white/70">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">{capsule.date}</span>
            </div>
            {category && (
              <CategoryBadge category={category} size="sm" showIcon />
            )}
          </div>
        </div>
      </div>
    </motion.article>
  </Link>
);

// --- Compact card for the grid ---

const CompactCard = ({ capsule, category, index, t }: { capsule: Capsule; category?: Category; index: number; t: (key: string) => string }) => {
  const Icon = getTypeIcon(capsule.type);
  const styles = getTypeStyles(capsule.type);

  return (
    <Link to={`/capsules/${capsule.id}`} className="block group">
      <motion.article
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 + index * 0.07 }}
        className="flex items-center gap-4 p-3 rounded-xl border border-border bg-card hover:shadow-md hover:border-foreground/10 transition-all duration-200 hover:-translate-y-0.5"
      >
        {/* Square thumbnail */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 relative">
          <CapsuleVisual capsule={capsule} iconSize="sm" />
          {/* Mini type indicator */}
          <div className={cn("absolute bottom-1 right-1 w-6 h-6 rounded-full flex items-center justify-center shadow-sm", styles.bg)}>
            <Icon className="w-3 h-3 text-white" />
          </div>
        </div>

        {/* Text content */}
        <div className="flex-1 min-w-0 py-1">
          <h4 className="font-semibold text-foreground text-[15px] sm:text-base line-clamp-2 leading-snug group-hover:text-primary transition-colors mb-1.5">
            {capsule.title}
          </h4>
          <div className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium">{capsule.date}</span>
          </div>
          {category && (
            <CategoryBadge category={category} size="sm" showIcon />
          )}
        </div>
      </motion.article>
    </Link>
  );
};

// --- Main component ---

const RecentCapsules = ({ capsules }: RecentCapsulesProps) => {
  const { t } = useTranslation('dashboard');
  const [capsuleCategories, setCapsuleCategories] = useState<Record<string, Category>>({});

  useEffect(() => {
    const fetchCategories = async () => {
      if (capsules.length === 0) return;

      const capsuleIds = capsules.map(c => c.id);
      const { data } = await supabase
        .from('capsule_categories')
        .select(`
          capsule_id,
          is_primary,
          category:categories(*)
        `)
        .in('capsule_id', capsuleIds)
        .eq('is_primary', true);

      if (data) {
        const categoryMap: Record<string, Category> = {};
        (data as unknown as CapsuleCategoryData[]).forEach((item) => {
          if (item.category) {
            categoryMap[item.capsule_id] = item.category;
          }
        });
        setCapsuleCategories(categoryMap);
      }
    };

    fetchCategories();
  }, [capsules]);

  const featured = capsules[0];
  const rest = capsules.slice(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="relative"
      data-tour="recent-capsules"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5 px-1">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold text-foreground">
            {t('recentCapsules.title')}
          </h3>
          {capsules.length > 0 && (
            <span className="px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground text-sm font-medium">
              {capsules.length}
            </span>
          )}
        </div>
        {capsules.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground hover:text-foreground font-medium"
            asChild
          >
            <Link to="/capsules">
              {t('recentCapsules.viewAll')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        )}
      </div>

      {capsules.length === 0 ? (
        /* Empty state */
        <div className="text-center py-16 px-6 rounded-2xl border-2 border-dashed border-border bg-muted/20">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-5">
            <Clock className="w-10 h-10 text-muted-foreground/50" />
          </div>
          <h4 className="text-lg font-semibold text-foreground mb-2">
            {t('recentCapsules.empty')}
          </h4>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            {t('recentCapsules.emptySubtitle')}
          </p>
          <Button className="gap-2" size="lg" asChild>
            <Link to="/capsules/new">
              <Plus className="w-5 h-5" />
              {t('recentCapsules.createFirst')}
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Featured card - hero layout */}
          <FeaturedCard
            capsule={featured}
            category={capsuleCategories[featured.id]}
            t={t}
          />

          {/* Grid of remaining capsules */}
          {rest.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {rest.map((capsule, index) => (
                <CompactCard
                  key={capsule.id}
                  capsule={capsule}
                  category={capsuleCategories[capsule.id]}
                  index={index}
                  t={t}
                />
              ))}
            </div>
          )}

          {/* CTA - Nouveau souvenir */}
          <Link to="/capsules/new" className="block">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="flex items-center justify-center gap-3 p-4 rounded-xl border-2 border-dashed border-border bg-muted/20 hover:border-primary hover:bg-primary/5 transition-all duration-200 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                <Plus className="w-5 h-5 text-primary" />
              </div>
              <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {t('quickActions.newCapsule')}
              </span>
            </motion.div>
          </Link>
        </div>
      )}
    </motion.div>
  );
};

export default RecentCapsules;
