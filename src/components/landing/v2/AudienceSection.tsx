import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Baby, Users, Heart } from 'lucide-react';

const AudienceSection = () => {
  const { t } = useTranslation('landing');

  const profiles = [
    { icon: Baby, key: 'parents', gradient: 'from-[hsl(var(--terracotta-light))]/20 to-[hsl(var(--accent))]/10' },
    { icon: Users, key: 'families', gradient: 'from-[hsl(var(--gold-light))]/20 to-[hsl(var(--secondary))]/10' },
    { icon: Heart, key: 'legacy', gradient: 'from-[hsl(var(--sage-light))]/20 to-[hsl(var(--sage))]/10' },
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
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
            {t('v2.audience.badge')}
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            {t('v2.audience.title')} <span className="text-secondary">{t('v2.audience.titleHighlight')}</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {profiles.map((profile, i) => (
            <motion.div
              key={profile.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className={`p-8 rounded-3xl bg-gradient-to-br ${profile.gradient} border border-border text-center`}
            >
              <div className="w-16 h-16 rounded-2xl bg-card shadow-md flex items-center justify-center mx-auto mb-6">
                <profile.icon className="h-8 w-8 text-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {t(`v2.audience.profiles.${profile.key}.title`)}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {t(`v2.audience.profiles.${profile.key}.description`)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AudienceSection;
