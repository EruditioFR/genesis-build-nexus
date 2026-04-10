import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Lock, Clock, FolderHeart, Check } from 'lucide-react';

  const solutions = [
    { icon: FolderHeart, key: 'organized', color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
    { icon: Clock, key: 'durable', color: 'text-[hsl(var(--gold-light))]', bg: 'bg-[hsl(var(--gold))]/15' },
    { icon: Lock, key: 'private', color: 'text-sky-400', bg: 'bg-sky-500/15' },
  ];

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-background to-muted/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            {t('v2.painPoints.title')}{' '}
            <span className="text-[hsl(var(--gold))]">{t('v2.painPoints.titleHighlight')}</span>
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto whitespace-pre-line">
            {t('v2.painPoints.subtitle')}
          </p>
        </motion.div>


        {/* VS divider */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center my-14"
        >
          <h2 className="font-display text-2xl md:text-4xl font-bold text-foreground">
            Avec <span className="text-secondary">Family Garden</span>, tout devient simple
          </h2>
        </motion.div>

        {/* Solutions with check marks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {solutions.map((sol, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative p-4 rounded-xl border border-[hsl(var(--sage))]/30 bg-card shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="absolute top-3 right-3">
                <Check className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-9 h-9 rounded-lg ${sol.bg} flex items-center justify-center shrink-0`}>
                  <sol.icon className={`h-4 w-4 ${sol.color}`} />
                </div>
                <h3 className="text-base font-semibold text-foreground">
                  {t(`v2.painPoints.vs.${sol.key}.title`)}
                </h3>
              </div>
              <p className="text-muted-foreground text-sm leading-snug">
                {t(`v2.painPoints.vs.${sol.key}.description`)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PainPointsSection;
