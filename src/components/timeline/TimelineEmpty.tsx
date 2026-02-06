import { motion } from 'framer-motion';
import { Clock, Filter, Plus, X } from 'lucide-react';
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
        className="text-center py-12 sm:py-16 px-6 bg-card rounded-2xl border-2 border-border"
      >
        {/* Large icon */}
        <div className="w-24 h-24 rounded-2xl bg-secondary/10 border-2 border-secondary/20 mx-auto mb-6 flex items-center justify-center">
          <Clock className="w-12 h-12 text-secondary" />
        </div>
        
        {/* Large text */}
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
          {t('timeline.emptyTitle')}
        </h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
          {t('timeline.emptySubtitle')}
        </p>
        
        {/* Large touch target button */}
        <Button
          onClick={() => navigate('/capsules/new')}
          size="lg"
          className="h-14 px-8 text-lg font-semibold gap-3 bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-md"
        >
          <Plus className="w-6 h-6" />
          {t('timeline.createFirst')}
        </Button>
        
        <p className="mt-8 text-base text-muted-foreground">
          {t('timeline.emptyAutoOrganized')}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-12 sm:py-16 px-6 bg-card rounded-2xl border-2 border-border"
    >
      {/* Large icon */}
      <div className="w-20 h-20 rounded-2xl bg-muted border-2 border-border mx-auto mb-6 flex items-center justify-center">
        <Filter className="w-10 h-10 text-muted-foreground" />
      </div>
      
      {/* Large text */}
      <h2 className="text-2xl font-bold text-foreground mb-4">
        {t('timeline.noResults')}
      </h2>
      <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
        {t('timeline.noResultsSubtitle')}
      </p>
      
      {/* Large touch target button */}
      <Button
        variant="outline"
        onClick={onClearFilters}
        size="lg"
        className="h-14 px-8 text-lg font-semibold gap-3 border-2"
      >
        <X className="w-6 h-6" />
        {t('timeline.clearFilters')}
      </Button>
    </motion.div>
  );
};

export default TimelineEmpty;
