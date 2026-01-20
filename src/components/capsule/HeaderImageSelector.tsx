import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { ImagePlus, Check, Upload, X, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getSignedUrl } from '@/lib/signedUrlCache';

interface Media {
  id: string;
  file_url: string;
  file_type: string;
  file_name: string | null;
}

interface HeaderImageSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  capsuleId: string;
  medias: Media[];
  currentHeaderUrl: string | null;
  onHeaderChange: (url: string | null) => void;
}

export default function HeaderImageSelector({
  open,
  onOpenChange,
  capsuleId,
  medias,
  currentHeaderUrl,
  onHeaderChange,
}: HeaderImageSelectorProps) {
  const [selectedUrl, setSelectedUrl] = useState<string | null>(currentHeaderUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [mediaUrls, setMediaUrls] = useState<Record<string, string>>({});

  const imageMedias = medias.filter(m => m.file_type.startsWith('image/'));

  // Load signed URLs for images when dialog opens
  useEffect(() => {
    if (open && imageMedias.length > 0) {
      const loadUrls = async () => {
        const urls: Record<string, string> = {};
        for (const media of imageMedias) {
          const url = await getSignedUrl('capsule-medias', media.file_url, 3600);
          if (url) {
            urls[media.file_url] = url;
          }
        }
        setMediaUrls(urls);
      };
      loadUrls();
    }
  }, [open, imageMedias.length]);

  // Reset selected URL when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedUrl(currentHeaderUrl);
    }
  }, [open, currentHeaderUrl]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    if (!file.type.startsWith('image/')) {
      toast.error('Seules les images sont acceptées');
      return;
    }

    setIsUploading(true);
    try {
      // Get current user for RLS-compliant path
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Vous devez être connecté');
        return;
      }

      const fileExt = file.name.split('.').pop();
      // Use user_id as first path segment to comply with storage RLS policies
      const fileName = `${user.id}/${capsuleId}-header-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('capsule-medias')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Also add to capsule_medias table
      const { error: insertError } = await supabase
        .from('capsule_medias')
        .insert({
          capsule_id: capsuleId,
          file_url: fileName,
          file_type: file.type,
          file_name: file.name,
        });

      if (insertError) throw insertError;

      setSelectedUrl(fileName);
      toast.success('Image uploadée');
      
      // Refresh URLs
      const newUrl = await getSignedUrl('capsule-medias', fileName, 3600);
      if (newUrl) {
        setMediaUrls(prev => ({ ...prev, [fileName]: newUrl }));
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erreur lors de l\'upload');
    } finally {
      setIsUploading(false);
    }
  }, [capsuleId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'] },
    maxFiles: 1,
    disabled: isUploading,
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('capsules')
        .update({ thumbnail_url: selectedUrl })
        .eq('id', capsuleId);

      if (error) throw error;

      onHeaderChange(selectedUrl);
      onOpenChange(false);
      toast.success('Image d\'en-tête mise à jour');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveHeader = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('capsules')
        .update({ thumbnail_url: null })
        .eq('id', capsuleId);

      if (error) throw error;

      onHeaderChange(null);
      setSelectedUrl(null);
      onOpenChange(false);
      toast.success('Image d\'en-tête supprimée');
    } catch (error) {
      console.error('Remove error:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImagePlus className="w-5 h-5 text-secondary" />
            Choisir l'image d'en-tête
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Existing images */}
          {imageMedias.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Images du souvenir
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {imageMedias.map((media) => (
                  <motion.button
                    key={media.id}
                    onClick={() => setSelectedUrl(media.file_url)}
                    className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                      selectedUrl === media.file_url
                        ? 'border-secondary ring-2 ring-secondary/20'
                        : 'border-transparent hover:border-muted-foreground/30'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <img
                      src={mediaUrls[media.file_url] || ''}
                      alt={media.file_name || 'Image'}
                      className="w-full h-full object-cover"
                    />
                    <AnimatePresence>
                      {selectedUrl === media.file_url && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          className="absolute inset-0 bg-secondary/20 flex items-center justify-center"
                        >
                          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                            <Check className="w-5 h-5 text-white" />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Upload new image */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              {imageMedias.length > 0 ? 'Ou uploader une nouvelle image' : 'Uploader une image'}
            </h3>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isDragActive
                  ? 'border-secondary bg-secondary/5'
                  : 'border-muted-foreground/30 hover:border-secondary/50'
              } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input {...getInputProps()} />
              {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-8 h-8 text-secondary animate-spin" />
                  <p className="text-muted-foreground">Upload en cours...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {isDragActive
                      ? 'Déposez l\'image ici'
                      : 'Glissez une image ou cliquez pour sélectionner'}
                  </p>
                  <p className="text-xs text-muted-foreground/60">
                    JPG, PNG, GIF, WebP acceptés
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="ghost"
            onClick={handleRemoveHeader}
            disabled={isSaving || !currentHeaderUrl}
            className="text-destructive hover:text-destructive"
          >
            <X className="w-4 h-4 mr-2" />
            Supprimer l'en-tête
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSaving || !selectedUrl}
              className="gap-2"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Enregistrer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
