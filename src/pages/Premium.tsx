import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, Crown, Sparkles, Loader2, Shield, Zap, Users, HardDrive, Palette, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from 'sonner';

const Premium = () => {
  const { user } = useAuth();
  const { createCheckout, tier } = useSubscription();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isYearly, setIsYearly] = useState(false);

  const handleSubscribe = async () => {
    if (!user) {
      navigate('/signup');
      return;
    }

    setIsLoading(true);
    try {
      await createCheckout('premium');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la création du paiement');
    } finally {
      setIsLoading(false);
    }
  };

  const comparisonFeatures = [
    {
      feature: 'Espace de stockage',
      free: '500 Mo',
      premium: '5 Go',
      icon: HardDrive,
    },
    {
      feature: 'Capsules texte',
      free: 'Illimitées',
      premium: 'Illimitées',
      icon: Sparkles,
    },
    {
      feature: 'Capsules photo/vidéo/audio',
      free: 'Limitées (selon stockage)',
      premium: 'Illimitées',
      icon: Zap,
    },
    {
      feature: 'Cercles de partage',
      free: '1 cercle (5 membres)',
      premium: '5 cercles (50 membres)',
      icon: Users,
    },
    {
      feature: 'Export PDF',
      free: '1x par mois',
      premium: 'Illimité',
      icon: Download,
    },
    {
      feature: 'Suggestions IA',
      free: '10 par mois',
      premium: 'Illimitées',
      icon: Sparkles,
    },
    {
      feature: 'Thèmes premium',
      free: false,
      premium: true,
      icon: Palette,
    },
    {
      feature: 'Chronologie avancée',
      free: false,
      premium: true,
      icon: Zap,
    },
    {
      feature: 'Sans publicité',
      free: false,
      premium: true,
      icon: Shield,
    },
    {
      feature: 'Support prioritaire',
      free: false,
      premium: true,
      icon: Users,
    },
  ];

  const benefits = [
    {
      title: '10x plus de stockage',
      description: 'Passez de 500 Mo à 5 Go pour stocker tous vos souvenirs précieux.',
      icon: HardDrive,
    },
    {
      title: 'Partage étendu',
      description: 'Créez jusqu\'à 5 cercles et invitez jusqu\'à 50 membres au total.',
      icon: Users,
    },
    {
      title: 'IA illimitée',
      description: 'Profitez de suggestions personnalisées sans limite pour enrichir vos capsules.',
      icon: Sparkles,
    },
    {
      title: 'Export illimité',
      description: 'Exportez vos capsules en PDF autant de fois que vous le souhaitez.',
      icon: Download,
    },
  ];

  const isPremium = tier === 'premium' || tier === 'heritage';

  return (
    <div className="min-h-screen bg-gradient-warm">
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

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
            Passez à <span className="text-secondary">Premium</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Débloquez tout le potentiel de MemoriaVita et préservez vos souvenirs sans limite.
          </p>
        </motion.div>

        {/* Pricing Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-primary text-primary-foreground rounded-3xl p-8 md:p-10 shadow-elevated mb-12 max-w-xl mx-auto"
        >
          <div className="text-center mb-6">
            <Badge className="bg-secondary text-secondary-foreground mb-4">
              Le plus populaire
            </Badge>
            <h2 className="text-2xl font-display font-bold mb-2">Premium</h2>
            <p className="text-primary-foreground/70">Pour les créateurs de contenu réguliers</p>
          </div>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className={`text-sm font-medium ${!isYearly ? 'text-primary-foreground' : 'text-primary-foreground/60'}`}>
              Mensuel
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                isYearly ? 'bg-secondary' : 'bg-primary-foreground/20'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-card shadow-sm transition-transform duration-300 ${
                  isYearly ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${isYearly ? 'text-primary-foreground' : 'text-primary-foreground/60'}`}>
              Annuel
            </span>
            {isYearly && (
              <Badge variant="outline" className="border-secondary text-secondary">
                -17%
              </Badge>
            )}
          </div>

          <div className="text-center mb-8">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-5xl font-display font-bold">
                {isYearly ? '99' : '9,99'}€
              </span>
              <span className="text-primary-foreground/70">
                /{isYearly ? 'an' : 'mois'}
              </span>
            </div>
            {isYearly && (
              <p className="text-sm text-primary-foreground/60 mt-1">
                soit 8,25€/mois
              </p>
            )}
          </div>

          {isPremium ? (
            <div className="text-center p-4 rounded-xl bg-primary-foreground/10">
              <Check className="w-8 h-8 text-secondary mx-auto mb-2" />
              <p className="font-medium">Vous êtes déjà Premium !</p>
              <p className="text-sm text-primary-foreground/70">
                Profitez de tous les avantages.
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
                  <Crown className="w-4 h-4 mr-2" />
                  {user ? 'Passer à Premium' : 'Créer un compte et passer Premium'}
                </>
              )}
            </Button>
          )}
        </motion.div>

        {/* Benefits Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-display font-bold text-foreground text-center mb-8">
            Pourquoi passer Premium ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                className="p-6 rounded-2xl bg-card border border-border"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-gold flex items-center justify-center mb-4">
                  <benefit.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-2xl font-display font-bold text-foreground text-center mb-8">
            Comparaison détaillée
          </h2>
          <div className="rounded-2xl border border-border overflow-hidden bg-card">
            {/* Header */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 border-b border-border">
              <div className="font-medium text-foreground">Fonctionnalité</div>
              <div className="text-center">
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <Sparkles className="w-4 h-4" />
                  Gratuit
                </span>
              </div>
              <div className="text-center">
                <span className="inline-flex items-center gap-1.5 text-secondary font-medium">
                  <Crown className="w-4 h-4" />
                  Premium
                </span>
              </div>
            </div>
            
            {/* Rows */}
            {comparisonFeatures.map((item, index) => (
              <div
                key={item.feature}
                className={`grid grid-cols-3 gap-4 p-4 items-center ${
                  index !== comparisonFeatures.length - 1 ? 'border-b border-border' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <item.icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{item.feature}</span>
                </div>
                <div className="text-center">
                  {typeof item.free === 'boolean' ? (
                    item.free ? (
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    ) : (
                      <X className="w-5 h-5 text-muted-foreground mx-auto" />
                    )
                  ) : (
                    <span className="text-sm text-muted-foreground">{item.free}</span>
                  )}
                </div>
                <div className="text-center">
                  {typeof item.premium === 'boolean' ? (
                    item.premium ? (
                      <Check className="w-5 h-5 text-secondary mx-auto" />
                    ) : (
                      <X className="w-5 h-5 text-muted-foreground mx-auto" />
                    )
                  ) : (
                    <span className="text-sm font-medium text-secondary">{item.premium}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        {!isPremium && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-center mt-12"
          >
            <Button
              onClick={handleSubscribe}
              variant="gold"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Chargement...
                </>
              ) : (
                <>
                  <Crown className="w-4 h-4 mr-2" />
                  Passer à Premium maintenant
                </>
              )}
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              Garantie satisfait ou remboursé pendant 14 jours
            </p>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Premium;
