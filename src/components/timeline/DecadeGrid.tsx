import { motion } from 'framer-motion';
import { ChevronRight, ImageIcon, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface DecadeGridProps {
  decades: string[];
  decadeCounts: Record<string, number>;
  decadeThumbnails: Record<string, string[]>;
  onDecadeClick: (decade: string) => void;
}

// Simplified decade colors - high contrast, easy to distinguish
const decadeColors: Record<string, string> = {
  '1940': 'from-amber-600 to-amber-700',
  '1950': 'from-orange-500 to-orange-600',
  '1960': 'from-rose-500 to-rose-600',
  '1970': 'from-amber-500 to-orange-500',
  '1980': 'from-purple-500 to-purple-600',
  '1990': 'from-teal-500 to-teal-600',
  '2000': 'from-blue-500 to-blue-600',
  '2010': 'from-pink-500 to-pink-600',
  '2020': 'from-emerald-500 to-emerald-600',
};

const getDecadeColor = (decade: string): string => {
  return decadeColors[decade] || 'from-secondary to-secondary/80';
};

const DecadeGrid = ({ decades, decadeCounts, decadeThumbnails, onDecadeClick }: DecadeGridProps) => {
  const { t } = useTranslation('dashboard');

  const getDecadeLabel = (decade: string): string => {
    const labelKey = `timeline.decade.labels.${decade}`;
    const translated = t(labelKey);
    return translated !== labelKey ? translated : t('timeline.decade.labels.default', { decade });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {decades.map((decade, index) => {
        const count = decadeCounts[decade] || 0;
        const thumbnails = decadeThumbnails[decade] || [];
        const gradient = getDecadeColor(decade);

        return (
          <motion.button
            key={decade}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            onClick={() => onDecadeClick(decade)}
            className="relative overflow-hidden rounded-2xl text-left shadow-md hover:shadow-lg transition-shadow group min-h-[140px] focus:outline-none focus:ring-4 focus:ring-secondary/50"
            aria-label={`${getDecadeLabel(decade)}, ${count} ${t('timeline.memories', { count })}`}
          >
            {/* Background with thumbnails or gradient */}
            {thumbnails.length > 0 ? (
              <div className="absolute inset-0">
                {thumbnails.length === 1 ? (
                  <img src={thumbnails[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full grid grid-cols-2 gap-0.5">
                    {thumbnails.slice(0, 4).map((url, i) => (
                      <img key={i} src={url} alt="" className="w-full h-full object-cover" />
                    ))}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/40" />
              </div>
            ) : (
              <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
            )}
            
            {/* Content - large text for readability */}
            <div className="relative z-10 p-5 sm:p-6 text-white h-full flex flex-col justify-end">
              {/* Decade number - very prominent */}
              <div className="mb-2">
                <span className="text-3xl sm:text-4xl font-bold drop-shadow-lg">
                  {decade}'s
                </span>
              </div>
              
              {/* Label */}
              <p className="text-base sm:text-lg font-medium text-white/90 mb-3 drop-shadow">
                {getDecadeLabel(decade)}
              </p>
              
              {/* Count and navigation */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-base font-semibold">
                    <Calendar className="w-5 h-5" />
                    {count} {t('timeline.memories', { count })}
                  </span>
                  {thumbnails.length > 0 && (
                    <span className="flex items-center gap-1 text-sm text-white/80">
                      <ImageIcon className="w-4 h-4" />
                      {thumbnails.length > 4 ? '4+' : thumbnails.length}
                    </span>
                  )}
                </div>
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <ChevronRight className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
};

export default DecadeGrid;
