import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, XCircle, Loader2, LogIn } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const GuardianVerify = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [guardian, setGuardian] = useState<{
    id: string;
    guardian_email: string;
    guardian_name: string | null;
    owner_name: string;
    already_verified: boolean;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGuardian = async () => {
      if (!token) {
        setError("Lien de vérification invalide");
        setLoading(false);
        return;
      }

      try {
        // Fetch guardian details
        const { data: guardianData, error: guardianError } = await supabase
          .from('guardians')
          .select(`
            id,
            guardian_email,
            guardian_name,
            verified_at,
            user_id
          `)
          .eq('verification_token', token)
          .maybeSingle();

        if (guardianError) throw guardianError;

        if (!guardianData) {
          setError("Cette demande de gardien n'existe pas ou a été annulée");
          setLoading(false);
          return;
        }

        // Get owner name
        const { data: ownerProfile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('user_id', guardianData.user_id)
          .maybeSingle();

        setGuardian({
          id: guardianData.id,
          guardian_email: guardianData.guardian_email,
          guardian_name: guardianData.guardian_name,
          owner_name: ownerProfile?.display_name || 'Un utilisateur',
          already_verified: !!guardianData.verified_at,
        });
      } catch (err: any) {
        console.error('Error fetching guardian:', err);
        setError("Erreur lors de la récupération de la demande");
      } finally {
        setLoading(false);
      }
    };

    fetchGuardian();
  }, [token]);

  const handleAccept = async () => {
    if (!guardian || !user) return;

    setAccepting(true);
    try {
      // Update the guardian with user_id and verified_at
      const { error } = await supabase
        .from('guardians')
        .update({
          guardian_user_id: user.id,
          verified_at: new Date().toISOString(),
        })
        .eq('id', guardian.id);

      if (error) throw error;

      toast.success(`Vous êtes maintenant gardien pour ${guardian.owner_name} !`);
      navigate('/profile');
    } catch (err: any) {
      console.error('Error accepting guardian role:', err);
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
              <CardTitle>Lien invalide</CardTitle>
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

  if (!guardian) return null;

  if (guardian.already_verified) {
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
              <CardTitle>Déjà vérifié</CardTitle>
              <CardDescription>
                Vous êtes déjà gardien pour {guardian.owner_name}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild>
                <Link to="/profile">Voir mon profil</Link>
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
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <CardTitle>Demande de gardien</CardTitle>
              <CardDescription>
                <strong>{guardian.owner_name}</strong> vous a désigné comme gardien de ses capsules héritage.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Pour accepter cette demande, connectez-vous ou créez un compte.
              </p>
              <div className="flex flex-col gap-3">
                <Button asChild className="w-full gap-2">
                  <Link to={`/login?redirect=/guardian/verify/${token}`}>
                    <LogIn className="w-4 h-4" />
                    Se connecter
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link to={`/signup?redirect=/guardian/verify/${token}`}>
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
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <CardTitle>Devenir gardien</CardTitle>
            <CardDescription>
              <strong>{guardian.owner_name}</strong> vous a désigné comme gardien de ses capsules héritage.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium text-sm mb-2">Qu'est-ce qu'un gardien ?</h4>
              <p className="text-sm text-muted-foreground">
                En tant que gardien, vous serez responsable de déverrouiller les capsules 
                héritage de {guardian.owner_name} lorsque le moment sera venu. C'est un 
                rôle de confiance important.
              </p>
            </div>
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
                    <Shield className="w-4 h-4" />
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

export default GuardianVerify;
