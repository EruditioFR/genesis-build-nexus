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
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative rounded-2xl overflow-hidden shadow-sm mb-5"
      style={{ background: 'hsl(215 50% 18%)' }}
    >
      <div className="relative px-4 py-3 md:px-5 md:py-3.5">
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'hsl(var(--gold) / 0.18)' }}
          >
            <Clock
              className="w-4.5 h-4.5"
              style={{ color: 'hsl(var(--gold))', width: 18, height: 18 }}
              strokeWidth={2.25}
            />
          </div>

          {/* Title + meta inline */}
          <div className="flex-1 min-w-0">
            <h1
              className="font-display font-semibold text-base sm:text-lg leading-tight"
              style={{ color: 'hsl(0 0% 100%)' }}
            >
              {t('timeline.header.title')}
            </h1>
            <div
              className="flex flex-wrap items-center gap-x-2 text-xs mt-0.5"
              style={{ color: 'hsl(0 0% 100% / 0.65)' }}
            >
              <span className="inline-flex items-center gap-1">
                <span
                  className="font-semibold tabular-nums"
                  style={{ color: 'hsl(0 0% 100%)' }}
                >
                  {filteredCount}
                </span>
                <span>{t('timeline.memories', { count: filteredCount })}</span>
              </span>
              {activeFiltersCount > 0 && (
                <span style={{ color: 'hsl(0 0% 100% / 0.5)' }}>
                  · {t('timeline.header.outOf', { total: totalCount })}
                </span>
              )}
            </div>
          </div>

          {/* CTA */}
          {hasCapules && filteredCount > 0 && (
            <Button
              onClick={onLaunchStory}
              disabled={storyLoading}
              size="sm"
              className="shadow-sm hover:shadow transition-all gap-1.5 shrink-0 h-8 px-3 text-xs"
              style={{
                background: 'hsl(var(--gold))',
                color: 'hsl(0 0% 100%)',
              }}
            >
              <Play className="w-3.5 h-3.5" strokeWidth={2.5} />
              <span className="hidden sm:inline">
                {storyLoading
                  ? t('timeline.header.loadingStory')
                  : t('timeline.header.launchStory')}
              </span>
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TimelineHeader;
