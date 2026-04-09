import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

import capsuleImg from '@/assets/mockups/capsule-create.jpg';
import timelineImg from '@/assets/mockups/timeline-view.jpg';
import circlesImg from '@/assets/mockups/circles-share.jpg';
import familyTreeImg from '@/assets/mockups/family-tree.jpg';

const SolutionSection = () => {
  const { t } = useTranslation('landing');
  const navigate = useNavigate();

  const features = [
    { key: 'multimedia', image: capsuleImg, align: 'left' as const },
    { key: 'timeline', image: timelineImg, align: 'right' as const },
    { key: 'circles', image: circlesImg, align: 'left' as const },
    { key: 'familyTree', image: familyTreeImg, align: 'right' as const },
  ];

  return (
    <section className="py-20 md:py-28 bg-[#1a1a2e] text-white overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 md:mb-24"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-[hsl(var(--gold))]/20 text-[hsl(var(--gold-light))] text-sm font-medium mb-4">
            {t('v2.solution.badge')}
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            {t('v2.solution.title')}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--gold-light))] to-[hsl(var(--terracotta-light))]">
              {t('v2.solution.titleHighlight')}
            </span>
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            {t('v2.solution.subtitle')}
          </p>
        </motion.div>

        <div className="space-y-20 md:space-y-32">
          {features.map((feat, i) => (
            <motion.div
              key={feat.key}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6 }}
              className={`flex flex-col ${feat.align === 'right' ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-8 md:gap-16`}
            >
              {/* Image */}
              <div className="w-full md:w-1/2 relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-[hsl(var(--gold))]/20 to-[hsl(var(--terracotta))]/20 rounded-3xl blur-2xl opacity-50 group-hover:opacity-75 transition-opacity" />
                <img
                  src={feat.image}
                  alt={t(`v2.solution.features.${feat.key}.title`)}
                  className="relative rounded-2xl shadow-2xl shadow-black/40 w-full object-cover border border-white/10"
                  loading="lazy"
                  width={600}
                  height={400}
                />
              </div>

              {/* Text */}
              <div className="w-full md:w-1/2 text-center md:text-left">
                <h3 className="text-2xl md:text-3xl font-display font-bold mb-4">
                  {t(`v2.solution.features.${feat.key}.title`)}
                </h3>
                <p className="text-white/70 text-base md:text-lg leading-relaxed mb-6">
                  {t(`v2.solution.features.${feat.key}.description`)}
                </p>
                {i === 0 && (
                  <Button
                    onClick={() => navigate('/signup')}
                    className="bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--terracotta))] hover:opacity-90 text-white rounded-xl px-6 py-5 font-semibold shadow-lg"
                  >
                    {t('hero.cta.primary')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
