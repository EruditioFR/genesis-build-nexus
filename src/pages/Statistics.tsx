import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart3, TrendingUp, PieChart, Calendar, FolderOpen,
  Image, Video, Music, FileText, Layers, Users, MessageCircle, Folder
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart as RePieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth, parseISO, eachMonthOfInterval } from 'date-fns';
import { fr } from 'date-fns/locale';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { useCategories, type Category } from '@/hooks/useCategories';

import type { Database } from '@/integrations/supabase/types';
import MobileBottomNav from '@/components/dashboard/MobileBottomNav';

type Capsule = Database['public']['Tables']['capsules']['Row'];
type CapsuleType = Database['public']['Enums']['capsule_type'];

interface CategoryStats {
  categoryId: string;
  count: number;
}

const typeConfig: Record<CapsuleType, { label: string; color: string; icon: typeof FileText }> = {
  text: { label: 'Texte', color: '#3B82F6', icon: FileText },
  photo: { label: 'Photo', color: '#10B981', icon: Image },
  video: { label: 'Vidéo', color: '#8B5CF6', icon: Video },
  audio: { label: 'Audio', color: '#F59E0B', icon: Music },
  mixed: { label: 'Mixte', color: '#EC4899', icon: Layers },
};

const Statistics = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { categories } = useCategories();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<{ display_name: string | null; avatar_url: string | null } | null>(null);
  
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [totalMedias, setTotalMedias] = useState(0);
  const [totalComments, setTotalComments] = useState(0);
  const [totalCircles, setTotalCircles] = useState(0);
  const [totalShares, setTotalShares] = useState(0);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        const [profileRes, capsulesRes, mediasRes, commentsRes, circlesRes, sharesRes, capsuleCategoriesRes] = await Promise.all([
          supabase.from('profiles').select('display_name, avatar_url').eq('user_id', user.id).maybeSingle(),
          supabase.from('capsules').select('*').eq('user_id', user.id),
          supabase.from('capsule_medias').select('id, capsule_id'),
          supabase.from('comments').select('id, capsule_id'),
          supabase.from('circles').select('id').eq('owner_id', user.id),
          supabase.from('capsule_shares').select('id, capsule_id'),
          supabase.from('capsule_categories').select('capsule_id, category_id, is_primary'),
        ]);

        if (profileRes.data) setProfile(profileRes.data);
        if (capsulesRes.data) setCapsules(capsulesRes.data);
        
        // Count medias for user's capsules
        if (mediasRes.data && capsulesRes.data) {
          const capsuleIds = new Set(capsulesRes.data.map(c => c.id));
          setTotalMedias(mediasRes.data.filter(m => capsuleIds.has(m.capsule_id)).length);
        }
        
        // Count comments on user's capsules
        if (commentsRes.data && capsulesRes.data) {
          const capsuleIds = new Set(capsulesRes.data.map(c => c.id));
          setTotalComments(commentsRes.data.filter(c => capsuleIds.has(c.capsule_id)).length);
        }
        
        if (circlesRes.data) setTotalCircles(circlesRes.data.length);
        
        // Count shares for user's capsules
        if (sharesRes.data && capsulesRes.data) {
          const capsuleIds = new Set(capsulesRes.data.map(c => c.id));
          setTotalShares(sharesRes.data.filter(s => capsuleIds.has(s.capsule_id)).length);
        }

        // Count capsules by category (only primary categories)
        if (capsuleCategoriesRes.data && capsulesRes.data) {
          const capsuleIds = new Set(capsulesRes.data.map(c => c.id));
          const userCapsuleCategories = capsuleCategoriesRes.data.filter(
            cc => capsuleIds.has(cc.capsule_id) && cc.is_primary
          );
          
          const catCounts: Record<string, number> = {};
          userCapsuleCategories.forEach(cc => {
            catCounts[cc.category_id] = (catCounts[cc.category_id] || 0) + 1;
          });
          
          setCategoryStats(
            Object.entries(catCounts).map(([categoryId, count]) => ({ categoryId, count }))
          );
        }
      } catch (error) {
        console.error('Error fetching statistics:', error);
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

  // Calculate statistics
  const now = new Date();
  const sixMonthsAgo = subMonths(now, 5);
  const months = eachMonthOfInterval({ start: startOfMonth(sixMonthsAgo), end: endOfMonth(now) });

  // Capsules over time
  const capsulesOverTime = months.map(month => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const count = capsules.filter(c => {
      const createdAt = parseISO(c.created_at);
      return createdAt >= monthStart && createdAt <= monthEnd;
    }).length;
    return {
      month: format(month, 'MMM', { locale: fr }),
      fullMonth: format(month, 'MMMM yyyy', { locale: fr }),
      capsules: count,
    };
  });

  // Capsules by type
  const capsulesByType = Object.entries(typeConfig).map(([type, config]) => ({
    name: config.label,
    value: capsules.filter(c => c.capsule_type === type).length,
    color: config.color,
  })).filter(item => item.value > 0);

  // Capsules by status
  const capsulesByStatus = [
    { name: 'Publiées', value: capsules.filter(c => c.status === 'published').length, color: '#10B981' },
    { name: 'Brouillons', value: capsules.filter(c => c.status === 'draft').length, color: '#6B7280' },
    { name: 'Programmées', value: capsules.filter(c => c.status === 'scheduled').length, color: '#3B82F6' },
    { name: 'Archivées', value: capsules.filter(c => c.status === 'archived').length, color: '#9CA3AF' },
  ].filter(item => item.value > 0);

  // Capsules by category
  const capsulesByCategory = categoryStats
    .map(stat => {
      const category = categories.find(c => c.id === stat.categoryId);
      if (!category) return null;
      return {
        name: category.name_fr,
        value: stat.count,
        color: category.color,
        icon: category.icon,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => b.value - a.value);

  // Tags frequency
  const tagCounts: Record<string, number> = {};
  capsules.forEach(c => {
    c.tags?.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([tag, count]) => ({ tag, count }));

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
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
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-gold flex items-center justify-center shadow-gold">
              <BarChart3 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">
                Statistiques
              </h1>
              <p className="text-muted-foreground text-sm">
                Aperçu détaillé de votre activité
              </p>
            </div>
          </div>
        </motion.div>

        {/* Overview Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <FolderOpen className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{capsules.length}</p>
                  <p className="text-xs text-muted-foreground">Capsules</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Image className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalMedias}</p>
                  <p className="text-xs text-muted-foreground">Médias</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalCircles}</p>
                  <p className="text-xs text-muted-foreground">Cercles</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalComments}</p>
                  <p className="text-xs text-muted-foreground">Commentaires</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Charts */}
        <Tabs defaultValue="evolution" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="evolution" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Évolution
            </TabsTrigger>
            <TabsTrigger value="repartition" className="gap-2">
              <PieChart className="w-4 h-4" />
              Répartition
            </TabsTrigger>
            <TabsTrigger value="tags" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Tags
            </TabsTrigger>
          </TabsList>

          <TabsContent value="evolution">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-secondary" />
                    Capsules créées par mois
                  </CardTitle>
                  <CardDescription>
                    Évolution de votre activité sur les 6 derniers mois
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={capsulesOverTime}>
                        <defs>
                          <linearGradient id="colorCapsules" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--popover))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                          labelFormatter={(_, payload) => payload?.[0]?.payload?.fullMonth || ''}
                        />
                        <Area
                          type="monotone"
                          dataKey="capsules"
                          stroke="hsl(var(--secondary))"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorCapsules)"
                          name="Capsules"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="repartition">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="grid md:grid-cols-2 gap-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-secondary" />
                    Par type
                  </CardTitle>
                  <CardDescription>
                    Distribution de vos capsules par type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    {capsulesByType.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <RePieChart>
                          <Pie
                            data={capsulesByType}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {capsulesByType.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'hsl(var(--popover))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px',
                            }}
                          />
                          <Legend />
                        </RePieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        Aucune donnée
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-secondary" />
                    Par statut
                  </CardTitle>
                  <CardDescription>
                    Distribution de vos capsules par statut
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    {capsulesByStatus.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <RePieChart>
                          <Pie
                            data={capsulesByStatus}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {capsulesByStatus.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'hsl(var(--popover))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px',
                            }}
                          />
                          <Legend />
                        </RePieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        Aucune donnée
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Category distribution chart */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Folder className="w-5 h-5 text-secondary" />
                    Par catégorie
                  </CardTitle>
                  <CardDescription>
                    Distribution de vos capsules par catégorie principale
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {capsulesByCategory.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={capsulesByCategory} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                          <YAxis 
                            type="category" 
                            dataKey="name" 
                            stroke="hsl(var(--muted-foreground))" 
                            fontSize={12} 
                            width={120}
                            tickFormatter={(value, index) => {
                              const item = capsulesByCategory[index];
                              return item ? `${item.icon} ${value}` : value;
                            }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'hsl(var(--popover))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px',
                            }}
                            formatter={(value: number) => [`${value} capsule${value > 1 ? 's' : ''}`, 'Nombre']}
                          />
                          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                            {capsulesByCategory.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                        <Folder className="w-12 h-12 opacity-30" />
                        <p>Aucune capsule catégorisée</p>
                        <p className="text-sm">Assignez des catégories à vos capsules pour voir les statistiques</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="tags">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-secondary" />
                    Tags les plus utilisés
                  </CardTitle>
                  <CardDescription>
                    Fréquence d'utilisation de vos tags
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {topTags.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topTags} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                          <YAxis dataKey="tag" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={100} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'hsl(var(--popover))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px',
                            }}
                          />
                          <Bar dataKey="count" fill="hsl(var(--secondary))" radius={[0, 4, 4, 0]} name="Utilisations" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        Aucun tag utilisé
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Additional Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-8 grid md:grid-cols-3 gap-4"
        >
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-1">Capsules publiées</p>
              <p className="text-3xl font-bold text-foreground">
                {capsules.filter(c => c.status === 'published').length}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                sur {capsules.length} au total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-1">Capsules partagées</p>
              <p className="text-3xl font-bold text-foreground">{totalShares}</p>
              <p className="text-xs text-muted-foreground mt-1">
                partages avec vos cercles
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-1">Tags uniques</p>
              <p className="text-3xl font-bold text-foreground">
                {Object.keys(tagCounts).length}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                pour organiser vos souvenirs
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <MobileBottomNav />
    </div>
  );
};

export default Statistics;
