import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import logo from '@/assets/logo.png';
import SEOHead from '@/components/seo/SEOHead';
import NoIndex from '@/components/seo/NoIndex';

const ResetPassword = () => {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const { toast } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Detect recovery session from URL hash (Supabase appends #access_token=...&type=recovery)
  useEffect(() => {
    const init = async () => {
      // Supabase auto-parses the hash on page load and creates a session
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        // Fallback: maybe still parsing — listen briefly
        const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'PASSWORD_RECOVERY' || (session && event === 'SIGNED_IN')) {
            setSessionReady(true);
          }
        });
        // Give a moment for hash parsing
        setTimeout(async () => {
          const { data: retry } = await supabase.auth.getSession();
          if (retry.session) setSessionReady(true);
          else setErrorMessage('Lien invalide ou expiré. Veuillez demander un nouveau lien.');
          sub.subscription.unsubscribe();
        }, 800);
      } else {
        setSessionReady(true);
      }
    };
    init();
  }, []);

  const validate = () => {
    if (password.length < 8) {
      setErrorMessage('Le mot de passe doit contenir au moins 8 caractères');
      return false;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Les mots de passe ne correspondent pas');
      return false;
    }
    setErrorMessage(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: error.message });
      return;
    }

    setSuccess(true);
    toast({ title: 'Mot de passe défini', description: 'Vous allez être redirigé vers votre espace.' });
    setTimeout(() => navigate('/dashboard'), 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-gradient-to-br from-muted via-background to-muted">
      <SEOHead title="Définir mon mot de passe | Family Garden" description="Définissez votre mot de passe Family Garden." />
      <NoIndex />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-card rounded-2xl shadow-card p-8 border border-border">
          <Link to="/" className="flex items-center justify-center space-x-2 mb-8">
            <img src={logo} alt="Family Garden" className="w-12 h-12 object-contain" />
            <span className="text-2xl font-display font-bold text-primary">Family Garden</span>
          </Link>

          {success ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/15 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-secondary" />
              </div>
              <h2 className="text-xl font-display font-bold mb-2">Mot de passe défini !</h2>
              <p className="text-muted-foreground">Redirection vers votre espace…</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                  Définir votre mot de passe
                </h2>
                <p className="text-muted-foreground text-sm">
                  Choisissez un mot de passe sécurisé pour accéder à votre compte Family Garden.
                </p>
              </div>

              {errorMessage && !sessionReady && (
                <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive text-center">
                  {errorMessage}
                  <div className="mt-3">
                    <Link to="/forgot-password" className="underline font-medium">
                      Demander un nouveau lien
                    </Link>
                  </div>
                </div>
              )}

              {sessionReady && (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="password">Nouveau mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Au moins 8 caractères"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 h-12"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={showPassword ? 'Masquer' : 'Afficher'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Retapez votre mot de passe"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 h-12"
                        required
                        minLength={8}
                      />
                    </div>
                  </div>

                  {errorMessage && (
                    <p className="text-sm text-destructive text-center">{errorMessage}</p>
                  )}

                  <Button type="submit" variant="hero" size="xl" className="w-full" disabled={loading}>
                    {loading ? 'Enregistrement…' : 'Définir mon mot de passe'}
                  </Button>
                </form>
              )}

              {!sessionReady && !errorMessage && (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  Vérification du lien…
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
