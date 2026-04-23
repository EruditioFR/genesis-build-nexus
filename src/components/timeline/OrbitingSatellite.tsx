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
              <div className="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full bg-black/60 flex items-center justify-center pointer-events-none">
                <Video className="w-2.5 h-2.5 text-white" />
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
 * Global controller: limits the number of videos playing simultaneously.
 * Visible videos register themselves; only the first MAX_ACTIVE play, others wait.
 */
const MAX_ACTIVE_VIDEOS = 3;
const activeVideos = new Set<HTMLVideoElement>();
const waitingVideos: HTMLVideoElement[] = [];

const requestPlay = (el: HTMLVideoElement) => {
  if (activeVideos.has(el)) return;
  if (activeVideos.size < MAX_ACTIVE_VIDEOS) {
    activeVideos.add(el);
    el.play().catch(() => activeVideos.delete(el));
  } else if (!waitingVideos.includes(el)) {
    waitingVideos.push(el);
  }
};

const releasePlay = (el: HTMLVideoElement) => {
  if (activeVideos.has(el)) {
    activeVideos.delete(el);
    el.pause();
    // Promote next waiting video
    const next = waitingVideos.shift();
    if (next) requestPlay(next);
  } else {
    const idx = waitingVideos.indexOf(el);
    if (idx >= 0) waitingVideos.splice(idx, 1);
  }
};

/**
 * Plays a muted looping video preview only when visible in viewport
 * AND when fewer than MAX_ACTIVE_VIDEOS are already playing.
 * Lazy-loads the source: src is only attached once the element scrolls near viewport.
 */
const LazyVideoPreview = ({ src }: { src: string }) => {
  const ref = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Step 1: lazy-load — only attach src once near viewport (200px margin)
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Step 2: play/pause based on actual visibility (with throttling)
  useEffect(() => {
    const el = ref.current;
    if (!el || !shouldLoad) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.25 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [shouldLoad]);

  // Step 3: coordinate with global active-videos pool
  useEffect(() => {
    const el = ref.current;
    if (!el || !shouldLoad) return;
    if (isVisible) {
      requestPlay(el);
    } else {
      releasePlay(el);
    }
    return () => releasePlay(el);
  }, [isVisible, shouldLoad]);

  return (
    <video
      ref={ref}
      src={shouldLoad ? src : undefined}
      className="w-full h-full object-cover"
      muted
      loop
      playsInline
      preload={shouldLoad ? 'auto' : 'none'}
      onLoadedMetadata={(e) => {
        try { e.currentTarget.currentTime = 0.1; } catch { /* noop */ }
      }}
    />
  );
};

export default OrbitingSatellite;
