import { useState, useEffect } from 'react';
import { Lock, CalendarClock, Shield, Info, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface Guardian {
  id: string;
  guardian_email: string;
  guardian_name: string | null;
  verified_at: string | null;
}

interface LegacySettingsProps {
  userId: string;
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  unlockType: 'date' | 'guardian';
  onUnlockTypeChange: (type: 'date' | 'guardian') => void;
  unlockDate: Date | null;
  onUnlockDateChange: (date: Date | null) => void;
  guardianId: string | null;
  onGuardianIdChange: (id: string | null) => void;
}

const LegacySettings = ({
  userId,
  enabled,
  onEnabledChange,
  unlockType,
  onUnlockTypeChange,
  unlockDate,
  onUnlockDateChange,
  guardianId,
  onGuardianIdChange,
}: LegacySettingsProps) => {
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [loadingGuardians, setLoadingGuardians] = useState(false);

  useEffect(() => {
    if (enabled && unlockType === 'guardian') {
      fetchGuardians();
    }
  }, [enabled, unlockType, userId]);

  const fetchGuardians = async () => {
    setLoadingGuardians(true);
    try {
      const { data, error } = await supabase
        .from('guardians')
        .select('id, guardian_email, guardian_name, verified_at')
        .eq('user_id', userId);

      if (error) throw error;
      setGuardians(data || []);
    } catch (err: any) {
      console.error('Error fetching guardians:', err);
      toast.error('Erreur lors du chargement des gardiens');
    } finally {
      setLoadingGuardians(false);
    }
  };

  // Minimum date is 1 month from now
  const minDate = new Date();
  minDate.setMonth(minDate.getMonth() + 1);
  minDate.setHours(0, 0, 0, 0);

  return (
    <div className="space-y-4 p-4 rounded-lg border border-primary/20 bg-primary/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary" />
          <Label className="text-base font-medium">Capsule Héritage</Label>
        </div>
        <Switch checked={enabled} onCheckedChange={onEnabledChange} />
      </div>

      {enabled && (
        <>
          <div className="p-3 rounded-md bg-muted/50 text-sm text-muted-foreground flex gap-2">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>
              Une capsule héritage reste verrouillée jusqu'à ce qu'une condition 
              soit remplie. Idéal pour transmettre des souvenirs à une date précise 
              ou après votre accord.
            </p>
          </div>

          <RadioGroup
            value={unlockType}
            onValueChange={(v) => onUnlockTypeChange(v as 'date' | 'guardian')}
            className="space-y-3"
          >
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="date" id="unlock-date" />
              <Label htmlFor="unlock-date" className="flex items-center gap-2 cursor-pointer">
                <CalendarClock className="w-4 h-4" />
                Déverrouillage à une date précise
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="guardian" id="unlock-guardian" />
              <Label htmlFor="unlock-guardian" className="flex items-center gap-2 cursor-pointer">
                <Shield className="w-4 h-4" />
                Déverrouillage par un gardien
              </Label>
            </div>
          </RadioGroup>

          {unlockType === 'date' && (
            <div className="space-y-2 pt-2">
              <Label className="text-sm">Date de déverrouillage</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !unlockDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarClock className="mr-2 h-4 w-4" />
                    {unlockDate ? (
                      format(unlockDate, "PPP", { locale: fr })
                    ) : (
                      "Choisir une date"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={unlockDate || undefined}
                    onSelect={(date) => onUnlockDateChange(date || null)}
                    disabled={(date) => date < minDate}
                    initialFocus
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
              {unlockDate && (
                <p className="text-xs text-muted-foreground">
                  La capsule sera déverrouillée le {format(unlockDate, "d MMMM yyyy", { locale: fr })}
                </p>
              )}
            </div>
          )}

          {unlockType === 'guardian' && (
            <div className="space-y-2 pt-2">
              <Label className="text-sm">Gardien responsable</Label>
              {loadingGuardians ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Chargement...
                </div>
              ) : guardians.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Vous n'avez pas encore de gardien. Ajoutez-en un depuis votre profil.
                </p>
              ) : (
                <Select value={guardianId || ''} onValueChange={onGuardianIdChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un gardien" />
                  </SelectTrigger>
                  <SelectContent>
                    {guardians.map((guardian) => (
                      <SelectItem key={guardian.id} value={guardian.id}>
                        <span className="flex items-center gap-2">
                          {guardian.guardian_name || guardian.guardian_email}
                          {guardian.verified_at && (
                            <span className="text-xs text-green-600">✓ Vérifié</span>
                          )}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LegacySettings;
