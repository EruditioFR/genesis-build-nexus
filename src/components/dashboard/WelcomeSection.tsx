import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Camera, Clock, Users, Plus, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface WelcomeSectionProps {
  onHide: () => void;
}

const WelcomeSection = ({ onHide }: WelcomeSectionProps) => {
  const { t } = useTranslation('dashboard');
  const [isVisible, setIsVisible] = useState(true);

  const handleHide = () => {
    setIsVisible(false);
    onHide();
  };

  if (!isVisible) return null;

  const features = [
    {
      icon: Camera,
      titleKey: 'welcomeSection.createTitle',
      descKey: 'welcomeSection.createDesc',
      gradient: 'from-secondary/20 to-secondary/5',
      iconBg: 'bg-secondary/15',
      iconColor: 'text-secondary',
    },
    {
      icon: Clock,
      titleKey: 'welcomeSection.organizeTitle',
      descKey: 'welcomeSection.organizeDesc',
      gradient: 'from-accent/20 to-accent/5',
      iconBg: 'bg-accent/15',
      iconColor: 'text-accent-foreground',
    },
    {
      icon: Users,
      titleKey: 'welcomeSection.shareTitle',
      descKey: 'welcomeSection.shareDesc',
      gradient: 'from-primary/20 to-primary/5',
      iconBg: 'bg-primary/15',
      iconColor: 'text-primary',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4 }}
      className="relative rounded-2xl border border-border bg-gradient-to-br from-secondary/5 via-background to-accent/5 overflow-hidden"
    >
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-secondary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="relative p-6 md:p-8">
        {/* Dismiss */}
        <button
          onClick={handleHide}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground z-10"
          aria-label={t('welcomeSection.hide')}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary to-secondary/70 flex items-center justify-center shadow-lg">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1 pt-1 pr-8">
            <h3 className="text-xl font-display font-bold text-foreground mb-1">
              {t('welcomeSection.title')}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t('welcomeSection.subtitle')}
            </p>
          </div>
        </div>

        {/* 3 Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.titleKey}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className={`border-0 bg-gradient-to-br ${feature.gradient} h-full`}>
                <CardContent className="p-5">
                  <div className={`w-11 h-11 rounded-xl ${feature.iconBg} flex items-center justify-center mb-3`}>
                    <feature.icon className={`w-5 h-5 ${feature.iconColor}`} />
                  </div>
                  <h4 className="font-semibold text-foreground mb-1">
                    {t(feature.titleKey)}
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t(feature.descKey)}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA + Hide */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link to="/capsules/new">
              <Plus className="w-4 h-4 mr-2" />
              {t('welcomeSection.cta')}
            </Link>
          </Button>
          <button
            onClick={handleHide}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
          >
            {t('welcomeSection.hide')}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default WelcomeSection;
