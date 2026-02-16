import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, FileText, Image, Video, Music, Layers, ChevronRight, Clock, Eye, Play } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr, enUS, es, ko, zhCN, Locale } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import CategoryBadge from '@/components/capsule/CategoryBadge';
import type { Database } from '@/integrations/supabase/types';
import type { Category } from '@/hooks/useCategories';

type Capsule = Database['public']['Tables']['capsules']['Row'];
type CapsuleType = Database['public']['Enums']['capsule_type'];

interface CapsuleMedia {
  id: string;
  file_url: string;
  file_type: string;
}

interface YearModalProps {
  year: string | null;
  decade: string | null;
  capsules: Capsule[];
  capsuleCategories: Record<string, Category>;
  capsuleMedias: Record<string, CapsuleMedia | null>;
  onClose: () => void;
  onBackToDecade: () => void;
  onCapsuleClick: (id: string) => void;
}

const YearModal = ({ 
  year, 
  decade,
  capsules, 
  capsuleCategories,
  capsuleMedias,
  onClose, 
  onBackToDecade,
  onCapsuleClick 
}: YearModalProps) => {
  const { t, i18n } = useTranslation('dashboard');

  const getLocale = (): Locale => {
    const localeMap: Record<string, Locale> = { fr, en: enUS, es, ko, zh: zhCN };
    return localeMap[i18n.language] || fr;
  };

  const capsuleTypeConfig: Record<CapsuleType, { 
    icon: typeof FileText; 
    color: string;
    label: string;
  }> = {
    text: { icon: FileText, color: 'bg-secondary', label: 'Texte' },
    photo: { icon: Image, color: 'bg-primary', label: 'Photo' },
    video: { icon: Video, color: 'bg-accent', label: 'Vidéo' },
    audio: { icon: Music, color: 'bg-[hsl(var(--navy-light))]', label: 'Audio' },
    mixed: { icon: Layers, color: 'bg-[hsl(var(--gold-light))]', label: 'Mixte' },
  };

  // Group by month
  const groupedByMonth: Record<string, Capsule[]> = {};
  capsules.forEach(capsule => {
    const date = capsule.memory_date ? parseISO(capsule.memory_date) : parseISO(capsule.created_at);
    const month = format(date, 'MMMM', { locale: getLocale() });
    if (!groupedByMonth[month]) groupedByMonth[month] = [];
    groupedByMonth[month].push(capsule);
  });

  return (
    <Dialog open={!!year} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden max-h-[90vh]">
        {/* Header - clear and readable */}
        <div className="bg-secondary p-6 text-secondary-foreground">
          <DialogHeader>
            <DialogTitle className="text-2xl sm:text-3xl font-bold text-secondary-foreground flex items-center gap-3">
              <Calendar className="w-8 h-8" />
              {year}
            </DialogTitle>
          </DialogHeader>
          <p className="text-lg text-secondary-foreground/80 mt-3">
            {capsules.length} {t('timeline.decade.memoriesThisYear', { count: capsules.length })}
          </p>
        </div>

        {/* Capsule list by month - large touch targets */}
        <ScrollArea className="flex-1 max-h-[50vh]">
          <div className="p-4 space-y-6">
            {Object.entries(groupedByMonth).map(([month, monthCapsules], monthIndex) => (
              <div key={month}>
                {/* Month header - clear */}
                <div className="flex items-center gap-3 mb-4 px-2">
                  <div className="w-3 h-3 rounded-full bg-secondary" />
                  <span className="text-lg font-bold text-secondary capitalize">{month}</span>
                  <span className="text-base text-muted-foreground">({monthCapsules.length})</span>
                </div>

                {/* Month capsules */}
                <div className="space-y-3">
                  {monthCapsules.map((capsule, index) => {
                    const config = capsuleTypeConfig[capsule.capsule_type];
                    const Icon = config.icon;
                    const memoryDate = capsule.memory_date ? parseISO(capsule.memory_date) : null;
                    const createdDate = parseISO(capsule.created_at);
                    const category = capsuleCategories[capsule.id];
                    const media = capsuleMedias[capsule.id];
                    const isVideo = media?.file_type?.startsWith('video/');

                    return (
                      <motion.button
                        key={capsule.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: (monthIndex * 0.1) + (index * 0.03) }}
                        onClick={() => onCapsuleClick(capsule.id)}
                        className="w-full text-left p-4 rounded-xl bg-card border-2 border-border hover:border-secondary/50 hover:shadow-md transition-all group focus:outline-none focus:ring-4 focus:ring-secondary/50"
                        aria-label={capsule.title}
                      >
                        <div className="flex items-start gap-4">
                          {/* Thumbnail or icon - larger */}
                          {media ? (
                            <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
                              <img src={media.file_url} alt="" className="w-full h-full object-cover" />
                              {isVideo && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                  <Play className="w-6 h-6 text-white fill-white" />
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className={`w-16 h-16 rounded-xl ${config.color} flex items-center justify-center flex-shrink-0`}>
                              <Icon className="w-8 h-8 text-white" />
                            </div>
                          )}

                          {/* Content - larger text */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-lg text-foreground line-clamp-2 group-hover:text-secondary transition-colors leading-snug">
                              {capsule.title}
                            </h4>
                            
                            {/* Dates - more readable */}
                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                              {memoryDate && (
                                <p className="text-base text-secondary flex items-center gap-2 font-medium">
                                  <Calendar className="w-4 h-4" />
                                  {format(memoryDate, 'd MMM', { locale: getLocale() })}
                                </p>
                              )}
                              <p className={`text-sm flex items-center gap-1 ${memoryDate ? 'text-muted-foreground/70' : 'text-muted-foreground'}`}>
                                <Clock className="w-3.5 h-3.5" />
                                {format(createdDate, 'd MMM', { locale: getLocale() })}
                              </p>
                            </div>

                            {/* Badges - larger */}
                            <div className="flex flex-wrap items-center gap-2 mt-3">
                              {category && (
                                <CategoryBadge category={category} size="sm" />
                              )}
                              <Badge
                                variant={capsule.status === 'published' ? 'default' : 'secondary'}
                                className={`text-sm py-1 ${
                                  capsule.status === 'published' 
                                    ? 'bg-emerald-500/10 text-emerald-700 border-emerald-200' 
                                    : ''
                                }`}
                              >
                                {capsule.status === 'published' ? (
                                  <><Eye className="w-4 h-4 mr-1" />{t('timeline.statuses.published')}</>
                                ) : t('timeline.statuses.draft')}
                              </Badge>
                            </div>
                          </div>

                          {/* Navigation arrow - larger */}
                          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center group-hover:bg-secondary/10 transition-colors flex-shrink-0 mt-2">
                            <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-secondary transition-colors" />
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Footer - large buttons */}
        <div className="p-4 border-t-2 border-border bg-muted/30 flex gap-3">
          <Button 
            variant="outline" 
            onClick={onBackToDecade} 
            size="lg"
            className="flex-1 h-14 text-base font-semibold gap-2 border-2"
          >
            <ArrowLeft className="w-5 h-5" />
            {t('timeline.year.backToYears', { decade })}
          </Button>
          <Button 
            variant="ghost" 
            onClick={onClose} 
            size="lg"
            className="h-14 px-6 text-base font-semibold"
          >
            {t('timeline.year.close')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default YearModal;
