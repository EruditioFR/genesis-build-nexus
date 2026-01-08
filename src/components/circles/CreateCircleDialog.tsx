import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Loader2 } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
}

const CreateCircleDialog = ({ open, onOpenChange, userId, onCircleCreated }: CreateCircleDialogProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedColor, setSelectedColor] = useState(circleColors[0]);

  const form = useForm<CircleFormValues>({
    resolver: zodResolver(circleSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const onSubmit = async (values: CircleFormValues) => {
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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
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
      </DialogContent>
    </Dialog>
  );
};

export default CreateCircleDialog;
