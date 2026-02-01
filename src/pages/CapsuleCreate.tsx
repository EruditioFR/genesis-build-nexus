import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Send, Sparkles, CalendarClock, CalendarHeart } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr, enUS, es, ko, zhCN } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

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
import TagInput from '@/components/capsule/TagInput';
import CapsulePreview from '@/components/capsule/CapsulePreview';
import UnifiedMediaSection, { type MediaFile, type UploadResult } from '@/components/capsule/UnifiedMediaSection';
import ScheduleSelector from '@/components/capsule/ScheduleSelector';
import LegacySettings from '@/components/capsule/LegacySettings';
import CategorySelector from '@/components/capsule/CategorySelector';
import MobileCapsuleWizard from '@/components/capsule/MobileCapsuleWizard';
import { useCategories } from '@/hooks/useCategories';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { captureVideoThumbnail, uploadVideoThumbnail } from '@/lib/videoThumbnail';
import { determineContentType, validateContentForPlan } from '@/lib/capsuleTypeUtils';
import MemoryDateSelector, { 
  type MemoryDateValue, 
  memoryDateToStorage,
  formatMemoryDate 
} from '@/components/capsule/MemoryDateSelector';
import { useIsMobile } from '@/hooks/use-mobile';
import NoIndex from '@/components/seo/NoIndex';

import type { Database } from '@/integrations/supabase/types';

type CapsuleType = Database['public']['Enums']['capsule_type'];
type CapsuleStatus = Database['public']['Enums']['capsule_status'];

