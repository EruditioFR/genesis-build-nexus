import { useState } from 'react';
import { Calendar, MapPin, Heart, HeartCrack, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('familyTree');
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

  const unionTypes = ['marriage', 'civil_union', 'partnership', 'engagement', 'other'];
  const endReasons = ['death', 'divorce', 'separation', 'annulment'];

  const getDateLabel = () => {
    return editData.union_type === 'marriage' ? t('union.marriage') : t('union.theUnion');
  };

  const getEndDateLabel = () => {
    switch (editData.end_reason) {
      case 'divorce': return t('union.endReasons.divorce').toLowerCase();
      case 'death': return t('union.endReasons.death').toLowerCase();
      default: return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-secondary" />
            {t('union.title', { name: `${spouse.first_names} ${spouse.last_name}` })}
          </DialogTitle>
          <DialogDescription>
            {t('union.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Union Type */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">{t('union.type')}</Label>
            <Select
              value={editData.union_type}
              onValueChange={(value) => setEditData(prev => ({ ...prev, union_type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('union.type')} />
              </SelectTrigger>
              <SelectContent>
                {unionTypes.map((type) => (
                  <SelectItem key={type} value={type}>{t(`union.types.${type}`)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Start Date */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground flex items-center gap-2">
              <Calendar className="w-3 h-3" />
              {t('union.startDate', { type: getDateLabel() })}
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
              {t('union.startPlace', { type: getDateLabel() })}
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
            <Label className="text-sm">{t('union.isCurrent')}</Label>
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

          {/* End Date & Reason */}
          {!editData.is_current && (
            <>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-2">
                  <HeartCrack className="w-3 h-3" />
                  {t('union.endReason')}
                </Label>
                <Select
                  value={editData.end_reason}
                  onValueChange={(value) => setEditData(prev => ({ ...prev, end_reason: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('union.endReason')} />
                  </SelectTrigger>
                  <SelectContent>
                    {endReasons.map((reason) => (
                      <SelectItem key={reason} value={reason}>{t(`union.endReasons.${reason}`)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  {t('union.endDate', { type: getEndDateLabel() })}
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
            {t('union.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {t('union.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
