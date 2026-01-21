import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  ArrowLeft, Edit, Share2, Trash2, Clock, Image, Video, Music,
  FileText, Layers, Tag, Calendar, MoreHorizontal, Users, Download, FileDown, FolderArchive, Play, Folder, CalendarHeart, ImagePlus
} from 'lucide-react';

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
import { supabase } from '@/integrations/supabase/client';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import MediaGallery from '@/components/capsule/MediaGallery';
import CommentsSection from '@/components/capsule/CommentsSection';
import ShareCapsuleDialog from '@/components/circles/ShareCapsuleDialog';
import StoryViewer from '@/components/story/StoryViewer';
import { useStoryMode } from '@/hooks/useStoryMode';
import { exportCapsuleToPDF, exportCapsuleToZIP } from '@/lib/exportCapsule';
import { toast } from 'sonner';
import CategoryBadge from '@/components/capsule/CategoryBadge';
import SubCategoryBadge from '@/components/capsule/SubCategoryBadge';
import type { Category, CapsuleCategory, SubCategory } from '@/hooks/useCategories';
import NoIndex from '@/components/seo/NoIndex';

import type { Database } from '@/integrations/supabase/types';
import MobileBottomNav from '@/components/dashboard/MobileBottomNav';
import HeaderImageSelector from '@/components/capsule/HeaderImageSelector';

type Capsule = Database['public']['Tables']['capsules']['Row'];
type CapsuleType = Database['public']['Enums']['capsule_type'];
type CapsuleStatus = Database['public']['Enums']['capsule_status'];

interface Media {
  id: string;
  file_url: string;
  file_type: string;
  file_name: string | null;
  caption: string | null;
}

interface SharedCircle {
  id: string;
  name: string;
  color: string | null;
}

interface CapsuleSubCategoryWithData {
  id: string;
  sub_category: SubCategory;
}

const typeConfig: Record<CapsuleType, { icon: typeof FileText; label: string; color: string }> = {
  text: { icon: FileText, label: 'Texte', color: 'bg-primary/10 text-primary' },
  photo: { icon: Image, label: 'Photo', color: 'bg-secondary/10 text-secondary' },
  video: { icon: Video, label: 'Vidéo', color: 'bg-accent/10 text-accent' },
  audio: { icon: Music, label: 'Audio', color: 'bg-navy-light/10 text-navy-light' },
  mixed: { icon: Layers, label: 'Mixte', color: 'bg-terracotta/10 text-terracotta' },
};

const statusConfig: Record<CapsuleStatus, { label: string; color: string }> = {
  draft: { label: 'Brouillon', color: 'bg-muted text-muted-foreground' },
  published: { label: 'Publiée', color: 'bg-green-100 text-green-700' },
  scheduled: { label: 'Programmée', color: 'bg-blue-100 text-blue-700' },
  archived: { label: 'Archivée', color: 'bg-gray-100 text-gray-600' },
};

const CapsuleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  const [capsule, setCapsule] = useState<Capsule | null>(null);
  const [medias, setMedias] = useState<Media[]>([]);
  const [sharedCircles, setSharedCircles] = useState<SharedCircle[]>([]);
  const [capsuleCategories, setCapsuleCategories] = useState<CapsuleCategory[]>([]);
  const [capsuleSubCategories, setCapsuleSubCategories] = useState<CapsuleSubCategoryWithData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<{ display_name: string | null; avatar_url: string | null } | null>(null);


  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);
  const [headerSelectorOpen, setHeaderSelectorOpen] = useState(false);

  // Parallax effect for hero image
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroScale = useTransform(scrollY, [0, 500], [1, 1.1]);

  // Story mode
  const { isOpen: storyOpen, items: storyItems, initialIndex, loading: storyLoading, openStory, closeStory } = useStoryMode();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !id) return;

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileData) setProfile(profileData);

      // Fetch capsule
      const { data: capsuleData, error: capsuleError } = await supabase
        .from('capsules')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (capsuleError || !capsuleData) {
        toast.error('Souvenir introuvable');
        navigate('/capsules');
        return;
      }

      setCapsule(capsuleData);

      // Fetch medias
      const { data: mediasData } = await supabase
        .from('capsule_medias')
        .select('id, file_url, file_type, file_name, caption')
        .eq('capsule_id', id)
        .order('position', { ascending: true });

      if (mediasData) setMedias(mediasData);

      // Fetch shared circles
      const { data: sharesData } = await supabase
        .from('capsule_shares')
        .select('circle_id')
        .eq('capsule_id', id);

      if (sharesData && sharesData.length > 0) {
        const circleIds = sharesData.map(s => s.circle_id);
        const { data: circlesData } = await supabase
          .from('circles')
          .select('id, name, color')
          .in('id', circleIds);

        if (circlesData) setSharedCircles(circlesData);
      }

      // Fetch capsule categories
      const { data: categoriesData } = await supabase
        .from('capsule_categories')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('capsule_id', id);

      if (categoriesData) {
        setCapsuleCategories(categoriesData.map(item => ({
          ...item,
          category: item.category as Category
        })));
      }

      // Fetch capsule sub-categories
      const { data: subCategoriesData } = await supabase
        .from('capsule_sub_categories')
        .select(`
          id,
          sub_category:sub_categories(*)
        `)
        .eq('capsule_id', id);

      if (subCategoriesData) {
        setCapsuleSubCategories(subCategoriesData.map(item => ({
          id: item.id,
          sub_category: item.sub_category as SubCategory
        })));
      }

      setIsLoading(false);
    };

    if (user && id) fetchData();
  }, [user, id, navigate]);

  // Load hero image URL - prioritize thumbnail_url, then first image
  useEffect(() => {
    const loadHeroImage = async () => {
      const { getSignedUrl } = await import('@/lib/signedUrlCache');
      
      // First try thumbnail_url (manually selected header)
      if (capsule?.thumbnail_url) {
        const url = await getSignedUrl('capsule-medias', capsule.thumbnail_url, 3600);
        setHeroImageUrl(url);
        return;
      }
      
      // Fallback to first image in medias
      const heroMedia = medias.find(m => m.file_type.startsWith('image/'));
      if (heroMedia) {
        const url = await getSignedUrl('capsule-medias', heroMedia.file_url, 3600);
        setHeroImageUrl(url);
      } else {
        setHeroImageUrl(null);
      }
    };
    loadHeroImage();
  }, [medias, capsule?.thumbnail_url]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleDelete = async () => {
    if (!capsule) return;

    const { error } = await supabase
      .from('capsules')
      .delete()
      .eq('id', capsule.id);

    if (error) {
      toast.error('Erreur lors de la suppression');
    } else {
      toast.success('Souvenir supprimé');
      navigate('/capsules');
    }

    setDeleteDialogOpen(false);
  };

  const refreshShares = async () => {
    if (!id) return;

    const { data: sharesData } = await supabase
      .from('capsule_shares')
      .select('circle_id')
      .eq('capsule_id', id);

    if (sharesData && sharesData.length > 0) {
      const circleIds = sharesData.map(s => s.circle_id);
      const { data: circlesData } = await supabase
        .from('circles')
        .select('id, name, color')
        .in('id', circleIds);

      if (circlesData) setSharedCircles(circlesData);
    } else {
      setSharedCircles([]);
    }
  };

  const handleExportPDF = async () => {
    if (!capsule) return;
    setIsExporting(true);
    try {
      await exportCapsuleToPDF(capsule, medias, sharedCircles);
      toast.success('Souvenir exporté en PDF');
    } catch (error) {
      console.error('Export PDF error:', error);
      toast.error('Erreur lors de l\'export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportZIP = async () => {
    if (!capsule) return;
    setIsExporting(true);
    try {
      // Fetch comments for export
      const { data: commentsData } = await supabase
        .from('comments')
        .select('id, content, created_at, user_id')
        .eq('capsule_id', capsule.id)
        .order('created_at', { ascending: true });

      // Fetch user profiles for comment authors
      let commentsWithNames: Array<{
        id: string;
        content: string;
        created_at: string;
        user_name: string | null;
      }> = [];

      if (commentsData && commentsData.length > 0) {
        const userIds = [...new Set(commentsData.map(c => c.user_id))];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, display_name')
          .in('user_id', userIds);

        const profilesMap = new Map(profilesData?.map(p => [p.user_id, p.display_name]) || []);

        commentsWithNames = commentsData.map(c => ({
          id: c.id,
          content: c.content,
          created_at: c.created_at,
          user_name: profilesMap.get(c.user_id) || null,
        }));
      }

      await exportCapsuleToZIP(capsule, medias, sharedCircles, commentsWithNames);
      toast.success('Souvenir exporté en ZIP');
    } catch (error) {
      console.error('Export ZIP error:', error);
      toast.error('Erreur lors de l\'export ZIP');
    } finally {
      setIsExporting(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Chargement du souvenir...</p>
        </div>
      </div>
    );
  }

  if (!user || !capsule) return null;

  const typeInfo = typeConfig[capsule.capsule_type];
  const statusInfo = statusConfig[capsule.status];
  const Icon = typeInfo.icon;

  // Get hero image from medias (first image)
  const heroImage = medias.find(m => m.file_type.startsWith('image/'));

  return (
    <>
      <NoIndex />
      {/* Story Viewer Modal */}
      <AnimatePresence>
        {storyOpen && storyItems.length > 0 && (
          <StoryViewer
            items={storyItems}
            initialIndex={initialIndex}
            onClose={closeStory}
            autoPlay
          />
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-background pb-24 md:pb-0">
        <DashboardHeader
          user={{
            id: user.id,
            email: user.email,
            displayName: profile?.display_name || undefined,
            avatarUrl: profile?.avatar_url || undefined,
          }}
          onSignOut={handleSignOut}
        />

        {/* Hero Section with Image and Parallax Effect */}
        <div className="relative" ref={heroRef}>
          {heroImageUrl ? (
            <div className="relative h-64 sm:h-80 md:h-96 overflow-hidden">
              <motion.img
                src={heroImageUrl}
                alt={capsule.title}
                className="w-full h-full object-cover"
                style={{ 
                  y: heroY, 
                  scale: heroScale,
                  transformOrigin: 'center center'
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              
              {/* Back button on hero */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/capsules')}
                className="absolute top-4 left-4 gap-2 text-white/90 hover:text-white hover:bg-white/20 backdrop-blur-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour
              </Button>

              {/* Actions on hero */}
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setHeaderSelectorOpen(true)}
                  className="text-white/90 hover:text-white hover:bg-white/20 backdrop-blur-sm"
                  title="Changer l'image d'en-tête"
                >
                  <ImagePlus className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShareDialogOpen(true)}
                  className="text-white/90 hover:text-white hover:bg-white/20 backdrop-blur-sm"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      disabled={isExporting}
                      className="text-white/90 hover:text-white hover:bg-white/20 backdrop-blur-sm"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild className="gap-2">
                      <Link to={`/capsules/${capsule.id}/edit`}>
                        <Edit className="w-4 h-4" />
                        Modifier
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="gap-2" onClick={handleExportPDF} disabled={isExporting}>
                      <FileDown className="w-4 h-4" />
                      Exporter en PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2" onClick={handleExportZIP} disabled={isExporting}>
                      <FolderArchive className="w-4 h-4" />
                      Exporter en ZIP
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="gap-2 text-destructive"
                      onClick={() => setDeleteDialogOpen(true)}
                    >
                      <Trash2 className="w-4 h-4" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Title overlay on hero */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <div className="max-w-4xl mx-auto">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge className={`${statusInfo.color} backdrop-blur-sm`}>{statusInfo.label}</Badge>
                      {capsuleCategories.map((cc) => cc.category && (
                        <CategoryBadge 
                          key={cc.id} 
                          category={cc.category} 
                          isPrimary={cc.is_primary}
                          size="sm"
                        />
                      ))}
                    </div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-white mb-2 drop-shadow-lg">
                      {capsule.title}
                    </h1>
                    {capsule.memory_date && (
                      <p className="text-lg text-white/90 font-medium flex items-center gap-2">
                        <CalendarHeart className="w-5 h-5" />
                        {capsule.memory_date_precision === 'year' ? (
                          format(new Date(capsule.memory_date), 'yyyy', { locale: fr })
                        ) : capsule.memory_date_precision === 'month' ? (
                          format(new Date(capsule.memory_date), 'MMMM yyyy', { locale: fr })
                        ) : capsule.memory_date_precision === 'range' && capsule.memory_date_year_end ? (
                          `${format(new Date(capsule.memory_date), 'yyyy', { locale: fr })} - ${capsule.memory_date_year_end}`
                        ) : (
                          format(new Date(capsule.memory_date), 'd MMMM yyyy', { locale: fr })
                        )}
                      </p>
                    )}
                  </motion.div>
                </div>
              </div>
            </div>
          ) : (
            /* Fallback header without image */
            <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 pt-4 pb-8 px-4">
              <div className="max-w-4xl mx-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/capsules')}
                  className="mb-4 gap-2 text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour aux souvenirs
                </Button>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-xl ${typeInfo.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
                        {capsule.title}
                      </h1>
                      {capsule.memory_date && (
                        <p className="text-lg text-secondary font-medium flex items-center gap-2 mt-1 mb-3">
                          <CalendarHeart className="w-5 h-5" />
                          {capsule.memory_date_precision === 'year' ? (
                            format(new Date(capsule.memory_date), 'yyyy', { locale: fr })
                          ) : capsule.memory_date_precision === 'month' ? (
                            format(new Date(capsule.memory_date), 'MMMM yyyy', { locale: fr })
                          ) : capsule.memory_date_precision === 'range' && capsule.memory_date_year_end ? (
                            `${format(new Date(capsule.memory_date), 'yyyy', { locale: fr })} - ${capsule.memory_date_year_end}`
                          ) : (
                            format(new Date(capsule.memory_date), 'd MMMM yyyy', { locale: fr })
                          )}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                        {capsuleCategories.map((cc) => cc.category && (
                          <CategoryBadge 
                            key={cc.id} 
                            category={cc.category} 
                            isPrimary={cc.is_primary}
                            size="sm"
                          />
                        ))}
                        {capsuleSubCategories.map((csc) => csc.sub_category && (
                          <SubCategoryBadge 
                            key={csc.id} 
                            subCategory={csc.sub_category} 
                            size="sm"
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setHeaderSelectorOpen(true)}
                      title="Ajouter une image d'en-tête"
                    >
                      <ImagePlus className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShareDialogOpen(true)}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" disabled={isExporting}>
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild className="gap-2">
                          <Link to={`/capsules/${capsule.id}/edit`}>
                            <Edit className="w-4 h-4" />
                            Modifier
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2" onClick={handleExportPDF} disabled={isExporting}>
                          <FileDown className="w-4 h-4" />
                          Exporter en PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2" onClick={handleExportZIP} disabled={isExporting}>
                          <FolderArchive className="w-4 h-4" />
                          Exporter en ZIP
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="gap-2 text-destructive"
                          onClick={() => setDeleteDialogOpen(true)}
                        >
                          <Trash2 className="w-4 h-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </motion.div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Main Column */}
            <div className="md:col-span-2 space-y-6">
              {/* Description */}
              {capsule.description && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="prose prose-lg max-w-none"
                >
                  <p className="text-foreground text-lg leading-relaxed">{capsule.description}</p>
                </motion.div>
              )}

              {/* Content (for text capsules) */}
              {capsule.content && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 }}
                  className="p-6 rounded-2xl bg-muted/50 border-l-4 border-secondary"
                >
                  <p className="text-foreground whitespace-pre-wrap leading-relaxed">{capsule.content}</p>
                </motion.div>
              )}

              {/* Media Gallery */}
              {medias.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <Image className="w-5 h-5 text-secondary" />
                      Médias
                      <span className="text-sm font-normal text-muted-foreground">({medias.length})</span>
                    </h2>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => capsule && openStory([capsule])}
                      disabled={storyLoading}
                      className="gap-2"
                    >
                      <Play className="w-4 h-4" />
                      {storyLoading ? 'Chargement...' : 'Diaporama'}
                    </Button>
                  </div>
                  <MediaGallery 
                    medias={medias} 
                    capsuleId={capsule.id}
                    thumbnailUrl={capsule.thumbnail_url}
                    onThumbnailChange={(url) => setCapsule(prev => prev ? { ...prev, thumbnail_url: url } : null)}
                  />
                </motion.div>
              )}

              {/* Comments Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.35 }}
              >
                <CommentsSection capsuleId={capsule.id} currentUserId={user.id} />
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Info Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="p-5 rounded-2xl border border-border bg-card"
              >
                <div className="space-y-4">
                  {/* Type */}
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${typeInfo.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Type</p>
                      <p className="font-medium text-foreground">{typeInfo.label}</p>
                    </div>
                  </div>

                  {/* Created date */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Créé le</p>
                      <p className="font-medium text-foreground">
                        {format(new Date(capsule.created_at), 'd MMM yyyy', { locale: fr })}
                      </p>
                    </div>
                  </div>

                  {/* Sub-categories */}
                  {capsuleSubCategories.length > 0 && (
                    <div className="pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-2">Sous-catégories</p>
                      <div className="flex flex-wrap gap-1.5">
                        {capsuleSubCategories.map((csc) => csc.sub_category && (
                          <SubCategoryBadge 
                            key={csc.id} 
                            subCategory={csc.sub_category} 
                            size="sm"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Tags */}
              {capsule.tags && capsule.tags.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.25 }}
                  className="p-5 rounded-2xl border border-border bg-card"
                >
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Mots-clés
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {capsule.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="capitalize">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Shared with */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="p-5 rounded-2xl border border-border bg-card"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Partagé avec
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => setShareDialogOpen(true)} className="h-7 px-2 text-xs">
                    Gérer
                  </Button>
                </div>

                {sharedCircles.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    Aucun partage
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {sharedCircles.map((circle) => (
                      <Badge
                        key={circle.id}
                        variant="outline"
                        className="gap-1.5"
                      >
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: circle.color || '#1E3A5F' }}
                        />
                        {circle.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </main>

      {/* Share Dialog */}
      <ShareCapsuleDialog
        open={shareDialogOpen}
        onOpenChange={(open) => {
          setShareDialogOpen(open);
          if (!open) refreshShares();
        }}
        capsuleId={capsule.id}
        capsuleTitle={capsule.title}
        userId={user.id}
      />

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette capsule ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La capsule "{capsule.title}" et tous ses médias seront définitivement supprimés.
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

      {/* Header Image Selector */}
      <HeaderImageSelector
        open={headerSelectorOpen}
        onOpenChange={setHeaderSelectorOpen}
        capsuleId={capsule.id}
        medias={medias}
        currentHeaderUrl={capsule.thumbnail_url}
        onHeaderChange={(url) => {
          setCapsule(prev => prev ? { ...prev, thumbnail_url: url } : null);
        }}
      />

      <MobileBottomNav />
    </div>
    </>
  );
};

export default CapsuleDetail;
