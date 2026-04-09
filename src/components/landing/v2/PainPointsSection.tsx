import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { CloudOff, Timer, Eye, ArrowRight, Lock, Clock, FolderHeart, Check, X } from 'lucide-react';

const PainPointsSection = () => {
  const { t } = useTranslation('landing');

  const pains = [
    { icon: CloudOff, key: 'scattered', color: 'text-red-400', bg: 'bg-red-500/10' },
    { icon: Timer, key: 'ephemeral', color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { icon: Eye, key: 'public', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  ];

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
          <span className="inline-block px-4 py-1.5 rounded-full bg-destructive/10 text-destructive text-sm font-medium mb-4">
            {t('v2.painPoints.badge')}
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            {t('v2.painPoints.title')}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('v2.painPoints.subtitle')}
          </p>
        </motion.div>

        {/* Pain points with X marks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {pains.map((pain, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative p-6 rounded-2xl border border-destructive/20 bg-card group hover:border-destructive/40 transition-colors"
            >
              <div className="absolute top-4 right-4">
                <X className="h-5 w-5 text-destructive/40" />
              </div>
              <div className={`w-12 h-12 rounded-xl ${pain.bg} flex items-center justify-center mb-4`}>
                <pain.icon className={`h-6 w-6 ${pain.color}`} />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {t(`v2.painPoints.items.${pain.key}.title`)}
              </h3>
              <p className="text-muted-foreground text-sm">
                {t(`v2.painPoints.items.${pain.key}.description`)}
              </p>
            </motion.div>
          ))}
        </div>

        {/* VS divider */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center my-14"
        >
          <h2 className="font-display text-2xl md:text-4xl font-bold text-foreground">
            Pourquoi <span className="text-secondary">Family Garden</span> est la solution idéale ?
          </h2>
        </motion.div>

        {/* Solutions with check marks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {solutions.map((sol, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative p-6 rounded-2xl border border-[hsl(var(--sage))]/30 bg-card shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="absolute top-4 right-4">
                <Check className="h-5 w-5 text-emerald-500" />
              </div>
              <div className={`w-12 h-12 rounded-xl ${sol.bg} flex items-center justify-center mb-4`}>
                <sol.icon className={`h-6 w-6 ${sol.color}`} />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {t(`v2.painPoints.vs.${sol.key}.title`)}
              </h3>
              <p className="text-muted-foreground text-sm">
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
