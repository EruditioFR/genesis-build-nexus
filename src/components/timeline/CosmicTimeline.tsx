import { useRef } from 'react';
import { motion } from 'framer-motion';
import DecadePlanet from './DecadePlanet';
import type { Satellite } from './OrbitingSatellite';
import { useIsMobile } from '@/hooks/use-mobile';

interface CosmicTimelineProps {
  decades: string[];
  decadeCounts: Record<string, number>;
  decadeSatellites: Record<string, Satellite[]>;
  onDecadeClick: (decade: string) => void;
  onSatelliteClick: (capsuleId: string) => void;
  /** Treat each "decade" entry as a single year (no "'s" suffix, no decade label) */
  isYearMode?: boolean;
}

const CosmicTimeline = ({
  decades,
  decadeCounts,
  decadeSatellites,
  onDecadeClick,
  onSatelliteClick,
  isYearMode = false,
}: CosmicTimelineProps) => {
  const isMobile = useIsMobile();
  const scrollRef = useRef<HTMLDivElement>(null);

  if (decades.length === 0) return null;

  return (
    <div className="relative w-full">
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

      {isMobile ? (
        // Mobile: vertical stack with vertical timeline line
        <div className="relative flex flex-col items-center gap-2 py-6">
          {/* Vertical timeline line */}
          <div
            className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-gradient-to-b from-transparent via-foreground/20 to-transparent pointer-events-none"
            aria-hidden="true"
          />
          {decades.map((decade, idx) => (
            <div key={decade} className="relative">
              <DecadePlanet
                decade={decade}
                count={decadeCounts[decade] || 0}
                satellites={decadeSatellites[decade] || []}
                index={idx}
                onDecadeClick={onDecadeClick}
                onSatelliteClick={onSatelliteClick}
              />
            </div>
          ))}
        </div>
      ) : (
        // Desktop: horizontal scrollable frieze with timeline line
        <div
          ref={scrollRef}
          className="relative overflow-x-auto overflow-y-hidden pb-6 scrollbar-thin"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          <div className="relative flex items-center min-w-max px-8 py-4">
            {/* Horizontal timeline line */}
            <div
              className="absolute left-0 right-0 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-foreground/20 to-transparent pointer-events-none"
              aria-hidden="true"
            />
            {/* Animated pulse dots along the line */}
            {decades.map((_, idx) => (
              <motion.div
                key={`pulse-${idx}`}
                className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-secondary/60 pointer-events-none"
                style={{
                  left: `calc(${(idx + 0.5) * (100 / decades.length)}% )`,
                }}
                animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.3, 1] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: idx * 0.4,
                }}
                aria-hidden="true"
              />
            ))}

            {decades.map((decade, idx) => (
              <div
                key={decade}
                style={{ scrollSnapAlign: 'center' }}
                className="relative"
              >
                <DecadePlanet
                  decade={decade}
                  count={decadeCounts[decade] || 0}
                  satellites={decadeSatellites[decade] || []}
                  index={idx}
                  onDecadeClick={onDecadeClick}
                  onSatelliteClick={onSatelliteClick}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CosmicTimeline;
