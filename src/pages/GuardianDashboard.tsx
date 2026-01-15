import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Lock, 
  Unlock, 
  Calendar, 
  User, 
  Loader2, 
  ArrowLeft,
  Clock,
  Package,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import MobileBottomNav from '@/components/dashboard/MobileBottomNav';

interface LegacyCapsule {
  id: string;
  capsule_id: string;
  unlock_type: string;
  unlock_date: string | null;
  unlocked_at: string | null;
  unlocked_by: string | null;
  capsule: {
    id: string;
    title: string;
    description: string | null;
    capsule_type: string;
    created_at: string;
    thumbnail_url: string | null;
  };
  owner: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

interface GuardianAssignment {
  id: string;
  user_id: string;
  guardian_name: string | null;
  verified_at: string | null;
  owner: {
    display_name: string | null;
    avatar_url: string | null;
  };
  legacy_capsules: LegacyCapsule[];
}

const GuardianDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<GuardianAssignment[]>([]);
  const [unlocking, setUnlocking] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login?redirect=/guardian-dashboard');
      return;
    }

    if (user) {
      fetchAssignments();
    }
  }, [user, authLoading, navigate]);

  const fetchAssignments = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch guardianships where the current user is the guardian
      const { data: guardians, error: guardiansError } = await supabase
        .from('guardians')
        .select(`
          id,
          user_id,
          guardian_name,
          verified_at
        `)
        .eq('guardian_user_id', user.id);

      if (guardiansError) throw guardiansError;

      if (!guardians || guardians.length === 0) {
        setAssignments([]);
        setLoading(false);
        return;
      }

      // For each guardian assignment, fetch owner profile and their legacy capsules
      const assignmentsWithData: GuardianAssignment[] = await Promise.all(
        guardians.map(async (guardian) => {
          // Fetch owner profile
          const { data: ownerProfile } = await supabase
            .from('profiles')
            .select('display_name, avatar_url')
            .eq('user_id', guardian.user_id)
            .maybeSingle();

          // Fetch legacy capsules assigned to this guardian
          const { data: legacyCapsules } = await supabase
            .from('legacy_capsules')
            .select(`
              id,
              capsule_id,
              unlock_type,
              unlock_date,
              unlocked_at,
              unlocked_by
            `)
            .eq('guardian_id', guardian.id);

          // Fetch capsule details for each legacy capsule
          const capsulesWithDetails: LegacyCapsule[] = await Promise.all(
            (legacyCapsules || []).map(async (lc) => {
              const { data: capsule } = await supabase
                .from('capsules')
                .select('id, title, description, capsule_type, created_at, thumbnail_url')
                .eq('id', lc.capsule_id)
                .maybeSingle();

              return {
                ...lc,
                capsule: capsule || {
                  id: lc.capsule_id,
                  title: 'Capsule inaccessible',
                  description: null,
                  capsule_type: 'text',
                  created_at: new Date().toISOString(),
                  thumbnail_url: null,
                },
                owner: ownerProfile || { display_name: null, avatar_url: null },
              };
            })
          );

          return {
            ...guardian,
            owner: ownerProfile || { display_name: null, avatar_url: null },
            legacy_capsules: capsulesWithDetails,
          };
        })
      );

      setAssignments(assignmentsWithData);
    } catch (err: any) {
      console.error('Error fetching guardian assignments:', err);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async (legacyCapsule: LegacyCapsule) => {
    if (!user) return;

    setUnlocking(legacyCapsule.id);
    try {
      // Update legacy capsule to mark as unlocked
      const { error } = await supabase
        .from('legacy_capsules')
        .update({
          unlocked_at: new Date().toISOString(),
          unlocked_by: user.id,
        })
        .eq('id', legacyCapsule.id);

      if (error) throw error;

      // Update capsule status to published
      await supabase
        .from('capsules')
        .update({ 
          status: 'published',
          published_at: new Date().toISOString()
        })
        .eq('id', legacyCapsule.capsule_id);

      toast.success('Capsule déverrouillée avec succès !');
      fetchAssignments();
    } catch (err: any) {
      console.error('Error unlocking capsule:', err);
      toast.error(err.message || 'Erreur lors du déverrouillage');
    } finally {
      setUnlocking(null);
    }
  };

  const getCapsuleTypeIcon = (type: string) => {
    switch (type) {
      case 'photo':
        return '📷';
      case 'video':
        return '🎬';
      case 'audio':
        return '🎵';
      case 'mixed':
        return '📦';
      default:
        return '📝';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-warm">
        <Loader2 className="w-10 h-10 animate-spin text-secondary" />
      </div>
    );
  }

  const totalCapsules = assignments.reduce((acc, a) => acc + a.legacy_capsules.length, 0);
  const unlockedCapsules = assignments.reduce(
    (acc, a) => acc + a.legacy_capsules.filter((lc) => lc.unlocked_at).length,
    0
  );
  const pendingCapsules = totalCapsules - unlockedCapsules;

  return (
    <div className="min-h-screen bg-gradient-warm pb-24 md:pb-0">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Button variant="ghost" asChild className="mb-6 gap-2">
          <Link to="/profile">
            <ArrowLeft className="w-4 h-4" />
            Retour au profil
          </Link>
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Espace Gardien</h1>
              <p className="text-muted-foreground">
                Gérez les capsules héritage qui vous sont confiées
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6 text-center">
                <Package className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-2xl font-bold">{totalCapsules}</p>
                <p className="text-xs text-muted-foreground">Capsules confiées</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Clock className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                <p className="text-2xl font-bold">{pendingCapsules}</p>
                <p className="text-xs text-muted-foreground">En attente</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold">{unlockedCapsules}</p>
                <p className="text-xs text-muted-foreground">Déverrouillées</p>
              </CardContent>
            </Card>
          </div>

          {/* Empty state */}
          {assignments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-medium mb-2">Aucune capsule à gérer</h3>
                <p className="text-muted-foreground">
                  Vous n'êtes pas encore gardien pour des capsules héritage.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {assignments.map((assignment) => (
                <Card key={assignment.id}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center overflow-hidden">
                        {assignment.owner.avatar_url ? (
                          <img 
                            src={assignment.owner.avatar_url} 
                            alt="" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {assignment.owner.display_name || 'Utilisateur'}
                        </CardTitle>
                        <CardDescription>
                          {assignment.legacy_capsules.length} capsule(s) confiée(s)
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {assignment.legacy_capsules.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Aucune capsule héritage assignée pour le moment
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {assignment.legacy_capsules.map((lc) => (
                          <div 
                            key={lc.id}
                            className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <span className="text-2xl">
                                {getCapsuleTypeIcon(lc.capsule.capsule_type)}
                              </span>
                              <div className="min-w-0 flex-1">
                                <h4 className="font-medium truncate">
                                  {lc.capsule.title}
                                </h4>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Calendar className="w-3 h-3" />
                                  <span>
                                    Créée le {format(new Date(lc.capsule.created_at), 'd MMM yyyy', { locale: fr })}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {lc.unlocked_at ? (
                                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                                  <Unlock className="w-3 h-3 mr-1" />
                                  Déverrouillée
                                </Badge>
                              ) : (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" className="gap-2">
                                      <Lock className="w-4 h-4" />
                                      Déverrouiller
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle className="flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5 text-amber-500" />
                                        Déverrouiller cette capsule ?
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Vous êtes sur le point de déverrouiller la capsule 
                                        <strong className="text-foreground"> "{lc.capsule.title}"</strong>. 
                                        Cette action est irréversible et rendra la capsule visible 
                                        aux personnes autorisées.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleUnlock(lc)}
                                        disabled={unlocking === lc.id}
                                      >
                                        {unlocking === lc.id ? (
                                          <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Déverrouillage...
                                          </>
                                        ) : (
                                          'Confirmer le déverrouillage'
                                        )}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </motion.div>

        <MobileBottomNav />
      </div>
    </div>
  );
};

export default GuardianDashboard;
