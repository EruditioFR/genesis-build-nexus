import { useState, useEffect } from 'react';
import { Image, Loader2, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { FamilyPerson } from '@/types/familyTree';
import { useNavigate } from 'react-router-dom';

interface TaggedMedia {
  id: string;
  media_id: string;
  capsule_media: {
    id: string;
    file_url: string;
    file_type: string;
    caption: string | null;
    capsule_id: string;
  };
  capsule_title?: string;
}

interface PersonTaggedMediasProps {
  person: FamilyPerson;
}

export function PersonTaggedMedias({ person }: PersonTaggedMediasProps) {
  const [medias, setMedias] = useState<TaggedMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchTaggedMedias();
  }, [person.id]);

  const fetchTaggedMedias = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('media_person_tags')
        .select(`
          id,
          media_id,
          capsule_medias!media_person_tags_media_id_fkey (
            id,
            file_url,
            file_type,
            caption,
            capsule_id
          )
        `)
        .eq('person_id', person.id);

      if (error) throw error;

      const tagged: TaggedMedia[] = (data || [])
        .filter((t: any) => t.capsule_medias)
        .map((t: any) => ({
          id: t.id,
          media_id: t.media_id,
          capsule_media: t.capsule_medias,
        }));

      // Fetch capsule titles
      const capsuleIds = [...new Set(tagged.map(t => t.capsule_media.capsule_id))];
      if (capsuleIds.length > 0) {
        const { data: capsules } = await supabase
          .from('capsules')
          .select('id, title')
          .in('id', capsuleIds);
        
        const titleMap = new Map((capsules || []).map(c => [c.id, c.title]));
        tagged.forEach(t => {
          t.capsule_title = titleMap.get(t.capsule_media.capsule_id);
        });
      }

      setMedias(tagged);

      // Generate signed URLs for private storage
      const imageMedias = tagged.filter(t => t.capsule_media.file_type?.startsWith('image/'));
      if (imageMedias.length > 0) {
        const urls: Record<string, string> = {};
        for (const media of imageMedias) {
          const fileUrl = media.capsule_media.file_url;
          if (fileUrl.startsWith('http')) {
            urls[media.media_id] = fileUrl;
          } else {
            const { data: signedData } = await supabase.storage
              .from('capsule-medias')
              .createSignedUrl(fileUrl, 3600);
            if (signedData?.signedUrl) {
              urls[media.media_id] = signedData.signedUrl;
            }
          }
        }
        setSignedUrls(urls);
      }
    } catch (error) {
      console.error('Error fetching tagged medias:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (medias.length === 0) {
    return (
      <div className="text-center py-6">
        <Image className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">
          {person.first_names} n'apparaît sur aucune photo
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        {medias.length} photo{medias.length > 1 ? 's' : ''} où {person.first_names} est tagué(e)
      </p>
      <div className="grid grid-cols-3 gap-2">
        {medias.map((media) => {
          const url = signedUrls[media.media_id];
          return (
            <button
              key={media.id}
              className="relative aspect-square rounded-lg overflow-hidden border bg-muted hover:ring-2 hover:ring-primary transition-all group"
              onClick={() => navigate(`/capsules/${media.capsule_media.capsule_id}`)}
              title={media.capsule_title || 'Voir le souvenir'}
            >
              {url ? (
                <img
                  src={url}
                  alt={media.capsule_media.caption || ''}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Image className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <ExternalLink className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              {media.capsule_title && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-[10px] text-white truncate">{media.capsule_title}</p>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
