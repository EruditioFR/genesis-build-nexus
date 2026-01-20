import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Category } from '@/hooks/useCategories';
import { Star } from 'lucide-react';
import { useMemo } from 'react';

interface CategoryBadgeProps {
  category: Category;
  isPrimary?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

// Helper to determine if a hex color is light or dark
const isLightColor = (hexColor: string): boolean => {
  // Remove # if present
  const hex = hexColor.replace('#', '');
  
  // Parse RGB values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Calculate luminance (perceived brightness)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5;
};

const CategoryBadge = ({
  category,
  isPrimary = false,
  size = 'md',
  showIcon = true,
  className,
}: CategoryBadgeProps) => {
  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1 gap-1.5',
    md: 'text-sm px-3 py-1.5 gap-2',
    lg: 'text-base px-4 py-2 gap-2',
  };

  const iconSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  // Determine if the category color is light or dark
  const isLight = useMemo(() => isLightColor(category.color), [category.color]);

  // If color is light: dark text on white background
  // If color is dark: light text on dark background
  const badgeStyles = useMemo(() => {
    if (isLight) {
      // Light category color -> use dark text on white/light background
      return {
        backgroundColor: '#ffffff',
        borderColor: `${category.color}`,
        color: '#1a1a2e', // Dark navy text
      };
    } else {
      // Dark category color -> use light text on dark background
      return {
        backgroundColor: category.color,
        borderColor: category.color,
        color: '#ffffff', // White text
      };
    }
  }, [category.color, isLight]);

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium transition-all duration-200 rounded-full',
        'hover:shadow-md hover:scale-105',
        'backdrop-blur-sm border-2',
        sizeClasses[size],
        isPrimary && 'ring-2 ring-offset-2 ring-offset-background',
        className
      )}
      style={{
        ...badgeStyles,
        ...(isPrimary && { boxShadow: `0 0 0 2px ${category.color}40` }),
      }}
    >
      {showIcon && (
        <span className={cn('flex-shrink-0', iconSizeClasses[size])}>
          {category.icon}
        </span>
      )}
      <span className="truncate max-w-[120px] font-semibold">{category.name_fr}</span>
      {isPrimary && (
        <Star 
          className={cn(
            'flex-shrink-0 fill-current',
            size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-3.5 h-3.5' : 'w-4 h-4'
          )} 
        />
      )}
    </Badge>
  );
};

export default CategoryBadge;
