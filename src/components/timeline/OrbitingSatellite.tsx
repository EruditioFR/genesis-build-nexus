import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Image as ImageIcon, Video, MapPin } from 'lucide-react';

export interface Satellite {
  type: 'photo' | 'video' | 'place';
  url?: string;
  label?: string;
  capsuleId: string;
}

interface OrbitingSatelliteProps {
  satellite: Satellite;
  index: number;
  total: number;
  radius: number;
  /** Duration in seconds for one full orbit */
  duration: number;
  /** Direction of orbit: 1 = clockwise, -1 = counter-clockwise */
  direction?: 1 | -1;
  onClick: (capsuleId: string) => void;
  ariaLabel: string;
  size?: number;
}

const OrbitingSatellite = ({
  satellite,
  index,
  total,
  radius,
  duration,
  direction = 1,
  onClick,
  ariaLabel,
  size = 56,
}: OrbitingSatelliteProps) => {
  const reduceMotion = useReducedMotion();
  const startAngle = (360 / total) * index;

  // Outer wrapper rotates -> creates orbit. Inner counter-rotates so content stays upright.
  const rotateFrom = startAngle;
  const rotateTo = startAngle + 360 * direction;

  return (
    <motion.div
      className="absolute top-1/2 left-1/2 pointer-events-none"
      style={{
        width: 0,
        height: 0,
        transformOrigin: 'center center',
      }}
      initial={{ rotate: rotateFrom }}
      animate={reduceMotion ? { rotate: rotateFrom } : { rotate: rotateTo }}
      transition={
        reduceMotion
          ? undefined
          : { duration, ease: 'linear', repeat: Infinity, repeatType: 'loop' }
      }
    >
      {/* Position satellite at radius distance */}
      <div
        className="absolute"
        style={{
          transform: `translate(${radius}px, -50%)`,
          width: size,
          height: size,
        }}
      >
        {/* Counter-rotate so vignette stays upright */}
        <motion.button
          type="button"
          onClick={() => onClick(satellite.capsuleId)}
          aria-label={ariaLabel}
          className="pointer-events-auto group relative w-full h-full rounded-full overflow-hidden bg-card border-2 border-white/80 shadow-lg hover:shadow-xl hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-secondary"
          initial={{ rotate: -rotateFrom }}
          animate={reduceMotion ? { rotate: -rotateFrom } : { rotate: -rotateTo }}
          transition={
            reduceMotion
              ? undefined
              : { duration, ease: 'linear', repeat: Infinity, repeatType: 'loop' }
          }
          whileHover={{ scale: 1.15 }}
        >
          {satellite.type === 'photo' && satellite.url ? (
            <img
              src={satellite.url}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : satellite.type === 'video' ? (
            <div className="w-full h-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center relative">
              {satellite.url ? <LazyVideoPreview src={satellite.url} /> : null}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                <Video className="w-4 h-4 text-white drop-shadow" />
              </div>
            </div>
          ) : satellite.type === 'place' ? (
            <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 flex flex-col items-center justify-center text-white px-1">
              <MapPin className="w-4 h-4" />
              {satellite.label && (
                <span className="text-[8px] font-semibold leading-tight text-center truncate max-w-full mt-0.5">
                  {satellite.label.slice(0, 8)}
                </span>
              )}
            </div>
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

/**
 * Plays a muted looping video preview only when visible in viewport.
 * Saves bandwidth/CPU on mobile by pausing off-screen videos.
 */
const LazyVideoPreview = ({ src }: { src: string }) => {
  const ref = useRef<HTMLVideoElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.25 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (isVisible) {
      el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, [isVisible]);

  return (
    <video
      ref={ref}
      src={src}
      className="w-full h-full object-cover"
      muted
      loop
      playsInline
      preload="metadata"
    />
  );
};

export default OrbitingSatellite;
