import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Tag } from 'lucide-react';
import type { SubCategory } from '@/hooks/useCategories';

interface SubCategoryBadgeProps {
  subCategory: SubCategory;
  size?: 'sm' | 'md';
  showIcon?: boolean;
  className?: string;
}

const SubCategoryBadge = ({ 
  subCategory, 
  size = 'sm', 
  showIcon = true,
  className = '' 
}: SubCategoryBadgeProps) => {
  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1 gap-1.5',
    md: 'text-sm px-3 py-1.5 gap-2',
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-normal transition-all duration-200 rounded-full',
        'bg-secondary/50 text-secondary-foreground/80',
        'border-secondary-foreground/20',
        'hover:bg-secondary/70 hover:scale-105',
        'backdrop-blur-sm',
        sizeClasses[size],
        className
      )}
    >
      {showIcon && (
        <Tag className={cn(
          'flex-shrink-0 opacity-60',
          size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'
        )} />
      )}
      <span className="truncate max-w-[100px]">{subCategory.name}</span>
    </Badge>
  );
};

export default SubCategoryBadge;