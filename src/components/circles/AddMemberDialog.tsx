import { useState } from 'react';
import { UserPlus, Loader2, X, Mail } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Badge } from '@/components/ui/badge';

import { supabase } from '@/integrations/supabase/client';

const memberSchema = z.object({
  email: z.string().email('Email invalide'),
  name: z.string().max(100).optional(),
});

type MemberFormValues = z.infer<typeof memberSchema>;

interface AddMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  circleId: string;
  circleName: string;
  onMemberAdded: () => void;
}

const AddMemberDialog = ({ open, onOpenChange, circleId, circleName, onMemberAdded }: AddMemberDialogProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [pendingEmails, setPendingEmails] = useState<{ email: string; name?: string }[]>([]);

  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      email: '',
      name: '',
    },
  });

  const addToPending = (values: MemberFormValues) => {
    if (pendingEmails.some(p => p.email === values.email)) {
      toast.error('Cet email est déjà dans la liste');
      return;
    }
    setPendingEmails([...pendingEmails, { email: values.email, name: values.name }]);
    form.reset();
  };

  const removeFromPending = (email: string) => {
    setPendingEmails(pendingEmails.filter(p => p.email !== email));
  };

  const handleSubmit = async () => {
    if (pendingEmails.length === 0) {
      const isValid = await form.trigger();
      if (isValid) {
        const values = form.getValues();
        if (values.email) {
          addToPending(values);
          return;
        }
      }
      toast.error('Ajoutez au moins un email');
      return;
    }

    setIsAdding(true);

    try {
      const membersToInsert = pendingEmails.map(member => ({
        circle_id: circleId,
        email: member.email,
        name: member.name || null,
      }));

      const { error } = await supabase.from('circle_members').insert(membersToInsert);

      if (error) throw error;

      toast.success(`${pendingEmails.length} membre(s) invité(s) avec succès !`);
      setPendingEmails([]);
      form.reset();
      onOpenChange(false);
      onMemberAdded();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'invitation');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <UserPlus className="w-5 h-5 text-secondary" />
            Inviter des membres
          </DialogTitle>
          <DialogDescription>
            Invitez des personnes à rejoindre le cercle "{circleName}"
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(addToPending)} className="space-y-4 mt-4">
            <div className="flex gap-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input placeholder="email@exemple.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="w-32">
                    <FormControl>
                      <Input placeholder="Nom (opt.)" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" variant="outline" size="icon">
                <UserPlus className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </Form>

        {/* Pending emails list */}
        {pendingEmails.length > 0 && (
          <div className="space-y-2 mt-4">
            <p className="text-sm text-muted-foreground">
              {pendingEmails.length} membre(s) à inviter :
            </p>
            <div className="flex flex-wrap gap-2">
              {pendingEmails.map((member) => (
                <Badge
                  key={member.email}
                  variant="secondary"
                  className="gap-1 pr-1"
                >
                  <Mail className="w-3 h-3" />
                  {member.name || member.email}
                  <button
                    onClick={() => removeFromPending(member.email)}
                    className="ml-1 p-0.5 hover:bg-secondary/50 rounded"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isAdding} className="gap-2">
            {isAdding ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Invitation...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Inviter {pendingEmails.length > 0 ? `(${pendingEmails.length})` : ''}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddMemberDialog;
