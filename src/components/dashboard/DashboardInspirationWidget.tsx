import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ChevronRight,
  ChevronDown,
  Check,
  Trophy,
  Lightbulb,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMemoryPrompts } from '@/hooks/useMemoryPrompts';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

const DashboardInspirationWidget = () => {
  const { usedPromptIds, loading, memoryCategories, getCategoryProgress, getTotalProgress } = useMemoryPrompts();
  const [open, setOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const totalProgress = getTotalProgress();

  if (loading || dismissed) return null;

  return (
    <>
      {/* Sticky banner - warm & joyful */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-30 -mx-4 sm:-mx-6 md:-mx-8 mb-5"
      >
        <button
          onClick={() => setOpen(true)}
          className={cn(
            'w-full px-4 sm:px-6 py-3 flex items-center justify-center gap-3',
            'bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400',
            'hover:from-amber-500 hover:via-orange-500 hover:to-rose-500',
            'transition-all cursor-pointer group',
            'shadow-md shadow-orange-200/50 dark:shadow-orange-900/30'
          )}
        >
          <span className="text-lg animate-bounce">💡</span>
          <span className="text-sm sm:text-base font-bold text-white drop-shadow-sm">
            En panne d'inspiration pour écrire un souvenir ?
          </span>
          <span className="text-xs sm:text-sm font-medium text-white/80 hidden sm:inline">
            — Découvrez nos 50 idées !
          </span>
          <ChevronRight className="h-4 w-4 text-white/80 group-hover:translate-x-0.5 transition-transform" />
        </button>
        {/* Dismiss button */}
        <button
          onClick={(e) => { e.stopPropagation(); setDismissed(true); }}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/20 transition-colors"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>
      </motion.div>

      {/* Dialog with categories & questions */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-0 gap-0">
          <DialogHeader className="p-5 pb-3 sticky top-0 bg-background z-10 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-lg font-display">Inspirez-vous ✨</DialogTitle>
                <DialogDescription className="text-xs">
                  Choisissez une question et commencez à écrire
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-xs">
                <Trophy className="h-3.5 w-3.5 text-amber-500" />
                <span className="font-medium text-amber-700 dark:text-amber-300">{totalProgress.used}/{totalProgress.total}</span>
              </div>
            </div>
          </DialogHeader>

          <div className="p-4 space-y-3">
            {memoryCategories.map((category) => {
              const progress = getCategoryProgress(category);
              const isExpanded = expandedCategory === category.id;
              const isComplete = progress.used === progress.total;

              return (
                <div
                  key={category.id}
                  className={cn(
                    'rounded-xl border overflow-hidden transition-all',
                    isComplete ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20' : 'border-border hover:border-orange-300 dark:hover:border-orange-700'
                  )}
                >
                  <button
                    onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                    className="w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-2xl flex-shrink-0">{category.emoji}</span>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-semibold text-foreground">{category.title}</span>
                        {isComplete && (
                          <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-[10px] px-1.5 py-0">
                            <Check className="h-2.5 w-2.5 mr-0.5" />
                            Fait
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={progress.percentage} className="h-1.5 flex-1 max-w-28" />
                        <span className="text-[10px] text-muted-foreground">{progress.used}/{progress.total}</span>
                      </div>
                    </div>
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 text-muted-foreground transition-transform duration-200 flex-shrink-0',
                        isExpanded && 'rotate-180'
                      )}
                    />
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 pb-3 space-y-1.5">
                          {category.prompts.map((prompt, index) => {
                            const isUsed = usedPromptIds.has(prompt.id);

                            return isUsed ? (
                              <div
                                key={prompt.id}
                                className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/30 opacity-50"
                              >
                                <Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                                <p className="text-xs text-muted-foreground line-through flex-1">{prompt.question}</p>
                              </div>
                            ) : (
                              <Link
                                key={prompt.id}
                                to={`/capsules/new?prompt=${encodeURIComponent(prompt.question)}&promptId=${prompt.id}&category=${category.id}`}
                                onClick={() => setOpen(false)}
                                className="flex items-center gap-2.5 p-2.5 rounded-lg bg-background border border-border/50 hover:border-orange-300 dark:hover:border-orange-700 hover:bg-orange-50/50 dark:hover:bg-orange-950/20 transition-all group"
                              >
                                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-muted text-[10px] font-medium text-muted-foreground flex-shrink-0">
                                  {index + 1}
                                </span>
                                <p className="text-xs text-foreground flex-1 leading-snug">{prompt.question}</p>
                                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-orange-500 flex-shrink-0 transition-colors" />
                              </Link>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DashboardInspirationWidget;
