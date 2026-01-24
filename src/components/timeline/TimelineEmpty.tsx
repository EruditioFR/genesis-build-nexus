import { motion } from 'framer-motion';
import { Clock, Filter, Plus, X, Sparkles } from 'lucide-react';
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
        className="text-center py-16 bg-card rounded-3xl border border-border"
      >
        <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-secondary/20 to-primary/20 mx-auto mb-6 flex items-center justify-center">
          <Clock className="w-12 h-12 text-secondary" />
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 rounded-full border-2 border-secondary/30"
          />
        </div>
        
        <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground mb-3">
          {t('timeline.emptyTitle')}
        </h2>
        <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
          {t('timeline.emptySubtitle')}
        </p>
        
        <Button
          onClick={() => navigate('/capsules/new')}
          size="lg"
          className="gap-2 bg-gradient-to-r from-secondary to-primary hover:opacity-90 text-primary-foreground shadow-lg"
        >
          <Plus className="w-5 h-5" />
          {t('timeline.createFirst')}
        </Button>
        
        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="w-4 h-4 text-secondary" />
          <span>{t('timeline.emptyAutoOrganized')}</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-16 bg-card rounded-3xl border border-border"
    >
      <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-6 flex items-center justify-center">
        <Filter className="w-10 h-10 text-muted-foreground" />
      </div>
      
      <h2 className="text-xl font-semibold text-foreground mb-3">
        {t('timeline.noResults')}
      </h2>
      <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
        {t('timeline.noResultsSubtitle')}
      </p>
      
      <Button
        variant="outline"
        onClick={onClearFilters}
        className="gap-2"
      >
        <X className="w-4 h-4" />
        {t('timeline.clearFilters')}
      </Button>
    </motion.div>
  );
};

export default TimelineEmpty;
