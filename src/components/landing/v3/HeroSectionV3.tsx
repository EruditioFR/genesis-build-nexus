import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, LayoutGrid, TreePine, Clock, FolderHeart, Pause } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { useGoogleAnalytics } from '@/hooks/useGoogleAnalytics';
import timelinePreview from '@/assets/mockups/timeline-preview.jpg';
import organisezSouvenirs from '@/assets/mockups/organisez-souvenirs.png';
import interfaceClaire from '@/assets/mockups/interface-claire.png';
import arbreGenealogique from '@/assets/mockups/arbre-genealogique.jpg';

const SLIDES = [
  {
    image: organisezSouvenirs,
    title: 'Organisez vos souvenirs facilement',
    description: 'Un assistant pas à pas vous guide pour catégoriser, dater et préserver chaque souvenir avec soin.',
    icon: FolderHeart,
    label: 'Organisation',
  },
  {
    image: interfaceClaire,
    title: 'Une interface claire et simple',
    description: 'Un tableau de bord conçu pour tous les âges : retrouvez vos souvenirs, votre famille et vos inspirations en un coup d\'œil.',
    icon: LayoutGrid,
    label: 'Tableau de bord',
  },
  {
    image: arbreGenealogique,
    title: 'Votre Arbre généalogique',
    description: 'Construisez et explorez votre arbre familial, retrouvez vos ancêtres et préservez votre histoire.',
    icon: TreePine,
    label: 'Arbre généalogique',
  },
  {
    image: timelinePreview,
    title: 'Votre Chronologie familiale',
    description: 'Visualisez tous vos souvenirs organisés par décennies, comme un voyage dans le temps.',
    icon: Clock,
    label: 'Chronologie',
  },
];

const SLIDE_INTERVAL = 5500;

