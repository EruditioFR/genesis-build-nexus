import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, Search, Filter, Clock, Image, Video, Music, FileText, Layers,
  MoreHorizontal, Edit, Trash2, Share2, Eye, ArrowLeft
} from 'lucide-react';
import { format } from 'date-fns';
import { fr, enUS, es, ko, zhCN } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { supabase } from '@/integrations/supabase/client';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { toast } from 'sonner';
import CapsuleThumbnail from '@/components/capsule/CapsuleThumbnail';
import VideoPreviewCard from '@/components/capsule/VideoPreviewCard';
import CategoryBadge from '@/components/capsule/CategoryBadge';
import { useCategories, type Category } from '@/hooks/useCategories';
import NoIndex from '@/components/seo/NoIndex';

import type { Database } from '@/integrations/supabase/types';
import MobileBottomNav from '@/components/dashboard/MobileBottomNav';

type Capsule = Database['public']['Tables']['capsules']['Row'];
type CapsuleType = Database['public']['Enums']['capsule_type'];
type CapsuleStatus = Database['public']['Enums']['capsule_status'];

interface CapsuleWithMedia extends Capsule {
  firstMediaUrl?: string;
  firstVideoUrl?: string;
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

const CapsulesList = () => {
  const { t, i18n } = useTranslation('capsules');
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { categories } = useCategories();
  const [capsules, setCapsules] = useState<CapsuleWithMedia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<{ display_name: string | null; avatar_url: string | null } | null>(null);
  const [capsuleCategories, setCapsuleCategories] = useState<Record<string, Category>>({});
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<CapsuleType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<CapsuleStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [capsuleToDelete, setCapsuleToDelete] = useState<Capsule | null>(null);

  const typeConfig: Record<CapsuleType, { icon: typeof FileText; label: string; color: string }> = {
    text: { icon: FileText, label: t('types.text'), color: 'bg-primary/10 text-primary' },
    photo: { icon: Image, label: t('types.photo'), color: 'bg-secondary/10 text-secondary' },
    video: { icon: Video, label: t('types.video'), color: 'bg-accent/10 text-accent' },
    audio: { icon: Music, label: t('types.audio'), color: 'bg-navy-light/10 text-navy-light' },
    mixed: { icon: Layers, label: t('types.mixed'), color: 'bg-terracotta/10 text-terracotta' },
  };

  const statusConfig: Record<CapsuleStatus, { label: string; color: string }> = {
    draft: { label: t('status.draft'), color: 'bg-muted text-muted-foreground' },
    published: { label: t('status.published'), color: 'bg-green-100 text-green-700' },
    scheduled: { label: t('status.scheduled'), color: 'bg-blue-100 text-blue-700' },
    archived: { label: t('status.archived'), color: 'bg-gray-100 text-gray-600' },
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

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

      // Fetch capsules
      const { data: capsulesData, error } = await supabase
        .from('capsules')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && capsulesData) {
        const capsuleIds = capsulesData.map(c => c.id);
        
        // Fetch first media for each capsule (for photo display)
        const { data: mediasData } = await supabase
          .from('capsule_medias')
          .select('capsule_id, file_url, file_type')
          .in('capsule_id', capsuleIds)
          .order('position', { ascending: true });

        // Build map of first image and first video per capsule
        const firstImageMap: Record<string, string> = {};
        const firstVideoMap: Record<string, string> = {};
        if (mediasData) {
          mediasData.forEach((media: { capsule_id: string; file_url: string; file_type: string }) => {
            if (!firstImageMap[media.capsule_id] && media.file_type.startsWith('image/')) {
              firstImageMap[media.capsule_id] = media.file_url;
            }
            if (!firstVideoMap[media.capsule_id] && media.file_type.startsWith('video/')) {
              firstVideoMap[media.capsule_id] = media.file_url;
            }
          });
        }

        // Merge first media URLs into capsules
        const capsulesWithMedia: CapsuleWithMedia[] = capsulesData.map(capsule => ({
          ...capsule,
          firstMediaUrl: firstImageMap[capsule.id],
          firstVideoUrl: firstVideoMap[capsule.id],
        }));
        setCapsules(capsulesWithMedia);
        
        // Fetch categories for all capsules
        if (capsulesData.length > 0) {
          const { data: categoriesData } = await supabase
            .from('capsule_categories')
            .select(`
              capsule_id,
              is_primary,
              category:categories(*)
            `)
            .in('capsule_id', capsuleIds)
            .eq('is_primary', true);

          if (categoriesData) {
            const categoryMap: Record<string, Category> = {};
            (categoriesData as any[]).forEach((item) => {
              if (item.category) {
                categoryMap[item.capsule_id] = item.category;
              }
            });
            setCapsuleCategories(categoryMap);
          }
        }
      }
      setIsLoading(false);
    };

