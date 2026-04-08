import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useRef, useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";

import heroBackground from "@/assets/hero-background.webp";
import heroEtudes from "@/assets/hero-slides/etudes.jpeg";
import heroVoyages from "@/assets/hero-slides/voyages.jpeg";
import heroAnniversaire from "@/assets/hero-slides/anniversaire.jpeg";
import heroMariage from "@/assets/hero-slides/mariage.jpeg";
import heroPlaylist from "@/assets/hero-slides/playlist.jpeg";

const heroSlides = [{
  src: heroBackground,
  mobilePosition: "center 30%",
  alt: "Famille réunie autour de souvenirs partagés sur Family Garden"
}, {
  src: heroMariage,
  mobilePosition: "center 25%",
  alt: "Souvenir de mariage préservé dans une capsule mémorielle Family Garden"
}, {
  src: heroAnniversaire,
  mobilePosition: "center 35%",
  alt: "Anniversaire en famille immortalisé sur Family Garden"
}, {
  src: heroVoyages,
  mobilePosition: "center 40%",
  alt: "Souvenirs de voyages en famille préservés sur Family Garden"
}, {
  src: heroEtudes,
  mobilePosition: "center 30%",
  alt: "Moments d'études et de vie scolaire capturés sur Family Garden"
}, {
  src: heroPlaylist,
  mobilePosition: "center 20%",
  alt: "Playlist musicale familiale partagée via Family Garden"
}];

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
  const { t } = useTranslation('landing');
  const sectionRef = useRef<HTMLElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image Slider */}
      <motion.div className="absolute inset-0 h-[130%] -top-[15%]" style={{ y: backgroundY, scale: backgroundScale }}>
        <AnimatePresence mode="wait">
          <motion.img
            key={currentSlide}
            src={heroSlides[currentSlide].src}
            alt={heroSlides[currentSlide].alt}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: isMobile ? heroSlides[currentSlide].mobilePosition : "center center" }}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/70 via-primary/50 to-primary/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-primary/25 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-secondary/15" />
      </motion.div>

      {/* Slide Indicators */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 hidden sm:flex gap-2">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-secondary w-8' : 'bg-primary-foreground/50 hover:bg-primary-foreground/70'}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Floating Elements */}
      <motion.div className="absolute inset-0 overflow-hidden pointer-events-none hidden sm:block" style={{ y: floatingElementsY }}>
        <motion.div animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-secondary/30 blur-2xl" />
        <motion.div animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full bg-accent/30 blur-2xl" />
      </motion.div>

      <motion.div className="container mx-auto px-5 sm:px-6 relative z-10 pt-24 pb-16 sm:pt-32 sm:pb-20" style={{ opacity: contentOpacity }}>
        <div className="max-w-4xl mx-auto text-center">
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
            className="mt-6 sm:mt-16 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-8 text-primary-foreground/80"
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

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{ duration: 2, delay: 1, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden sm:block"
      >
        <div className="w-6 h-10 rounded-full border-2 border-primary-foreground/30 flex items-start justify-center p-2">
          <div className="w-1 h-2 rounded-full bg-primary-foreground/50" />
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
