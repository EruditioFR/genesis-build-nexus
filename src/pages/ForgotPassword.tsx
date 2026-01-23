import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import logo from '@/assets/logo.png';

const ForgotPassword = () => {
  const { t } = useTranslation('auth');
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
        title: t('forgotPassword.errors.title'),
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
                  {t('forgotPassword.title')}
                </h2>
                <p className="text-muted-foreground text-base">
                  {t('forgotPassword.subtitle')}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base">{t('forgotPassword.email')}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder={t('forgotPassword.emailPlaceholder')}
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
                  {loading ? t('forgotPassword.loading') : t('forgotPassword.submit')}
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
                {t('forgotPassword.success.title')}
              </h3>
              <p className="text-muted-foreground mb-6">
                {t('forgotPassword.success.description')}{' '}
                <span className="font-medium text-foreground">{email}</span>
                {' '}{t('forgotPassword.success.instruction')}
              </p>
              <p className="text-sm text-muted-foreground">
                {t('forgotPassword.success.noEmail')}{' '}
                <button
                  onClick={() => setSent(false)}
                  className="text-secondary hover:text-secondary/80 font-medium"
                >
                  {t('forgotPassword.success.resend')}
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
              {t('forgotPassword.backToLogin')}
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            {t('forgotPassword.needHelp')}{' '}
            <a href="mailto:support@familygarden.fr" className="text-secondary hover:text-secondary/80">
              {t('forgotPassword.contactSupport')}
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;