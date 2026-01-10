import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn, Loader2, Download, Star, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSignedUrls } from '@/lib/signedUrlCache';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Media {
  id: string;
  file_url: string;
  file_type: string;
  file_name: string | null;
  caption: string | null;
}

interface MediaGalleryProps {
  medias: Media[];
  capsuleId?: string;
  thumbnailUrl?: string | null;
  onThumbnailChange?: (url: string | null) => void;
}

const MediaGallery = ({ medias, capsuleId, thumbnailUrl, onThumbnailChange }: MediaGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [settingThumbnail, setSettingThumbnail] = useState<string | null>(null);
  const [currentThumbnail, setCurrentThumbnail] = useState<string | null>(thumbnailUrl || null);

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

  useEffect(() => {
    setCurrentThumbnail(thumbnailUrl || null);
  }, [thumbnailUrl]);

  const getMediaUrl = (media: Media) => signedUrls[media.id] || '';

  const handleDownload = async (media: Media, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const url = getMediaUrl(media);
    if (!url) return;

    setDownloading(media.id);
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = media.file_name || `media-${media.id}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      toast.success('Téléchargement démarré');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Erreur lors du téléchargement');
    } finally {
      setDownloading(null);
    }
  };

  const handleSetThumbnail = async (media: Media, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!capsuleId) return;

    setSettingThumbnail(media.id);
    try {
      const { error } = await supabase
        .from('capsules')
        .update({ thumbnail_url: media.file_url })
        .eq('id', capsuleId);

      if (error) throw error;

      setCurrentThumbnail(media.file_url);
      onThumbnailChange?.(media.file_url);
      toast.success('Image à la une définie');
    } catch (error) {
      console.error('Error setting thumbnail:', error);
      toast.error('Erreur lors de la définition de l\'image à la une');
    } finally {
      setSettingThumbnail(null);
    }
  };

  const handleRemoveThumbnail = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!capsuleId) return;

    try {
      const { error } = await supabase
        .from('capsules')
        .update({ thumbnail_url: null })
        .eq('id', capsuleId);

      if (error) throw error;

      setCurrentThumbnail(null);
      onThumbnailChange?.(null);
      toast.success('Image à la une retirée');
    } catch (error) {
      console.error('Error removing thumbnail:', error);
      toast.error('Erreur');
    }
  };

  const isThumbnail = (media: Media) => currentThumbnail === media.file_url;

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
                const isCurrentThumbnail = isThumbnail(media);
                
                return (
                  <motion.div
                    key={media.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer group ${
                      isCurrentThumbnail ? 'ring-2 ring-secondary ring-offset-2' : ''
                    }`}
                    onClick={() => openLightbox(medias.indexOf(media))}
                  >
                    <img
                      src={url}
                      alt={media.file_name || 'Image'}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors flex items-center justify-center gap-2">
                      <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    
                    {/* Thumbnail indicator */}
                    {isCurrentThumbnail && (
                      <div className="absolute top-2 left-2 bg-secondary text-secondary-foreground rounded-full p-1">
                        <Star className="w-3 h-3 fill-current" />
                      </div>
                    )}
                    
                    {/* Actions on hover */}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {capsuleId && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`w-8 h-8 text-white hover:bg-black/70 ${
                            isCurrentThumbnail ? 'bg-secondary hover:bg-secondary/80' : 'bg-black/50'
                          }`}
                          onClick={(e) => isCurrentThumbnail ? handleRemoveThumbnail(e) : handleSetThumbnail(media, e)}
                          disabled={settingThumbnail === media.id}
                          title={isCurrentThumbnail ? 'Retirer l\'image à la une' : 'Définir comme image à la une'}
                        >
                          {settingThumbnail === media.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : isCurrentThumbnail ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Star className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 bg-black/50 text-white hover:bg-black/70"
                        onClick={(e) => handleDownload(media, e)}
                        disabled={downloading === media.id}
                      >
                        {downloading === media.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                      </Button>
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
                    <div className="relative">
                      <video
                        src={url}
                        controls
                        className="w-full aspect-video bg-black"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 w-8 h-8 bg-black/50 text-white hover:bg-black/70"
                        onClick={() => handleDownload(media)}
                        disabled={downloading === media.id}
                      >
                        {downloading === media.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
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
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-foreground">
                        {media.file_name || 'Audio'}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8"
                        onClick={() => handleDownload(media)}
                        disabled={downloading === media.id}
                      >
                        {downloading === media.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
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
            {/* Top actions bar */}
            <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
              {capsuleId && medias[selectedIndex].file_type.startsWith('image/') && (
                <Button
                  variant="ghost"
                  size="icon"
                  className={`text-white hover:bg-white/10 ${
                    isThumbnail(medias[selectedIndex]) ? 'bg-secondary hover:bg-secondary/80' : ''
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isThumbnail(medias[selectedIndex])) {
                      handleRemoveThumbnail(e);
                    } else {
                      handleSetThumbnail(medias[selectedIndex], e);
                    }
                  }}
                  disabled={settingThumbnail === medias[selectedIndex].id}
                  title={isThumbnail(medias[selectedIndex]) ? 'Retirer l\'image à la une' : 'Définir comme image à la une'}
                >
                  {settingThumbnail === medias[selectedIndex].id ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Star className={`w-5 h-5 ${isThumbnail(medias[selectedIndex]) ? 'fill-current' : ''}`} />
                  )}
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(medias[selectedIndex]);
                }}
                disabled={downloading === medias[selectedIndex].id}
              >
                {downloading === medias[selectedIndex].id ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Download className="w-5 h-5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                onClick={closeLightbox}
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

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
                {isThumbnail(medias[selectedIndex]) && (
                  <p className="text-secondary text-sm mb-1 flex items-center justify-center gap-1">
                    <Star className="w-4 h-4 fill-current" />
                    Image à la une
                  </p>
                )}
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
