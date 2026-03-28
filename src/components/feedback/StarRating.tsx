import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  description?: string;
}

const StarRating = ({ value, onChange, label, description }: StarRatingProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3 border-b border-border/50 last:border-0">
      <div className="flex-1">
        <p className="font-medium text-foreground text-sm">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-0.5 transition-transform hover:scale-110 focus:outline-none"
            aria-label={`${star} étoile${star > 1 ? 's' : ''}`}
          >
            <Star
              className={cn(
                'w-6 h-6 transition-colors',
                star <= value
                  ? 'fill-secondary text-secondary'
                  : 'fill-transparent text-muted-foreground/30'
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default StarRating;
