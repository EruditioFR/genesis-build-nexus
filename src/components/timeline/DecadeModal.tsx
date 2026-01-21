import { motion } from 'framer-motion';
import { Calendar, ChevronRight, ArrowLeft, ImageIcon, Video } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface YearData {
  count: number;
  thumbnails: string[];
  hasVideo: boolean;
}

interface DecadeModalProps {
  decade: string | null;
  years: Record<string, YearData>;
  onClose: () => void;
  onYearClick: (year: string) => void;
}

const DecadeModal = ({ decade, years, onClose, onYearClick }: DecadeModalProps) => {
  const sortedYears = Object.entries(years).sort(([a], [b]) => parseInt(b) - parseInt(a));
  const totalCapsules = Object.values(years).reduce((sum, data) => sum + data.count, 0);

  return (
    <Dialog open={!!decade} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        {/* Header avec gradient */}
        <div className="bg-gradient-to-r from-secondary to-primary p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display font-bold text-white flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Années {decade}
            </DialogTitle>
          </DialogHeader>
          <p className="text-white/80 mt-2">
            {totalCapsules} souvenir{totalCapsules > 1 ? 's' : ''} dans cette décennie
          </p>
        </div>

        {/* Liste des années */}
        <ScrollArea className="max-h-[60vh]">
          <div className="p-4 space-y-2">
            {sortedYears.map(([year, data], index) => (
              <motion.button
                key={year}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onYearClick(year)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-secondary/50 hover:bg-secondary/5 transition-all group"
              >
                {/* Vignettes */}
                <div className="flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden bg-muted">
                  {data.thumbnails.length > 0 ? (
                    <div className="w-full h-full grid grid-cols-2 gap-px">
                      {data.thumbnails.slice(0, 2).map((url, i) => (
                        <div key={i} className="relative overflow-hidden bg-muted">
                          <img 
                            src={url} 
                            alt="" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                      {data.thumbnails.length === 1 && (
                        <div className="bg-secondary/10 flex items-center justify-center">
                          <ImageIcon className="w-3 h-3 text-secondary/50" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-full bg-secondary/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-secondary/50" />
                    </div>
                  )}
                </div>

                {/* Infos */}
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg text-foreground">{year}</span>
                    {data.hasVideo && (
                      <Video className="w-3.5 h-3.5 text-purple-500" />
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {data.count} souvenir{data.count > 1 ? 's' : ''}
                    {data.thumbnails.length > 0 && (
                      <span className="text-secondary"> · {data.thumbnails.length} média{data.thumbnails.length > 1 ? 's' : ''}</span>
                    )}
                  </span>
                </div>

                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-secondary group-hover:translate-x-1 transition-all flex-shrink-0" />
              </motion.button>
            ))}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/30">
          <Button variant="outline" onClick={onClose} className="w-full gap-2">
            <ArrowLeft className="w-4 h-4" />
            Retour aux décennies
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DecadeModal;
