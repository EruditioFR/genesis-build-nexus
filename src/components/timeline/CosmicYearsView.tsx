import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useMemo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import CosmicTimeline from './CosmicTimeline';
import type { Satellite } from './OrbitingSatellite';

interface YearEntry {
  year: string;
  count: number;
  satellites: Satellite[];
}

interface CosmicYearsViewProps {
  decade: string | null;
  years: YearEntry[];
  onClose: () => void;
  onYearClick: (year: string) => void;
  onSatelliteClick: (capsuleId: string) => void;
  /** Optional slot rendered above the years (e.g. TimelineHeader + filters) */
  headerSlot?: ReactNode;
}

const CosmicYearsView = ({
  decade,
  years,
  onClose,
  onYearClick,
  onSatelliteClick,
  headerSlot,
}: CosmicYearsViewProps) => {
  const { t } = useTranslation('dashboard');

  // Adapt years -> CosmicTimeline shape (years act as "decades")
  const yearKeys = useMemo(() => years.map((y) => y.year), [years]);
  const yearCounts = useMemo(() => {
    const r: Record<string, number> = {};
    years.forEach((y) => { r[y.year] = y.count; });
    return r;
  }, [years]);
  const yearSatellites = useMemo(() => {
    const r: Record<string, Satellite[]> = {};
    years.forEach((y) => { r[y.year] = y.satellites; });
    return r;
  }, [years]);

  const totalCount = years.reduce((s, y) => s + y.count, 0);

  return (
    <AnimatePresence>
      {decade && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 bg-background overflow-y-auto"
        >
          {/* Header */}
          <div className="relative z-10 sticky top-0 backdrop-blur-md bg-background/80 border-b border-border">
            <div className="w-full px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
              <Button
                variant="ghost"
                size="lg"
                onClick={onClose}
                className="gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                {t('timeline.decade.backToDecades')}
              </Button>
              <div className="text-right">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                  {t('timeline.decadeTitle', { decade })}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {totalCount} {t('timeline.decade.memoriesInDecade', { count: totalCount })}
                </p>
              </div>
            </div>
          </div>

          {/* Years rendered with the EXACT same CosmicTimeline interface */}
          <div className="relative w-full px-4 sm:px-6 lg:px-8 py-8">
            {years.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                {t('timeline.empty.title', { defaultValue: 'Aucun souvenir' })}
              </div>
            ) : (
              <CosmicTimeline
                decades={yearKeys}
                decadeCounts={yearCounts}
                decadeSatellites={yearSatellites}
                onDecadeClick={onYearClick}
                onSatelliteClick={onSatelliteClick}
                isYearMode
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CosmicYearsView;
