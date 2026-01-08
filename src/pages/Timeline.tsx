import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Clock, Calendar, Image, Video, Music, FileText, Layers, ChevronRight, Plus } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import DashboardHeader from '@/components/dashboard/DashboardHeader';

import type { Database } from '@/integrations/supabase/types';

type Capsule = Database['public']['Tables']['capsules']['Row'];
type CapsuleType = Database['public']['Enums']['capsule_type'];

const capsuleTypeConfig: Record<CapsuleType, { icon: typeof FileText; label: string; color: string }> = {
  text: { icon: FileText, label: 'Texte', color: 'bg-blue-500' },
  photo: { icon: Image, label: 'Photo', color: 'bg-emerald-500' },
  video: { icon: Video, label: 'Vidéo', color: 'bg-purple-500' },
  audio: { icon: Music, label: 'Audio', color: 'bg-orange-500' },
  mixed: { icon: Layers, label: 'Mixte', color: 'bg-pink-500' },
};

interface GroupedCapsules {
  [year: string]: {
    [month: string]: Capsule[];
  };
}

const Timeline = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<{ display_name: string | null; avatar_url: string | null } | null>(null);

  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        const [capsulesRes, profileRes] = await Promise.all([
          supabase
            .from('capsules')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false }),
          supabase
            .from('profiles')
            .select('display_name, avatar_url')
            .eq('user_id', user.id)
            .maybeSingle(),
        ]);

        if (capsulesRes.data) setCapsules(capsulesRes.data);
        if (profileRes.data) setProfile(profileRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) fetchData();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Group capsules by year and month
  const groupedCapsules = capsules.reduce<GroupedCapsules>((acc, capsule) => {
    const date = parseISO(capsule.created_at);
    const year = format(date, 'yyyy');
    const month = format(date, 'MMMM', { locale: fr });

    if (!acc[year]) acc[year] = {};
    if (!acc[year][month]) acc[year][month] = [];
    acc[year][month].push(capsule);

    return acc;
  }, {});

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-warm">
      <DashboardHeader
        user={{
          email: user.email,
          displayName: profile?.display_name || undefined,
          avatarUrl: profile?.avatar_url || undefined,
        }}
        onSignOut={handleSignOut}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-12 text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-gold shadow-gold mb-4">
            <Clock className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            Votre Timeline
          </h1>
          <p className="text-muted-foreground">
            {capsules.length} capsule{capsules.length !== 1 ? 's' : ''} à travers le temps
          </p>
        </motion.div>

        {capsules.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 bg-card rounded-2xl border border-border"
          >
            <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <Clock className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Votre timeline est vide
            </h2>
            <p className="text-muted-foreground mb-6">
              Créez votre première capsule pour commencer
            </p>
            <Button
              onClick={() => navigate('/capsules/new')}
              className="gap-2 bg-gradient-gold hover:opacity-90 text-primary-foreground"
            >
              <Plus className="w-4 h-4" />
              Créer une capsule
            </Button>
          </motion.div>
        ) : (
          <div className="relative">
            {/* Animated progress line */}
            <motion.div
              className="absolute left-[23px] sm:left-1/2 sm:-translate-x-[2px] top-0 bottom-0 w-1 bg-gradient-gold origin-top rounded-full"
              style={{ scaleY, opacity: 0.3 }}
            />
            
            {/* Static timeline line */}
            <div className="absolute left-[23px] sm:left-1/2 sm:-translate-x-[2px] top-0 bottom-0 w-1 bg-border rounded-full" />

            {Object.entries(groupedCapsules).map(([year, months], yearIndex) => (
              <div key={year} className="relative">
                {/* Year marker */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.4 }}
                  className="sticky top-20 z-10 flex items-center justify-center mb-8"
                >
                  <div className="px-6 py-2 bg-gradient-gold text-primary-foreground rounded-full font-display font-bold text-lg shadow-gold">
                    {year}
                  </div>
                </motion.div>

                {Object.entries(months).map(([month, monthCapsules], monthIndex) => (
                  <div key={`${year}-${month}`} className="mb-12">
                    {/* Month marker */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center gap-3 mb-6 ml-12 sm:ml-0 sm:justify-center"
                    >
                      <Calendar className="w-4 h-4 text-secondary" />
                      <span className="text-sm font-medium text-secondary capitalize">
                        {month}
                      </span>
                    </motion.div>

                    {/* Capsules */}
                    <div className="space-y-6">
                      {monthCapsules.map((capsule, index) => (
                        <TimelineItem
                          key={capsule.id}
                          capsule={capsule}
                          index={index}
                          isLeft={index % 2 === 0}
                          onClick={() => navigate(`/capsules/${capsule.id}`)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

const TimelineItem = ({
  capsule,
  index,
  isLeft,
  onClick,
}: {
  capsule: Capsule;
  index: number;
  isLeft: boolean;
  onClick: () => void;
}) => {
  const config = capsuleTypeConfig[capsule.capsule_type];
  const Icon = config.icon;
  const date = parseISO(capsule.created_at);

  return (
    <motion.div
      initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={`relative flex items-center gap-4 ${
        isLeft ? 'sm:flex-row' : 'sm:flex-row-reverse'
      }`}
    >
      {/* Timeline dot */}
      <div className="absolute left-[19px] sm:left-1/2 sm:-translate-x-1/2 z-10">
        <motion.div
          whileHover={{ scale: 1.2 }}
          className={`w-3 h-3 rounded-full ${config.color} ring-4 ring-background shadow-lg`}
        />
      </div>

      {/* Spacer for mobile */}
      <div className="w-12 flex-shrink-0 sm:hidden" />

      {/* Content card */}
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        onClick={onClick}
        className={`flex-1 sm:w-[calc(50%-2rem)] cursor-pointer group ${
          isLeft ? 'sm:pr-8' : 'sm:pl-8'
        }`}
      >
        <div className="p-5 rounded-2xl border border-border bg-card hover:border-secondary/50 hover:shadow-lg transition-all duration-300">
          {/* Header */}
          <div className="flex items-start gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl ${config.color} flex items-center justify-center flex-shrink-0`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate group-hover:text-secondary transition-colors">
                {capsule.title}
              </h3>
              <p className="text-xs text-muted-foreground">
                {format(date, 'd MMMM yyyy, HH:mm', { locale: fr })}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-secondary group-hover:translate-x-1 transition-all flex-shrink-0" />
          </div>

          {/* Description */}
          {capsule.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {capsule.description}
            </p>
          )}

          {/* Tags & Status */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={capsule.status === 'published' ? 'default' : 'secondary'}
              className="text-xs"
            >
              {capsule.status === 'published' ? 'Publié' : 'Brouillon'}
            </Badge>
            {capsule.tags?.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {capsule.tags && capsule.tags.length > 2 && (
              <span className="text-xs text-muted-foreground">
                +{capsule.tags.length - 2}
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Desktop spacer */}
      <div className="hidden sm:block sm:w-[calc(50%-2rem)]" />
    </motion.div>
  );
};

export default Timeline;
