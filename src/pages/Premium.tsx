import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Crown, Sparkles, Loader2, Shield, Zap, Users, HardDrive, TreePine, Mic, Tag, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from 'sonner';
import MobileBottomNav from '@/components/dashboard/MobileBottomNav';
import SEOHead from '@/components/seo/SEOHead';
import { createBreadcrumbSchema } from '@/lib/seoSchemas';

const ESSENTIAL_MONTHLY = 2.99;
const ESSENTIAL_YEARLY = 29.90;
const ADDON_MONTHLY = 5;
const ADDON_YEARLY = 50;

const Premium = () => {
  const { user } = useAuth();
  const {
    createCheckout,
    tier: currentTier,
    hasFamilyTreeAddon,
    trialing,
    trialEndsAt,
    checkSubscription,
  } = useSubscription();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isYearly, setIsYearly] = useState(false);
  const [withTree, setWithTree] = useState(hasFamilyTreeAddon);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  useEffect(() => {
    if (user) void checkSubscription(true);
  }, [user, checkSubscription]);

  useEffect(() => {
    setWithTree(hasFamilyTreeAddon);
  }, [hasFamilyTreeAddon]);

  const isGrandfathered = currentTier === 'premium' || currentTier === 'heritage';
  const isEssential = currentTier === 'essential';

  const basePrice = isYearly ? ESSENTIAL_YEARLY : ESSENTIAL_MONTHLY;
  const addonPrice = isYearly ? ADDON_YEARLY : ADDON_MONTHLY;
  const total = basePrice + (withTree ? addonPrice : 0);
  const period = isYearly ? 'an' : 'mois';

  const handleSubscribe = async () => {
    if (!user) {
      const billing = isYearly ? 'yearly' : 'monthly';
      navigate(`/checkout?plan=essential&billing=${billing}&tree=${withTree ? '1' : '0'}`);
      return;
    }
    setIsLoading(true);
    try {
      const billing = isYearly ? 'yearly' : 'monthly';
      await createCheckout({
        billing,
        withFamilyTree: withTree,
        promoCode: promoApplied ? promoCode : undefined,
      });
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la création du paiement');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    { feature: '20 Go de stockage sécurisé', icon: HardDrive },
    { feature: 'Souvenirs illimités (texte, photo, vidéo, audio)', icon: Sparkles },
    { feature: 'Cercles de partage illimités', icon: Users },
    { feature: 'Chronologie interactive avancée', icon: Zap },
    { feature: 'Souvenirs testament (legs posthume)', icon: Shield },
    { feature: 'Podcast IA de vos souvenirs', icon: Mic },
    { feature: 'Sans publicité', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gradient-warm pb-24 md:pb-0">
      <SEOHead
        title="Tarifs Family Garden : 2,99 €/mois pour préserver vos souvenirs"
        description="Un tarif unique et transparent : 2,99 €/mois pour tous vos souvenirs et 20 Go de stockage. Option Arbre généalogique à 5 €/mois. 14 jours d'essai gratuit."
        jsonLd={createBreadcrumbSchema([
          { name: 'Accueil', url: '/' },
          { name: 'Tarifs', url: '/premium' },
        ])}
      />

      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" asChild>
              <Link to={user ? '/dashboard' : '/'}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Link>
            </Button>
            {!user && (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Connexion</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/signup">Inscription</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-gold shadow-gold mb-6">
            <Crown className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            Un tarif unique et <span className="text-secondary">transparent</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Toutes les fonctionnalités de Family Garden pour 2,99 €/mois. 14 jours d'essai gratuit, sans engagement.
          </p>
        </motion.div>

        {/* Trial banner */}
        {trialing && trialEndsAt && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-xl border border-secondary/40 bg-secondary/5 p-4 flex items-center gap-3"
          >
            <Gift className="w-5 h-5 text-secondary shrink-0" />
            <p className="text-sm text-foreground">
              Votre essai gratuit se termine le{' '}
              <strong>{new Date(trialEndsAt).toLocaleDateString('fr-FR')}</strong>. Abonnez-vous pour continuer à profiter de Family Garden.
            </p>
          </motion.div>
        )}

        {/* Grandfathered banner */}
        {isGrandfathered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-xl border border-primary/30 bg-primary/5 p-4 flex items-center gap-3"
          >
            <Crown className="w-5 h-5 text-primary shrink-0" />
            <p className="text-sm text-foreground">
              Vous bénéficiez de votre ancien forfait <strong>{currentTier === 'heritage' ? 'Héritage' : 'Premium'}</strong> à son tarif d'origine. Aucun changement n'est nécessaire.
            </p>
          </motion.div>
        )}

        {/* Billing toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center justify-center gap-4 mb-8"
        >
          <span className={`text-sm font-medium ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
            Mensuel
          </span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${isYearly ? 'bg-secondary' : 'bg-muted'}`}
            aria-label="Basculer entre mensuel et annuel"
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-card shadow-sm transition-transform duration-300 ${isYearly ? 'translate-x-6' : 'translate-x-0'}`}
            />
          </button>
          <span className={`text-sm font-medium ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
            Annuel
          </span>
          {isYearly && (
            <Badge variant="outline" className="border-secondary text-secondary">
              2 mois offerts
            </Badge>
          )}
        </motion.div>

        {/* Promo code */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex items-center justify-center gap-3 mb-8"
        >
          <div className="relative flex items-center gap-2">
            <Tag className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Code promo"
              value={promoCode}
              onChange={(e) => {
                setPromoCode(e.target.value);
                setPromoApplied(false);
              }}
              className="w-44 h-9 text-sm"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (promoCode.trim().toLowerCase() === 'mamie') {
                  setPromoApplied(true);
                  toast.success('Code promo "Mamie" appliqué');
                } else {
                  setPromoApplied(false);
                  toast.error('Code promo invalide');
                }
              }}
              disabled={!promoCode.trim()}
            >
              Appliquer
            </Button>
          </div>
          {promoApplied && (
            <Badge variant="outline" className="border-secondary text-secondary">
              Code appliqué
            </Badge>
          )}
        </motion.div>

        {/* Main plan card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative rounded-3xl p-8 shadow-elevated bg-card border-2 border-primary/20"
        >
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4 bg-primary/10">
              <Sparkles className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-2xl font-display font-bold text-foreground mb-2">
              Family Garden Essentiel
            </h2>
            <p className="text-muted-foreground">
              Tout ce qu'il vous faut pour préserver l'histoire de votre famille.
            </p>
          </div>

          <div className="text-center mb-8">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-5xl font-display font-bold text-foreground">
                {basePrice.toFixed(2).replace('.', ',')} €
              </span>
              <span className="text-muted-foreground">/{period}</span>
            </div>
            {isYearly && (
              <p className="text-sm text-muted-foreground mt-1">
                soit 2,49 €/mois — 2 mois offerts
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              14 jours d'essai gratuit — sans engagement
            </p>
          </div>

          <ul className="space-y-3 mb-8 max-w-md mx-auto">
            {features.map((item) => (
              <li key={item.feature} className="flex items-center gap-3">
                <Check className="w-5 h-5 text-secondary flex-shrink-0" />
                <span className="text-sm text-foreground">{item.feature}</span>
              </li>
            ))}
          </ul>

          {/* Family tree add-on */}
          <div className="rounded-2xl border border-border bg-muted/30 p-5 mb-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                  <TreePine className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground">
                    Arbre généalogique interactif
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Reliez vos souvenirs à vos ancêtres. Option facultative à{' '}
                    <strong>{addonPrice.toFixed(2).replace('.', ',')} €/{period}</strong>.
                  </p>
                </div>
              </div>
              <Switch
                checked={withTree}
                onCheckedChange={setWithTree}
                aria-label="Activer l'option arbre généalogique"
              />
            </div>
          </div>

          {/* Total */}
          <div className="flex items-baseline justify-between mb-6 pb-6 border-b border-border">
            <span className="text-sm text-muted-foreground">Total</span>
            <div className="text-right">
              <span className="text-3xl font-display font-bold text-foreground">
                {total.toFixed(2).replace('.', ',')} €
              </span>
              <span className="text-sm text-muted-foreground">/{period}</span>
            </div>
          </div>

          {isEssential && withTree === hasFamilyTreeAddon ? (
            <div className="text-center p-4 rounded-xl bg-muted">
              <Check className="w-8 h-8 text-secondary mx-auto mb-2" />
              <p className="font-medium text-foreground">Votre forfait actuel</p>
            </div>
          ) : isGrandfathered ? (
            <div className="text-center p-4 rounded-xl bg-muted">
              <p className="text-sm text-muted-foreground">
                Vous êtes déjà abonné à un forfait historique.
              </p>
            </div>
          ) : (
            <Button
              onClick={handleSubscribe}
              variant="hero"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Chargement...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {isEssential ? (withTree ? 'Activer l\'arbre généalogique' : 'Désactiver l\'arbre généalogique') : 'Commencer l\'essai gratuit de 14 jours'}
                </>
              )}
            </Button>
          )}
        </motion.div>

        {/* Guarantee */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-8"
        >
          <p className="text-sm text-muted-foreground">
            🛡️ 14 jours d'essai gratuit • Annulation à tout moment • Paiement sécurisé Stripe
          </p>
        </motion.div>
      </main>

      <MobileBottomNav />
    </div>
  );
};

export default Premium;
