import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight, Sparkles, Pause } from "lucide-react";
import { Link } from "react-router-dom";
import { useRef, useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";

import heroBackground from "@/assets/hero-background.webp";
import heroEtudes from "@/assets/hero-slides/etudes.jpeg";
import heroVoyages from "@/assets/hero-slides/voyages.jpeg";
import heroAnniversaire from "@/assets/hero-slides/anniversaire.jpeg";
import heroMariage from "@/assets/hero-slides/mariage.jpeg";
import heroPlaylist from "@/assets/hero-slides/playlist.jpeg";

interface HeroSlide {
  src: string;
  mobilePosition: string;
  alt: string;
  emoji: string;
  theme: string;
  caption: string;
}

const heroSlides: HeroSlide[] = [
  {
    src: heroBackground,
    mobilePosition: "center 30%",
    alt: "Famille réunie autour de souvenirs partagés sur Family Garden",
    emoji: "👨‍👩‍👧‍👦",
    theme: "En famille",
    caption: "Un dimanche d'été, tous réunis",
  },
  {
    src: heroMariage,
    mobilePosition: "center 25%",
    alt: "Souvenir de mariage préservé dans une capsule mémorielle Family Garden",
    emoji: "💍",
    theme: "Mariage",
    caption: "Le « oui » de Claire & Thomas",
  },
  {
    src: heroAnniversaire,
    mobilePosition: "center 35%",
    alt: "Anniversaire en famille immortalisé sur Family Garden",
    emoji: "🎂",
    theme: "Anniversaire",
    caption: "Les 80 ans de Mamie Jeanne",
  },
  {
    src: heroVoyages,
    mobilePosition: "center 40%",
    alt: "Souvenirs de voyages en famille préservés sur Family Garden",
    emoji: "✈️",
    theme: "Voyage",
    caption: "Road trip en Toscane",
  },
  {
    src: heroEtudes,
    mobilePosition: "center 30%",
    alt: "Moments d'études et de vie scolaire capturés sur Family Garden",
    emoji: "🎓",
    theme: "Études",
    caption: "Remise de diplôme",
  },
  {
    src: heroPlaylist,
    mobilePosition: "center 20%",
    alt: "Playlist musicale familiale partagée via Family Garden",
    emoji: "🎵",
    theme: "Musique",
    caption: "La playlist de papa",
  },
];

const SLIDE_DURATION = 5500;

const INSPIRATION_QUESTIONS = [
  { emoji: '🌱', question: 'À quoi ressemblait la maison de votre enfance ?' },
  { emoji: '🎓', question: 'Un professeur vous a marqué. Pourquoi ?' },
  { emoji: '🎵', question: 'Quelle chanson vous ramène instantanément en arrière ?' },
  { emoji: '👨‍👩‍👧‍👦', question: 'Quelle tradition aimeriez-vous transmettre ?' },
  { emoji: '❤️', question: 'Quel moment a changé le cours de votre vie ?' },
];

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
};

