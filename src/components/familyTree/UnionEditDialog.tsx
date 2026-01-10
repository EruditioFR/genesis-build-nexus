import { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, MapPin, Heart, HeartCrack, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import type { FamilyUnion, FamilyPerson } from '@/types/familyTree';
import { toast } from 'sonner';

interface UnionEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  union: FamilyUnion;
  spouse: FamilyPerson;
  onSave: (unionId: string, updates: Partial<FamilyUnion>) => Promise<boolean>;
}

export function UnionEditDialog({
  open,
  onOpenChange,
  union,
  spouse,
  onSave
}: UnionEditDialogProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState<{
    union_type: string;
    start_date: string;
    start_place: string;
    end_date: string;
    end_reason: string;
    is_current: boolean;
    notes: string;
  }>({
    union_type: union.union_type || 'marriage',
    start_date: union.start_date || '',
    start_place: union.start_place || '',
    end_date: union.end_date || '',
    end_reason: union.end_reason || '',
    is_current: union.is_current ?? true,
    notes: union.notes || ''
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const success = await onSave(union.id, {
        union_type: editData.union_type as FamilyUnion['union_type'],
        start_date: editData.start_date || null,
        start_place: editData.start_place || null,
        end_date: !editData.is_current ? editData.end_date || null : null,
        end_reason: !editData.is_current ? editData.end_reason as FamilyUnion['end_reason'] || null : null,
        is_current: editData.is_current,
        notes: editData.notes || null
      });

      if (success) {
        onOpenChange(false);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const unionTypeLabels: Record<string, string> = {
    'marriage': 'Mariage',
    'civil_union': 'Union civile (PACS)',
    'partnership': 'Concubinage',
    'engagement': 'Fiançailles',
    'other': 'Autre'
  };

  const endReasonLabels: Record<string, string> = {
    'death': 'Décès',
    'divorce': 'Divorce',
    'separation': 'Séparation',
    'annulment': 'Annulation'
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-secondary" />
            Union avec {spouse.first_names} {spouse.last_name}
          </DialogTitle>
          <DialogDescription>
            Modifiez les informations de cette union
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Union Type */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Type d'union</Label>
            <Select
              value={editData.union_type}
              onValueChange={(value) => setEditData(prev => ({ ...prev, union_type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Type d'union" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(unionTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Start Date (Marriage/Union date) */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground flex items-center gap-2">
              <Calendar className="w-3 h-3" />
              Date de {editData.union_type === 'marriage' ? 'mariage' : "l'union"}
            </Label>
            <Input
              type="date"
              value={editData.start_date}
              onChange={(e) => setEditData(prev => ({ ...prev, start_date: e.target.value }))}
            />
          </div>

          {/* Start Place */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground flex items-center gap-2">
              <MapPin className="w-3 h-3" />
              Lieu de {editData.union_type === 'marriage' ? 'mariage' : "l'union"}
            </Label>
            <Input
              value={editData.start_place}
              onChange={(e) => setEditData(prev => ({ ...prev, start_place: e.target.value }))}
              placeholder="Ville, Pays"
            />
          </div>

          <Separator />

          {/* Is Current */}
          <div className="flex items-center justify-between">
            <Label className="text-sm">Union en cours</Label>
            <Switch
              checked={editData.is_current}
              onCheckedChange={(checked) => setEditData(prev => ({ 
                ...prev, 
                is_current: checked,
                end_date: checked ? '' : prev.end_date,
                end_reason: checked ? '' : prev.end_reason
              }))}
            />
          </div>

          {/* End Date & Reason - only if not current */}
          {!editData.is_current && (
            <>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-2">
                  <HeartCrack className="w-3 h-3" />
                  Raison de la fin
                </Label>
                <Select
                  value={editData.end_reason}
                  onValueChange={(value) => setEditData(prev => ({ ...prev, end_reason: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Raison" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(endReasonLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  Date de {editData.end_reason === 'divorce' ? 'divorce' : editData.end_reason === 'death' ? 'décès' : 'fin'}
                </Label>
                <Input
                  type="date"
                  value={editData.end_date}
                  onChange={(e) => setEditData(prev => ({ ...prev, end_date: e.target.value }))}
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
