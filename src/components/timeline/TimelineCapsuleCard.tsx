import { motion } from 'framer-motion';
import { 
  FileText, Image, Video, Music, Layers, 
  Calendar, ChevronRight, Clock, Eye
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { Locale } from 'date-fns';
import { fr, enUS, es, ko, zhCN } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import CategoryBadge from '@/components/capsule/CategoryBadge';
import type { Database } from '@/integrations/supabase/types';
import type { Category } from '@/hooks/useCategories';

const dateLocales: Record<string, Locale> = { fr, en: enUS, es, ko, zh: zhCN };

type Capsule = Database['public']['Tables']['capsules']['Row'];
type CapsuleType = Database['public']['Enums']['capsule_type'];

const capsuleTypeConfig: Record<CapsuleType, { 
  icon: typeof FileText; 
  labelKey: string; 
  color: string;
  bgLight: string;
}> = {
  text: { 
    icon: FileText, 
    labelKey: 'types.text', 
    color: 'bg-blue-500',
    bgLight: 'bg-blue-500/10 text-blue-700'
  },
  photo: { 
    icon: Image, 
    labelKey: 'types.photo', 
    color: 'bg-emerald-500',
    bgLight: 'bg-emerald-500/10 text-emerald-700'
  },
  video: { 
    icon: Video, 
    labelKey: 'types.video', 
    color: 'bg-purple-500',
    bgLight: 'bg-purple-500/10 text-purple-700'
  },
  audio: { 
    icon: Music, 
    labelKey: 'types.audio', 
    color: 'bg-orange-500',
    bgLight: 'bg-orange-500/10 text-orange-700'
  },
  mixed: { 
    icon: Layers, 
    labelKey: 'types.mixed', 
    color: 'bg-pink-500',
    bgLight: 'bg-pink-500/10 text-pink-700'
  },
};

interface TimelineCapsuleCardProps {
  capsule: Capsule;
  index: number;
  isLeft: boolean;
  onClick: () => void;
  category?: Category;
}

const TimelineCapsuleCard = ({
  capsule,
  index,
  isLeft,
  onClick,
  category,
}: TimelineCapsuleCardProps) => {
  const { t, i18n } = useTranslation('capsules');
  const config = capsuleTypeConfig[capsule.capsule_type];
  const Icon = config.icon;
  const memoryDate = capsule.memory_date ? parseISO(capsule.memory_date) : null;
  const createdDate = parseISO(capsule.created_at);
  const currentLocale = dateLocales[i18n.language] || enUS;

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.2) }}
      onClick={onClick}
      className="w-full text-left p-5 rounded-2xl border-2 border-border bg-card hover:border-secondary/50 hover:shadow-lg transition-all group focus:outline-none focus:ring-4 focus:ring-secondary/50"
      aria-label={capsule.title}
    >
      <div className="flex items-start gap-4">
        {/* Type icon - larger */}
        <div className={`w-14 h-14 rounded-xl ${config.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title - larger */}
          <h3 className="font-bold text-lg sm:text-xl text-foreground line-clamp-2 group-hover:text-secondary transition-colors leading-snug mb-2">
            {capsule.title}
          </h3>
          
          {/* Dates - more readable */}
          <div className="flex flex-col gap-1 mb-3">
            {memoryDate && (
              <p className="text-base text-secondary font-medium flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {format(memoryDate, 'd MMMM yyyy', { locale: currentLocale })}
              </p>
            )}
            <p className={`text-sm flex items-center gap-2 ${memoryDate ? 'text-muted-foreground/70' : 'text-muted-foreground'}`}>
              <Clock className="w-4 h-4" />
              {memoryDate ? t('detail.createdAt') + ' ' : ''}{format(createdDate, 'd MMM yyyy', { locale: currentLocale })}
            </p>
          </div>

          {/* Description */}
          {capsule.description && (
            <p className="text-base text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
              {capsule.description}
            </p>
          )}

          {/* Metadata - larger badges */}
          <div className="flex flex-wrap items-center gap-2">
            {category && (
              <CategoryBadge category={category} size="md" />
            )}
            
            <Badge
              variant={capsule.status === 'published' ? 'default' : 'secondary'}
              className={`text-sm py-1 px-3 ${
                capsule.status === 'published' 
                  ? 'bg-emerald-500/10 text-emerald-700 border-emerald-200 hover:bg-emerald-500/20' 
                  : ''
              }`}
            >
              {capsule.status === 'published' ? (
                <><Eye className="w-4 h-4 mr-1.5" />{t('status.published')}</>
              ) : t('status.draft')}
            </Badge>
            
            {/* Tags - limited display */}
            {capsule.tags?.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-sm py-1 px-3">
                {tag}
              </Badge>
            ))}
            {capsule.tags && capsule.tags.length > 2 && (
              <span className="text-sm text-muted-foreground font-medium">
                +{capsule.tags.length - 2}
              </span>
            )}
          </div>
        </div>

        {/* Navigation indicator - larger touch target */}
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center group-hover:bg-secondary/10 transition-colors flex-shrink-0 mt-1">
          <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-secondary transition-colors" />
        </div>
      </div>
    </motion.button>
  );
};

export default TimelineCapsuleCard;
