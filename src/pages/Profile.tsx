import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, User, Calendar, FileText, Loader2, Shield, Receipt, Download, ExternalLink } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import confetti from 'canvas-confetti';

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
import { useSubscription, Invoice } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import AvatarUpload from '@/components/profile/AvatarUpload';
import GuardiansSection from '@/components/profile/GuardiansSection';
import { cn } from '@/lib/utils';

import type { Database } from '@/integrations/supabase/types';
import MobileBottomNav from '@/components/dashboard/MobileBottomNav';

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
  const { createCheckout, openCustomerPortal, subscriptionEnd, tier, invoices, invoicesLoading, fetchInvoices, checkSubscription } = useSubscription();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isManaging, setIsManaging] = useState(false);
  const [realStorageUsedMb, setRealStorageUsedMb] = useState<number>(0);
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

  // Fetch profile data
  const fetchProfile = useCallback(async () => {
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

    // Fetch real storage usage from capsule_medias
    const { data: capsules } = await supabase
      .from('capsules')
      .select('id')
      .eq('user_id', user.id);

    if (capsules && capsules.length > 0) {
      const capsuleIds = capsules.map(c => c.id);
      const { data: mediaData } = await supabase
        .from('capsule_medias')
        .select('file_size_bytes')
        .in('capsule_id', capsuleIds);

      if (mediaData) {
        const totalBytes = mediaData.reduce((sum, m) => sum + (m.file_size_bytes || 0), 0);
        setRealStorageUsedMb(totalBytes / (1024 * 1024));
      }
    }

    setProfileLoading(false);
  }, [user, form]);

  // Detect subscription success from URL params
  useEffect(() => {
    const subscriptionStatus = searchParams.get('subscription');
    
    if (subscriptionStatus === 'success' && user) {
      // Launch confetti celebration
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
          colors: ['#D4AF37', '#C9A227', '#B8860B', '#FFD700'],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
          colors: ['#D4AF37', '#C9A227', '#B8860B', '#FFD700'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();

      // Refresh subscription status
      checkSubscription();
      // Refresh profile to get updated storage limits
      fetchProfile();
      // Show success notification
      toast.success('🎉 Abonnement activé avec succès !');
      // Clean URL
      searchParams.delete('subscription');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams, user, checkSubscription, fetchProfile]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user, fetchProfile]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleAvatarUpdate = (url: string) => {
    if (profile) {
      setProfile({ ...profile, avatar_url: url });
    }
  };

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      await createCheckout('premium');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la création de la session de paiement');
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleManageSubscription = async () => {
    setIsManaging(true);
    try {
      await openCustomerPortal();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'ouverture du portail de gestion');
    } finally {
      setIsManaging(false);
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
    <div className="min-h-screen bg-gradient-warm pb-24 md:pb-0">
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
            Retour à l'accueil
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
            
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge className={subscription.color}>
                    {subscription.label}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {realStorageUsedMb.toFixed(1)} Mo / {profile.storage_limit_mb} Mo utilisés
                  </span>
                </div>
              </div>
              
              {profile.subscription_level !== 'free' && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-muted-foreground border-t border-border pt-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">Prix :</span>
                    <span>{tier === 'premium' ? '9,99 €/mois' : '19,99 €/mois'}</span>
                  </div>
                  {subscriptionEnd && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">Prochain renouvellement :</span>
                      <span>{new Date(subscriptionEnd).toLocaleDateString('fr-FR', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })}</span>
                    </div>
                  )}
                </div>
              )}
              
              {profile.subscription_level === 'free' ? (
                <Button 
                  variant="outline" 
                  size="sm"
                  asChild
                >
                  <Link to="/premium">
                    Passer Premium
                  </Link>
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleManageSubscription}
                  disabled={isManaging}
                >
                  {isManaging ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Chargement...
                    </>
                  ) : (
                    'Gérer mon abonnement'
                  )}
                </Button>
              )}
            </div>
          </motion.div>

          {/* Invoices Section */}
          {profile.subscription_level !== 'free' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.35 }}
              className="p-6 rounded-2xl border border-border bg-card"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Receipt className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-lg font-display font-semibold text-foreground">
                    Mes factures
                  </h2>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchInvoices}
                  disabled={invoicesLoading}
                >
                  {invoicesLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Charger les factures'
                  )}
                </Button>
              </div>

              {invoices.length === 0 && !invoicesLoading ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Cliquez sur "Charger les factures" pour voir vos factures
                </p>
              ) : (
                <div className="space-y-3">
                  {invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            Facture {invoice.number || invoice.id.slice(-8)}
                          </span>
                          <Badge 
                            variant={invoice.status === 'paid' ? 'default' : 'secondary'}
                            className={invoice.status === 'paid' ? 'bg-green-500/20 text-green-600 border-green-500/30' : ''}
                          >
                            {invoice.status === 'paid' ? 'Payée' : invoice.status === 'open' ? 'En attente' : invoice.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(invoice.created * 1000).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                          {' • '}
                          {(invoice.amount_paid / 100).toFixed(2)} {invoice.currency.toUpperCase()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {invoice.invoice_pdf && (
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            className="h-8 w-8"
                          >
                            <a href={invoice.invoice_pdf} target="_blank" rel="noopener noreferrer" title="Télécharger PDF">
                              <Download className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                        {invoice.hosted_invoice_url && (
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            className="h-8 w-8"
                          >
                            <a href={invoice.hosted_invoice_url} target="_blank" rel="noopener noreferrer" title="Voir en ligne">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

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

      <MobileBottomNav />
    </div>
  );
};

export default Profile;
