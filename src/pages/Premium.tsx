import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check, X, Crown, Sparkles, Loader2, Shield, Zap, Users, HardDrive, Building2, TreePine, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from 'sonner';
import MobileBottomNav from '@/components/dashboard/MobileBottomNav';
import SEOHead from '@/components/seo/SEOHead';
import { createBreadcrumbSchema } from '@/lib/seoSchemas';

const Premium = () => {
  const { user } = useAuth();
  const { createCheckout, tier: currentTier } = useSubscription();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState<'premium' | 'heritage' | null>(null);
  const [isYearly, setIsYearly] = useState(false);
  
  // Determine which plan to highlight based on URL parameter
  const requestedTier = searchParams.get('tier');
  const highlightHeritage = requestedTier === 'heritage';

  const handleSubscribe = async (selectedTier: 'premium' | 'heritage') => {
    if (!user) {
      navigate('/signup');
      return;
    }

    setIsLoading(selectedTier);
    try {
      const billing = isYearly ? 'yearly' : 'monthly';
      await createCheckout(selectedTier, billing);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la création du paiement');
    } finally {
      setIsLoading(null);
    }
  };

  const premiumFeatures = [
    { feature: 'Espace de stockage', value: '10 Go', icon: HardDrive },
    { feature: 'Tous les formats de capsules', value: 'Texte, photo, vidéo, audio', icon: Sparkles },
    { feature: 'Chronologie avancée', value: true, icon: Zap },
    { feature: 'Partage de souvenirs', value: '5 personnes (famille, amis...)', icon: Users },
    { feature: 'Sans publicité', value: true, icon: Shield },
  ];

  const heritageFeatures = [
    { feature: 'Espace de stockage', value: '50 Go', icon: HardDrive },
    { feature: 'Tous les formats de capsules', value: 'Texte, photo, vidéo, audio', icon: Sparkles },
    { feature: 'Chronologie avancée', value: true, icon: Zap },
    { feature: 'Partages illimités', value: 'Famille & amis', icon: Users },
    { feature: 'Arbre généalogique interactif', value: true, icon: TreePine },
    { feature: 'Podcast de vos souvenirs', value: true, icon: Mic },
    { feature: 'Support VIP WhatsApp', value: true, icon: Crown },
    { feature: 'Sans publicité', value: true, icon: Shield },
  ];

  const isPremium = currentTier === 'premium';
  const isHeritage = currentTier === 'heritage';

  return (
    <div className="min-h-screen bg-gradient-warm pb-24 md:pb-0">
      <SEOHead
        title="Tarifs et abonnements | Family Garden"
        description="Découvrez les forfaits Family Garden : Gratuit, Premium (9,99€/mois) et Héritage (19,99€/mois). Préservez vos souvenirs sans limite."
        jsonLd={createBreadcrumbSchema([
          { name: "Accueil", url: "/" },
          { name: "Tarifs", url: "/premium" },
        ])}
      />
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to={user ? '/dashboard' : '/'}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Link>
              </Button>
            </div>
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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-gold shadow-gold mb-6">
            <Crown className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            Choisissez votre <span className="text-secondary">forfait</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Débloquez tout le potentiel de FamilyGarden et préservez vos souvenirs sans limite.
          </p>
        </motion.div>

        {/* Billing Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center justify-center gap-4 mb-10"
        >
          <span className={`text-sm font-medium ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
            Mensuel
          </span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
              isYearly ? 'bg-secondary' : 'bg-muted'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-card shadow-sm transition-transform duration-300 ${
                isYearly ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
            Annuel
          </span>
          {isYearly && (
            <Badge variant="outline" className="border-secondary text-secondary">
              2 mois gratuits
            </Badge>
          )}
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 mb-12">
          {/* Premium Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`relative rounded-3xl p-8 shadow-elevated ${
              highlightHeritage 
                ? 'bg-card border border-border' 
                : 'bg-primary text-primary-foreground'
            }`}
          >
            {!highlightHeritage && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-secondary text-secondary-foreground">
                  Le plus populaire
                </Badge>
              </div>
            )}
            
            <div className="text-center mb-6">
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4 ${
                highlightHeritage ? 'bg-secondary/15' : 'bg-primary-foreground/10'
              }`}>
                <Sparkles className={`w-7 h-7 ${highlightHeritage ? 'text-secondary' : 'text-secondary'}`} />
              </div>
              <h2 className={`text-2xl font-display font-bold mb-2 ${
                highlightHeritage ? 'text-foreground' : 'text-primary-foreground'
              }`}>
                Premium
              </h2>
              <p className={highlightHeritage ? 'text-muted-foreground' : 'text-primary-foreground/70'}>
                Pour les créateurs réguliers
              </p>
            </div>

            <div className="text-center mb-6">
              <div className="flex items-baseline justify-center gap-1">
                <span className={`text-5xl font-display font-bold ${
                  highlightHeritage ? 'text-foreground' : 'text-primary-foreground'
                }`}>
                  {isYearly ? '99' : '9,99'}€
                </span>
                <span className={highlightHeritage ? 'text-muted-foreground' : 'text-primary-foreground/70'}>
                  /{isYearly ? 'an' : 'mois'}
                </span>
              </div>
              {isYearly && (
                <p className={`text-sm mt-1 ${highlightHeritage ? 'text-muted-foreground' : 'text-primary-foreground/60'}`}>
                  soit 8,25€/mois
                </p>
              )}
            </div>

            <ul className="space-y-3 mb-8">
              {premiumFeatures.map((item) => (
                <li key={item.feature} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-secondary flex-shrink-0" />
                  <span className={`text-sm ${highlightHeritage ? 'text-muted-foreground' : 'text-primary-foreground/90'}`}>
                    {item.feature}: {typeof item.value === 'boolean' ? 'Inclus' : item.value}
                  </span>
                </li>
              ))}
            </ul>

            {isPremium || isHeritage ? (
              <div className={`text-center p-4 rounded-xl ${highlightHeritage ? 'bg-muted' : 'bg-primary-foreground/10'}`}>
                <Check className="w-8 h-8 text-secondary mx-auto mb-2" />
                <p className="font-medium">
                  {isHeritage ? 'Vous avez Héritage' : 'Votre forfait actuel'}
                </p>
              </div>
            ) : (
              <Button
                onClick={() => handleSubscribe('premium')}
                variant={highlightHeritage ? 'secondary' : 'hero'}
                size="lg"
                className="w-full"
                disabled={isLoading !== null}
              >
                {isLoading === 'premium' ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Chargement...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Choisir Premium
                  </>
                )}
              </Button>
            )}
          </motion.div>

          {/* Heritage Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className={`relative rounded-3xl p-8 shadow-elevated ${
              highlightHeritage 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-card border border-border'
            }`}
          >
            {highlightHeritage && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-secondary text-secondary-foreground">
                  Recommandé pour vous
                </Badge>
              </div>
            )}
            
            <div className="text-center mb-6">
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4 ${
                highlightHeritage ? 'bg-primary-foreground/10' : 'bg-primary/15'
              }`}>
                <Building2 className={`w-7 h-7 ${highlightHeritage ? 'text-secondary' : 'text-primary'}`} />
              </div>
              <h2 className={`text-2xl font-display font-bold mb-2 ${
                highlightHeritage ? 'text-primary-foreground' : 'text-foreground'
              }`}>
                Héritage
              </h2>
              <p className={highlightHeritage ? 'text-primary-foreground/70' : 'text-muted-foreground'}>
                Pour les familles multigénérationnelles
              </p>
            </div>

            <div className="text-center mb-6">
              <div className="flex items-baseline justify-center gap-1">
                <span className={`text-5xl font-display font-bold ${
                  highlightHeritage ? 'text-primary-foreground' : 'text-foreground'
                }`}>
                  {isYearly ? '199' : '19,99'}€
                </span>
                <span className={highlightHeritage ? 'text-primary-foreground/70' : 'text-muted-foreground'}>
                  /{isYearly ? 'an' : 'mois'}
                </span>
              </div>
              {isYearly && (
                <p className={`text-sm mt-1 ${highlightHeritage ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                  soit 16,58€/mois
                </p>
              )}
            </div>

            <ul className="space-y-3 mb-8">
              {heritageFeatures.map((item) => (
                <li key={item.feature} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-secondary flex-shrink-0" />
                  <span className={`text-sm ${highlightHeritage ? 'text-primary-foreground/90' : 'text-muted-foreground'}`}>
                    {item.feature}: {typeof item.value === 'boolean' ? 'Inclus' : item.value}
                  </span>
                </li>
              ))}
            </ul>

            {isHeritage ? (
              <div className={`text-center p-4 rounded-xl ${highlightHeritage ? 'bg-primary-foreground/10' : 'bg-muted'}`}>
                <Check className="w-8 h-8 text-secondary mx-auto mb-2" />
                <p className="font-medium">Votre forfait actuel</p>
              </div>
            ) : (
              <Button
                onClick={() => handleSubscribe('heritage')}
                variant={highlightHeritage ? 'hero' : 'default'}
                size="lg"
                className="w-full"
                disabled={isLoading !== null}
              >
                {isLoading === 'heritage' ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Chargement...
                  </>
                ) : (
                  <>
                    <Building2 className="w-4 h-4 mr-2" />
                    Choisir Héritage
                  </>
                )}
              </Button>
            )}
          </motion.div>
        </div>

        {/* Guarantee */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center"
        >
          <p className="text-sm text-muted-foreground">
            🛡️ Garantie satisfait ou remboursé pendant 14 jours • Annulation à tout moment
          </p>
        </motion.div>
      </main>

      <MobileBottomNav />
    </div>
  );
};

export default Premium;
