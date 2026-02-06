import { motion } from 'framer-motion';
import { Clock, Filter, Plus, X, Sparkles, Star, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface TimelineEmptyProps {
  type: 'no-capsules' | 'no-results';
  onClearFilters?: () => void;
}

const TimelineEmpty = ({ type, onClearFilters }: TimelineEmptyProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation('dashboard');

  if (type === 'no-capsules') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden text-center py-16 bg-gradient-to-br from-amber-50 via-rose-50 to-violet-50 dark:from-amber-950/20 dark:via-rose-950/20 dark:to-violet-950/20 rounded-3xl border-2 border-amber-200/50 dark:border-amber-800/30 shadow-lg"
      >
        {/* Decorative floating elements */}
        <motion.div 
          animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute top-6 left-8 text-3xl"
        >
          📷
        </motion.div>
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
          className="absolute top-10 right-12 text-2xl"
        >
          ✨
        </motion.div>
        <motion.div 
          animate={{ y: [0, -12, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
          className="absolute bottom-12 left-16 text-2xl"
        >
          🎵
        </motion.div>
        <motion.div 
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
          className="absolute bottom-8 right-20 text-xl"
        >
          💫
        </motion.div>

        {/* Main icon */}
        <div className="relative w-28 h-28 rounded-3xl bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 mx-auto mb-8 flex items-center justify-center shadow-xl shadow-orange-200/50 dark:shadow-orange-900/30">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Clock className="w-14 h-14 text-white" />
          </motion.div>
          <motion.div
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 rounded-3xl border-4 border-amber-300/50"
          />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            className="absolute -top-2 -right-2"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
          </motion.div>
        </div>
        
        <h2 className="text-2xl sm:text-3xl font-display font-bold mb-4">
          <span className="bg-gradient-to-r from-amber-600 via-orange-500 to-rose-500 bg-clip-text text-transparent">
            {t('timeline.emptyTitle')} 🌟
          </span>
        </h2>
        <p className="text-muted-foreground mb-8 max-w-sm mx-auto text-base">
          {t('timeline.emptySubtitle')}
        </p>
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={() => navigate('/capsules/new')}
            size="lg"
            className="gap-3 h-14 px-8 text-lg bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:via-orange-600 hover:to-rose-600 text-white shadow-xl shadow-orange-200 dark:shadow-orange-900/30 rounded-2xl border-0"
          >
            <Plus className="w-6 h-6" />
            {t('timeline.createFirst')}
            <span className="text-xl">✨</span>
          </Button>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex items-center justify-center gap-3 text-sm text-muted-foreground"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Heart className="w-5 h-5 text-rose-400" />
          </motion.div>
          <span>{t('timeline.emptyAutoOrganized')}</span>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden text-center py-16 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950/20 dark:via-blue-950/20 dark:to-indigo-950/20 rounded-3xl border-2 border-slate-200/50 dark:border-slate-800/30 shadow-lg"
    >
      {/* Decorative elements */}
      <motion.div 
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute top-8 right-12 text-xl opacity-50"
      >
        🔍
      </motion.div>

      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-slate-400 to-indigo-500 mx-auto mb-8 flex items-center justify-center shadow-xl">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Filter className="w-12 h-12 text-white" />
        </motion.div>
      </div>
      
      <h2 className="text-xl sm:text-2xl font-display font-bold mb-4">
        <span className="bg-gradient-to-r from-slate-600 to-indigo-600 bg-clip-text text-transparent">
          {t('timeline.noResults')} 🤔
        </span>
      </h2>
      <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
        {t('timeline.noResultsSubtitle')}
      </p>
      
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          variant="outline"
          onClick={onClearFilters}
          className="gap-2 h-12 px-6 rounded-xl border-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
        >
          <X className="w-5 h-5" />
          {t('timeline.clearFilters')}
          <span>🔄</span>
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default TimelineEmpty;
