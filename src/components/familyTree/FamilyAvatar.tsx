import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useFamilyPhotoUrl } from '@/hooks/useFamilyPhotoUrl';
import { cn } from '@/lib/utils';

interface FamilyAvatarProps {
  photoUrl: string | null | undefined;
  fallback: string;
  className?: string;
  fallbackClassName?: string;
  imgClassName?: string;
}

/**
 * Avatar component that resolves family photo paths to signed URLs.
 * Works with both legacy public URLs and new relative paths.
 */
export function FamilyAvatar({ photoUrl, fallback, className, fallbackClassName, imgClassName }: FamilyAvatarProps) {
  const resolvedUrl = useFamilyPhotoUrl(photoUrl);

  return (
    <Avatar className={className}>
      <AvatarImage src={resolvedUrl || undefined} className={imgClassName} />
      <AvatarFallback className={fallbackClassName}>
        {fallback}
      </AvatarFallback>
    </Avatar>
  );
}
