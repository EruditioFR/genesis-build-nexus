import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, Film } from 'lucide-react';

const YOUTUBE_ID = 'afoWU3vDcOg';

const VideoPreviewSectionV3 = () => {
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, handleClose]);

  return (
    <>
      <section className="relative py-20 md:py-32 bg-[hsl(var(--navy))] overflow-hidden">
        {/* Decorative gold blobs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[hsl(var(--gold))]/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[hsl(var(--terracotta))]/10 rounded-full blur-[120px] pointer-events-none" />
        
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--gold-light)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--gold-light)) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-16 max-w-3xl mx-auto"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--gold))]/15 border border-[hsl(var(--gold))]/30 backdrop-blur-sm mb-6">
              <Film className="h-4 w-4 text-[hsl(var(--gold-light))]" />
              <span className="text-sm font-medium text-[hsl(var(--gold-light))] tracking-wide uppercase">
                Démo
              </span>
            </div>

            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-5 leading-[1.1] tracking-tight">
              Découvrez Family Garden{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--gold-light))] via-[hsl(var(--gold))] to-[hsl(var(--terracotta-light))]">
                en mouvement
              </span>
            </h2>
            <p className="text-white/70 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto">
              Une minute pour voir comment vous allez créer, organiser et partager vos souvenirs de famille.
            </p>
          </motion.div>

          {/* Video Player */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="max-w-5xl mx-auto"
          >
            {/* Glow underneath */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-[hsl(var(--gold))]/30 via-[hsl(var(--terracotta))]/20 to-[hsl(var(--gold))]/30 rounded-3xl blur-2xl opacity-60" />
              
              {/* Player frame */}
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                aria-label="Lire la vidéo de présentation"
                className="relative block w-full cursor-pointer group rounded-2xl overflow-hidden bg-black border border-white/10 shadow-[0_30px_80px_-20px_hsl(var(--navy)/0.8)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--gold))]"
              >
                {/* Browser-like top bar */}
                <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-b from-[hsl(220,30%,15%)] to-[hsl(220,30%,12%)] border-b border-white/5">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[hsl(0,70%,55%)]/80" />
                    <span className="w-3 h-3 rounded-full bg-[hsl(40,80%,55%)]/80" />
                    <span className="w-3 h-3 rounded-full bg-[hsl(140,50%,50%)]/80" />
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="h-6 rounded-md bg-white/5 border border-white/5 px-3 flex items-center">
                      <span className="text-xs text-white/40 font-mono">familygarden.fr</span>
                    </div>
                  </div>
                </div>

                {/* Video thumbnail area */}
                <div className="relative aspect-video bg-black">
                  <img
                    src={`https://img.youtube.com/vi/${YOUTUBE_ID}/hqdefault.jpg`}
                    alt="Aperçu de la démo Family Garden"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                    loading="lazy"
                    width={480}
                    height={360}
                  />
                  {/* Vignette overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                  
                  {/* Play button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      {/* Pulsing ring */}
                      <span className="absolute inset-0 rounded-full bg-[hsl(var(--gold))]/40 animate-ping" />
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[hsl(var(--gold))] to-[hsl(var(--terracotta))] flex items-center justify-center shadow-[0_15px_50px_-10px_hsl(var(--gold)/0.8)] transition-transform duration-300 group-hover:scale-110">
                        <Play className="w-8 h-8 sm:w-10 sm:h-10 text-[hsl(var(--navy))] fill-[hsl(var(--navy))] ml-1.5" />
                      </div>
                    </div>
                  </div>

                  {/* Bottom info bar */}
                  <div className="absolute bottom-0 left-0 right-0 px-6 py-4 flex items-center justify-between">
                    <span className="text-white/90 text-sm font-medium">
                      Visite guidée — 1 min
                    </span>
                    <span className="text-white/60 text-xs uppercase tracking-widest hidden sm:inline">
                      HD · Sans son nécessaire
                    </span>
                  </div>
                </div>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="relative w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl bg-black"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={handleClose}
                aria-label="Fermer la vidéo"
                className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              <iframe
                src={`https://www.youtube.com/embed/${YOUTUBE_ID}?autoplay=1&rel=0`}
                title="Démo Family Garden"
                className="w-full aspect-video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default VideoPreviewSectionV3;
