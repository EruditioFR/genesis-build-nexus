import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';

import enfanceImg from '@/assets/inspirations/enfance.jpg';
import ecoleImg from '@/assets/inspirations/ecole.jpg';
import musiquesImg from '@/assets/inspirations/musiques.jpg';
import familleImg from '@/assets/inspirations/famille.jpg';
import vieImg from '@/assets/inspirations/vie.jpg';

const SLIDES = [
  { emoji: '🌱', label: 'Enfance', question: 'À quoi ressemblait la maison de votre enfance ?', image: enfanceImg },
  { emoji: '🎓', label: 'École', question: 'Un professeur vous a marqué. Pourquoi ?', image: ecoleImg },
  { emoji: '🎵', label: 'Musiques', question: 'Quelle chanson vous ramène instantanément en arrière ?', image: musiquesImg },
  { emoji: '👨‍👩‍👧‍👦', label: 'Famille', question: 'Quelle tradition aimeriez-vous transmettre ?', image: familleImg },
  { emoji: '❤️', label: 'Vie personnelle', question: 'Quel moment a changé le cours de votre vie ?', image: vieImg },
];

const AUTOPLAY_INTERVAL = 5000;

const HeroSectionV2 = () => {
  const { t } = useTranslation('landing');
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent(prev => (prev + 1) % SLIDES.length);
  }, []);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent(prev => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  const goTo = useCallback((i: number) => {
    setDirection(i > current ? 1 : -1);
    setCurrent(i);
  }, [current]);

  // Swipe support
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

  const slide = SLIDES[current];

  const imgVariants = {
    enter: { opacity: 0, scale: 1.05 },
    center: { opacity: 1, scale: 1 },
    exit: { opacity: 0 },
  };

  const textVariants = {
    enter: (d: number) => ({ x: d > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -80 : 80, opacity: 0 }),
  };

  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden group"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Full-screen background image slider */}
      <AnimatePresence mode="wait">
        <motion.img
          key={current}
          src={slide.image}
          alt={slide.label}
          className="absolute inset-0 w-full h-full object-cover"
          variants={imgVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
      </AnimatePresence>

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10" />

      {/* Content */}
      <div className="container mx-auto px-5 sm:px-6 relative z-10 pt-28 pb-20 sm:pt-36 sm:pb-24 flex flex-col items-center text-center">
        <div className="max-w-3xl bg-black/15 backdrop-blur-[2px] rounded-3xl p-8 sm:p-10">

          {/* Category pill + rotating question */}
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={current}
              custom={direction}
              variants={textVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            >
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/25 backdrop-blur-sm text-white text-xs sm:text-sm font-medium mb-4">
                <span>{slide.emoji}</span>
                {slide.label}
              </span>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white leading-tight mb-10" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
                {slide.question}
              </h1>
            </motion.div>
          </AnimatePresence>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-white/80 max-w-xl mx-auto mb-8 leading-relaxed"
            style={{ textShadow: '0 1px 8px rgba(0,0,0,0.4)' }}
          >
            {t('v2.hero.subtitle')}
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              size="lg"
              onClick={() => navigate('/signup')}
              className="bg-white/90 hover:bg-white text-foreground text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-xl shadow-xl hover:shadow-2xl transition-all font-semibold"
            >
              <Sparkles className="h-4 w-4 mr-2 text-amber-500" />
              {t('hero.cta.primary')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-10 sm:mt-14 flex flex-wrap gap-4 sm:gap-8 text-white/70 text-sm justify-center"
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>{t('v2.hero.trust.private')}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{t('v2.hero.trust.durable')}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{t('v2.hero.trust.family')}</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white/20 hover:bg-white/35 text-white transition-colors sm:opacity-0 sm:group-hover:opacity-100"
        aria-label="Précédent"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white/20 hover:bg-white/35 text-white transition-colors sm:opacity-0 sm:group-hover:opacity-100"
        aria-label="Suivant"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              i === current ? 'w-7 bg-white' : 'w-2 bg-white/50 hover:bg-white/70'
            )}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSectionV2;
