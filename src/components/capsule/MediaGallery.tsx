import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSignedUrls } from '@/lib/signedUrlCache';

interface Media {
  id: string;
  file_url: string;
  file_type: string;
  file_name: string | null;
  caption: string | null;
}

interface MediaGalleryProps {
  medias: Media[];
}

const MediaGallery = ({ medias }: MediaGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  // Generate signed URLs for all medias with caching
  useEffect(() => {
    const generateSignedUrls = async () => {
      if (medias.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(true);
      
      const filePaths = medias.map(m => m.file_url);
      const urlsMap = await getSignedUrls('capsule-medias', filePaths);
      
      // Map URLs by media ID
      const urlMapById: Record<string, string> = {};
      medias.forEach((media) => {
        const url = urlsMap[media.file_url];
        if (url) {
          urlMapById[media.id] = url;
        }
      });
      
      setSignedUrls(urlMapById);
      setLoading(false);
    };

    generateSignedUrls();
  }, [medias]);

  const getMediaUrl = (media: Media) => signedUrls[media.id] || '';

  const images = medias.filter(m => m.file_type.startsWith('image/'));
  const videos = medias.filter(m => m.file_type.startsWith('video/'));
  const audios = medias.filter(m => m.file_type.startsWith('audio/'));

  const openLightbox = (index: number) => setSelectedIndex(index);
  const closeLightbox = () => setSelectedIndex(null);

  const goToPrev = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const goToNext = () => {
    if (selectedIndex !== null && selectedIndex < medias.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') goToPrev();
    if (e.key === 'ArrowRight') goToNext();
  };

  if (medias.length === 0) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Chargement des médias...</span>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Images Grid */}
        {images.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Photos ({images.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {images.map((media, index) => {
                const url = getMediaUrl(media);
                if (!url) return null;
                
                return (
                  <motion.div
                    key={media.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group"
                    onClick={() => openLightbox(medias.indexOf(media))}
                  >
                    <img
                      src={url}
                      alt={media.file_name || 'Image'}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors flex items-center justify-center">
                      <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Videos */}
        {videos.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Vidéos ({videos.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {videos.map((media, index) => {
                const url = getMediaUrl(media);
                if (!url) return null;
                
                return (
                  <motion.div
                    key={media.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="rounded-xl overflow-hidden border border-border"
                  >
                    <video
                      src={url}
                      controls
                      className="w-full aspect-video bg-black"
                    />
                    {media.caption && (
                      <p className="p-3 text-sm text-muted-foreground bg-card">
                        {media.caption}
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Audios */}
        {audios.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Audio ({audios.length})
            </h3>
            <div className="space-y-3">
              {audios.map((media, index) => {
                const url = getMediaUrl(media);
                if (!url) return null;
                
                return (
                  <motion.div
                    key={media.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="p-4 rounded-xl border border-border bg-card"
                  >
                    <p className="text-sm font-medium text-foreground mb-2">
                      {media.file_name || 'Audio'}
                    </p>
                    <audio src={url} controls className="w-full" />
                    {media.caption && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {media.caption}
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={closeLightbox}
            onKeyDown={handleKeyDown}
            tabIndex={0}
          >
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/10 z-10"
              onClick={closeLightbox}
            >
              <X className="w-6 h-6" />
            </Button>

            {/* Navigation */}
            {selectedIndex > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 text-white hover:bg-white/10 z-10"
                onClick={(e) => { e.stopPropagation(); goToPrev(); }}
              >
                <ChevronLeft className="w-8 h-8" />
              </Button>
            )}

            {selectedIndex < medias.length - 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 text-white hover:bg-white/10 z-10"
                onClick={(e) => { e.stopPropagation(); goToNext(); }}
              >
                <ChevronRight className="w-8 h-8" />
              </Button>
            )}

            {/* Media display */}
            <motion.div
              key={selectedIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-5xl max-h-[85vh] mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              {medias[selectedIndex].file_type.startsWith('image/') ? (
                <img
                  src={getMediaUrl(medias[selectedIndex])}
                  alt={medias[selectedIndex].file_name || 'Image'}
                  className="max-w-full max-h-[85vh] object-contain rounded-lg"
                />
              ) : medias[selectedIndex].file_type.startsWith('video/') ? (
                <video
                  src={getMediaUrl(medias[selectedIndex])}
                  controls
                  autoPlay
                  className="max-w-full max-h-[85vh] rounded-lg"
                />
              ) : null}

              {/* Caption and counter */}
              <div className="text-center mt-4">
                {medias[selectedIndex].caption && (
                  <p className="text-white/80 mb-2">{medias[selectedIndex].caption}</p>
                )}
                <p className="text-white/50 text-sm">
                  {selectedIndex + 1} / {medias.length}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MediaGallery;
