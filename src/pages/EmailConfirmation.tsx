import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import SEOHead from '@/components/seo/SEOHead';
import logo from '@/assets/logo.png';

const EmailConfirmation = () => {
  const { t } = useTranslation('auth');
  const location = useLocation();
  const email = location.state?.email || '';

  return (
    <>
      <SEOHead title={t('emailConfirmation.title')} noIndex />
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md text-center space-y-6"
        >
          <img src={logo} alt="Family Garden" className="h-12 mx-auto mb-4" />

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

          <div className="pt-4">
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
