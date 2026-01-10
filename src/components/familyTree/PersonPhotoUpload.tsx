import { useState, useRef } from 'react';
import { Camera, Upload, Loader2, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useFamilyTree } from '@/hooks/useFamilyTree';
import type { FamilyPerson } from '@/types/familyTree';

interface PersonPhotoUploadProps {
  person: FamilyPerson;
  onUpdate: () => void;
}

export function PersonPhotoUpload({ person, onUpdate }: PersonPhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { updatePerson } = useFamilyTree();

  const initials = `${person.first_names[0] || ''}${person.last_name[0] || ''}`.toUpperCase();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 5 Mo');
      return;
    }

    setIsUploading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Vous devez être connecté');
        return;
      }

      // Create unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${person.id}-${Date.now()}.${fileExt}`;

      // Delete old photo if exists
      if (person.profile_photo_url) {
        const oldPath = person.profile_photo_url.split('/family-photos/')[1];
        if (oldPath) {
          await supabase.storage.from('family-photos').remove([oldPath]);
        }
      }

      // Upload new photo
      const { error: uploadError } = await supabase.storage
        .from('family-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error('Erreur lors du téléchargement');
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('family-photos')
        .getPublicUrl(fileName);

      // Update person with new photo URL
      const success = await updatePerson(person.id, {
        profile_photo_url: publicUrl
      });

      if (success) {
        toast.success('Photo mise à jour');
        onUpdate();
      } else {
        toast.error('Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Erreur lors du téléchargement');
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = async () => {
    if (!person.profile_photo_url) return;

    setIsUploading(true);

    try {
      // Delete from storage
      const oldPath = person.profile_photo_url.split('/family-photos/')[1];
      if (oldPath) {
        await supabase.storage.from('family-photos').remove([oldPath]);
      }

      // Update person
      const success = await updatePerson(person.id, {
        profile_photo_url: null
      });

      if (success) {
        toast.success('Photo supprimée');
        onUpdate();
      } else {
        toast.error('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error removing photo:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />
      
      <div
        className="relative cursor-pointer group"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        <Avatar className="w-20 h-20 border-2 border-secondary transition-opacity group-hover:opacity-80">
          <AvatarImage src={person.profile_photo_url || undefined} />
          <AvatarFallback className="bg-secondary/20 text-secondary text-xl font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* Overlay on hover */}
        {(isHovering || isUploading) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
            {isUploading ? (
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            ) : (
              <Camera className="w-6 h-6 text-white" />
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-2 flex gap-1 justify-center">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs gap-1"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <Upload className="w-3 h-3" />
          {person.profile_photo_url ? 'Changer' : 'Ajouter'}
        </Button>
        
        {person.profile_photo_url && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1 text-destructive hover:text-destructive"
            onClick={handleRemovePhoto}
            disabled={isUploading}
          >
            <X className="w-3 h-3" />
            Supprimer
          </Button>
        )}
      </div>
    </div>
  );
}
