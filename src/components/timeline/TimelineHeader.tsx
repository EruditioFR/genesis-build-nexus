import { motion } from 'framer-motion';
import { Clock, Play, Sparkles, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TimelineHeaderProps {
  filteredCount: number;
  totalCount: number;
  activeFiltersCount: number;
  storyLoading: boolean;
  onLaunchStory: () => void;
  hasCapules: boolean;
}

const TimelineHeader = ({
  filteredCount,
  totalCount,
  activeFiltersCount,
  storyLoading,
  onLaunchStory,
  hasCapules,
}: TimelineHeaderProps) => {
  const { t } = useTranslation('dashboard');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      {/* Playful header card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-50 via-fuchsia-50 to-rose-50 dark:from-violet-950/30 dark:via-fuchsia-950/30 dark:to-rose-950/30 p-6 sm:p-8 border-2 border-violet-200/50 dark:border-violet-800/30 shadow-lg">
        {/* Decorative floating elements */}
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute top-3 right-6 text-2xl"
        >
          ⏳
        </motion.div>
        <motion.div 
          animate={{ y: [0, -8, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 0.3 }}
          className="absolute top-8 right-20 text-xl"
        >
          📸
        </motion.div>
        <motion.div 
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 3, repeat: Infinity, delay: 0.6 }}
          className="absolute bottom-6 right-12 text-lg"
        >
          🎬
        </motion.div>
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-12 right-36 text-sm opacity-60"
        >
          ✨
        </motion.div>

        <div className="text-center relative z-10">
          {/* Main icon with animation */}
          <div className="relative inline-flex items-center justify-center w-24 h-24 mb-5">
            <motion.div 
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-400 via-fuchsia-400 to-rose-400 opacity-30 blur-xl" 
            />
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-rose-500 shadow-xl shadow-fuchsia-200 dark:shadow-fuchsia-900/30 flex items-center justify-center"
            >
              <Clock className="w-10 h-10 text-white" />
            </motion.div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute -top-2 -right-2"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 flex items-center justify-center shadow-lg">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </motion.div>
          </div>

          {/* Title with gradient */}
          <h1 className="text-3xl sm:text-4xl font-display font-bold mb-3">
            <span className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-600 bg-clip-text text-transparent">
              {t('timeline.header.title')} 🗓️
            </span>
          </h1>
          
          {/* Playful counter badge */}
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/80 dark:bg-black/20 backdrop-blur-sm border-2 border-fuchsia-200 dark:border-fuchsia-800 shadow-md mb-4"
          >
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Star className="h-6 w-6 text-amber-500" />
            </motion.div>
            <div className="flex flex-col items-start">
              <span className="text-xl font-bold text-foreground">
                {filteredCount} {t('timeline.memories', { count: filteredCount })} 🎯
              </span>
              {activeFiltersCount > 0 && (
                <span className="text-xs text-muted-foreground">
                  ({t('timeline.header.outOf', { total: totalCount })})
                </span>
              )}
            </div>
          </motion.div>
          
          <p className="text-sm text-muted-foreground/80 mb-5">
            {t('timeline.header.organizedBy')} ✨
          </p>
          
          {/* Launch story button - Playful design */}
          {hasCapules && filteredCount > 0 && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={onLaunchStory}
                disabled={storyLoading}
                size="lg"
                className="gap-3 h-14 px-8 text-lg bg-gradient-to-r from-violet-500 via-fuchsia-500 to-rose-500 hover:from-violet-600 hover:via-fuchsia-600 hover:to-rose-600 text-white shadow-xl shadow-fuchsia-200 dark:shadow-fuchsia-900/30 rounded-2xl border-0"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Play className="w-6 h-6" />
                </motion.div>
                {storyLoading ? t('timeline.header.loadingStory') : t('timeline.header.launchStory')}
                <span className="text-xl">🎬</span>
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TimelineHeader;
