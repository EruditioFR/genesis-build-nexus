import { useState, useMemo } from 'react';
import { Users, Search, Calendar, ArrowUpDown, User } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { FamilyPerson } from '@/types/familyTree';

type SortField = 'name' | 'birthDate' | 'deathDate';
type SortOrder = 'asc' | 'desc';

interface PersonsListSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  persons: FamilyPerson[];
  onPersonClick: (person: FamilyPerson) => void;
}

export function PersonsListSheet({
  open,
  onOpenChange,
  persons,
  onPersonClick,
}: PersonsListSheetProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [filterAlive, setFilterAlive] = useState<'all' | 'alive' | 'deceased'>('all');

  const formatDate = (date: string | null | undefined) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatYear = (date: string | null | undefined) => {
    if (!date) return null;
    return new Date(date).getFullYear();
  };

  const filteredAndSortedPersons = useMemo(() => {
    let result = [...persons];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((person) => {
        const fullName = `${person.first_names} ${person.last_name}`.toLowerCase();
        const maidenName = person.maiden_name?.toLowerCase() || '';
        return fullName.includes(query) || maidenName.includes(query);
      });
    }

    // Filter by alive status
    if (filterAlive === 'alive') {
      result = result.filter((person) => person.is_alive);
    } else if (filterAlive === 'deceased') {
      result = result.filter((person) => !person.is_alive);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'name':
          const nameA = `${a.last_name} ${a.first_names}`.toLowerCase();
          const nameB = `${b.last_name} ${b.first_names}`.toLowerCase();
          comparison = nameA.localeCompare(nameB, 'fr');
          break;
        case 'birthDate':
          const birthA = a.birth_date ? new Date(a.birth_date).getTime() : 0;
          const birthB = b.birth_date ? new Date(b.birth_date).getTime() : 0;
          comparison = birthA - birthB;
          break;
        case 'deathDate':
          const deathA = a.death_date ? new Date(a.death_date).getTime() : Infinity;
          const deathB = b.death_date ? new Date(b.death_date).getTime() : Infinity;
          comparison = deathA - deathB;
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [persons, searchQuery, sortField, sortOrder, filterAlive]);

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handlePersonClick = (person: FamilyPerson) => {
    onPersonClick(person);
    onOpenChange(false);
  };

  const genderColor = (gender: string | null | undefined) => {
    if (gender === 'male') return 'border-l-blue-400';
    if (gender === 'female') return 'border-l-pink-400';
    return 'border-l-gray-300';
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-secondary" />
            Personnes de l'arbre
          </SheetTitle>
          <SheetDescription>
            {persons.length} personne{persons.length > 1 ? 's' : ''} dans cet arbre
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filters and Sort */}
          <div className="flex gap-2">
            <Select value={filterAlive} onValueChange={(v) => setFilterAlive(v as typeof filterAlive)}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="alive">En vie</SelectItem>
                <SelectItem value="deceased">Décédés</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortField} onValueChange={(v) => setSortField(v as SortField)}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Nom</SelectItem>
                <SelectItem value="birthDate">Date de naissance</SelectItem>
                <SelectItem value="deathDate">Date de décès</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon" onClick={toggleSortOrder}>
              <ArrowUpDown className={cn(
                "w-4 h-4 transition-transform",
                sortOrder === 'desc' && "rotate-180"
              )} />
            </Button>
          </div>

          {/* Persons List */}
          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="space-y-2 pr-4">
              {filteredAndSortedPersons.length === 0 ? (
                <div className="text-center py-12">
                  <User className="w-10 h-10 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">Aucune personne trouvée</p>
                </div>
              ) : (
                filteredAndSortedPersons.map((person) => (
                  <button
                    key={person.id}
                    onClick={() => handlePersonClick(person)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                      "hover:bg-muted border-l-4",
                      genderColor(person.gender),
                      !person.is_alive && "opacity-75"
                    )}
                  >
                    <Avatar className="w-12 h-12 flex-shrink-0">
                      <AvatarImage src={person.profile_photo_url || undefined} />
                      <AvatarFallback className="bg-muted text-muted-foreground">
                        {person.first_names[0]}{person.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">
                          {person.first_names} {person.last_name}
                        </p>
                        {!person.is_alive && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            †
                          </Badge>
                        )}
                      </div>
                      
                      {person.maiden_name && (
                        <p className="text-xs text-muted-foreground truncate">
                          née {person.maiden_name}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        {person.birth_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatYear(person.birth_date)}
                            {person.death_date && ` - ${formatYear(person.death_date)}`}
                          </span>
                        )}
                        {person.birth_place && (
                          <span className="truncate max-w-[120px]">
                            📍 {person.birth_place}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Stats summary */}
          <div className="border-t pt-3 flex justify-center gap-4 text-xs text-muted-foreground">
            <span>{filteredAndSortedPersons.filter(p => p.is_alive).length} en vie</span>
            <span>•</span>
            <span>{filteredAndSortedPersons.filter(p => !p.is_alive).length} décédés</span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
