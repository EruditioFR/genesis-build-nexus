import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Loader2, Lock, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { supabase } from '@/integrations/supabase/client';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';

const circleColors = [
  '#1E3A5F', '#D4AF37', '#E67E5C', '#4A7C59', '#8B5CF6',
  '#EC4899', '#F59E0B', '#10B981', '#6366F1', '#EF4444',
];

const circleSchema = z.object({
  name: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères'),
  description: z.string()
    .max(200, 'La description ne peut pas dépasser 200 caractères')
    .optional(),
});

type CircleFormValues = z.infer<typeof circleSchema>;

interface CreateCircleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onCircleCreated: () => void;
  currentCircleCount: number;
}

const CreateCircleDialog = ({ open, onOpenChange, userId, onCircleCreated, currentCircleCount }: CreateCircleDialogProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedColor, setSelectedColor] = useState(circleColors[0]);
  const { limits, tier, isHeritage } = useFeatureAccess();

  const maxCircles = limits.maxCircles;
  const isUnlimited = maxCircles === -1;
  const hasReachedLimit = !isUnlimited && currentCircleCount >= maxCircles;

  const form = useForm<CircleFormValues>({
    resolver: zodResolver(circleSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const onSubmit = async (values: CircleFormValues) => {
    if (hasReachedLimit) {
      toast.error(`Vous avez atteint la limite de ${maxCircles} cercle(s) pour votre forfait.`);
      return;
    }

    setIsCreating(true);

    try {
      const { error } = await supabase.from('circles').insert({
        owner_id: userId,
        name: values.name,
        description: values.description || null,
        color: selectedColor,
      });

      if (error) throw error;

      toast.success('Cercle créé avec succès !');
      form.reset();
      setSelectedColor(circleColors[0]);
      onOpenChange(false);
      onCircleCreated();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la création');
    } finally {
      setIsCreating(false);
    }
  };

  const getUpgradeMessage = () => {
    if (tier === 'free') {
      return {
        message: 'Passez au forfait Premium pour créer jusqu\'à 3 cercles, ou Héritage pour un nombre illimité.',
        link: '/premium',
      };
    }
    if (tier === 'premium') {
      return {
        message: 'Passez au forfait Héritage pour créer un nombre illimité de cercles.',
        link: '/premium?tier=heritage',
      };
    }
    return null;
  };

  const upgradeInfo = getUpgradeMessage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <Users className="w-5 h-5 text-secondary" />
            Créer un cercle
          </DialogTitle>
          <DialogDescription>
            Un cercle vous permet de partager vos capsules avec un groupe de personnes.
          </DialogDescription>
        </DialogHeader>

        {hasReachedLimit ? (
          <div className="py-6 space-y-4">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Lock className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Limite atteinte</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Vous avez atteint la limite de {maxCircles} cercle{maxCircles > 1 ? 's' : ''} pour votre forfait {limits.planNameFr}.
                </p>
              </div>
            </div>
            
            {upgradeInfo && (
              <Alert className="bg-secondary/10 border-secondary/30">
                <Crown className="w-4 h-4 text-secondary" />
                <AlertDescription className="ml-2">
                  {upgradeInfo.message}
                  <Link 
                    to={upgradeInfo.link}
                    className="block mt-2 text-secondary font-medium hover:underline"
                  >
                    Voir les forfaits →
                  </Link>
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Fermer
              </Button>
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
              {!isUnlimited && (
                <p className="text-xs text-muted-foreground">
                  {currentCircleCount}/{maxCircles} cercle{maxCircles > 1 ? 's' : ''} utilisé{currentCircleCount > 1 ? 's' : ''}
                </p>
              )}

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom du cercle</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Famille, Amis proches..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (optionnel)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Décrivez ce cercle..."
                        className="resize-none"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <FormLabel className="mb-2 block">Couleur</FormLabel>
                <div className="flex flex-wrap gap-2">
                  {circleColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full transition-all ${
                        selectedColor === color 
                          ? 'ring-2 ring-offset-2 ring-foreground scale-110' 
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={isCreating} className="gap-2">
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Création...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Créer le cercle
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateCircleDialog;
