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

interface DashboardInspirationWidgetProps {
  className?: string;
}

const DashboardInspirationWidget = ({ className }: DashboardInspirationWidgetProps) => {
  const { usedPromptIds, loading, memoryCategories, getCategoryProgress, getTotalProgress, getUnusedPrompts } = useMemoryPrompts();
  const [open, setOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const totalProgress = getTotalProgress();

  if (loading) return null;

  return (
    <>
      {/* Floating bubble CTA */}
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setOpen(true)}
        className={cn(
          'w-full p-4 rounded-2xl border-2 border-dashed border-secondary/40 bg-gradient-to-r from-secondary/5 to-primary/5',
          'hover:border-secondary/70 hover:from-secondary/10 hover:to-primary/10',
          'transition-all cursor-pointer group text-left',
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-secondary to-primary text-white shadow-md flex-shrink-0">
            <Lightbulb className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground group-hover:text-secondary transition-colors">
              En manque d'inspiration pour un souvenir ?
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              50 questions pour guider vos souvenirs · {totalProgress.used} répondu{totalProgress.used > 1 ? 's' : ''}
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-secondary transition-colors flex-shrink-0" />
        </div>
      </motion.button>

      {/* Dialog with categories & questions */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto p-0 gap-0">
          <DialogHeader className="p-5 pb-3 sticky top-0 bg-background z-10 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-secondary to-primary text-white shadow-md">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-lg font-display">Inspirez-vous</DialogTitle>
                <DialogDescription className="text-xs">
                  Choisissez une question et commencez à écrire
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted text-xs">
                <Trophy className="h-3.5 w-3.5 text-amber-500" />
                <span className="font-medium">{totalProgress.used}/{totalProgress.total}</span>
              </div>
            </div>
          </DialogHeader>

          <div className="p-3 space-y-2">
            {memoryCategories.map((category) => {
              const progress = getCategoryProgress(category);
              const isExpanded = expandedCategory === category.id;
              const isComplete = progress.used === progress.total;

              return (
                <div
                  key={category.id}
                  className={cn(
                    'rounded-xl border overflow-hidden transition-all',
                    isComplete ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20' : 'border-border hover:border-secondary/30'
                  )}
                >
                  <button
                    onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                    className="w-full p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-xl flex-shrink-0">{category.emoji}</span>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">{category.title}</span>
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
                                className="flex items-center gap-2.5 p-2.5 rounded-lg bg-background border border-border/50 hover:border-secondary/50 hover:bg-secondary/5 transition-all group"
                              >
                                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-muted text-[10px] font-medium text-muted-foreground flex-shrink-0">
                                  {index + 1}
                                </span>
                                <p className="text-xs text-foreground flex-1 leading-snug">{prompt.question}</p>
                                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-secondary flex-shrink-0 transition-colors" />
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
