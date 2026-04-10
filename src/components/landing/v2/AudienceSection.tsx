import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

import parentsImg from '@/assets/audience/parents.jpg';
import familiesImg from '@/assets/audience/families.jpg';
import legacyImg from '@/assets/audience/legacy.jpg';
import eventsImg from '@/assets/audience/events.jpg';

const AudienceSection = () => {
  const { t } = useTranslation('landing');

  const profiles = [
    { key: 'parents', image: parentsImg },
    { key: 'families', image: familiesImg },
    { key: 'events', image: eventsImg },
    { key: 'legacy', image: legacyImg },
  ];

  return (
    <section className="py-12 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            {t('v2.audience.title')}<br />
            <span className="text-[hsl(var(--gold))]">{t('v2.audience.titleHighlight')}</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {profiles.map((profile, i) => (
            <motion.div
              key={profile.key}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="group relative rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300"
            >
              {/* Image */}
              <img
                src={profile.image}
                alt={t(`v2.audience.profiles.${profile.key}.title`)}
                className="w-full h-[350px] sm:h-[400px] object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
                width={400}
                height={400}
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              {/* Text */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-xl font-display font-bold text-white mb-2">
                  {t(`v2.audience.profiles.${profile.key}.title`)}
                </h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  {t(`v2.audience.profiles.${profile.key}.description`)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AudienceSection;
