import { useState, useEffect, ReactNode } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, Search, Filter, Clock, ArrowLeft,
  MoreHorizontal, Edit, Trash2, Share2, Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { fr, enUS, es, ko, zhCN } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { toast } from 'sonner';
import CategoryBadge from '@/components/capsule/CategoryBadge';
import { CapsuleVisual, TypeBadge, getTypeIcon, getTypeStyles } from '@/components/capsule/CapsuleCardVisuals';
import { useCategories, type Category } from '@/hooks/useCategories';
import NoIndex from '@/components/seo/NoIndex';
import { cn } from '@/lib/utils';

import type { Database } from '@/integrations/supabase/types';

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

// --- Actions dropdown (shared between cards) ---

const CardActions = ({ capsule, onDelete, t, navigate }: {
  capsule: Capsule;
  onDelete: (capsule: Capsule) => void;
  t: (key: string) => string;
  navigate: (path: string) => void;
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 hover:bg-black/40 backdrop-blur-sm">
        <MoreHorizontal className="w-4 h-4 text-white" />
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
        onClick={(e) => { e.stopPropagation(); onDelete(capsule); }}
      >
        <Trash2 className="w-4 h-4" />
        {t('list.actions.delete')}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

// --- Status badge ---

const StatusBadge = ({ status, t }: { status: CapsuleStatus; t: (key: string) => string }) => {
  const statusConfig: Record<CapsuleStatus, { label: string; color: string }> = {
    draft: { label: t('status.draft'), color: 'bg-muted text-muted-foreground' },
    published: { label: t('status.published'), color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    scheduled: { label: t('status.scheduled'), color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    archived: { label: t('status.archived'), color: 'bg-muted text-muted-foreground' },
  };
  const info = statusConfig[status];
  return <Badge variant="outline" className={info.color}>{info.label}</Badge>;
};

// --- Featured hero card ---

const FeaturedListCard = ({ capsule, category, t, navigate, onDelete }: {
  capsule: CapsuleWithMedia;
  category?: Category;
  t: (key: string) => string;
  navigate: (path: string) => void;
  onDelete: (capsule: Capsule) => void;
}) => {
  const metadata = capsule.metadata as { youtube_id?: string } | null;
  const visualData = {
    type: capsule.capsule_type,
    thumbnail: capsule.thumbnail_url || undefined,
    content: capsule.content || undefined,
    firstMediaUrl: capsule.firstMediaUrl,
    firstVideoUrl: capsule.firstVideoUrl,
    youtubeId: metadata?.youtube_id,
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative rounded-2xl border-2 border-border bg-card overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-foreground/5 hover:-translate-y-1 hover:border-foreground/10 cursor-pointer group"
      onClick={() => navigate(`/capsules/${capsule.id}`)}
    >
      <div className="relative aspect-[16/9] sm:aspect-[2.5/1] overflow-hidden">
        <CapsuleVisual capsule={visualData} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Top bar */}
        <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <TypeBadge type={capsule.capsule_type} t={t} />
            <StatusBadge status={capsule.status} t={t} />
          </div>
          <CardActions capsule={capsule} onDelete={onDelete} t={t} navigate={navigate} />
        </div>

        {/* Bottom content */}
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
          <h3 className="font-bold text-white text-xl sm:text-2xl line-clamp-2 leading-snug mb-2 drop-shadow-lg">
            {capsule.title}
          </h3>
          {capsule.content && capsule.capsule_type === 'text' && (
            <p className="text-white/80 text-sm sm:text-base line-clamp-2 leading-relaxed mb-3 max-w-lg">
              {capsule.content.slice(0, 150)}{capsule.content.length > 150 ? '…' : ''}
            </p>
          )}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-white/70">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">
                {format(new Date(capsule.created_at), 'd MMM yyyy', { locale: getDateLocale('fr') })}
              </span>
            </div>
            {category && <CategoryBadge category={category} size="sm" showIcon />}
            {capsule.tags && capsule.tags.length > 0 && (
              <div className="flex gap-1">
                {capsule.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs capitalize bg-white/20 text-white border-0">
                    {tag}
                  </Badge>
                ))}
                {capsule.tags.length > 2 && (
                  <Badge variant="secondary" className="text-xs bg-white/20 text-white border-0">+{capsule.tags.length - 2}</Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
};

// --- Compact card ---

const CompactListCard = ({ capsule, category, index, t, navigate, onDelete }: {
  capsule: CapsuleWithMedia;
  category?: Category;
  index: number;
  t: (key: string) => string;
  navigate: (path: string) => void;
  onDelete: (capsule: Capsule) => void;
}) => {
  const Icon = getTypeIcon(capsule.capsule_type);
  const styles = getTypeStyles(capsule.capsule_type);
  const metadata = capsule.metadata as { youtube_id?: string } | null;
  const visualData = {
    type: capsule.capsule_type,
    thumbnail: capsule.thumbnail_url || undefined,
    content: capsule.content || undefined,
    firstMediaUrl: capsule.firstMediaUrl,
    firstVideoUrl: capsule.firstVideoUrl,
    youtubeId: metadata?.youtube_id,
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
      className="flex items-center gap-4 p-3 rounded-xl border border-border bg-card hover:shadow-md hover:border-foreground/10 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer group"
      onClick={() => navigate(`/capsules/${capsule.id}`)}
    >
      {/* Square thumbnail */}
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 relative">
        <CapsuleVisual capsule={visualData} iconSize="sm" />
        <div className={cn("absolute bottom-1 right-1 w-6 h-6 rounded-full flex items-center justify-center shadow-sm", styles.bg)}>
          <Icon className="w-3 h-3 text-white" />
        </div>
      </div>

      {/* Text content */}
      <div className="flex-1 min-w-0 py-1">
        <h4 className="font-semibold text-foreground text-[15px] sm:text-base line-clamp-2 leading-snug group-hover:text-primary transition-colors mb-1.5">
          {capsule.title}
        </h4>
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium">
              {format(new Date(capsule.created_at), 'd MMM yyyy', { locale: getDateLocale('fr') })}
            </span>
          </div>
          <StatusBadge status={capsule.status} t={t} />
        </div>
        {category && <CategoryBadge category={category} size="sm" showIcon />}
      </div>

      {/* Actions */}
      <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        <CardActions capsule={capsule} onDelete={onDelete} t={t} navigate={navigate} />
      </div>
    </motion.article>
  );
};

// --- Main component ---

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

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      const { data: profileData } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (profileData) setProfile(profileData);

      const { data: capsulesData, error } = await supabase
        .from('capsules')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && capsulesData) {
        const capsuleIds = capsulesData.map(c => c.id);
        
        const { data: mediasData } = await supabase
          .from('capsule_medias')
          .select('capsule_id, file_url, file_type')
          .in('capsule_id', capsuleIds)
          .order('position', { ascending: true });

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

        const capsulesWithMedia: CapsuleWithMedia[] = capsulesData.map(capsule => ({
          ...capsule,
          firstMediaUrl: firstImageMap[capsule.id],
          firstVideoUrl: firstVideoMap[capsule.id],
        }));
        setCapsules(capsulesWithMedia);
        
        if (capsulesData.length > 0) {
          const { data: categoriesData } = await supabase
            .from('capsule_categories')
            .select(`capsule_id, is_primary, category:categories(*)`)
            .in('capsule_id', capsuleIds)
            .eq('is_primary', true);

          if (categoriesData) {
            const categoryMap: Record<string, Category> = {};
            (categoriesData as any[]).forEach((item) => {
              if (item.category) categoryMap[item.capsule_id] = item.category;
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
    const { error } = await supabase.from('capsules').delete().eq('id', capsuleToDelete.id);
    if (error) {
      toast.error(t('detail.deleteError'));
    } else {
      setCapsules(prev => prev.filter(c => c.id !== capsuleToDelete.id));
      toast.success(t('detail.deleteSuccess'));
    }
    setDeleteDialogOpen(false);
    setCapsuleToDelete(null);
  };

  const openDeleteDialog = (capsule: Capsule) => {
    setCapsuleToDelete(capsule);
    setDeleteDialogOpen(true);
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

  const featured = filteredCapsules[0];
  const rest = filteredCapsules.slice(1);

  return (
    <>
      <NoIndex />
      <AuthenticatedLayout
        user={{
          id: user.id,
          email: user.email,
          displayName: profile?.display_name || undefined,
          avatarUrl: profile?.avatar_url || undefined,
        }}
        onSignOut={handleSignOut}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
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
            
            <div className="flex gap-3 overflow-x-auto">
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

        {/* Capsules - Featured + Grid */}
        {filteredCapsules.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-center py-16 px-6 rounded-2xl border-2 border-dashed border-border bg-muted/20"
          >
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-5">
              <Clock className="w-10 h-10 text-muted-foreground/50" />
            </div>
            {capsules.length === 0 ? (
              <>
                <h2 className="text-xl font-display font-semibold text-foreground mb-2">
                  {t('list.empty')}
                </h2>
                <p className="text-muted-foreground mb-6">{t('list.emptySubtitle')}</p>
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
                <p className="text-muted-foreground">{t('list.noResultsSubtitle')}</p>
              </>
            )}
          </motion.div>
        ) : (
          <div className="space-y-4">
            {/* Featured hero card */}
            <FeaturedListCard
              capsule={featured}
              category={capsuleCategories[featured.id]}
              t={t}
              navigate={(path) => navigate(path)}
              onDelete={openDeleteDialog}
            />

            {/* Grid of remaining capsules */}
            {rest.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {rest.map((capsule, index) => (
                  <CompactListCard
                    key={capsule.id}
                    capsule={capsule}
                    category={capsuleCategories[capsule.id]}
                    index={index}
                    t={t}
                    navigate={(path) => navigate(path)}
                    onDelete={openDeleteDialog}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('delete.title')}</AlertDialogTitle>
              <AlertDialogDescription>{t('delete.description')}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('delete.cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {t('delete.confirm')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      </AuthenticatedLayout>
    </>
  );
};

export default CapsulesList;
