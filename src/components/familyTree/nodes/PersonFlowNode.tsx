import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Home } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { FamilyPerson } from '@/types/familyTree';

export interface PersonNodeData {
  person: FamilyPerson;
  isSelected: boolean;
  isHighlighted: boolean;
  isRoot: boolean;
  isDimmed: boolean;
  generation: number;
  generationLabel: string;
  [key: string]: unknown;
}

export const PersonFlowNode = memo(({ data }: NodeProps<PersonNodeData>) => {
  const { person, isSelected, isHighlighted, isRoot, isDimmed } = data;
  const initials = `${person.first_names[0] || ''}${person.last_name[0] || ''}`.toUpperCase();

  const getBirthYear = () => {
    if (!person.birth_date) return null;
    return new Date(person.birth_date).getFullYear();
  };

  const getDeathYear = () => {
    if (!person.death_date) return null;
    return new Date(person.death_date).getFullYear();
  };

  const birthYear = getBirthYear();
  const deathYear = getDeathYear();

  return (
    <>
      {/* Handles for connections */}
      <Handle type="target" position={Position.Top} id="top" className="!w-2 !h-2 !bg-border !border-0 !opacity-0" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="!w-2 !h-2 !bg-border !border-0 !opacity-0" />
      <Handle type="source" position={Position.Right} id="right" className="!w-2 !h-2 !bg-border !border-0 !opacity-0" />
      <Handle type="target" position={Position.Left} id="left" className="!w-2 !h-2 !bg-border !border-0 !opacity-0" />

      <div
        className={cn(
          "w-full h-full rounded-2xl p-2.5 flex items-center gap-2.5 transition-all duration-300 cursor-pointer",
          "border-2 bg-card shadow-md hover:shadow-xl",
          "hover:-translate-y-0.5",
          isSelected
            ? "border-secondary ring-2 ring-secondary/30 shadow-secondary/20"
            : "border-border/60 hover:border-secondary/50",
          isHighlighted && "animate-highlight-pulse ring-2 ring-primary/50",
          isDimmed && "opacity-20 scale-[0.97]",
          !person.is_alive && !isDimmed && "opacity-85"
        )}
      >
        {/* Root indicator */}
        {isRoot && (
          <div className="absolute -top-2.5 -left-2.5 z-10">
            <div className="w-6 h-6 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center shadow-md">
              <Home className="w-3.5 h-3.5" />
            </div>
          </div>
        )}

        {/* Avatar */}
        <Avatar className={cn(
          "w-14 h-14 border-2 shrink-0",
          person.gender === 'male' ? 'border-blue-400/50' :
          person.gender === 'female' ? 'border-pink-400/50' :
          'border-secondary/30'
        )}>
          <AvatarImage src={person.profile_photo_url || undefined} />
          <AvatarFallback className={cn(
            "text-sm font-medium",
            person.gender === 'male' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
            person.gender === 'female' ? 'bg-pink-50 text-pink-700 dark:bg-pink-950 dark:text-pink-300' :
            'bg-secondary/10 text-secondary'
          )}>
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* Info */}
        <div className="flex-1 min-w-0 text-left">
          <p className="text-xs font-semibold truncate leading-tight text-foreground">
            {person.first_names}
          </p>
          <p className="text-xs text-muted-foreground truncate leading-tight uppercase tracking-wide">
            {person.last_name}
          </p>
          {(birthYear || deathYear) && (
            <p className="text-[10px] text-muted-foreground/70 mt-1 flex items-center gap-1">
              <span>°{birthYear || '?'}</span>
              {!person.is_alive && (
                <span>†{deathYear || '?'}</span>
              )}
            </p>
          )}
          {person.birth_place && (
            <p className="text-[10px] text-muted-foreground/50 truncate mt-0.5">
              {person.birth_place}
            </p>
          )}
        </div>

        {/* Deceased indicator */}
        {!person.is_alive && (
          <div className="absolute top-1.5 right-1.5">
            <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
          </div>
        )}
      </div>
    </>
  );
});

PersonFlowNode.displayName = 'PersonFlowNode';
