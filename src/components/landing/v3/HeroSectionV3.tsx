import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ArrowRight, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { useGoogleAnalytics } from '@/hooks/useGoogleAnalytics';
import timelinePreview from '@/assets/mockups/timeline-preview.jpg';

const SLIDES = [
  {
    image: timelinePreview,
    title: 'Votre Chronologie familiale',
    description: 'Visualisez tous vos souvenirs organisés par décennies, comme un voyage dans le temps.',
  },
  {
    image: timelinePreview,
    title: 'Votre Arbre généalogique',
    description: 'Construisez et explorez votre arbre familial, retrouvez vos ancêtres et préservez votre histoire.',
  },
  {
    image: timelinePreview,
    title: 'Vos Souvenirs précieux',
    description: 'Photos, vidéos, audio et textes : rassemblez et partagez vos moments les plus chers en toute sécurité.',
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

          {/* Auto-rotating preview slider */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-12 sm:mt-16 max-w-5xl mx-auto relative"
          >
            <div className="absolute -inset-6 bg-gradient-to-br from-[hsl(var(--gold))]/20 to-white/5 rounded-3xl blur-3xl opacity-60" />

            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[hsl(215_50%_18%)] aspect-[1264/848]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0"
                >
                  <img
                    src={SLIDES[currentSlide].image}
                    alt={SLIDES[currentSlide].title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {/* Gradient overlay for text readability */}
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/85 via-black/50 to-transparent" />

                  {/* Title + description */}
                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8 md:p-10 text-left">
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-display font-semibold text-white drop-shadow-lg">
                      {SLIDES[currentSlide].title}
                    </h3>
                    <p className="mt-2 text-sm sm:text-base text-white/85 max-w-2xl drop-shadow">
                      {SLIDES[currentSlide].description}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Progress dots */}
              <div className="absolute top-4 right-4 sm:top-5 sm:right-5 flex gap-1.5 z-10">
                {SLIDES.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      i === currentSlide ? 'w-6 bg-[hsl(var(--gold))]' : 'w-1.5 bg-white/40'
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
