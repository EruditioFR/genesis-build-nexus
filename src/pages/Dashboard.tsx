import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import StatsCards from '@/components/dashboard/StatsCards';
import StorageProgress from '@/components/dashboard/StorageProgress';
import RecentCapsules from '@/components/dashboard/RecentCapsules';
import AISuggestions from '@/components/dashboard/AISuggestions';
import QuickActions from '@/components/dashboard/QuickActions';

interface Profile {
  display_name: string | null;
  avatar_url: string | null;
  subscription_level: 'free' | 'premium' | 'legacy';
  storage_used_mb: number;
  storage_limit_mb: number;
}

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, avatar_url, subscription_level, storage_used_mb, storage_limit_mb')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!error && data) {
        setProfile(data);
      }
      setProfileLoading(false);
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading || profileLoading) {
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

  // Données de démonstration pour les capsules récentes
  const recentCapsules = [
    { id: '1', title: 'Vacances en Bretagne 2024', type: 'photo' as const, date: 'Il y a 2 jours' },
    { id: '2', title: 'Lettre à mes petits-enfants', type: 'text' as const, date: 'Il y a 5 jours' },
    { id: '3', title: 'Mariage de Sophie', type: 'video' as const, date: 'Il y a 1 semaine' },
  ];

  // Suggestions IA de démonstration
  const aiSuggestions = [
    {
      id: '1',
      type: 'memory' as const,
      title: 'Racontez votre premier emploi',
      description: "C'est un moment important de votre vie que vous pourriez partager avec vos proches.",
    },
    {
      id: '2',
      type: 'event' as const,
      title: 'Anniversaire de Paul dans 3 jours',
      description: 'Pourquoi ne pas créer une capsule spéciale pour cette occasion ?',
    },
    {
      id: '3',
      type: 'gift' as const,
      title: 'Complétez votre arbre généalogique',
      description: 'Ajoutez des photos de vos grands-parents pour enrichir votre histoire familiale.',
    },
  ];

  // Stats de démonstration
  const stats = {
    totalCapsules: 12,
    totalMedias: 47,
    sharedCircles: 3,
    upcomingEvents: 2,
  };

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
            Continuez à préserver vos souvenirs précieux
          </p>
        </motion.div>

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
