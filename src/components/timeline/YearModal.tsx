import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, FileText, Image, Video, Music, Layers, ChevronRight, Clock, Eye } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
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

const capsuleTypeConfig: Record<CapsuleType, { 
  icon: typeof FileText; 
  label: string; 
  color: string;
}> = {
  text: { icon: FileText, label: 'Texte', color: 'bg-blue-500' },
  photo: { icon: Image, label: 'Photo', color: 'bg-emerald-500' },
  video: { icon: Video, label: 'Vidéo', color: 'bg-purple-500' },
  audio: { icon: Music, label: 'Audio', color: 'bg-orange-500' },
  mixed: { icon: Layers, label: 'Mixte', color: 'bg-pink-500' },
};

interface YearModalProps {
  year: string | null;
  decade: string | null;
  capsules: Capsule[];
  capsuleCategories: Record<string, Category>;
  onClose: () => void;
  onBackToDecade: () => void;
  onCapsuleClick: (id: string) => void;
}

const YearModal = ({ 
  year, 
  decade,
  capsules, 
  capsuleCategories, 
  onClose, 
  onBackToDecade,
  onCapsuleClick 
}: YearModalProps) => {
  // Group by month
  const groupedByMonth: Record<string, Capsule[]> = {};
  capsules.forEach(capsule => {
    const date = capsule.memory_date ? parseISO(capsule.memory_date) : parseISO(capsule.created_at);
    const month = format(date, 'MMMM', { locale: fr });
    if (!groupedByMonth[month]) groupedByMonth[month] = [];
    groupedByMonth[month].push(capsule);
  });

  return (
    <Dialog open={!!year} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-secondary p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display font-bold text-white flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              {year}
            </DialogTitle>
          </DialogHeader>
          <p className="text-white/80 mt-2">
            {capsules.length} souvenir{capsules.length > 1 ? 's' : ''} cette année
          </p>
        </div>

        {/* Liste des souvenirs par mois */}
        <ScrollArea className="flex-1 max-h-[50vh]">
          <div className="p-4 space-y-6">
            {Object.entries(groupedByMonth).map(([month, monthCapsules], monthIndex) => (
              <div key={month}>
                {/* En-tête du mois */}
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div className="w-2 h-2 rounded-full bg-secondary" />
                  <span className="text-sm font-semibold text-secondary capitalize">{month}</span>
                  <span className="text-xs text-muted-foreground">({monthCapsules.length})</span>
                </div>

                {/* Capsules du mois */}
                <div className="space-y-2">
                  {monthCapsules.map((capsule, index) => {
                    const config = capsuleTypeConfig[capsule.capsule_type];
                    const Icon = config.icon;
                    const memoryDate = capsule.memory_date ? parseISO(capsule.memory_date) : null;
                    const createdDate = parseISO(capsule.created_at);
                    const category = capsuleCategories[capsule.id];

                    return (
                      <motion.button
                        key={capsule.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: (monthIndex * 0.1) + (index * 0.03) }}
                        onClick={() => onCapsuleClick(capsule.id)}
                        className="w-full text-left p-4 rounded-xl bg-card border border-border hover:border-secondary/50 hover:shadow-md transition-all group"
                      >
                        <div className="flex items-start gap-3">
                          {/* Icône type */}
                          <div className={`w-10 h-10 rounded-xl ${config.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>

                          {/* Contenu */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-foreground line-clamp-1 group-hover:text-secondary transition-colors">
                              {capsule.title}
                            </h4>
                            
                            {/* Dates */}
                            <div className="flex flex-col gap-0.5 mt-1">
                              {memoryDate && (
                                <p className="text-xs text-secondary flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {format(memoryDate, 'd MMMM', { locale: fr })}
                                </p>
                              )}
                              <p className={`text-xs flex items-center gap-1 ${memoryDate ? 'text-muted-foreground/60' : 'text-muted-foreground'}`}>
                                <Clock className="w-3 h-3" />
                                {memoryDate ? 'Créé le ' : ''}{format(createdDate, 'd MMM', { locale: fr })}
                              </p>
                            </div>

                            {/* Description */}
                            {capsule.description && (
                              <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                                {capsule.description}
                              </p>
                            )}

                            {/* Badges */}
                            <div className="flex flex-wrap items-center gap-1.5 mt-2">
                              {category && (
                                <CategoryBadge category={category} size="sm" />
                              )}
                              <Badge
                                variant={capsule.status === 'published' ? 'default' : 'secondary'}
                                className={`text-xs ${
                                  capsule.status === 'published' 
                                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-200' 
                                    : ''
                                }`}
                              >
                                {capsule.status === 'published' ? (
                                  <><Eye className="w-3 h-3 mr-1" />Publié</>
                                ) : 'Brouillon'}
                              </Badge>
                            </div>
                          </div>

                          {/* Flèche */}
                          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-secondary group-hover:translate-x-1 transition-all flex-shrink-0 mt-2" />
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/30 flex gap-2">
          <Button variant="outline" onClick={onBackToDecade} className="flex-1 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Années {decade}
          </Button>
          <Button variant="ghost" onClick={onClose} className="gap-2">
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default YearModal;
