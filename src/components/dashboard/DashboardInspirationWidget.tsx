import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Check,
  Trophy,
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

import enfanceImg from '@/assets/inspirations/enfance.jpg';
import ecoleImg from '@/assets/inspirations/ecole.jpg';
import musiquesImg from '@/assets/inspirations/musiques.jpg';
import familleImg from '@/assets/inspirations/famille.jpg';
import vieImg from '@/assets/inspirations/vie.jpg';

const SLIDE_IMAGES: Record<string, string> = {
  enfance: enfanceImg,
  ecole: ecoleImg,
  musiques: musiquesImg,
  famille: familleImg,
  'vie-personnelle': vieImg,
};

const SLIDE_QUESTIONS: Record<string, string> = {
  enfance: 'À quoi ressemblait la maison de votre enfance ?',
  ecole: 'Un professeur vous a marqué. Pourquoi ?',
  musiques: 'Quelle chanson vous ramène instantanément en arrière ?',
  famille: 'Quelle tradition aimeriez-vous transmettre ?',
  'vie-personnelle': 'Quel moment a changé le cours de votre vie ?',
};

const AUTOPLAY_INTERVAL = 6000;

const DashboardInspirationWidget = () => {
  const { usedPromptIds, loading, memoryCategories, getCategoryProgress, getTotalProgress } = useMemoryPrompts();
  const [open, setOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);

  const totalProgress = getTotalProgress();
  const slideCount = memoryCategories.length;

  const goTo = useCallback((index: number, dir?: number) => {
    setDirection(dir ?? (index > currentSlide ? 1 : -1));
    setCurrentSlide(index);
  }, [currentSlide]);

  const next = useCallback(() => {
    setDirection(1);
    setCurrentSlide(prev => (prev + 1) % slideCount);
  }, [slideCount]);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrentSlide(prev => (prev - 1 + slideCount) % slideCount);
  }, [slideCount]);

  // Swipe handling
  const touchStart = useRef<number | null>(null);
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  }, []);
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) { next(); } else { prev(); }
    }
    touchStart.current = null;
  }, [next, prev]);

  // Autoplay
  useEffect(() => {
    if (dismissed || open) return;
    const timer = setInterval(next, AUTOPLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [dismissed, open, next]);

  if (loading || dismissed) return null;

  const currentCategory = memoryCategories[currentSlide];
  const slideImage = SLIDE_IMAGES[currentCategory?.id] || enfanceImg;
  const slideQuestion = SLIDE_QUESTIONS[currentCategory?.id] || '';

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0 }),
  };

  return (
    <>
      {/* Slider banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-6 rounded-2xl overflow-hidden shadow-lg group"
      >
        {/* Background image with overlay */}
        <div className="relative h-48 sm:h-48 md:h-52" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={currentSlide}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="absolute inset-0"
            >
              <img
                src={slideImage}
                alt={currentCategory?.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/55 to-black/20" />
            </motion.div>
          </AnimatePresence>

          {/* Content overlay */}
          <div className="absolute inset-0 flex flex-col justify-center px-4 sm:px-10 z-10">
            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={currentSlide}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: 'easeInOut', delay: 0.1 }}
                className="max-w-lg"
              >
                {/* Category badge */}
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-[11px] sm:text-xs font-medium mb-2 sm:mb-3">
                  <span>{currentCategory?.emoji}</span>
                  {currentCategory?.title}
                </span>

                {/* Question */}
                <p className="text-white text-base sm:text-xl md:text-2xl font-display leading-snug mb-3 sm:mb-4 drop-shadow-md max-w-[85%] sm:max-w-[80%]">
                  « {slideQuestion} »
                </p>

                {/* CTA */}
                <button
                  onClick={() => setOpen(true)}
                  className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-white/90 hover:bg-white text-foreground text-xs sm:text-sm font-semibold transition-all shadow-md hover:shadow-lg"
                >
                  <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500 flex-shrink-0" />
                  <span className="sm:hidden">Nos 50 questions</span>
                  <span className="hidden sm:inline">Laissez-vous guider par nos 50 questions</span>
                  <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                </button>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation arrows - always visible on mobile via touch */}
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-1.5 sm:left-2 top-1/2 -translate-y-1/2 z-20 p-1.5 sm:p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors sm:opacity-0 sm:group-hover:opacity-100"
            aria-label="Précédent"
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 z-20 p-1.5 sm:p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors sm:opacity-0 sm:group-hover:opacity-100"
            aria-label="Suivant"
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 sm:gap-2">
            {memoryCategories.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); goTo(i); }}
                className={cn(
                  'h-1.5 sm:h-2 rounded-full transition-all duration-300',
                  i === currentSlide ? 'w-5 sm:w-6 bg-white' : 'w-1.5 sm:w-2 bg-white/50 hover:bg-white/70'
                )}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>

          {/* Dismiss */}
          <button
            onClick={(e) => { e.stopPropagation(); setDismissed(true); }}
            className="absolute top-2 right-2 sm:top-3 sm:right-3 z-20 p-1 sm:p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-white/70 hover:text-white transition-colors sm:opacity-0 sm:group-hover:opacity-100"
            aria-label="Fermer"
          >
            <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
        </div>
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
                         <Progress value={progress.percentage} className="h-2 flex-1 max-w-32" />
                         <span className="text-xs text-muted-foreground">{progress.used}/{progress.total}</span>
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
                         <div className="px-4 pb-4 space-y-2">
                           {category.prompts.map((prompt, index) => {
                             const isUsed = usedPromptIds.has(prompt.id);

                             return isUsed ? (
                               <div
                                 key={prompt.id}
                                 className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 opacity-50"
                               >
                                 <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                                 <p className="text-sm text-muted-foreground line-through flex-1">{prompt.question}</p>
                               </div>
                             ) : (
                               <Link
                                 key={prompt.id}
                                 to={`/capsules/new?prompt=${encodeURIComponent(prompt.question)}&promptId=${prompt.id}&category=${category.id}`}
                                 onClick={() => setOpen(false)}
                                 className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border/50 hover:border-orange-300 dark:hover:border-orange-700 hover:bg-orange-50/50 dark:hover:bg-orange-950/20 transition-all group"
                               >
                                 <span className="flex h-7 w-7 items-center justify-center rounded-md bg-muted text-xs font-medium text-muted-foreground flex-shrink-0">
                                   {index + 1}
                                 </span>
                                 <p className="text-sm text-foreground flex-1 leading-relaxed">{prompt.question}</p>
                                 <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-orange-500 flex-shrink-0 transition-colors" />
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
