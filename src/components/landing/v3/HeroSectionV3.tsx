import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ArrowRight, Lock, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCallback, useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useGoogleAnalytics } from '@/hooks/useGoogleAnalytics';

import enfanceVideo from '@/assets/inspirations/enfance-video.mp4.asset.json';
import ecoleVideo from '@/assets/inspirations/ecole-video.mp4.asset.json';
import musiquesVideo from '@/assets/inspirations/musiques-video.mp4.asset.json';
import familleVideo from '@/assets/inspirations/famille-video.mp4.asset.json';
const vieVideo = { url: '/videos/vie-video.mp4' };

const SLIDE_KEYS = [
  { key: 'enfance', emoji: '🌱', video: enfanceVideo.url },
  { key: 'ecole', emoji: '🎓', video: ecoleVideo.url },
  { key: 'musiques', emoji: '🎵', video: musiquesVideo.url },
  { key: 'famille', emoji: '👨‍👩‍👧‍👦', video: familleVideo.url },
  { key: 'vie', emoji: '❤️', video: vieVideo.url },
];

const AUTOPLAY_INTERVAL = 5000;

const HeroSectionV3 = () => {
  const { t } = useTranslation('landing');
  const navigate = useNavigate();
  const { trackEvent } = useGoogleAnalytics();

  const handlePrimaryCta = useCallback(() => {
    trackEvent('hero_cta_click', 'conversion', 'signup_from_hero_v3');
    navigate('/signup');
  }, [navigate, trackEvent]);

  const handleSecondaryCta = useCallback(() => {
    trackEvent('hero_secondary_click', 'engagement', 'how_it_works');
    const el = document.getElementById('how-it-works');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, [trackEvent]);

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((p) => (p + 1) % SLIDE_KEYS.length);
  }, []);
  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((p) => (p - 1 + SLIDE_KEYS.length) % SLIDE_KEYS.length);
  }, []);
  const goTo = useCallback((i: number) => {
    setDirection(i > current ? 1 : -1);
    setCurrent(i);
  }, [current]);

  const touchStart = useRef<number | null>(null);
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  }, []);
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) next(); else prev();
    }
    touchStart.current = null;
  }, [next, prev]);

  useEffect(() => {
    const timer = setInterval(next, AUTOPLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [next]);

  const slide = SLIDE_KEYS[current];
  const textVariants = {
    enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[hsl(215_50%_18%)] via-[hsl(215_45%_22%)] to-[hsl(215_40%_28%)] pt-24 pb-16 sm:pt-32 sm:pb-24">
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 30%, hsl(var(--gold)) 0%, transparent 50%), radial-gradient(circle at 80% 70%, hsl(var(--primary)) 0%, transparent 50%)',
        }}
      />

      <div className="container mx-auto px-5 sm:px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/8 backdrop-blur-sm border border-white/15 text-white/85 text-xs sm:text-sm font-medium mb-6"
          >
            <Lock className="h-3.5 w-3.5 text-[hsl(var(--gold))]" />
            <span>{t('v3.hero.badge')}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white leading-[1.05] tracking-tight"
          >
            {t('v3.hero.title')}
            <br className="hidden sm:block" />
            <span className="text-[hsl(var(--gold))]"> {t('v3.hero.titleHighlight')}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-6 text-lg sm:text-xl text-white/75 leading-relaxed max-w-2xl mx-auto"
          >
            {t('v3.hero.subtitle')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Button
              size="lg"
              onClick={handlePrimaryCta}
              className="w-full sm:w-auto bg-[hsl(var(--gold))] hover:bg-[hsl(var(--gold))]/90 text-[hsl(215_50%_18%)] text-base sm:text-lg px-8 py-6 rounded-xl shadow-xl hover:shadow-2xl transition-all font-semibold group"
            >
              {t('v3.hero.ctaPrimary')}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="ghost"
              onClick={handleSecondaryCta}
              className="w-full sm:w-auto text-white hover:bg-white/10 hover:text-white text-base sm:text-lg px-6 py-6 rounded-xl font-medium"
            >
              {t('v3.hero.ctaSecondary')}
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-white/55 text-xs sm:text-sm"
          >
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-[hsl(var(--gold))]" />
              {t('v3.hero.trust1')}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-[hsl(var(--gold))]" />
              {t('v3.hero.trust2')}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-[hsl(var(--gold))]" />
              {t('v3.hero.trust3')}
            </span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-14 sm:mt-20 max-w-5xl mx-auto relative"
        >
          <div className="relative mx-auto rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[hsl(215_30%_15%)]">
            <div className="flex items-center gap-1.5 px-4 py-2.5 bg-[hsl(215_25%_12%)] border-b border-white/5">
              <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <span className="w-3 h-3 rounded-full bg-[#28ca42]" />
              <span className="ml-3 text-[10px] text-white/40 font-mono">familygarden.fr/dashboard</span>
            </div>
            <div
              className="relative aspect-[16/10] bg-black overflow-hidden"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <AnimatePresence mode="wait">
                <motion.video
                  key={current}
                  src={slide.video}
                  className="absolute inset-0 w-full h-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload={current === 0 ? 'auto' : 'metadata'}
                />
              </AnimatePresence>

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none" />

              <div className="absolute inset-0 flex items-end p-5 sm:p-8 pointer-events-none">
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
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/25 backdrop-blur-sm text-white text-sm sm:text-base font-semibold mb-3">
                      <span className="text-base sm:text-lg">{slide.emoji}</span>
                      {t(`v3.hero.slides.${slide.key}.label`)}
                    </span>
                    <p
                      className="font-display italic font-medium text-white leading-[1.1] tracking-tight max-w-3xl text-xl sm:text-2xl md:text-3xl lg:text-4xl relative"
                      style={{ textShadow: '0 4px 32px rgba(0,0,0,0.85), 0 2px 8px rgba(0,0,0,0.7)' }}
                    >
                      <span className="absolute -left-3 sm:-left-5 -top-3 sm:-top-5 text-[hsl(var(--gold))]/70 text-4xl sm:text-5xl md:text-6xl font-display not-italic leading-none select-none">"</span>
                      {t(`v3.hero.slides.${slide.key}.question`)}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              <button
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/15 hover:bg-white/30 text-white transition-colors backdrop-blur-sm"
                aria-label={t('v3.hero.slidePrev')}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/15 hover:bg-white/30 text-white transition-colors backdrop-blur-sm"
                aria-label={t('v3.hero.slideNext')}
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
                {SLIDE_KEYS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className={cn(
                      'h-1.5 rounded-full transition-all duration-300',
                      i === current ? 'w-6 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/70'
                    )}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="absolute -inset-x-10 -bottom-10 h-32 bg-[hsl(var(--gold))]/15 blur-3xl rounded-full -z-10" />
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSectionV3;
