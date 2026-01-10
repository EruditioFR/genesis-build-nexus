import { useState, useEffect } from 'react';
import { Search, User, MapPin, Calendar } from 'lucide-react';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { FamilyPerson } from '@/types/familyTree';

interface TreeSearchCommandProps {
  persons: FamilyPerson[];
  onPersonSelect: (person: FamilyPerson) => void;
  className?: string;
}

export function TreeSearchCommand({ persons, onPersonSelect, className }: TreeSearchCommandProps) {
  const [open, setOpen] = useState(false);

  // Keyboard shortcut to open search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = (person: FamilyPerson) => {
    onPersonSelect(person);
    setOpen(false);
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return null;
    try {
      return new Date(dateStr).getFullYear();
    } catch {
      return null;
    }
  };

  const getPersonInitials = (person: FamilyPerson) => {
    const first = person.first_names?.charAt(0) || '';
    const last = person.last_name?.charAt(0) || '';
    return (first + last).toUpperCase() || '?';
  };

  const getPersonLifespan = (person: FamilyPerson) => {
    const birth = formatDate(person.birth_date);
    const death = formatDate(person.death_date);
    
    if (!birth && !death) return null;
    if (birth && !death && person.is_alive) return `${birth} -`;
    if (birth && death) return `${birth} - ${death}`;
    if (birth) return `${birth}`;
    return null;
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className={cn("gap-2 text-muted-foreground", className)}
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Rechercher...</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Rechercher une personne par nom..." />
        <CommandList>
          <CommandEmpty>
            <div className="py-6 text-center">
              <User className="mx-auto h-10 w-10 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">
                Aucune personne trouvée
              </p>
            </div>
          </CommandEmpty>
          <CommandGroup heading="Personnes">
            {persons.map((person) => {
              const lifespan = getPersonLifespan(person);
              
              return (
                <CommandItem
                  key={person.id}
                  value={`${person.first_names} ${person.last_name} ${person.maiden_name || ''}`}
                  onSelect={() => handleSelect(person)}
                  className="flex items-center gap-3 py-3 cursor-pointer"
                >
                  <Avatar className="h-9 w-9 border">
                    <AvatarImage src={person.profile_photo_url || undefined} />
                    <AvatarFallback className="text-xs bg-secondary/20 text-secondary">
                      {getPersonInitials(person)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">
                        {person.first_names} {person.last_name}
                      </span>
                      {person.maiden_name && (
                        <span className="text-xs text-muted-foreground">
                          (née {person.maiden_name})
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      {lifespan && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {lifespan}
                        </span>
                      )}
                      {person.birth_place && (
                        <span className="flex items-center gap-1 truncate">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{person.birth_place}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {!person.is_alive && person.death_date && (
                    <span className="text-xs text-muted-foreground/60">†</span>
                  )}
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
