import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Capsule {
  id: string;
  title: string;
  description?: string;
  content?: string;
  capsule_type: string;
  created_at: string;
}

interface StoryItem {
  id: string;
  type: 'image' | 'video' | 'audio' | 'text';
  url?: string;
  title: string;
  description?: string;
  content?: string;
  date?: string;
}

interface MediaWithCapsule {
  media: {
    id: string;
    file_url: string;
    file_type: string;
    caption: string | null;
  };
  capsule: Capsule;
}

export const useStoryMode = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<StoryItem[]>([]);
  const [initialIndex, setInitialIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const openStory = useCallback(async (capsules: Capsule[], startIndex = 0) => {
    setLoading(true);
    
    try {
      // Fetch all media for all capsules in parallel
      const capsuleIds = capsules.map(c => c.id);
      
      const { data: allMedias } = await supabase
        .from('capsule_medias')
        .select('id, capsule_id, file_url, file_type, caption, position')
        .in('capsule_id', capsuleIds)
        .order('position');

      // Group media by capsule and prepare for URL signing
      const mediaWithCapsules: MediaWithCapsule[] = [];
      const textCapsules: Capsule[] = [];

      for (const capsule of capsules) {
        const capsuleMedias = allMedias?.filter(m => m.capsule_id === capsule.id) || [];
        
        if (capsuleMedias.length > 0) {
          for (const media of capsuleMedias) {
            mediaWithCapsules.push({ media, capsule });
          }
        } else if (capsule.capsule_type === 'text' && capsule.content) {
          textCapsules.push(capsule);
        }
      }

      // Generate all signed URLs in parallel
      const signedUrlPromises = mediaWithCapsules.map(async ({ media }) => {
        let filePath = media.file_url;
        if (filePath.startsWith('capsule-medias/')) {
          filePath = filePath.replace('capsule-medias/', '');
        }
        
        const { data, error } = await supabase.storage
          .from('capsule-medias')
          .createSignedUrl(filePath, 3600);
        
        if (error) {
          console.error('Error creating signed URL:', error, 'for path:', filePath);
          return null;
        }
        return data?.signedUrl;
      });

      const signedUrls = await Promise.all(signedUrlPromises);

      // Build story items with signed URLs
      const storyItems: StoryItem[] = [];

      mediaWithCapsules.forEach(({ media, capsule }, index) => {
        const mediaType = media.file_type.startsWith('image/') 
          ? 'image' 
          : media.file_type.startsWith('video/') 
            ? 'video' 
            : media.file_type.startsWith('audio/') 
              ? 'audio' 
              : 'text';

        storyItems.push({
          id: `${capsule.id}-${media.id}`,
          type: mediaType,
          url: signedUrls[index] || undefined,
          title: capsule.title,
          description: media.caption || capsule.description || undefined,
          date: new Date(capsule.created_at).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }),
        });
      });

      // Add text capsules
      for (const capsule of textCapsules) {
        storyItems.push({
          id: capsule.id,
          type: 'text',
          title: capsule.title,
          description: capsule.description || undefined,
          content: capsule.content,
          date: new Date(capsule.created_at).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }),
        });
      }

      if (storyItems.length > 0) {
        setItems(storyItems);
        setInitialIndex(startIndex);
        setIsOpen(true);
      }
    } catch (error) {
      console.error('Error loading story items:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const closeStory = useCallback(() => {
    setIsOpen(false);
    setItems([]);
    setInitialIndex(0);
  }, []);

  return {
    isOpen,
    items,
    initialIndex,
    loading,
    openStory,
    closeStory,
  };
};
