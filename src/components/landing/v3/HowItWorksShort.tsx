import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Upload, CalendarDays, UsersRound } from 'lucide-react';

const STEP_ICONS = [Upload, CalendarDays, UsersRound] as const;

const HowItWorksShort = () => {
  const { t } = useTranslation('landing');

  return (
    <section className="relative bg-[hsl(35_30%_97%)] py-12 sm:py-16 border-y border-[hsl(220_15%_90%)]">
      <div className="container mx-auto px-5 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5 }}
            className="text-center text-xl sm:text-2xl md:text-3xl font-display font-bold text-[hsl(215_50%_18%)] leading-tight mb-8 sm:mb-10"
          >
            {t('v3.howItWorksShort.title')}
            <span className="text-[hsl(var(--gold))]"> {t('v3.howItWorksShort.titleHighlight')}</span>
          </motion.h2>

          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
            {STEP_ICONS.map((Icon, idx) => {
              const key = `s${idx + 1}` as const;
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                  className="relative rounded-2xl bg-white border border-[hsl(220_15%_90%)] p-5 sm:p-6 shadow-sm"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--gold))]/10 text-[hsl(var(--gold))]">
                      <Icon className="h-5 w-5" strokeWidth={2} />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t(`v3.howItWorksShort.steps.${key}.label`)}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-[hsl(215_50%_18%)] mb-1.5 leading-snug">
                    {t(`v3.howItWorksShort.steps.${key}.title`)}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t(`v3.howItWorksShort.steps.${key}.description`)}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksShort;
