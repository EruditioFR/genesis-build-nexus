import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, User, Calendar, FileText, Loader2, Shield } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import AvatarUpload from '@/components/profile/AvatarUpload';
import GuardiansSection from '@/components/profile/GuardiansSection';
import { cn } from '@/lib/utils';

import type { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

const profileSchema = z.object({
  display_name: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  bio: z.string()
    .max(500, 'La bio ne peut pas dépasser 500 caractères')
    .optional()
    .nullable(),
  birth_date: z.date().optional().nullable(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const subscriptionLabels = {
  free: { label: 'Gratuit', color: 'bg-muted text-muted-foreground' },
  premium: { label: 'Premium', color: 'bg-gradient-gold text-primary-foreground' },
  legacy: { label: 'Héritage', color: 'bg-primary text-primary-foreground' },
};

const Profile = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      display_name: '',
      bio: '',
      birth_date: null,
    },
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!error && data) {
        setProfile(data);
        form.reset({
          display_name: data.display_name || '',
          bio: data.bio || '',
          birth_date: data.birth_date ? new Date(data.birth_date) : null,
        });
      }
      setProfileLoading(false);
    };

    if (user) {
      fetchProfile();
    }
  }, [user, form]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleAvatarUpdate = (url: string) => {
    if (profile) {
      setProfile({ ...profile, avatar_url: url });
    }
  };

  const onSubmit = async (values: ProfileFormValues) => {
    if (!user) return;
    
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: values.display_name,
          bio: values.bio || null,
          birth_date: values.birth_date ? format(values.birth_date, 'yyyy-MM-dd') : null,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? {
        ...prev,
        display_name: values.display_name,
        bio: values.bio || null,
        birth_date: values.birth_date ? format(values.birth_date, 'yyyy-MM-dd') : null,
      } : null);

      toast.success('Profil mis à jour avec succès !');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la mise à jour');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) return null;

  const subscription = subscriptionLabels[profile.subscription_level];

  return (
    <div className="min-h-screen bg-gradient-warm">
      <DashboardHeader
        user={{
          id: user.id,
          email: user.email,
          displayName: profile.display_name || undefined,
          avatarUrl: profile.avatar_url || undefined,
        }}
        onSignOut={handleSignOut}
      />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="mb-4 gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au tableau de bord
          </Button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">
                Mon profil
              </h1>
              <p className="text-muted-foreground text-sm">
                Gérez vos informations personnelles
              </p>
            </div>
          </div>
        </motion.div>

        <div className="space-y-6">
          {/* Avatar Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="p-6 rounded-2xl border border-border bg-card"
          >
            <h2 className="text-lg font-display font-semibold text-foreground mb-6">
              Photo de profil
            </h2>
            <AvatarUpload
              userId={user.id}
              currentAvatarUrl={profile.avatar_url}
              displayName={profile.display_name}
              onAvatarUpdate={handleAvatarUpdate}
            />
          </motion.div>

          {/* Profile Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="p-6 rounded-2xl border border-border bg-card"
          >
            <h2 className="text-lg font-display font-semibold text-foreground mb-6">
              Informations personnelles
            </h2>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="display_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom d'affichage</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Votre nom"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Ce nom sera visible par les membres de vos cercles
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <FormLabel>Email</FormLabel>
                  <Input
                    value={user.email || ''}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    L'email ne peut pas être modifié
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="birth_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date de naissance</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "d MMMM yyyy", { locale: fr })
                              ) : (
                                <span>Sélectionner une date</span>
                              )}
                              <Calendar className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                            captionLayout="dropdown-buttons"
                            fromYear={1900}
                            toYear={new Date().getFullYear()}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Utilisée pour les suggestions personnalisées
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Parlez-nous de vous..."
                          className="resize-none"
                          rows={4}
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Une courte description visible sur votre profil
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isSaving}
                  className="w-full sm:w-auto gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Enregistrer les modifications
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </motion.div>

          {/* Subscription Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="p-6 rounded-2xl border border-border bg-card"
          >
            <h2 className="text-lg font-display font-semibold text-foreground mb-4">
              Abonnement
            </h2>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge className={subscription.color}>
                  {subscription.label}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {profile.storage_used_mb} Mo / {profile.storage_limit_mb} Mo utilisés
                </span>
              </div>
              
              {profile.subscription_level === 'free' && (
                <Button variant="outline" size="sm">
                  Passer Premium
                </Button>
              )}
            </div>
          </motion.div>

          {/* Guardians Section */}
          <GuardiansSection userId={user.id} />

          {/* Guardian Dashboard Link */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="p-6 rounded-2xl border border-border bg-card"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Espace Gardien</h3>
                  <p className="text-sm text-muted-foreground">
                    Gérez les capsules héritage qui vous sont confiées
                  </p>
                </div>
              </div>
              <Button asChild variant="outline">
                <Link to="/guardian-dashboard">
                  Accéder
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
