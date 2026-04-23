import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Camera, Clock, Users, Plus, X, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WelcomeSectionProps {
  onHide: () => void;
  totalCapsules?: number;
}

const WelcomeSection = ({ onHide, totalCapsules = 0 }: WelcomeSectionProps) => {
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
    },
    {
      icon: Clock,
      titleKey: 'welcomeSection.organizeTitle',
      descKey: 'welcomeSection.organizeDesc',
    },
    {
      icon: Users,
      titleKey: 'welcomeSection.shareTitle',
      descKey: 'welcomeSection.shareDesc',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4 }}
      className="relative rounded-3xl border border-border bg-card overflow-hidden shadow-sm"
    >
      {/* Subtle decorative blob */}
      <div
        className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-40"
        style={{ background: 'hsl(var(--gold) / 0.18)' }}
      />

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
        <div className="flex items-start gap-4 mb-8 pr-8">
          <div
            className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-md"
            style={{ background: 'hsl(var(--gold))' }}
          >
            <Sparkles className="w-6 h-6 text-white" strokeWidth={2.25} />
          </div>
          <div className="flex-1 pt-0.5">
            <span
              className="inline-block text-[11px] font-semibold tracking-widest uppercase mb-1.5"
              style={{ color: 'hsl(var(--gold))' }}
            >
              {t('welcomeSection.eyebrow', { defaultValue: 'Bienvenue' })}
            </span>
            <h3 className="text-2xl md:text-[1.6rem] font-display font-bold text-foreground leading-tight mb-1.5">
              {t('welcomeSection.title')}
            </h3>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl">
              {t('welcomeSection.subtitle')}
            </p>
          </div>
        </div>

        {/* 3 numbered steps */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-7">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.titleKey}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.08 }}
                className="group relative rounded-2xl border border-border bg-background/60 hover:bg-background hover:border-foreground/20 hover:shadow-md transition-all p-5"
              >
                {/* Step number */}
                <span
                  className="absolute top-4 right-4 text-xs font-bold tabular-nums opacity-40 group-hover:opacity-100 transition-opacity"
                  style={{ color: 'hsl(var(--gold))' }}
                >
                  0{index + 1}
                </span>

                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: 'hsl(var(--gold) / 0.1)' }}
                >
                  <Icon className="w-5 h-5" style={{ color: 'hsl(var(--gold))' }} strokeWidth={2.25} />
                </div>

                <h4 className="font-display font-semibold text-base text-foreground mb-1.5">
                  {t(feature.titleKey)}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t(feature.descKey)}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* CTA row */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-border">
          <button
            onClick={handleHide}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors self-center sm:self-auto"
          >
            {t('welcomeSection.hide')}
          </button>

          {totalCapsules === 0 && (
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
              style={{
                background: 'hsl(var(--gold))',
                color: 'hsl(0 0% 100%)',
              }}
            >
              <Link to="/capsules/new">
                <Plus className="w-4 h-4 mr-1.5" strokeWidth={2.5} />
                {t('welcomeSection.cta')}
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default WelcomeSection;
