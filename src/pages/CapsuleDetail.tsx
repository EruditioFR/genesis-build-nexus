import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  ArrowLeft, Edit, Share2, Trash2, Clock, Image, Video, Music,
  FileText, Layers, Tag, Calendar, MoreHorizontal, Users
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
import ShareCapsuleDialog from '@/components/circles/ShareCapsuleDialog';
import { toast } from 'sonner';

import type { Database } from '@/integrations/supabase/types';

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
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<{ display_name: string | null; avatar_url: string | null } | null>(null);

  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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
        toast.error('Capsule introuvable');
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

      setIsLoading(false);
    };

    if (user && id) fetchData();
  }, [user, id, navigate]);

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
      toast.success('Capsule supprimée');
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

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Chargement de la capsule...</p>
        </div>
      </div>
    );
  }

  if (!user || !capsule) return null;

  const typeInfo = typeConfig[capsule.capsule_type];
  const statusInfo = statusConfig[capsule.status];
  const Icon = typeInfo.icon;

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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            onClick={() => navigate('/capsules')}
            className="mb-4 gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux capsules
          </Button>

          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-xl ${typeInfo.color} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-2">
                  {capsule.title}
                </h1>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {format(new Date(capsule.created_at), 'd MMMM yyyy', { locale: fr })}
                  </span>
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
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
                <DropdownMenuItem className="gap-2" onClick={() => setShareDialogOpen(true)}>
                  <Share2 className="w-4 h-4" />
                  Partager
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

        <div className="space-y-6">
          {/* Description */}
          {capsule.description && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="p-6 rounded-2xl border border-border bg-card"
            >
              <p className="text-foreground">{capsule.description}</p>
            </motion.div>
          )}

          {/* Content (for text capsules) */}
          {capsule.content && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="p-6 rounded-2xl border border-border bg-card"
            >
              <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Contenu
              </h2>
              <div className="prose prose-sm max-w-none">
                <p className="text-foreground whitespace-pre-wrap">{capsule.content}</p>
              </div>
            </motion.div>
          )}

          {/* Media Gallery */}
          {medias.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="p-6 rounded-2xl border border-border bg-card"
            >
              <h2 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
                <Image className="w-4 h-4" />
                Médias ({medias.length})
              </h2>
              <MediaGallery medias={medias} />
            </motion.div>
          )}

          {/* Tags */}
          {capsule.tags && capsule.tags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="p-6 rounded-2xl border border-border bg-card"
            >
              <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Tags
              </h2>
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="p-6 rounded-2xl border border-border bg-card"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                Partagé avec
              </h2>
              <Button variant="outline" size="sm" onClick={() => setShareDialogOpen(true)} className="gap-2">
                <Share2 className="w-4 h-4" />
                Gérer le partage
              </Button>
            </div>

            {sharedCircles.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Cette capsule n'est partagée avec aucun cercle.
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
    </div>
  );
};

export default CapsuleDetail;
