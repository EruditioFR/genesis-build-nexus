import { useState } from 'react';
import { X, Link as LinkIcon, Check, AlertCircle, Plus, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';
import { cn } from '@/lib/utils';

export type SocialPlatform = 'facebook' | 'instagram' | 'tiktok' | 'linkedin';

export interface SocialLink {
  platform: SocialPlatform;
  url: string;
}

interface SocialLinksEmbedProps {
  value: SocialLink[];
  onChange: (links: SocialLink[]) => void;
  className?: string;
}

const platformConfig: Record<SocialPlatform, { label: string; color: string; icon: string; patterns: RegExp[] }> = {
  facebook: {
    label: 'Facebook',
    color: 'bg-[#1877F2]/10 text-[#1877F2] border-[#1877F2]/30',
    icon: '📘',
    patterns: [/facebook\.com/, /fb\.com/, /fb\.watch/],
  },
  instagram: {
    label: 'Instagram',
    color: 'bg-[#E4405F]/10 text-[#E4405F] border-[#E4405F]/30',
    icon: '📷',
    patterns: [/instagram\.com/, /instagr\.am/],
  },
  tiktok: {
    label: 'TikTok',
    color: 'bg-[#000000]/10 text-foreground border-foreground/30',
    icon: '🎵',
    patterns: [/tiktok\.com/, /vm\.tiktok\.com/],
  },
  linkedin: {
    label: 'LinkedIn',
    color: 'bg-[#0A66C2]/10 text-[#0A66C2] border-[#0A66C2]/30',
    icon: '💼',
    patterns: [/linkedin\.com/, /lnkd\.in/],
  },
};

export const detectPlatform = (url: string): SocialPlatform | null => {
  for (const [platform, config] of Object.entries(platformConfig)) {
    if (config.patterns.some(p => p.test(url))) {
      return platform as SocialPlatform;
    }
  }
  return null;
};

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};


const SocialLinkItem = ({ link, onRemove }: { link: SocialLink; onRemove: () => void }) => {
  const { t } = useTranslation('capsules');
  const config = platformConfig[link.platform];
  const embedUrl = getEmbedPreviewUrl(link.platform, link.url);

  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-xl border transition-colors",
      config.color
    )}>
      <span className="text-lg">{config.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{config.label}</p>
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm truncate block hover:underline"
        >
          {link.url}
        </a>
      </div>
      {embedUrl ? (
        <HoverCard openDelay={300}>
          <HoverCardTrigger asChild>
            <button
              type="button"
              className="p-1.5 rounded-lg hover:bg-background/50 transition-colors"
              aria-label={t('socialLinks.preview', 'Aperçu')}
            >
              <Eye className="w-4 h-4" />
            </button>
          </HoverCardTrigger>
          <HoverCardContent side="left" className="w-[340px] p-2">
            <div className="flex items-center gap-2 mb-2 px-1">
              <span>{config.icon}</span>
              <span className="text-sm font-medium">{config.label}</span>
            </div>
            <div className="rounded-lg overflow-hidden border border-border bg-muted aspect-[4/5]">
              <iframe
                src={embedUrl}
                title={`${config.label} preview`}
                className="w-full h-full"
                sandbox="allow-scripts allow-same-origin allow-popups"
                loading="lazy"
              />
            </div>
          </HoverCardContent>
        </HoverCard>
      ) : null}
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="p-1.5 rounded-lg hover:bg-background/50 transition-colors"
      >
        <ExternalLink className="w-4 h-4" />
      </a>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
        onClick={onRemove}
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
};

const SocialLinksEmbed = ({ value, onChange, className }: SocialLinksEmbedProps) => {
  const { t } = useTranslation('capsules');
  const [inputValue, setInputValue] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [detectedPlatform, setDetectedPlatform] = useState<SocialPlatform | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    if (!newValue.trim()) {
      setIsValid(null);
      setDetectedPlatform(null);
      return;
    }

    const platform = detectPlatform(newValue);
    setDetectedPlatform(platform);
    setIsValid(!!platform && isValidUrl(newValue));
  };

  const handleAdd = () => {
    if (!inputValue.trim() || !detectedPlatform) return;
    if (!isValidUrl(inputValue)) return;

    onChange([...value, { platform: detectedPlatform, url: inputValue.trim() }]);
    setInputValue('');
    setIsValid(null);
    setDetectedPlatform(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const platforms = Object.entries(platformConfig).map(([key, config]) => ({
    key: key as SocialPlatform,
    ...config,
  }));

  return (
    <div className={cn("p-6 rounded-2xl border border-border bg-card space-y-4", className)}>
      <Label className="text-base font-medium flex items-center gap-2">
        <LinkIcon className="w-5 h-5 text-secondary" />
        {t('socialLinks.title', 'Liens sociaux')}
      </Label>

      <p className="text-sm text-muted-foreground">
        {t('socialLinks.description', 'Ajoutez des liens Facebook, Instagram, TikTok ou LinkedIn')}
      </p>

      {/* Platform badges */}
      <div className="flex flex-wrap gap-2">
        {platforms.map(p => (
          <Badge key={p.key} variant="outline" className={cn("text-xs", p.color)}>
            {p.icon} {p.label}
          </Badge>
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="url"
              placeholder={t('socialLinks.placeholder', 'https://www.instagram.com/...')}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className={cn(
                "pl-10 pr-10",
                isValid === true && "border-green-500 focus-visible:ring-green-500",
                isValid === false && inputValue.trim() && "border-destructive focus-visible:ring-destructive"
              )}
            />
            {isValid !== null && inputValue.trim() && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {isValid ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-destructive" />
                )}
              </div>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            size="default"
            onClick={handleAdd}
            disabled={!isValid}
            className="shrink-0"
          >
            <Plus className="w-4 h-4 mr-1" />
            {t('socialLinks.add', 'Ajouter')}
          </Button>
        </div>

        {isValid === false && inputValue.trim() && (
          <p className="text-sm text-destructive">
            {t('socialLinks.invalidUrl', 'URL non reconnue. Collez un lien Facebook, Instagram, TikTok ou LinkedIn.')}
          </p>
        )}

        {/* Links list */}
        {value.length > 0 && (
          <div className="space-y-2">
            {value.map((link, index) => (
              <SocialLinkItem
                key={`${link.url}-${index}`}
                link={link}
                onRemove={() => handleRemove(index)}
              />
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        {t('socialLinks.hint', 'Collez un lien de réseau social pour enrichir votre souvenir.')}
      </p>
    </div>
  );
};

export default SocialLinksEmbed;
