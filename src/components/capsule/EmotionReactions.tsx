import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmotionDefinition {
  key: string;
  emoji: string;
  category: string;
}

const EMOTIONS: EmotionDefinition[] = [
  // Joy
  { key: 'touched', emoji: '😊', category: 'joy' },
  { key: 'amused', emoji: '😂', category: 'joy' },
  { key: 'in_love', emoji: '🥰', category: 'joy' },
  { key: 'amazed', emoji: '🤩', category: 'joy' },
  { key: 'happy', emoji: '😄', category: 'joy' },
  // Tenderness
  { key: 'moved', emoji: '🥹', category: 'tenderness' },
  { key: 'affection', emoji: '💕', category: 'tenderness' },
  { key: 'grateful', emoji: '🫶', category: 'tenderness' },
  { key: 'warm', emoji: '🤗', category: 'tenderness' },
  { key: 'serene', emoji: '😌', category: 'tenderness' },
  // Nostalgia
  { key: 'nostalgic', emoji: '🥲', category: 'nostalgia' },
  { key: 'dreamy', emoji: '💭', category: 'nostalgia' },
  { key: 'memories', emoji: '🕰️', category: 'nostalgia' },
  { key: 'melancholic', emoji: '🌅', category: 'nostalgia' },
  { key: 'flashback', emoji: '📸', category: 'nostalgia' },
  // Admiration
  { key: 'bravo', emoji: '👏', category: 'admiration' },
  { key: 'inspiring', emoji: '💪', category: 'admiration' },
  { key: 'magnificent', emoji: '✨', category: 'admiration' },
  { key: 'impressive', emoji: '🌟', category: 'admiration' },
  { key: 'brilliant', emoji: '🎯', category: 'admiration' },
  // Emotion
  { key: 'tearful', emoji: '😢', category: 'emotion' },
  { key: 'heartbreaking', emoji: '💔', category: 'emotion' },
  { key: 'respectful', emoji: '🙏', category: 'emotion' },
  { key: 'speechless', emoji: '😮', category: 'emotion' },
  { key: 'overwhelming', emoji: '💫', category: 'emotion' },
  // Fun
  { key: 'playful', emoji: '😜', category: 'fun' },
  { key: 'festive', emoji: '🎉', category: 'fun' },
  { key: 'awkward', emoji: '😅', category: 'fun' },
  { key: 'mischievous', emoji: '🤭', category: 'fun' },
  { key: 'cheeky', emoji: '😏', category: 'fun' },
];

const CATEGORIES = ['joy', 'tenderness', 'nostalgia', 'admiration', 'emotion', 'fun'] as const;

interface Reaction {
  id: string;
  capsule_id: string;
  user_id: string;
  emotion_key: string;
  created_at: string;
}

interface EmotionReactionsProps {
  capsuleId: string;
}

