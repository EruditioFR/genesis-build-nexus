import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Mail, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SEOHead from '@/components/seo/SEOHead';
import NoIndex from '@/components/seo/NoIndex';

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  return (
    <div className="min-h-screen bg-gradient-warm flex items-center justify-center px-4">
      <SEOHead title="Paiement confirmé | Family Garden" description="Votre abonnement est actif." />
      <NoIndex />

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-lg w-full bg-card border border-border rounded-3xl p-8 md:p-10 text-center shadow-elevated"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary/15 mb-6">
          <CheckCircle2 className="w-12 h-12 text-secondary" strokeWidth={2.2} />
        </div>

        <h1 className="text-3xl font-display font-bold text-foreground mb-3">
          Merci pour votre abonnement !
        </h1>
        <p className="text-muted-foreground mb-6 leading-relaxed">
          Votre paiement a bien été reçu et votre compte Family Garden est désormais actif.
        </p>

        <div className="bg-muted/40 rounded-xl p-5 mb-6 text-left">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground mb-1">Vérifiez votre boîte mail</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Nous venons de vous envoyer un email pour <strong>définir votre mot de passe</strong>{' '}
                et accéder à votre espace. Pensez à consulter vos spams si vous ne le voyez pas dans
                quelques minutes.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg" variant="hero">
            <Link to="/login">
              Aller à la connexion
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/">Retour à l'accueil</Link>
          </Button>
        </div>

        {sessionId && (
          <p className="text-xs text-muted-foreground/60 mt-6 break-all">
            Référence : {sessionId.substring(0, 24)}...
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default CheckoutSuccess;
