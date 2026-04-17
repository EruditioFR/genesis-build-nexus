import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

import familiesImg from '@/assets/audience/families.jpg';
import parentsImg from '@/assets/audience/parents.jpg';
import mariageImg from '@/assets/audience/mariage.jpg';
import voyageImg from '@/assets/audience/voyage.jpg';

const AudienceStrip = () => {
  const { t } = useTranslation('landing');

  const profiles = [
    { key: 'families', image: familiesImg },
    { key: 'parents', image: parentsImg },
    { key: 'mariage', image: mariageImg },
    { key: 'voyage', image: voyageImg },
  ];

  return (
    <section className="py-8 md:py-10 bg-background border-b border-border/40">
      <div className="container mx-auto px-4">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-sm md:text-base text-muted-foreground mb-5 md:mb-6 font-medium"
        >
          {t('v2.audience.title')}{' '}
          <span className="text-[hsl(var(--gold))] font-semibold">
            {t('v2.audience.titleHighlight')}
          </span>
        </motion.p>

        <div className="flex gap-3 md:gap-4 overflow-x-auto md:overflow-visible md:grid md:grid-cols-4 max-w-5xl mx-auto pb-2 md:pb-0 snap-x snap-mandatory scrollbar-hide">
          {profiles.map((profile, i) => (
            <motion.div
              key={profile.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group relative flex-shrink-0 w-[160px] md:w-auto h-[140px] md:h-[160px] rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow snap-start"
            >
              <img
                src={profile.image}
                alt={t(`v2.audience.profiles.${profile.key}.title`)}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
                width={300}
                height={200}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <h3 className="text-sm md:text-base font-display font-semibold text-white">
                  {t(`v2.audience.profiles.${profile.key}.title`)}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AudienceStrip;
