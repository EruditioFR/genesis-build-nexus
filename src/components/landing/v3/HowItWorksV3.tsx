import { motion } from 'framer-motion';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  CloudOff,
  FolderHeart,
  Users,
  ImageOff,
  MessageSquareOff,
  HardDrive,
  Sparkles,
  Heart,
  Lock,
} from 'lucide-react';
import { useGoogleAnalytics } from '@/hooks/useGoogleAnalytics';

const STEP_DEFS = [
  {
    num: '01',
    key: 's1',
    beforeIcons: [MessageSquareOff, CloudOff, HardDrive, ImageOff],
    afterIcon: FolderHeart,
  },
  {
    num: '02',
    key: 's2',
    beforeIcons: [ImageOff, CloudOff, MessageSquareOff],
    afterIcon: Sparkles,
  },
  {
    num: '03',
    key: 's3',
    beforeIcons: [HardDrive, CloudOff, MessageSquareOff],
    afterIcon: Heart,
  },
];

const HowItWorksV3 = () => {
  const { t } = useTranslation('landing');
  const navigate = useNavigate();
  const { trackEvent } = useGoogleAnalytics();

  const handleCta = useCallback(() => {
    trackEvent('howitworks_cta_click', 'conversion', 'signup_from_howitworks_v3');
    navigate('/signup');
  }, [navigate, trackEvent]);

  return (
    <section
      id="how-it-works"
      className="relative py-20 sm:py-28 bg-gradient-to-b from-[hsl(35_30%_97%)] via-background to-[hsl(35_30%_97%)]"
    >
      <div className="container mx-auto px-5 sm:px-6">
        <div className="max-w-3xl mx-auto text-center mb-16 sm:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[hsl(var(--gold))]/10 border border-[hsl(var(--gold))]/30 text-[hsl(215_50%_18%)] text-xs sm:text-sm font-medium mb-5"
          >
            <Lock className="h-3.5 w-3.5 text-[hsl(var(--gold))]" />
            <span>{t('v3.howItWorks.badge')}</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-[hsl(215_50%_18%)] leading-[1.1] tracking-tight"
          >
            {t('v3.howItWorks.title')}
            <br className="hidden sm:block" />
            <span className="text-[hsl(var(--gold))]"> {t('v3.howItWorks.titleHighlight')}</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto"
          >
            {t('v3.howItWorks.subtitle')}
          </motion.p>
        </div>

        <div className="space-y-20 sm:space-y-28 max-w-6xl mx-auto">
          {STEP_DEFS.map((step, idx) => {
            const reversed = idx % 2 === 1;
            const AfterIcon = step.afterIcon;
            const beforeItems = t(`v3.howItWorks.steps.${step.key}.beforeItems`, { returnObjects: true }) as string[];
            const afterPoints = t(`v3.howItWorks.steps.${step.key}.afterPoints`, { returnObjects: true }) as string[];
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.7 }}
                className={`grid md:grid-cols-2 gap-8 md:gap-14 items-center ${
                  reversed ? 'md:[&>*:first-child]:order-2' : ''
                }`}
              >
                <div className="relative">
                  <div className="relative rounded-2xl bg-[hsl(220_15%_94%)] border border-[hsl(220_10%_85%)] p-6 sm:p-8 overflow-hidden">
                    <div className="absolute top-4 right-4 text-[10px] uppercase tracking-widest text-[hsl(220_10%_55%)] font-semibold">
                      {t('v3.howItWorks.before')}
                    </div>

                    <h3 className="text-base sm:text-lg font-semibold text-[hsl(220_15%_30%)] mb-5 pr-16">
                      {t(`v3.howItWorks.steps.${step.key}.beforeTitle`)}
                    </h3>

                    <ul className="space-y-3">
                      {(Array.isArray(beforeItems) ? beforeItems : []).map((label, i) => {
                        const Icon = step.beforeIcons[i] ?? MessageSquareOff;
                        return (
                          <li
                            key={i}
                            className="flex items-start gap-3 text-sm text-[hsl(220_10%_45%)]"
                          >
                            <Icon className="h-4 w-4 mt-0.5 shrink-0 text-[hsl(220_10%_55%)]" />
                            <span>{label}</span>
                          </li>
                        );
                      })}
                    </ul>

                    <div
                      className="absolute inset-x-0 bottom-0 h-12 pointer-events-none"
                      style={{
                        background:
                          'repeating-linear-gradient(45deg, transparent, transparent 6px, hsl(220 10% 88%) 6px, hsl(220 10% 88%) 7px)',
                        opacity: 0.5,
                      }}
                    />
                  </div>
                </div>

                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-5xl sm:text-6xl font-display font-bold text-[hsl(var(--gold))]/30 leading-none">
                      {step.num}
                    </span>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[hsl(var(--gold))]/10 border border-[hsl(var(--gold))]/30">
                      <AfterIcon className="h-3.5 w-3.5 text-[hsl(var(--gold))]" />
                      <span className="text-[10px] uppercase tracking-widest text-[hsl(215_50%_18%)] font-semibold">
                        {t('v3.howItWorks.after')}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-display font-bold text-[hsl(215_50%_18%)] leading-tight mb-4">
                    {t(`v3.howItWorks.steps.${step.key}.afterTitle`)}
                  </h3>

                  <p className="text-base text-muted-foreground leading-relaxed mb-5">
                    {t(`v3.howItWorks.steps.${step.key}.afterDescription`)}
                  </p>

                  <ul className="space-y-2.5">
                    {(Array.isArray(afterPoints) ? afterPoints : []).map((point, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 text-sm sm:text-base text-[hsl(215_50%_18%)]"
                      >
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[hsl(var(--gold))] shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mt-20 sm:mt-28 text-center"
        >
          <p className="text-base sm:text-lg text-muted-foreground mb-5 max-w-xl mx-auto">
            {t('v3.howItWorks.ctaText')}
          </p>
          <Button
            size="lg"
            onClick={handleCta}
            className="bg-[hsl(var(--gold))] hover:bg-[hsl(var(--gold))]/90 text-[hsl(215_50%_18%)] text-base sm:text-lg px-8 py-6 rounded-xl shadow-xl hover:shadow-2xl transition-all font-semibold group"
          >
            {t('v3.howItWorks.cta')}
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <p className="mt-3 text-xs text-muted-foreground/80">
            {t('v3.howItWorks.ctaTrust')}
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksV3;
