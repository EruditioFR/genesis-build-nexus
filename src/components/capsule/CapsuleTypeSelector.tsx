import { motion } from 'framer-motion';
import { FileText, Image, Video, Music, Layers } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type CapsuleType = Database['public']['Enums']['capsule_type'];

interface CapsuleTypeSelectorProps {
  value: CapsuleType;
  onChange: (type: CapsuleType) => void;
}

const types: { value: CapsuleType; label: string; icon: typeof FileText; description: string }[] = [
  { value: 'text', label: 'Texte', icon: FileText, description: 'Lettre, récit, poème' },
  { value: 'photo', label: 'Photo', icon: Image, description: 'Images et albums' },
  { value: 'video', label: 'Vidéo', icon: Video, description: 'Clips et souvenirs filmés' },
  { value: 'audio', label: 'Audio', icon: Music, description: 'Messages vocaux, musique' },
  { value: 'mixed', label: 'Mixte', icon: Layers, description: 'Plusieurs types de médias' },
];

const CapsuleTypeSelector = ({ value, onChange }: CapsuleTypeSelectorProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {types.map((type, index) => {
        const isSelected = value === type.value;
        const Icon = type.icon;
        
        return (
          <motion.button
            key={type.value}
            type="button"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            onClick={() => onChange(type.value)}
            className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
              isSelected
                ? 'border-secondary bg-secondary/10 shadow-gold'
                : 'border-border bg-card hover:border-secondary/50 hover:bg-muted/50'
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${
              isSelected ? 'bg-secondary text-secondary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className={`font-medium text-sm ${isSelected ? 'text-secondary' : 'text-foreground'}`}>
              {type.label}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
              {type.description}
            </p>
          </motion.button>
        );
      })}
    </div>
  );
};

export default CapsuleTypeSelector;
