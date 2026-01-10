import { User, UserPlus, Heart, Baby, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import type { FamilyPerson } from '@/types/familyTree';

interface PersonCardProps {
  person: FamilyPerson;
  onClick: () => void;
  isSelected?: boolean;
  onAddParent?: () => void;
  onAddChild?: () => void;
  onAddSpouse?: () => void;
  compact?: boolean;
}

export function PersonCard({
  person,
  onClick,
  isSelected,
  onAddParent,
  onAddChild,
  onAddSpouse,
  compact = false
}: PersonCardProps) {
  const initials = `${person.first_names[0] || ''}${person.last_name[0] || ''}`.toUpperCase();
  
  const formatDate = (date: string | null | undefined) => {
    if (!date) return null;
    return new Date(date).getFullYear();
  };

  const birthYear = formatDate(person.birth_date);
  const deathYear = formatDate(person.death_date);
  const dateRange = birthYear 
    ? deathYear 
      ? `${birthYear} - ${deathYear}`
      : person.is_alive 
        ? `${birthYear}`
        : `${birthYear} - ?`
    : null;

  const genderColor = person.gender === 'male' 
    ? 'border-blue-400' 
    : person.gender === 'female' 
      ? 'border-pink-400' 
      : 'border-gray-300';

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          onClick={onClick}
          className={cn(
            "bg-card border-2 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer",
            "flex flex-col items-center p-4 min-w-[160px]",
            genderColor,
            isSelected && "ring-2 ring-secondary ring-offset-2",
            !person.is_alive && "opacity-80"
          )}
        >
          {/* Avatar */}
          <Avatar className={cn("border-2", genderColor, compact ? "w-12 h-12" : "w-16 h-16")}>
            <AvatarImage src={person.profile_photo_url || undefined} alt={person.first_names} />
            <AvatarFallback className="bg-muted text-muted-foreground font-medium">
              {initials || <User className="w-6 h-6" />}
            </AvatarFallback>
          </Avatar>

          {/* Name */}
          <div className="mt-3 text-center">
            <p className={cn(
              "font-medium leading-tight",
              !person.is_alive && "text-muted-foreground",
              compact ? "text-sm" : "text-base"
            )}>
              {person.first_names}
            </p>
            <p className={cn(
              "text-muted-foreground uppercase tracking-wide",
              compact ? "text-xs" : "text-sm"
            )}>
              {person.last_name}
            </p>
          </div>

          {/* Dates */}
          {dateRange && !compact && (
            <p className="text-xs text-muted-foreground mt-1">
              {dateRange}
            </p>
          )}

          {/* Status badges */}
          {!compact && (
            <div className="flex gap-1 mt-2">
              {!person.is_alive && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  Décédé(e)
                </Badge>
              )}
              {person.occupation && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 max-w-[100px] truncate">
                  {person.occupation}
                </Badge>
              )}
            </div>
          )}

          {/* Birth place */}
          {person.birth_place && !compact && (
            <p className="text-[11px] text-muted-foreground mt-1 max-w-[140px] truncate">
              📍 {person.birth_place}
            </p>
          )}
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={onClick}>
          <User className="w-4 h-4 mr-2" />
          Voir les détails
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={onAddParent}>
          <UserPlus className="w-4 h-4 mr-2" />
          Ajouter un parent
        </ContextMenuItem>
        <ContextMenuItem onClick={onAddChild}>
          <Baby className="w-4 h-4 mr-2" />
          Ajouter un enfant
        </ContextMenuItem>
        <ContextMenuItem onClick={onAddSpouse}>
          <Heart className="w-4 h-4 mr-2" />
          Ajouter un conjoint
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
