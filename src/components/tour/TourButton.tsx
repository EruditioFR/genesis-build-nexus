import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useFeatureTour } from '@/hooks/useFeatureTour';
import { TourType, getTourTitle } from '@/lib/tourSteps';

interface TourButtonProps {
  tourType: TourType;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showLabel?: boolean;
}

export function TourButton({ 
  tourType, 
  variant = 'outline', 
  size = 'sm',
  className = '',
  showLabel = false,
}: TourButtonProps) {
  const { startTour } = useFeatureTour(tourType);
  const title = getTourTitle(tourType);

  if (showLabel) {
    return (
      <Button
        variant={variant}
        size={size}
        onClick={startTour}
        className={`gap-2 ${className}`}
      >
        <HelpCircle className="w-4 h-4" />
        {title}
      </Button>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size={size === 'icon' ? 'icon' : size}
            onClick={startTour}
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
  );
}

export default TourButton;
