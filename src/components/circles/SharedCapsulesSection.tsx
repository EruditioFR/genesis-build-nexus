import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Users, Image, Video, Music, FileText, Layers, Loader2, Share } from 'lucide-react';
import { format } from 'date-fns';
import { fr, enUS, es, ko, zhCN, Locale } from 'date-fns/locale';

import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type CapsuleType = Database['public']['Enums']['capsule_type'];

interface SharedCircle {
  id: string;
  name: string;
  color: string | null;
  description: string | null;
  owner_name: string | null;
}

interface SharedCapsule {
  id: string;
  title: string;
  description: string | null;
  capsule_type: CapsuleType;
  memory_date: string | null;
  thumbnail_url: string | null;
  owner_name: string | null;
  created_at: string;
}

interface SharedCapsulesForCircle {
  circle: SharedCircle;
  capsules: SharedCapsule[];
}

interface SharedCapsulesSectionProps {
  userId: string;
}

const SharedCapsulesSection = ({ userId }: SharedCapsulesSectionProps) => {
  const { t, i18n } = useTranslation('dashboard');
  const navigate = useNavigate();
  
  const [sharedData, setSharedData] = useState<SharedCapsulesForCircle[]>([]);
  const [loading, setLoading] = useState(true);
  const [thumbnailUrls, setThumbnailUrls] = useState<Record<string, string>>({});

  const getLocale = (): Locale => {
    const localeMap: Record<string, Locale> = { fr, en: enUS, es, ko, zh: zhCN };
    return localeMap[i18n.language] || fr;
  };

  const typeIcons: Record<CapsuleType, typeof FileText> = {
    text: FileText,
    photo: Image,
    video: Video,
    audio: Music,
    mixed: Layers,
  };

  useEffect(() => {
    const fetchSharedCapsules = async () => {
      setLoading(true);

      // 1. Get circles where user is a member (not owner)
      const { data: memberships } = await supabase
        .from('circle_members')
        .select('circle_id')
        .eq('user_id', userId)
        .not('accepted_at', 'is', null);

      if (!memberships || memberships.length === 0) {
        setLoading(false);
        return;
      }

      const circleIds = memberships.map(m => m.circle_id);

      // 2. Get circle details with owner info, excluding circles where user is owner
      const { data: circlesData } = await supabase
        .from('circles')
        .select('id, name, color, description, owner_id')
        .in('id', circleIds)
        .neq('owner_id', userId);

      if (!circlesData || circlesData.length === 0) {
        setLoading(false);
        return;
      }

      // 3. Get owner profiles
      const ownerIds = [...new Set(circlesData.map(c => c.owner_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .in('user_id', ownerIds);

      const profilesMap = new Map(profilesData?.map(p => [p.user_id, p.display_name]) || []);

      // 4. For each circle, get shared capsules
      const results: SharedCapsulesForCircle[] = [];

      for (const circle of circlesData) {
        // Get capsule shares for this circle
        const { data: sharesData } = await supabase
          .from('capsule_shares')
          .select('capsule_id')
          .eq('circle_id', circle.id);

        if (!sharesData || sharesData.length === 0) continue;

        const capsuleIds = sharesData.map(s => s.capsule_id);

        // Get capsule details
        const { data: capsulesData } = await supabase
          .from('capsules')
          .select('id, title, description, capsule_type, memory_date, thumbnail_url, user_id, created_at')
          .in('id', capsuleIds)
          .eq('status', 'published')
          .order('memory_date', { ascending: false, nullsFirst: false });

        if (!capsulesData || capsulesData.length === 0) continue;

        // Get capsule owners profiles
        const capsuleOwnerIds = [...new Set(capsulesData.map(c => c.user_id))];
        const { data: capsuleOwnersData } = await supabase
          .from('profiles')
          .select('user_id, display_name')
          .in('user_id', capsuleOwnerIds);

        const capsuleOwnersMap = new Map(capsuleOwnersData?.map(p => [p.user_id, p.display_name]) || []);

        results.push({
          circle: {
            ...circle,
            owner_name: profilesMap.get(circle.owner_id) || null,
          },
          capsules: capsulesData.map(c => ({
            ...c,
            owner_name: capsuleOwnersMap.get(c.user_id) || null,
          })),
        });
      }

      setSharedData(results);
      setLoading(false);

      // Load thumbnail URLs
      const { getSignedUrl } = await import('@/lib/signedUrlCache');
      const urlsToLoad: { id: string; path: string }[] = [];
      
      for (const item of results) {
        for (const capsule of item.capsules) {
          if (capsule.thumbnail_url) {
            urlsToLoad.push({ id: capsule.id, path: capsule.thumbnail_url });
          }
        }
      }

      const urlPromises = urlsToLoad.map(async ({ id, path }) => {
        const url = await getSignedUrl('capsule-medias', path, 3600);
        return { id, url };
      });

      const resolvedUrls = await Promise.all(urlPromises);
      const urlsMap: Record<string, string> = {};
      resolvedUrls.forEach(({ id, url }) => {
        if (url) urlsMap[id] = url;
      });
      setThumbnailUrls(urlsMap);
    };

    fetchSharedCapsules();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (sharedData.length === 0) {
    return null; // Don't show section if no shared capsules
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
          <Share className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h2 className="text-xl font-display font-bold text-foreground">
            {t('circles.sharedWithMe')}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t('circles.sharedWithMeDesc')}
          </p>
        </div>
      </div>

      {sharedData.map((item) => (
        <div
          key={item.circle.id}
          className="p-5 rounded-2xl border border-border bg-card"
        >
          {/* Circle Header */}
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${item.circle.color || '#1E3A5F'}20` }}
            >
              <Users className="w-5 h-5" style={{ color: item.circle.color || '#1E3A5F' }} />
            </div>
            <div>
              <h3 className="font-medium text-foreground">{item.circle.name}</h3>
              <p className="text-sm text-muted-foreground">
                {t('circles.sharedBy')} {item.circle.owner_name || t('circles.unknownOwner')}
              </p>
            </div>
          </div>

          {/* Capsules Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {item.capsules.map((capsule) => {
              const TypeIcon = typeIcons[capsule.capsule_type];
              return (
                <div
                  key={capsule.id}
                  onClick={() => navigate(`/capsules/${capsule.id}`)}
                  className="group p-3 rounded-xl border border-border bg-background hover:border-secondary/50 hover:shadow-soft transition-all duration-200 cursor-pointer"
                >
                  {/* Thumbnail */}
                  {thumbnailUrls[capsule.id] ? (
                    <div className="aspect-video rounded-lg overflow-hidden mb-3 bg-muted">
                      <img
                        src={thumbnailUrls[capsule.id]}
                        alt={capsule.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video rounded-lg mb-3 bg-muted flex items-center justify-center">
                      <TypeIcon className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}

                  {/* Info */}
                  <h4 className="font-medium text-foreground text-sm line-clamp-1 mb-1">
                    {capsule.title}
                  </h4>
                  {capsule.memory_date && (
                    <p className="text-xs text-muted-foreground mb-2">
                      {format(new Date(capsule.memory_date), 'd MMM yyyy', { locale: getLocale() })}
                    </p>
                  )}
                  <Badge variant="secondary" className="text-xs">
                    {t('circles.sharedBy')} {capsule.owner_name || t('circles.unknownOwner')}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </motion.div>
  );
};

export default SharedCapsulesSection;
