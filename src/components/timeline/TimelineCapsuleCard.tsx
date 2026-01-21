import { motion } from 'framer-motion';
import { 
  FileText, Image, Video, Music, Layers, 
  Calendar, ChevronRight, Clock, Eye
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import CategoryBadge from '@/components/capsule/CategoryBadge';
import type { Database } from '@/integrations/supabase/types';
import type { Category } from '@/hooks/useCategories';

type Capsule = Database['public']['Tables']['capsules']['Row'];
type CapsuleType = Database['public']['Enums']['capsule_type'];

const capsuleTypeConfig: Record<CapsuleType, { 
  icon: typeof FileText; 
  label: string; 
  color: string;
  bgLight: string;
}> = {
  text: { 
    icon: FileText, 
    label: 'Texte', 
    color: 'bg-blue-500',
    bgLight: 'bg-blue-500/10 text-blue-600'
  },
  photo: { 
    icon: Image, 
    label: 'Photo', 
    color: 'bg-emerald-500',
    bgLight: 'bg-emerald-500/10 text-emerald-600'
  },
  video: { 
    icon: Video, 
    label: 'Vidéo', 
    color: 'bg-purple-500',
    bgLight: 'bg-purple-500/10 text-purple-600'
  },
  audio: { 
    icon: Music, 
    label: 'Audio', 
    color: 'bg-orange-500',
    bgLight: 'bg-orange-500/10 text-orange-600'
  },
  mixed: { 
    icon: Layers, 
    label: 'Mixte', 
    color: 'bg-pink-500',
    bgLight: 'bg-pink-500/10 text-pink-600'
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
  const config = capsuleTypeConfig[capsule.capsule_type];
  const Icon = config.icon;
  const memoryDate = capsule.memory_date ? parseISO(capsule.memory_date) : null;
  const createdDate = parseISO(capsule.created_at);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.2) }}
      className={`relative flex items-start gap-3 sm:gap-4 ${
        isLeft ? 'sm:flex-row' : 'sm:flex-row-reverse'
      }`}
    >
      {/* Point sur la timeline - Desktop uniquement */}
      <div className="hidden sm:block absolute left-1/2 -translate-x-1/2 top-6 z-10">
        <motion.div
          whileHover={{ scale: 1.3 }}
          className={`w-3 h-3 rounded-full ${config.color} ring-4 ring-background shadow-lg`}
        />
      </div>

      {/* Indicateur de type - Mobile */}
      <div className="sm:hidden flex-shrink-0 mt-1">
        <div className={`w-10 h-10 rounded-xl ${config.color} flex items-center justify-center shadow-md`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Carte principale */}
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={`flex-1 min-w-0 sm:w-[calc(50%-2rem)] cursor-pointer group ${
          isLeft ? 'sm:pr-8' : 'sm:pl-8'
        }`}
      >
        <div className="relative p-4 sm:p-5 rounded-2xl border border-border bg-card hover:border-secondary/50 hover:shadow-xl transition-all duration-300 overflow-hidden">
          {/* Décoration de fond subtile */}
          <div className={`absolute top-0 right-0 w-24 h-24 ${config.color} opacity-5 rounded-full -translate-y-1/2 translate-x-1/2`} />
          
          {/* En-tête */}
          <div className="flex items-start gap-3 mb-3">
            {/* Icône du type - Desktop */}
            <div className={`hidden sm:flex w-11 h-11 rounded-xl ${config.color} items-center justify-center flex-shrink-0 shadow-md`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-base sm:text-lg line-clamp-2 group-hover:text-secondary transition-colors leading-tight">
                {capsule.title}
              </h3>
              
              {/* Dates */}
              <div className="flex flex-col gap-0.5 mt-1.5">
                {memoryDate && (
                  <p className="text-xs text-secondary font-medium flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    {format(memoryDate, 'd MMMM yyyy', { locale: fr })}
                  </p>
                )}
                <p className={`text-xs flex items-center gap-1.5 ${memoryDate ? 'text-muted-foreground/60' : 'text-muted-foreground'}`}>
                  <Clock className="w-3 h-3" />
                  {memoryDate ? 'Créé le ' : ''}{format(createdDate, 'd MMM yyyy', { locale: fr })}
                </p>
              </div>
            </div>

            {/* Indicateur de navigation */}
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center group-hover:bg-secondary/10 transition-colors">
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-secondary group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>

          {/* Description */}
          {capsule.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
              {capsule.description}
            </p>
          )}

          {/* Métadonnées */}
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Catégorie */}
            {category && (
              <CategoryBadge category={category} size="sm" />
            )}
            
            {/* Statut */}
            <Badge
              variant={capsule.status === 'published' ? 'default' : 'secondary'}
              className={`text-xs ${
                capsule.status === 'published' 
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-200 hover:bg-emerald-500/20' 
                  : ''
              }`}
            >
              {capsule.status === 'published' ? (
                <><Eye className="w-3 h-3 mr-1" />Publié</>
              ) : 'Brouillon'}
            </Badge>
            
            {/* Type badge mobile */}
            <Badge variant="outline" className={`text-xs sm:hidden ${config.bgLight}`}>
              {config.label}
            </Badge>
            
            {/* Tags */}
            {capsule.tags?.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {capsule.tags && capsule.tags.length > 2 && (
              <span className="text-xs text-muted-foreground pl-1">
                +{capsule.tags.length - 2}
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Espace pour l'alternance desktop */}
      <div className="hidden sm:block sm:w-[calc(50%-2rem)]" />
    </motion.div>
  );
};

export default TimelineCapsuleCard;
