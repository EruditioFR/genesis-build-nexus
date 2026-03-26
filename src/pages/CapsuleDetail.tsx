import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { format } from 'date-fns';
import { fr, enUS, es, ko, zhCN } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, Edit, Share2, Trash2, Clock, Image, Video, Music,
  FileText, Layers, Tag, Calendar, MoreHorizontal, Users, Download, FileDown, FolderArchive, Play, Folder, CalendarHeart, ImagePlus } from
'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger } from
'@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle } from
'@/components/ui/alert-dialog';

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
import EmotionReactions from '@/components/capsule/EmotionReactions';
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

const getDateLocale = (lang: string) => {
  switch (lang) {
    case 'en':return enUS;
    case 'es':return es;
    case 'ko':return ko;
    case 'zh':return zhCN;
    default:return fr;
  }
};

const CapsuleDetail = () => {
  const { t, i18n } = useTranslation('capsules');
  const { id } = useParams<{id: string;}>();
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  const [capsule, setCapsule] = useState<Capsule | null>(null);
  const [medias, setMedias] = useState<Media[]>([]);
  const [sharedCircles, setSharedCircles] = useState<SharedCircle[]>([]);
  const [capsuleCategories, setCapsuleCategories] = useState<CapsuleCategory[]>([]);
  const [capsuleSubCategories, setCapsuleSubCategories] = useState<CapsuleSubCategoryWithData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<{display_name: string | null;avatar_url: string | null;} | null>(null);
  const [ownerProfile, setOwnerProfile] = useState<{display_name: string | null;} | null>(null);

  // Check if user is the owner of the capsule
  const isOwner = capsule?.user_id === user?.id;

  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [heroImageUrls, setHeroImageUrls] = useState<string[]>([]);
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);
  const [headerSelectorOpen, setHeaderSelectorOpen] = useState(false);
  const [heroIsPortrait, setHeroIsPortrait] = useState<Record<number, boolean>>({});

  // Parallax effect for hero image
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroScale = useTransform(scrollY, [0, 500], [1, 1.1]);

  // Story mode
  const { isOpen: storyOpen, items: storyItems, audioTracks: storyAudioTracks, initialIndex, loading: storyLoading, openStory, closeStory } = useStoryMode();

  const typeConfig: Record<CapsuleType, {icon: typeof FileText;label: string;color: string;}> = {
    text: { icon: FileText, label: t('types.text'), color: 'bg-primary/10 text-primary' },
    photo: { icon: Image, label: t('types.photo'), color: 'bg-secondary/10 text-secondary' },
    video: { icon: Video, label: t('types.video'), color: 'bg-accent/10 text-accent' },
    audio: { icon: Music, label: t('types.audio'), color: 'bg-navy-light/10 text-navy-light' },
    mixed: { icon: Layers, label: t('types.mixed'), color: 'bg-terracotta/10 text-terracotta' }
  };

  const statusConfig: Record<CapsuleStatus, {label: string;color: string;}> = {
    draft: { label: t('status.draft'), color: 'bg-muted text-muted-foreground' },
    published: { label: t('status.published'), color: 'bg-green-100 text-green-700' },
    scheduled: { label: t('status.scheduled'), color: 'bg-blue-100 text-blue-700' },
    archived: { label: t('status.archived'), color: 'bg-gray-100 text-gray-600' }
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !id) return;

      // Fetch profile
      const { data: profileData } = await supabase.
      from('profiles').
      select('display_name, avatar_url').
      eq('user_id', user.id).
      maybeSingle();

      if (profileData) setProfile(profileData);

      // Fetch capsule
      const { data: capsuleData, error: capsuleError } = await supabase.
      from('capsules').
      select('*').
      eq('id', id).
      maybeSingle();

      if (capsuleError || !capsuleData) {
        toast.error(t('notFound'));
        navigate('/capsules');
        return;
      }

      setCapsule(capsuleData);

      // If not owner, fetch owner's profile
      if (capsuleData.user_id !== user.id) {
        const { data: ownerData } = await supabase.
        from('profiles').
        select('display_name').
        eq('user_id', capsuleData.user_id).
        maybeSingle();

        if (ownerData) setOwnerProfile(ownerData);
      }

      // Fetch medias
      const { data: mediasData } = await supabase.
      from('capsule_medias').
      select('id, file_url, file_type, file_name, caption').
      eq('capsule_id', id).
      order('position', { ascending: true });

      if (mediasData) setMedias(mediasData);

      // Fetch shared circles
      const { data: sharesData } = await supabase.
      from('capsule_shares').
      select('circle_id').
      eq('capsule_id', id);

      if (sharesData && sharesData.length > 0) {
        const circleIds = sharesData.map((s) => s.circle_id);
        const { data: circlesData } = await supabase.
        from('circles').
        select('id, name, color').
        in('id', circleIds);

        if (circlesData) setSharedCircles(circlesData);
      }

      // Fetch capsule categories
      const { data: categoriesData } = await supabase.
      from('capsule_categories').
      select(`
          *,
          category:categories(*)
        `).
      eq('capsule_id', id);

      if (categoriesData) {
        setCapsuleCategories(categoriesData.map((item) => ({
          ...item,
          category: item.category as Category
        })));
      }

      // Fetch capsule sub-categories
      const { data: subCategoriesData } = await supabase.
      from('capsule_sub_categories').
      select(`
          id,
          sub_category:sub_categories(*)
        `).
      eq('capsule_id', id);

      if (subCategoriesData) {
        setCapsuleSubCategories(subCategoriesData.map((item) => ({
          id: item.id,
          sub_category: item.sub_category as SubCategory
        })));
      }

      setIsLoading(false);
    };

    if (user && id) fetchData();
  }, [user, id, navigate, t]);

  // Load hero image URLs - all images for slider
  useEffect(() => {
    const loadHeroImages = async () => {
      const { getSignedUrl } = await import('@/lib/signedUrlCache');
      const imageMedias = medias.filter((m) => m.file_type.startsWith('image/'));
      
      if (imageMedias.length === 0) {
        setHeroImageUrls([]);
        return;
      }

      const urls: string[] = [];
      
      // If thumbnail is set, put it first
      if (capsule?.thumbnail_url) {
        const thumbUrl = await getSignedUrl('capsule-medias', capsule.thumbnail_url, 3600);
        if (thumbUrl) urls.push(thumbUrl);
      }

      for (const media of imageMedias) {
        // Skip if already added as thumbnail
        if (capsule?.thumbnail_url && media.file_url === capsule.thumbnail_url) continue;
        const url = await getSignedUrl('capsule-medias', media.file_url, 3600);
        if (url) urls.push(url);
      }

      setHeroImageUrls(urls);
    };
    loadHeroImages();
  }, [medias, capsule?.thumbnail_url]);

  // Detect portrait images
  useEffect(() => {
    heroImageUrls.forEach((url, idx) => {
      const img = new window.Image();
      img.onload = () => {
        setHeroIsPortrait((prev) => ({ ...prev, [idx]: img.naturalHeight > img.naturalWidth }));
      };
      img.src = url;
    });
  }, [heroImageUrls]);

  // Auto-advance hero slider
  useEffect(() => {
    if (heroImageUrls.length <= 1) return;
    const interval = setInterval(() => {
      setHeroSlideIndex((prev) => (prev + 1) % heroImageUrls.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImageUrls.length]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleDelete = async () => {
    if (!capsule) return;

    const { error } = await supabase.
    from('capsules').
    delete().
    eq('id', capsule.id);

    if (error) {
      toast.error(t('detail.deleteError'));
    } else {
      toast.success(t('detail.deleteSuccess'));
      navigate('/capsules');
    }

    setDeleteDialogOpen(false);
  };

  const refreshShares = async () => {
    if (!id) return;

    const { data: sharesData } = await supabase.
    from('capsule_shares').
    select('circle_id').
    eq('capsule_id', id);

    if (sharesData && sharesData.length > 0) {
      const circleIds = sharesData.map((s) => s.circle_id);
      const { data: circlesData } = await supabase.
      from('circles').
      select('id, name, color').
      in('id', circleIds);

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
      toast.success(t('detail.exportSuccess') + ' PDF');
    } catch (error) {
      console.error('Export PDF error:', error);
      toast.error(t('detail.exportError') + ' PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportZIP = async () => {
    if (!capsule) return;
    setIsExporting(true);
    try {
      // Fetch comments for export
      const { data: commentsData } = await supabase.
      from('comments').
      select('id, content, created_at, user_id').
      eq('capsule_id', capsule.id).
      order('created_at', { ascending: true });

      // Fetch user profiles for comment authors
      let commentsWithNames: Array<{
        id: string;
        content: string;
        created_at: string;
        user_name: string | null;
      }> = [];

      if (commentsData && commentsData.length > 0) {
        const userIds = [...new Set(commentsData.map((c) => c.user_id))];
        const { data: profilesData } = await supabase.
        from('profiles').
        select('user_id, display_name').
        in('user_id', userIds);

        const profilesMap = new Map(profilesData?.map((p) => [p.user_id, p.display_name]) || []);

        commentsWithNames = commentsData.map((c) => ({
          id: c.id,
          content: c.content,
          created_at: c.created_at,
          user_name: profilesMap.get(c.user_id) || null
        }));
      }

      await exportCapsuleToZIP(capsule, medias, sharedCircles, commentsWithNames);
      toast.success(t('detail.exportSuccess') + ' ZIP');
    } catch (error) {
      console.error('Export ZIP error:', error);
      toast.error(t('detail.exportError') + ' ZIP');
    } finally {
      setIsExporting(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">{t('loadingSingle')}</p>
        </div>
      </div>);

  }

  if (!user || !capsule) return null;

  const typeInfo = typeConfig[capsule.capsule_type];
  const statusInfo = statusConfig[capsule.status];
  const Icon = typeInfo.icon;
  const dateLocale = getDateLocale(i18n.language);

  // Get hero image from medias (first image)
  const heroImage = medias.find((m) => m.file_type.startsWith('image/'));

  return (
    <>
      <NoIndex />
      {/* Story Viewer Modal */}
      <AnimatePresence>
        {storyOpen && storyItems.length > 0 &&
        <StoryViewer
          items={storyItems}
          initialIndex={initialIndex}
          onClose={closeStory}
          autoPlay
          audioTracks={storyAudioTracks} />

        }
      </AnimatePresence>

      <div className="min-h-screen bg-background pb-24 md:pb-0">
        <DashboardHeader
          user={{
            id: user.id,
            email: user.email,
            displayName: profile?.display_name || undefined,
            avatarUrl: profile?.avatar_url || undefined
          }}
          onSignOut={handleSignOut} />
        

        {/* Hero Section with Image Slider and Parallax Effect */}
        <div className="relative" ref={heroRef}>
          {heroImageUrls.length > 0 ?
           <div className="relative h-64 sm:h-80 md:h-96 overflow-hidden">
              {/* Blurred background for portrait images */}
              {heroIsPortrait[heroSlideIndex] && (
                <img
                  src={heroImageUrls[heroSlideIndex]}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-40"
                />
              )}
              <AnimatePresence mode="wait">
                <motion.img
                key={heroSlideIndex}
                src={heroImageUrls[heroSlideIndex]}
                alt={capsule.title}
                className={heroIsPortrait[heroSlideIndex]
                  ? "absolute inset-0 h-full object-contain mx-auto z-[1]"
                  : "absolute inset-0 w-full h-full object-cover object-[center_25%]"
                }
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
                style={{
                  y: heroY,
                  scale: heroScale,
                  transformOrigin: 'center center'
                }} />
              </AnimatePresence>
            
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-[2]" />



              
              {/* Back button on hero */}
              <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/capsules')}
              className="absolute top-4 left-4 gap-2 text-white/90 hover:text-white hover:bg-white/20 backdrop-blur-sm z-[3]">
              
                <ArrowLeft className="w-4 h-4" />
                {t('backToList')}
              </Button>

              {/* Actions on hero - only for owner */}
              {isOwner &&
            <div className="absolute top-4 right-4 flex gap-2">
                  <Button
                variant="ghost"
                size="icon"
                onClick={() => setHeaderSelectorOpen(true)}
                className="text-white/90 hover:text-white hover:bg-white/20 backdrop-blur-sm"
                title={t('detail.changeHeaderImage')}>
                
                    <ImagePlus className="w-4 h-4" />
                  </Button>
                  <Button
                variant="ghost"
                size="icon"
                onClick={() => setShareDialogOpen(true)}
                className="text-white/90 hover:text-white hover:bg-white/20 backdrop-blur-sm">
                
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                    variant="ghost"
                    size="icon"
                    disabled={isExporting}
                    className="text-white/90 hover:text-white hover:bg-white/20 backdrop-blur-sm">
                    
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild className="gap-2">
                        <Link to={`/capsules/${capsule.id}/edit`}>
                          <Edit className="w-4 h-4" />
                          {t('detail.edit')}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="gap-2" onClick={handleExportPDF} disabled={isExporting}>
                        <FileDown className="w-4 h-4" />
                        {t('detail.exportPdf')}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2" onClick={handleExportZIP} disabled={isExporting}>
                        <FolderArchive className="w-4 h-4" />
                        {t('detail.exportZip')}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                    className="gap-2 text-destructive"
                    onClick={() => setDeleteDialogOpen(true)}>
                    
                        <Trash2 className="w-4 h-4" />
                        {t('detail.delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
            }

              {/* Title overlay on hero */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <div className="max-w-4xl mx-auto">
                  <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}>
                  
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge className={`${statusInfo.color} backdrop-blur-sm`}>{statusInfo.label}</Badge>
                      {capsuleCategories.map((cc) => cc.category &&
                    <CategoryBadge
                      key={cc.id}
                      category={cc.category}
                      isPrimary={cc.is_primary}
                      size="sm" />

                    )}
                    </div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-white mb-2 drop-shadow-lg">
                      {capsule.title}
                    </h1>
                    {capsule.memory_date &&
                  <p className="text-lg text-white/90 font-medium flex items-center gap-2">
                        <CalendarHeart className="w-5 h-5" />
                        {capsule.memory_date_precision === 'year' ?
                    format(new Date(capsule.memory_date), 'yyyy', { locale: dateLocale }) :
                    capsule.memory_date_precision === 'month' ?
                    format(new Date(capsule.memory_date), 'MMMM yyyy', { locale: dateLocale }) :
                    capsule.memory_date_precision === 'range' && capsule.memory_date_year_end ?
                    `${format(new Date(capsule.memory_date), 'yyyy', { locale: dateLocale })} - ${capsule.memory_date_year_end}` :

                    format(new Date(capsule.memory_date), 'd MMMM yyyy', { locale: dateLocale })
                    }
                      </p>
                  }
                  </motion.div>
                </div>
              </div>
            </div> : (

          /* Fallback header without image */
          <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 pt-4 pb-8 px-4">
              <div className="max-w-4xl mx-auto">
                <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/capsules')}
                className="mb-4 gap-2 text-muted-foreground hover:text-foreground">
                
                  <ArrowLeft className="w-4 h-4" />
                  {t('backToList')}
                </Button>

                <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex items-start justify-between gap-4">
                
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-xl ${typeInfo.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
                        {capsule.title}
                      </h1>
                      {capsule.memory_date &&
                    <p className="text-lg text-secondary font-medium flex items-center gap-2 mt-1 mb-3">
                          <CalendarHeart className="w-5 h-5" />
                          {capsule.memory_date_precision === 'year' ?
                      format(new Date(capsule.memory_date), 'yyyy', { locale: dateLocale }) :
                      capsule.memory_date_precision === 'month' ?
                      format(new Date(capsule.memory_date), 'MMMM yyyy', { locale: dateLocale }) :
                      capsule.memory_date_precision === 'range' && capsule.memory_date_year_end ?
                      `${format(new Date(capsule.memory_date), 'yyyy', { locale: dateLocale })} - ${capsule.memory_date_year_end}` :

                      format(new Date(capsule.memory_date), 'd MMMM yyyy', { locale: dateLocale })
                      }
                        </p>
                    }
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                        {capsuleCategories.map((cc) => cc.category &&
                      <CategoryBadge
                        key={cc.id}
                        category={cc.category}
                        isPrimary={cc.is_primary}
                        size="sm" />

                      )}
                        {capsuleSubCategories.map((csc) => csc.sub_category &&
                      <SubCategoryBadge
                        key={csc.id}
                        subCategory={csc.sub_category}
                        size="sm" />

                      )}
                      </div>
                    </div>
                  </div>

                  {isOwner &&
                <div className="flex gap-2">
                      <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setHeaderSelectorOpen(true)}
                    title={t('detail.changeHeaderImage')}>
                    
                        <ImagePlus className="w-4 h-4" />
                      </Button>
                      <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShareDialogOpen(true)}>
                    
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
                              {t('detail.edit')}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="gap-2" onClick={handleExportPDF} disabled={isExporting}>
                            <FileDown className="w-4 h-4" />
                            {t('detail.exportPdf')}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2" onClick={handleExportZIP} disabled={isExporting}>
                            <FolderArchive className="w-4 h-4" />
                            {t('detail.exportZip')}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                        className="gap-2 text-destructive"
                        onClick={() => setDeleteDialogOpen(true)}>
                        
                            <Trash2 className="w-4 h-4" />
                            {t('detail.delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                }
                </motion.div>
              </div>
            </div>)
          }
        </div>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Shared by indicator for non-owner */}
          {!isOwner && ownerProfile &&
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-accent/10 border border-accent/20 flex items-center gap-3">
            
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('detail.sharedBy')}</p>
                <p className="font-medium text-foreground">{ownerProfile.display_name || t('detail.unknownOwner')}</p>
              </div>
            </motion.div>
          }

          <div className="grid gap-6 md:grid-cols-3">
            {/* Main Column */}
            <div className="md:col-span-2 space-y-6">
              {/* Media Gallery - Prominent position */}
              {medias.length > 0 &&
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.08 }}
                className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-secondary/15 flex items-center justify-center">
                        <Image className="w-5 h-5 text-secondary" />
                      </div>
                      {t('detail.mediaGallery')}
                      <Badge variant="secondary" className="ml-1 text-xs">{medias.length}</Badge>
                    </h2>
                    <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => capsule && openStory([capsule])}
                    disabled={storyLoading}
                    className="gap-2 rounded-lg">
                    
                      <Play className="w-4 h-4" />
                      {t('detail.viewInStory')}
                    </Button>
                  </div>
                  <MediaGallery
                  medias={medias}
                  capsuleId={capsule.id}
                  thumbnailUrl={capsule.thumbnail_url}
                  onThumbnailChange={(url) => setCapsule((prev) => prev ? { ...prev, thumbnail_url: url } : null)} />
                
                </motion.div>
              }

              {/* Description */}
              {capsule.description &&
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="prose prose-lg max-w-none">
                
                  <p className="text-foreground text-lg leading-relaxed">{capsule.description}</p>
                </motion.div>
              }

              {/* Content (for text capsules) */}
              {capsule.content &&
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="p-6 rounded-2xl bg-muted/50 border-l-4 border-secondary">
                
                  <p className="text-foreground whitespace-pre-wrap leading-relaxed">{capsule.content}</p>
                </motion.div>
              }

              {/* YouTube Videos */}
              {capsule.metadata && typeof capsule.metadata === 'object' && (() => {
                const meta = capsule.metadata as Record<string, any>;
                const youtubeIds: string[] = meta.youtube_ids && Array.isArray(meta.youtube_ids)
                  ? meta.youtube_ids
                  : meta.youtube_id ? [meta.youtube_id] : [];
                return youtubeIds.length > 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.18 }}>
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                      <Video className="w-5 h-5 text-red-500" />
                      {t('detail.youtubeVideo', 'Vidéo YouTube')}
                      {youtubeIds.length > 1 && <span className="text-sm font-normal text-muted-foreground">({youtubeIds.length})</span>}
                    </h2>
                    <div className="space-y-4">
                      {youtubeIds.map((id: string, index: number) => (
                        <div key={id + index} className="relative rounded-xl overflow-hidden bg-muted aspect-video shadow-lg">
                          <iframe
                            src={`https://www.youtube.com/embed/${id}`}
                            title={`YouTube video ${index + 1}`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full"
                          />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ) : null;
              })()}

              {/* Social Links */}
              {capsule.metadata && typeof capsule.metadata === 'object' && (() => {
                const meta = capsule.metadata as Record<string, any>;
                const links: { platform: string; url: string }[] = meta.social_links && Array.isArray(meta.social_links) ? meta.social_links : [];
                const platformLabels: Record<string, { icon: string; label: string }> = {
                  facebook: { icon: '📘', label: 'Facebook' },
                  instagram: { icon: '📷', label: 'Instagram' },
                  tiktok: { icon: '🎵', label: 'TikTok' },
                  linkedin: { icon: '💼', label: 'LinkedIn' },
                };
                return links.length > 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}>
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                      🔗 {t('socialLinks.title', 'Liens sociaux')}
                    </h2>
                    <div className="space-y-2">
                      {links.map((link, index) => {
                        const config = platformLabels[link.platform] || { icon: '🔗', label: link.platform };
                        return (
                          <a
                            key={index}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors"
                          >
                            <span className="text-lg">{config.icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{config.label}</p>
                              <p className="text-sm text-foreground truncate">{link.url}</p>
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  </motion.div>
                ) : null;
              })()}

              {/* Emotion Reactions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}>
                <EmotionReactions capsuleId={capsule.id} />
              </motion.div>

              {/* Comments Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.35 }}>
                
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
                className="p-5 rounded-2xl border border-border bg-card">
                
                <div className="space-y-4 flex flex-col items-center -mt-2">



                  

                  {/* Created date */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t('detail.createdAt')}</p>
                      <p className="font-medium text-foreground">
                        {format(new Date(capsule.created_at), 'd MMM yyyy', { locale: dateLocale })}
                      </p>
                    </div>
                  </div>

                  {/* Updated date */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t('detail.updatedAt', 'Modifié le')}</p>
                      <p className="font-medium text-foreground">
                        {format(new Date(capsule.updated_at), 'd MMM yyyy', { locale: dateLocale })}
                      </p>
                    </div>
                  </div>

                  {/* Sub-categories */}
                  {capsuleSubCategories.length > 0 &&
                  <div className="pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-2">{t('categories.subcategories', 'Sous-catégories')}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {capsuleSubCategories.map((csc) => csc.sub_category &&
                      <SubCategoryBadge
                        key={csc.id}
                        subCategory={csc.sub_category}
                        size="sm" />

                      )}
                      </div>
                    </div>
                  }
                </div>
              </motion.div>

              {/* Tags */}
              {capsule.tags && capsule.tags.length > 0 &&
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.25 }}
                className="p-5 rounded-2xl border border-border bg-card">
                
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    {t('create.tags')}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {capsule.tags.map((tag) =>
                  <Badge key={tag} variant="secondary" className="capitalize">
                        {tag}
                      </Badge>
                  )}
                  </div>
                </motion.div>
              }

              {/* Shared with */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="p-5 rounded-2xl border border-border bg-card">
                
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {t('detail.sharedWith')}
                  </h3>
                  {isOwner &&
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShareDialogOpen(true)}
                    className="h-7 px-2 text-xs">
                    
                      {t('detail.edit')}
                    </Button>
                  }
                </div>

                {sharedCircles.length === 0 ?
                <p className="text-muted-foreground text-sm">
                    {t('share.noCircles')}
                  </p> :

                <div className="flex flex-wrap gap-2">
                    {sharedCircles.map((circle) =>
                  <Badge
                    key={circle.id}
                    variant="outline"
                    className="gap-1.5">
                    
                        <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: circle.color || '#1E3A5F' }} />
                    
                        {circle.name}
                      </Badge>
                  )}
                  </div>
                }
              </motion.div>
            </div>
          </div>
        </main>

      {/* Share Dialog (owner only) */}
      {isOwner &&
        <ShareCapsuleDialog
          open={shareDialogOpen}
          onOpenChange={(open) => {
            setShareDialogOpen(open);
            if (!open) refreshShares();
          }}
          capsuleId={capsule.id}
          capsuleTitle={capsule.title}
          userId={user.id} />

        }

      {/* Delete Dialog */}
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

      {/* Header Image Selector */}
      <HeaderImageSelector
          open={headerSelectorOpen}
          onOpenChange={setHeaderSelectorOpen}
          capsuleId={capsule.id}
          medias={medias}
          currentHeaderUrl={capsule.thumbnail_url}
          onHeaderChange={(url) => {
            setCapsule((prev) => prev ? { ...prev, thumbnail_url: url } : null);
          }} />
        

      <MobileBottomNav />
    </div>
    </>);

};

export default CapsuleDetail;