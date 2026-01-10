import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon, User, Loader2, Users } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useFamilyTree } from '@/hooks/useFamilyTree';
import type { FamilyPerson, FamilyUnion } from '@/types/familyTree';

interface AddPersonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  treeId: string;
  relationType: 'parent' | 'child' | 'spouse' | 'sibling' | null;
  targetPerson: FamilyPerson | null;
  onPersonAdded: (person: FamilyPerson, secondParentId?: string) => void;
  // Pour l'ajout d'enfant: liste des conjoints possibles du parent
  availableSpouses?: FamilyPerson[];
  // Pour vérifier si c'est une nouvelle union
  existingUnions?: FamilyUnion[];
}

export function AddPersonDialog({
  open,
  onOpenChange,
  treeId,
  relationType,
  targetPerson,
  onPersonAdded,
  availableSpouses = [],
  existingUnions = []
}: AddPersonDialogProps) {
  const { addPerson, loading } = useFamilyTree();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [maidenName, setMaidenName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [birthDate, setBirthDate] = useState<Date>();
  const [birthPlace, setBirthPlace] = useState('');
  const [isAlive, setIsAlive] = useState(true);
  const [deathDate, setDeathDate] = useState<Date>();
  const [deathPlace, setDeathPlace] = useState('');
  const [occupation, setOccupation] = useState('');
  const [biography, setBiography] = useState('');
  
  // Second parent selection for child
  const [secondParentId, setSecondParentId] = useState<string>('none');
  // For new spouse: is this a new union (divorce/remarriage case)?
  const [isNewUnion, setIsNewUnion] = useState(false);

  // Determine if target person already has spouses (for showing new union option)
  const hasExistingSpouses = availableSpouses.length > 0 && relationType === 'spouse';

  useEffect(() => {
    // Pre-select the first spouse if adding a child
    if (relationType === 'child' && availableSpouses.length === 1) {
      setSecondParentId(availableSpouses[0].id);
    }
  }, [relationType, availableSpouses]);

  const resetForm = () => {
    setFirstName('');
    setLastName(targetPerson?.last_name || '');
    setMaidenName('');
    setGender('male');
    setBirthDate(undefined);
    setBirthPlace('');
    setIsAlive(true);
    setDeathDate(undefined);
    setDeathPlace('');
    setOccupation('');
    setBiography('');
    setSecondParentId('none');
    setIsNewUnion(false);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    const person = await addPerson(treeId, {
      first_names: firstName,
      last_name: lastName,
      maiden_name: maidenName || null,
      gender,
      birth_date: birthDate ? format(birthDate, 'yyyy-MM-dd') : null,
      birth_place: birthPlace || null,
      is_alive: isAlive,
      death_date: !isAlive && deathDate ? format(deathDate, 'yyyy-MM-dd') : null,
      death_place: !isAlive ? deathPlace || null : null,
      occupation: occupation || null,
      biography: biography || null
    });

    if (person) {
      // Pass the second parent ID for children
      const selectedSecondParent = relationType === 'child' && secondParentId !== 'none' 
        ? secondParentId 
        : undefined;
      onPersonAdded(person, selectedSecondParent);
      handleClose();
    }
  };

  const getTitle = () => {
    if (!relationType || !targetPerson) return 'Ajouter une personne';
    const name = `${targetPerson.first_names} ${targetPerson.last_name}`;
    switch (relationType) {
      case 'parent': return `Ajouter un parent de ${name}`;
      case 'child': return `Ajouter un enfant de ${name}`;
      case 'spouse': return `Ajouter le conjoint de ${name}`;
      case 'sibling': return `Ajouter un frère/sœur de ${name}`;
      default: return 'Ajouter une personne';
    }
  };

  const canSubmit = firstName.trim().length > 0 && lastName.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-secondary" />
            {getTitle()}
          </DialogTitle>
          <DialogDescription>
            Renseignez les informations de la personne à ajouter.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Name fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom(s) *</Label>
              <Input
                id="firstName"
                placeholder="Jean Pierre"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom de famille *</Label>
              <Input
                id="lastName"
                placeholder="Martin"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maidenName">Nom de naissance (si différent)</Label>
            <Input
              id="maidenName"
              placeholder="Dupont"
              value={maidenName}
              onChange={(e) => setMaidenName(e.target.value)}
            />
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label>Sexe</Label>
            <RadioGroup
              value={gender}
              onValueChange={(v) => setGender(v as 'male' | 'female' | 'other')}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="male" />
                <Label htmlFor="male">Homme</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="female" />
                <Label htmlFor="female">Femme</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other">Autre</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Birth info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date de naissance</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !birthDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {birthDate ? format(birthDate, "dd/MM/yyyy") : "Sélectionner"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={birthDate}
                    onSelect={setBirthDate}
                    initialFocus
                    locale={fr}
                    captionLayout="dropdown-buttons"
                    fromYear={1800}
                    toYear={new Date().getFullYear()}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthPlace">Lieu de naissance</Label>
              <Input
                id="birthPlace"
                placeholder="Paris, France"
                value={birthPlace}
                onChange={(e) => setBirthPlace(e.target.value)}
              />
            </div>
          </div>

          {/* Alive status */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <Label htmlFor="isAlive" className="cursor-pointer">
              Cette personne est vivante
            </Label>
            <Switch
              id="isAlive"
              checked={isAlive}
              onCheckedChange={setIsAlive}
            />
          </div>

          {/* Death info (if deceased) */}
          {!isAlive && (
            <div className="grid grid-cols-2 gap-4 p-3 bg-muted/50 rounded-lg">
              <div className="space-y-2">
                <Label>Date de décès</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !deathDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {deathDate ? format(deathDate, "dd/MM/yyyy") : "Sélectionner"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={deathDate}
                      onSelect={setDeathDate}
                      initialFocus
                      locale={fr}
                      captionLayout="dropdown-buttons"
                      fromYear={1800}
                      toYear={new Date().getFullYear()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="deathPlace">Lieu de décès</Label>
                <Input
                  id="deathPlace"
                  placeholder="Lyon, France"
                  value={deathPlace}
                  onChange={(e) => setDeathPlace(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Occupation */}
          <div className="space-y-2">
            <Label htmlFor="occupation">Profession</Label>
            <Input
              id="occupation"
              placeholder="Instituteur"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
            />
          </div>

          {/* Second parent selection for children */}
          {relationType === 'child' && availableSpouses.length > 0 && (
            <div className="space-y-2 p-3 bg-secondary/5 border border-secondary/20 rounded-lg">
              <Label className="flex items-center gap-2 text-secondary">
                <Users className="w-4 h-4" />
                Second parent
              </Label>
              <p className="text-xs text-muted-foreground mb-2">
                Sélectionnez le second parent de cet enfant (conjoint de {targetPerson?.first_names})
              </p>
              <Select value={secondParentId} onValueChange={setSecondParentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le second parent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    <span className="text-muted-foreground">Aucun / Inconnu</span>
                  </SelectItem>
                  {availableSpouses.map((spouse) => (
                    <SelectItem key={spouse.id} value={spouse.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-5 h-5">
                          <AvatarImage src={spouse.profile_photo_url || undefined} />
                          <AvatarFallback className="text-[10px]">
                            {spouse.first_names[0]}{spouse.last_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        {spouse.first_names} {spouse.last_name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* New union info for spouse (divorce/remarriage) */}
          {hasExistingSpouses && (
            <div className="space-y-2 p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                  {targetPerson?.first_names} a déjà {availableSpouses.length} conjoint(s)
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Vous pouvez ajouter un nouveau conjoint (remariage, nouvelle union après divorce ou veuvage).
              </p>
            </div>
          )}

          {/* Biography */}
          <div className="space-y-2">
            <Label htmlFor="biography">Notes / Biographie</Label>
            <Textarea
              id="biography"
              placeholder="Anecdotes, traits de caractère, accomplissements..."
              value={biography}
              onChange={(e) => setBiography(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Ajout...
              </>
            ) : (
              'Ajouter la personne'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
