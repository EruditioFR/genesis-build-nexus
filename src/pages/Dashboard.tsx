import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS, es, ko, zhCN } from 'date-fns/locale';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import StatsCards from '@/components/dashboard/StatsCards';
import StorageProgress from '@/components/dashboard/StorageProgress';
import RecentCapsules from '@/components/dashboard/RecentCapsules';
import FamilyTreeCard from '@/components/dashboard/FamilyTreeCard';
import PremiumPromoCard from '@/components/dashboard/PremiumPromoCard';
import QuickActions from '@/components/dashboard/QuickActions';
import OnboardingChecklist from '@/components/dashboard/OnboardingChecklist';
import MemoryPrompts from '@/components/dashboard/MemoryPrompts';
import GuidedMemoryPrompts from '@/components/dashboard/GuidedMemoryPrompts';
import { useOnboardingTour } from '@/hooks/useOnboardingTour';
import { TourWelcomeDialog } from '@/components/tour/TourWelcomeDialog';
import NoIndex from '@/components/seo/NoIndex';

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
  content: string | null;
  metadata: { youtube_id?: string; youtube_url?: string } | null;
}

interface MediaRow {
  file_url: string;
  file_type: string;
}

interface RecentCapsule {
  id: string;
  title: string;
  type: 'photo' | 'video' | 'text' | 'audio' | 'mixed';
  date: string;
  thumbnail?: string;
  content?: string;
  firstMediaUrl?: string;
  firstVideoUrl?: string;
  youtubeId?: string;
}

interface Stats {
  totalCapsules: number;
  totalMedias: number;
  sharedCircles: number;
  upcomingEvents: number;
}

const getDateLocale = (lang: string) => {
  switch (lang) {
    case 'en': return enUS;
    case 'es': return es;
    case 'ko': return ko;
    case 'zh': return zhCN;
    default: return fr;
  }
};

const Dashboard = () => {
  const { t, i18n } = useTranslation('dashboard');
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { startTour, isTourCompleted, welcomeDialogProps } = useOnboardingTour();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [recentCapsules, setRecentCapsules] = useState<RecentCapsule[]>([]);
  const [familyPersonsCount, setFamilyPersonsCount] = useState(0);
  const [stats, setStats] = useState<Stats>({
    totalCapsules: 0,
    totalMedias: 0,
    sharedCircles: 0,
    upcomingEvents: 0,
  });
  const [dataLoading, setDataLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [tourTriggered, setTourTriggered] = useState(false);

  // Check if user just signed up (show onboarding checklist)
  useEffect(() => {
    const isNewUser = searchParams.get('welcome') === 'true';
    const onboardingDismissed = localStorage.getItem('onboarding_dismissed');
    
    if (isNewUser || (!onboardingDismissed && stats.totalCapsules === 0)) {
      setShowOnboarding(true);
    }
  }, [searchParams, stats.totalCapsules]);

  // Auto-start tour for new users
  useEffect(() => {
    const isNewUser = searchParams.get('welcome') === 'true';
    
    // Only trigger tour once, when data is loaded, for new users who haven't completed the tour
    if (!dataLoading && !tourTriggered && isNewUser && !isTourCompleted()) {
      setTourTriggered(true);
      // Small delay to ensure DOM elements are rendered
      const timer = setTimeout(() => {
        startTour();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [dataLoading, tourTriggered, searchParams, isTourCompleted, startTour]);

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

        // Fetch recent capsules (last 5) with content and metadata
        const { data: capsulesData } = await supabase
          .from('capsules')
          .select('id, title, capsule_type, created_at, thumbnail_url, content, metadata')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (capsulesData) {
          // Get first media for each capsule
          const capsuleIds = capsulesData.map((c: CapsuleRow) => c.id);
          const { data: mediasData } = await supabase
            .from('capsule_medias')
            .select('capsule_id, file_url, file_type')
            .in('capsule_id', capsuleIds)
            .order('position', { ascending: true });

          // Build maps of first image and first video per capsule
          const firstImageMap: Record<string, string> = {};
          const firstVideoMap: Record<string, string> = {};
          if (mediasData) {
            mediasData.forEach((media: MediaRow & { capsule_id: string }) => {
              if (!firstImageMap[media.capsule_id] && media.file_type.startsWith('image/')) {
                firstImageMap[media.capsule_id] = media.file_url;
              }
              if (!firstVideoMap[media.capsule_id] && media.file_type.startsWith('video/')) {
                firstVideoMap[media.capsule_id] = media.file_url;
              }
            });
          }

          const formattedCapsules: RecentCapsule[] = capsulesData.map((capsule: CapsuleRow) => {
            const metadata = capsule.metadata as { youtube_id?: string } | null;
            return {
              id: capsule.id,
              title: capsule.title,
              type: capsule.capsule_type,
              date: formatDistanceToNow(new Date(capsule.created_at), { addSuffix: true, locale: getDateLocale(i18n.language) }),
              thumbnail: capsule.thumbnail_url || undefined,
              content: capsule.content || undefined,
              firstMediaUrl: firstImageMap[capsule.id] || undefined,
              firstVideoUrl: firstVideoMap[capsule.id] || undefined,
              youtubeId: metadata?.youtube_id || undefined,
            };
          });
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
        
        // Convert bytes to MB for storage display (round to integer for DB compatibility)
        const actualStorageUsedMb = Math.round(actualStorageUsedBytes / (1024 * 1024));
        
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

        // Fetch family tree persons count for premium users
        const { data: treesData } = await supabase
          .from('family_trees')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);

        if (treesData && treesData.length > 0) {
          const { count: personsCount } = await supabase
            .from('family_persons')
            .select('*', { count: 'exact', head: true })
            .eq('tree_id', treesData[0].id);
          
          setFamilyPersonsCount(personsCount || 0);
        }

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
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isPremium = profile?.subscription_level === 'premium' || profile?.subscription_level === 'legacy';

  return (
    <>
      <NoIndex />
      <TourWelcomeDialog {...welcomeDialogProps} />
      <AuthenticatedLayout
        user={{
          id: user.id,
          email: user.email,
          displayName: profile?.display_name || undefined,
          avatarUrl: profile?.avatar_url || undefined,
        }}
        onSignOut={handleSignOut}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 md:mb-8"
          data-tour="welcome"
        >
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-1 md:mb-2">
            {t('welcome', { name: profile?.display_name?.split(' ')[0] || '' })} 👋
          </h1>
          <p className="text-muted-foreground text-base">
            {stats.totalCapsules === 0 
              ? t('subtitleEmpty')
              : t('subtitle')}
          </p>
        </motion.div>

        {/* Onboarding Checklist */}
        {showOnboarding && (
          <div className="mb-6 md:mb-8">
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
        <div className="mb-6 md:mb-8">
          <QuickActions />
        </div>

        {/* Stats Cards */}
        <div className="mb-6 md:mb-8">
          <StatsCards stats={stats} />
        </div>

        {/* Main Grid - RecentCapsules first */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            <RecentCapsules capsules={recentCapsules} />
            <GuidedMemoryPrompts />
            <StorageProgress
              usedMb={profile?.storage_used_mb || 0}
              limitMb={profile?.storage_limit_mb || 500}
              subscriptionLevel={profile?.subscription_level || 'free'}
            />
          </div>

          {/* Right Column - 1/3 width */}
          <div className="lg:col-span-1">
            {isPremium ? (
              <FamilyTreeCard personsCount={familyPersonsCount} />
            ) : (
              <PremiumPromoCard />
            )}
          </div>
        </div>
        </div>
      </AuthenticatedLayout>
    </>
  );
};

export default Dashboard;
