import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Lock, Crown, Sparkles, Building2, Check, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { CountrySelector } from '@/components/signup/CountrySelector';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import SEOHead from '@/components/seo/SEOHead';
import NoIndex from '@/components/seo/NoIndex';
import { useTranslation } from 'react-i18next';

type Plan = 'premium' | 'heritage';

const planMeta: Record<Plan, { label: string; price: string; sublabel: string; icon: any }> = {
  premium: {
    label: 'Premium',
    price: '5€/mois',
    sublabel: 'puis 9€/mois après 3 mois',
    icon: Sparkles,
  },
  heritage: {
    label: 'Héritage',
    price: '9€/mois',
    sublabel: 'puis 15€/mois après 3 mois',
    icon: Building2,
  },
};

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  const planParam = (searchParams.get('plan') || 'premium') as Plan;
  const plan: Plan = planParam === 'heritage' ? 'heritage' : 'premium';
  const billing = (searchParams.get('billing') || 'monthly') === 'yearly' ? 'yearly' : 'monthly';
  const canceled = searchParams.get('canceled') === 'true';

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('FR');
  const [city, setCity] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const meta = planMeta[plan];
  const Icon = meta.icon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!firstName.trim() || !lastName.trim()) {
      toast.error('Veuillez renseigner votre prénom et votre nom');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Veuillez saisir une adresse email valide');
      return;
    }
    if (!country) {
      toast.error('Veuillez sélectionner votre pays');
      return;
    }
    if (!acceptTerms) {
      toast.error("Vous devez accepter les Conditions Générales pour continuer");
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-guest-checkout', {
        body: {
          tier: plan,
          billing,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim().toLowerCase(),
          country,
          city: city.trim(),
          locale: i18n.language || 'fr',
        },
      });

      if (error) throw error;
      if (!data?.url) throw new Error('Lien de paiement introuvable');

      // Redirect to Stripe
      window.location.href = data.url;
    } catch (err: any) {
      console.error('Checkout error:', err);
      toast.error(err?.message || 'Une erreur est survenue. Réessayez.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-warm">
      <SEOHead
        title={`Souscrire ${meta.label} | Family Garden`}
        description="Créez votre compte et commencez à préserver vos souvenirs en quelques secondes."
      />
      <NoIndex />

      <header className="border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/premium">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux forfaits
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login">J'ai déjà un compte</Link>
          </Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Plan summary card */}
          <div className="bg-primary text-primary-foreground rounded-2xl p-5 mb-6 shadow-elevated">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-foreground/10 flex items-center justify-center shrink-0">
                <Icon className="w-6 h-6 text-secondary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-secondary" />
                  <span className="text-xs uppercase tracking-wide text-primary-foreground/70">
                    Forfait sélectionné
                  </span>
                </div>
                <h2 className="text-xl font-display font-bold">{meta.label}</h2>
                <p className="text-sm text-primary-foreground/80">
                  <span className="font-semibold">{meta.price}</span>
                  <span className="text-primary-foreground/60"> · {meta.sublabel}</span>
                </p>
              </div>
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
            Créez votre compte en 1 minute
          </h1>
          <p className="text-muted-foreground mb-6">
            Renseignez vos informations puis finalisez le paiement. Vous recevrez un email pour
            définir votre mot de passe et accéder à votre espace.
          </p>

          {canceled && (
            <div className="mb-6 p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
              Le paiement a été annulé. Vous pouvez réessayer ci-dessous.
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-elevated space-y-5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="h-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Adresse email *</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12"
              />
              <p className="text-xs text-muted-foreground">
                Nous vous enverrons votre lien de connexion à cette adresse.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Pays *</Label>
                <CountrySelector value={country} onChange={setCountry} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Ville</Label>
                <Input
                  id="city"
                  autoComplete="address-level2"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="h-12"
                />
              </div>
            </div>

            <div className="flex items-start gap-3 pt-2">
              <Checkbox
                id="terms"
                checked={acceptTerms}
                onCheckedChange={(c) => setAcceptTerms(c === true)}
                className="mt-1"
              />
              <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                J'accepte les{' '}
                <Link to="/cgv" target="_blank" className="text-primary underline underline-offset-2">
                  Conditions Générales de Vente
                </Link>{' '}
                et la{' '}
                <Link to="/privacy" target="_blank" className="text-primary underline underline-offset-2">
                  Politique de confidentialité
                </Link>
                .
              </label>
            </div>

            <Button
              type="submit"
              size="lg"
              variant="hero"
              className="w-full"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Redirection vers le paiement...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Continuer vers le paiement sécurisé
                </>
              )}
            </Button>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
              <ShieldCheck className="w-4 h-4 text-secondary" />
              Paiement 100% sécurisé via Stripe · Annulable à tout moment
            </div>
          </form>

          <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-secondary shrink-0" />
              Aucune carte requise pour tester gratuitement (option {' '}
              <Link to="/signup" className="underline underline-offset-2">inscription gratuite</Link>)
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-secondary shrink-0" />
              Email de confirmation immédiat avec lien de connexion
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-secondary shrink-0" />
              Support 7j/7 par email
            </li>
          </ul>
        </motion.div>
      </main>
    </div>
  );
};

export default Checkout;
