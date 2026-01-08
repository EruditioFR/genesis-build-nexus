import { useState, KeyboardEvent } from 'react';
import { X, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
}

const suggestedTags = [
  'Famille', 'Vacances', 'Enfance', 'Mariage', 'Anniversaire',
  'Voyage', 'Fêtes', 'Souvenirs', 'Héritage', 'Traditions'
];

const TagInput = ({ tags, onChange, placeholder = 'Ajouter un tag...', maxTags = 10 }: TagInputProps) => {
  const [inputValue, setInputValue] = useState('');

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < maxTags) {
      onChange([...tags, trimmedTag]);
    }
    setInputValue('');
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const availableSuggestions = suggestedTags.filter(
    tag => !tags.includes(tag.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-border bg-card min-h-[52px]">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="gap-1 px-2.5 py-1 bg-secondary/20 text-secondary hover:bg-secondary/30 capitalize"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1 hover:bg-secondary/30 rounded-full p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
        {tags.length < maxTags && (
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={tags.length === 0 ? placeholder : ''}
            className="flex-1 min-w-[120px] border-0 bg-transparent p-0 h-auto focus-visible:ring-0 text-sm"
          />
        )}
      </div>
      
      {availableSuggestions.length > 0 && tags.length < maxTags && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Suggestions :</p>
          <div className="flex flex-wrap gap-2">
            {availableSuggestions.slice(0, 6).map((tag) => (
              <Button
                key={tag}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addTag(tag)}
                className="h-7 text-xs gap-1"
              >
                <Plus className="w-3 h-3" />
                {tag}
              </Button>
            ))}
          </div>
        </div>
      )}
      
      <p className="text-xs text-muted-foreground">
        {tags.length}/{maxTags} tags • Appuyez sur Entrée pour ajouter
      </p>
    </div>
  );
};

export default TagInput;
