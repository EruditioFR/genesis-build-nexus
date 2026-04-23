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
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative rounded-3xl border border-border bg-card overflow-hidden shadow-sm mb-8"
    >
      {/* Subtle decorative blob */}
      <div
        className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-40"
        style={{ background: 'hsl(var(--gold) / 0.18)' }}
      />

      <div className="relative p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6">
          {/* Icon */}
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: 'hsl(var(--gold) / 0.1)' }}
          >
            <Clock
              className="w-7 h-7"
              style={{ color: 'hsl(var(--gold))' }}
              strokeWidth={2.25}
            />
          </div>

          {/* Title + meta */}
          <div className="flex-1 min-w-0">
            <h1 className="font-display font-semibold text-2xl sm:text-3xl text-foreground mb-2">
              {t('timeline.header.title')}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" style={{ color: 'hsl(var(--gold))' }} />
                <span className="font-semibold text-foreground tabular-nums">
                  {filteredCount}
                </span>
                <span>{t('timeline.memories', { count: filteredCount })}</span>
              </span>

              {activeFiltersCount > 0 && (
                <span className="text-muted-foreground/80">
                  {t('timeline.header.outOf', { total: totalCount })}
                </span>
              )}

              <span className="text-muted-foreground/80">
                {t('timeline.header.organizedBy')}
              </span>
            </div>
          </div>

          {/* CTA */}
          {hasCapules && filteredCount > 0 && (
            <Button
              onClick={onLaunchStory}
              disabled={storyLoading}
              size="lg"
              className="w-full sm:w-auto shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 gap-2 shrink-0"
              style={{
                background: 'hsl(var(--gold))',
                color: 'hsl(0 0% 100%)',
              }}
            >
              <Play className="w-4 h-4" strokeWidth={2.5} />
              {storyLoading
                ? t('timeline.header.loadingStory')
                : t('timeline.header.launchStory')}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TimelineHeader;