const CapsuleCreate = () => {
  const { t, i18n } = useTranslation('capsules');
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isMobile = useIsMobile();
  const { categories, subCategories, setCapsuleCategories, setCapsuleSubCategories, createCustomCategory, getSubCategoriesForCategory } = useCategories();
  const { canCreateCapsuleType } = useFeatureAccess();
  
  const [tags, setTags] = useState<string[]>([]);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [textContent, setTextContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<{ display_name: string | null; avatar_url: string | null } | null>(null);
  
  // Category state
  const [primaryCategory, setPrimaryCategory] = useState<string | null>(null);
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>([]);
  
  // Memory date state (when the memory actually happened)
  const [memoryDate, setMemoryDate] = useState<MemoryDateValue | null>(null);
  
  // Scheduling state
  const [scheduledAt, setScheduledAt] = useState<Date | null>(null);
  
  // Legacy capsule state
  const [legacyEnabled, setLegacyEnabled] = useState(false);
  const [legacyUnlockType, setLegacyUnlockType] = useState<'date' | 'guardian'>('date');
  const [legacyUnlockDate, setLegacyUnlockDate] = useState<Date | null>(null);
  const [legacyGuardianId, setLegacyGuardianId] = useState<string | null>(null);
  const [mediaError, setMediaError] = useState(false);
  
  // Reference to the upload function from UnifiedMediaSection component
  const uploadAllFilesRef = useRef<() => Promise<UploadResult>>();

  // Get prompt from URL if present
  const promptFromUrl = searchParams.get('prompt');

  const capsuleSchema = z.object({
    title: z.string()
      .min(1, t('create.titleRequired'))
      .max(100, t('create.titleMaxLength')),
    description: z.string()
      .max(500, t('create.descriptionMaxLength'))
      .optional(),
  });

  type CapsuleFormValues = z.infer<typeof capsuleSchema>;

  const form = useForm<CapsuleFormValues>({
    resolver: zodResolver(capsuleSchema),
    defaultValues: {
      title: promptFromUrl || '',
      description: '',
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

  // Calculate the capsule type based on content
  const calculatedCapsuleType = determineContentType(textContent, mediaFiles);

  const saveCapsule = async (status: CapsuleStatus) => {
    const isValid = await form.trigger();
    if (!isValid) return;

    // Reset media error state
    setMediaError(false);

    // Validate content against user's plan
    const validation = validateContentForPlan(
      mediaFiles,
      undefined,
      canCreateCapsuleType('video'),
      canCreateCapsuleType('audio')
    );

    if (!validation.valid) {
      toast.error(t(validation.errorKey!));
      return;
    }

    // Keep track of uploaded files (will be updated after upload)
    let uploadedMediaFiles = mediaFiles;

    // Check if media files need uploading
    const pendingMediaFiles = mediaFiles.filter(f => !f.uploaded && !f.uploading);
    if (pendingMediaFiles.length > 0 && uploadAllFilesRef.current) {
      setIsSaving(true);
      
      // Upload all files and get the updated files with URLs
      const uploadResult = await uploadAllFilesRef.current();
      
      if (!uploadResult.success) {
        setIsSaving(false);
        setMediaError(true);
        const firstError = uploadResult.files.find((f) => f.error)?.error;
        toast.error(firstError || t('create.uploadError'));
        return;
      }
      
      // Use the files returned from upload (with URLs)
      uploadedMediaFiles = uploadResult.files;
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

      // Determine the capsule type from content
      const capsuleType = determineContentType(textContent, uploadedMediaFiles);

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

      // Prepare memory date storage values
      const memoryDateStorage = memoryDateToStorage(memoryDate);

      // Create the capsule
      const { data: capsule, error: capsuleError } = await supabase
        .from('capsules')
        .insert({
          user_id: user!.id,
          title: values.title,
          description: values.description || null,
          content: textContent || null,
          capsule_type: capsuleType,
          status: finalStatus,
          tags: tags.length > 0 ? tags : null,
          published_at: publishedAt,
          scheduled_at: scheduledAtValue,
          thumbnail_url: thumbnailUrl,
          memory_date: memoryDateStorage.memory_date,
          memory_date_precision: memoryDateStorage.memory_date_precision,
          memory_date_year_end: memoryDateStorage.memory_date_year_end,
        } as any)
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
        }
      }

      // Add media files to the capsule (use uploadedMediaFiles which has the URLs)
      if (uploadedMediaFiles.length > 0 && capsule) {
        const mediaInserts = uploadedMediaFiles
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
        await setCapsuleCategories(capsule.id, primaryCategory, []);
        
        // Add sub-categories if any selected
        if (selectedSubCategories.length > 0) {
          await setCapsuleSubCategories(capsule.id, selectedSubCategories);
        }
      }

      if (finalStatus === 'scheduled') {
        toast.success(t('create.successScheduled'));
      } else if (status === 'published') {
        toast.success(t('create.successPublished'));
      } else {
        toast.success(t('create.successDraft'));
      }
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || t('create.saveError'));
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

  // Mobile wizard version
  if (isMobile) {
    return (
      <MobileCapsuleWizard
        userId={user.id}
        title={form.watch('title') || ''}
        onTitleChange={(value) => form.setValue('title', value)}
        description={form.watch('description') || ''}
        onDescriptionChange={(value) => form.setValue('description', value)}
        content={textContent}
        onContentChange={setTextContent}
        categories={categories}
        subCategories={subCategories}
        primaryCategory={primaryCategory}
        onPrimaryCategoryChange={setPrimaryCategory}
        selectedSubCategories={selectedSubCategories}
        onSubCategoriesChange={setSelectedSubCategories}
        onCreateCustomCategory={(name, desc, icon, color) => createCustomCategory(user.id, name, desc, icon, color)}
        mediaFiles={mediaFiles}
        onMediaFilesChange={setMediaFiles}
        tags={tags}
        onTagsChange={setTags}
        memoryDate={memoryDate}
        onMemoryDateChange={setMemoryDate}
        isSaving={isSaving}
        onSaveDraft={() => saveCapsule('draft')}
        onPublish={() => saveCapsule('published')}
        onBack={() => navigate('/dashboard')}
        onUploadAllRef={(uploadFn) => {
          uploadAllFilesRef.current = uploadFn;
        }}
      />
    );
  }

  // Desktop version
  return (
    <>
      <NoIndex />
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
            {t('backToHome')}
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-gold flex items-center justify-center shadow-gold">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">
                {t('create.pageTitle')}
              </h1>
              <p className="text-muted-foreground text-sm">
                {t('create.pageSubtitle')}
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
            <div className="p-6 rounded-2xl border border-border bg-card" data-tour="capsule-category">
            <CategorySelector
                categories={categories}
                primaryCategory={primaryCategory}
                onPrimaryChange={(catId) => {
                  setPrimaryCategory(catId);
                  setSelectedSubCategories([]);
                }}
                onCreateCustom={(name, desc, icon, color) => createCustomCategory(user.id, name, desc, icon, color)}
                subCategories={subCategories}
                selectedSubCategories={selectedSubCategories}
                onSubCategoryChange={setSelectedSubCategories}
              />
            </div>

            {/* Main form */}
            <Form {...form}>
              <form className="p-6 rounded-2xl border border-border bg-card space-y-6" data-tour="capsule-title">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('create.titleLabel')} *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('create.titlePlaceholder')}
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
                      <FormLabel>{t('create.description')}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t('create.descriptionPlaceholder')}
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>

            {/* Unified Media Section */}
            <div data-tour="capsule-media">
              <UnifiedMediaSection
                userId={user.id}
                content={textContent}
                onContentChange={setTextContent}
                showTextSection={true}
                files={mediaFiles}
                onFilesChange={(files) => {
                  setMediaFiles(files);
                  if (mediaError) setMediaError(false);
                }}
                maxFiles={20}
                onUploadAll={(uploadFn) => {
                  uploadAllFilesRef.current = uploadFn;
                }}
                hasError={mediaError}
              />
            </div>

            {/* Memory Date */}
            <div className="p-6 rounded-2xl border border-border bg-card" data-tour="capsule-date">
              <Label className="text-base font-medium mb-4 block">
                <CalendarHeart className="w-4 h-4 inline-block mr-2" />
                {t('create.memoryDate')}
              </Label>
              <p className="text-sm text-muted-foreground mb-4">
                {t('create.memoryDateDesc')}
              </p>
              <MemoryDateSelector
                value={memoryDate}
                onChange={setMemoryDate}
              />
            </div>

            {/* Tags */}
            <div className="p-6 rounded-2xl border border-border bg-card" data-tour="capsule-tags">
              <Label className="text-base font-medium mb-4 block">
                {t('create.tags')}
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
            <div className="flex flex-col sm:flex-row gap-3" data-tour="capsule-actions">
              <Button
                variant="outline"
                size="lg"
                className="flex-1 gap-2"
                onClick={() => saveCapsule('draft')}
                disabled={isSaving}
              >
                <Save className="w-4 h-4" />
                {t('create.saveDraft')}
              </Button>
              <Button
                size="lg"
                className="flex-1 gap-2 bg-gradient-gold hover:opacity-90 text-primary-foreground shadow-gold"
                onClick={() => saveCapsule('published')}
                disabled={isSaving}
              >
                <Send className="w-4 h-4" />
                {t('create.publish')}
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
                content={textContent}
                capsuleType={calculatedCapsuleType}
                tags={tags}
              />
            </div>
          </motion.div>
        </div>
      </main>
    </div>
    </>
  );
};

export default CapsuleCreate;