const HeroSection = () => {
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();
  const { t } = useTranslation('landing');
  const sectionRef = useRef<HTMLElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });

  // Auto-advance slides (paused on hover)
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroSlides.length);
    }, SLIDE_DURATION);
    return () => clearInterval(interval);
  }, [isPaused]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuestion(prev => (prev + 1) % INSPIRATION_QUESTIONS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const backgroundScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const floatingElementsY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const q = INSPIRATION_QUESTIONS[currentQuestion];
  const activeSlide = heroSlides[currentSlide];

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Image Slider with Ken Burns effect */}
      <motion.div className="absolute inset-0 h-[130%] -top-[15%]" style={{ y: backgroundY, scale: backgroundScale }}>
        <AnimatePresence mode="wait">
          <motion.img
            key={currentSlide}
            src={activeSlide.src}
            alt={activeSlide.alt}
            className="absolute inset-0 w-full h-full object-cover will-change-transform"
            style={{ objectPosition: isMobile ? activeSlide.mobilePosition : "center center" }}
            initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 1.02 }}
            animate={
              prefersReducedMotion
                ? { opacity: 1, scale: 1 }
                : { opacity: 1, scale: 1.09 }
            }
            exit={{ opacity: 0 }}
            transition={
              prefersReducedMotion
                ? { duration: 0.6 }
                : {
                    opacity: { duration: 1, ease: "easeInOut" },
                    scale: { duration: SLIDE_DURATION / 1000 + 1, ease: "easeOut" },
                  }
            }
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/70 via-primary/50 to-primary/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-secondary/15" />
      </motion.div>

      {/* Floating Elements */}
      <motion.div className="absolute inset-0 overflow-hidden pointer-events-none hidden sm:block" style={{ y: floatingElementsY }}>
        <motion.div animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-secondary/30 blur-2xl" />
        <motion.div animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full bg-accent/30 blur-2xl" />
      </motion.div>

      <motion.div className="container mx-auto px-5 sm:px-6 relative z-10 pt-24 pb-32 sm:pt-32 sm:pb-40" style={{ opacity: contentOpacity }}>
        <div className="max-w-4xl mx-auto text-center">
          {/* Theme pill — incarnates the current slide */}
          <div className="flex justify-center mb-5 sm:mb-6 h-8" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-primary-foreground shadow-lg"
              >
                <span className="text-base leading-none" aria-hidden="true">{activeSlide.emoji}</span>
                <span className="text-xs sm:text-sm font-medium tracking-wide uppercase text-secondary">
                  {activeSlide.theme}
                </span>
                <span className="hidden sm:inline-block w-px h-3.5 bg-white/30" aria-hidden="true" />
                <span className="hidden sm:inline text-sm italic text-primary-foreground/90">
                  {activeSlide.caption}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold text-primary-foreground leading-[1.15] mb-5 sm:mb-6 drop-shadow-lg"
          >
            {t('hero.title')}
          </motion.h1>

          {/* Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-sm sm:text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto mb-6 sm:mb-8 leading-relaxed"
          >
            <p>{t('hero.subtitle')}</p>
          </motion.div>

          {/* Inspiration Question Rotator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mb-6 sm:mb-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-primary-foreground/70 text-xs sm:text-sm mb-3">
              <Sparkles className="h-3.5 w-3.5 text-secondary" />
              <span>{t('inspiration.heroBadge', '50 questions pour réveiller vos souvenirs')}</span>
            </div>
            <div className="relative h-12 sm:h-14 flex items-center justify-center overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentQuestion}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="absolute text-primary-foreground/90 text-base sm:text-xl md:text-2xl font-display italic drop-shadow-md px-4"
                >
                  <span className="mr-2">{q.emoji}</span>
                  « {q.question} »
                </motion.p>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
          >
            <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 17 }} className="w-full sm:w-auto">
              <Button asChild variant="hero" size="xl" className="group w-full min-h-[48px] sm:min-h-[56px] text-base sm:text-lg">
                <Link to="/signup">
                  {t('hero.cta.primary')}
                  <motion.span className="inline-flex" whileHover={{ x: 4 }} transition={{ type: "spring", stiffness: 400 }}>
                    <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" />
                  </motion.span>
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-6 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-8 text-primary-foreground/80"
          >
            <div className="flex items-center gap-2 sm:gap-3" title={t('hero.trust.encryption')}>
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-sm sm:text-base font-medium">{t('hero.trust.encryption')}</span>
            </div>
            <div className="hidden sm:flex items-center gap-3" title={t('hero.trust.gdpr')}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-base font-medium">{t('hero.trust.gdpr')}</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3" title={t('hero.trust.legacy')}>
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-sm sm:text-base font-medium">{t('hero.trust.legacy')}</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* === Slider Controls (bottom) === */}
      <div className="absolute bottom-6 sm:bottom-10 left-0 right-0 z-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          {/* Progress bar */}
          <div className="relative h-[2px] w-full bg-white/15 rounded-full overflow-hidden mb-4">
            <motion.div
              key={`${currentSlide}-${isPaused ? 'p' : 'r'}`}
              initial={{ width: '0%' }}
              animate={{ width: isPaused ? '100%' : '100%' }}
              transition={{
                duration: isPaused ? 0 : SLIDE_DURATION / 1000,
                ease: 'linear',
              }}
              className="absolute inset-y-0 left-0 bg-secondary shadow-[0_0_8px_hsl(var(--secondary)/0.6)]"
            />
          </div>

          {/* Thumbnails (desktop) + dots (mobile) */}
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            {/* Mobile: dots */}
            <div className="flex sm:hidden items-center gap-1.5">
              {heroSlides.map((slide, index) => (
                <button
                  key={`dot-${index}`}
                  onClick={() => goToSlide(index)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? 'bg-secondary w-6'
                      : 'bg-primary-foreground/40 w-1.5 hover:bg-primary-foreground/70'
                  }`}
                  aria-label={`Voir le souvenir : ${slide.theme}`}
                />
              ))}
            </div>

            {/* Desktop: thumbnails */}
            <div className="hidden sm:flex items-center gap-2.5">
              {heroSlides.map((slide, index) => {
                const isActive = index === currentSlide;
                return (
                  <button
                    key={`thumb-${index}`}
                    onClick={() => goToSlide(index)}
                    aria-label={`Voir le souvenir : ${slide.theme} — ${slide.caption}`}
                    className={`group relative overflow-hidden rounded-lg transition-all duration-300 ${
                      isActive
                        ? 'w-14 h-14 ring-2 ring-secondary ring-offset-2 ring-offset-transparent shadow-lg -translate-y-0.5'
                        : 'w-11 h-11 opacity-60 hover:opacity-100 hover:scale-105 ring-1 ring-white/30'
                    }`}
                  >
                    <img
                      src={slide.src}
                      alt=""
                      aria-hidden="true"
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                    {!isActive && (
                      <div className="absolute inset-0 bg-primary/30 group-hover:bg-primary/10 transition-colors" />
                    )}
                    <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center pb-0.5">
                      <span className="text-[11px] leading-none drop-shadow" aria-hidden="true">
                        {slide.emoji}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Pause indicator (desktop) */}
            <div
              className={`hidden sm:flex ml-2 items-center gap-1.5 text-[11px] uppercase tracking-wider text-primary-foreground/60 transition-opacity duration-300 ${
                isPaused ? 'opacity-100' : 'opacity-0'
              }`}
              aria-hidden="true"
            >
              <Pause className="w-3 h-3 fill-current" />
              <span>Pause</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
