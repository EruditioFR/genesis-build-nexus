import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, ChevronRight, ArrowLeft } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DecadeModalProps {
  decade: string | null;
  years: Record<string, number>; // year -> count
  onClose: () => void;
  onYearClick: (year: string) => void;
}

const DecadeModal = ({ decade, years, onClose, onYearClick }: DecadeModalProps) => {
  const sortedYears = Object.entries(years).sort(([a], [b]) => parseInt(b) - parseInt(a));
  const totalCapsules = Object.values(years).reduce((sum, count) => sum + count, 0);

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
            {sortedYears.map(([year, count], index) => (
              <motion.button
                key={year}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onYearClick(year)}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:border-secondary/50 hover:bg-secondary/5 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <span className="font-bold text-secondary">{year.slice(2)}</span>
                  </div>
                  <div className="text-left">
                    <span className="font-semibold text-foreground block">{year}</span>
                    <span className="text-sm text-muted-foreground">
                      {count} souvenir{count > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-secondary group-hover:translate-x-1 transition-all" />
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
