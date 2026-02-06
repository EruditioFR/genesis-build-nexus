import { motion } from 'framer-motion';
import { Clock, Play, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

interface TimelineHeaderProps {
  filteredCount: number;
  totalCount: number;
  activeFiltersCount: number;
  storyLoading: boolean;
  onLaunchStory: () => void;
  hasCapules: boolean;
}

const TimelineHeader = ({
  filteredCount,
  totalCount,
  activeFiltersCount,
  storyLoading,
  onLaunchStory,
  hasCapules,
}: TimelineHeaderProps) => {
  const { t } = useTranslation('dashboard');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-8"
    >
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-secondary/5 via-primary/5 to-secondary/5 p-6 sm:p-8 border border-border">
        <div className="text-center relative z-10">
          {/* Main icon */}
          <div className="relative inline-flex items-center justify-center w-16 h-16 mb-4">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-secondary to-primary opacity-20 blur-lg" />
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary to-primary shadow-lg flex items-center justify-center">
              <Clock className="w-7 h-7 text-primary-foreground" />
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-1 -right-1"
            >
              <Sparkles className="w-5 h-5 text-secondary" />
            </motion.div>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-3">
            {t('timeline.header.title')}
          </h1>
          
          {/* Counter */}
          <p className="text-muted-foreground mb-1">
            <span className="font-semibold text-foreground">{filteredCount}</span>{' '}
            {t('timeline.memories', { count: filteredCount })}
            {activeFiltersCount > 0 && (
              <span className="text-sm"> ({t('timeline.header.outOf', { total: totalCount })})</span>
            )}
          </p>
          
          <p className="text-sm text-muted-foreground/70 mb-5">
            {t('timeline.header.organizedBy')}
          </p>
          
          {/* Launch story button */}
          {hasCapules && filteredCount > 0 && (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={onLaunchStory}
                disabled={storyLoading}
                size="lg"
                className="gap-2 bg-gradient-to-r from-secondary to-primary hover:opacity-90 text-primary-foreground shadow-lg"
              >
                <Play className="w-5 h-5" />
                {storyLoading ? t('timeline.header.loadingStory') : t('timeline.header.launchStory')}
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TimelineHeader;
