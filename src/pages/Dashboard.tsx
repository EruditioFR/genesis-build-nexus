import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { MessageSquareHeart, ArrowRight, HelpCircle, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS, es, ko, zhCN } from 'date-fns/locale';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import DashboardHero from '@/components/dashboard/DashboardHero';
import DashboardStorageMini from '@/components/dashboard/DashboardStorageMini';
import ExploreSection from '@/components/dashboard/ExploreSection';
import RecentCapsules from '@/components/dashboard/RecentCapsules';
import FamilyTreeCard from '@/components/dashboard/FamilyTreeCard';
import PremiumPromoCard from '@/components/dashboard/PremiumPromoCard';
import WelcomeSection from '@/components/dashboard/WelcomeSection';
import DashboardInspirationWidget from '@/components/dashboard/DashboardInspirationWidget';
import HowItWorksVideo from '@/components/dashboard/HowItWorksVideo';
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
  admin_override?: boolean;
}

interface CapsuleRow {
  id: string;
  title: string;
  capsule_type: CapsuleType;
  created_at: string;
  thumbnail_url: string | null;
  content: string | null;
  metadata: { youtube_id?: string; youtube_url?: string; youtube_ids?: string[]; youtube_urls?: string[] } | null;
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
  const [hideWelcome, setHideWelcome] = useState(() => localStorage.getItem('welcome_section_hidden') === 'true');
  const [hideBetaBanner, setHideBetaBanner] = useState(() => localStorage.getItem('beta_banner_hidden') === 'true');
  const [tourTriggered, setTourTriggered] = useState(false);

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
          .select('display_name, avatar_url, subscription_level, storage_used_mb, storage_limit_mb, admin_override')
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
          .select('id', { count: 'exact', head: true })
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

  const isPremium = profile?.subscription_level === 'premium' || profile?.subscription_level === 'legacy' || profile?.admin_override;

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
          {/* 1. HERO navy */}
          <DashboardHero
            displayName={profile?.display_name || undefined}
            totalCapsules={stats.totalCapsules}
            totalMedias={stats.totalMedias}
            sharedCircles={stats.sharedCircles}
          />

          {/* 2. Show-guide button if welcome was hidden */}
          {hideWelcome && (
            <div className="flex justify-end mb-4">
              <button
                onClick={() => {
                  setHideWelcome(false);
                  localStorage.removeItem('welcome_section_hidden');
                }}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-secondary transition-colors"
                title={t('welcomeSection.showGuide')}
              >
                <HelpCircle className="w-4 h-4" />
                <span>{t('welcomeSection.showGuide')}</span>
              </button>
            </div>
          )}

          {/* 3. Welcome guide (compact, dismissible) */}
          {!hideWelcome && (
            <div className="mb-6 md:mb-8">
              <WelcomeSection
                totalCapsules={stats.totalCapsules}
                onHide={() => {
                  setHideWelcome(true);
                  localStorage.setItem('welcome_section_hidden', 'true');
                }}
              />
            </div>
          )}

          {/* 4. Beta feedback for legacy users */}
          {profile?.subscription_level === 'legacy' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 md:mb-8"
            >
              <Link
                to="/beta-feedback"
                className="flex items-center gap-4 p-4 rounded-2xl border border-secondary/30 bg-gradient-to-r from-secondary/5 to-secondary/10 hover:from-secondary/10 hover:to-secondary/15 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary/15 flex items-center justify-center shrink-0">
                  <MessageSquareHeart className="w-6 h-6 text-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm md:text-base">Donnez votre avis de beta testeur</p>
                  <p className="text-xs md:text-sm text-muted-foreground truncate">Aidez-nous à améliorer Family Garden, formulaire rapide (5 min)</p>
                </div>
                <ArrowRight className="w-5 h-5 text-secondary shrink-0 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          )}

          {/* 5. Main grid: content + sticky sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
            {/* Left: 8/12 — Recent souvenirs */}
            <div className="lg:col-span-8 space-y-6">
              <RecentCapsules capsules={recentCapsules} />
            </div>

            {/* Right: 4/12 — Sticky sidebar */}
            <aside className="lg:col-span-4">
              <div className="lg:sticky lg:top-24 space-y-5">
                <DashboardInspirationWidget />
                {isPremium ? (
                  <FamilyTreeCard personsCount={familyPersonsCount} />
                ) : (
                  <PremiumPromoCard />
                )}
                {profile && (
                  <DashboardStorageMini
                    usedMb={profile.storage_used_mb}
                    limitMb={profile.storage_limit_mb}
                    subscriptionLevel={profile.subscription_level}
                  />
                )}
              </div>
            </aside>
          </div>

          {/* 6. Explore section */}
          <ExploreSection />

          {/* 7. Tutorials at the bottom */}
          <div className="mt-10 md:mt-14">
            <HowItWorksVideo variant="dashboard" />
          </div>
        </div>
      </AuthenticatedLayout>
    </>
  );
};

export default Dashboard;
