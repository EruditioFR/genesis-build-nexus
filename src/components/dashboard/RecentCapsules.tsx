import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Clock, Image, Video, FileText, Plus, ArrowRight, Music, Layers, ChevronLeft, ChevronRight, Play, Quote } from 'lucide-react';
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
}

interface RecentCapsulesProps {
  capsules: Capsule[];
}

interface CapsuleCategoryData {
  capsule_id: string;
  is_primary: boolean;
  category: Category;
}

const RecentCapsules = ({ capsules }: RecentCapsulesProps) => {
  const { t } = useTranslation('dashboard');
  const [capsuleCategories, setCapsuleCategories] = useState<Record<string, Category>>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

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

  const checkScrollability = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollability();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollability);
      window.addEventListener('resize', checkScrollability);
      return () => {
        container.removeEventListener('scroll', checkScrollability);
        window.removeEventListener('resize', checkScrollability);
      };
    }
  }, [capsules]);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 300;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const getTypeIcon = (type: Capsule['type']) => {
    switch (type) {
      case 'photo': return Image;
      case 'video': return Video;
      case 'audio': return Music;
      case 'mixed': return Layers;
      case 'text': return FileText;
    }
  };

  const getTypeLabel = (type: Capsule['type']) => {
    switch (type) {
      case 'photo': return t('types.photo');
      case 'video': return t('types.video');
      case 'audio': return t('types.audio');
      case 'mixed': return t('types.mixed');
      case 'text': return t('types.text');
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="relative"
      data-tour="recent-capsules"
    >
      {/* Header - Simplified */}
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
        <div className="flex items-center gap-1">
          {/* Navigation arrows */}
          {capsules.length > 2 && (
            <div className="hidden sm:flex items-center gap-1 mr-2">
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "w-9 h-9 rounded-full border-border/50 transition-all",
                  canScrollLeft ? 'opacity-100 hover:bg-muted' : 'opacity-30 cursor-not-allowed'
                )}
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "w-9 h-9 rounded-full border-border/50 transition-all",
                  canScrollRight ? 'opacity-100 hover:bg-muted' : 'opacity-30 cursor-not-allowed'
                )}
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
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
        </div>
      </div>

      {capsules.length === 0 ? (
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
        <div className="relative -mx-4 sm:mx-0">
          {/* Scroll container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto pb-2 px-4 sm:px-0 scrollbar-hide snap-x snap-mandatory scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {capsules.map((capsule, index) => {
              const Icon = getTypeIcon(capsule.type);
              const typeStyles = getTypeStyles(capsule.type);
              const category = capsuleCategories[capsule.id];

              return (
                <Link 
                  to={`/capsules/${capsule.id}`} 
                  key={capsule.id} 
                  className="flex-shrink-0 snap-start first:ml-0"
                >
                  <motion.article
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.08 }}
                    className="w-[280px] sm:w-[300px] group"
                  >
                    <div className="relative rounded-2xl bg-card border border-border overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-foreground/5 hover:-translate-y-1.5 hover:border-foreground/10">
                      {/* Visual area */}
                      <div className="relative aspect-[4/3] overflow-hidden">
                        {/* Content based on type */}
                        {capsule.thumbnail ? (
                          <CapsuleThumbnail
                            thumbnailUrl={capsule.thumbnail}
                            fallbackIcon={null}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : capsule.firstVideoUrl ? (
                          <div className="relative w-full h-full">
                            <video 
                              src={capsule.firstVideoUrl} 
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              muted
                              preload="metadata"
                              onMouseEnter={(e) => {
                                const video = e.currentTarget;
                                video.currentTime = 0;
                                video.play().catch(() => {});
                              }}
                              onMouseLeave={(e) => {
                                const video = e.currentTarget;
                                video.pause();
                                video.currentTime = 0;
                              }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:opacity-0 transition-opacity duration-300">
                              <div className="w-16 h-16 rounded-full bg-foreground/80 backdrop-blur-sm flex items-center justify-center shadow-2xl">
                                <Play className="w-7 h-7 text-background fill-background ml-1" />
                              </div>
                            </div>
                          </div>
                        ) : capsule.firstMediaUrl ? (
                          <CapsuleThumbnail
                            thumbnailUrl={capsule.firstMediaUrl}
                            fallbackIcon={null}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : capsule.type === 'audio' ? (
                          <div className="w-full h-full relative bg-gradient-to-br from-orange-100 to-amber-50">
                            <AudioWaveBackground animated={false} barCount={40} />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                                <Music className="w-8 h-8 text-white" />
                              </div>
                            </div>
                          </div>
                        ) : capsule.type === 'text' && capsule.content ? (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-6">
                            <div className="relative">
                              <Quote className="absolute -top-2 -left-2 w-8 h-8 text-amber-300" />
                              <p className="text-base text-foreground/80 line-clamp-4 text-center italic leading-relaxed max-w-[200px]">
                                {capsule.content.slice(0, 100)}{capsule.content.length > 100 ? '…' : ''}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-muted to-muted/50 gap-3">
                            <div className="w-16 h-16 rounded-full bg-muted-foreground/10 flex items-center justify-center">
                              <Icon className="w-8 h-8 text-muted-foreground/40" />
                            </div>
                            <span className="text-sm text-muted-foreground/60 font-medium">
                              {t('recentCapsules.noContent')}
                            </span>
                          </div>
                        )}
                        
                        {/* Type badge - top left, pill style */}
                        <div className="absolute top-3 left-3">
                          <div className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-lg",
                            typeStyles.bg, typeStyles.text
                          )}>
                            <Icon className="w-3.5 h-3.5" />
                            <span className="text-xs font-semibold tracking-wide uppercase">
                              {getTypeLabel(capsule.type)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Content section */}
                      <div className="p-4 space-y-3">
                        {/* Date - subtle */}
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="text-xs font-medium">{capsule.date}</span>
                        </div>

                        {/* Title */}
                        <h4 className="font-semibold text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors text-[15px]">
                          {capsule.title}
                        </h4>
                        
                        {/* Category badge */}
                        {category && (
                          <CategoryBadge 
                            category={category} 
                            size="sm" 
                            showIcon={true}
                          />
                        )}
                      </div>
                    </div>
                  </motion.article>
                </Link>
              );
            })}

            {/* Add new card */}
            <Link to="/capsules/new" className="flex-shrink-0 snap-start">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: capsules.length * 0.08 }}
                className="w-[280px] sm:w-[300px] h-full"
              >
                <div className="h-full min-h-[320px] rounded-2xl border-2 border-dashed border-border bg-muted/20 flex flex-col items-center justify-center gap-4 transition-all duration-300 hover:border-primary hover:bg-primary/5 cursor-pointer group">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                    <Plus className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-center">
                    <span className="font-semibold text-foreground group-hover:text-primary transition-colors block">
                      {t('quickActions.newCapsule')}
                    </span>
                    <span className="text-sm text-muted-foreground mt-1 block">
                      {t('quickActions.newCapsuleDesc')}
                    </span>
                  </div>
                </div>
              </motion.div>
            </Link>
          </div>

          {/* Mobile scroll indicator dots */}
          {capsules.length > 1 && (
            <div className="flex justify-center gap-1.5 mt-4 sm:hidden">
              {[...Array(Math.min(5, capsules.length + 1))].map((_, index) => (
                <div
                  key={index}
                  className="w-2 h-2 rounded-full bg-foreground/20"
                />
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default RecentCapsules;
