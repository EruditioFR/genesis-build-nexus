import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, Search, Filter, Clock, Image, Video, Music, FileText, Layers,
  MoreHorizontal, Edit, Trash2, Share2, Eye, ArrowLeft
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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

import type { Database } from '@/integrations/supabase/types';

type Capsule = Database['public']['Tables']['capsules']['Row'];
type CapsuleType = Database['public']['Enums']['capsule_type'];
type CapsuleStatus = Database['public']['Enums']['capsule_status'];

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

const CapsulesList = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<{ display_name: string | null; avatar_url: string | null } | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<CapsuleType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<CapsuleStatus | 'all'>('all');
  
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
        setCapsules(capsulesData);
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
      toast.error('Erreur lors de la suppression');
    } else {
      setCapsules(prev => prev.filter(c => c.id !== capsuleToDelete.id));
      toast.success('Capsule supprimée');
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
    
    return matchesSearch && matchesType && matchesStatus;
  });

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Chargement des capsules...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

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
            onClick={() => navigate('/dashboard')}
            className="mb-4 gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au tableau de bord
          </Button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold text-foreground">
                  Mes capsules
                </h1>
                <p className="text-muted-foreground text-sm">
                  {capsules.length} capsule{capsules.length !== 1 ? 's' : ''} au total
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
                placeholder="Rechercher par titre, description ou tag..."
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
                  <SelectItem value="all">Tous types</SelectItem>
                  <SelectItem value="text">Texte</SelectItem>
                  <SelectItem value="photo">Photo</SelectItem>
                  <SelectItem value="video">Vidéo</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="mixed">Mixte</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as CapsuleStatus | 'all')}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous statuts</SelectItem>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="published">Publiée</SelectItem>
                  <SelectItem value="scheduled">Programmée</SelectItem>
                  <SelectItem value="archived">Archivée</SelectItem>
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
                  Aucune capsule créée
                </h2>
                <p className="text-muted-foreground mb-6">
                  Commencez à préserver vos souvenirs dès maintenant
                </p>
                <Button asChild className="gap-2">
                  <Link to="/capsules/new">
                    <Plus className="w-4 h-4" />
                    Créer ma première capsule
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <h2 className="text-xl font-display font-semibold text-foreground mb-2">
                  Aucun résultat
                </h2>
                <p className="text-muted-foreground">
                  Essayez de modifier vos filtres de recherche
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
                  className="group p-5 rounded-2xl border border-border bg-card hover:shadow-card transition-all duration-300 cursor-pointer"
                  onClick={() => navigate(`/capsules/${capsule.id}`)}
                >
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
                      {statusInfo.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(capsule.created_at), 'd MMM yyyy', { locale: fr })}
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

export default CapsulesList;
