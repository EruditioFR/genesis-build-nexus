import { motion } from 'framer-motion';
import { FileText, Image, Video, Music, Layers, Lock, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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

const typeConfigs: { value: CapsuleType; icon: typeof FileText }[] = [
  { value: 'text', icon: FileText },
  { value: 'photo', icon: Image },
  { value: 'video', icon: Video },
  { value: 'audio', icon: Music },
  { value: 'mixed', icon: Layers },
];

const CapsuleTypeSelector = ({ value, onChange }: CapsuleTypeSelectorProps) => {
  const { t } = useTranslation('capsules');
  const { canCreateCapsuleType, getUpgradePathForFeature } = useFeatureAccess();

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
        {typeConfigs.map((config, index) => {
          const isSelected = value === config.value;
          const Icon = config.icon;
          const canUse = canCreateCapsuleType(config.value as CapsuleTypeKey);
          const featureKey = getFeatureKey(config.value);
          const upgradePath = featureKey ? getUpgradePathForFeature(featureKey) : null;
          const label = t(`typeSelector.types.${config.value}.label`);
          const description = t(`typeSelector.types.${config.value}.description`);
          
          const button = (
            <motion.button
              key={config.value}
              type="button"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              onClick={() => handleClick(config.value)}
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
                {label}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {description}
              </p>
              {!canUse && upgradePath && (
                <Badge variant="outline" className="mt-2 text-xs gap-1">
                  <Crown className="w-3 h-3" />
                  {t(`typeSelector.upgradeBadge.${upgradePath}`)}
                </Badge>
              )}
            </motion.button>
          );

          if (!canUse && upgradePath) {
            return (
              <Tooltip key={config.value}>
                <TooltipTrigger asChild>
                  {button}
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[200px]">
                  <p className="text-sm">
                    {t('typeSelector.upgradeTooltip', { 
                      type: label.toLowerCase(), 
                      plan: t(`typeSelector.upgradeBadge.${upgradePath}`) 
                    })}
                  </p>
                  <Link 
                    to={`/premium${upgradePath === 'heritage' ? '?tier=heritage' : ''}`}
                    className="text-secondary text-sm font-medium hover:underline block mt-1"
                  >
                    {t('typeSelector.viewPlans')}
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
