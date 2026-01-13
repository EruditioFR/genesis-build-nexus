import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur de connexion',
        description: error.message === 'Invalid login credentials' 
          ? 'Email ou mot de passe incorrect' 
          : error.message,
      });
    } else {
      toast({
        title: 'Bienvenue !',
        description: 'Connexion réussie',
      });
      navigate('/dashboard');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary via-primary to-accent/80 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-10 bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-transparent to-transparent" />
        
        <div className="relative z-10 flex flex-col justify-center px-12 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Link to="/" className="flex items-center space-x-3 mb-12">
              <div className="w-12 h-12 rounded-xl bg-secondary/20 backdrop-blur-sm flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-secondary" />
              </div>
              <span className="text-2xl font-display font-bold text-primary-foreground">
                La Ligne du Temps
              </span>
            </Link>

            <h1 className="text-4xl lg:text-5xl font-display font-bold text-primary-foreground mb-6 leading-tight">
              Retrouvez vos
              <br />
              <span className="text-secondary">précieux souvenirs</span>
            </h1>
            
            <p className="text-lg text-primary-foreground/80 max-w-md">
              Connectez-vous pour accéder à vos capsules mémorielles et continuer à préserver votre histoire familiale.
            </p>
          </motion.div>

          {/* Decorative elements */}
          <div className="absolute bottom-12 left-12 right-12">
            <div className="flex items-center gap-4 text-primary-foreground/60 text-sm">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-secondary/30 border-2 border-primary" />
                ))}
              </div>
              <span>+2,000 familles nous font confiance</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-background">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <Link to="/" className="flex lg:hidden items-center space-x-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xl font-display font-bold text-primary">
              La Ligne du Temps
            </span>
          </Link>

          <div className="mb-8">
            <h2 className="text-3xl font-display font-bold text-foreground mb-2">
              Connexion
            </h2>
            <p className="text-muted-foreground">
              Entrez vos identifiants pour accéder à votre espace
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Adresse email</Label>
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

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mot de passe</Label>
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-secondary hover:text-secondary/80 transition-colors"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              variant="hero" 
              size="xl" 
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              Pas encore de compte ?{' '}
              <Link to="/signup" className="text-secondary font-medium hover:text-secondary/80 transition-colors">
                Créer un compte
              </Link>
            </p>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 pt-8 border-t border-border">
            <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>Sécurisé SSL</span>
              </div>
              <div className="flex items-center gap-1">
                <span>🇫🇷</span>
                <span>Données en France</span>
              </div>
              <div className="flex items-center gap-1">
                <span>🔒</span>
                <span>RGPD</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
