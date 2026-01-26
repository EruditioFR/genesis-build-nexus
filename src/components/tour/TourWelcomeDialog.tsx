import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Clock, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TourType } from '@/lib/tourSteps';

interface TourWelcomeDialogProps {
  isOpen: boolean;
  tourType: TourType;
  onStart: () => void;
  onSkip: () => void;
  onClose: () => void;
}

const tourIcons: Record<TourType, string> = {
  dashboard: '🏠',
  capsule: '📦',
  familyTree: '🌳',
  circles: '👨‍👩‍👧‍👦',
};

const tourDurations: Record<TourType, string> = {
  dashboard: '2-3',
  capsule: '1-2',
  familyTree: '1-2',
  circles: '1',
};

export const TourWelcomeDialog = ({
  isOpen,
  tourType,
  onStart,
  onSkip,
  onClose,
}: TourWelcomeDialogProps) => {
  const { t } = useTranslation('common');
  const [isHoveredStart, setIsHoveredStart] = useState(false);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ 
              type: 'spring', 
              damping: 25, 
              stiffness: 300,
              duration: 0.4 
            }}
            className="fixed inset-x-4 top-1/2 z-[10000] mx-auto max-w-md -translate-y-1/2 sm:inset-x-auto sm:left-1/2 sm:w-[95vw] sm:-translate-x-1/2"
          >
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-card to-card/95 border border-border/50 shadow-2xl">
              {/* Decorative gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-transparent to-primary/5 pointer-events-none" />
              
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 z-10 p-1.5 rounded-full text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 transition-all duration-200"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Content */}
              <div className="relative p-6 sm:p-8">
                {/* Icon with sparkle animation */}
                <motion.div 
                  className="flex justify-center mb-6"
                  animate={{ 
                    scale: [1, 1.05, 1],
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                >
                  <div className="relative">
                    <div className="text-6xl sm:text-7xl">
                      {tourIcons[tourType]}
                    </div>
                    <motion.div
                      className="absolute -top-1 -right-1"
                      animate={{ 
                        rotate: [0, 15, -15, 0],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut'
                      }}
                    >
                      <Sparkles className="h-5 w-5 text-secondary" />
                    </motion.div>
                  </div>
                </motion.div>

                {/* Title */}
                <h2 className="text-center font-display text-2xl sm:text-3xl font-bold text-foreground mb-3">
                  {t(`tour.welcome.${tourType}.title`)}
                </h2>

                {/* Description */}
                <p className="text-center text-muted-foreground text-base sm:text-lg leading-relaxed mb-6">
                  {t(`tour.welcome.${tourType}.description`)}
                </p>

                {/* Duration indicator */}
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-8">
                  <Clock className="h-4 w-4" />
                  <span>{t('tour.welcome.duration', { minutes: tourDurations[tourType] })}</span>
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="ghost"
                    onClick={onSkip}
                    className="flex-1 h-12 text-muted-foreground hover:text-foreground"
                  >
                    {t('tour.welcome.later')}
                  </Button>
                  
                  <motion.div 
                    className="flex-1"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={onStart}
                      onMouseEnter={() => setIsHoveredStart(true)}
                      onMouseLeave={() => setIsHoveredStart(false)}
                      className="w-full h-12 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold shadow-lg shadow-secondary/25"
                    >
                      <motion.span
                        animate={{ x: isHoveredStart ? 4 : 0 }}
                        className="flex items-center gap-2"
                      >
                        <Play className="h-4 w-4" />
                        {t('tour.welcome.start')}
                      </motion.span>
                    </Button>
                  </motion.div>
                </div>

                {/* Skip hint */}
                <p className="text-center text-xs text-muted-foreground/60 mt-4">
                  {t('tour.welcome.skipHint')}
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TourWelcomeDialog;
