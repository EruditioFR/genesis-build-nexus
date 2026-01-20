import { Link } from 'react-router-dom';
import { Crown, Users, UserPlus } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';

interface CircleLimitsIndicatorProps {
  currentCircles: number;
  currentMembersInSelectedCircle?: number;
}

const CircleLimitsIndicator = ({ 
  currentCircles, 
  currentMembersInSelectedCircle 
}: CircleLimitsIndicatorProps) => {
  const { limits, tier, isHeritage } = useFeatureAccess();

  const maxCircles = limits.maxCircles;
  const maxMembers = limits.maxMembersPerCircle;
  const isCirclesUnlimited = maxCircles === -1;
  const isMembersUnlimited = maxMembers === -1;

  // Don't show for Heritage users (unlimited everything)
  if (isHeritage) {
    return null;
  }

  const circlesPercentage = isCirclesUnlimited ? 0 : Math.min((currentCircles / maxCircles) * 100, 100);
  const circlesNearLimit = !isCirclesUnlimited && currentCircles >= maxCircles - 1;
  const circlesAtLimit = !isCirclesUnlimited && currentCircles >= maxCircles;

  const membersPercentage = isMembersUnlimited || currentMembersInSelectedCircle === undefined 
    ? 0 
    : Math.min((currentMembersInSelectedCircle / maxMembers) * 100, 100);
  const membersNearLimit = !isMembersUnlimited && currentMembersInSelectedCircle !== undefined && currentMembersInSelectedCircle >= maxMembers - 1;

  const getUpgradeLink = () => {
    if (tier === 'free') return '/premium';
    if (tier === 'premium') return '/premium?tier=heritage';
    return null;
  };

  const upgradeLink = getUpgradeLink();

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          Limites du forfait {limits.planNameFr}
        </h3>
        {upgradeLink && (
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" asChild>
            <Link to={upgradeLink}>
              <Crown className="w-3 h-3" />
              Augmenter
            </Link>
          </Button>
        )}
      </div>

      {/* Circles limit */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Cercles</span>
          <span className={`font-medium ${circlesAtLimit ? 'text-destructive' : circlesNearLimit ? 'text-amber-500' : 'text-foreground'}`}>
            {currentCircles}/{isCirclesUnlimited ? '∞' : maxCircles}
          </span>
        </div>
        {!isCirclesUnlimited && (
          <Progress 
            value={circlesPercentage} 
            className={`h-1.5 ${circlesAtLimit ? '[&>div]:bg-destructive' : circlesNearLimit ? '[&>div]:bg-amber-500' : ''}`}
          />
        )}
      </div>

      {/* Members limit (only show if a circle is selected) */}
      {currentMembersInSelectedCircle !== undefined && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1">
              <UserPlus className="w-3 h-3" />
              Membres / cercle
            </span>
            <span className={`font-medium ${membersNearLimit ? 'text-amber-500' : 'text-foreground'}`}>
              {currentMembersInSelectedCircle}/{isMembersUnlimited ? '∞' : maxMembers}
            </span>
          </div>
          {!isMembersUnlimited && (
            <Progress 
              value={membersPercentage} 
              className={`h-1.5 ${membersNearLimit ? '[&>div]:bg-amber-500' : ''}`}
            />
          )}
        </div>
      )}

      {/* Upgrade prompt when near/at limit */}
      {(circlesNearLimit || membersNearLimit) && upgradeLink && (
        <p className="text-xs text-muted-foreground pt-1 border-t">
          {tier === 'free' 
            ? 'Passez Premium pour plus de cercles et membres.'
            : 'Passez Héritage pour un accès illimité.'}
        </p>
      )}
    </div>
  );
};

export default CircleLimitsIndicator;
