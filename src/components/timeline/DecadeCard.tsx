import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Camera, Radio, Disc3, Sparkles, 
  Tv, Smartphone, Leaf, Music2
} from 'lucide-react';
import { ReactNode } from 'react';

interface DecadeCardProps {
  decade: string;
  children: ReactNode;
  capsuleCount: number;
}

// Configuration des icônes et styles par décennie
const decadeConfig: Record<string, { 
  icon: typeof Camera; 
  emoji: string;
  gradient: string;
  iconBg: string;
}> = {
  '1940': { 
    icon: Camera, 
    emoji: '📷',
    gradient: 'from-amber-700 to-amber-900',
    iconBg: 'bg-amber-800'
  },
  '1950': { 
    icon: Radio, 
    emoji: '📻',
    gradient: 'from-amber-600 to-amber-800',
    iconBg: 'bg-amber-700'
  },
  '1960': { 
    icon: Sparkles, 
    emoji: '✌️',
    gradient: 'from-pink-500 to-orange-400',
    iconBg: 'bg-pink-500'
  },
  '1970': { 
    icon: Disc3, 
    emoji: '🕺',
    gradient: 'from-orange-500 to-yellow-500',
    iconBg: 'bg-orange-500'
  },
  '1980': { 
    icon: Tv, 
    emoji: '📼',
    gradient: 'from-purple-500 to-pink-500',
    iconBg: 'bg-purple-500'
  },
  '1990': { 
    icon: Music2, 
    emoji: '💿',
    gradient: 'from-cyan-500 to-teal-500',
    iconBg: 'bg-cyan-500'
  },
  '2000': { 
    icon: Smartphone, 
    emoji: '📱',
    gradient: 'from-indigo-500 to-blue-500',
    iconBg: 'bg-indigo-500'
  },
  '2010': { 
    icon: Camera, 
    emoji: '📸',
    gradient: 'from-pink-500 to-purple-500',
    iconBg: 'bg-pink-500'
  },
  '2020': { 
    icon: Leaf, 
    emoji: '🌿',
    gradient: 'from-emerald-500 to-teal-500',
    iconBg: 'bg-emerald-500'
  },
};

const getDecadeConfig = (decade: string) => {
  return decadeConfig[decade] || {
    icon: Camera,
    emoji: '📅',
    gradient: 'from-secondary to-primary',
    iconBg: 'bg-secondary'
  };
};

const DecadeCard = ({ decade, children, capsuleCount }: DecadeCardProps) => {
  const { t } = useTranslation('dashboard');
  const config = getDecadeConfig(decade);
  const Icon = config.icon;

  // Get localized decade label
  const getDecadeLabel = (): string => {
    const labelKey = `timeline.decade.labels.${decade}`;
    const translated = t(labelKey);
    // If key not found, use default format
    if (translated === labelKey) {
      return t('timeline.decade.labels.default', { decade });
    }
    return translated;
  };

  return (
    <div 
      id={`decade-${decade}`} 
      className={`relative decade-bg-${decade} rounded-3xl mx-[-1rem] sm:mx-0 px-4 sm:px-6 py-6 sm:py-8 mb-6 transition-colors duration-500`}
    >
      {/* En-tête de décennie */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center justify-center mb-8"
      >
        {/* Badge principal */}
        <div className={`relative flex items-center gap-3 px-6 py-3 bg-gradient-to-r ${config.gradient} text-white rounded-2xl shadow-lg mb-3`}>
          <div className={`w-10 h-10 rounded-xl ${config.iconBg} bg-opacity-30 flex items-center justify-center`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="text-left">
            <div className="font-display font-bold text-xl sm:text-2xl">
              {decade}
            </div>
            <div className="text-xs sm:text-sm opacity-90 font-medium">
              {getDecadeLabel()}
            </div>
          </div>
          <span className="text-2xl ml-2 hidden sm:block">{config.emoji}</span>
        </div>
        
        {/* Compteur de souvenirs */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="px-4 py-1.5 bg-card/80 backdrop-blur-sm rounded-full border border-border text-sm text-muted-foreground"
        >
          {t('timeline.memories', { count: capsuleCount })}
        </motion.div>
      </motion.div>

      {children}
    </div>
  );
};

export default DecadeCard;
