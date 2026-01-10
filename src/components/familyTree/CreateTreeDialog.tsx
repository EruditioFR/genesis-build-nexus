import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFamilyTree } from '@/hooks/useFamilyTree';
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
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon, TreeDeciduous, User, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import type { FamilyTree, FamilyPerson } from '@/types/familyTree';

interface CreateTreeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTreeCreated: (tree: FamilyTree) => void;
}

type Step = 1 | 2 | 3;
type PersonType = 'self' | 'ancestor' | 'descendant';

export function CreateTreeDialog({ open, onOpenChange, onTreeCreated }: CreateTreeDialogProps) {
  const { user } = useAuth();
  const { createTree, loading } = useFamilyTree();
  
  const [step, setStep] = useState<Step>(1);
  const [treeName, setTreeName] = useState('');
  const [treeDescription, setTreeDescription] = useState('');
  const [personType, setPersonType] = useState<PersonType>('self');
  
  // Person form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [maidenName, setMaidenName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [birthDate, setBirthDate] = useState<Date>();
  const [birthPlace, setBirthPlace] = useState('');
  const [isAlive, setIsAlive] = useState(true);

  const handleClose = () => {
    setStep(1);
    setTreeName('');
    setTreeDescription('');
    setPersonType('self');
    setFirstName('');
    setLastName('');
    setMaidenName('');
    setGender('male');
    setBirthDate(undefined);
    setBirthPlace('');
    setIsAlive(true);
    onOpenChange(false);
  };

  const handleCreate = async () => {
    const rootPerson: Partial<FamilyPerson> = {
      first_names: firstName,
      last_name: lastName,
      maiden_name: maidenName || null,
      gender,
      birth_date: birthDate ? format(birthDate, 'yyyy-MM-dd') : null,
      birth_place: birthPlace || null,
      is_alive: isAlive
    };

    const tree = await createTree(treeName, treeDescription, rootPerson);
    if (tree) {
      onTreeCreated(tree);
      handleClose();
    }
  };

  const canProceedStep1 = treeName.trim().length > 0;
  const canProceedStep2 = true;
  const canCreate = firstName.trim().length > 0 && lastName.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TreeDeciduous className="w-5 h-5 text-secondary" />
            Créer un arbre généalogique
          </DialogTitle>
          <DialogDescription>
            Étape {step} sur 3
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Step 1: Tree info */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="treeName">Nom de l'arbre *</Label>
                <Input
                  id="treeName"
                  placeholder="ex: Famille Martin, Mes ancêtres..."
                  value={treeName}
                  onChange={(e) => setTreeName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="treeDescription">Description (optionnel)</Label>
                <Textarea
                  id="treeDescription"
                  placeholder="Une brève description de cet arbre..."
                  value={treeDescription}
                  onChange={(e) => setTreeDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 2: Person type */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Qui est la personne centrale de cet arbre ?
              </p>
              <RadioGroup 
                value={personType} 
                onValueChange={(v) => setPersonType(v as PersonType)}
                className="space-y-3"
              >
                <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="self" id="self" />
                  <Label htmlFor="self" className="flex-1 cursor-pointer">
                    <span className="font-medium">Moi-même</span>
                    <p className="text-sm text-muted-foreground">
                      Je crée mon propre arbre familial
                    </p>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="ancestor" id="ancestor" />
                  <Label htmlFor="ancestor" className="flex-1 cursor-pointer">
                    <span className="font-medium">Un ancêtre</span>
                    <p className="text-sm text-muted-foreground">
                      Je pars d'un ancêtre pour descendre vers le présent
                    </p>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="descendant" id="descendant" />
                  <Label htmlFor="descendant" className="flex-1 cursor-pointer">
                    <span className="font-medium">Un descendant</span>
                    <p className="text-sm text-muted-foreground">
                      Pour mes enfants ou petits-enfants
                    </p>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Step 3: Person details */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <User className="w-10 h-10 text-muted-foreground" />
                <div>
                  <p className="font-medium">Personne centrale</p>
                  <p className="text-sm text-muted-foreground">
                    {personType === 'self' ? 'Vos informations' : 
                     personType === 'ancestor' ? 'L\'ancêtre à partir duquel construire' :
                     'Le descendant central de l\'arbre'}
                  </p>
                </div>
              </div>

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
                        {birthDate ? format(birthDate, "dd MMMM yyyy", { locale: fr }) : "Sélectionner"}
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
                        fromYear={1850}
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

              <div className="space-y-2">
                <Label>Cette personne est</Label>
                <RadioGroup 
                  value={isAlive ? 'alive' : 'deceased'} 
                  onValueChange={(v) => setIsAlive(v === 'alive')}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="alive" id="alive" />
                    <Label htmlFor="alive">Vivante</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="deceased" id="deceased" />
                    <Label htmlFor="deceased">Décédée</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between pt-4 border-t">
          {step > 1 ? (
            <Button variant="outline" onClick={() => setStep((step - 1) as Step)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Précédent
            </Button>
          ) : (
            <Button variant="outline" onClick={handleClose}>
              Annuler
            </Button>
          )}

          {step < 3 ? (
            <Button 
              onClick={() => setStep((step + 1) as Step)}
              disabled={step === 1 && !canProceedStep1}
            >
              Suivant
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleCreate} 
              disabled={!canCreate || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <TreeDeciduous className="w-4 h-4 mr-2" />
                  Créer l'arbre
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
