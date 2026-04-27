import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, LayoutGrid, TreePine, Clock, FolderHeart, Pause, Maximize2, X, ZoomIn, ZoomOut, Expand } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { useGoogleAnalytics } from '@/hooks/useGoogleAnalytics';
import timelinePreview from '@/assets/mockups/timeline-preview.jpg';
import organisezSouvenirs from '@/assets/mockups/organisez-souvenirs.png';
import interfaceClaire from '@/assets/mockups/interface-claire.png';
import arbreGenealogique from '@/assets/mockups/arbre-genealogique.jpg';

const SLIDES = [
  { image: organisezSouvenirs, icon: FolderHeart, key: 'organisation' },
  { image: interfaceClaire, icon: LayoutGrid, key: 'dashboard' },
  { image: arbreGenealogique, icon: TreePine, key: 'tree' },
  { image: timelinePreview, icon: Clock, key: 'timeline' },
] as const;

const SLIDE_INTERVAL = 5500;

const HeroSectionV3 = () => {
  const { t } = useTranslation('landing');
  const navigate = useNavigate();
  const { trackEvent } = useGoogleAnalytics();
  const prefersReducedMotion = useReducedMotion();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxZoom, setLightboxZoom] = useState(1);
  const lightboxRef = useState<{ el: HTMLDivElement | null }>(() => ({ el: null }))[0];

  const openLightbox = useCallback(() => {
    setLightboxZoom(1);
    setIsLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false);
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  const toggleNativeFullscreen = useCallback(() => {
    const el = lightboxRef.el;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      el.requestFullscreen?.().catch(() => {});
    }
  }, [lightboxRef]);

  useEffect(() => {
    if (!isLightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === '+' || e.key === '=') setLightboxZoom((z) => Math.min(z + 0.5, 5));
      if (e.key === '-') setLightboxZoom((z) => Math.max(z - 0.5, 1));
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isLightboxOpen, closeLightbox]);

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


  const active = SLIDES[currentSlide];
  const Icon = active.icon;
  const activeLabel = t(`v3.hero.productSlider.${active.key}.label`);
  const activeTitle = t(`v3.hero.productSlider.${active.key}.title`);
  const activeDescription = t(`v3.hero.productSlider.${active.key}.description`);

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
                  <div className="flex-1" />
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
                      alt={activeTitle}
                      initial={{ opacity: 0, scale: prefersReducedMotion ? (isMobile ? 1.5 : 1) : (isMobile ? 1.5 : 1.04) }}
                      animate={{ opacity: 1, scale: prefersReducedMotion ? (isMobile ? 1.5 : 1) : (isMobile ? 1.58 : 1.08) }}
                      exit={{ opacity: 0 }}
                      transition={
                        prefersReducedMotion
                          ? { duration: 0.6 }
                          : {
                              opacity: { duration: 0.9, ease: 'easeInOut' },
                              scale: { duration: SLIDE_INTERVAL / 1000 + 1.5, ease: 'easeOut' },
                            }
                      }
                      style={{ transformOrigin: isMobile ? 'top center' : 'center' }}
                      className="absolute inset-0 w-full h-full object-cover object-top will-change-transform"
                      loading="lazy"
                    />
                  </AnimatePresence>

                  {/* Mobile: bouton agrandir */}
                  <button
                    type="button"
                    onClick={openLightbox}
                    aria-label="Agrandir l'image"
                    className="sm:hidden absolute bottom-2 right-2 z-20 h-9 w-9 rounded-full bg-black/65 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-lg active:scale-95 transition"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </button>

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
                        <span className="uppercase tracking-wider">{activeLabel}</span>
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
                        {activeTitle}
                      </h3>
                      <p className="mt-2 text-base text-white/85 max-w-2xl drop-shadow">
                        {activeDescription}
                      </p>
                    </motion.div>
                  </AnimatePresence>

                </div>

                {/* Mobile: text only below image (no controls) */}
                <div className="sm:hidden px-4 py-4 bg-[hsl(215_55%_12%)] border-t border-white/5">
                  <div className="text-left">
                    <div className="inline-flex items-center gap-1.5 mb-1.5 text-[hsl(var(--gold))] text-[10px] font-semibold uppercase tracking-wider">
                      <Icon className="h-3 w-3" />
                      {activeLabel}
                    </div>
                    <h3 className="text-base font-display font-semibold text-white leading-snug">
                      {activeTitle}
                    </h3>
                    <p className="mt-1 text-[13px] text-white/75 leading-relaxed">
                      {activeDescription}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      {/* Lightbox plein écran avec contrôles de zoom */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            ref={(el) => { lightboxRef.el = el; }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center"
            onClick={closeLightbox}
            role="dialog"
            aria-modal="true"
            aria-label="Aperçu agrandi"
          >
            {/* Top bar : titre + actions */}
            <div
              className="absolute top-0 inset-x-0 z-10 flex items-center justify-between gap-2 px-3 sm:px-5 py-3 bg-gradient-to-b from-black/70 to-transparent"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 text-white/90 text-xs sm:text-sm min-w-0">
                <Icon className="h-4 w-4 text-[hsl(var(--gold))] flex-shrink-0" />
                <span className="font-medium truncate">{activeLabel}</span>
                <span className="text-white/50 tabular-nums flex-shrink-0">
                  {String(currentSlide + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
                </span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setLightboxZoom((z) => Math.max(z - 0.5, 1))}
                  aria-label="Zoom arrière"
                  disabled={lightboxZoom <= 1}
                  className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed border border-white/20 text-white flex items-center justify-center transition"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <span className="text-white/80 text-xs tabular-nums w-10 text-center">
                  {Math.round(lightboxZoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setLightboxZoom((z) => Math.min(z + 0.5, 5))}
                  aria-label="Zoom avant"
                  disabled={lightboxZoom >= 5}
                  className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed border border-white/20 text-white flex items-center justify-center transition"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={toggleNativeFullscreen}
                  aria-label="Mode plein écran"
                  className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition"
                >
                  <Expand className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={closeLightbox}
                  aria-label="Fermer"
                  className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Image scrollable quand zoomée */}
            <div
              className="absolute inset-0 overflow-auto flex items-center justify-center p-4 pt-16"
              onClick={closeLightbox}
            >
              <motion.img
                key={`lb-${currentSlide}`}
                src={active.image}
                alt={activeTitle}
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.96, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                style={{
                  transform: `scale(${lightboxZoom})`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.2s ease-out',
                }}
                className="max-h-[88vh] max-w-[95vw] w-auto h-auto object-contain rounded-lg shadow-2xl select-none"
                onClick={(e) => e.stopPropagation()}
                draggable={false}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default HeroSectionV3;
