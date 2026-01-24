import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import type { ParentChildRelationship, FamilyPerson } from '@/types/familyTree';

interface RelationshipEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  relationship: ParentChildRelationship;
  parent: FamilyPerson;
  child: FamilyPerson;
  onSave: (relationshipId: string, updates: Partial<ParentChildRelationship>) => Promise<boolean>;
}

const RELATIONSHIP_TYPES: ParentChildRelationship['relationship_type'][] = [
  'biological',
  'adopted',
  'step',
  'foster',
];

export function RelationshipEditDialog({
  open,
  onOpenChange,
  relationship,
  parent,
  child,
  onSave,
}: RelationshipEditDialogProps) {
  const { t } = useTranslation('familyTree');
  const [relationshipType, setRelationshipType] = useState<ParentChildRelationship['relationship_type']>(
    relationship.relationship_type
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const success = await onSave(relationship.id, {
        relationship_type: relationshipType,
      });
      if (success) {
        onOpenChange(false);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('relationship.title')}</DialogTitle>
          <DialogDescription>
            {t('relationship.description', { 
              parent: `${parent.first_names} ${parent.last_name}`, 
              child: `${child.first_names} ${child.last_name}` 
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="relationshipType">{t('relationship.type')}</Label>
            <Select
              value={relationshipType}
              onValueChange={(value: ParentChildRelationship['relationship_type']) => setRelationshipType(value)}
            >
              <SelectTrigger id="relationshipType">
                <SelectValue placeholder={t('addPerson.select')} />
              </SelectTrigger>
              <SelectContent>
                {RELATIONSHIP_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {t(`relationship.types.${type}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            {t('relationship.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {t('relationship.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
