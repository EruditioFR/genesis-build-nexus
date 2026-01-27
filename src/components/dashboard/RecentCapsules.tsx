import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Clock, Image, Video, FileText, Plus, ArrowRight, Music, Layers, ChevronLeft, ChevronRight, HelpCircle, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import CapsuleThumbnail from '@/components/capsule/CapsuleThumbnail';
import CategoryBadge from '@/components/capsule/CategoryBadge';
import AudioWaveBackground from '@/components/capsule/AudioWaveBackground';
import { supabase } from '@/integrations/supabase/client';
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
      const scrollAmount = 280;
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

  const getTypeColor = (type: Capsule['type']) => {
    switch (type) {
      case 'photo': return 'bg-blue-500/10 text-blue-600';
      case 'video': return 'bg-purple-500/10 text-purple-600';
      case 'audio': return 'bg-orange-500/10 text-orange-600';
      case 'mixed': return 'bg-emerald-500/10 text-emerald-600';
      case 'text': return 'bg-amber-500/10 text-amber-600';
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
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            {t('recentCapsules.title')}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {/* Navigation arrows - desktop only */}
          <div className="hidden md:flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className={`w-8 h-8 rounded-full transition-opacity ${canScrollLeft ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`w-8 h-8 rounded-full transition-opacity ${canScrollRight ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground" asChild>
            <Link to="/capsules">
              <span className="hidden sm:inline">{t('recentCapsules.viewAll')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>

      {capsules.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-border bg-muted/30">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-4 text-base">
            {t('recentCapsules.empty')}
          </p>
          <Button className="gap-2" size="lg" asChild>
            <Link to="/capsules/new">
              <Plus className="w-5 h-5" />
              {t('recentCapsules.createFirst')}
            </Link>
          </Button>
        </div>
      ) : (
        <div className="relative">
          {/* Scroll container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {capsules.map((capsule, index) => {
              const Icon = getTypeIcon(capsule.type);
              return (
                <Link to={`/capsules/${capsule.id}`} key={capsule.id} className="flex-shrink-0 snap-start">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="w-64 md:w-72 group cursor-pointer"
                  >
                    {/* Card */}
                    <div className="relative rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:-translate-y-1">
                      {/* Thumbnail - Dynamic content based on type */}
                      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                        {/* Display logic: thumbnail > video preview > firstMedia > text preview > placeholder */}
                        {capsule.thumbnail ? (
                          <CapsuleThumbnail
                            thumbnailUrl={capsule.thumbnail}
                            fallbackIcon={null}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : capsule.firstVideoUrl ? (
                          <div className="relative w-full h-full">
                            <video 
                              src={capsule.firstVideoUrl} 
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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
                            {/* Play button overlay */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:opacity-0 transition-opacity duration-300">
                              <div className="w-14 h-14 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                                <Play className="w-6 h-6 text-white fill-white ml-1" />
                              </div>
                            </div>
                          </div>
                        ) : capsule.firstMediaUrl ? (
                          <CapsuleThumbnail
                            thumbnailUrl={capsule.firstMediaUrl}
                            fallbackIcon={null}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : capsule.type === 'audio' ? (
                          <div className="w-full h-full relative bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20">
                            <AudioWaveBackground animated={false} barCount={35} />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-14 h-14 rounded-full bg-orange-500/20 backdrop-blur-sm flex items-center justify-center">
                                <Music className="w-7 h-7 text-orange-600 dark:text-orange-400" />
                              </div>
                            </div>
                          </div>
                        ) : capsule.type === 'text' && capsule.content ? (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20 p-4">
                            <p className="text-sm text-amber-800 dark:text-amber-200 line-clamp-4 text-center italic leading-relaxed font-serif">
                              "{capsule.content.slice(0, 120)}{capsule.content.length > 120 ? '...' : ''}"
                            </p>
                          </div>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-muted to-muted/50 gap-2">
                            <HelpCircle className="w-12 h-12 text-muted-foreground/40" strokeWidth={1.5} />
                            <span className="text-xs text-muted-foreground/60 font-medium">{t('recentCapsules.noContent')}</span>
                          </div>
                        )}
                        
                        {/* Type badge overlay */}
                        <div className="absolute top-3 left-3">
                          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-md bg-background/80 ${getTypeColor(capsule.type)}`}>
                            <Icon className="w-3.5 h-3.5" />
                            <span className="text-xs font-medium">{getTypeLabel(capsule.type)}</span>
                          </div>
                        </div>

                        {/* Gradient overlay */}
                        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />
                        
                        {/* Date on image */}
                        <div className="absolute bottom-3 left-3 right-3">
                          <p className="text-white/90 text-xs font-medium">{capsule.date}</p>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <h4 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors mb-2">
                          {capsule.title}
                        </h4>
                        
                        {capsuleCategories[capsule.id] && (
                          <CategoryBadge 
                            category={capsuleCategories[capsule.id]} 
                            size="sm" 
                            showIcon={true}
                          />
                        )}
                      </div>
                    </div>
                  </motion.div>
                </Link>
              );
            })}

            {/* Add new card */}
            <Link to="/capsules/new" className="flex-shrink-0 snap-start">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: capsules.length * 0.05 }}
                className="w-64 md:w-72 h-full"
              >
                  <div className="h-full min-h-[280px] rounded-2xl border-2 border-dashed border-border bg-muted/30 flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:border-primary/50 hover:bg-primary/5 cursor-pointer group">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus className="w-7 h-7 text-primary" />
                  </div>
                  <span className="font-medium text-muted-foreground group-hover:text-primary transition-colors">
                    {t('quickActions.newCapsule')}
                  </span>
                </div>
              </motion.div>
            </Link>
          </div>

          {/* Scroll indicators for mobile */}
          <div className="flex justify-center gap-1.5 mt-2 md:hidden">
            {capsules.slice(0, Math.min(5, capsules.length)).map((_, index) => (
              <div
                key={index}
                className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30"
              />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default RecentCapsules;
