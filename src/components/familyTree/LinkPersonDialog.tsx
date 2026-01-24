import { useState } from 'react';
import { Link2, Search, Heart, Baby, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { FamilyPerson } from '@/types/familyTree';

type RelationType = 'parent' | 'child' | 'spouse';

interface LinkPersonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourcePerson: FamilyPerson;
  availablePersons: FamilyPerson[];
  onLink: (targetPersonId: string, relationType: RelationType) => Promise<void>;
}

export function LinkPersonDialog({
  open,
  onOpenChange,
  sourcePerson,
  availablePersons,
  onLink,
}: LinkPersonDialogProps) {
  const { t } = useTranslation('familyTree');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<FamilyPerson | null>(null);
  const [relationType, setRelationType] = useState<RelationType>('parent');
  const [loading, setLoading] = useState(false);

  const filteredPersons = availablePersons.filter((person) => {
    if (person.id === sourcePerson.id) return false;
    const fullName = `${person.first_names} ${person.last_name}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  const handleSubmit = async () => {
    if (!selectedPerson) return;
    
    setLoading(true);
    try {
      await onLink(selectedPerson.id, relationType);
      onOpenChange(false);
      resetState();
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setSearchQuery('');
    setSelectedPerson(null);
    setRelationType('parent');
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) resetState();
    onOpenChange(open);
  };

  const getRelationshipDescription = () => {
    if (!selectedPerson) return '';
    
    switch (relationType) {
      case 'parent':
        return t('link.willBeParent', { selected: selectedPerson.first_names, source: sourcePerson.first_names });
      case 'child':
        return t('link.willBeChild', { selected: selectedPerson.first_names, source: sourcePerson.first_names });
      case 'spouse':
        return t('link.willBeSpouse', { selected: selectedPerson.first_names, source: sourcePerson.first_names });
      default:
        return '';
    }
  };

  const formatBirthYear = (date: string | null | undefined) => {
    if (!date) return null;
    return new Date(date).getFullYear();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-secondary" />
            {t('link.title')}
          </DialogTitle>
          <DialogDescription>
            {t('link.description', { name: `${sourcePerson.first_names} ${sourcePerson.last_name}` })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('link.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Person list */}
          <ScrollArea className="h-[200px] border rounded-lg">
            <div className="p-2 space-y-1">
              {filteredPersons.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">
                  {t('link.noResults')}
                </p>
              ) : (
                filteredPersons.map((person) => (
                  <button
                    key={person.id}
                    onClick={() => setSelectedPerson(person)}
                    className={cn(
                      "w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors",
                      "hover:bg-muted",
                      selectedPerson?.id === person.id && "bg-secondary/10 border border-secondary"
                    )}
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={person.profile_photo_url || undefined} />
                      <AvatarFallback className="text-sm">
                        {person.first_names[0]}{person.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {person.first_names} {person.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatBirthYear(person.birth_date) 
                          ? t('person.bornIn', { year: formatBirthYear(person.birth_date) })
                          : t('person.unknownBirthDate')}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Relationship type */}
          {selectedPerson && (
            <div className="space-y-3">
              <Label>{t('link.relationType')}</Label>
              <RadioGroup
                value={relationType}
                onValueChange={(v) => setRelationType(v as RelationType)}
                className="grid grid-cols-3 gap-2"
              >
                <Label
                  htmlFor="parent"
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors",
                    relationType === 'parent' ? "border-secondary bg-secondary/10" : "hover:bg-muted"
                  )}
                >
                  <RadioGroupItem value="parent" id="parent" className="sr-only" />
                  <UserPlus className="w-5 h-5" />
                  <span className="text-sm font-medium">{t('link.parent')}</span>
                </Label>
                
                <Label
                  htmlFor="child"
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors",
                    relationType === 'child' ? "border-secondary bg-secondary/10" : "hover:bg-muted"
                  )}
                >
                  <RadioGroupItem value="child" id="child" className="sr-only" />
                  <Baby className="w-5 h-5" />
                  <span className="text-sm font-medium">{t('link.child')}</span>
                </Label>
                
                <Label
                  htmlFor="spouse"
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors",
                    relationType === 'spouse' ? "border-secondary bg-secondary/10" : "hover:bg-muted"
                  )}
                >
                  <RadioGroupItem value="spouse" id="spouse" className="sr-only" />
                  <Heart className="w-5 h-5" />
                  <span className="text-sm font-medium">{t('link.spouse')}</span>
                </Label>
              </RadioGroup>

              <p className="text-sm text-muted-foreground text-center">
                {getRelationshipDescription()}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              {t('link.cancel')}
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!selectedPerson || loading}
              className="gap-2"
            >
              {loading ? (
                <>{t('link.linking')}</>
              ) : (
                <>
                  <Link2 className="w-4 h-4" />
                  {t('link.link')}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
