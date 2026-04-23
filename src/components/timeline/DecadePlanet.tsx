import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import OrbitingSatellite, { type Satellite } from './OrbitingSatellite';

interface DecadePlanetProps {
  decade: string;
  count: number;
  satellites: Satellite[];
  index: number;
  onDecadeClick: (decade: string) => void;
  onSatelliteClick: (capsuleId: string) => void;
  /** When true, omit the "'s" suffix and the decade label below the number (use for individual years) */
  isYear?: boolean;
}

const decadeColors: Record<string, string> = {
  '1940': 'from-amber-600 to-amber-800',
  '1950': 'from-orange-500 to-orange-700',
  '1960': 'from-rose-500 to-pink-600',
  '1970': 'from-amber-500 to-orange-500',
  '1980': 'from-purple-500 to-purple-700',
  '1990': 'from-teal-500 to-cyan-600',
  '2000': 'from-blue-500 to-indigo-600',
  '2010': 'from-pink-500 to-fuchsia-600',
  '2020': 'from-emerald-500 to-teal-600',
};

const getDecadeColor = (decade: string): string =>
  decadeColors[decade] || 'from-secondary to-secondary/80';

const DecadePlanet = ({
  decade,
  count,
  satellites,
  index,
  onDecadeClick,
  onSatelliteClick,
  isYear = false,
}: DecadePlanetProps) => {
  const { t } = useTranslation('dashboard');
  const isMobile = useIsMobile();

  const getDecadeLabel = (): string => {
    const labelKey = `timeline.decade.labels.${decade}`;
    const translated = t(labelKey);
    return translated !== labelKey ? translated : t('timeline.decade.labels.default', { decade });
  };

  // Responsive sizing
  const planetSize = isMobile ? 140 : 180;
  const orbitRadius = isMobile ? 95 : 130;
  const containerSize = isMobile ? 280 : 360;
  const maxSatellites = isMobile ? 3 : 6;
  const visibleSatellites = satellites.slice(0, maxSatellites);

  const gradient = getDecadeColor(decade);

  const getSatelliteAriaLabel = (sat: Satellite): string => {
    if (sat.type === 'photo') return t('timeline.cosmic.satellite.photo');
    if (sat.type === 'video') return t('timeline.cosmic.satellite.video');
    return sat.label
      ? `${t('timeline.cosmic.satellite.place')} : ${sat.label}`
      : t('timeline.cosmic.satellite.place');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: 'easeOut' }}
      className="relative flex-shrink-0 flex items-center justify-center"
      style={{ width: containerSize, height: containerSize }}
    >
      {/* Orbit ring (decorative) */}
      <div
        className="absolute rounded-full border border-dashed border-foreground/10"
        style={{
          width: orbitRadius * 2,
          height: orbitRadius * 2,
        }}
        aria-hidden="true"
      />

      {/* Satellites in orbit */}
      {visibleSatellites.map((sat, i) => (
        <OrbitingSatellite
          key={`${decade}-sat-${i}`}
          satellite={sat}
          index={i}
          total={visibleSatellites.length}
          radius={orbitRadius}
          duration={28 + (i % 3) * 6}
          direction={i % 2 === 0 ? 1 : -1}
          onClick={onSatelliteClick}
          ariaLabel={getSatelliteAriaLabel(sat)}
          size={isMobile ? 44 : 56}
        />
      ))}

      {/* Central planet */}
      <motion.button
        type="button"
        onClick={() => onDecadeClick(decade)}
        aria-label={`${getDecadeLabel()}, ${count} ${t('timeline.memories', { count })}`}
        className={`relative z-10 rounded-full bg-gradient-to-br ${gradient} text-white shadow-2xl hover:shadow-[0_0_60px_-10px_hsl(var(--primary)/0.5)] focus:outline-none focus:ring-4 focus:ring-secondary/50 group overflow-hidden`}
        style={{ width: planetSize, height: planetSize }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
      >
        {/* Glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent rounded-full" />

        <div className="relative h-full w-full flex flex-col items-center justify-center p-3">
          <span className="text-2xl sm:text-3xl font-bold drop-shadow-lg leading-none">
            {decade}'s
          </span>
          <span className="text-[10px] sm:text-xs font-medium text-white/85 mt-1 text-center drop-shadow leading-tight">
            {getDecadeLabel()}
          </span>
          <div className="mt-2 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs sm:text-sm font-semibold flex items-center gap-1">
            {count} {t('timeline.memories', { count })}
          </div>
          <ChevronRight className="absolute bottom-2 right-2 w-3 h-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
        </div>
      </motion.button>
    </motion.div>
  );
};

export default DecadePlanet;
