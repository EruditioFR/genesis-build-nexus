import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { fr, enUS, es, ko, zhCN } from 'date-fns/locale';
import { CalendarIcon, User, Loader2, Users, Search, X, UserPlus, Baby, ChevronDown } from 'lucide-react';
import { PlaceAutocomplete } from './PlaceAutocomplete';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { FamilyAvatar } from '@/components/familyTree/FamilyAvatar';
import { cn } from '@/lib/utils';
import { useFamilyTree } from '@/hooks/useFamilyTree';
import { useIsMobile } from '@/hooks/use-mobile';
import { PersonValidationWarnings } from './PersonValidationWarnings';
import type { FamilyPerson, FamilyUnion } from '@/types/familyTree';

interface AddPersonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  treeId: string;
  relationType: 'parent' | 'child' | 'spouse' | 'sibling' | null;
  targetPerson: FamilyPerson | null;
  onPersonAdded: (person: FamilyPerson, secondParentId?: string, unionId?: string, extraLinks?: { parentIds: string[]; childIds: string[] }) => void;
  availableSpouses?: FamilyPerson[];
  existingUnions?: FamilyUnion[];
  allPersons?: FamilyPerson[];
}

export function AddPersonDialog({
  open,
  onOpenChange,
  treeId,
  relationType,
  targetPerson,
  onPersonAdded,
  availableSpouses = [],
  existingUnions = [],
  allPersons = []
}: AddPersonDialogProps) {
  const { t, i18n } = useTranslation('familyTree');
  const { addPerson, loading } = useFamilyTree();
  const isMobile = useIsMobile();
  
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
  const [birthPlaceCoords, setBirthPlaceCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isAlive, setIsAlive] = useState(true);
  const [deathDate, setDeathDate] = useState<Date>();
  const [deathPlace, setDeathPlace] = useState('');
  const [occupation, setOccupation] = useState('');
  const [biography, setBiography] = useState('');
  
  const [secondParentId, setSecondParentId] = useState<string>('none');
  const [selectedUnionId, setSelectedUnionId] = useState<string>('auto');
  const [isNewUnion, setIsNewUnion] = useState(false);
  const [selectedParentIds, setSelectedParentIds] = useState<string[]>([]);
  const [selectedChildIds, setSelectedChildIds] = useState<string[]>([]);
  const [linkSearchQuery, setLinkSearchQuery] = useState('');
  const [showMoreFields, setShowMoreFields] = useState(false);

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
    setBirthPlaceCoords(null);
    setIsAlive(true);
    setDeathDate(undefined);
    setDeathPlace('');
    setOccupation('');
    setBiography('');
    setSecondParentId('none');
    setSelectedUnionId('auto');
    setIsNewUnion(false);
    setSelectedParentIds([]);
    setSelectedChildIds([]);
    setLinkSearchQuery('');
    setShowMoreFields(false);
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
      birth_place_lat: birthPlaceCoords?.lat ?? null,
      birth_place_lng: birthPlaceCoords?.lng ?? null,
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

      const extraLinks = (selectedParentIds.length > 0 || selectedChildIds.length > 0)
        ? { parentIds: selectedParentIds, childIds: selectedChildIds }
        : undefined;
      
      onPersonAdded(person, selectedSecondParent, unionIdToUse, extraLinks);
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

  const formContent = (
    <>
      <div className="space-y-4">
        {/* Name fields - stack on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="firstName" className="text-sm">{t('addPerson.firstName')} *</Label>
            <Input
              id="firstName"
              placeholder="Jean Pierre"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="h-11"
              autoFocus={!isMobile}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lastName" className="text-sm">{t('addPerson.lastName')} *</Label>
            <Input
              id="lastName"
              placeholder="Martin"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="h-11"
            />
          </div>
        </div>

        {/* Gender - chip-style buttons for better mobile touch targets */}
        <div className="space-y-1.5">
          <Label className="text-sm">{t('addPerson.gender')}</Label>
          <div className="flex gap-2">
            {(['male', 'female', 'other'] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGender(g)}
                className={cn(
                  "flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-colors border",
                  "min-h-[44px]",
                  gender === g
                    ? "bg-secondary text-secondary-foreground border-secondary"
                    : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
                )}
              >
                {t(`addPerson.${g}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Birth date & place - stack on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-sm">{t('addPerson.birthDate')}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-11",
                    !birthDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                  <span className="truncate">
                    {birthDate ? format(birthDate, "dd/MM/yyyy") : t('addPerson.select')}
                  </span>
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
          <div className="space-y-1.5">
            <Label htmlFor="birthPlace" className="text-sm">{t('addPerson.birthPlace')}</Label>
            <PlaceAutocomplete
              id="birthPlace"
              value={birthPlace}
              onChange={(val, coords) => {
                setBirthPlace(val);
                if (coords) setBirthPlaceCoords(coords);
              }}
              className="h-11"
            />
          </div>
        </div>

        {/* Alive status */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg min-h-[48px]">
          <Label htmlFor="isAlive" className="cursor-pointer text-sm">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="space-y-1.5">
              <Label className="text-sm">{t('addPerson.deathDate')}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-11",
                      !deathDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                    <span className="truncate">
                      {deathDate ? format(deathDate, "dd/MM/yyyy") : t('addPerson.select')}
                    </span>
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
            <div className="space-y-1.5">
              <Label htmlFor="deathPlace" className="text-sm">{t('addPerson.deathPlace')}</Label>
              <Input
                id="deathPlace"
                placeholder="Lyon, France"
                value={deathPlace}
                onChange={(e) => setDeathPlace(e.target.value)}
                className="h-11"
              />
            </div>
          </div>
        )}

        {/* Second parent selection for children */}
        {relationType === 'child' && availableSpouses.length > 0 && (
          <div className="space-y-3 p-3 bg-secondary/5 border border-secondary/20 rounded-lg">
            <div>
              <Label className="flex items-center gap-2 text-secondary text-sm">
                <Users className="w-4 h-4 shrink-0" />
                {t('addPerson.secondParent')}
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                {t('addPerson.secondParentHint', { name: targetPerson?.first_names })}
              </p>
            </div>
            <Select value={secondParentId} onValueChange={setSecondParentId}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder={t('addPerson.select')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <span className="text-muted-foreground">{t('addPerson.noneUnknown')}</span>
                </SelectItem>
                {availableSpouses.map((spouse) => (
                  <SelectItem key={spouse.id} value={spouse.id}>
                    <div className="flex items-center gap-2">
                      <FamilyAvatar
                        photoUrl={spouse.profile_photo_url}
                        fallback={`${spouse.first_names[0]}${spouse.last_name[0]}`}
                        className="w-5 h-5"
                        fallbackClassName="text-[10px]"
                      />
                      <span className="truncate">{spouse.first_names} {spouse.last_name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasMultipleUnions && (
              <div className="pt-2 border-t border-secondary/20">
                <Label className="text-xs text-muted-foreground mb-2 block">
                  {t('addPerson.selectUnion')}
                </Label>
                <Select value={selectedUnionId} onValueChange={setSelectedUnionId}>
                  <SelectTrigger className="h-11">
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

        {/* New union info for spouse */}
        {hasExistingSpouses && (
          <div className="space-y-2 p-3 bg-accent/50 border border-accent rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 shrink-0 text-accent-foreground" />
              <span className="text-sm font-medium">
                {t('addPerson.existingSpouses', { name: targetPerson?.first_names, count: availableSpouses.length })}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {t('addPerson.newUnionHint')}
            </p>
          </div>
        )}

        {/* Collapsible extra fields for mobile */}
        <Collapsible open={showMoreFields} onOpenChange={setShowMoreFields}>
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full py-2"
            >
              <ChevronDown className={cn("w-4 h-4 transition-transform", showMoreFields && "rotate-180")} />
              {t('addPerson.moreInfo')}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-1">
            {/* Maiden name */}
            <div className="space-y-1.5">
              <Label htmlFor="maidenName" className="text-sm">{t('addPerson.maidenName')}</Label>
              <Input
                id="maidenName"
                placeholder="Dupont"
                value={maidenName}
                onChange={(e) => setMaidenName(e.target.value)}
                className="h-11"
              />
            </div>

            {/* Occupation */}
            <div className="space-y-1.5">
              <Label htmlFor="occupation" className="text-sm">{t('addPerson.occupation')}</Label>
              <Input
                id="occupation"
                placeholder="Instituteur"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="h-11"
              />
            </div>

            {/* Biography */}
            <div className="space-y-1.5">
              <Label htmlFor="biography" className="text-sm">{t('addPerson.biography')}</Label>
              <Textarea
                id="biography"
                placeholder=""
                value={biography}
                onChange={(e) => setBiography(e.target.value)}
                rows={3}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Optional links to parents/children */}
        {allPersons.length > 0 && (
          <Collapsible>
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full py-2"
              >
                <Users className="w-4 h-4 shrink-0" />
                {t('addPerson.optionalLinks')}
                <ChevronDown className="w-4 h-4 ml-auto transition-transform data-[state=open]:rotate-180" />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-3 p-3 bg-muted/50 border rounded-lg mt-1">
                <p className="text-xs text-muted-foreground">
                  {t('addPerson.optionalLinksHint')}
                </p>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={t('addPerson.searchPerson')}
                    value={linkSearchQuery}
                    onChange={(e) => setLinkSearchQuery(e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>

                {/* Selected parents */}
                {selectedParentIds.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <UserPlus className="w-3 h-3" />
                      {t('addPerson.selectedParents')}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedParentIds.map(id => {
                        const p = allPersons.find(p => p.id === id);
                        if (!p) return null;
                        return (
                          <span key={id} className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-secondary/10 border border-secondary/30 rounded-full min-h-[32px]">
                            {p.first_names} {p.last_name}
                            <button
                              type="button"
                              onClick={() => setSelectedParentIds(prev => prev.filter(pid => pid !== id))}
                              className="hover:text-destructive p-0.5"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Selected children */}
                {selectedChildIds.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <Baby className="w-3 h-3" />
                      {t('addPerson.selectedChildren')}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedChildIds.map(id => {
                        const p = allPersons.find(p => p.id === id);
                        if (!p) return null;
                        return (
                          <span key={id} className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-secondary/10 border border-secondary/30 rounded-full min-h-[32px]">
                            {p.first_names} {p.last_name}
                            <button
                              type="button"
                              onClick={() => setSelectedChildIds(prev => prev.filter(cid => cid !== id))}
                              className="hover:text-destructive p-0.5"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Person list */}
                {linkSearchQuery.trim().length > 0 && (() => {
                  const filtered = allPersons.filter(p => {
                    if (targetPerson && p.id === targetPerson.id) return false;
                    if (selectedParentIds.includes(p.id) || selectedChildIds.includes(p.id)) return false;
                    const fullName = `${p.first_names} ${p.last_name}`.toLowerCase();
                    return fullName.includes(linkSearchQuery.toLowerCase());
                  }).slice(0, 6);

                  return filtered.length > 0 ? (
                    <div className="border rounded-lg divide-y max-h-[200px] overflow-y-auto">
                      {filtered.map(person => (
                        <div key={person.id} className="flex items-center gap-2 p-2.5 hover:bg-muted">
                          <FamilyAvatar
                            photoUrl={person.profile_photo_url}
                            fallback={`${person.first_names[0]}${person.last_name[0]}`}
                            className="w-8 h-8 shrink-0"
                            fallbackClassName="text-xs"
                          />
                          <span className="text-sm truncate flex-1 min-w-0">{person.first_names} {person.last_name}</span>
                          <div className="flex gap-1 shrink-0">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 px-2.5 text-xs gap-1"
                              onClick={() => {
                                setSelectedParentIds(prev => [...prev, person.id]);
                                setLinkSearchQuery('');
                              }}
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">{t('addPerson.asParent')}</span>
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 px-2.5 text-xs gap-1"
                              onClick={() => {
                                setSelectedChildIds(prev => [...prev, person.id]);
                                setLinkSearchQuery('');
                              }}
                            >
                              <Baby className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">{t('addPerson.asChild')}</span>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-3">{t('link.noResults')}</p>
                  );
                })()}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>

      <PersonValidationWarnings
        person={{
          birth_date: birthDate ? `${birthDate.getFullYear()}-${String(birthDate.getMonth() + 1).padStart(2, '0')}-${String(birthDate.getDate()).padStart(2, '0')}` : null,
          death_date: !isAlive && deathDate ? `${deathDate.getFullYear()}-${String(deathDate.getMonth() + 1).padStart(2, '0')}-${String(deathDate.getDate()).padStart(2, '0')}` : null,
          is_alive: isAlive,
          gender,
        }}
        relationType={relationType}
        targetPerson={targetPerson}
      />

      {/* Sticky footer */}
      <div className="flex gap-2 pt-4 border-t sticky bottom-0 bg-background pb-1">
        <Button variant="outline" onClick={handleClose} className="flex-1 h-12 sm:flex-none sm:h-10">
          {t('createTree.cancel')}
        </Button>
        <Button onClick={handleSubmit} disabled={!canSubmit || loading} className="flex-1 h-12 sm:flex-none sm:h-10">
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
    </>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={handleClose}>
        <DrawerContent className="max-h-[92vh]">
          <DrawerHeader className="text-left pb-2">
            <DrawerTitle className="flex items-center gap-2 text-base">
              <User className="w-5 h-5 text-secondary shrink-0" />
              <span className="truncate">{getTitle()}</span>
            </DrawerTitle>
            <DrawerDescription className="text-xs">
              {t('addPerson.description')}
            </DrawerDescription>
          </DrawerHeader>
          <div className="overflow-y-auto px-4 pb-4 space-y-4">
            {formContent}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

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
        <div className="py-2">
          {formContent}
        </div>
      </DialogContent>
    </Dialog>
  );
}
