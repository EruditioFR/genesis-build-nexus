import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ArrowRight, Lock, Shield, Heart, Volume2, VolumeX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCallback, useState, useRef } from 'react';
import { useGoogleAnalytics } from '@/hooks/useGoogleAnalytics';

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
            {/* Vidéo tuto */}
            <div className="aspect-[16/10] bg-black">
              <iframe
                src="https://www.youtube.com/embed/afoWU3vDcOg?rel=0&modestbranding=1"
                title="Tutoriel Family Garden"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>

          {/* Mockup mobile (placeholder) — superposé en bas à droite */}
          <div className="hidden md:block absolute -bottom-10 -right-4 w-[180px] rounded-[28px] overflow-hidden shadow-2xl border-[6px] border-[hsl(215_25%_12%)] bg-[hsl(215_25%_12%)]">
            {/* PLACEHOLDER — remplacer par <img src="/screenshots/souvenir-mobile-fr.png" /> */}
            <div className="aspect-[9/19] flex items-center justify-center bg-gradient-to-br from-[hsl(35_20%_92%)] to-[hsl(35_15%_82%)] text-[hsl(215_50%_18%)]/40 text-[10px] font-medium text-center px-2">
              [ Capture mobile<br />souvenir ]
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
