import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface PhotoTag {
  id: string;
  media_id: string;
  person_id: string;
  position_x: number;
  position_y: number;
  created_at: string;
  // Joined
  person_name?: string;
}

export function usePhotoTags() {
  const { user } = useAuth();
  const [tags, setTags] = useState<Record<string, PhotoTag[]>>({});
  const [loading, setLoading] = useState(false);

  const fetchTagsForMedias = useCallback(async (mediaIds: string[]) => {
    if (!user || mediaIds.length === 0) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('media_person_tags')
        .select('*, family_persons!media_person_tags_person_id_fkey(first_names, last_name)')
        .in('media_id', mediaIds);

      if (error) throw error;

      const tagsByMedia: Record<string, PhotoTag[]> = {};
      (data || []).forEach((tag: any) => {
        const mediaId = tag.media_id;
        if (!tagsByMedia[mediaId]) tagsByMedia[mediaId] = [];
        tagsByMedia[mediaId].push({
          id: tag.id,
          media_id: tag.media_id,
          person_id: tag.person_id,
          position_x: Number(tag.position_x),
          position_y: Number(tag.position_y),
          created_at: tag.created_at,
          person_name: tag.family_persons
            ? `${tag.family_persons.first_names} ${tag.family_persons.last_name}`
            : undefined,
        });
      });

      setTags(tagsByMedia);
    } catch (error) {
      console.error('Error fetching photo tags:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addTag = useCallback(async (
    mediaId: string,
    personId: string,
    positionX: number,
    positionY: number,
    personName: string,
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('media_person_tags')
        .insert({
          media_id: mediaId,
          person_id: personId,
          position_x: positionX,
          position_y: positionY,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          toast.error('Cette personne est déjà taguée sur cette photo');
          return false;
        }
        throw error;
      }

      // Update local state
      setTags(prev => ({
        ...prev,
        [mediaId]: [
          ...(prev[mediaId] || []),
          { ...data, position_x: Number(data.position_x), position_y: Number(data.position_y), person_name: personName },
        ],
      }));

      toast.success(`${personName} tagué(e)`);
      return true;
    } catch (error) {
      console.error('Error adding tag:', error);
      toast.error('Erreur lors du tag');
      return false;
    }
  }, [user]);

  const removeTag = useCallback(async (tagId: string, mediaId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('media_person_tags')
        .delete()
        .eq('id', tagId);

      if (error) throw error;

      setTags(prev => ({
        ...prev,
        [mediaId]: (prev[mediaId] || []).filter(t => t.id !== tagId),
      }));

      toast.success('Tag supprimé');
      return true;
    } catch (error) {
      console.error('Error removing tag:', error);
      toast.error('Erreur lors de la suppression');
      return false;
    }
  }, [user]);

  const getTagsForMedia = useCallback((mediaId: string): PhotoTag[] => {
    return tags[mediaId] || [];
  }, [tags]);

  return { tags, loading, fetchTagsForMedias, addTag, removeTag, getTagsForMedia };
}
