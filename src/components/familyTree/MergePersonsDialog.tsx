import { useState, useMemo } from 'react';
import { Users, ArrowRight, Check, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import type { FamilyPerson } from '@/types/familyTree';

interface MergePersonsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  persons: FamilyPerson[];
  initialPerson?: FamilyPerson;
  onMerge: (keepPersonId: string, mergePersonId: string, fieldsToMerge: string[]) => Promise<void>;
}

type MergeField = {
  key: keyof FamilyPerson;
  label: string;
  keepValue: string | null;
  mergeValue: string | null;
};

export function MergePersonsDialog({
  open,
  onOpenChange,
  persons,
  initialPerson,
  onMerge,
}: MergePersonsDialogProps) {
  const [step, setStep] = useState<'select' | 'preview'>('select');
  const [keepPerson, setKeepPerson] = useState<FamilyPerson | null>(initialPerson || null);
  const [mergePerson, setMergePerson] = useState<FamilyPerson | null>(null);
  const [fieldsToMerge, setFieldsToMerge] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const availablePersons = useMemo(() => {
    return persons.filter(p => p.id !== keepPerson?.id);
  }, [persons, keepPerson?.id]);

  const formatValue = (value: unknown): string | null => {
    if (value === null || value === undefined) return null;
    if (typeof value === 'boolean') return value ? 'Oui' : 'Non';
    if (typeof value === 'string') return value || null;
    return String(value);
  };

  const mergeableFields = useMemo((): MergeField[] => {
    if (!keepPerson || !mergePerson) return [];

    const fields: { key: keyof FamilyPerson; label: string }[] = [
      { key: 'first_names', label: 'Prénoms' },
      { key: 'last_name', label: 'Nom' },
      { key: 'maiden_name', label: 'Nom de jeune fille' },
      { key: 'gender', label: 'Genre' },
      { key: 'birth_date', label: 'Date de naissance' },
      { key: 'birth_place', label: 'Lieu de naissance' },
      { key: 'death_date', label: 'Date de décès' },
      { key: 'death_place', label: 'Lieu de décès' },
      { key: 'burial_place', label: 'Lieu d\'inhumation' },
      { key: 'occupation', label: 'Profession' },
      { key: 'nationality', label: 'Nationalité' },
      { key: 'biography', label: 'Biographie' },
      { key: 'profile_photo_url', label: 'Photo de profil' },
    ];

    return fields
      .map(({ key, label }) => ({
        key,
        label,
        keepValue: formatValue(keepPerson[key]),
        mergeValue: formatValue(mergePerson[key]),
      }))
      .filter(f => f.mergeValue && f.mergeValue !== f.keepValue);
  }, [keepPerson, mergePerson]);

  const handleReset = () => {
    setStep('select');
    setKeepPerson(initialPerson || null);
    setMergePerson(null);
    setFieldsToMerge([]);
    setIsLoading(false);
  };

  const handleClose = () => {
    handleReset();
    onOpenChange(false);
  };

  const handleNext = () => {
    if (keepPerson && mergePerson) {
      // Pre-select fields where keep is empty but merge has value
      const autoSelect = mergeableFields
        .filter(f => !f.keepValue && f.mergeValue)
        .map(f => f.key);
      setFieldsToMerge(autoSelect);
      setStep('preview');
    }
  };

  const handleToggleField = (fieldKey: string) => {
    setFieldsToMerge(prev =>
      prev.includes(fieldKey)
        ? prev.filter(f => f !== fieldKey)
        : [...prev, fieldKey]
    );
  };

  const handleMerge = async () => {
    if (!keepPerson || !mergePerson) return;

    setIsLoading(true);
    try {
      await onMerge(keepPerson.id, mergePerson.id, fieldsToMerge);
      handleClose();
    } catch (error) {
      console.error('Merge error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (person: FamilyPerson) => {
    const first = person.first_names?.charAt(0) || '';
    const last = person.last_name?.charAt(0) || '';
    return `${first}${last}`.toUpperCase() || '?';
  };

  const formatPersonName = (person: FamilyPerson) => {
    return `${person.first_names} ${person.last_name}`.trim() || 'Sans nom';
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) handleClose();
      else onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-secondary" />
            Fusionner deux personnes
          </DialogTitle>
          <DialogDescription>
            {step === 'select'
              ? 'Sélectionnez la personne à fusionner avec la fiche actuelle.'
              : 'Choisissez les informations à récupérer de la fiche fusionnée.'}
          </DialogDescription>
        </DialogHeader>

        {step === 'select' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Keep person (primary) */}
            <div className="space-y-2">
              <Label>Fiche à conserver (principale)</Label>
              {keepPerson ? (
                <div className="flex items-center gap-3 p-3 bg-secondary/10 border border-secondary/20 rounded-lg">
                  <Avatar>
                    <AvatarImage src={keepPerson.profile_photo_url || undefined} />
                    <AvatarFallback>{getInitials(keepPerson)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{formatPersonName(keepPerson)}</p>
                    {keepPerson.birth_date && (
                      <p className="text-sm text-muted-foreground">
                        Né(e) le {new Date(keepPerson.birth_date).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>
                  <Badge variant="secondary">Conservée</Badge>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Sélectionnez une personne dans la liste</p>
              )}
            </div>

            {/* Merge person selection */}
            <div className="space-y-2">
              <Label>Fiche à fusionner (sera supprimée)</Label>
              <ScrollArea className="h-[250px] border rounded-lg">
                <RadioGroup
                  value={mergePerson?.id || ''}
                  onValueChange={(id) => setMergePerson(persons.find(p => p.id === id) || null)}
                >
                  <div className="p-2 space-y-1">
                    {availablePersons.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        Aucune autre personne dans l'arbre
                      </p>
                    ) : (
                      availablePersons.map((person) => (
                        <div
                          key={person.id}
                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                            mergePerson?.id === person.id
                              ? 'bg-destructive/10 border border-destructive/20'
                              : 'hover:bg-muted'
                          }`}
                          onClick={() => setMergePerson(person)}
                        >
                          <RadioGroupItem value={person.id} id={person.id} />
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={person.profile_photo_url || undefined} />
                            <AvatarFallback className="text-xs">{getInitials(person)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{formatPersonName(person)}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {person.birth_date
                                ? `Né(e) le ${new Date(person.birth_date).toLocaleDateString('fr-FR')}`
                                : 'Date de naissance inconnue'}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </RadioGroup>
              </ScrollArea>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Annuler
              </Button>
              <Button 
                onClick={handleNext} 
                disabled={!keepPerson || !mergePerson}
                className="flex-1"
              >
                Suivant
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'preview' && keepPerson && mergePerson && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Visual merge preview */}
            <div className="flex items-center justify-center gap-4 py-4">
              <div className="text-center">
                <Avatar className="h-12 w-12 mx-auto mb-2">
                  <AvatarImage src={keepPerson.profile_photo_url || undefined} />
                  <AvatarFallback>{getInitials(keepPerson)}</AvatarFallback>
                </Avatar>
                <p className="text-sm font-medium">{formatPersonName(keepPerson)}</p>
                <Badge variant="secondary" className="mt-1">Conservée</Badge>
              </div>
              <ArrowRight className="w-6 h-6 text-muted-foreground" />
              <div className="text-center opacity-50">
                <Avatar className="h-12 w-12 mx-auto mb-2">
                  <AvatarImage src={mergePerson.profile_photo_url || undefined} />
                  <AvatarFallback>{getInitials(mergePerson)}</AvatarFallback>
                </Avatar>
                <p className="text-sm font-medium line-through">{formatPersonName(mergePerson)}</p>
                <Badge variant="destructive" className="mt-1">Supprimée</Badge>
              </div>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Toutes les relations (parents, enfants, conjoints) de la fiche fusionnée 
                seront transférées vers la fiche conservée.
              </AlertDescription>
            </Alert>

            {/* Fields to merge */}
            {mergeableFields.length > 0 ? (
              <div className="space-y-2">
                <Label>Informations à récupérer de la fiche fusionnée :</Label>
                <ScrollArea className="h-[180px] border rounded-lg p-3">
                  <div className="space-y-3">
                    {mergeableFields.map((field) => (
                      <div
                        key={field.key}
                        className="flex items-start gap-3 p-2 rounded hover:bg-muted cursor-pointer"
                        onClick={() => handleToggleField(field.key)}
                      >
                        <Checkbox
                          checked={fieldsToMerge.includes(field.key)}
                          onCheckedChange={() => handleToggleField(field.key)}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{field.label}</p>
                          <div className="flex items-center gap-2 text-xs mt-1">
                            <span className="text-muted-foreground truncate">
                              {field.keepValue || '(vide)'}
                            </span>
                            <ArrowRight className="w-3 h-3 flex-shrink-0" />
                            <span className="text-secondary font-medium truncate">
                              {field.mergeValue}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucune information supplémentaire à récupérer de la fiche fusionnée.
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setStep('select')} className="flex-1">
                Retour
              </Button>
              <Button 
                onClick={handleMerge}
                disabled={isLoading}
                variant="destructive"
                className="flex-1"
              >
                {isLoading ? (
                  'Fusion en cours...'
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Fusionner
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}
