import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Category } from '@/hooks/useCategories';
import { Star } from 'lucide-react';

interface CategoryBadgeProps {
  category: Category;
  isPrimary?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

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

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium transition-all duration-200 rounded-full',
        'hover:shadow-md hover:scale-105',
        'backdrop-blur-sm',
        sizeClasses[size],
        isPrimary && 'ring-1 ring-offset-1 ring-offset-background',
        className
      )}
      style={{
        backgroundColor: `${category.color}20`,
        borderColor: `${category.color}60`,
        color: category.color,
        ...(isPrimary && { ringColor: category.color }),
      }}
    >
      {showIcon && (
        <span className={cn('flex-shrink-0', iconSizeClasses[size])}>
          {category.icon}
        </span>
      )}
      <span className="truncate max-w-[120px]">{category.name_fr}</span>
      {isPrimary && (
        <Star 
          className={cn(
            'flex-shrink-0 fill-current opacity-80',
            size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-3.5 h-3.5' : 'w-4 h-4'
          )} 
        />
      )}
    </Badge>
  );
};

export default CategoryBadge;
