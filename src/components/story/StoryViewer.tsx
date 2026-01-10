import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StoryItem {
  id: string;
  type: 'image' | 'video' | 'audio' | 'text';
  url?: string;
  title: string;
  description?: string;
  content?: string;
  date?: string;
}

interface StoryViewerProps {
  items: StoryItem[];
  initialIndex?: number;
  onClose: () => void;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

// Preload an image and cache it
const preloadImage = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });
};

// Preload a video by fetching headers
const preloadVideo = (url: string): Promise<void> => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => resolve();
    video.onerror = () => resolve(); // Don't fail on video preload errors
    video.src = url;
  });
};

const StoryViewer = ({
  items,
  initialIndex = 0,
  onClose,
  autoPlay = false,
  autoPlayInterval = 5000,
}: StoryViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadedItems, setLoadedItems] = useState<Set<number>>(new Set([initialIndex]));
  const preloadedRef = useRef<Set<number>>(new Set());

  const currentItem = items[currentIndex];

  // Preload adjacent items (previous, current, next, and next+1)
  useEffect(() => {
    const indicesToPreload = [
      currentIndex - 1,
      currentIndex,
      currentIndex + 1,
      currentIndex + 2,
    ].filter(i => i >= 0 && i < items.length);

    indicesToPreload.forEach(async (index) => {
      if (preloadedRef.current.has(index)) return;
      
      const item = items[index];
      if (!item.url) return;

      preloadedRef.current.add(index);

      try {
        if (item.type === 'image') {
          await preloadImage(item.url);
        } else if (item.type === 'video') {
          await preloadVideo(item.url);
        }
        setLoadedItems(prev => new Set([...prev, index]));
      } catch (error) {
        console.error(`Failed to preload item ${index}:`, error);
      }
    });
  }, [currentIndex, items]);

  const goNext = useCallback(() => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setProgress(0);
    } else if (isPlaying) {
      setIsPlaying(false);
    }
  }, [currentIndex, items.length, isPlaying]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setProgress(0);
    }
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
          e.preventDefault();
          goNext();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          goPrev();
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        case 'p':
          setIsPlaying(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrev, onClose]);

  // Auto-play timer
  useEffect(() => {
    if (!isPlaying || currentItem.type === 'video') return;

    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / (autoPlayInterval / 100));
        if (newProgress >= 100) {
          goNext();
          return 0;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, currentItem.type, autoPlayInterval, goNext]);

  // Reset progress when index changes
  useEffect(() => {
    setProgress(0);
  }, [currentIndex]);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const isCurrentLoaded = loadedItems.has(currentIndex) || currentItem.type === 'text' || currentItem.type === 'audio';

  const renderMedia = () => {
    // Show loading state if media not yet preloaded
    if (!isCurrentLoaded && currentItem.url) {
      return (
        <motion.div
          key={`loading-${currentItem.id}`}
          className="flex flex-col items-center justify-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          <p className="text-white/60 text-sm">Chargement...</p>
        </motion.div>
      );
    }

    switch (currentItem.type) {
      case 'image':
        return (
          <motion.img
            key={currentItem.id}
            src={currentItem.url}
            alt={currentItem.title}
            className="max-h-full max-w-full object-contain"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            loading="eager"
          />
        );
      case 'video':
        return (
          <motion.video
            key={currentItem.id}
            src={currentItem.url}
            className="max-h-full max-w-full object-contain"
            autoPlay
            muted={isMuted}
            controls={false}
            onEnded={goNext}
            preload="auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        );
      case 'audio':
        return (
          <motion.div
            key={currentItem.id}
            className="flex flex-col items-center justify-center gap-8 p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <div className="w-48 h-48 rounded-full bg-gradient-to-br from-secondary/30 to-primary/30 flex items-center justify-center animate-pulse">
              <Volume2 className="w-24 h-24 text-white/80" />
            </div>
            <audio
              src={currentItem.url}
              autoPlay
              muted={isMuted}
              onEnded={goNext}
              className="w-full max-w-md"
              controls
              preload="auto"
            />
          </motion.div>
        );
      case 'text':
        return (
          <motion.div
            key={currentItem.id}
            className="max-w-3xl mx-auto p-8 text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xl md:text-2xl lg:text-3xl text-white/90 leading-relaxed font-light">
              {currentItem.content}
            </p>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Progress bars */}
      <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-2">
        {items.map((_, index) => (
          <div
            key={index}
            className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden cursor-pointer"
            onClick={() => {
              setCurrentIndex(index);
              setProgress(0);
            }}
          >
            <motion.div
              className="h-full bg-white rounded-full"
              initial={false}
              animate={{
                width: index < currentIndex 
                  ? '100%' 
                  : index === currentIndex 
                    ? `${progress}%` 
                    : '0%',
              }}
              transition={{ duration: 0.1 }}
            />
          </div>
        ))}
      </div>

      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-6 right-4 z-20 text-white hover:bg-white/10"
        onClick={onClose}
      >
        <X className="w-6 h-6" />
      </Button>

      {/* Controls */}
      <div className="absolute top-6 right-16 z-20 flex gap-2">
        {currentItem.type === 'video' && (
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </Button>
        )}
        {currentItem.type !== 'video' && (
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </Button>
        )}
      </div>

      {/* Navigation buttons */}
      {currentIndex > 0 && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 text-white bg-black/30 hover:bg-white/20 backdrop-blur-sm w-14 h-14 md:w-20 md:h-20 rounded-full border border-white/20 transition-all duration-200 hover:scale-110"
          onClick={goPrev}
        >
          <ChevronLeft className="w-8 h-8 md:w-12 md:h-12" />
        </Button>
      )}
      {currentIndex < items.length - 1 && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 text-white bg-black/30 hover:bg-white/20 backdrop-blur-sm w-14 h-14 md:w-20 md:h-20 rounded-full border border-white/20 transition-all duration-200 hover:scale-110"
          onClick={goNext}
        >
          <ChevronRight className="w-8 h-8 md:w-12 md:h-12" />
        </Button>
      )}

      {/* Click zones for navigation */}
      <div
        className="absolute left-0 top-0 w-1/3 h-full z-10 cursor-pointer"
        onClick={goPrev}
      />
      <div
        className="absolute right-0 top-0 w-1/3 h-full z-10 cursor-pointer"
        onClick={goNext}
      />

      {/* Media content */}
      <div className="absolute inset-0 flex items-center justify-center z-0">
        <AnimatePresence mode="wait">
          {renderMedia()}
        </AnimatePresence>
      </div>

      {/* Info overlay */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 pb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="max-w-3xl mx-auto">
          {currentItem.date && (
            <p className="text-white/60 text-sm mb-2">{currentItem.date}</p>
          )}
          <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-2">
            {currentItem.title}
          </h2>
          {currentItem.description && (
            <p className="text-white/80 text-base md:text-lg line-clamp-3">
              {currentItem.description}
            </p>
          )}
        </div>
      </motion.div>

      {/* Counter */}
      <div className="absolute bottom-4 right-4 z-20 text-white/60 text-sm">
        {currentIndex + 1} / {items.length}
      </div>
    </motion.div>
  );
};

export default StoryViewer;
