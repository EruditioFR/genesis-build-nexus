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

const SLIDES = [
  { emoji: '🌱', label: 'Enfance', question: 'À quoi ressemblait la maison de votre enfance ?', video: enfanceVideo.url },
  { emoji: '🎓', label: 'École', question: 'Un professeur vous a marqué. Pourquoi ?', video: ecoleVideo.url },
  { emoji: '🎵', label: 'Musiques', question: 'Quelle chanson vous ramène instantanément en arrière ?', video: musiquesVideo.url },
  { emoji: '👨‍👩‍👧‍👦', label: 'Famille', question: 'Quelle tradition aimeriez-vous transmettre ?', video: familleVideo.url },
  { emoji: '❤️', label: 'Vie personnelle', question: 'Quel moment a changé le cours de votre vie ?', video: vieVideo.url },
];

const AUTOPLAY_INTERVAL = 5000;

/**
 * HeroSectionV3 — Hero de conversion
 *
 * Structure :
 *  ┌──────────────────────────────────────────────┐
 *  │  [Badge "Espace privé"]                      │
 *  │  Titre fort (2 lignes max)                   │
 *  │  Sous-titre court (1 phrase)                 │
 *  │  [CTA Primaire]  [CTA Secondaire]            │
 *  │  Micro-réassurance (3 puces inline)          │
 *  │                                              │
 *  │  ┌────────── Mockup laptop ────────────┐    │
 *  │  │                                       │    │
 *  │  │   (capture dashboard sera ici)        │    │
 *  │  │                                       │    │
 *  │  └───────────────────────────────────────┘    │
 *  │      ┌─── mockup mobile ───┐                  │
 *  │      │ (capture mobile)    │                  │
 *  │      └─────────────────────┘                  │
 *  └──────────────────────────────────────────────┘
 *
 * Les mockups sont des placeholders — remplacer les <img src=""> par les
 * captures réelles dès que l'utilisateur les fournit.
 */
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

  // Slider de vidéos d'inspiration
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((p) => (p + 1) % SLIDES.length);
  }, []);
  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((p) => (p - 1 + SLIDES.length) % SLIDES.length);
  }, []);
  const goTo = useCallback((i: number) => {
    setDirection(i > current ? 1 : -1);
    setCurrent(i);
  }, [current]);

  // Swipe
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

  // Autoplay
  useEffect(() => {
    const timer = setInterval(next, AUTOPLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [next]);

  const slide = SLIDES[current];
  const textVariants = {
    enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[hsl(215_50%_18%)] via-[hsl(215_45%_22%)] to-[hsl(215_40%_28%)] pt-24 pb-16 sm:pt-32 sm:pb-24">
      {/* Subtle decorative background */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 30%, hsl(var(--gold)) 0%, transparent 50%), radial-gradient(circle at 80% 70%, hsl(var(--primary)) 0%, transparent 50%)',
        }}
      />

      <div className="container mx-auto px-5 sm:px-6 relative z-10">
        {/* ── Texte hero ── */}
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/8 backdrop-blur-sm border border-white/15 text-white/85 text-xs sm:text-sm font-medium mb-6"
          >
            <Lock className="h-3.5 w-3.5 text-[hsl(var(--gold))]" />
            <span>Espace privé pour votre famille</span>
          </motion.div>

          {/* Titre */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white leading-[1.05] tracking-tight"
          >
            Protégez les souvenirs
            <br className="hidden sm:block" />
            <span className="text-[hsl(var(--gold))]"> de votre famille</span>
          </motion.h1>

          {/* Sous-titre */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-6 text-lg sm:text-xl text-white/75 leading-relaxed max-w-2xl mx-auto"
          >
            Family Garden réunit photos, vidéos, voix et récits dans un journal de famille
            privé, organisé, durable, transmissible.
          </motion.p>

          {/* CTAs */}
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
              Créer mon espace gratuit
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="ghost"
              onClick={handleSecondaryCta}
              className="w-full sm:w-auto text-white hover:bg-white/10 hover:text-white text-base sm:text-lg px-6 py-6 rounded-xl font-medium"
            >
              Voir comment ça marche
            </Button>
          </motion.div>

          {/* Micro-réassurance */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-white/55 text-xs sm:text-sm"
          >
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-[hsl(var(--gold))]" />
              Gratuit, sans carte bancaire
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-[hsl(var(--gold))]" />
              Hébergement européen RGPD
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-[hsl(var(--gold))]" />
              0 publicité
            </span>
          </motion.div>
        </div>

        {/* ── Mockups produit ── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-14 sm:mt-20 max-w-5xl mx-auto relative"
        >
          {/* Mockup laptop (placeholder) */}
          <div className="relative mx-auto rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[hsl(215_30%_15%)]">
            {/* Faux barre macOS */}
            <div className="flex items-center gap-1.5 px-4 py-2.5 bg-[hsl(215_25%_12%)] border-b border-white/5">
              <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <span className="w-3 h-3 rounded-full bg-[#28ca42]" />
              <span className="ml-3 text-[10px] text-white/40 font-mono">familygarden.fr/dashboard</span>
            </div>
            {/* Slider de vidéos d'inspiration */}
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

              {/* Overlay dégradé */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none" />

              {/* Question + label */}
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
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-medium mb-2">
                      <span>{slide.emoji}</span>
                      {slide.label}
                    </span>
                    <p
                      className="text-lg sm:text-2xl md:text-3xl font-display font-semibold text-white leading-tight max-w-2xl"
                      style={{ textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}
                    >
                      « {slide.question} »
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Flèches nav */}
              <button
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/15 hover:bg-white/30 text-white transition-colors backdrop-blur-sm"
                aria-label="Précédent"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/15 hover:bg-white/30 text-white transition-colors backdrop-blur-sm"
                aria-label="Suivant"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              {/* Dots */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
                {SLIDES.map((_, i) => (
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

          {/* Lueur dorée derrière */}
          <div className="absolute -inset-x-10 -bottom-10 h-32 bg-[hsl(var(--gold))]/15 blur-3xl rounded-full -z-10" />
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSectionV3;
