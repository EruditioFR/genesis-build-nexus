import { Badge } from '@/components/ui/badge';
import type { SubCategory } from '@/hooks/useCategories';

interface SubCategoryBadgeProps {
  subCategory: SubCategory;
  size?: 'sm' | 'md';
  className?: string;
}

const SubCategoryBadge = ({ subCategory, size = 'sm', className = '' }: SubCategoryBadgeProps) => {
  return (
    <Badge
      variant="outline"
      className={`
        ${size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1'}
        bg-muted/50 text-muted-foreground border-muted-foreground/20
        ${className}
      `}
    >
      {subCategory.name}
    </Badge>
  );
};

export default SubCategoryBadge;