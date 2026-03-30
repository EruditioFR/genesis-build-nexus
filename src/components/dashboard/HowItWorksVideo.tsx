import { motion } from 'framer-motion';
import { Play, CirclePlay } from 'lucide-react';
import { useState, useRef } from 'react';

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

interface VideoCardProps {
  video: TutorialVideo;
}

const VideoCard = ({ video }: VideoCardProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleToggle = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="group"
    >
      <div
        className="relative rounded-2xl overflow-hidden shadow-md border border-border/30 cursor-pointer aspect-video"
        onClick={handleToggle}
      >
        <video
          ref={videoRef}
          src={video.src}
          className="w-full h-full object-cover"
          playsInline
          onEnded={() => setIsPlaying(false)}
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
        />
        <div
          className={`absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity duration-300 ${
            isPlaying ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <div className="w-14 h-14 rounded-full bg-secondary/90 backdrop-blur-sm flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
            <Play className="w-6 h-6 text-white fill-white ml-0.5" />
          </div>
        </div>
      </div>
      <h3 className="mt-3 text-sm font-semibold text-foreground">{video.title}</h3>
      <p className="text-xs text-muted-foreground mt-0.5">{video.description}</p>
    </motion.div>
  );
};

interface HowItWorksVideoProps {
  variant?: 'dashboard' | 'landing';
}

const HowItWorksVideo = ({ variant = 'dashboard' }: HowItWorksVideoProps) => {
  const isLanding = variant === 'landing';

  return (
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
        {/* Header */}
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
              <>
                Nos tutoriels <span className="text-secondary">vidéo</span>
              </>
            ) : (
              <>
                <CirclePlay className="w-5 h-5 text-secondary" /> Tutoriels vidéo
              </>
            )}
          </h2>
          {isLanding && (
            <p className="text-[#1a1a2e]/70 text-base sm:text-lg">
              Découvrez en vidéo comment utiliser Family Garden en quelques clics.
            </p>
          )}
        </motion.div>

        {/* Video Grid */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 ${isLanding ? 'max-w-5xl mx-auto' : ''}`}>
          {TUTORIALS.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksVideo;
