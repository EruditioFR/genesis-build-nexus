import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Baby,
  GraduationCap,
  Music,
  Users,
  Heart,
  ChevronRight,
  ChevronDown,
  Check,
  Trophy,
  Gift,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface MemoryPrompt {
  id: string;
  question: string;
}

interface MemoryCategory {
  id: string;
  title: string;
  emoji: string;
  icon: React.ElementType;
  description: string;
  gradient: string;
  bgColor: string;
  prompts: MemoryPrompt[];
}

const memoryCategories: MemoryCategory[] = [
  {
    id: 'enfance',
    title: 'Enfance',
    emoji: '🌱',
    icon: Baby,
    description: 'Se souvenir sans effort',
    gradient: 'from-green-500 to-emerald-600',
    bgColor: 'bg-green-50 dark:bg-green-950/30',
    prompts: [
      { id: 'enfance-1', question: 'Ferme les yeux quelques secondes… Où étais-tu quand tu avais 6 ans ?' },
      { id: 'enfance-2', question: 'À quoi ressemblait la maison de ton enfance ?' },
      { id: 'enfance-3', question: 'Quel objet te rendait heureux quand tu étais enfant ?' },
      { id: 'enfance-4', question: 'Raconte une bêtise qui te fait encore sourire aujourd\'hui.' },
      { id: 'enfance-5', question: 'De quoi avais-tu peur, et comment tu l\'as surmonté ?' },
      { id: 'enfance-6', question: 'Qui était la personne qui te rassurait le plus ?' },
      { id: 'enfance-7', question: 'Décris un moment simple où tu te sentais en sécurité.' },
      { id: 'enfance-8', question: 'Quel était ton endroit préféré pour jouer ?' },
      { id: 'enfance-9', question: 'Quelle phrase entendais-tu souvent à la maison ?' },
      { id: 'enfance-10', question: 'Quel souvenir te revient quand tu penses à "enfance" ?' },
    ],
  },
  {
    id: 'ecole',
    title: 'École & adolescence',
    emoji: '🎒',
    icon: GraduationCap,
    description: 'Identité en construction',
    gradient: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    prompts: [
      { id: 'ecole-1', question: 'Rappelle-toi ton premier jour d\'école. Qu\'as-tu ressenti ?' },
      { id: 'ecole-2', question: 'Un professeur t\'a marqué. Pourquoi ?' },
      { id: 'ecole-3', question: 'Qui était ton meilleur ami à cette époque ?' },
      { id: 'ecole-4', question: 'Quel moment d\'école n\'oublieras jamais ?' },
      { id: 'ecole-5', question: 'Quelle matière aimais-tu (ou détestais-tu) secrètement ?' },
      { id: 'ecole-6', question: 'Raconte un fou rire impossible à oublier.' },
      { id: 'ecole-7', question: 'Quel rêve avais-tu adolescent ?' },
      { id: 'ecole-8', question: 'Quelle musique tournait en boucle dans ta chambre ?' },
      { id: 'ecole-9', question: 'Qu\'y avait-il sur les murs de ta chambre ?' },
      { id: 'ecole-10', question: 'Quelle émotion te revient quand tu repenses à ces années ?' },
    ],
  },
  {
    id: 'musiques',
    title: 'Musiques & films',
    emoji: '🎵',
    icon: Music,
    description: 'Mémoire émotionnelle',
    gradient: 'from-purple-500 to-fuchsia-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    prompts: [
      { id: 'musiques-1', question: 'Quelle chanson te ramène instantanément en arrière ?' },
      { id: 'musiques-2', question: 'À quel moment cette musique est-elle liée ?' },
      { id: 'musiques-3', question: 'Quel film as-tu regardé encore et encore ?' },
      { id: 'musiques-4', question: 'Une scène de film t\'a marqué pour toujours. Laquelle ?' },
      { id: 'musiques-5', question: 'Quel générique te donne encore des frissons ?' },
      { id: 'musiques-6', question: 'Quelle musique est associée à une personne précise ?' },
      { id: 'musiques-7', question: 'Raconte ton premier concert ou spectacle.' },
      { id: 'musiques-8', question: 'Quelle chanson parle encore de toi aujourd\'hui ?' },
      { id: 'musiques-9', question: 'Un film t\'a fait pleurer pour la première fois… lequel ?' },
      { id: 'musiques-10', question: 'Si tu devais transmettre une musique, laquelle serait-ce ?' },
    ],
  },
  {
    id: 'famille',
    title: 'Famille',
    emoji: '👨‍👩‍👧‍👦',
    icon: Users,
    description: 'Transmission & racines',
    gradient: 'from-orange-500 to-amber-600',
    bgColor: 'bg-orange-50 dark:bg-orange-950/30',
    prompts: [
      { id: 'famille-1', question: 'Quel souvenir te relie le plus à ta famille ?' },
      { id: 'famille-2', question: 'Quelle habitude familiale a disparu mais te manque ?' },
      { id: 'famille-3', question: 'Une phrase typique d\'un parent te revient en tête ?' },
      { id: 'famille-4', question: 'Quel souvenir précieux as-tu avec tes grands-parents ?' },
      { id: 'famille-5', question: 'Raconte une recette qui raconte ton histoire.' },
      { id: 'famille-6', question: 'Un objet de famille a une histoire… laquelle ?' },
      { id: 'famille-7', question: 'Décris une fête de famille inoubliable.' },
      { id: 'famille-8', question: 'Quelle photo résume bien ta famille ?' },
      { id: 'famille-9', question: 'Quelle tradition aimerais-tu transmettre ?' },
      { id: 'famille-10', question: 'Quel conseil de vie as-tu reçu d\'un proche ?' },
    ],
  },
  {
    id: 'vie-personnelle',
    title: 'Vie personnelle',
    emoji: '❤️',
    icon: Heart,
    description: 'Sens & héritage',
    gradient: 'from-rose-500 to-red-600',
    bgColor: 'bg-rose-50 dark:bg-rose-950/30',
    prompts: [
      { id: 'vie-1', question: 'Quel moment a changé le cours de ta vie ?' },
      { id: 'vie-2', question: 'Raconte une grande joie, même toute simple.' },
      { id: 'vie-3', question: 'Quelle épreuve t\'a fait grandir ?' },
      { id: 'vie-4', question: 'Quel choix t\'a rendu fier de toi ?' },
      { id: 'vie-5', question: 'Si tu écrivais une lettre à quelqu\'un, que dirais-tu ?' },
      { id: 'vie-6', question: 'Y a-t-il un souvenir que tu n\'as jamais raconté ?' },
      { id: 'vie-7', question: 'Quel lieu te fait te sentir "chez toi" ?' },
      { id: 'vie-8', question: 'Un moment ordinaire mais parfait… raconte-le.' },
      { id: 'vie-9', question: 'Qu\'aimerais-tu que tes proches comprennent de toi ?' },
      { id: 'vie-10', question: 'Si ce souvenir devait rester, lequel choisirais-tu ?' },
    ],
  },
];

