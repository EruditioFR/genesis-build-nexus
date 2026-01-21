import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, CheckCircle, XCircle, Loader2, LogIn } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface InvitationData {
  id: string;
  circle_id: string;
  email: string;
  name: string | null;
  circle_name: string;
  circle_color: string;
  inviter_name: string;
  expired: boolean;
  already_accepted: boolean;
}

const InviteAccept = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvitation = async () => {
      if (!token) {
        setError("Lien d'invitation invalide");
        setLoading(false);
        return;
      }

      try {
        // Use edge function to fetch invitation (bypasses RLS)
        const { data, error: fetchError } = await supabase.functions.invoke('get-invitation', {
          body: { token },
        });

        if (fetchError) {
          console.error('Error fetching invitation:', fetchError);
          setError("Erreur lors de la récupération de l'invitation");
          setLoading(false);
          return;
        }

        if (data.error === 'not_found') {
          setError("Cette invitation n'existe pas ou a été annulée");
          setLoading(false);
          return;
        }

        if (data.error) {
          setError(data.message || "Erreur inconnue");
          setLoading(false);
          return;
        }

        setInvitation(data);
      } catch (err: any) {
        console.error('Error fetching invitation:', err);
        setError("Erreur lors de la récupération de l'invitation");
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [token]);

  const handleAccept = async () => {
    if (!invitation || !user || !token) return;

    setAccepting(true);
    try {
      // Get the session for auth header
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Session expirée, veuillez vous reconnecter");
        navigate(`/login?redirect=/invite/${token}`);
        return;
      }

      // Use edge function to accept invitation (bypasses RLS securely)
      const { data, error: acceptError } = await supabase.functions.invoke('accept-invitation', {
        body: { token },
      });

      if (acceptError) {
        console.error('Error accepting invitation:', acceptError);
        toast.error("Erreur lors de l'acceptation de l'invitation");
        return;
      }

      if (data.error) {
        if (data.error === 'already_accepted') {
          toast.info(`Vous êtes déjà membre du cercle "${data.circle_name}"`);
          navigate('/circles');
          return;
        }
        if (data.error === 'expired') {
          toast.error("Cette invitation a expiré");
          return;
        }
        toast.error(data.message || "Erreur lors de l'acceptation");
        return;
      }

      toast.success(`Vous avez rejoint le cercle "${data.circle_name}" !`);
      navigate('/circles');
    } catch (err: any) {
      console.error('Error accepting invitation:', err);
      toast.error(err.message || "Erreur lors de l'acceptation");
    } finally {
      setAccepting(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-warm">
        <Loader2 className="w-10 h-10 animate-spin text-secondary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-warm p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <XCircle className="w-8 h-8 text-destructive" />
              </div>
              <CardTitle>Invitation invalide</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild>
                <Link to="/">Retour à l'accueil</Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (!invitation) return null;

  if (invitation.already_accepted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-warm p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <CardTitle>Invitation déjà acceptée</CardTitle>
              <CardDescription>
                Vous êtes déjà membre du cercle "{invitation.circle_name}"
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild>
                <Link to="/circles">Voir mes cercles</Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (invitation.expired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-warm p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
                <XCircle className="w-8 h-8 text-amber-500" />
              </div>
              <CardTitle>Invitation expirée</CardTitle>
              <CardDescription>
                Cette invitation a expiré. Demandez à {invitation.inviter_name} de vous renvoyer une invitation.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild>
                <Link to="/">Retour à l'accueil</Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // If user is not logged in, prompt them to login/signup
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-warm p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div 
                className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: `${invitation.circle_color}20` }}
              >
                <Users className="w-8 h-8" style={{ color: invitation.circle_color }} />
              </div>
              <CardTitle>Invitation au cercle</CardTitle>
              <CardDescription>
                <strong>{invitation.inviter_name}</strong> vous invite à rejoindre le cercle 
                <strong className="text-secondary"> "{invitation.circle_name}"</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Pour accepter cette invitation, connectez-vous ou créez un compte.
              </p>
              <div className="flex flex-col gap-3">
                <Button asChild className="w-full gap-2">
                  <Link to={`/login?redirect=/invite/${token}`}>
                    <LogIn className="w-4 h-4" />
                    Se connecter
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link to={`/signup?redirect=/invite/${token}`}>
                    Créer un compte
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // User is logged in, show accept button
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-warm p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div 
              className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: `${invitation.circle_color}20` }}
            >
              <Users className="w-8 h-8" style={{ color: invitation.circle_color }} />
            </div>
            <CardTitle>Rejoindre le cercle</CardTitle>
            <CardDescription>
              <strong>{invitation.inviter_name}</strong> vous invite à rejoindre le cercle 
              <strong className="text-secondary"> "{invitation.circle_name}"</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              En rejoignant ce cercle, vous pourrez consulter et commenter les capsules 
              souvenirs partagées par les membres.
            </p>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => navigate('/')}
              >
                Refuser
              </Button>
              <Button 
                className="flex-1 gap-2"
                onClick={handleAccept}
                disabled={accepting}
              >
                {accepting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Acceptation...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Accepter
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default InviteAccept;