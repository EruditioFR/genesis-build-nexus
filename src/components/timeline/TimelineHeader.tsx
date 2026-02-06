import { motion } from 'framer-motion';
import { Clock, Play, BookOpen } from 'lucide-react';
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
      <div className="rounded-2xl bg-card border-2 border-border p-6 sm:p-8">
        <div className="text-center">
          {/* Icon - large and clear */}
          <div className="inline-flex items-center justify-center w-20 h-20 mb-5 rounded-2xl bg-secondary/10 border-2 border-secondary/20">
            <Clock className="w-10 h-10 text-secondary" />
          </div>

          {/* Title - large text */}
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            {t('timeline.header.title')}
          </h1>
          
          {/* Counter - clear and prominent */}
          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-muted border border-border mb-2">
            <BookOpen className="w-6 h-6 text-secondary" />
            <span className="text-xl font-bold text-foreground">{filteredCount}</span>
            <span className="text-lg text-muted-foreground">
              {t('timeline.memories', { count: filteredCount })}
            </span>
          </div>
          
          {activeFiltersCount > 0 && (
            <p className="text-base text-muted-foreground mb-4">
              {t('timeline.header.outOf', { total: totalCount })}
            </p>
          )}
          
          <p className="text-base text-muted-foreground mb-6">
            {t('timeline.header.organizedBy')}
          </p>
          
          {/* Launch story button - large touch target */}
          {hasCapules && filteredCount > 0 && (
            <Button
              onClick={onLaunchStory}
              disabled={storyLoading}
              size="lg"
              className="h-14 px-8 text-lg font-semibold gap-3 bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-md"
            >
              <Play className="w-6 h-6" />
              {storyLoading ? t('timeline.header.loadingStory') : t('timeline.header.launchStory')}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TimelineHeader;