const HeroSectionV3 = () => {
  const { t } = useTranslation('landing');
  const navigate = useNavigate();
  const { trackEvent } = useGoogleAnalytics();
  const prefersReducedMotion = useReducedMotion();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [isPaused]);

  const handlePrimaryCta = useCallback(() => {
    trackEvent('hero_cta_click', 'conversion', 'signup_from_hero_v3');
    navigate('/signup');
  }, [navigate, trackEvent]);

  const handleSecondaryCta = useCallback(() => {
    trackEvent('hero_secondary_click', 'engagement', 'how_it_works');
    const el = document.getElementById('how-it-works');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, [trackEvent]);

  const goNext = useCallback(() => setCurrentSlide((p) => (p + 1) % SLIDES.length), []);
  const goPrev = useCallback(() => setCurrentSlide((p) => (p - 1 + SLIDES.length) % SLIDES.length), []);

  const active = SLIDES[currentSlide];
  const Icon = active.icon;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[hsl(215_50%_18%)] via-[hsl(215_45%_22%)] to-[hsl(215_40%_28%)] pt-24 pb-16 sm:pt-32 sm:pb-24">
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 30%, hsl(var(--gold)) 0%, transparent 50%), radial-gradient(circle at 80% 70%, hsl(var(--primary)) 0%, transparent 50%)',
        }}
      />

      <div className="container mx-auto px-5 sm:px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mt-6 sm:mt-0 text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white leading-[1.1] sm:leading-[1.05] tracking-tight"
          >
            {t('v3.hero.title')}
            <br />
            <span className="text-[hsl(var(--gold))]">{t('v3.hero.titleHighlight')}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-6 text-lg sm:text-xl text-white/75 leading-relaxed max-w-2xl mx-auto"
          >
            {t('v3.hero.subtitleLead')}
            <span className="text-[hsl(var(--gold))] font-medium">{t('v3.hero.subtitleHighlight')}</span>
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
              className="w-full sm:w-auto bg-[hsl(var(--gold))] hover:bg-[hsl(var(--gold))]/90 text-white text-base sm:text-lg px-8 py-6 rounded-xl shadow-xl hover:shadow-2xl transition-all font-semibold group"
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
            className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-white text-xs sm:text-sm"
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

          {/* === Premium Preview Slider === */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-14 sm:mt-20 max-w-5xl mx-auto relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Dynamic glow halo */}
            <motion.div
              animate={
                prefersReducedMotion
                  ? {}
                  : { opacity: [0.5, 0.75, 0.5], scale: [1, 1.04, 1] }
              }
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -inset-8 sm:-inset-12 bg-[radial-gradient(ellipse_at_center,hsl(var(--gold)/0.35),transparent_60%)] blur-3xl pointer-events-none"
              aria-hidden="true"
            />

            {/* Animated gradient border wrapper */}
            <div className="relative rounded-2xl p-[1.5px] bg-gradient-to-br from-[hsl(var(--gold))]/60 via-white/10 to-[hsl(var(--gold))]/30 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]">
              <div className="relative rounded-[14px] overflow-hidden bg-[hsl(215_50%_14%)]">

                {/* Window chrome — compact on mobile, full on desktop */}
                <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 bg-[hsl(215_55%_12%)] border-b border-white/5">
                  <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
                    <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#ff5f57]" />
                    <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#febc2e]" />
                    <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#28c840]" />
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-white/50 font-mono truncate px-2 min-w-0">
                    <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-[hsl(var(--gold))] flex-shrink-0" />
                    <span className="truncate">app.familygarden.fr</span>
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-white/40 tabular-nums flex-shrink-0">
                    {String(currentSlide + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
                  </div>
                </div>

                {/* Image stage */}
                <div className="relative w-full h-[220px] sm:h-[420px] md:h-[520px] lg:h-[600px] overflow-hidden">
                  <AnimatePresence initial={false}>
                    <motion.img
                      key={currentSlide}
                      src={active.image}
                      alt={active.title}
                      initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 1.04 }}
                      animate={{ opacity: 1, scale: prefersReducedMotion ? 1 : 1.08 }}
                      exit={{ opacity: 0 }}
                      transition={
                        prefersReducedMotion
                          ? { duration: 0.6 }
                          : {
                              opacity: { duration: 0.9, ease: 'easeInOut' },
                              scale: { duration: SLIDE_INTERVAL / 1000 + 1.5, ease: 'easeOut' },
                            }
                      }
                      className="absolute inset-0 w-full h-full object-cover object-top will-change-transform"
                      loading="lazy"
                    />
                  </AnimatePresence>

                  {/* Section label badge — desktop only (mobile has dedicated label below) */}
                  <div className="hidden sm:block absolute top-4 left-4 z-10">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`badge-${currentSlide}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.4 }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/55 backdrop-blur-md border border-[hsl(var(--gold))]/30 text-white text-xs font-medium shadow-lg"
                      >
                        <Icon className="h-3.5 w-3.5 text-[hsl(var(--gold))]" />
                        <span className="uppercase tracking-wider">{active.label}</span>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Pause indicator — desktop only */}
                  <AnimatePresence>
                    {isPaused && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="hidden sm:flex absolute top-4 right-4 z-10 items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/55 backdrop-blur-md border border-white/15 text-white/80 text-[11px] uppercase tracking-wider"
                      >
                        <Pause className="w-3 h-3 fill-current" />
                        Pause
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Gradient overlay for text readability — desktop */}
                  <div className="hidden sm:block absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/55 to-transparent pointer-events-none" />

                  {/* Title + description overlay — desktop */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`text-${currentSlide}`}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className="hidden sm:block absolute inset-x-0 bottom-0 px-8 md:px-10 pt-5 pb-16 text-left"
                    >
                      <h3 className="text-2xl md:text-3xl font-display font-semibold text-white drop-shadow-lg leading-tight">
                        {active.title}
                      </h3>
                      <p className="mt-2 text-base text-white/85 max-w-2xl drop-shadow">
                        {active.description}
                      </p>
                    </motion.div>
                  </AnimatePresence>

                  {/* Prev arrow — vertically centered on the image */}
                  <button
                    type="button"
                    onClick={goPrev}
                    aria-label="Slide précédent"
                    className="absolute left-1.5 sm:left-4 top-1/2 -translate-y-1/2 z-10 h-8 w-8 sm:h-11 sm:w-11 rounded-full bg-black/55 hover:bg-[hsl(var(--gold))] hover:scale-110 backdrop-blur-md border border-white/15 text-white flex items-center justify-center transition-all duration-200 shadow-lg"
                  >
                    <ChevronLeft className="h-4 w-4 sm:h-6 sm:w-6" />
                  </button>

                  {/* Next arrow */}
                  <button
                    type="button"
                    onClick={goNext}
                    aria-label="Slide suivant"
                    className="absolute right-1.5 sm:right-4 top-1/2 -translate-y-1/2 z-10 h-8 w-8 sm:h-11 sm:w-11 rounded-full bg-black/55 hover:bg-[hsl(var(--gold))] hover:scale-110 backdrop-blur-md border border-white/15 text-white flex items-center justify-center transition-all duration-200 shadow-lg"
                  >
                    <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6" />
                  </button>

                  {/* Desktop bottom controls (overlay on image) */}
                  <div className="hidden sm:block absolute inset-x-0 bottom-0 z-10 px-5 pb-4">
                    {/* Progress bar */}
                    <div className="relative h-[2px] w-full bg-white/15 rounded-full overflow-hidden mb-3">
                      <motion.div
                        key={`progress-d-${currentSlide}-${isPaused ? 'p' : 'r'}`}
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{
                          duration: isPaused ? 0 : SLIDE_INTERVAL / 1000,
                          ease: 'linear',
                        }}
                        className="absolute inset-y-0 left-0 bg-[hsl(var(--gold))] shadow-[0_0_10px_hsl(var(--gold)/0.7)]"
                      />
                    </div>

                    <div className="flex items-center justify-center gap-2">
                      {SLIDES.map((s, idx) => {
                        const isActive = idx === currentSlide;
                        const ThumbIcon = s.icon;
                        return (
                          <button
                            key={`thumb-${idx}`}
                            type="button"
                            onClick={() => setCurrentSlide(idx)}
                            aria-label={`Aperçu : ${s.label}`}
                            className={`group relative flex items-center gap-2 overflow-hidden rounded-lg border transition-all duration-300 ${
                              isActive
                                ? 'h-11 px-3 bg-[hsl(var(--gold))]/15 border-[hsl(var(--gold))] shadow-[0_0_20px_hsl(var(--gold)/0.4)]'
                                : 'h-9 px-2.5 bg-black/35 border-white/15 hover:border-white/40 hover:bg-black/50 opacity-70 hover:opacity-100'
                            }`}
                          >
                            <ThumbIcon
                              className={`h-3.5 w-3.5 flex-shrink-0 transition-colors ${
                                isActive ? 'text-[hsl(var(--gold))]' : 'text-white/70 group-hover:text-white'
                              }`}
                            />
                            <span
                              className={`text-[11px] font-medium whitespace-nowrap transition-colors ${
                                isActive ? 'text-white' : 'text-white/70 group-hover:text-white'
                              }`}
                            >
                              {s.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Mobile: text + controls below image (no overlay) */}
                <div className="sm:hidden px-4 py-4 bg-[hsl(215_55%_12%)] border-t border-white/5">
                  {/* Progress bar */}
                  <div className="relative h-[2px] w-full bg-white/15 rounded-full overflow-hidden mb-3">
                    <motion.div
                      key={`progress-m-${currentSlide}-${isPaused ? 'p' : 'r'}`}
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{
                        duration: isPaused ? 0 : SLIDE_INTERVAL / 1000,
                        ease: 'linear',
                      }}
                      className="absolute inset-y-0 left-0 bg-[hsl(var(--gold))] shadow-[0_0_10px_hsl(var(--gold)/0.7)]"
                    />
                  </div>

                  {/* Label + title + description */}
                  <div className="text-left mb-3">
                    <div className="inline-flex items-center gap-1.5 mb-1.5 text-[hsl(var(--gold))] text-[10px] font-semibold uppercase tracking-wider">
                      <Icon className="h-3 w-3" />
                      {active.label}
                    </div>
                    <h3 className="text-base font-display font-semibold text-white leading-snug">
                      {active.title}
                    </h3>
                    <p className="mt-1 text-[13px] text-white/75 leading-relaxed">
                      {active.description}
                    </p>
                  </div>

                  {/* Mobile thumbnails — horizontal scroll, icon + label */}
                  <div className="-mx-1 overflow-x-auto scrollbar-none">
                    <div className="flex items-center gap-1.5 px-1 pb-0.5">
                      {SLIDES.map((s, idx) => {
                        const isActive = idx === currentSlide;
                        const ThumbIcon = s.icon;
                        return (
                          <button
                            key={`mthumb-${idx}`}
                            type="button"
                            onClick={() => setCurrentSlide(idx)}
                            aria-label={`Aperçu : ${s.label}`}
                            className={`flex-shrink-0 inline-flex items-center gap-1.5 h-8 px-2.5 rounded-full border text-[11px] font-medium whitespace-nowrap transition-all duration-300 ${
                              isActive
                                ? 'bg-[hsl(var(--gold))]/15 border-[hsl(var(--gold))] text-white shadow-[0_0_12px_hsl(var(--gold)/0.4)]'
                                : 'bg-black/30 border-white/15 text-white/65 active:bg-black/50'
                            }`}
                          >
                            <ThumbIcon
                              className={`h-3 w-3 flex-shrink-0 ${
                                isActive ? 'text-[hsl(var(--gold))]' : 'text-white/55'
                              }`}
                            />
                            <span>{s.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSectionV3;
