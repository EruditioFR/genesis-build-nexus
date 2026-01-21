import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Check, AlertCircle, Loader2, BookOpen, Users, Clock, Share2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import logo from '@/assets/logo.png';
import heroBackground from '@/assets/hero-background.jpg';

const Signup = () => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Debounced email check
  const checkEmailExists = useCallback(async (emailToCheck: string) => {
    if (!emailToCheck || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailToCheck)) {
      setEmailExists(false);
      return;
    }

    setCheckingEmail(true);
    try {
      const { data, error } = await supabase.rpc('check_email_exists', {
        email_to_check: emailToCheck
      });
      
      if (!error) {
        setEmailExists(data === true);
      }
    } catch (err) {
      console.error('Error checking email:', err);
    } finally {
      setCheckingEmail(false);
    }
  }, []);

  // Debounce email check
  useEffect(() => {
    const timer = setTimeout(() => {
      if (email) {
        checkEmailExists(email);
      } else {
        setEmailExists(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [email, checkEmailExists]);

  const passwordRequirements = [
    { label: 'Au moins 8 caractères', met: password.length >= 8 },
    { label: 'Une majuscule', met: /[A-Z]/.test(password) },
    { label: 'Un chiffre', met: /[0-9]/.test(password) },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (emailExists) {
      toast({
        variant: 'destructive',
        title: 'Email déjà utilisé',
        description: 'Cette adresse email est déjà associée à un compte.',
      });
      return;
    }

    if (email !== confirmEmail) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Les adresses email ne correspondent pas',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Les mots de passe ne correspondent pas',
      });
      return;
    }

    if (!passwordRequirements.every((req) => req.met)) {
      toast({
        variant: 'destructive',
        title: 'Mot de passe trop faible',
        description: 'Veuillez respecter les critères de sécurité',
      });
      return;
    }

    setLoading(true);

    const { error } = await signUp(email, password, displayName);

    if (error) {
      // Check for existing email error
      const isEmailExists = 
        error.message?.toLowerCase().includes('already registered') ||
        error.message?.toLowerCase().includes('already been registered') ||
        error.message?.toLowerCase().includes('user already exists') ||
        error.message?.toLowerCase().includes('email already') ||
        error.message?.toLowerCase().includes('duplicate') ||
        error.message?.toLowerCase().includes('already in use');

      toast({
        variant: 'destructive',
        title: isEmailExists ? 'Email déjà utilisé' : 'Erreur d\'inscription',
        description: isEmailExists 
          ? 'Cette adresse email est déjà associée à un compte. Veuillez vous connecter ou utiliser une autre adresse.'
          : error.message,
      });
    } else {
      toast({
        title: 'Compte créé !',
        description: 'Bienvenue sur Family Garden',
      });
      navigate('/dashboard?welcome=true');
    }

    setLoading(false);
  };

  const tutorialSteps = [
    {
      icon: BookOpen,
      title: "1. Créez vos capsules",
      description: "Enregistrez vos souvenirs sous forme de texte, photos, vidéos ou audio. Chaque capsule préserve un moment précieux."
    },
    {
      icon: Users,
      title: "2. Construisez votre arbre",
      description: "Créez votre arbre généalogique interactif et reliez vos souvenirs aux membres de votre famille."
    },
    {
      icon: Clock,
      title: "3. Explorez votre histoire",
      description: "Naviguez dans votre chronologie familiale et redécouvrez vos moments à travers le temps."
    },
    {
      icon: Share2,
      title: "4. Partagez en toute sécurité",
      description: "Créez des cercles privés pour partager vos souvenirs uniquement avec vos proches."
    },
    {
      icon: Sparkles,
      title: "5. L'IA vous accompagne",
      description: "Notre assistant vous aide à rédiger et enrichir vos récits pour des souvenirs encore plus vivants."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Mobile Header - Dark background */}
      <div className="lg:hidden bg-[#1a1a2e] px-5 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <img src={logo} alt="Family Garden" className="w-10 h-10 object-contain" />
          <span className="text-xl font-display font-bold text-white">
            Family<span className="text-secondary">Garden</span>
          </span>
        </Link>
      </div>

      {/* Left Panel - Tutorial "Comment ça marche ?" */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img src={heroBackground} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ backgroundColor: 'rgb(26 26 46 / 0.88)' }} />
        
        <div className="relative z-10 flex flex-col justify-center px-12 lg:px-16 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Link to="/" className="flex items-center space-x-3 mb-10">
              <img src={logo} alt="Family Garden" className="w-12 h-12 object-contain" />
              <span className="text-2xl font-display font-bold text-white">
                Family Garden
              </span>
            </Link>

            <h1 className="text-3xl lg:text-4xl font-display font-bold text-white mb-3 leading-tight">
              Comment ça marche ?
            </h1>
            
            <p className="text-lg text-white/80 max-w-md mb-8">
              Préservez votre héritage familial en quelques étapes simples
            </p>

            {/* Tutorial steps */}
            <div className="space-y-5">
              {tutorialSteps.map((step, index) => (
                <motion.div 
                  key={step.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                  className="flex gap-4 items-start"
                >
                  <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center flex-shrink-0">
                    <step.icon className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">{step.title}</h3>
                    <p className="text-white/70 text-sm leading-relaxed">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Trust indicators */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="mt-10 pt-8 border-t border-white/10"
            >
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-secondary" />
                  <span className="text-white/70 text-sm">100% sécurisé</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-secondary" />
                  <span className="text-white/70 text-sm">Gratuit pour commencer</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-5 py-8 sm:px-6 sm:py-12 bg-background">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >

          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#1a1a2e] mb-2">
              Créer un compte
            </h2>
            <p className="text-[#1a1a2e]/70 text-base">
              Commencez à préserver vos souvenirs dès aujourd'hui
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-base font-semibold text-[#1a1a2e]">Votre nom</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1a1a2e]/50" />
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Jean Dupont"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="pl-10 h-12 bg-white border-2 border-[#1a1a2e]/20 focus:border-primary text-[#1a1a2e] placeholder:text-[#1a1a2e]/40"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-semibold text-[#1a1a2e]">Adresse email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1a1a2e]/50" />
                <Input
                  id="email"
                  type="email"
                  placeholder="vous@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`pl-10 pr-10 h-12 bg-white border-2 text-[#1a1a2e] placeholder:text-[#1a1a2e]/40 ${
                    emailExists 
                      ? 'border-destructive focus:border-destructive' 
                      : 'border-[#1a1a2e]/20 focus:border-primary'
                  }`}
                  required
                />
                {checkingEmail && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1a1a2e]/50 animate-spin" />
                )}
                {!checkingEmail && emailExists && (
                  <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-destructive" />
                )}
                {!checkingEmail && email && !emailExists && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
                  <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600" />
                )}
              </div>
              {emailExists && (
                <p className="text-sm text-destructive font-medium mt-1 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  Cette adresse email est déjà utilisée.{' '}
                  <Link to="/login" className="underline hover:no-underline">
                    Se connecter ?
                  </Link>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmEmail" className="text-base font-semibold text-[#1a1a2e]">Confirmer l'adresse email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1a1a2e]/50" />
                <Input
                  id="confirmEmail"
                  type="email"
                  placeholder="vous@exemple.com"
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  className="pl-10 h-12 bg-white border-2 border-[#1a1a2e]/20 focus:border-primary text-[#1a1a2e] placeholder:text-[#1a1a2e]/40"
                  required
                />
              </div>
              {confirmEmail && email !== confirmEmail && (
                <p className="text-sm text-destructive font-medium mt-1">
                  Les adresses email ne correspondent pas
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-base font-semibold text-[#1a1a2e]">Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1a1a2e]/50" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12 bg-white border-2 border-[#1a1a2e]/20 focus:border-primary text-[#1a1a2e] placeholder:text-[#1a1a2e]/40"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1a1a2e]/50 hover:text-[#1a1a2e] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password requirements */}
              <div className="mt-3 space-y-1.5">
                {passwordRequirements.map((req) => (
                  <div key={req.label} className="flex items-center gap-2 text-sm">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                      req.met ? 'bg-green-600' : 'bg-[#1a1a2e]/20'
                    }`}>
                      {req.met && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className={req.met ? 'text-[#1a1a2e] font-medium' : 'text-[#1a1a2e]/60'}>
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-base font-semibold text-[#1a1a2e]">Confirmer le mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1a1a2e]/50" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 h-12 bg-white border-2 border-[#1a1a2e]/20 focus:border-primary text-[#1a1a2e] placeholder:text-[#1a1a2e]/40"
                  required
                />
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-sm text-destructive font-medium mt-1">
                  Les mots de passe ne correspondent pas
                </p>
              )}
            </div>

            <Button 
              type="submit" 
              variant="hero" 
              size="xl" 
              className="w-full mt-6"
              disabled={loading || emailExists}
            >
              {loading ? 'Création en cours...' : 'Créer mon compte'}
            </Button>
          </form>

          <div className="mt-5 text-center text-sm text-[#1a1a2e]/70">
            En créant un compte, vous acceptez nos{' '}
            <Link to="/terms" className="text-secondary font-medium hover:text-secondary/80">
              Conditions d'utilisation
            </Link>{' '}
            et notre{' '}
            <Link to="/privacy" className="text-secondary font-medium hover:text-secondary/80">
              Politique de confidentialité
            </Link>
          </div>

          <div className="mt-5 text-center">
            <p className="text-[#1a1a2e]/80 text-base">
              Déjà un compte ?{' '}
              <Link to="/login" className="text-secondary font-semibold hover:text-secondary/80 transition-colors">
                Se connecter
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