    if (user) fetchData();
  }, [user]);

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
      toast.error(t('detail.deleteError'));
    } else {
      setCapsules(prev => prev.filter(c => c.id !== capsuleToDelete.id));
      toast.success(t('detail.deleteSuccess'));
    }
    
    setDeleteDialogOpen(false);
    setCapsuleToDelete(null);
  };

  // Filter capsules
  const filteredCapsules = capsules.filter(capsule => {
    const matchesSearch = searchQuery === '' || 
      capsule.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      capsule.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      capsule.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = typeFilter === 'all' || capsule.capsule_type === typeFilter;
    const matchesStatus = statusFilter === 'all' || capsule.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || 
      (capsuleCategories[capsule.id]?.id === categoryFilter);
    
    return matchesSearch && matchesType && matchesStatus && matchesCategory;
  });

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <>
      <NoIndex />
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
            {t('backToHome')}
          </Button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold text-foreground">
                  {t('list.title')}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {t('list.count', { count: capsules.length })}
                </p>
              </div>
            </div>

            <Button asChild className="gap-2 bg-gradient-gold hover:opacity-90 text-primary-foreground shadow-gold">
              <Link to="/capsules/new">
                <Plus className="w-4 h-4" />
                {t('list.newCapsule')}
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-6 p-4 rounded-2xl border border-border bg-card"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('list.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-3">
              <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as CapsuleType | 'all')}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('list.typeFilters.all')}</SelectItem>
                  <SelectItem value="text">{t('list.typeFilters.text')}</SelectItem>
                  <SelectItem value="photo">{t('list.typeFilters.photo')}</SelectItem>
                  <SelectItem value="video">{t('list.typeFilters.video')}</SelectItem>
                  <SelectItem value="audio">{t('list.typeFilters.audio')}</SelectItem>
                  <SelectItem value="mixed">{t('list.typeFilters.mixed')}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as CapsuleStatus | 'all')}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('list.statusFilters.all')}</SelectItem>
                  <SelectItem value="draft">{t('list.statusFilters.draft')}</SelectItem>
                  <SelectItem value="published">{t('list.statusFilters.published')}</SelectItem>
                  <SelectItem value="scheduled">{t('list.statusFilters.scheduled')}</SelectItem>
                  <SelectItem value="archived">{t('list.statusFilters.archived')}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder={t('list.categoryFilters.all')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('list.categoryFilters.all')}</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <span className="flex items-center gap-2">
                        <span>{category.icon}</span>
                        <span>{category.name_fr}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        {/* Capsules Grid */}
        {filteredCapsules.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
              <Clock className="w-10 h-10 text-muted-foreground" />
            </div>
            {capsules.length === 0 ? (
              <>
                <h2 className="text-xl font-display font-semibold text-foreground mb-2">
                  {t('list.empty')}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {t('list.emptySubtitle')}
                </p>
                <Button asChild className="gap-2">
                  <Link to="/capsules/new">
                    <Plus className="w-4 h-4" />
                    {t('list.addFirst')}
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <h2 className="text-xl font-display font-semibold text-foreground mb-2">
                  {t('list.noResults')}
                </h2>
                <p className="text-muted-foreground">
                  {t('list.noResultsSubtitle')}
                </p>
              </>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCapsules.map((capsule, index) => {
              const typeInfo = typeConfig[capsule.capsule_type];
              const statusInfo = statusConfig[capsule.status];
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
                  {/* Thumbnail - Display video preview for video type, or image for others */}
                  {capsule.capsule_type === 'video' && capsule.firstVideoUrl ? (
                    <VideoPreviewCard
                      videoUrl={capsule.firstVideoUrl}
                      thumbnailUrl={capsule.thumbnail_url || capsule.firstMediaUrl}
                      className="w-full h-48 bg-muted"
                    />
                  ) : (capsule.thumbnail_url || capsule.firstMediaUrl) ? (
                    <CapsuleThumbnail
                      thumbnailUrl={capsule.thumbnail_url || capsule.firstMediaUrl || ''}
                      fallbackIcon={null}
                      className="w-full h-48 bg-muted"
                    />
                  ) : null}
                  
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
                            {t('list.actions.view')}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2" onClick={(e) => { e.stopPropagation(); navigate(`/capsules/${capsule.id}/edit`); }}>
                            <Edit className="w-4 h-4" />
                            {t('list.actions.edit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2" onClick={(e) => e.stopPropagation()}>
                            <Share2 className="w-4 h-4" />
                            {t('list.actions.share')}
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
                            {t('list.actions.delete')}
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
                        {statusInfo.label}
                      </Badge>
                      {capsuleCategories[capsule.id] && (
                        <CategoryBadge 
                          category={capsuleCategories[capsule.id]} 
                          size="sm"
                        />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(capsule.created_at), 'd MMM yyyy', { locale: getDateLocale(i18n.language) })}
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
            <AlertDialogTitle>{t('delete.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('delete.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('delete.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t('delete.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <MobileBottomNav />
    </div>
    </>
  );
};

export default CapsulesList;
