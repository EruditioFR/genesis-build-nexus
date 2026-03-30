import { motion, AnimatePresence } from 'framer-motion';
import { Play, CirclePlay, X } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';

interface TutorialVideo {
  id: string;
  title: string;
  description: string;
  src: string;
}

const TUTORIALS: TutorialVideo[] = [
  {
    id: 'creer-souvenir',
    title: 'Créer un souvenir',
    description: 'Apprenez à créer votre premier souvenir en quelques clics.',
    src: '/videos/tuto-comment-creer-souvenir.mp4',
  },
];

/* ── Thumbnail card ── */
const VideoCard = ({ video, onOpen }: { video: TutorialVideo; onOpen: (v: TutorialVideo) => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4 }}
    className="group cursor-pointer"
    onClick={() => onOpen(video)}
  >
    <div className="relative rounded-2xl overflow-hidden shadow-md border border-border/30 aspect-video bg-muted">
      <video
        src={video.src}
        className="w-full h-full object-cover"
        muted
        playsInline
        preload="metadata"
      />
      <div className="absolute inset-0 flex items-center justify-center bg-black/25">
        <div className="w-14 h-14 rounded-full bg-secondary/90 backdrop-blur-sm flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
          <Play className="w-6 h-6 text-white fill-white ml-0.5" />
        </div>
      </div>
    </div>
    <h3 className="mt-3 text-sm font-semibold text-foreground">{video.title}</h3>
    <p className="text-xs text-muted-foreground mt-0.5">{video.description}</p>
  </motion.div>
);

/* ── Modal / Popin ── */
const VideoModal = ({ video, onClose }: { video: TutorialVideo; onClose: () => void }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    videoRef.current?.play().catch(() => {});
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="relative w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl bg-black"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        <video
          ref={videoRef}
          src={video.src}
          className="w-full aspect-video"
          controls
          playsInline
          autoPlay
        />

        <div className="p-4 bg-background">
          <h3 className="text-base font-semibold text-foreground">{video.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{video.description}</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ── Main component ── */
interface HowItWorksVideoProps {
  variant?: 'dashboard' | 'landing';
}

const HowItWorksVideo = ({ variant = 'dashboard' }: HowItWorksVideoProps) => {
  const [activeVideo, setActiveVideo] = useState<TutorialVideo | null>(null);
  const isLanding = variant === 'landing';

  const handleClose = useCallback(() => setActiveVideo(null), []);

  return (
    <>
      <section
        id="tutoriels"
        className={isLanding ? 'py-16 sm:py-24 bg-[#f5f0e8] relative overflow-hidden' : ''}
      >
        {isLanding && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 right-20 w-64 h-64 bg-secondary/8 rounded-full blur-3xl" />
            <div className="absolute bottom-10 left-10 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
          </div>
        )}

        <div className={isLanding ? 'container mx-auto px-4 sm:px-6 relative z-10' : ''}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className={isLanding ? 'text-center max-w-2xl mx-auto mb-10 sm:mb-14' : 'mb-5'}
          >
            {isLanding && (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 text-sm font-semibold mb-5">
                <CirclePlay className="w-4 h-4 text-secondary" />
                <span className="text-secondary">Tutoriels</span>
              </span>
            )}
            <h2
              className={
                isLanding
                  ? 'text-3xl sm:text-4xl md:text-5xl font-display font-bold text-[#1a1a2e] mb-4 leading-tight'
                  : 'text-lg md:text-xl font-display font-bold text-foreground flex items-center gap-2'
              }
            >
              {isLanding ? (
                <>Nos tutoriels <span className="text-secondary">vidéo</span></>
              ) : (
                <><CirclePlay className="w-5 h-5 text-secondary" /> Tutoriels vidéo</>
              )}
            </h2>
            {isLanding && (
              <p className="text-[#1a1a2e]/70 text-base sm:text-lg">
                Découvrez en vidéo comment utiliser Family Garden en quelques clics.
              </p>
            )}
          </motion.div>

          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 ${isLanding ? 'max-w-5xl mx-auto' : ''}`}>
            {TUTORIALS.map((video) => (
              <VideoCard key={video.id} video={video} onOpen={setActiveVideo} />
            ))}
          </div>
        </div>
      </section>

      {/* Video Modal */}
      <AnimatePresence>
        {activeVideo && <VideoModal video={activeVideo} onClose={handleClose} />}
      </AnimatePresence>
    </>
  );
};

export default HowItWorksVideo;
