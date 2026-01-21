import { motion } from 'framer-motion';
import { 
  Camera, Radio, Disc3, Sparkles, 
  Tv, Smartphone, Leaf, Music2, ChevronRight
} from 'lucide-react';

interface DecadeGridProps {
  decades: string[];
  decadeCounts: Record<string, number>;
  onDecadeClick: (decade: string) => void;
}

// Configuration des icônes et styles par décennie
const decadeConfig: Record<string, { 
  icon: typeof Camera; 
  label: string; 
  emoji: string;
  gradient: string;
  description: string;
}> = {
  '1940': { 
    icon: Camera, 
    label: 'Années 40',
    emoji: '📷',
    gradient: 'from-amber-700 to-amber-900',
    description: 'Années de guerre'
  },
  '1950': { 
    icon: Radio, 
    label: 'Années 50',
    emoji: '📻',
    gradient: 'from-amber-600 to-amber-800',
    description: 'Rock\'n\'roll'
  },
  '1960': { 
    icon: Sparkles, 
    label: 'Années 60',
    emoji: '✌️',
    gradient: 'from-pink-500 to-orange-400',
    description: 'Flower Power'
  },
  '1970': { 
    icon: Disc3, 
    label: 'Années 70',
    emoji: '🕺',
    gradient: 'from-orange-500 to-yellow-500',
    description: 'Disco Fever'
  },
  '1980': { 
    icon: Tv, 
    label: 'Années 80',
    emoji: '📼',
    gradient: 'from-purple-500 to-pink-500',
    description: 'Neon & Synth'
  },
  '1990': { 
    icon: Music2, 
    label: 'Années 90',
    emoji: '💿',
    gradient: 'from-cyan-500 to-teal-500',
    description: 'Grunge & Pop'
  },
  '2000': { 
    icon: Smartphone, 
    label: 'Années 2000',
    emoji: '📱',
    gradient: 'from-indigo-500 to-blue-500',
    description: 'Ère digitale'
  },
  '2010': { 
    icon: Camera, 
    label: 'Années 2010',
    emoji: '📸',
    gradient: 'from-pink-500 to-purple-500',
    description: 'Réseaux sociaux'
  },
  '2020': { 
    icon: Leaf, 
    label: 'Années 2020',
    emoji: '🌿',
    gradient: 'from-emerald-500 to-teal-500',
    description: 'Ère moderne'
  },
};

const getDecadeConfig = (decade: string) => {
  return decadeConfig[decade] || {
    icon: Camera,
    label: `Années ${decade}`,
    emoji: '📅',
    gradient: 'from-secondary to-primary',
    description: `Décennie ${decade}`
  };
};

const DecadeGrid = ({ decades, decadeCounts, onDecadeClick }: DecadeGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {decades.map((decade, index) => {
        const config = getDecadeConfig(decade);
        const Icon = config.icon;
        const count = decadeCounts[decade] || 0;

        return (
          <motion.button
            key={decade}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onDecadeClick(decade)}
            className={`relative overflow-hidden rounded-2xl p-5 sm:p-6 text-left bg-gradient-to-br ${config.gradient} text-white shadow-lg hover:shadow-xl transition-shadow group`}
          >
            {/* Fond décoratif */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2" />
            
            {/* Contenu */}
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-3xl">{config.emoji}</span>
              </div>
              
              <h3 className="font-display font-bold text-2xl sm:text-3xl mb-1">
                {decade}
              </h3>
              <p className="text-white/80 text-sm mb-3">
                {config.description}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium">
                  {count} souvenir{count > 1 ? 's' : ''}
                </span>
                <ChevronRight className="w-5 h-5 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
};

export default DecadeGrid;
