import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Camera, Clock, Users, ArrowRight, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

import capsuleImg from '@/assets/mockups/capsule-create.jpg';

const LandingProductPreview = () => {
  const { t } = useTranslation('landing');

  const steps = [
    { num: '1', key: 'howItWorks.steps.step1.title', desc: 'howItWorks.steps.step1.description' },
    { num: '2', key: 'howItWorks.steps.step2.title', desc: 'howItWorks.steps.step2.description' },
    { num: '3', key: 'howItWorks.steps.step3.title', desc: 'howItWorks.steps.step3.description' },
    { num: '4', key: 'howItWorks.steps.step4.title', desc: 'howItWorks.steps.step4.description' },
  ];

  return (
    <section className="py-16 sm:py-20 md:py-28 bg-muted/40">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            {t('productPreview.badge')}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-display font-bold text-foreground">
            {t('productPreview.title')}{' '}
            <span className="text-secondary">{t('productPreview.titleHighlight')}</span>
          </h2>
        </motion.div>

        {/* Steps + Mockup side by side */}
        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16 max-w-6xl mx-auto mb-12">
          {/* Steps */}
          <div className="w-full md:w-1/2 space-y-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-4 group"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-white text-sm font-bold flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">
                  {step.num}
                </span>
                <div>
                  <h3 className="font-semibold text-foreground text-base mb-1">{t(step.key)}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t(step.desc)}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mockup image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="w-full md:w-1/2 relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-br from-secondary/20 to-accent/20 rounded-3xl blur-2xl opacity-60" />
            <img
              src={capsuleImg}
              alt="Family Garden App"
              className="relative rounded-2xl shadow-2xl w-full max-w-sm mx-auto border border-border/50"
              loading="lazy"
              width={400}
              height={600}
            />
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-secondary hover:bg-secondary/90 text-white font-semibold text-lg transition-all shadow-lg hover:shadow-xl"
          >
            {t('hero.cta.primary')}
            <ArrowRight className="h-5 w-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default LandingProductPreview;
