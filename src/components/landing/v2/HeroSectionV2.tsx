import { useTranslation, Trans } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';

import enfanceVideo from '@/assets/inspirations/enfance-video.mp4.asset.json';
import ecoleVideo from '@/assets/inspirations/ecole-video.mp4.asset.json';
import musiquesVideo from '@/assets/inspirations/musiques-video.mp4.asset.json';
import familleVideo from '@/assets/inspirations/famille-video.mp4.asset.json';
const vieVideo = { url: '/videos/vie-video.mp4' };

const SLIDES = [
  { emoji: '🌱', label: 'Enfance', question: 'À quoi ressemblait la maison de votre enfance ?', video: enfanceVideo.url },
  { emoji: '🎓', label: 'École', question: 'Un professeur vous a marqué. Pourquoi ?', video: ecoleVideo.url },
  { emoji: '🎵', label: 'Musiques', question: 'Quelle chanson vous ramène instantanément en arrière ?', video: musiquesVideo.url },
  { emoji: '👨‍👩‍👧‍👦', label: 'Famille', question: 'Quelle tradition aimeriez-vous transmettre ?', video: familleVideo.url },
  { emoji: '❤️', label: 'Vie personnelle', question: 'Quel moment a changé le cours de votre vie ?', video: vieVideo.url },
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
    enter: { opacity: 0 },
    center: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const textVariants = {
    enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <>
      {/* ── Punchline block ── */}
      <section className="bg-[#1a1a2e] pt-24 sm:pt-32 pb-8 sm:pb-12 text-center">
        <div className="container mx-auto px-5 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="max-w-3xl mx-auto"
          >
            <h1
              className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white leading-tight mt-5"
            >
              <Trans
                i18nKey="v2.hero.subtitle"
                ns="landing"
                components={{ gold: <span className="text-secondary" />, br: <br /> }}
              />
            </h1>
            <p
              className="text-sm sm:text-base md:text-lg text-white/70 mt-2 sm:mt-3 leading-snug font-medium"
            >
              {t('v2.hero.subtitle2')}<br />{t('v2.hero.subtitle3')}
            </p>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-6 sm:mt-8 flex justify-center"
          >
            <Button
              size="lg"
              onClick={() => navigate('/signup')}
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-xl shadow-xl hover:shadow-2xl transition-all font-semibold"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {t('hero.cta.primary')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-6 sm:mt-10 flex flex-wrap gap-3 sm:gap-8 text-white/50 text-xs sm:text-sm justify-center"
          >
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>{t('v2.hero.trust.private')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{t('v2.hero.trust.durable')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{t('v2.hero.trust.family')}</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Image slider block ── */}
      <section
        className="relative h-[50vh] sm:h-[60vh] md:h-[65vh] overflow-hidden group"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Background image */}
        <AnimatePresence mode="wait">
          <motion.video
            key={current}
            src={slide.video}
            className="absolute inset-0 w-full h-full object-cover"
            variants={imgVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            autoPlay
            muted
            loop
            playsInline
          />
        </AnimatePresence>

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/25 to-black/10 sm:from-black/25 sm:via-black/10 sm:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />

        {/* Category pill + rotating question */}
        <div className="absolute inset-0 flex items-center justify-center z-10 px-5 sm:px-6">
          <div className="max-w-3xl w-full text-center">
            <div className="min-h-[120px] sm:min-h-[140px] md:min-h-[160px] lg:min-h-[180px] flex flex-col justify-center">
              <AnimatePresence custom={direction} mode="wait">
                <motion.div
                  key={current}
                  custom={direction}
                  variants={textVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/25 backdrop-blur-sm text-white text-xs sm:text-sm font-medium mb-3 sm:mb-4">
                    <span>{slide.emoji}</span>
                    {slide.label}
                  </span>

                  <p
                    className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white leading-tight"
                    style={{ textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}
                  >
                    {slide.question}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Navigation arrows — hidden on mobile */}
        <button
          onClick={prev}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white/20 hover:bg-white/35 text-white transition-colors hidden sm:block sm:opacity-0 sm:group-hover:opacity-100"
          aria-label="Précédent"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={next}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white/20 hover:bg-white/35 text-white transition-colors hidden sm:block sm:opacity-0 sm:group-hover:opacity-100"
          aria-label="Suivant"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Dots — hidden on mobile */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 hidden sm:flex gap-2">
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
    </>
  );
};

export default HeroSectionV2;