const EmotionReactions = ({ capsuleId }: EmotionReactionsProps) => {
  const { t } = useTranslation('capsules');
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [open, setOpen] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);

  const fetchReactions = useCallback(async () => {
    const { data } = await supabase
      .from('capsule_reactions')
      .select('*')
      .eq('capsule_id', capsuleId);
    if (data) setReactions(data as Reaction[]);
  }, [capsuleId]);

  // Fetch display names for all unique user_ids in reactions
  useEffect(() => {
    const userIds = [...new Set(reactions.map((r) => r.user_id))];
    const missing = userIds.filter((id) => !profiles[id]);
    if (missing.length === 0) return;

    supabase
      .from('profiles')
      .select('user_id, display_name')
      .in('user_id', missing)
      .then(({ data }) => {
        if (data) {
          setProfiles((prev) => {
            const next = { ...prev };
            data.forEach((p) => {
              next[p.user_id] = p.display_name || t('detail.unknownOwner');
            });
            return next;
          });
        }
      });
  }, [reactions, profiles, t]);

  useEffect(() => {
    fetchReactions();

    const channel = supabase
      .channel(`reactions-${capsuleId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'capsule_reactions',
        filter: `capsule_id=eq.${capsuleId}`,
      }, () => {
        fetchReactions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [capsuleId, fetchReactions]);

  const toggleReaction = async (emotionKey: string) => {
    if (!user || toggling) return;
    setToggling(emotionKey);

    const existing = reactions.find(
      (r) => r.user_id === user.id && r.emotion_key === emotionKey
    );

    if (existing) {
      await supabase.from('capsule_reactions').delete().eq('id', existing.id);
      setReactions((prev) => prev.filter((r) => r.id !== existing.id));
    } else {
      const { data } = await supabase
        .from('capsule_reactions')
        .insert({ capsule_id: capsuleId, user_id: user.id, emotion_key: emotionKey })
        .select()
        .single();
      if (data) setReactions((prev) => [...prev, data as Reaction]);
    }

    setToggling(null);
  };

  // Aggregate reactions with author names
  const aggregated = useMemo(() => {
    return reactions.reduce<Record<string, { count: number; userReacted: boolean; authors: string[] }>>((acc, r) => {
      if (!acc[r.emotion_key]) acc[r.emotion_key] = { count: 0, userReacted: false, authors: [] };
      acc[r.emotion_key].count++;
      const name = profiles[r.user_id] || t('detail.unknownOwner');
      acc[r.emotion_key].authors.push(name);
      if (user && r.user_id === user.id) acc[r.emotion_key].userReacted = true;
      return acc;
    }, {});
  }, [reactions, profiles, user, t]);

  const sortedEmotions = Object.entries(aggregated)
    .sort((a, b) => b[1].count - a[1].count);

  const getEmoji = (key: string) => EMOTIONS.find((e) => e.key === key)?.emoji || '❓';

  const EmotionGrid = () => (
    <div className="space-y-3 p-1">
      {CATEGORIES.map((cat) => (
        <div key={cat}>
          <p className="text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
            {t(`reactions.categories.${cat}`)}
          </p>
          <div className="grid grid-cols-5 gap-1.5">
            {EMOTIONS.filter((e) => e.category === cat).map((emotion) => {
              const isActive = aggregated[emotion.key]?.userReacted;
              return (
                <button
                  key={emotion.key}
                  onClick={async () => {
                    await toggleReaction(emotion.key);
                    setOpen(false);
                  }}
                  disabled={toggling === emotion.key}
                  className={cn(
                    'flex flex-col items-center gap-0.5 p-1.5 rounded-lg transition-all text-center',
                    'hover:bg-accent/50 active:scale-95',
                    isActive && 'bg-primary/10 ring-1 ring-primary/30'
                  )}
                  title={t(`reactions.emotions.${emotion.key}`)}
                >
                  <span className="text-xl leading-none">{emotion.emoji}</span>
                  <span className="text-[10px] text-muted-foreground leading-tight truncate w-full">
                    {t(`reactions.emotions.${emotion.key}`)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  const TriggerButton = (
    <Button
      variant="outline"
      size="sm"
      className="rounded-full h-8 gap-1.5 text-xs border-dashed hover:border-primary/50"
    >
      <Heart className="w-3.5 h-3.5" />
      {t('reactions.add')}
    </Button>
  );

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-wrap items-center gap-1.5">
        <AnimatePresence>
          {sortedEmotions.map(([key, { count, userReacted, authors }]) => (
            <Tooltip key={key}>
              <TooltipTrigger asChild>
                <motion.button
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  onClick={() => toggleReaction(key)}
                  className={cn(
                    'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all',
                    'border hover:shadow-sm active:scale-95',
                    userReacted
                      ? 'bg-primary/10 border-primary/30 text-primary font-medium'
                      : 'bg-muted/50 border-border text-muted-foreground hover:bg-muted'
                  )}
                >
                  <span className="text-sm">{getEmoji(key)}</span>
                  <span>{count}</span>
                </motion.button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[200px] text-xs">
                <p className="font-medium mb-0.5">{t(`reactions.emotions.${key}`)}</p>
                <p className="text-muted-foreground">{authors.join(', ')}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </AnimatePresence>

        {user && (
          isMobile ? (
            <Drawer open={open} onOpenChange={setOpen}>
              <DrawerTrigger asChild>{TriggerButton}</DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>{t('reactions.title')}</DrawerTitle>
                </DrawerHeader>
                <div className="px-4 pb-6 max-h-[60vh] overflow-y-auto">
                  <EmotionGrid />
                </div>
              </DrawerContent>
            </Drawer>
          ) : (
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>{TriggerButton}</PopoverTrigger>
              <PopoverContent className="w-80 p-3" align="start">
                <p className="text-sm font-semibold mb-2">{t('reactions.title')}</p>
                <div className="max-h-[400px] overflow-y-auto">
                  <EmotionGrid />
                </div>
              </PopoverContent>
            </Popover>
          )
        )}
      </div>
    </TooltipProvider>
  );
};

export default EmotionReactions;
