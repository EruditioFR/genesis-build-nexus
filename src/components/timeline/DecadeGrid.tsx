import { motion } from 'framer-motion';
import { 
  Camera, Radio, Disc3, Sparkles, 
  Tv, Smartphone, Leaf, Music2, ChevronRight, ImageIcon
} from 'lucide-react';

interface DecadeGridProps {
  decades: string[];
  decadeCounts: Record<string, number>;
  decadeThumbnails: Record<string, string[]>; // decade -> array of thumbnail URLs
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

const DecadeGrid = ({ decades, decadeCounts, decadeThumbnails, onDecadeClick }: DecadeGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {decades.map((decade, index) => {
        const config = getDecadeConfig(decade);
        const Icon = config.icon;
        const count = decadeCounts[decade] || 0;
        const thumbnails = decadeThumbnails[decade] || [];

        return (
          <motion.button
            key={decade}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onDecadeClick(decade)}
            className="relative overflow-hidden rounded-2xl text-left shadow-lg hover:shadow-xl transition-shadow group"
          >
            {/* Fond avec vignettes ou gradient - adapté au nombre d'images */}
            {thumbnails.length > 0 ? (
              <div className="absolute inset-0">
                {/* Grille adaptative selon le nombre d'images */}
                {thumbnails.length === 1 ? (
                  // 1 image : pleine largeur
                  <div className="absolute inset-0">
                    <img 
                      src={thumbnails[0]} 
                      alt="" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : thumbnails.length === 2 ? (
                  // 2 images : 2 colonnes
                  <div className="absolute inset-0 grid grid-cols-2 gap-0.5">
                    {thumbnails.map((url, i) => (
                      <div key={i} className="relative overflow-hidden">
                        <img 
                          src={url} 
                          alt="" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : thumbnails.length === 3 ? (
                  // 3 images : 1 grande + 2 petites
                  <div className="absolute inset-0 grid grid-cols-2 gap-0.5">
                    <div className="relative overflow-hidden row-span-2">
                      <img 
                        src={thumbnails[0]} 
                        alt="" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="relative overflow-hidden">
                      <img 
                        src={thumbnails[1]} 
                        alt="" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="relative overflow-hidden">
                      <img 
                        src={thumbnails[2]} 
                        alt="" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                ) : (
                  // 4+ images : grille 2x2
                  <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-0.5">
                    {thumbnails.slice(0, 4).map((url, i) => (
                      <div key={i} className="relative overflow-hidden">
                        <img 
                          src={url} 
                          alt="" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
                {/* Overlay gradient */}
                <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30`} />
              </div>
            ) : (
              <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient}`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2" />
              </div>
            )}
            
            {/* Contenu */}
            <div className="relative z-10 p-5 sm:p-6 text-white min-h-[180px] flex flex-col">
              <div className="flex items-start justify-between mb-auto">
                <div className={`w-11 h-11 rounded-xl ${thumbnails.length > 0 ? 'bg-white/20' : 'bg-white/20'} backdrop-blur-sm flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-2xl">{config.emoji}</span>
              </div>
              
              <div className="mt-4">
                <h3 className="font-display font-bold text-xl sm:text-2xl mb-3">
                  Années {decade}
                </h3>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium">
                      {count} souvenir{count > 1 ? 's' : ''}
                    </span>
                    {thumbnails.length > 0 && (
                      <span className="flex items-center gap-1 text-xs text-white/70">
                        <ImageIcon className="w-3 h-3" />
                        {thumbnails.length > 4 ? '4+' : thumbnails.length}
                      </span>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
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
