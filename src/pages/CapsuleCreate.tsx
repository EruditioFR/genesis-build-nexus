import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Send, Sparkles } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import CapsuleTypeSelector from '@/components/capsule/CapsuleTypeSelector';
import TagInput from '@/components/capsule/TagInput';
import CapsulePreview from '@/components/capsule/CapsulePreview';

import type { Database } from '@/integrations/supabase/types';

type CapsuleType = Database['public']['Enums']['capsule_type'];
type CapsuleStatus = Database['public']['Enums']['capsule_status'];

const capsuleSchema = z.object({
  title: z.string()
    .min(1, 'Le titre est requis')
    .max(100, 'Le titre ne peut pas dépasser 100 caractères'),
  description: z.string()
    .max(500, 'La description ne peut pas dépasser 500 caractères')
    .optional(),
  content: z.string()
    .max(10000, 'Le contenu ne peut pas dépasser 10 000 caractères')
    .optional(),
});

type CapsuleFormValues = z.infer<typeof capsuleSchema>;

const CapsuleCreate = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [capsuleType, setCapsuleType] = useState<CapsuleType>('text');
  const [tags, setTags] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<{ display_name: string | null; avatar_url: string | null } | null>(null);

  const form = useForm<CapsuleFormValues>({
    resolver: zodResolver(capsuleSchema),
    defaultValues: {
      title: '',
      description: '',
      content: '',
    },
  });

  const watchedValues = form.watch();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) setProfile(data);
    };
    if (user) fetchProfile();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const saveCapsule = async (status: CapsuleStatus) => {
    const isValid = await form.trigger();
    if (!isValid) return;

    const values = form.getValues();
    setIsSaving(true);

    try {
      const { error } = await supabase.from('capsules').insert({
        user_id: user!.id,
        title: values.title,
        description: values.description || null,
        content: values.content || null,
        capsule_type: capsuleType,
        status: status,
        tags: tags.length > 0 ? tags : null,
        published_at: status === 'published' ? new Date().toISOString() : null,
      });

      if (error) throw error;

      toast.success(
        status === 'published' 
          ? 'Capsule publiée avec succès !' 
          : 'Brouillon enregistré'
      );
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-warm">
      <DashboardHeader
        user={{
          email: user.email,
          displayName: profile?.display_name || undefined,
          avatarUrl: profile?.avatar_url || undefined,
        }}
        onSignOut={handleSignOut}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button and title */}
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
            <div className="w-12 h-12 rounded-xl bg-gradient-gold flex items-center justify-center shadow-gold">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">
                Créer une capsule
              </h1>
              <p className="text-muted-foreground text-sm">
                Préservez un souvenir précieux
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Column */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Type selector */}
            <div className="p-6 rounded-2xl border border-border bg-card">
              <Label className="text-base font-medium mb-4 block">
                Type de capsule
              </Label>
              <CapsuleTypeSelector value={capsuleType} onChange={setCapsuleType} />
            </div>

            {/* Main form */}
            <Form {...form}>
              <form className="p-6 rounded-2xl border border-border bg-card space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Vacances en Bretagne 2024"
                          className="text-lg"
                          {...field}
                        />
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
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Décrivez brièvement cette capsule..."
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {capsuleType === 'text' && (
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contenu</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Écrivez votre texte, lettre ou récit..."
                            className="resize-none min-h-[200px]"
                            rows={8}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {capsuleType !== 'text' && (
                  <div className="p-6 rounded-xl border-2 border-dashed border-border bg-muted/30 text-center">
                    <p className="text-muted-foreground text-sm">
                      L'upload de médias sera bientôt disponible.<br />
                      Configurez d'abord le stockage pour ajouter des fichiers.
                    </p>
                  </div>
                )}
              </form>
            </Form>

            {/* Tags */}
            <div className="p-6 rounded-2xl border border-border bg-card">
              <Label className="text-base font-medium mb-4 block">
                Tags
              </Label>
              <TagInput tags={tags} onChange={setTags} />
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                size="lg"
                className="flex-1 gap-2"
                onClick={() => saveCapsule('draft')}
                disabled={isSaving}
              >
                <Save className="w-4 h-4" />
                Enregistrer en brouillon
              </Button>
              <Button
                size="lg"
                className="flex-1 gap-2 bg-gradient-gold hover:opacity-90 text-primary-foreground shadow-gold"
                onClick={() => saveCapsule('published')}
                disabled={isSaving}
              >
                <Send className="w-4 h-4" />
                Publier la capsule
              </Button>
            </div>
          </motion.div>

          {/* Preview Column */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-24">
              <CapsulePreview
                title={watchedValues.title}
                description={watchedValues.description || ''}
                content={watchedValues.content || ''}
                capsuleType={capsuleType}
                tags={tags}
              />
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default CapsuleCreate;
