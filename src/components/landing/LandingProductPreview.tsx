import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Camera, Clock, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';

const LandingProductPreview = () => {
  const { t } = useTranslation('landing');

  const features = [
    {
      icon: Camera,
      titleKey: 'productPreview.create.title',
      descKey: 'productPreview.create.desc',
      gradient: 'from-secondary/20 to-secondary/5',
      iconBg: 'bg-secondary/15',
      iconColor: 'text-secondary',
    },
    {
      icon: Clock,
      titleKey: 'productPreview.organize.title',
      descKey: 'productPreview.organize.desc',
      gradient: 'from-accent/20 to-accent/5',
      iconBg: 'bg-accent/15',
      iconColor: 'text-accent-foreground',
    },
    {
      icon: Users,
      titleKey: 'productPreview.share.title',
      descKey: 'productPreview.share.desc',
      gradient: 'from-primary/20 to-primary/5',
      iconBg: 'bg-primary/15',
      iconColor: 'text-primary',
    },
  ];

  const steps = [
    { num: '1', key: 'howItWorks.steps.step1.title' },
    { num: '2', key: 'howItWorks.steps.step2.title' },
    { num: '3', key: 'howItWorks.steps.step3.title' },
    { num: '4', key: 'howItWorks.steps.step4.title' },
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            {t('productPreview.badge')}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-foreground">
            {t('productPreview.title')}{' '}
            <span className="text-secondary">{t('productPreview.titleHighlight')}</span>
          </h2>
        </motion.div>

        {/* 3 Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto mb-12">
          {features.map((feature, index) => (
            <motion.div
              key={feature.titleKey}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className={`border-0 bg-gradient-to-br ${feature.gradient} h-full shadow-sm hover:shadow-md transition-shadow`}>
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl ${feature.iconBg} flex items-center justify-center mb-4`}>
                    <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                  </div>
                  <h3 className="font-semibold text-lg text-foreground mb-2">
                    {t(feature.titleKey)}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t(feature.descKey)}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Mini How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-3xl mx-auto"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-0">
            {steps.map((step, index) => (
              <div key={step.num} className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-white text-sm font-bold flex-shrink-0">
                    {step.num}
                  </span>
                  <span className="text-sm font-medium text-foreground whitespace-nowrap">
                    {t(step.key)}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0 hidden sm:block mx-3" />
                )}
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-8">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-secondary hover:bg-secondary/90 text-white font-semibold transition-all shadow-md hover:shadow-lg"
            >
              {t('hero.cta.primary')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LandingProductPreview;
