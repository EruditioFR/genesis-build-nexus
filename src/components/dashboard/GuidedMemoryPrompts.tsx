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
      {/* Header with overall progress - Playful design */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-50 via-rose-50 to-violet-50 dark:from-amber-950/30 dark:via-rose-950/30 dark:to-violet-950/30 p-6 border border-amber-200/50 dark:border-amber-800/30"
      >
        {/* Decorative floating elements */}
        <div className="absolute top-2 right-8 text-2xl animate-bounce" style={{ animationDelay: '0.1s' }}>✨</div>
        <div className="absolute top-6 right-24 text-xl animate-bounce" style={{ animationDelay: '0.3s' }}>🌟</div>
        <div className="absolute bottom-4 right-16 text-lg animate-bounce" style={{ animationDelay: '0.5s' }}>💫</div>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 text-white shadow-lg shadow-orange-200 dark:shadow-orange-900/30"
            >
              <Sparkles className="h-8 w-8" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-display font-bold bg-gradient-to-r from-amber-600 via-orange-500 to-rose-500 bg-clip-text text-transparent">
                Inspirez-vous ! 🎨
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                50 questions magiques pour réveiller vos souvenirs
              </p>
            </div>
          </div>

          {/* Playful progress badge */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/80 dark:bg-black/20 backdrop-blur-sm border-2 border-amber-300 dark:border-amber-700 shadow-lg"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Trophy className="h-6 w-6 text-amber-500" />
            </motion.div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-foreground">
                {totalProgress.used} / {totalProgress.total} 🎯
              </span>
              <Progress value={completionPercentage} className="h-2 w-28" />
            </div>
            {completionPercentage >= 100 && (
              <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 animate-pulse">
                <Star className="h-3 w-3 mr-1" />
                Champion ! 🏆
              </Badge>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Categories grid - Playful cards */}
      <div className="grid grid-cols-1 gap-4">
        {memoryCategories.map((category, categoryIndex) => {
          const progress = getCategoryProgress(category);
          const nextPrompt = getNextPrompt(category);
          const isExpanded = expandedCategory === category.id;
          const isComplete = progress.used === progress.total;

          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: categoryIndex * 0.1 }}
              whileHover={{ scale: 1.01, y: -2 }}
              className={cn(
                'rounded-3xl border-2 overflow-hidden transition-all shadow-md hover:shadow-xl',
                category.bgColor,
                isComplete 
                  ? 'border-green-300 dark:border-green-700 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30' 
                  : 'border-transparent hover:border-secondary/30'
              )}
            >
              {/* Category header */}
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                className="w-full p-5 flex items-center gap-4 hover:bg-background/30 transition-all group"
              >
                <motion.div
                  whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                  transition={{ duration: 0.4 }}
                  className={cn(
                    'flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg flex-shrink-0 relative',
                    category.gradient
                  )}
                >
                  <span className="text-3xl">{category.emoji}</span>
                  {isComplete && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 h-6 w-6 bg-green-500 rounded-full flex items-center justify-center shadow-md"
                    >
                      <Check className="h-4 w-4 text-white" />
                    </motion.div>
                  )}
                </motion.div>

                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-bold text-foreground">
                      {category.title}
                    </h3>
                    {isComplete && (
                      <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0 shadow-sm">
                        <Star className="h-3 w-3 mr-1" />
                        Bravo ! 🎉
                      </Badge>
                    )}
                  </div>
                  
                  {/* Preview of first 2 prompts when collapsed */}
                  {!isExpanded && nextPrompt && (
                    <div className="mt-2 space-y-1.5">
                      {category.prompts
                        .filter((p) => !usedPromptIds.has(p.id))
                        .slice(0, 2)
                        .map((prompt, idx) => (
                          <Link
                            key={prompt.id}
                            to={`/capsules/new?prompt=${encodeURIComponent(prompt.question)}&promptId=${prompt.id}&category=${category.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-secondary transition-all group/link"
                          >
                            <span className="text-lg">{idx === 0 ? '💡' : '✏️'}</span>
                            <span className="truncate max-w-[240px] sm:max-w-md group-hover/link:underline">
                              {prompt.question}
                            </span>
                          </Link>
                        ))}
                    </div>
                  )}
                  
                  {/* Fun progress bar */}
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex-1 max-w-36 h-3 bg-muted/50 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress.percentage}%` }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className={cn(
                          'h-full rounded-full bg-gradient-to-r',
                          progress.percentage >= 100 
                            ? 'from-green-400 to-emerald-500' 
                            : 'from-secondary to-primary'
                        )}
                      />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">
                      {progress.used}/{progress.total} {progress.percentage >= 100 ? '🌟' : ''}
                    </span>
                  </div>
                </div>

                {/* Playful accordion arrow */}
                <motion.div
                  animate={{ 
                    rotate: isExpanded ? 180 : 0,
                    scale: isExpanded ? 1.1 : 1
                  }}
                  whileHover={{ scale: 1.15 }}
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-2xl transition-all flex-shrink-0 shadow-md',
                    isExpanded 
                      ? 'bg-gradient-to-br from-secondary to-primary text-white' 
                      : 'bg-white dark:bg-muted group-hover:bg-secondary/10'
                  )}
                >
                  <ChevronDown
                    className={cn(
                      'h-6 w-6 transition-transform duration-300',
                      isExpanded ? 'text-white' : 'text-secondary'
                    )}
                  />
                </motion.div>
              </button>

              {/* Expanded prompts list - Playful design */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 space-y-3">
                      {category.prompts.map((prompt, index) => {
                        const isUsed = usedPromptIds.has(prompt.id);

                        return (
                          <motion.div
                            key={prompt.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={cn(
                              'flex items-center gap-4 p-4 rounded-2xl transition-all',
                              isUsed
                                ? 'bg-green-50 dark:bg-green-950/30 border-2 border-green-200 dark:border-green-800'
                                : 'bg-white dark:bg-muted/50 hover:bg-secondary/5 border-2 border-transparent hover:border-secondary/30 shadow-sm hover:shadow-md'
                            )}
                          >
                            <motion.div
                              whileHover={!isUsed ? { scale: 1.1, rotate: 10 } : {}}
                              className={cn(
                                'flex h-10 w-10 items-center justify-center rounded-xl text-base font-bold flex-shrink-0',
                                isUsed
                                  ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-md'
                                  : 'bg-gradient-to-br from-secondary/20 to-primary/20 text-secondary'
                              )}
                            >
                              {isUsed ? <Check className="h-5 w-5" /> : <span>{index + 1}</span>}
                            </motion.div>

                            <p
                              className={cn(
                                'flex-1 text-base',
                                isUsed ? 'text-muted-foreground line-through' : 'text-foreground font-medium'
                              )}
                            >
                              {prompt.question}
                            </p>

                            {!isUsed && (
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Link
                                  to={`/capsules/new?prompt=${encodeURIComponent(prompt.question)}&promptId=${prompt.id}&category=${category.id}`}
                                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-secondary to-primary text-white hover:opacity-90 transition-all text-sm font-semibold shadow-md hover:shadow-lg"
                                >
                                  <span>Écrire</span>
                                  <span>✍️</span>
                                </Link>
                              </motion.div>
                            )}

                            {isUsed && (
                              <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                                Fait ! ✅
                              </span>
                            )}
                          </motion.div>
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