interface GuidedMemoryPromptsProps {
  className?: string;
}

const GuidedMemoryPrompts = ({ className }: GuidedMemoryPromptsProps) => {
  const { user } = useAuth();
  const [usedPromptIds, setUsedPromptIds] = useState<Set<string>>(new Set());
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch used prompts on mount
  useEffect(() => {
    const fetchUsedPrompts = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('user_memory_prompts')
          .select('prompt_id')
          .eq('user_id', user.id);

        if (error) throw error;

        if (data) {
          setUsedPromptIds(new Set(data.map((p) => p.prompt_id)));
        }
      } catch (error) {
        console.error('Error fetching used prompts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsedPrompts();
  }, [user]);

  // Calculate progress for each category
  const getCategoryProgress = (category: MemoryCategory) => {
    const usedCount = category.prompts.filter((p) => usedPromptIds.has(p.id)).length;
    return {
      used: usedCount,
      total: category.prompts.length,
      percentage: (usedCount / category.prompts.length) * 100,
    };
  };

  // Get total progress
  const getTotalProgress = () => {
    const totalPrompts = memoryCategories.reduce((sum, cat) => sum + cat.prompts.length, 0);
    const usedPrompts = memoryCategories.reduce(
      (sum, cat) => sum + cat.prompts.filter((p) => usedPromptIds.has(p.id)).length,
      0
    );
    return { used: usedPrompts, total: totalPrompts };
  };

  // Get next suggested prompt (first unused in each category)
  const getNextPrompt = (category: MemoryCategory) => {
    return category.prompts.find((p) => !usedPromptIds.has(p.id));
  };

  const totalProgress = getTotalProgress();
  const completionPercentage = (totalProgress.used / totalProgress.total) * 100;

  if (loading) {
    return (
      <div className={cn('animate-pulse', className)}>
        <div className="h-48 bg-muted rounded-2xl" />
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with overall progress - compact */}
      <div className="flex items-center justify-between gap-3 p-3 sm:p-4 rounded-xl bg-gradient-to-r from-secondary/5 via-primary/5 to-secondary/5 border border-border">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-secondary to-primary text-white shadow-md">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-display font-bold text-foreground">
              Inspirez-vous pour écrire
            </h2>
            <p className="text-xs text-muted-foreground hidden sm:block">
              50 questions pour guider vos souvenirs
            </p>
          </div>
        </div>

        {/* Progress badge - compact */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background border border-border">
          <Trophy className="h-4 w-4 text-amber-500" />
          <span className="text-xs font-medium text-foreground">
            {totalProgress.used}/{totalProgress.total}
          </span>
          {completionPercentage >= 100 && (
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-xs px-1.5 py-0">
              <Star className="h-2.5 w-2.5 mr-0.5" />
              ✓
            </Badge>
          )}
        </div>
      </div>

      {/* Categories grid */}
      <div className="grid grid-cols-1 gap-3">
        {memoryCategories.map((category, categoryIndex) => {
          const progress = getCategoryProgress(category);
          const nextPrompt = getNextPrompt(category);
          const isExpanded = expandedCategory === category.id;
          const isComplete = progress.used === progress.total;

          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: categoryIndex * 0.05 }}
              className={cn(
                'rounded-2xl border overflow-hidden transition-all',
                category.bgColor,
                isComplete ? 'border-green-200 dark:border-green-800' : 'border-border hover:border-secondary/30'
              )}
            >
              {/* Category header */}
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                className="w-full p-3 flex items-center gap-3 hover:bg-background/30 transition-colors group"
              >
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-sm flex-shrink-0',
                    category.gradient
                  )}
                >
                  <span className="text-lg">{category.emoji}</span>
                </div>

                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-foreground">
                      {category.title}
                    </h3>
                    {isComplete && (
                      <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                        <Check className="h-3 w-3 mr-1" />
                        Terminé
                      </Badge>
                    )}
                  </div>
                  
                  {/* Preview of first 2 prompts when collapsed */}
                  {!isExpanded && nextPrompt && (
                    <div className="mt-1.5 space-y-1">
                      {category.prompts
                        .filter((p) => !usedPromptIds.has(p.id))
                        .slice(0, 2)
                        .map((prompt) => (
                          <Link
                            key={prompt.id}
                            to={`/capsules/new?prompt=${encodeURIComponent(prompt.question)}&promptId=${prompt.id}&category=${category.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="block text-sm text-muted-foreground hover:text-secondary transition-colors truncate max-w-[280px] sm:max-w-md"
                          >
                            <span className="text-secondary/70 mr-1">•</span>
                            {prompt.question}
                          </Link>
                        ))}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 mt-2">
                    <Progress value={progress.percentage} className="h-2 flex-1 max-w-32" />
                    <span className="text-xs text-muted-foreground">
                      {progress.used}/{progress.total}
                    </span>
                  </div>
                </div>

                {/* Accordion arrow */}
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-xl transition-all flex-shrink-0',
                    isExpanded 
                      ? 'bg-secondary text-secondary-foreground' 
                      : 'bg-muted/50 group-hover:bg-secondary/10'
                  )}
                >
                  <ChevronDown
                    className={cn(
                      'h-5 w-5 transition-transform duration-200',
                      isExpanded ? 'rotate-180' : 'text-muted-foreground group-hover:text-secondary'
                    )}
                  />
                </div>
              </button>

              {/* Expanded prompts list */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-2">
                      {category.prompts.map((prompt, index) => {
                        const isUsed = usedPromptIds.has(prompt.id);

                        return (
                          <div
                            key={prompt.id}
                            className={cn(
                              'flex items-center gap-3 p-3 rounded-xl transition-all',
                              isUsed
                                ? 'bg-muted/50 opacity-60'
                                : 'bg-background/80 hover:bg-background border border-border/50 hover:border-secondary/50 hover:shadow-sm'
                            )}
                          >
                            <div
                              className={cn(
                                'flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium flex-shrink-0',
                                isUsed
                                  ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
                                  : 'bg-muted text-muted-foreground'
                              )}
                            >
                              {isUsed ? <Check className="h-4 w-4" /> : index + 1}
                            </div>

                            <p
                              className={cn(
                                'flex-1 text-sm',
                                isUsed ? 'text-muted-foreground line-through' : 'text-foreground'
                              )}
                            >
                              {prompt.question}
                            </p>

                            {!isUsed && (
                              <Link
                                to={`/capsules/new?prompt=${encodeURIComponent(prompt.question)}&promptId=${prompt.id}&category=${category.id}`}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors text-xs font-medium"
                              >
                                Écrire
                                <ChevronRight className="h-3 w-3" />
                              </Link>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default GuidedMemoryPrompts;
