import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Heart, Sparkles, Gift, Calendar, Camera, Map } from 'lucide-react';

import parentsImg from '@/assets/audience/parents.jpg';
import familiesImg from '@/assets/audience/families.jpg';
import legacyImg from '@/assets/audience/legacy.jpg';
import eventsImg from '@/assets/audience/events.jpg';
import mariageImg from '@/assets/audience/mariage.jpg';
import voyageImg from '@/assets/audience/voyage.jpg';

const PERSONAS = [
  { key: 'families', image: familiesImg, icon: Heart },
  { key: 'parents', image: parentsImg, icon: Sparkles },
  { key: 'legacy', image: legacyImg, icon: Gift },
  { key: 'mariage', image: mariageImg, icon: Camera },
  { key: 'voyage', image: voyageImg, icon: Map },
  { key: 'events', image: eventsImg, icon: Calendar },
];

const AudienceSectionV3 = () => {
  const { t } = useTranslation('landing');

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-20 max-w-3xl mx-auto"
        >
          <div className="inline-block px-4 py-1.5 mb-4 rounded-full bg-[hsl(var(--gold))]/10 border border-[hsl(var(--gold))]/20">
            <span className="text-xs md:text-sm font-medium text-[hsl(var(--gold))] tracking-wider uppercase">
              {t('v3.audience.badge')}
            </span>
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
            {t('v3.audience.title')}{' '}
            <span className="text-[hsl(var(--gold))]">{t('v3.audience.titleHighlight')}</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            {t('v3.audience.subtitle')}
          </p>
        </motion.div>

        <div className="space-y-16 md:space-y-28 max-w-6xl mx-auto">
          {PERSONAS.map((persona, i) => {
            const isReversed = i % 2 === 1;
            const Icon = persona.icon;
            const badge = t(`v3.audience.personas.${persona.key}.badge`);
            const title = t(`v3.audience.personas.${persona.key}.title`);
            const problem = t(`v3.audience.personas.${persona.key}.problem`);
            const promise = t(`v3.audience.personas.${persona.key}.promise`);
            const cta = t(`v3.audience.personas.${persona.key}.cta`);

            return (
              <motion.article
                key={persona.key}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6 }}
                className={`grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14 items-center ${
                  isReversed ? 'md:[&>*:first-child]:order-2' : ''
                }`}
              >
                <div className="relative">
                  <div className="relative rounded-3xl overflow-hidden shadow-xl aspect-[4/5] md:aspect-[4/3]">
                    <img
                      src={persona.image}
                      alt={badge}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      width={600}
                      height={500}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 via-transparent to-transparent" />
                  </div>
                  <div
                    className={`hidden md:flex absolute -bottom-4 ${
                      isReversed ? '-left-4' : '-right-4'
                    } items-center gap-2 px-4 py-2.5 rounded-full bg-card border border-border shadow-lg`}
                  >
                    <div className="w-8 h-8 rounded-full bg-[hsl(var(--gold))]/15 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-[hsl(var(--gold))]" strokeWidth={2} />
                    </div>
                    <span className="text-sm font-semibold text-foreground pr-1">
                      {badge}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="md:hidden inline-flex items-center gap-2 px-3 py-1.5 mb-4 rounded-full bg-[hsl(var(--gold))]/10 border border-[hsl(var(--gold))]/20">
                    <Icon className="w-3.5 h-3.5 text-[hsl(var(--gold))]" strokeWidth={2} />
                    <span className="text-xs font-semibold text-[hsl(var(--gold))]">
                      {badge}
                    </span>
                  </div>

                  <h3 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-6 leading-tight">
                    {title}
                  </h3>

                  <div className="relative pl-5 mb-5 border-l-2 border-muted-foreground/25">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 mb-1.5">
                      {t('v3.audience.today')}
                    </div>
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                      {problem}
                    </p>
                  </div>

                  <div className="relative pl-5 mb-7 border-l-2 border-[hsl(var(--gold))]">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--gold))] mb-1.5">
                      {t('v3.audience.withFG')}
                    </div>
                    <p className="text-sm md:text-base text-foreground leading-relaxed font-medium">
                      {promise}
                    </p>
                  </div>

                  <Link
                    to="/signup"
                    className="group inline-flex items-center gap-2 text-[hsl(var(--gold))] font-semibold text-sm md:text-base hover:gap-3 transition-all"
                  >
                    {cta}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AudienceSectionV3;
