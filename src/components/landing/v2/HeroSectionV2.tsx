import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShieldCheck, Cloud, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const HeroSectionV2 = () => {
  const { t } = useTranslation('landing');
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-[hsl(var(--navy))] via-[hsl(220,30%,15%)] to-[hsl(var(--navy))]">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-2 rounded-full bg-white/10 text-white/80 text-sm font-medium mb-8 backdrop-blur-sm border border-white/10">
              {t('v2.hero.badge')}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6"
          >
            {t('v2.hero.title')}
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--gold-light))] to-[hsl(var(--terracotta-light))]">
              {t('v2.hero.titleHighlight')}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            {t('v2.hero.subtitle')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Button
              size="lg"
              onClick={() => navigate('/signup')}
              className="bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--terracotta))] hover:opacity-90 text-white text-lg px-8 py-6 rounded-xl shadow-2xl shadow-accent/30"
            >
              {t('v2.hero.cta')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-wrap justify-center gap-6 md:gap-10 text-white/60 text-sm"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[hsl(var(--sage-light))]" />
              <span>{t('v2.hero.trust.private')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Cloud className="h-4 w-4 text-[hsl(var(--gold-light))]" />
              <span>{t('v2.hero.trust.durable')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-[hsl(var(--terracotta-light))]" />
              <span>{t('v2.hero.trust.family')}</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSectionV2;
