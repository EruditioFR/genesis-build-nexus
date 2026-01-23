import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, Shield, Heart, Clock, Sparkles, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import logo from '@/assets/logo.png';
import heroBackground from '@/assets/hero-background.jpg';

const Login = () => {
  const { t } = useTranslation('auth');
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
        title: t('login.errors.title'),
        description: error.message === 'Invalid login credentials' 
          ? t('login.errors.invalidCredentials') 
          : error.message,
      });
    } else {
      toast({
        title: t('login.success.title'),
        description: t('login.success.description'),
      });
      navigate('/dashboard');
    }

    setLoading(false);
  };

  const tutorialSteps = [
    {
      icon: Shield,
      titleKey: "login.tutorial.secure.title",
      descriptionKey: "login.tutorial.secure.description"
    },
    {
      icon: Heart,
      titleKey: "login.tutorial.memories.title",
      descriptionKey: "login.tutorial.memories.description"
    },
    {
      icon: Users,
      titleKey: "login.tutorial.family.title",
      descriptionKey: "login.tutorial.family.description"
    },
    {
      icon: Clock,
      titleKey: "login.tutorial.continue.title",
      descriptionKey: "login.tutorial.continue.description"
    },
    {
      icon: Sparkles,
      titleKey: "login.tutorial.discover.title",
      descriptionKey: "login.tutorial.discover.description"
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

      {/* Left Panel - Tutorial "Bon retour parmi nous" */}
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
              {t('login.welcomeBack')}
            </h1>
            
            <p className="text-lg text-white/80 max-w-md mb-8">
              {t('login.welcomeSubtitle')}
            </p>

            {/* Tutorial steps */}
            <div className="space-y-5">
              {tutorialSteps.map((step, index) => (
                <motion.div 
                  key={step.titleKey}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                  className="flex gap-4 items-start"
                >
                  <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center flex-shrink-0">
                    <step.icon className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">{t(step.titleKey)}</h3>
                    <p className="text-white/70 text-sm leading-relaxed">{t(step.descriptionKey)}</p>
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
              <div className="flex items-center gap-4 text-white/60 text-sm">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-secondary/30 border-2 border-white/20" />
                  ))}
                </div>
                <span>{t('login.trustIndicator')}</span>
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
                <Input
                  id="email"
                  type="email"
                  placeholder={t('login.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 bg-white border-2 border-[#1a1a2e]/20 focus:border-primary text-[#1a1a2e] placeholder:text-[#1a1a2e]/40"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-base font-semibold text-[#1a1a2e]">{t('login.password')}</Label>
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-secondary hover:text-secondary/80 transition-colors"
                >
                  {t('login.forgotPassword')}
                </Link>
              </div>
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
            </div>

            <Button 
              type="submit" 
              variant="hero" 
              size="xl" 
              className="w-full mt-6"
              disabled={loading}
            >
              {loading ? t('login.loading') : t('login.submit')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[#1a1a2e]/80 text-base">
              {t('login.noAccount')}{' '}
              <Link to="/signup" className="text-secondary font-semibold hover:text-secondary/80 transition-colors">
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
    </div>
  );
};

export default Login;