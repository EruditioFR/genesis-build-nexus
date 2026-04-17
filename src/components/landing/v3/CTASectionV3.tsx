import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShieldCheck, Lock, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ctaImage from '@/assets/cta-family-moment.jpg';

const CTASectionV3 = () => {
  const { t } = useTranslation('landing');
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={ctaImage}
          alt=""
          loading="lazy"
          width={1920}
          height={1080}
          className="w-full h-full object-cover"
        />
        {/* Dark overlay with gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--navy))]/95 via-[hsl(var(--navy))]/85 to-[hsl(var(--navy))]/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--navy))] via-transparent to-transparent" />
      </div>

      {/* Decorative gold blob */}
      <div className="absolute top-1/4 right-10 w-96 h-96 bg-[hsl(var(--gold))]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 relative z-10 py-20 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl"
        >
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--gold))]/15 border border-[hsl(var(--gold))]/30 backdrop-blur-sm mb-8"
          >
            <Heart className="h-4 w-4 text-[hsl(var(--gold-light))] fill-[hsl(var(--gold-light))]" />
            <span className="text-sm font-medium text-[hsl(var(--gold-light))] tracking-wide">
              {t('v2.ctaFinal.trust').split('•')[0].trim()}
            </span>
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="font-display text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-6 leading-[1.05] tracking-tight"
          >
            {t('v2.ctaFinal.title')}{' '}
            {t('v2.ctaFinal.titleMiddle')}{' '}
            <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--gold-light))] via-[hsl(var(--gold))] to-[hsl(var(--terracotta-light))]">
              {t('v2.ctaFinal.titleHighlight')}.
            </span>
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-white/80 text-lg sm:text-xl mb-10 max-w-xl leading-relaxed whitespace-pre-line"
          >
            {t('v2.ctaFinal.subtitle')}
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-6"
          >
            <Button
              size="lg"
              onClick={() => navigate('/signup')}
              className="group relative bg-gradient-to-r from-[hsl(var(--gold))] to-[hsl(var(--terracotta))] hover:from-[hsl(var(--gold-light))] hover:to-[hsl(var(--terracotta-light))] text-[hsl(var(--navy))] font-semibold text-base sm:text-lg px-8 py-7 rounded-xl shadow-[0_20px_60px_-15px_hsl(var(--gold)/0.6)] hover:shadow-[0_25px_70px_-15px_hsl(var(--gold)/0.8)] transition-all duration-300 hover:-translate-y-0.5"
            >
              {t('v2.ctaFinal.button')}
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>

            {/* Trust line inline */}
            <div className="flex flex-wrap items-center gap-4 text-white/60 text-sm">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[hsl(var(--gold-light))]" />
                <span>RGPD</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-white/30" />
              <div className="flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-[hsl(var(--gold-light))]" />
                <span>100% privé</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-white/30" />
              <span>Sans carte bancaire</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASectionV3;
