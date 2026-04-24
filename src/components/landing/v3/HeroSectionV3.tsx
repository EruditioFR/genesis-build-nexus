import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { useGoogleAnalytics } from '@/hooks/useGoogleAnalytics';
import timelinePreview from '@/assets/mockups/timeline-preview.jpg';
import heroFamilyMeadow from '@/assets/hero-family-meadow.jpg';
import organisezSouvenirs from '@/assets/mockups/organisez-souvenirs.png';
import interfaceClaire from '@/assets/mockups/interface-claire.png';
import arbreGenealogique from '@/assets/mockups/arbre-genealogique.jpg';

const SLIDES = [
  {
    image: organisezSouvenirs,
    title: 'Organisez vos souvenirs facilement',
    description: 'Un assistant pas à pas vous guide pour catégoriser, dater et préserver chaque souvenir avec soin.',
  },
  {
    image: interfaceClaire,
    title: 'Une interface claire et simple',
    description: 'Un tableau de bord conçu pour tous les âges : retrouvez vos souvenirs, votre famille et vos inspirations en un coup d\'œil.',
  },
  {
    image: arbreGenealogique,
    title: 'Votre Arbre généalogique',
    description: 'Construisez et explorez votre arbre familial, retrouvez vos ancêtres et préservez votre histoire.',
  },
  {
    image: timelinePreview,
    title: 'Votre Chronologie familiale',
    description: 'Visualisez tous vos souvenirs organisés par décennies, comme un voyage dans le temps.',
  },
];

const SLIDE_INTERVAL = 5000;

const HeroSectionV3 = () => {
  const { t } = useTranslation('landing');
  const navigate = useNavigate();
  const { trackEvent } = useGoogleAnalytics();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  const handlePrimaryCta = useCallback(() => {
    trackEvent('hero_cta_click', 'conversion', 'signup_from_hero_v3');
    navigate('/signup');
  }, [navigate, trackEvent]);

  const handleSecondaryCta = useCallback(() => {
    trackEvent('hero_secondary_click', 'engagement', 'how_it_works');
    const el = document.getElementById('how-it-works');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, [trackEvent]);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[hsl(215_50%_18%)] via-[hsl(215_45%_22%)] to-[hsl(215_40%_28%)] pt-24 pb-16 sm:pt-32 sm:pb-24">
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 30%, hsl(var(--gold)) 0%, transparent 50%), radial-gradient(circle at 80% 70%, hsl(var(--primary)) 0%, transparent 50%)',
        }}
      />

      <div className="container mx-auto px-5 sm:px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">

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

          {/* Auto-rotating preview slider */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-12 sm:mt-16 max-w-5xl mx-auto relative"
          >
            <div className="absolute -inset-6 bg-gradient-to-br from-[hsl(var(--gold))]/20 to-white/5 rounded-3xl blur-3xl opacity-60" />

            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[hsl(215_50%_18%)]">
              {/* Fixed-height image stage to prevent layout shift between slides */}
              <div className="relative w-full h-[260px] sm:h-[420px] md:h-[520px] lg:h-[600px] overflow-hidden">
                <AnimatePresence initial={false}>
                  <motion.img
                    key={currentSlide}
                    src={SLIDES[currentSlide].image}
                    alt={SLIDES[currentSlide].title}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.9, ease: 'easeInOut' }}
                    className="absolute inset-0 w-full h-full object-cover object-top"
                    loading="lazy"
                  />
                </AnimatePresence>

                {/* Gradient overlay for text readability — desktop only */}
                <div className="hidden sm:block absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/85 via-black/50 to-transparent pointer-events-none" />

                {/* Title + description overlay — desktop only (crossfade) */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`text-${currentSlide}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="hidden sm:block absolute inset-x-0 bottom-0 px-8 md:px-10 pt-5 pb-14 text-left"
                  >
                    <h3 className="text-2xl md:text-3xl font-display font-semibold text-white drop-shadow-lg leading-tight">
                      {SLIDES[currentSlide].title}
                    </h3>
                    <p className="mt-2 text-base text-white/85 max-w-2xl drop-shadow">
                      {SLIDES[currentSlide].description}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Mobile-only title + description below image */}
              <div className="sm:hidden px-4 pt-4 pb-10 text-left">
                <h3 className="text-base font-display font-semibold text-white leading-tight">
                  {SLIDES[currentSlide].title}
                </h3>
                <p className="mt-1.5 text-xs text-white/80">
                  {SLIDES[currentSlide].description}
                </p>
              </div>

              {/* Prev arrow — only over the image area on mobile */}
              <button
                type="button"
                onClick={() => setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)}
                aria-label="Slide précédent"
                className="absolute left-2 sm:left-4 top-[28%] sm:top-1/2 -translate-y-1/2 z-10 h-9 w-9 sm:h-11 sm:w-11 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>

              {/* Next arrow */}
              <button
                type="button"
                onClick={() => setCurrentSlide((prev) => (prev + 1) % SLIDES.length)}
                aria-label="Slide suivant"
                className="absolute right-2 sm:right-4 top-[28%] sm:top-1/2 -translate-y-1/2 z-10 h-9 w-9 sm:h-11 sm:w-11 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center transition-colors"
              >
                <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>

              {/* Pagination dots */}
              <div className="absolute inset-x-0 bottom-3 sm:bottom-4 z-10 flex items-center justify-center gap-2">
                {SLIDES.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentSlide(idx)}
                    aria-label={`Aller au slide ${idx + 1}`}
                    className={`h-2 rounded-full transition-all ${
                      idx === currentSlide
                        ? 'w-6 bg-[hsl(var(--gold))]'
                        : 'w-2 bg-white/40 hover:bg-white/60'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSectionV3;
