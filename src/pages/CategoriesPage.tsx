import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, ChevronRight, Sparkles, Folder } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useCategories, type Category } from '@/hooks/useCategories';
import { supabase } from '@/integrations/supabase/client';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import MobileBottomNav from '@/components/dashboard/MobileBottomNav';

interface CategoryWithCount extends Category {
  capsuleCount: number;
}

const CategoriesPage = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { categories, loading: categoriesLoading } = useCategories();
  const [profile, setProfile] = useState<{ display_name: string | null; avatar_url: string | null } | null>(null);
  const [capsuleCounts, setCapsuleCounts] = useState<Record<string, number>>({});
  const [isLoadingCounts, setIsLoadingCounts] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (profileData) setProfile(profileData);

      // Fetch capsule counts per category
      const { data: countData } = await supabase
        .from('capsule_categories')
        .select(`
          category_id,
          capsule:capsules!inner(id, user_id)
        `)
        .eq('capsule.user_id', user.id);

      if (countData) {
        const counts: Record<string, number> = {};
        countData.forEach((item: any) => {
          counts[item.category_id] = (counts[item.category_id] || 0) + 1;
        });
        setCapsuleCounts(counts);
      }
      setIsLoadingCounts(false);
    };

    if (user) fetchData();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const categoriesWithCounts: CategoryWithCount[] = useMemo(() => {
    return categories.map(cat => ({
      ...cat,
      capsuleCount: capsuleCounts[cat.id] || 0,
    }));
  }, [categories, capsuleCounts]);

  const standardCategories = categoriesWithCounts.filter(c => c.is_standard);
  const customCategories = categoriesWithCounts.filter(c => !c.is_standard);
  const totalCapsules = Object.values(capsuleCounts).reduce((sum, count) => sum + count, 0);

  if (authLoading || categoriesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-warm pb-24 md:pb-0">
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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="mb-4 gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au tableau de bord
          </Button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-gold flex items-center justify-center shadow-gold">
                <Folder className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold text-foreground">
                  Mes catégories
                </h1>
                <p className="text-muted-foreground text-sm">
                  Organisez vos souvenirs par thème • {totalCapsules} capsule{totalCapsules !== 1 ? 's' : ''} catégorisée{totalCapsules !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <Button asChild className="gap-2 bg-gradient-gold hover:opacity-90 text-primary-foreground shadow-gold">
              <Link to="/capsules/new">
                <Plus className="w-4 h-4" />
                Nouvelle capsule
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Standard Categories */}
        <div className="space-y-4 mb-8">
          {standardCategories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Link
                to={`/categories/${category.slug}`}
                className="block p-5 rounded-2xl border border-border bg-card hover:shadow-card hover:border-primary/30 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      {category.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-lg font-display font-semibold text-foreground group-hover:text-primary transition-colors">
                          {category.name_fr}
                        </h2>
                        <Badge variant="secondary" className="font-normal">
                          {category.capsuleCount} capsule{category.capsuleCount !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                        {category.description_short}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {category.capsuleCount === 0 && (
                      <Badge variant="outline" className="text-xs">
                        🌱 À découvrir
                      </Badge>
                    )}
                    {category.capsuleCount > 50 && (
                      <Badge variant="outline" className="text-xs border-amber-500/50 text-amber-600">
                        ⭐ Riche
                      </Badge>
                    )}
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Custom Categories */}
        {customCategories.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-secondary" />
              Mes catégories personnalisées
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customCategories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                >
                  <Link
                    to={`/categories/${category.slug}`}
                    className="block p-4 rounded-xl border border-border bg-card hover:shadow-card hover:border-primary/30 transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        {category.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                          {category.name_fr}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {category.capsuleCount} capsule{category.capsuleCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state prompt */}
        {totalCapsules === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="text-center py-12 px-4"
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-gold/10 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-secondary" />
            </div>
            <h2 className="text-xl font-display font-semibold text-foreground mb-2">
              Commencez à organiser vos souvenirs
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Les catégories vous aident à retrouver facilement vos capsules et à visualiser quels aspects de votre vie vous avez documentés.
            </p>
            <Button asChild className="gap-2">
              <Link to="/capsules/new">
                <Plus className="w-4 h-4" />
                Créer ma première capsule
              </Link>
            </Button>
          </motion.div>
        )}
      </main>

      <MobileBottomNav />
    </div>
  );
};

export default CategoriesPage;
