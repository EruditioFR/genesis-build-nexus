import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Users, Plus, ArrowLeft, MoreHorizontal, UserPlus, Edit, Trash2,
  Mail, Clock, User, Loader2
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
import CreateCircleDialog from '@/components/circles/CreateCircleDialog';
import AddMemberDialog from '@/components/circles/AddMemberDialog';
import { toast } from 'sonner';
import MobileBottomNav from '@/components/dashboard/MobileBottomNav';

interface Circle {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  created_at: string;
  member_count: number;
}

interface CircleMember {
  id: string;
  email: string | null;
  name: string | null;
  user_id: string | null;
  invited_at: string;
  accepted_at: string | null;
}

const CirclesPage = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [circles, setCircles] = useState<Circle[]>([]);
  const [selectedCircle, setSelectedCircle] = useState<Circle | null>(null);
  const [members, setMembers] = useState<CircleMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(false);
  const [profile, setProfile] = useState<{ display_name: string | null; avatar_url: string | null } | null>(null);

  // Dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [circleToDelete, setCircleToDelete] = useState<Circle | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const fetchCircles = async () => {
    if (!user) return;

    const { data: profileData } = await supabase
      .from('profiles')
      .select('display_name, avatar_url')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profileData) setProfile(profileData);

    // Fetch circles with member count
    const { data: circlesData } = await supabase
      .from('circles')
      .select('id, name, description, color, created_at')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (circlesData) {
      // Get member counts for each circle
      const circlesWithCounts = await Promise.all(
        circlesData.map(async (circle) => {
          const { count } = await supabase
            .from('circle_members')
            .select('*', { count: 'exact', head: true })
            .eq('circle_id', circle.id);

          return {
            ...circle,
            member_count: count || 0,
          };
        })
      );

      setCircles(circlesWithCounts);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (user) fetchCircles();
  }, [user]);

  const fetchMembers = async (circleId: string) => {
    setMembersLoading(true);

    const { data } = await supabase
      .from('circle_members')
      .select('id, email, name, user_id, invited_at, accepted_at')
      .eq('circle_id', circleId)
      .order('invited_at', { ascending: false });

    if (data) {
      setMembers(data);
    }

    setMembersLoading(false);
  };

  const handleSelectCircle = (circle: Circle) => {
    setSelectedCircle(circle);
    fetchMembers(circle.id);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleDeleteCircle = async () => {
    if (!circleToDelete) return;

    const { error } = await supabase
      .from('circles')
      .delete()
      .eq('id', circleToDelete.id);

    if (error) {
      toast.error('Erreur lors de la suppression');
    } else {
      setCircles(prev => prev.filter(c => c.id !== circleToDelete.id));
      if (selectedCircle?.id === circleToDelete.id) {
        setSelectedCircle(null);
        setMembers([]);
      }
      toast.success('Cercle supprimé');
    }

    setDeleteDialogOpen(false);
    setCircleToDelete(null);
  };

  const handleRemoveMember = async (memberId: string) => {
    const { error } = await supabase
      .from('circle_members')
      .delete()
      .eq('id', memberId);

    if (error) {
      toast.error('Erreur lors de la suppression');
    } else {
      setMembers(prev => prev.filter(m => m.id !== memberId));
      // Update member count
      if (selectedCircle) {
        setCircles(prev => prev.map(c => 
          c.id === selectedCircle.id 
            ? { ...c, member_count: c.member_count - 1 }
            : c
        ));
      }
      toast.success('Membre retiré');
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Chargement des cercles...</p>
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
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold text-foreground">
                  Mes cercles
                </h1>
                <p className="text-muted-foreground text-sm">
                  {circles.length} cercle{circles.length !== 1 ? 's' : ''} créé{circles.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <Button onClick={() => setCreateDialogOpen(true)} className="gap-2 bg-gradient-gold hover:opacity-90 text-primary-foreground shadow-gold">
              <Plus className="w-4 h-4" />
              Nouveau cercle
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Circles List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="lg:col-span-1 space-y-3"
          >
            {circles.length === 0 ? (
              <div className="p-8 rounded-2xl border border-border bg-card text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-4">
                  Aucun cercle créé
                </p>
                <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Créer mon premier cercle
                </Button>
              </div>
            ) : (
              circles.map((circle) => (
                <div
                  key={circle.id}
                  onClick={() => handleSelectCircle(circle)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                    selectedCircle?.id === circle.id
                      ? 'border-secondary bg-secondary/5 shadow-soft'
                      : 'border-border bg-card hover:border-secondary/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${circle.color}20` }}
                      >
                        <Users className="w-5 h-5" style={{ color: circle.color || '#1E3A5F' }} />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{circle.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {circle.member_count} membre{circle.member_count !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          className="gap-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectCircle(circle);
                            setAddMemberDialogOpen(true);
                          }}
                        >
                          <UserPlus className="w-4 h-4" />
                          Inviter
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="gap-2 text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCircleToDelete(circle);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {circle.description && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {circle.description}
                    </p>
                  )}
                </div>
              ))
            )}
          </motion.div>

          {/* Circle Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="lg:col-span-2"
          >
            {selectedCircle ? (
              <div className="p-6 rounded-2xl border border-border bg-card">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${selectedCircle.color}20` }}
                    >
                      <Users className="w-6 h-6" style={{ color: selectedCircle.color || '#1E3A5F' }} />
                    </div>
                    <div>
                      <h2 className="text-xl font-display font-bold text-foreground">
                        {selectedCircle.name}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Créé le {format(new Date(selectedCircle.created_at), 'd MMMM yyyy', { locale: fr })}
                      </p>
                    </div>
                  </div>

                  <Button onClick={() => setAddMemberDialogOpen(true)} className="gap-2">
                    <UserPlus className="w-4 h-4" />
                    Inviter
                  </Button>
                </div>

                {selectedCircle.description && (
                  <p className="text-muted-foreground mb-6">
                    {selectedCircle.description}
                  </p>
                )}

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    Membres ({members.length})
                  </h3>

                  {membersLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : members.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-border rounded-xl">
                      <p className="text-muted-foreground mb-4">
                        Aucun membre dans ce cercle
                      </p>
                      <Button variant="outline" onClick={() => setAddMemberDialogOpen(true)} className="gap-2">
                        <UserPlus className="w-4 h-4" />
                        Inviter des membres
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                              <User className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">
                                {member.name || member.email}
                              </p>
                              {member.name && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {member.email}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge
                              variant={member.accepted_at ? 'default' : 'secondary'}
                              className={member.accepted_at ? 'bg-green-100 text-green-700' : ''}
                            >
                              {member.accepted_at ? 'Accepté' : 'En attente'}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => handleRemoveMember(member.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-12 rounded-2xl border border-dashed border-border bg-card/50 text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Sélectionnez un cercle pour voir ses détails
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {/* Dialogs */}
      <CreateCircleDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        userId={user.id}
        onCircleCreated={fetchCircles}
      />

      {selectedCircle && (
        <AddMemberDialog
          open={addMemberDialogOpen}
          onOpenChange={setAddMemberDialogOpen}
          circleId={selectedCircle.id}
          circleName={selectedCircle.name}
          onMemberAdded={() => {
            fetchMembers(selectedCircle.id);
            fetchCircles();
          }}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce cercle ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le cercle "{circleToDelete?.name}" et tous ses membres seront supprimés. Les capsules partagées ne seront plus accessibles aux membres.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCircle} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <MobileBottomNav />
    </div>
  );
};

export default CirclesPage;
