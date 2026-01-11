import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Send, Sparkles, CalendarClock } from 'lucide-react';
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
import MediaUpload, { type MediaFile } from '@/components/capsule/MediaUpload';
import ScheduleSelector from '@/components/capsule/ScheduleSelector';
import LegacySettings from '@/components/capsule/LegacySettings';
import CategorySelector from '@/components/capsule/CategorySelector';
import { useCategories } from '@/hooks/useCategories';
import { captureVideoThumbnail, uploadVideoThumbnail } from '@/lib/videoThumbnail';

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
  const { categories, setCapsuleCategories, createCustomCategory } = useCategories();
  const [capsuleType, setCapsuleType] = useState<CapsuleType>('text');
  const [tags, setTags] = useState<string[]>([]);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<{ display_name: string | null; avatar_url: string | null } | null>(null);
  
  // Category state
  const [primaryCategory, setPrimaryCategory] = useState<string | null>(null);
  const [secondaryCategories, setSecondaryCategories] = useState<string[]>([]);
  
  // Scheduling state
  const [scheduledAt, setScheduledAt] = useState<Date | null>(null);
  
  // Legacy capsule state
  const [legacyEnabled, setLegacyEnabled] = useState(false);
  const [legacyUnlockType, setLegacyUnlockType] = useState<'date' | 'guardian'>('date');
  const [legacyUnlockDate, setLegacyUnlockDate] = useState<Date | null>(null);
  const [legacyGuardianId, setLegacyGuardianId] = useState<string | null>(null);

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

    // Check if media files need uploading
    const pendingMediaFiles = mediaFiles.filter(f => !f.uploaded && !f.uploading);
    if (capsuleType !== 'text' && pendingMediaFiles.length > 0) {
      toast.error('Veuillez d\'abord uploader tous les fichiers médias');
      return;
    }

    const values = form.getValues();
    setIsSaving(true);

    try {
      // Determine the actual status based on scheduling
      let finalStatus: CapsuleStatus = status;
      let publishedAt = null;
      let scheduledAtValue = null;
      
      if (status === 'published' && scheduledAt) {
        finalStatus = 'scheduled';
        scheduledAtValue = scheduledAt.toISOString();
      } else if (status === 'published') {
        publishedAt = new Date().toISOString();
      }

      // Generate video thumbnail if applicable
      let thumbnailUrl: string | null = null;
      if ((capsuleType === 'video' || capsuleType === 'mixed') && mediaFiles.length > 0) {
        const videoFile = mediaFiles.find(f => f.file.type.startsWith('video/'));
        if (videoFile) {
          try {
            const thumbnailBlob = await captureVideoThumbnail(videoFile.file);
            thumbnailUrl = await uploadVideoThumbnail(thumbnailBlob, user!.id, supabase);
          } catch (err) {
            console.error('Error generating video thumbnail:', err);
            // Don't fail the save, just proceed without thumbnail
          }
        }
      }

      // Create the capsule
      const { data: capsule, error: capsuleError } = await supabase
        .from('capsules')
        .insert({
          user_id: user!.id,
          title: values.title,
          description: values.description || null,
          content: values.content || null,
          capsule_type: capsuleType,
          status: finalStatus,
          tags: tags.length > 0 ? tags : null,
          published_at: publishedAt,
          scheduled_at: scheduledAtValue,
          thumbnail_url: thumbnailUrl,
        })
        .select('id')
        .single();

      if (capsuleError) throw capsuleError;

      // Create legacy capsule settings if enabled
      if (legacyEnabled && capsule) {
        const legacyData: any = {
          capsule_id: capsule.id,
          unlock_type: legacyUnlockType,
        };
        
        if (legacyUnlockType === 'date' && legacyUnlockDate) {
          legacyData.unlock_date = legacyUnlockDate.toISOString();
        } else if (legacyUnlockType === 'guardian' && legacyGuardianId) {
          legacyData.guardian_id = legacyGuardianId;
        }

        const { error: legacyError } = await supabase
          .from('legacy_capsules')
          .insert(legacyData);

        if (legacyError) {
          console.error('Error creating legacy settings:', legacyError);
          // Don't throw, just log - the capsule is already created
        }
      }

      // Add media files to the capsule
      if (mediaFiles.length > 0 && capsule) {
        const mediaInserts = mediaFiles
          .filter(f => f.uploaded && f.url)
          .map((f, index) => ({
            capsule_id: capsule.id,
            file_url: f.url!,
            file_type: f.file.type,
            file_name: f.file.name,
            file_size_bytes: f.file.size,
            position: index,
          }));

        if (mediaInserts.length > 0) {
          const { error: mediaError } = await supabase
            .from('capsule_medias')
            .insert(mediaInserts);

          if (mediaError) throw mediaError;
        }
      }

      // Add categories to the capsule
      if (primaryCategory && capsule) {
        await setCapsuleCategories(capsule.id, primaryCategory, secondaryCategories);
      }

      if (finalStatus === 'scheduled') {
        toast.success('Capsule programmée avec succès !');
      } else if (status === 'published') {
        toast.success('Capsule publiée avec succès !');
      } else {
        toast.success('Brouillon enregistré');
      }
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
          id: user.id,
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
            {/* Category selector */}
            <div className="p-6 rounded-2xl border border-border bg-card">
              <CategorySelector
                categories={categories}
                primaryCategory={primaryCategory}
                secondaryCategories={secondaryCategories}
                onPrimaryChange={setPrimaryCategory}
                onSecondaryChange={setSecondaryCategories}
                onCreateCustom={(name, desc, icon, color) => createCustomCategory(user.id, name, desc, icon, color)}
              />
            </div>

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

              </form>
            </Form>

            {/* Media Upload - shown for non-text types */}
            {capsuleType !== 'text' && (
              <div className="p-6 rounded-2xl border border-border bg-card">
                <Label className="text-base font-medium mb-4 block">
                  Fichiers médias
                </Label>
                <MediaUpload
                  userId={user.id}
                  files={mediaFiles}
                  onFilesChange={setMediaFiles}
                  maxFiles={capsuleType === 'mixed' ? 20 : 10}
                  acceptedTypes={
                    capsuleType === 'photo' 
                      ? ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
                      : capsuleType === 'video'
                        ? ['video/mp4', 'video/webm', 'video/quicktime']
                        : capsuleType === 'audio'
                          ? ['audio/mpeg', 'audio/wav', 'audio/mp4']
                          : undefined
                  }
                />
              </div>
            )}
            {/* Tags */}
            <div className="p-6 rounded-2xl border border-border bg-card">
              <Label className="text-base font-medium mb-4 block">
                Tags
              </Label>
              <TagInput tags={tags} onChange={setTags} />
            </div>

            {/* Schedule */}
            <div className="p-6 rounded-2xl border border-border bg-card">
              <ScheduleSelector scheduledAt={scheduledAt} onChange={setScheduledAt} />
            </div>

            {/* Legacy Settings */}
            <LegacySettings
              userId={user.id}
              enabled={legacyEnabled}
              onEnabledChange={setLegacyEnabled}
              unlockType={legacyUnlockType}
              onUnlockTypeChange={setLegacyUnlockType}
              unlockDate={legacyUnlockDate}
              onUnlockDateChange={setLegacyUnlockDate}
              guardianId={legacyGuardianId}
              onGuardianIdChange={setLegacyGuardianId}
            />

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
