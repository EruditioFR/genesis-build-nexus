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
import YouTubeEmbed, { extractYouTubeId } from '@/components/capsule/YouTubeEmbed';
import SeniorFriendlyEditor from '@/components/capsule/SeniorFriendlyEditor';

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
  const [youtubeUrl, setYoutubeUrl] = useState<string | null>(null);
  
  // Reference to the upload function from UnifiedMediaSection component
  const uploadAllFilesRef = useRef<() => Promise<UploadResult>>();

  // Get prompt from URL if present (guided memory prompts)
  const promptFromUrl = searchParams.get('prompt');
  const promptIdFromUrl = searchParams.get('promptId');
  const promptCategoryFromUrl = searchParams.get('category');
  
  // Mapping from guided prompt categories to category info (for creation if needed)
  const promptCategoryConfig: Record<string, { slug: string; name: string; icon: string; color: string; description: string }> = {
    'enfance': { slug: 'enfance', name: 'Enfance', icon: 'baby', color: '#22c55e', description: 'Souvenirs de mon enfance' },
    'ecole': { slug: 'ecole-adolescence', name: 'École & Adolescence', icon: 'graduation-cap', color: '#3b82f6', description: 'Souvenirs d\'école et d\'adolescence' },
    'musiques': { slug: 'musiques-films', name: 'Musiques & Films', icon: 'music', color: '#a855f7', description: 'Musiques et films marquants' },
    'famille': { slug: 'famille-proches', name: 'Famille & Proches', icon: 'users', color: '#f97316', description: 'Souvenirs de famille' },
    'vie-personnelle': { slug: 'vie-personnelle', name: 'Vie personnelle', icon: 'heart', color: '#ef4444', description: 'Moments personnels importants' },
  };

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
  
  // Auto-select or create category when coming from guided prompts
  useEffect(() => {
    const setupCategory = async () => {
      if (!promptCategoryFromUrl || categories.length === 0 || primaryCategory || !user) return;
      
      const config = promptCategoryConfig[promptCategoryFromUrl];
      if (!config) return;
      
      // Try to find existing category by slug
      const matchingCategory = categories.find(cat => cat.slug === config.slug);
      if (matchingCategory) {
        setPrimaryCategory(matchingCategory.id);
        return;
      }
      
      // Also check by name (in case slug differs slightly)
      const matchByName = categories.find(cat => 
        cat.name_fr.toLowerCase() === config.name.toLowerCase() ||
        cat.slug === 'famille-proches' && promptCategoryFromUrl === 'famille'
      );
      if (matchByName) {
        setPrimaryCategory(matchByName.id);
        return;
      }
      
      // Category doesn't exist, create it
      try {
        const newCategory = await createCustomCategory(
          user.id,
          config.name,
          config.description,
          config.icon,
          config.color
        );
        if (newCategory) {
          setPrimaryCategory(newCategory.id);
        }
      } catch (error) {
        console.error('Error creating category:', error);
      }
    };
    
    setupCategory();
  }, [promptCategoryFromUrl, categories, primaryCategory, user]);

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

      // Prepare metadata with YouTube URL if present
      const metadata: Record<string, any> = {};
      if (youtubeUrl) {
        metadata.youtube_url = youtubeUrl;
        metadata.youtube_id = extractYouTubeId(youtubeUrl);
      }

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
          metadata: Object.keys(metadata).length > 0 ? metadata : null,
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

      // Mark guided prompt as used if this capsule was created from a prompt
      if (promptIdFromUrl && promptCategoryFromUrl && capsule) {
        try {
          await supabase.from('user_memory_prompts').insert({
            user_id: user!.id,
            prompt_id: promptIdFromUrl,
            category: promptCategoryFromUrl,
            capsule_id: capsule.id,
          });
        } catch (err) {
          console.error('Error marking prompt as used:', err);
          // Don't fail the save, just log the error
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

  // Desktop version - Senior-friendly editor
  return (
    <>
      <NoIndex />
      <SeniorFriendlyEditor
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
        onMediaFilesChange={(files) => {
          setMediaFiles(files);
          if (mediaError) setMediaError(false);
        }}
        tags={tags}
        onTagsChange={setTags}
        memoryDate={memoryDate}
        onMemoryDateChange={setMemoryDate}
        youtubeUrl={youtubeUrl}
        onYoutubeUrlChange={setYoutubeUrl}
        isSaving={isSaving}
        onSaveDraft={() => saveCapsule('draft')}
        onPublish={() => saveCapsule('published')}
        onBack={() => navigate('/dashboard')}
        onUploadAllRef={(uploadFn) => {
          uploadAllFilesRef.current = uploadFn;
        }}
        hasMediaError={mediaError}
        onMediaErrorReset={() => setMediaError(false)}
        promptFromUrl={promptFromUrl}
      />
    </>
  );
};

export default CapsuleCreate;
