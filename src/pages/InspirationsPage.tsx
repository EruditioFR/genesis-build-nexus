import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ChevronRight,
  ChevronDown,
  Check,
  Trophy,
  Star,
  ArrowLeft,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useMemoryPrompts } from '@/hooks/useMemoryPrompts';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import NoIndex from '@/components/seo/NoIndex';

const InspirationsPage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { usedPromptIds, loading, memoryCategories, getCategoryProgress, getTotalProgress } = useMemoryPrompts();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const totalProgress = getTotalProgress();
  const completionPercentage = totalProgress.total > 0 ? (totalProgress.used / totalProgress.total) * 100 : 0;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (!user) return null;

  return (
    <>
      <NoIndex />
      <AuthenticatedLayout
        user={{ id: user.id, email: user.email }}
        onSignOut={handleSignOut}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 md:py-8">
          {/* Back button */}
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Tableau de bord
          </button>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary to-primary text-white shadow-lg">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground">
                  Inspirez-vous pour écrire
                </h1>
                <p className="text-sm text-muted-foreground">
                  50 questions pour guider vos souvenirs
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-card border border-border">
              <Trophy className="h-5 w-5 text-amber-500" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">
                  {totalProgress.used} / {totalProgress.total} souvenirs
                </span>
                <Progress value={completionPercentage} className="h-1.5 w-24" />
              </div>
              {completionPercentage >= 100 && (
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                  <Star className="h-3 w-3 mr-1" />
                  Complet !
                </Badge>
              )}
            </div>
          </div>

          {/* Loading state */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-muted rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            /* Categories list */
            <div className="space-y-3">
              {memoryCategories.map((category, categoryIndex) => {
                const progress = getCategoryProgress(category);
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
                      className="w-full p-4 flex items-center gap-4 hover:bg-background/30 transition-colors group"
                    >
                      <div
                        className={cn(
                          'flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md flex-shrink-0',
                          category.gradient
                        )}
                      >
                        <span className="text-xl">{category.emoji}</span>
                      </div>

                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-foreground text-base">
                            {category.title}
                          </h3>
                          <span className="text-xs text-muted-foreground">{category.description}</span>
                          {isComplete && (
                            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                              <Check className="h-3 w-3 mr-1" />
                              Terminé
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Progress value={progress.percentage} className="h-2 flex-1 max-w-40" />
                          <span className="text-xs text-muted-foreground">
                            {progress.used}/{progress.total}
                          </span>
                        </div>
                      </div>

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
                                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors text-xs font-medium flex-shrink-0"
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
          )}
        </div>
      </AuthenticatedLayout>
    </>
  );
};

export default InspirationsPage;
