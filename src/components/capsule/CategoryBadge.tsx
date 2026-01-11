import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Category } from '@/hooks/useCategories';

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
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1.5 font-medium transition-colors',
        sizeClasses[size],
        className
      )}
      style={{
        backgroundColor: `${category.color}15`,
        borderColor: `${category.color}50`,
        color: category.color,
      }}
    >
      {showIcon && <span>{category.icon}</span>}
      <span>{category.name_fr}</span>
      {isPrimary && size !== 'sm' && (
        <span className="opacity-60 text-xs">(principale)</span>
      )}
    </Badge>
  );
};

export default CategoryBadge;
