import { motion } from 'framer-motion';
import { 
  Camera, Radio, Disc3, Sparkles, 
  Tv, Smartphone, Leaf, Music2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DecadeNavigationProps {
  decades: string[];
  activeDecade: string | null;
  onDecadeClick: (decade: string) => void;
}

// Icônes par décennie
const decadeIcons: Record<string, typeof Camera> = {
  '1940': Camera,
  '1950': Radio,
  '1960': Sparkles,
  '1970': Disc3,
  '1980': Tv,
  '1990': Music2,
  '2000': Smartphone,
  '2010': Camera,
  '2020': Leaf,
};

const DecadeNavigation = ({ decades, activeDecade, onDecadeClick }: DecadeNavigationProps) => {
  if (decades.length <= 1) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 mb-6 bg-background/95 backdrop-blur-lg border-b border-border shadow-sm"
    >
      <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <span className="text-xs text-muted-foreground mr-1 font-medium whitespace-nowrap hidden sm:inline">
          Naviguer :
        </span>
        {decades.map((decade) => {
          const Icon = decadeIcons[decade] || Camera;
          const isActive = activeDecade === decade;
          
          return (
            <Button
              key={decade}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => onDecadeClick(decade)}
              className={`flex-shrink-0 gap-1.5 text-xs sm:text-sm font-medium transition-all h-9 px-3 ${
                isActive
                  ? 'bg-gradient-to-r from-secondary to-primary text-primary-foreground shadow-lg scale-105'
                  : 'hover:border-secondary hover:text-secondary hover:bg-secondary/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">{decade}</span>
              <span className="xs:hidden">{decade.slice(2)}</span>
            </Button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default DecadeNavigation;
