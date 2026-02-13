import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, Shield, Heart, Clock, Sparkles, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { lovable } from '@/integrations/lovable';
import logo from '@/assets/logo.png';
import heroBackground from '@/assets/hero-background.webp';
import SEOHead from '@/components/seo/SEOHead';

const Login = () => {
  const {
    t
  } = useTranslation('auth');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const {
    signIn
  } = useAuth();
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const {
      error
    } = await signIn(email, password);
    if (error) {
      toast({
        variant: 'destructive',
        title: t('login.errors.title'),
        description: error.message === 'Invalid login credentials' ? t('login.errors.invalidCredentials') : error.message
      });
    } else {
      toast({
        title: t('login.success.title'),
        description: t('login.success.description')
      });
      navigate(redirectTo);
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (error) {
      toast({
        variant: 'destructive',
        title: t('login.errors.title'),
        description: error.message,
      });
    }
  };
  const tutorialSteps = [{
    icon: Shield,
    titleKey: "login.tutorial.secure.title",
    descriptionKey: "login.tutorial.secure.description"
  }, {
    icon: Heart,
    titleKey: "login.tutorial.memories.title",
    descriptionKey: "login.tutorial.memories.description"
  }, {
    icon: Users,
    titleKey: "login.tutorial.family.title",
    descriptionKey: "login.tutorial.family.description"
  }, {
    icon: Clock,
    titleKey: "login.tutorial.continue.title",
    descriptionKey: "login.tutorial.continue.description"
  }, {
    icon: Sparkles,
    titleKey: "login.tutorial.discover.title",
    descriptionKey: "login.tutorial.discover.description"
  }];
  return <div className="min-h-screen flex flex-col lg:flex-row">
      <SEOHead
        title="Connexion | Family Garden"
        description="Connectez-vous à votre espace Family Garden pour retrouver et partager vos souvenirs de famille."
      />
      {/* Mobile Header - Dark background */}
      <div className="lg:hidden bg-[#1a1a2e] px-5 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <img src={logo} alt="Family Garden" className="w-10 h-10 object-contain" />
          <span className="text-xl font-display font-bold text-white">
            Family<span className="text-secondary">Garden</span>
          </span>
        </Link>
      </div>

      {/* Left Panel - Tutorial "Bon retour parmi nous" */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img src={heroBackground} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{
        backgroundColor: 'rgb(26 26 46 / 0.88)'
      }} />
        
        <div className="relative z-10 flex flex-col justify-center px-12 lg:px-16 py-12">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8
        }}>
            <Link to="/" className="flex items-center space-x-3 mb-10">
              <img src={logo} alt="Family Garden" className="w-12 h-12 object-contain" />
              <span className="text-2xl font-display font-bold text-white">
                Family Garden
              </span>
            </Link>

            <h1 className="text-3xl lg:text-4xl font-display font-bold text-white mb-3 leading-tight">
              {t('login.welcomeBack')}
            </h1>
            
            <p className="text-lg text-white/80 max-w-md mb-8">
              {t('login.welcomeSubtitle')}
            </p>

            {/* Tutorial steps */}
            <div className="space-y-5">
              {tutorialSteps.map((step, index) => <motion.div key={step.titleKey} initial={{
              opacity: 0,
              x: -20
            }} animate={{
              opacity: 1,
              x: 0
            }} transition={{
              duration: 0.5,
              delay: 0.2 + index * 0.1
            }} className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center flex-shrink-0">
                    <step.icon className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">{t(step.titleKey)}</h3>
                    <p className="text-white/70 text-sm leading-relaxed">{t(step.descriptionKey)}</p>
                  </div>
                </motion.div>)}
            </div>

            {/* Trust indicators */}
            <motion.div initial={{
            opacity: 0
          }} animate={{
            opacity: 1
          }} transition={{
            duration: 0.5,
            delay: 0.8
          }} className="mt-10 pt-8 border-t border-white/10">
              
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-5 py-8 sm:px-6 sm:py-12 bg-background">
        <motion.div initial={{
        opacity: 0,
        x: 20
      }} animate={{
        opacity: 1,
        x: 0
      }} transition={{
        duration: 0.6
      }} className="w-full max-w-md">

          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#1a1a2e] mb-2">
              {t('login.title')}
            </h2>
            <p className="text-[#1a1a2e]/70 text-base">
              {t('login.subtitle')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-semibold text-[#1a1a2e]">{t('login.email')}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1a1a2e]/50" />
                <Input id="email" type="email" placeholder={t('login.emailPlaceholder')} value={email} onChange={e => setEmail(e.target.value)} className="pl-10 h-12 bg-white border-2 border-[#1a1a2e]/20 focus:border-primary text-[#1a1a2e] placeholder:text-[#1a1a2e]/40" required />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-base font-semibold text-[#1a1a2e]">{t('login.password')}</Label>
                <Link to="/forgot-password" className="text-sm text-secondary hover:text-secondary/80 transition-colors">
                  {t('login.forgotPassword')}
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1a1a2e]/50" />
                <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="pl-10 pr-10 h-12 bg-white border-2 border-[#1a1a2e]/20 focus:border-primary text-[#1a1a2e] placeholder:text-[#1a1a2e]/40" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1a1a2e]/50 hover:text-[#1a1a2e] transition-colors">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button type="submit" variant="hero" size="xl" className="w-full mt-6" disabled={loading}>
              {loading ? t('login.loading') : t('login.submit')}
            </Button>
          </form>

          {/* Google Sign-in */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[#1a1a2e]/20" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-background px-2 text-[#1a1a2e]/60">{t('login.orContinueWith', 'ou continuer avec')}</span>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="xl"
              className="w-full mt-4 border-2 border-[#1a1a2e]/20 hover:bg-[#1a1a2e]/5"
              onClick={handleGoogleSignIn}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </Button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-[#1a1a2e]/80 text-base">
              {t('login.noAccount')}{' '}
              <Link to={`/signup${redirectTo !== '/dashboard' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`} className="text-secondary font-semibold hover:text-secondary/80 transition-colors">
                {t('login.createAccount')}
              </Link>
            </p>
          </div>

          {/* Trust indicators */}
          <div className="mt-10 pt-6 border-t border-[#1a1a2e]/10">
            <div className="flex items-center justify-center gap-4 md:gap-6 text-sm text-[#1a1a2e]/60 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>{t('login.security.ssl')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>🇫🇷</span>
                <span>{t('login.security.france')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>🔒</span>
                <span>{t('login.security.gdpr')}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>;
};
export default Login;