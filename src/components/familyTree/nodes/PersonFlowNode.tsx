import { memo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { Home } from 'lucide-react';
import { motion } from 'framer-motion';
import { FamilyAvatar } from '@/components/familyTree/FamilyAvatar';
import { cn } from '@/lib/utils';
import type { FamilyPerson } from '@/types/familyTree';

export type PersonNodeData = {
  person: FamilyPerson;
  isSelected: boolean;
  isHighlighted: boolean;
  isRoot: boolean;
  isDimmed: boolean;
  generation: number;
  generationLabel: string;
};

export type PersonNode = Node<PersonNodeData, 'person'>;

export const PersonFlowNode = memo(({ data }: NodeProps<PersonNode>) => {
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

  const genderBorderColor =
    person.gender === 'male'
      ? 'border-[hsl(var(--tree-male))]'
      : person.gender === 'female'
        ? 'border-[hsl(var(--tree-female))]'
        : 'border-[hsl(var(--tree-card-border))]';

  const genderAvatarBg =
    person.gender === 'male'
      ? 'bg-[hsl(200_35%_92%)] text-[hsl(200_40%_35%)]'
      : person.gender === 'female'
        ? 'bg-[hsl(340_35%_92%)] text-[hsl(340_40%_35%)]'
        : 'bg-muted text-muted-foreground';

  return (
    <>
      <Handle type="target" position={Position.Top} id="top" className="!w-2 !h-2 !bg-transparent !border-0" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="!w-2 !h-2 !bg-transparent !border-0" />
      <Handle type="source" position={Position.Right} id="right" className="!w-2 !h-2 !bg-transparent !border-0" />
      <Handle type="target" position={Position.Left} id="left" className="!w-2 !h-2 !bg-transparent !border-0" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{
          opacity: isDimmed ? 0.2 : 1,
          scale: isDimmed ? 0.97 : 1,
        }}
        whileHover={!isDimmed ? { y: -2, boxShadow: 'var(--tree-card-hover-shadow)' } : undefined}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={cn(
          "w-full h-full rounded-2xl p-2.5 flex items-center gap-2.5 cursor-pointer font-tree",
          "border-2 shadow-[var(--tree-card-shadow)]",
          "bg-[hsl(var(--tree-card-bg))]",
          isSelected
            ? "border-[hsl(var(--terracotta))] ring-2 ring-[hsl(var(--terracotta)/0.25)]"
            : cn("hover:border-[hsl(var(--gold-light))]", genderBorderColor),
          isHighlighted && "ring-2 ring-[hsl(var(--gold))] animate-pulse",
          !person.is_alive && !isDimmed && "opacity-80"
        )}
      >
        {/* Root badge */}
        {isRoot && (
          <div className="absolute -top-2.5 -left-2.5 z-10">
            <div className="w-6 h-6 rounded-full bg-[hsl(var(--tree-root-accent))] text-white flex items-center justify-center shadow-md">
              <Home className="w-3.5 h-3.5" />
            </div>
          </div>
        )}

        {/* Avatar */}
        <Avatar className={cn(
          "w-14 h-14 border-2 shrink-0",
          genderBorderColor
        )}>
          <AvatarImage src={person.profile_photo_url || undefined} className="object-cover" />
          <AvatarFallback className={cn("text-sm font-semibold font-tree", genderAvatarBg)}>
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* Info */}
        <div className="flex-1 min-w-0 text-left">
          <p className="text-[11px] font-display font-semibold truncate leading-tight text-[hsl(var(--sepia))]">
            {person.first_names}
          </p>
          <p className="text-[10px] text-[hsl(var(--sepia-light))] truncate leading-tight uppercase tracking-wider font-medium">
            {person.last_name}
          </p>
          {(birthYear || deathYear) && (
            <p className="text-[9px] text-muted-foreground mt-1 flex items-center gap-1 font-tree">
              <span className="opacity-70">°</span>
              <span>{birthYear || '?'}</span>
              {!person.is_alive && (
                <>
                  <span className="opacity-40">–</span>
                  <span className="opacity-70">†</span>
                  <span>{deathYear || '?'}</span>
                </>
              )}
            </p>
          )}
          {person.birth_place && (
            <p className="text-[9px] text-muted-foreground/50 truncate mt-0.5 italic">
              {person.birth_place.split(',')[0]}
            </p>
          )}
        </div>

        {/* Deceased indicator */}
        {!person.is_alive && (
          <div className="absolute top-1 right-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--sepia-light)/0.4)]" />
          </div>
        )}
      </motion.div>
    </>
  );
});

PersonFlowNode.displayName = 'PersonFlowNode';
