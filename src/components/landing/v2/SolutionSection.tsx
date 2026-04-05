import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Camera, BookOpen, Users, Download, TreeDeciduous, Mic } from 'lucide-react';

const SolutionSection = () => {
  const { t } = useTranslation('landing');

  const features = [
    { icon: Camera, key: 'multimedia' },
    { icon: BookOpen, key: 'timeline' },
    { icon: Users, key: 'circles' },
    { icon: Download, key: 'export' },
    { icon: TreeDeciduous, key: 'familyTree' },
    { icon: Mic, key: 'podcast' },
  ];

  return (
    <section className="py-20 md:py-28 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            {t('v2.solution.badge')}
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            {t('v2.solution.title')} <span className="text-primary">{t('v2.solution.titleHighlight')}</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('v2.solution.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, i) => (
            <motion.div
              key={feat.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <feat.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {t(`v2.solution.features.${feat.key}.title`)}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {t(`v2.solution.features.${feat.key}.description`)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
