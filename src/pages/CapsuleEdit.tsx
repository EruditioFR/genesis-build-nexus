import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Send, Edit3, Trash2, CalendarHeart } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

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

import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import CapsuleTypeSelector from '@/components/capsule/CapsuleTypeSelector';
import TagInput from '@/components/capsule/TagInput';
import CapsulePreview from '@/components/capsule/CapsulePreview';
import MediaUpload, { type MediaFile } from '@/components/capsule/MediaUpload';
import CategorySelector from '@/components/capsule/CategorySelector';
import CategoryBadge from '@/components/capsule/CategoryBadge';
import { useCategories, type Category } from '@/hooks/useCategories';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

import type { Database } from '@/integrations/supabase/types';
import MobileBottomNav from '@/components/dashboard/MobileBottomNav';
import { useIsMobile } from '@/hooks/use-mobile';

type CapsuleType = Database['public']['Enums']['capsule_type'];
type CapsuleStatus = Database['public']['Enums']['capsule_status'];

interface ExistingMedia {
  id: string;
  file_url: string;
  file_type: string;
  file_name: string | null;
  file_size_bytes: number | null;
  position: number | null;
}

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

const CapsuleEdit = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { categories, subCategories, createCustomCategory, getCapsuleSubCategories, setCapsuleSubCategories } = useCategories();
  
  const [capsuleType, setCapsuleType] = useState<CapsuleType>('text');
  const [tags, setTags] = useState<string[]>([]);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [existingMedia, setExistingMedia] = useState<ExistingMedia[]>([]);
  const [deletedMediaIds, setDeletedMediaIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<{ display_name: string | null; avatar_url: string | null } | null>(null);
  const [primaryCategory, setPrimaryCategory] = useState<string | null>(null);
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>([]);
  const [memoryDate, setMemoryDate] = useState<Date | null>(null);
  const [mediaError, setMediaError] = useState(false);
  
  // Reference to the upload function from MediaUpload component
  const uploadAllFilesRef = useRef<() => Promise<boolean>>();

  const form = useForm<CapsuleFormValues>({
    resolver: zodResolver(capsuleSchema),
    defaultValues: {
      title: '',
      description: '',
      content: '',
    },
  });

  const watchedValues = form.watch();

  // Auth check
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Fetch capsule data
  useEffect(() => {
    const fetchCapsule = async () => {
      if (!user || !id) return;

      try {
        // Fetch capsule
        const { data: capsule, error: capsuleError } = await supabase
          .from('capsules')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single();

        if (capsuleError) throw capsuleError;
        if (!capsule) {
          toast.error('Souvenir non trouvé');
          navigate('/capsules');
          return;
        }

        // Set form values
        form.reset({
          title: capsule.title,
          description: capsule.description || '',
          content: capsule.content || '',
        });
        setCapsuleType(capsule.capsule_type);
        setTags(capsule.tags || []);
        
        // Set memory date if exists
        if (capsule.memory_date) {
          setMemoryDate(parseISO(capsule.memory_date));
        }

        // Fetch existing media
        const { data: media } = await supabase
          .from('capsule_medias')
          .select('*')
          .eq('capsule_id', id)
          .order('position');

        if (media) {
          setExistingMedia(media);
        }

        // Fetch existing categories
        const { data: capsuleCats } = await supabase
          .from('capsule_categories')
          .select('*')
          .eq('capsule_id', id);

        if (capsuleCats) {
          const primary = capsuleCats.find(c => c.is_primary);
          if (primary) setPrimaryCategory(primary.category_id);
        }

        // Fetch existing sub-categories
        const { data: capsuleSubCats } = await supabase
          .from('capsule_sub_categories')
          .select('sub_category_id')
          .eq('capsule_id', id);

        if (capsuleSubCats) {
          setSelectedSubCategories(capsuleSubCats.map(c => c.sub_category_id));
        }
      } catch (error: any) {
        toast.error('Erreur lors du chargement du souvenir');
        navigate('/capsules');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) fetchCapsule();
  }, [user, id, navigate, form]);

  // Fetch profile
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

  const removeExistingMedia = (mediaId: string) => {
    setDeletedMediaIds(prev => [...prev, mediaId]);
    setExistingMedia(prev => prev.filter(m => m.id !== mediaId));
  };

  const saveCapsule = async (status: CapsuleStatus) => {
    const isValid = await form.trigger();
    if (!isValid) return;

    // Reset media error state
    setMediaError(false);

    // Check if new media files need uploading
    const pendingMediaFiles = mediaFiles.filter(f => !f.uploaded && !f.uploading);
    if (capsuleType !== 'text' && pendingMediaFiles.length > 0 && uploadAllFilesRef.current) {
      setIsSaving(true);
      
      // Upload all files
      const uploadSuccess = await uploadAllFilesRef.current();
      
      if (!uploadSuccess) {
        setIsSaving(false);
        setMediaError(true);
        toast.error('Erreur lors de l\'upload des fichiers. Veuillez corriger les erreurs et réessayer.');
        return;
      }
    }

    const values = form.getValues();
    setIsSaving(true);

    try {
      // Update the capsule
      const { error: capsuleError } = await supabase
        .from('capsules')
        .update({
          title: values.title,
          description: values.description || null,
          content: values.content || null,
          capsule_type: capsuleType,
          status: status,
          tags: tags.length > 0 ? tags : null,
          published_at: status === 'published' ? new Date().toISOString() : null,
          memory_date: memoryDate ? format(memoryDate, 'yyyy-MM-dd') : null,
        })
        .eq('id', id);

      if (capsuleError) throw capsuleError;

      // Delete removed media
      if (deletedMediaIds.length > 0) {
        const { error: deleteError } = await supabase
          .from('capsule_medias')
          .delete()
          .in('id', deletedMediaIds);
        
        if (deleteError) throw deleteError;
      }

      // Add new media files
      if (mediaFiles.length > 0) {
        const existingCount = existingMedia.length;
        const mediaInserts = mediaFiles
          .filter(f => f.uploaded && f.url)
          .map((f, index) => ({
            capsule_id: id!,
            file_url: f.url!,
            file_type: f.file.type,
            file_name: f.file.name,
            file_size_bytes: f.file.size,
            position: existingCount + index,
          }));

        if (mediaInserts.length > 0) {
          const { error: mediaError } = await supabase
            .from('capsule_medias')
            .insert(mediaInserts);

          if (mediaError) throw mediaError;
        }
      }

      // Update categories
      if (primaryCategory) {
        // Delete existing categories
        await supabase
          .from('capsule_categories')
          .delete()
          .eq('capsule_id', id!);

        // Insert primary category only
        const { error: catError } = await supabase
          .from('capsule_categories')
          .insert([{ capsule_id: id!, category_id: primaryCategory, is_primary: true }]);

        if (catError) throw catError;

        // Update sub-categories
        await setCapsuleSubCategories(id!, selectedSubCategories);
      }

      toast.success(
        status === 'published' 
          ? 'Souvenir publié avec succès !' 
          : 'Modifications enregistrées'
      );
      navigate(`/capsules/${id}`);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const getSignedUrl = async (filePath: string) => {
    const { data } = await supabase.storage
      .from('capsule-medias')
      .createSignedUrl(filePath, 3600);
    return data?.signedUrl || '';
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-warm pb-24 md:pb-0">
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
            onClick={() => navigate(`/capsules/${id}`)}
            className="mb-4 gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au souvenir
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-gold flex items-center justify-center shadow-gold">
              <Edit3 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">
                Modifier le souvenir
              </h1>
              <p className="text-muted-foreground text-sm">
                Mettez à jour votre souvenir
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
                onPrimaryChange={(catId) => {
                  setPrimaryCategory(catId);
                  setSelectedSubCategories([]);
                }}
                onCreateCustom={user ? (name, desc, icon, color) => createCustomCategory(user.id, name, desc, icon, color) : undefined}
                subCategories={subCategories}
                selectedSubCategories={selectedSubCategories}
                onSubCategoryChange={setSelectedSubCategories}
              />
            </div>

            {/* Type selector */}
            <div className="p-6 rounded-2xl border border-border bg-card">
              <Label className="text-base font-medium mb-4 block">
                Type de souvenir
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

            {/* Existing Media */}
            {capsuleType !== 'text' && existingMedia.length > 0 && (
              <div className="p-6 rounded-2xl border border-border bg-card">
                <Label className="text-base font-medium mb-4 block">
                  Médias existants
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {existingMedia.map((media) => (
                    <ExistingMediaItem
                      key={media.id}
                      media={media}
                      onRemove={() => removeExistingMedia(media.id)}
                      getSignedUrl={getSignedUrl}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* New Media Upload */}
            {capsuleType !== 'text' && (
              <div 
                className={`p-6 rounded-2xl border bg-card transition-all ${
                  mediaError ? 'border-destructive ring-2 ring-destructive/20' : 'border-border'
                }`}
              >
                <Label className="text-base font-medium mb-4 block">
                  Ajouter des fichiers
                </Label>
                {mediaError && (
                  <p className="text-sm text-destructive mb-4">
                    Certains fichiers n'ont pas pu être uploadés. Veuillez les supprimer ou réessayer.
                  </p>
                )}
                <MediaUpload
                  userId={user.id}
                  files={mediaFiles}
                  onFilesChange={(files) => {
                    setMediaFiles(files);
                    if (mediaError) setMediaError(false);
                  }}
                  maxFiles={capsuleType === 'mixed' ? 20 - existingMedia.length : 10 - existingMedia.length}
                  acceptedTypes={
                    capsuleType === 'photo' 
                      ? ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
                      : capsuleType === 'video'
                        ? ['video/mp4', 'video/webm', 'video/quicktime']
                        : capsuleType === 'audio'
                          ? ['audio/mpeg', 'audio/wav', 'audio/mp4']
                          : undefined
                  }
                  onUploadAll={(uploadFn) => {
                    uploadAllFilesRef.current = uploadFn;
                  }}
                />
              </div>
            )}

            {/* Memory Date */}
            <div className="p-6 rounded-2xl border border-border bg-card">
              <Label className="text-base font-medium mb-4 block">
                <CalendarHeart className="w-4 h-4 inline-block mr-2" />
                Date du souvenir
              </Label>
              <p className="text-sm text-muted-foreground mb-4">
                Quand ce souvenir a-t-il eu lieu ?
              </p>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !memoryDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarHeart className="mr-2 h-4 w-4" />
                    {memoryDate ? format(memoryDate, "PPP", { locale: fr }) : "Sélectionner une date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={memoryDate || undefined}
                    onSelect={(date) => setMemoryDate(date || null)}
                    disabled={(date) => date > new Date()}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              {memoryDate && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-muted-foreground"
                  onClick={() => setMemoryDate(null)}
                >
                  Effacer la date
                </Button>
              )}
            </div>

            {/* Tags */}
            <div className="p-6 rounded-2xl border border-border bg-card">
              <Label className="text-base font-medium mb-4 block">
                Mots-clés
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
                Publier
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

      <MobileBottomNav />
    </div>
  );
};

// Subcomponent for existing media items
const ExistingMediaItem = ({ 
  media, 
  onRemove,
  getSignedUrl 
}: { 
  media: ExistingMedia; 
  onRemove: () => void;
  getSignedUrl: (path: string) => Promise<string>;
}) => {
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    const loadPreview = async () => {
      const url = await getSignedUrl(media.file_url);
      setPreviewUrl(url);
    };
    loadPreview();
  }, [media.file_url, getSignedUrl]);

  const isImage = media.file_type.startsWith('image/');
  const isVideo = media.file_type.startsWith('video/');

  return (
    <div className="relative group">
      <div className="aspect-square rounded-lg overflow-hidden bg-muted">
        {isImage && previewUrl && (
          <img src={previewUrl} alt={media.file_name || 'Media'} className="w-full h-full object-cover" />
        )}
        {isVideo && previewUrl && (
          <video src={previewUrl} className="w-full h-full object-cover" />
        )}
        {!isImage && !isVideo && (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <span className="text-xs">{media.file_name || 'Audio'}</span>
          </div>
        )}
      </div>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce média ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={onRemove}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CapsuleEdit;
