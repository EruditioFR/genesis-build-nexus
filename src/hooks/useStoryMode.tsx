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

export const useStoryMode = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<StoryItem[]>([]);
  const [initialIndex, setInitialIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const openStory = useCallback(async (capsules: Capsule[], startIndex = 0) => {
    setLoading(true);
    
    try {
      const storyItems: StoryItem[] = [];

      for (const capsule of capsules) {
        // Fetch media for each capsule
        const { data: medias } = await supabase
          .from('capsule_medias')
          .select('*')
          .eq('capsule_id', capsule.id)
          .order('position');

        if (medias && medias.length > 0) {
          // Add each media as a story item
          for (const media of medias) {
            // Get signed URL for the media
            const { data: signedUrlData } = await supabase.storage
              .from('capsule-medias')
              .createSignedUrl(media.file_url.replace('capsule-medias/', ''), 3600);

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
              url: signedUrlData?.signedUrl || media.file_url,
              title: capsule.title,
              description: media.caption || capsule.description || undefined,
              date: new Date(capsule.created_at).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              }),
            });
          }
        } else if (capsule.capsule_type === 'text' && capsule.content) {
          // For text capsules without media
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
