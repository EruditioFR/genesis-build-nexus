import { motion } from 'framer-motion';
import { Play, CirclePlay } from 'lucide-react';
import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface HowItWorksVideoProps {
  variant?: 'dashboard' | 'landing';
}

const HowItWorksVideo = ({ variant = 'dashboard' }: HowItWorksVideoProps) => {
  const { t } = useTranslation('common');
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
  };

  const isLanding = variant === 'landing';

  return (
    <section className={isLanding ? 'py-16 sm:py-24 bg-[#f5f0e8] relative overflow-hidden' : ''}>
      {isLanding && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 right-20 w-64 h-64 bg-secondary/8 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
        </div>
      )}

      <div className={isLanding ? 'container mx-auto px-4 sm:px-6 relative z-10' : ''}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className={`${isLanding ? 'text-center max-w-2xl mx-auto mb-10 sm:mb-14' : 'mb-4'}`}
        >
          {isLanding && (
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 text-sm font-semibold mb-5">
              <CirclePlay className="w-4 h-4 text-secondary" />
              <span className="text-secondary">Tutoriel</span>
            </span>
          )}
          <h2 className={
            isLanding
              ? 'text-3xl sm:text-4xl md:text-5xl font-display font-bold text-[#1a1a2e] mb-4 leading-tight'
              : 'text-lg md:text-xl font-display font-bold text-foreground flex items-center gap-2'
          }>
            {isLanding ? (
              <>Comment créer <span className="text-secondary">un souvenir ?</span></>
            ) : (
              <><CirclePlay className="w-5 h-5 text-secondary" /> Comment ça marche ?</>
            )}
          </h2>
          {isLanding && (
            <p className="text-[#1a1a2e]/70 text-base sm:text-lg">
              Découvrez en vidéo comment créer votre premier souvenir en quelques clics.
            </p>
          )}
        </motion.div>

        {/* Video Player */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className={isLanding ? 'max-w-4xl mx-auto' : ''}
        >
          <div
            className={`relative rounded-2xl overflow-hidden shadow-lg border border-border/30 cursor-pointer group ${
              isLanding ? 'aspect-video' : 'aspect-video'
            }`}
            onClick={handlePlay}
          >
            <video
              ref={videoRef}
              src="/videos/tuto-comment-creer-souvenir.mp4"
              className="w-full h-full object-cover"
              playsInline
              onEnded={handleVideoEnd}
              onPause={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
            />

            {/* Play overlay */}
            <div
              className={`absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity duration-300 ${
                isPlaying ? 'opacity-0 pointer-events-none' : 'opacity-100'
              }`}
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-secondary/90 backdrop-blur-sm flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                <Play className="w-7 h-7 sm:w-9 sm:h-9 text-white fill-white ml-1" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksVideo;
