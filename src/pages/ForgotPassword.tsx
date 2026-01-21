import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import logo from '@/assets/logo.png';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { resetPassword } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await resetPassword(email);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.message,
      });
    } else {
      setSent(true);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-gradient-to-br from-muted via-background to-muted">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-card rounded-2xl shadow-card p-8 border border-border">
          {/* Logo */}
          <Link to="/" className="flex items-center justify-center space-x-2 mb-8">
            <img src={logo} alt="Family Garden" className="w-12 h-12 object-contain" />
            <span className="text-2xl font-display font-bold text-primary">
              Family Garden
            </span>
          </Link>

          {!sent ? (
            <>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                  Mot de passe oublié ?
                </h2>
                <p className="text-muted-foreground text-base">
                  Pas de panique ! Entrez votre email et nous vous enverrons un lien de réinitialisation.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base">Adresse email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="vous@exemple.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12"
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  variant="hero" 
                  size="xl" 
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
                </Button>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-display font-bold text-foreground mb-2">
                Email envoyé !
              </h3>
              <p className="text-muted-foreground mb-6">
                Vérifiez votre boîte de réception à{' '}
                <span className="font-medium text-foreground">{email}</span>
                {' '}et cliquez sur le lien pour réinitialiser votre mot de passe.
              </p>
              <p className="text-sm text-muted-foreground">
                Vous n'avez pas reçu l'email ?{' '}
                <button
                  onClick={() => setSent(false)}
                  className="text-secondary hover:text-secondary/80 font-medium"
                >
                  Renvoyer
                </button>
              </p>
            </motion.div>
          )}

          <div className="mt-8 text-center">
            <Link 
              to="/login" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à la connexion
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Besoin d'aide ?{' '}
            <a href="mailto:support@familygarden.fr" className="text-secondary hover:text-secondary/80">
              Contactez le support
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
