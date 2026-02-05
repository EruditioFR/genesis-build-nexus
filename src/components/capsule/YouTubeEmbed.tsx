import { useState, useEffect } from 'react';
import { Youtube, X, Link as LinkIcon, Check, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface YouTubeEmbedProps {
  value: string | null;
  onChange: (url: string | null) => void;
  className?: string;
}

// Extract YouTube video ID from various URL formats
export const extractYouTubeId = (url: string): string | null => {
  if (!url) return null;
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
};

export const getYouTubeThumbnail = (videoId: string): string => {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
};

const YouTubeEmbed = ({ value, onChange, className }: YouTubeEmbedProps) => {
  const { t } = useTranslation('capsules');
  const [inputValue, setInputValue] = useState(value || '');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  
  const videoId = value ? extractYouTubeId(value) : null;
  
  useEffect(() => {
    if (value) {
      setInputValue(value);
      setIsValid(!!extractYouTubeId(value));
    }
  }, [value]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    if (!newValue.trim()) {
      setIsValid(null);
      onChange(null);
      return;
    }
    
    const id = extractYouTubeId(newValue);
    if (id) {
      setIsValid(true);
      onChange(newValue);
    } else {
      setIsValid(false);
    }
  };
  
  const handleRemove = () => {
    setInputValue('');
    setIsValid(null);
    onChange(null);
  };
  
  return (
    <div className={cn("p-6 rounded-2xl border border-border bg-card space-y-4", className)}>
      <Label className="text-base font-medium flex items-center gap-2">
        <Youtube className="w-5 h-5 text-red-500" />
        {t('youtube.title', 'Vidéo YouTube')}
      </Label>
      
      <p className="text-sm text-muted-foreground">
        {t('youtube.description', 'Ajoutez un lien YouTube pour intégrer une vidéo à votre souvenir')}
      </p>
      
      <div className="space-y-3">
        <div className="relative">
          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="url"
            placeholder={t('youtube.placeholder', 'https://www.youtube.com/watch?v=...')}
            value={inputValue}
            onChange={handleInputChange}
            className={cn(
              "pl-10 pr-10",
              isValid === true && "border-green-500 focus-visible:ring-green-500",
              isValid === false && "border-destructive focus-visible:ring-destructive"
            )}
          />
          {isValid !== null && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isValid ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-destructive" />
              )}
            </div>
          )}
        </div>
        
        {isValid === false && (
          <p className="text-sm text-destructive">
            {t('youtube.invalidUrl', 'URL YouTube non valide. Formats acceptés : youtube.com/watch?v=..., youtu.be/..., youtube.com/shorts/...')}
          </p>
        )}
        
        {/* Preview */}
        {videoId && (
          <div className="relative rounded-xl overflow-hidden bg-muted aspect-video group">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleRemove}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
      
      <p className="text-xs text-muted-foreground">
        {t('youtube.hint', 'Collez un lien YouTube pour enrichir votre souvenir avec une vidéo musicale, un film, ou un moment particulier.')}
      </p>
    </div>
  );
};

export default YouTubeEmbed;
