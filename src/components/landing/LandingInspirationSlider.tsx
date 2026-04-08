import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { memoryCategories } from '@/lib/memoryCategories';

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

const AUTOPLAY_INTERVAL = 5000;

const LandingInspirationSlider = () => {
  const { t } = useTranslation('landing');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const slideCount = memoryCategories.length;

  const next = useCallback(() => {
    setDirection(1);
    setCurrentSlide(prev => (prev + 1) % slideCount);
  }, [slideCount]);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrentSlide(prev => (prev - 1 + slideCount) % slideCount);
  }, [slideCount]);

  const goTo = useCallback((index: number) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
  }, [currentSlide]);

  // Swipe
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
    const timer = setInterval(next, AUTOPLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [next]);

  const category = memoryCategories[currentSlide];
  const slideImage = SLIDE_IMAGES[category?.id] || enfanceImg;
  const slideQuestion = SLIDE_QUESTIONS[category?.id] || '';

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0 }),
  };

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section title */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            {t('inspiration.landingBadge')}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-foreground">
            {t('inspiration.landingTitle')}
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            {t('inspiration.landingSubtitle')}
          </p>
        </div>

        {/* Slider */}
        <div className="relative max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-xl group">
          <div
            className="relative h-72 sm:h-80 md:h-96"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
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
                  alt={category?.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/35 to-transparent" />
              </motion.div>
            </AnimatePresence>

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-12 z-10">
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
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs sm:text-sm font-medium mb-3 sm:mb-4">
                    <span>{category?.emoji}</span>
                    {category?.title}
                  </span>

                  <p className="text-white text-lg sm:text-2xl md:text-3xl font-display leading-snug mb-4 sm:mb-6 drop-shadow-lg max-w-[90%] sm:max-w-[85%]">
                    « {slideQuestion} »
                  </p>

                  <Link
                    to="/signup"
                    className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-white/90 hover:bg-white text-foreground text-sm sm:text-base font-semibold transition-all shadow-md hover:shadow-lg"
                  >
                    <Sparkles className="h-4 w-4 text-amber-500 flex-shrink-0" />
                    {t('inspiration.landingCta')}
                    <ChevronRight className="h-4 w-4 flex-shrink-0" />
                  </Link>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Nav arrows */}
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors sm:opacity-0 sm:group-hover:opacity-100"
              aria-label="Précédent"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors sm:opacity-0 sm:group-hover:opacity-100"
              aria-label="Suivant"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {memoryCategories.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={cn(
                    'h-2 rounded-full transition-all duration-300',
                    i === currentSlide ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/70'
                  )}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingInspirationSlider;
