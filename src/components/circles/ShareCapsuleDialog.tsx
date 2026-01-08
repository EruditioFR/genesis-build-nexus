import { useState, useEffect } from 'react';
import { Share2, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { supabase } from '@/integrations/supabase/client';

interface Circle {
  id: string;
  name: string;
  color: string | null;
}

interface ShareCapsuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  capsuleId: string;
  capsuleTitle: string;
  userId: string;
}

const ShareCapsuleDialog = ({ open, onOpenChange, capsuleId, capsuleTitle, userId }: ShareCapsuleDialogProps) => {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [sharedCircleIds, setSharedCircleIds] = useState<string[]>([]);
  const [selectedCircleIds, setSelectedCircleIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!open) return;
      
      setIsLoading(true);

      // Fetch user's circles
      const { data: circlesData } = await supabase
        .from('circles')
        .select('id, name, color')
        .eq('owner_id', userId);

      if (circlesData) {
        setCircles(circlesData);
      }

      // Fetch existing shares for this capsule
      const { data: sharesData } = await supabase
        .from('capsule_shares')
        .select('circle_id')
        .eq('capsule_id', capsuleId);

      if (sharesData) {
        const ids = sharesData.map(s => s.circle_id);
        setSharedCircleIds(ids);
        setSelectedCircleIds(ids);
      }

      setIsLoading(false);
    };

    fetchData();
  }, [open, capsuleId, userId]);

  const toggleCircle = (circleId: string) => {
    setSelectedCircleIds(prev =>
      prev.includes(circleId)
        ? prev.filter(id => id !== circleId)
        : [...prev, circleId]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Find circles to add and remove
      const toAdd = selectedCircleIds.filter(id => !sharedCircleIds.includes(id));
      const toRemove = sharedCircleIds.filter(id => !selectedCircleIds.includes(id));

      // Remove shares
      if (toRemove.length > 0) {
        const { error: removeError } = await supabase
          .from('capsule_shares')
          .delete()
          .eq('capsule_id', capsuleId)
          .in('circle_id', toRemove);

        if (removeError) throw removeError;
      }

      // Add shares
      if (toAdd.length > 0) {
        const sharesToInsert = toAdd.map(circleId => ({
          capsule_id: capsuleId,
          circle_id: circleId,
          shared_by: userId,
        }));

        const { error: addError } = await supabase
          .from('capsule_shares')
          .insert(sharesToInsert);

        if (addError) throw addError;
      }

      toast.success('Partage mis à jour !');
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du partage');
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = JSON.stringify(selectedCircleIds.sort()) !== JSON.stringify(sharedCircleIds.sort());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <Share2 className="w-5 h-5 text-secondary" />
            Partager la capsule
          </DialogTitle>
          <DialogDescription>
            Sélectionnez les cercles avec lesquels partager "{capsuleTitle}"
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : circles.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Vous n'avez pas encore créé de cercle.
            </p>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Créer un cercle d'abord
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-2 mt-4 max-h-[300px] overflow-y-auto">
              {circles.map((circle) => (
                <div
                  key={circle.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => toggleCircle(circle.id)}
                >
                  <Checkbox
                    checked={selectedCircleIds.includes(circle.id)}
                    onCheckedChange={() => toggleCircle(circle.id)}
                  />
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: circle.color || '#1E3A5F' }}
                  />
                  <span className="font-medium text-foreground flex-1">
                    {circle.name}
                  </span>
                  {sharedCircleIds.includes(circle.id) && (
                    <Check className="w-4 h-4 text-green-600" />
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t mt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={isSaving || !hasChanges}
                className="gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    Enregistrer
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ShareCapsuleDialog;
