import { motion } from 'framer-motion';
import { FileText, Image, Video, Music, Layers, Lock, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFeatureAccess, type CapsuleTypeKey } from '@/hooks/useFeatureAccess';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
  const { canCreateCapsuleType, getUpgradePathForFeature, isFree } = useFeatureAccess();

  const handleClick = (type: CapsuleType) => {
    if (canCreateCapsuleType(type as CapsuleTypeKey)) {
      onChange(type);
    }
  };

  const getFeatureKey = (type: CapsuleType): 'canCreateVideoCapsule' | 'canCreateAudioCapsule' | 'canCreateMixedCapsule' | null => {
    switch (type) {
      case 'video': return 'canCreateVideoCapsule';
      case 'audio': return 'canCreateAudioCapsule';
      case 'mixed': return 'canCreateMixedCapsule';
      default: return null;
    }
  };

  return (
    <TooltipProvider>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {types.map((type, index) => {
          const isSelected = value === type.value;
          const Icon = type.icon;
          const canUse = canCreateCapsuleType(type.value as CapsuleTypeKey);
          const featureKey = getFeatureKey(type.value);
          const upgradePath = featureKey ? getUpgradePathForFeature(featureKey) : null;
          
          const button = (
            <motion.button
              key={type.value}
              type="button"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              onClick={() => handleClick(type.value)}
              disabled={!canUse}
              className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                !canUse
                  ? 'border-border bg-muted/30 opacity-60 cursor-not-allowed'
                  : isSelected
                    ? 'border-secondary bg-secondary/10 shadow-gold'
                    : 'border-border bg-card hover:border-secondary/50 hover:bg-muted/50'
              }`}
            >
              {!canUse && (
                <div className="absolute top-2 right-2">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${
                !canUse
                  ? 'bg-muted/50 text-muted-foreground'
                  : isSelected 
                    ? 'bg-secondary text-secondary-foreground' 
                    : 'bg-muted text-muted-foreground'
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className={`font-medium text-sm ${
                !canUse
                  ? 'text-muted-foreground'
                  : isSelected 
                    ? 'text-secondary' 
                    : 'text-foreground'
              }`}>
                {type.label}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {type.description}
              </p>
              {!canUse && upgradePath && (
                <Badge variant="outline" className="mt-2 text-xs gap-1">
                  <Crown className="w-3 h-3" />
                  {upgradePath === 'premium' ? 'Premium' : 'Héritage'}
                </Badge>
              )}
            </motion.button>
          );

          if (!canUse && upgradePath) {
            return (
              <Tooltip key={type.value}>
                <TooltipTrigger asChild>
                  {button}
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[200px]">
                  <p className="text-sm">
                    Les capsules {type.label.toLowerCase()} sont disponibles avec le forfait {upgradePath === 'premium' ? 'Premium' : 'Héritage'}.
                  </p>
                  <Link 
                    to={`/premium${upgradePath === 'heritage' ? '?tier=heritage' : ''}`}
                    className="text-secondary text-sm font-medium hover:underline block mt-1"
                  >
                    Voir les forfaits →
                  </Link>
                </TooltipContent>
              </Tooltip>
            );
          }

          return button;
        })}
      </div>
    </TooltipProvider>
  );
};

export default CapsuleTypeSelector;
