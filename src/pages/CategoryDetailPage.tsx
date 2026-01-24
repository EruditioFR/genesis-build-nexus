import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Plus, Clock, Image, Video, Music, FileText, Layers,
  MoreHorizontal, Edit, Trash2, Share2, Eye
} from 'lucide-react';
import { format } from 'date-fns';
import type { Locale } from 'date-fns';
import { fr, enUS, es, ko, zhCN } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { useAuth } from '@/hooks/useAuth';
import { useCategories, type Category, type SubCategory } from '@/hooks/useCategories';
import { supabase } from '@/integrations/supabase/client';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import CapsuleThumbnail from '@/components/capsule/CapsuleThumbnail';
import { toast } from 'sonner';

import type { Database } from '@/integrations/supabase/types';

type Capsule = Database['public']['Tables']['capsules']['Row'];
type CapsuleType = Database['public']['Enums']['capsule_type'];
type CapsuleStatus = Database['public']['Enums']['capsule_status'];

const dateLocales: Record<string, Locale> = { fr, en: enUS, es, ko, zh: zhCN };

const typeConfig: Record<CapsuleType, { icon: typeof FileText; labelKey: string; color: string }> = {
  text: { icon: FileText, labelKey: 'types.text', color: 'bg-primary/10 text-primary' },
  photo: { icon: Image, labelKey: 'types.photo', color: 'bg-secondary/10 text-secondary' },
  video: { icon: Video, labelKey: 'types.video', color: 'bg-accent/10 text-accent' },
  audio: { icon: Music, labelKey: 'types.audio', color: 'bg-navy-light/10 text-navy-light' },
  mixed: { icon: Layers, labelKey: 'types.mixed', color: 'bg-terracotta/10 text-terracotta' },
};

const statusConfigKeys: Record<CapsuleStatus, { labelKey: string; color: string }> = {
  draft: { labelKey: 'status.draft', color: 'bg-muted text-muted-foreground' },
  published: { labelKey: 'status.published', color: 'bg-green-100 text-green-700' },
  scheduled: { labelKey: 'status.scheduled', color: 'bg-blue-100 text-blue-700' },
  archived: { labelKey: 'status.archived', color: 'bg-gray-100 text-gray-600' },
};

