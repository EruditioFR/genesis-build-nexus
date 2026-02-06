import { motion } from 'framer-motion';
import { Calendar, ChevronRight, ArrowLeft, Video } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('dashboard');
  const sortedYears = Object.entries(years).sort(([a], [b]) => parseInt(b) - parseInt(a));
  const totalCapsules = Object.values(years).reduce((sum, data) => sum + data.count, 0);

  return (
    <Dialog open={!!decade} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        {/* Header - clear and readable */}
        <div className="bg-secondary p-6 text-secondary-foreground">
          <DialogHeader>
            <DialogTitle className="text-2xl sm:text-3xl font-bold text-secondary-foreground flex items-center gap-3">
              <Calendar className="w-8 h-8" />
              {t('timeline.decadeTitle', { decade })}
            </DialogTitle>
          </DialogHeader>
          <p className="text-lg text-secondary-foreground/80 mt-3">
            {totalCapsules} {t('timeline.decade.memoriesInDecade', { count: totalCapsules })}
          </p>
        </div>

        {/* Year list - large touch targets */}
        <ScrollArea className="max-h-[55vh]">
          <div className="p-4 space-y-3">
            {sortedYears.map(([year, data], index) => (
              <motion.button
                key={year}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onYearClick(year)}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-card border-2 border-border hover:border-secondary/50 hover:bg-secondary/5 transition-all group focus:outline-none focus:ring-4 focus:ring-secondary/50"
                aria-label={`${year}, ${data.count} ${t('timeline.memories', { count: data.count })}`}
              >
                {/* Thumbnail - larger */}
                <div className="flex-shrink-0 w-18 h-14 rounded-lg overflow-hidden bg-muted">
                  {data.thumbnails.length === 0 ? (
                    <div className="w-full h-full bg-secondary/10 flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-secondary/50" />
                    </div>
                  ) : data.thumbnails.length === 1 ? (
                    <img src={data.thumbnails[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full grid grid-cols-2 gap-px">
                      {data.thumbnails.slice(0, 2).map((url, i) => (
                        <img key={i} src={url} alt="" className="w-full h-full object-cover" />
                      ))}
                    </div>
                  )}
                </div>

                {/* Year info - larger text */}
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-2xl text-foreground">{year}</span>
                    {data.hasVideo && (
                      <Video className="w-5 h-5 text-purple-500" />
                    )}
                  </div>
                  <span className="text-base text-muted-foreground">
                    {t('timeline.memories', { count: data.count })}
                  </span>
                </div>

                {/* Navigation arrow - larger */}
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center group-hover:bg-secondary/10 transition-colors">
                  <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-secondary transition-colors" />
                </div>
              </motion.button>
            ))}
          </div>
        </ScrollArea>

        {/* Footer - large button */}
        <div className="p-4 border-t-2 border-border bg-muted/30">
          <Button 
            variant="outline" 
            onClick={onClose} 
            size="lg"
            className="w-full h-14 text-lg font-semibold gap-3 border-2"
          >
            <ArrowLeft className="w-6 h-6" />
            {t('timeline.decade.backToDecades')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DecadeModal;
