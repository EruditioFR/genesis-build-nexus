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
import { TourType, getTourTitle } from '@/lib/tourSteps';

interface TourButtonProps {
  tourType: TourType;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showLabel?: boolean;
  enhanced?: boolean;
}

export function TourButton({ 
  tourType, 
  variant = 'outline', 
  size = 'sm',
  className = '',
  showLabel = false,
  enhanced = false,
}: TourButtonProps) {
  const { startTour } = useFeatureTour(tourType);
  const { t, i18n } = useTranslation('common');
  
  // Get localized title
  const getLocalizedTitle = () => {
    const titles: Record<string, Record<TourType, string>> = {
      fr: {
        dashboard: 'Découvrir le tableau de bord',
        capsule: 'Aide à la création',
        familyTree: 'Découvrir l\'arbre',
        circles: 'Découvrir les cercles',
      },
      en: {
        dashboard: 'Discover the dashboard',
        capsule: 'Creation help',
        familyTree: 'Discover the tree',
        circles: 'Discover circles',
      },
      es: {
        dashboard: 'Descubrir el panel',
        capsule: 'Ayuda de creación',
        familyTree: 'Descubrir el árbol',
        circles: 'Descubrir círculos',
      },
      ko: {
        dashboard: '대시보드 둘러보기',
        capsule: '만들기 도움말',
        familyTree: '가계도 둘러보기',
        circles: '서클 둘러보기',
      },
      zh: {
        dashboard: '探索仪表板',
        capsule: '创建帮助',
        familyTree: '探索家谱',
        circles: '探索圈子',
      },
    };
    const lang = i18n.language;
    return titles[lang]?.[tourType] || titles.fr[tourType];
  };

  const title = getLocalizedTitle();

  // Enhanced version with more prominent styling
  if (enhanced) {
    return (
      <Button
        variant="secondary"
        size={size}
        onClick={startTour}
        className={`gap-2 group relative overflow-hidden ${className}`}
      >
        <span className="absolute inset-0 bg-gradient-to-r from-secondary/0 via-secondary-foreground/5 to-secondary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
        <Sparkles className="w-4 h-4 animate-pulse" />
        <span className="relative">{title}</span>
        <Play className="w-3 h-3 ml-1" />
      </Button>
    );
  }

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
