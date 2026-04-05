import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { CloudOff, Timer, Eye, ArrowRight, Lock, Clock, FolderHeart } from 'lucide-react';

const PainPointsSection = () => {
  const { t } = useTranslation('landing');

  const pains = [
    {
      icon: CloudOff,
      title: t('v2.painPoints.items.scattered.title'),
      description: t('v2.painPoints.items.scattered.description'),
      color: 'text-red-400',
      bg: 'bg-red-500/10',
    },
    {
      icon: Timer,
      title: t('v2.painPoints.items.ephemeral.title'),
      description: t('v2.painPoints.items.ephemeral.description'),
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
    },
    {
      icon: Eye,
      title: t('v2.painPoints.items.public.title'),
      description: t('v2.painPoints.items.public.description'),
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
    },
  ];

  const solutions = [
    {
      icon: FolderHeart,
      title: t('v2.painPoints.vs.organized.title'),
      description: t('v2.painPoints.vs.organized.description'),
      color: 'text-[hsl(var(--sage-light))]',
      bg: 'bg-[hsl(var(--sage))]/10',
    },
    {
      icon: Clock,
      title: t('v2.painPoints.vs.durable.title'),
      description: t('v2.painPoints.vs.durable.description'),
      color: 'text-[hsl(var(--gold-light))]',
      bg: 'bg-[hsl(var(--gold))]/10',
    },
    {
      icon: Lock,
      title: t('v2.painPoints.vs.private.title'),
      description: t('v2.painPoints.vs.private.description'),
      color: 'text-[hsl(var(--terracotta-light))]',
      bg: 'bg-[hsl(var(--terracotta))]/10',
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-background">
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

        {/* Pain points */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {pains.map((pain, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl border border-destructive/20 bg-card"
            >
              <div className={`w-12 h-12 rounded-xl ${pain.bg} flex items-center justify-center mb-4`}>
                <pain.icon className={`h-6 w-6 ${pain.color}`} />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{pain.title}</h3>
              <p className="text-muted-foreground text-sm">{pain.description}</p>
            </motion.div>
          ))}
        </div>

        {/* VS divider */}
        <div className="flex items-center justify-center gap-4 my-12">
          <div className="h-px flex-1 bg-border" />
          <div className="flex items-center gap-2 px-6 py-2 rounded-full bg-primary/10 text-primary font-semibold">
            <ArrowRight className="h-4 w-4" />
            Family Garden
          </div>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Solutions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {solutions.map((sol, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl border border-[hsl(var(--sage))]/30 bg-card shadow-sm"
            >
              <div className={`w-12 h-12 rounded-xl ${sol.bg} flex items-center justify-center mb-4`}>
                <sol.icon className={`h-6 w-6 ${sol.color}`} />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{sol.title}</h3>
              <p className="text-muted-foreground text-sm">{sol.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PainPointsSection;
