import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import StatsCards from '@/components/dashboard/StatsCards';
import StorageProgress from '@/components/dashboard/StorageProgress';
import RecentCapsules from '@/components/dashboard/RecentCapsules';
import AISuggestions from '@/components/dashboard/AISuggestions';
import QuickActions from '@/components/dashboard/QuickActions';
import OnboardingChecklist from '@/components/dashboard/OnboardingChecklist';

import type { Database } from '@/integrations/supabase/types';

type CapsuleType = Database['public']['Enums']['capsule_type'];

interface Profile {
  display_name: string | null;
  avatar_url: string | null;
  subscription_level: 'free' | 'premium' | 'legacy';
  storage_used_mb: number;
  storage_limit_mb: number;
}

interface CapsuleRow {
  id: string;
  title: string;
  capsule_type: CapsuleType;
  created_at: string;
  thumbnail_url: string | null;
}

interface RecentCapsule {
  id: string;
  title: string;
  type: 'photo' | 'video' | 'text' | 'audio' | 'mixed';
  date: string;
  thumbnail?: string;
}

interface Stats {
  totalCapsules: number;
  totalMedias: number;
  sharedCircles: number;
  upcomingEvents: number;
}

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [recentCapsules, setRecentCapsules] = useState<RecentCapsule[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalCapsules: 0,
    totalMedias: 0,
    sharedCircles: 0,
    upcomingEvents: 0,
  });
  const [dataLoading, setDataLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check if user just signed up (show onboarding)
  useEffect(() => {
    const isNewUser = searchParams.get('welcome') === 'true';
    const onboardingDismissed = localStorage.getItem('onboarding_dismissed');
    
    if (isNewUser || (!onboardingDismissed && stats.totalCapsules === 0)) {
      setShowOnboarding(true);
    }
  }, [searchParams, stats.totalCapsules]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('display_name, avatar_url, subscription_level, storage_used_mb, storage_limit_mb')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profileData) {
          setProfile(profileData);
        }

        // Fetch recent capsules (last 5)
        const { data: capsulesData } = await supabase
          .from('capsules')
          .select('id, title, capsule_type, created_at, thumbnail_url')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (capsulesData) {
          const formattedCapsules: RecentCapsule[] = capsulesData.map((capsule: CapsuleRow) => ({
            id: capsule.id,
            title: capsule.title,
            type: capsule.capsule_type,
            date: formatDistanceToNow(new Date(capsule.created_at), { addSuffix: true, locale: fr }),
            thumbnail: capsule.thumbnail_url || undefined,
          }));
          setRecentCapsules(formattedCapsules);
        }

        // Fetch stats - total capsules
        const { count: capsuleCount } = await supabase
          .from('capsules')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Fetch stats - total medias and calculate actual storage used
        const { data: userCapsuleIds } = await supabase
          .from('capsules')
          .select('id')
          .eq('user_id', user.id);

        let mediaCount = 0;
        let actualStorageUsedBytes = 0;
        
        if (userCapsuleIds && userCapsuleIds.length > 0) {
          const capsuleIds = userCapsuleIds.map(c => c.id);
          
          // Get media count and total size
          const { data: mediasData, count } = await supabase
            .from('capsule_medias')
            .select('file_size_bytes', { count: 'exact' })
            .in('capsule_id', capsuleIds);
          
          mediaCount = count || 0;
          
          // Calculate actual storage from file sizes
          if (mediasData) {
            actualStorageUsedBytes = mediasData.reduce((total, media) => {
              return total + (media.file_size_bytes || 0);
            }, 0);
          }
        }
        
        // Convert bytes to MB for storage display
        const actualStorageUsedMb = Math.round((actualStorageUsedBytes / (1024 * 1024)) * 100) / 100;
        
        // Update profile with actual storage if different
        if (profileData && Math.abs(actualStorageUsedMb - (profileData.storage_used_mb || 0)) > 0.01) {
          await supabase
            .from('profiles')
            .update({ storage_used_mb: actualStorageUsedMb })
            .eq('user_id', user.id);
          
          // Update local profile state with actual value
          setProfile(prev => prev ? { ...prev, storage_used_mb: actualStorageUsedMb } : prev);
        }

        // Fetch stats - circles owned
        const { count: circleCount } = await supabase
          .from('circles')
          .select('*', { count: 'exact', head: true })
          .eq('owner_id', user.id);

        setStats({
          totalCapsules: capsuleCount || 0,
          totalMedias: mediaCount,
          sharedCircles: circleCount || 0,
          upcomingEvents: 0, // TODO: implement events feature
        });

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setDataLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Chargement de votre espace...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Suggestions IA (dynamiques basées sur les données)
  const aiSuggestions = [];
  
  if (stats.totalCapsules === 0) {
    aiSuggestions.push({
      id: '1',
      type: 'memory' as const,
      title: 'Créez votre première capsule',
      description: 'Commencez par un souvenir simple : une photo de famille ou un court texte.',
    });
  } else if (stats.totalCapsules < 5) {
    aiSuggestions.push({
      id: '1',
      type: 'memory' as const,
      title: 'Racontez un moment marquant',
      description: 'Votre premier emploi, un voyage inoubliable, ou une rencontre importante.',
    });
  }

  if (stats.sharedCircles === 0) {
    aiSuggestions.push({
      id: '2',
      type: 'gift' as const,
      title: 'Créez votre premier cercle',
      description: 'Invitez votre famille ou vos amis proches à partager vos souvenirs.',
    });
  }

  aiSuggestions.push({
    id: '3',
    type: 'event' as const,
    title: 'Complétez votre profil',
    description: 'Ajoutez une photo et votre date de naissance pour personnaliser votre expérience.',
  });

  return (
    <div className="min-h-screen bg-gradient-warm">
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            Bonjour{profile?.display_name ? `, ${profile.display_name.split(' ')[0]}` : ''} 👋
          </h1>
          <p className="text-muted-foreground">
            {stats.totalCapsules === 0 
              ? 'Commencez à préserver vos souvenirs précieux'
              : 'Continuez à préserver vos souvenirs précieux'}
          </p>
        </motion.div>

        {/* Onboarding Checklist */}
        {showOnboarding && (
          <div className="mb-8">
            <OnboardingChecklist
              hasProfile={!!(profile?.display_name && profile?.avatar_url)}
              hasCapsule={stats.totalCapsules > 0}
              hasCircle={stats.sharedCircles > 0}
              onDismiss={() => {
                setShowOnboarding(false);
                localStorage.setItem('onboarding_dismissed', 'true');
              }}
            />
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-8">
          <QuickActions />
        </div>

        {/* Stats Cards */}
        <div className="mb-8">
          <StatsCards stats={stats} />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            <StorageProgress
              usedMb={profile?.storage_used_mb || 0}
              limitMb={profile?.storage_limit_mb || 500}
              subscriptionLevel={profile?.subscription_level || 'free'}
            />
            <RecentCapsules capsules={recentCapsules} />
          </div>

          {/* Right Column - 1/3 width */}
          <div className="lg:col-span-1">
            <AISuggestions 
              suggestions={aiSuggestions} 
              userName={profile?.display_name?.split(' ')[0]}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
