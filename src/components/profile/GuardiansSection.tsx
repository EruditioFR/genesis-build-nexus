import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Plus, Trash2, Mail, CheckCircle2, Clock, Loader2, Send, UserCheck, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

import type { Database } from '@/integrations/supabase/types';

type Guardian = Database['public']['Tables']['guardians']['Row'];

const guardianSchema = z.object({
  guardian_name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  guardian_email: z.string().email('Email invalide'),
});

type GuardianFormValues = z.infer<typeof guardianSchema>;

interface GuardiansSectionProps {
  userId: string;
}

const GuardiansSection = ({ userId }: GuardiansSectionProps) => {
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sendingEmailTo, setSendingEmailTo] = useState<string | null>(null);

  const form = useForm<GuardianFormValues>({
    resolver: zodResolver(guardianSchema),
    defaultValues: {
      guardian_name: '',
      guardian_email: '',
    },
  });

  useEffect(() => {
    fetchGuardians();
  }, [userId]);

  const fetchGuardians = async () => {
    try {
      const { data, error } = await supabase
        .from('guardians')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGuardians(data || []);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des gardiens');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (values: GuardianFormValues) => {
    setIsSubmitting(true);

    try {
      // Check if guardian already exists
      const existingGuardian = guardians.find(
        (g) => g.guardian_email.toLowerCase() === values.guardian_email.toLowerCase()
      );

      if (existingGuardian) {
        toast.error('Ce gardien est déjà ajouté');
        setIsSubmitting(false);
        return;
      }

      const { data, error } = await supabase
        .from('guardians')
        .insert({
          user_id: userId,
          guardian_name: values.guardian_name,
          guardian_email: values.guardian_email,
        })
        .select()
        .single();

      if (error) throw error;

      setGuardians([data, ...guardians]);
      toast.success('Gardien ajouté avec succès');
      form.reset();
      setIsDialogOpen(false);

      // Send verification email
      sendVerificationEmail(data);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'ajout du gardien');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendVerificationEmail = async (guardian: Guardian) => {
    setSendingEmailTo(guardian.id);

    try {
      const { error } = await supabase.functions.invoke('send-guardian-email', {
        body: {
          guardianId: guardian.id,
          guardianEmail: guardian.guardian_email,
          guardianName: guardian.guardian_name,
          verificationToken: guardian.verification_token,
        },
      });

      if (error) throw error;
      toast.success(`Email de vérification envoyé à ${guardian.guardian_email}`);
    } catch (error: any) {
      toast.error('Erreur lors de l\'envoi de l\'email');
    } finally {
      setSendingEmailTo(null);
    }
  };

  const deleteGuardian = async (guardianId: string) => {
    try {
      const { error } = await supabase
        .from('guardians')
        .delete()
        .eq('id', guardianId);

      if (error) throw error;

      setGuardians(guardians.filter((g) => g.id !== guardianId));
      toast.success('Gardien supprimé');
    } catch (error: any) {
      toast.error('Erreur lors de la suppression');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="p-6 rounded-2xl border border-border bg-card"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h2 className="text-lg font-display font-semibold text-foreground">
              Gardiens de confiance
            </h2>
            <p className="text-sm text-muted-foreground">
              Personnes autorisées à déverrouiller vos capsules héritage
            </p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2 bg-gradient-gold hover:opacity-90 text-primary-foreground">
              <Plus className="w-4 h-4" />
              Ajouter
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un gardien</DialogTitle>
              <DialogDescription>
                Un gardien de confiance pourra déverrouiller vos capsules héritage selon vos instructions.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="guardian_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom du gardien</FormLabel>
                      <FormControl>
                        <Input placeholder="Jean Dupont" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="guardian_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email du gardien</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="jean.dupont@email.com"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Un email de vérification sera envoyé
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Ajout...
                      </>
                    ) : (
                      'Ajouter le gardien'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {guardians.length === 0 ? (
        <div className="text-center py-8 bg-muted/30 rounded-xl">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-2">Aucun gardien configuré</p>
          <p className="text-sm text-muted-foreground">
            Ajoutez des personnes de confiance pour gérer vos capsules héritage
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {guardians.map((guardian, index) => (
              <motion.div
                key={guardian.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/50"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    guardian.verified_at 
                      ? 'bg-green-100 dark:bg-green-900/30' 
                      : 'bg-amber-100 dark:bg-amber-900/30'
                  }`}>
                    {guardian.verified_at ? (
                      <UserCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">
                        {guardian.guardian_name}
                      </span>
                      {guardian.verified_at ? (
                        <Badge variant="secondary" className="gap-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          <CheckCircle2 className="w-3 h-3" />
                          Vérifié
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                          <AlertTriangle className="w-3 h-3" />
                          En attente
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-3 h-3" />
                      {guardian.guardian_email}
                    </div>
                    {guardian.verified_at && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Vérifié le {format(new Date(guardian.verified_at), 'd MMMM yyyy', { locale: fr })}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!guardian.verified_at && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => sendVerificationEmail(guardian)}
                      disabled={sendingEmailTo === guardian.id}
                      className="gap-1.5 text-muted-foreground hover:text-foreground"
                    >
                      {sendingEmailTo === guardian.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      Renvoyer
                    </Button>
                  )}

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer ce gardien ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          {guardian.guardian_name} ne pourra plus déverrouiller vos capsules héritage. 
                          Cette action est irréversible.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteGuardian(guardian.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {guardians.length > 0 && (
        <p className="text-xs text-muted-foreground mt-4 text-center">
          Les gardiens vérifiés recevront des instructions pour déverrouiller vos capsules héritage selon vos paramètres.
        </p>
      )}
    </motion.div>
  );
};

export default GuardiansSection;
