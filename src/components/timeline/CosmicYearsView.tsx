import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import DecadePlanet from './DecadePlanet';
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
}

const CosmicYearsView = ({
  decade,
  years,
  onClose,
  onYearClick,
  onSatelliteClick,
}: CosmicYearsViewProps) => {
  const { t } = useTranslation('dashboard');
  const isMobile = useIsMobile();

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
          {/* Subtle starfield background */}
          <div
            className="absolute inset-0 pointer-events-none opacity-40"
            style={{
              backgroundImage:
                'radial-gradient(1px 1px at 20% 30%, hsl(var(--foreground) / 0.3), transparent), radial-gradient(1px 1px at 70% 60%, hsl(var(--foreground) / 0.2), transparent), radial-gradient(2px 2px at 40% 80%, hsl(var(--foreground) / 0.25), transparent), radial-gradient(1px 1px at 85% 20%, hsl(var(--foreground) / 0.3), transparent)',
              backgroundSize: '200px 200px',
            }}
            aria-hidden="true"
          />

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
                  {years.reduce((s, y) => s + y.count, 0)}{' '}
                  {t('timeline.decade.memoriesInDecade', {
                    count: years.reduce((s, y) => s + y.count, 0),
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Years as planets */}
          <div className="relative w-full px-4 sm:px-6 lg:px-8 py-8">
            {years.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                {t('timeline.empty.title', { defaultValue: 'Aucun souvenir' })}
              </div>
            ) : isMobile ? (
              <div className="relative flex flex-col items-center gap-2">
                <div
                  className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-gradient-to-b from-transparent via-foreground/20 to-transparent pointer-events-none"
                  aria-hidden="true"
                />
                {years.map((entry, idx) => (
                  <DecadePlanet
                    key={entry.year}
                    decade={entry.year}
                    count={entry.count}
                    satellites={entry.satellites}
                    index={idx}
                    onDecadeClick={() => onYearClick(entry.year)}
                    onSatelliteClick={onSatelliteClick}
                  />
                ))}
              </div>
            ) : (
              <div className="relative overflow-x-auto overflow-y-hidden pb-6">
                <div className="relative flex items-center min-w-max px-8 py-4">
                  <div
                    className="absolute left-0 right-0 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-foreground/20 to-transparent pointer-events-none"
                    aria-hidden="true"
                  />
                  {years.map((entry, idx) => (
                    <DecadePlanet
                      key={entry.year}
                      decade={entry.year}
                      count={entry.count}
                      satellites={entry.satellites}
                      index={idx}
                      onDecadeClick={() => onYearClick(entry.year)}
                      onSatelliteClick={onSatelliteClick}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CosmicYearsView;