const CategoryDetailPage = () => {
  const { t, i18n } = useTranslation('capsules');
  const { slug } = useParams<{ slug: string }>();
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { categories, getSubCategoriesForCategory, getCategoryBySlug, loading: categoriesLoading } = useCategories();
  const currentLocale = dateLocales[i18n.language] || enUS;
  
  const [profile, setProfile] = useState<{ display_name: string | null; avatar_url: string | null } | null>(null);
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState<Category | null>(null);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  
  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [capsuleToDelete, setCapsuleToDelete] = useState<Capsule | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!categoriesLoading && slug) {
      const cat = getCategoryBySlug(slug);
      if (cat) {
        setCategory(cat);
        setSubCategories(getSubCategoriesForCategory(cat.id));
      } else {
        navigate('/categories');
      }
    }
  }, [slug, categoriesLoading, getCategoryBySlug, getSubCategoriesForCategory, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !category) return;

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (profileData) setProfile(profileData);

      // Fetch capsules for this category
      const { data: capsuleCategoriesData } = await supabase
        .from('capsule_categories')
        .select('capsule_id')
        .eq('category_id', category.id);

      if (capsuleCategoriesData && capsuleCategoriesData.length > 0) {
        const capsuleIds = capsuleCategoriesData.map(cc => cc.capsule_id);
        
        const { data: capsulesData } = await supabase
          .from('capsules')
          .select('*')
          .in('id', capsuleIds)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (capsulesData) {
          setCapsules(capsulesData);
        }
      }
      
      setIsLoading(false);
    };

    if (user && category) fetchData();
  }, [user, category]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleDelete = async () => {
    if (!capsuleToDelete) return;

    const { error } = await supabase
      .from('capsules')
      .delete()
      .eq('id', capsuleToDelete.id);

    if (error) {
      toast.error('Erreur lors de la suppression');
    } else {
      setCapsules(prev => prev.filter(c => c.id !== capsuleToDelete.id));
      toast.success('Capsule supprimée');
    }
    
    setDeleteDialogOpen(false);
    setCapsuleToDelete(null);
  };

  if (authLoading || categoriesLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user || !category) return null;

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
            onClick={() => navigate('/categories')}
            className="mb-4 gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux catégories
          </Button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shadow-lg"
                style={{ backgroundColor: `${category.color}20` }}
              >
                {category.icon}
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold text-foreground">
                  {category.name_fr}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {category.description_short}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {capsules.length} capsule{capsules.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button asChild variant="outline" className="gap-2">
                <Link to={`/capsules/new?category=${category.slug}`}>
                  <Plus className="w-4 h-4" />
                  Nouvelle capsule
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Sub-categories */}
        {subCategories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mb-6"
          >
            <h2 className="text-sm font-medium text-muted-foreground mb-3">Sous-catégories suggérées</h2>
            <div className="flex flex-wrap gap-2">
              {subCategories.map((sub) => (
                <Badge key={sub.id} variant="outline" className="px-3 py-1.5">
                  {sub.name}
                </Badge>
              ))}
            </div>
          </motion.div>
        )}

        {/* Capsules Grid */}
        {capsules.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-center py-16"
          >
            <div 
              className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-5xl"
              style={{ backgroundColor: `${category.color}10` }}
            >
              {category.icon}
            </div>
            <h2 className="text-xl font-display font-semibold text-foreground mb-2">
              Aucune capsule dans cette catégorie
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {category.description_long || category.description_short}
            </p>
            <Button asChild className="gap-2">
              <Link to={`/capsules/new?category=${category.slug}`}>
                <Plus className="w-4 h-4" />
                Créer une capsule
              </Link>
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {capsules.map((capsule, index) => {
              const typeInfo = typeConfig[capsule.capsule_type];
              const statusInfo = statusConfigKeys[capsule.status];
              const Icon = typeInfo.icon;

              return (
                <motion.div
                  key={capsule.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                  className="group rounded-2xl border border-border bg-card hover:shadow-card transition-all duration-300 cursor-pointer overflow-hidden"
                  onClick={() => navigate(`/capsules/${capsule.id}`)}
                >
                  {capsule.thumbnail_url && (
                    <CapsuleThumbnail
                      thumbnailUrl={capsule.thumbnail_url}
                      fallbackIcon={null}
                      className="w-full h-32 bg-muted"
                    />
                  )}
                  
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl ${typeInfo.color} flex items-center justify-center`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2" onClick={(e) => { e.stopPropagation(); navigate(`/capsules/${capsule.id}`); }}>
                            <Eye className="w-4 h-4" />
                            Voir
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2" onClick={(e) => { e.stopPropagation(); navigate(`/capsules/${capsule.id}/edit`); }}>
                            <Edit className="w-4 h-4" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2" onClick={(e) => e.stopPropagation()}>
                            <Share2 className="w-4 h-4" />
                            Partager
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="gap-2 text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCapsuleToDelete(capsule);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <h3 className="text-lg font-display font-semibold text-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                      {capsule.title}
                    </h3>
                    
                    {capsule.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {capsule.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className={statusInfo.color}>
                        {t(statusInfo.labelKey)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(capsule.created_at), 'd MMM yyyy', { locale: currentLocale })}
                      </span>
                    </div>

                    {capsule.tags && capsule.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {capsule.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs capitalize">
                            {tag}
                          </Badge>
                        ))}
                        {capsule.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{capsule.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette capsule ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La capsule "{capsuleToDelete?.title}" et tous ses médias seront définitivement supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CategoryDetailPage;
