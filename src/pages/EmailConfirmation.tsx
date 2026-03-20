import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import SEOHead from '@/components/seo/SEOHead';
import logo from '@/assets/logo.png';
import heroBackground from '@/assets/hero-background.webp';

const EmailConfirmation = () => {
  const { t } = useTranslation('auth');
  const location = useLocation();
  const email = location.state?.email || '';

  return (
    <>
      <SEOHead title={t('emailConfirmation.title')} description="" noIndex />
      <div className="min-h-screen relative flex items-center justify-center p-4">
        {/* Background image with overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBackground})` }}
        />
        <div className="absolute inset-0 bg-background/85 backdrop-blur-sm" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-md text-center space-y-6 bg-card/90 backdrop-blur-md rounded-2xl border border-border shadow-xl p-8"
        >
          <img src={logo} alt="Family Garden" className="h-14 mx-auto" />
          <h2 className="text-sm font-medium tracking-widest uppercase text-primary">
            Family Garden
          </h2>

          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Mail className="w-8 h-8 text-primary" />
          </div>

          <h1 className="text-2xl font-display font-bold text-foreground">
            {t('emailConfirmation.title')}
          </h1>

          <p className="text-muted-foreground">
            {t('emailConfirmation.description')}
          </p>

          {email && (
            <div className="flex items-center justify-center gap-2 rounded-lg bg-muted px-4 py-3">
              <CheckCircle className="w-4 h-4 text-primary shrink-0" />
              <span className="font-medium text-foreground text-sm">{email}</span>
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            {t('emailConfirmation.instruction')}
          </p>

          <div className="pt-2">
            <Button variant="outline" asChild>
              <Link to="/login">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('emailConfirmation.backToLogin')}
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default EmailConfirmation;
