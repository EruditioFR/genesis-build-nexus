import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr, enUS, es, ko, zhCN } from 'date-fns/locale';
import { CalendarIcon, User, Loader2, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
  onPersonAdded: (person: FamilyPerson, secondParentId?: string, unionId?: string) => void;
  availableSpouses?: FamilyPerson[];
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
  const { t, i18n } = useTranslation('familyTree');
  const { addPerson, loading } = useFamilyTree();
  
  const getLocale = () => {
    const localeMap: Record<string, typeof fr> = { fr, en: enUS, es, ko, zh: zhCN };
    return localeMap[i18n.language] || fr;
  };
  
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
  
  const [secondParentId, setSecondParentId] = useState<string>('none');
  const [selectedUnionId, setSelectedUnionId] = useState<string>('auto');
  const [isNewUnion, setIsNewUnion] = useState(false);

  const getUnionsWithSelectedParent = () => {
    if (!targetPerson || secondParentId === 'none') return [];
    return existingUnions.filter(
      u => (u.person1_id === targetPerson.id && u.person2_id === secondParentId) ||
           (u.person2_id === targetPerson.id && u.person1_id === secondParentId)
    );
  };

  const unionsWithSelectedParent = getUnionsWithSelectedParent();
  const hasMultipleUnions = unionsWithSelectedParent.length > 1;
  const hasExistingSpouses = availableSpouses.length > 0 && relationType === 'spouse';

  useEffect(() => {
    if (relationType === 'child' && availableSpouses.length === 1) {
      setSecondParentId(availableSpouses[0].id);
    }
  }, [relationType, availableSpouses]);

  useEffect(() => {
    setSelectedUnionId('auto');
  }, [secondParentId]);

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
    setSelectedUnionId('auto');
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
      const selectedSecondParent = relationType === 'child' && secondParentId !== 'none' 
        ? secondParentId 
        : undefined;
      
      let unionIdToUse: string | undefined;
      if (relationType === 'child' && secondParentId !== 'none') {
        if (selectedUnionId !== 'auto' && selectedUnionId !== '') {
          unionIdToUse = selectedUnionId;
        } else if (unionsWithSelectedParent.length === 1) {
          unionIdToUse = unionsWithSelectedParent[0].id;
        }
      }
      
      onPersonAdded(person, selectedSecondParent, unionIdToUse);
      handleClose();
    }
  };

  const getTitle = () => {
    if (!relationType || !targetPerson) return t('addPerson.title');
    const name = `${targetPerson.first_names} ${targetPerson.last_name}`;
    switch (relationType) {
      case 'parent': return t('addPerson.addParentOf', { name });
      case 'child': return t('addPerson.addChildOf', { name });
      case 'spouse': return t('addPerson.addSpouseOf', { name });
      case 'sibling': return t('addPerson.addSiblingOf', { name });
      default: return t('addPerson.title');
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
            {t('addPerson.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Name fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">{t('addPerson.firstName')} *</Label>
              <Input
                id="firstName"
                placeholder="Jean Pierre"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">{t('addPerson.lastName')} *</Label>
              <Input
                id="lastName"
                placeholder="Martin"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maidenName">{t('addPerson.maidenName')}</Label>
            <Input
              id="maidenName"
              placeholder="Dupont"
              value={maidenName}
              onChange={(e) => setMaidenName(e.target.value)}
            />
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label>{t('addPerson.gender')}</Label>
            <RadioGroup
              value={gender}
              onValueChange={(v) => setGender(v as 'male' | 'female' | 'other')}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="male" />
                <Label htmlFor="male">{t('addPerson.male')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="female" />
                <Label htmlFor="female">{t('addPerson.female')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other">{t('addPerson.other')}</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Birth info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('addPerson.birthDate')}</Label>
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
                    {birthDate ? format(birthDate, "dd/MM/yyyy") : t('addPerson.select')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={birthDate}
                    onSelect={setBirthDate}
                    initialFocus
                    locale={getLocale()}
                    captionLayout="dropdown-buttons"
                    fromYear={1800}
                    toYear={new Date().getFullYear()}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthPlace">{t('addPerson.birthPlace')}</Label>
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
              {t('addPerson.isAlive')}
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
                <Label>{t('addPerson.deathDate')}</Label>
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
                      {deathDate ? format(deathDate, "dd/MM/yyyy") : t('addPerson.select')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={deathDate}
                      onSelect={setDeathDate}
                      initialFocus
                      locale={getLocale()}
                      captionLayout="dropdown-buttons"
                      fromYear={1800}
                      toYear={new Date().getFullYear()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="deathPlace">{t('addPerson.deathPlace')}</Label>
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
            <Label htmlFor="occupation">{t('addPerson.occupation')}</Label>
            <Input
              id="occupation"
              placeholder="Instituteur"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
            />
          </div>

          {/* Second parent selection for children */}
          {relationType === 'child' && availableSpouses.length > 0 && (
            <div className="space-y-3 p-3 bg-secondary/5 border border-secondary/20 rounded-lg">
              <div>
                <Label className="flex items-center gap-2 text-secondary">
                  <Users className="w-4 h-4" />
                  {t('addPerson.secondParent')}
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('addPerson.secondParentHint', { name: targetPerson?.first_names })}
                </p>
              </div>
              <Select value={secondParentId} onValueChange={setSecondParentId}>
                <SelectTrigger>
                  <SelectValue placeholder={t('addPerson.select')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    <span className="text-muted-foreground">{t('addPerson.noneUnknown')}</span>
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

              {/* Union selector when multiple unions exist */}
              {hasMultipleUnions && (
                <div className="pt-2 border-t border-secondary/20">
                  <Label className="text-xs text-muted-foreground mb-2 block">
                    {t('addPerson.selectUnion')}
                  </Label>
                  <Select value={selectedUnionId} onValueChange={setSelectedUnionId}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('addPerson.chooseUnion')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">
                        <span className="text-muted-foreground">{t('addPerson.autoLatest')}</span>
                      </SelectItem>
                      {unionsWithSelectedParent.map((union, index) => {
                        const label = t(`union.types.${union.union_type}`) || t('union.types.other');
                        const dateInfo = union.start_date 
                          ? ` (${format(new Date(union.start_date), 'yyyy')})`
                          : '';
                        const endInfo = !union.is_current && union.end_date
                          ? ` - ${format(new Date(union.end_date), 'yyyy')}`
                          : '';
                        return (
                          <SelectItem key={union.id} value={union.id}>
                            {label} {index + 1}{dateInfo}{endInfo}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {t('addPerson.multipleUnionsHint')}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* New union info for spouse (divorce/remarriage) */}
          {hasExistingSpouses && (
            <div className="space-y-2 p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                  {t('addPerson.existingSpouses', { name: targetPerson?.first_names, count: availableSpouses.length })}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('addPerson.newUnionHint')}
              </p>
            </div>
          )}

          {/* Biography */}
          <div className="space-y-2">
            <Label htmlFor="biography">{t('addPerson.biography')}</Label>
            <Textarea
              id="biography"
              placeholder=""
              value={biography}
              onChange={(e) => setBiography(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            {t('createTree.cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('addPerson.adding')}
              </>
            ) : (
              t('addPerson.add')
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
