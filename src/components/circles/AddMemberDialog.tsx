import { useState } from 'react';
import { UserPlus, Loader2, X, Mail, Lock, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  FormMessage,
} from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';

import { supabase } from '@/integrations/supabase/client';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';

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
  currentMemberCount: number;
}

const AddMemberDialog = ({ open, onOpenChange, circleId, circleName, onMemberAdded, currentMemberCount }: AddMemberDialogProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [pendingEmails, setPendingEmails] = useState<{ email: string; name?: string }[]>([]);
  const { limits, tier } = useFeatureAccess();

  const maxMembers = limits.maxMembersPerCircle;
  const isUnlimited = maxMembers === -1;
  const remainingSlots = isUnlimited ? Infinity : maxMembers - currentMemberCount;
  const hasReachedLimit = !isUnlimited && currentMemberCount >= maxMembers;

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
    
    // Check if adding this would exceed the limit
    if (!isUnlimited && (currentMemberCount + pendingEmails.length + 1) > maxMembers) {
      toast.error(`Limite de ${maxMembers} membre(s) par cercle atteinte pour votre forfait.`);
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
      // Get user session for auth
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Non connecté');

      // Get inviter profile
      const { data: inviterProfile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('user_id', session.user.id)
        .maybeSingle();
      
      const inviterName = inviterProfile?.display_name || session.user.email || 'Un utilisateur';

      for (const member of pendingEmails) {
        // Insert member
        const { data: insertedMember, error } = await supabase
          .from('circle_members')
          .insert({
            circle_id: circleId,
            email: member.email,
            name: member.name || null,
          })
          .select('invitation_token')
          .single();

        if (error) throw error;

        // Send invitation email
        await supabase.functions.invoke('send-invitation-email', {
          body: {
            circleId,
            circleName,
            inviterName,
            memberEmail: member.email,
            memberName: member.name,
            invitationToken: insertedMember.invitation_token,
          },
        });
      }

      toast.success(`${pendingEmails.length} invitation(s) envoyée(s) par email !`);
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

  const getUpgradeMessage = () => {
    if (tier === 'free') {
      return {
        message: 'Passez au forfait Premium pour inviter jusqu\'à 5 membres par cercle, ou Héritage pour un nombre illimité.',
        link: '/premium',
      };
    }
    if (tier === 'premium') {
      return {
        message: 'Passez au forfait Héritage pour inviter un nombre illimité de membres par cercle.',
        link: '/premium?tier=heritage',
      };
    }
    return null;
  };

  const upgradeInfo = getUpgradeMessage();

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

        {hasReachedLimit ? (
          <div className="py-6 space-y-4">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Lock className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Limite atteinte</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Vous avez atteint la limite de {maxMembers} membre{maxMembers > 1 ? 's' : ''} par cercle pour votre forfait {limits.planNameFr}.
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
          <>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(addToPending)} className="space-y-4 mt-4">
                {!isUnlimited && (
                  <p className="text-xs text-muted-foreground">
                    {currentMemberCount}/{maxMembers} membre{maxMembers > 1 ? 's' : ''} • {remainingSlots - pendingEmails.length} place{remainingSlots - pendingEmails.length > 1 ? 's' : ''} restante{remainingSlots - pendingEmails.length > 1 ? 's' : ''}
                  </p>
                )}
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
                  <Button 
                    type="submit" 
                    variant="outline" 
                    size="icon"
                    disabled={!isUnlimited && (currentMemberCount + pendingEmails.length) >= maxMembers}
                  >
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
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddMemberDialog;
