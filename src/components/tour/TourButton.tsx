import { HelpCircle, Sparkles, Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useFeatureTour } from '@/hooks/useFeatureTour';
import { TourType } from '@/lib/tourSteps';

interface TourButtonProps {
  tourType: TourType;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showLabel?: boolean;
  enhanced?: boolean;
  skipWelcome?: boolean;
}

export function TourButton({ 
  tourType, 
  variant = 'outline', 
  size = 'sm',
  className = '',
  showLabel = false,
  enhanced = false,
  skipWelcome = false,
}: TourButtonProps) {
  const { startTour, startTourDirect, WelcomeDialog } = useFeatureTour(tourType);
  const { t } = useTranslation('common');
  
  // Get localized title from translations
  const title = t(`tour.titles.${tourType}`);
  
  // Use direct start (without welcome dialog) if skipWelcome is true
  const handleClick = skipWelcome ? startTourDirect : startTour;

  // Enhanced version with more prominent styling
  if (enhanced) {
    return (
      <>
        <WelcomeDialog />
        <Button
          variant="secondary"
          size={size}
          onClick={handleClick}
          className={`gap-2 group relative overflow-hidden ${className}`}
        >
          <span className="absolute inset-0 bg-gradient-to-r from-secondary/0 via-secondary-foreground/5 to-secondary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span className="relative">{title}</span>
          <Play className="w-3 h-3 ml-1" />
        </Button>
      </>
    );
  }

  if (showLabel) {
    return (
      <>
        <WelcomeDialog />
        <Button
          variant={variant}
          size={size}
          onClick={handleClick}
          className={`gap-2 ${className}`}
        >
          <HelpCircle className="w-4 h-4" />
          {title}
        </Button>
      </>
    );
  }

  return (
    <>
      <WelcomeDialog />
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={variant}
              size={size === 'icon' ? 'icon' : size}
              onClick={handleClick}
              className={className}
            >
              <HelpCircle className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{title}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );
}

export default TourButton;
