import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, TreePine, Loader2, Gift, ArrowRight } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "sonner";

const ESSENTIAL_MONTHLY = 2.99;
const ESSENTIAL_YEARLY = 29.90;
const ADDON_MONTHLY = 5;
const ADDON_YEARLY = 50;

const includedFeatures = [
  "20 Go de stockage sécurisé",
  "Souvenirs illimités (texte, photo, vidéo, audio)",
  "Cercles de partage illimités",
  "Chronologie interactive avancée",
  "Souvenirs testament (legs posthume)",
  "Podcast IA de vos souvenirs",
  "Sans publicité",
];

const PricingSection = () => {
  const [isYearly, setIsYearly] = useState(false);
  const [withTree, setWithTree] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { createCheckout } = useSubscription();
  const navigate = useNavigate();

  const base = isYearly ? ESSENTIAL_YEARLY : ESSENTIAL_MONTHLY;
  const addon = withTree ? (isYearly ? ADDON_YEARLY : ADDON_MONTHLY) : 0;
  const total = base + addon;
  const period = isYearly ? 'an' : 'mois';

  const handleSubscribe = async () => {
    if (!user) {
      const billing = isYearly ? 'yearly' : 'monthly';
      navigate(`/checkout?billing=${billing}&tree=${withTree ? '1' : '0'}`);
      return;
    }
    setLoading(true);
    try {
      await createCheckout({ billing: isYearly ? 'yearly' : 'monthly', withFamilyTree: withTree });
    } catch (error: any) {
      toast.error(error.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="pricing" className="py-16 sm:py-24 bg-background relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 -left-20 w-48 sm:w-80 h-48 sm:h-80 rounded-full bg-secondary/5 blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-64 sm:w-96 h-64 sm:h-96 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-8 sm:mb-10"
        >
          <span className="inline-block px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-3 sm:mb-4">
            Tarifs
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-3">
            Un tarif unique et transparent
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground px-2">
            2,99 €/mois pour tout Family Garden. 14 jours d'essai gratuit, sans engagement.
          </p>
        </motion.div>

        {/* Billing Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center justify-center mb-8"
        >
          <div className="inline-flex items-center gap-3 bg-muted/50 rounded-full px-5 py-2 border border-border/50">
            <span className={`text-sm font-medium transition-colors ${!isYearly ? "text-foreground" : "text-muted-foreground/60"}`}>
              Mensuel
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${isYearly ? "bg-secondary" : "bg-border"}`}
              aria-label="Basculer mensuel/annuel"
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-card shadow-sm transition-transform duration-300 ${isYearly ? "translate-x-6" : "translate-x-0"}`}
              />
            </button>
            <span className={`text-sm font-medium transition-colors ${isYearly ? "text-foreground" : "text-muted-foreground/60"}`}>
              Annuel <span className="text-secondary">(-17%)</span>
            </span>
          </div>
        </motion.div>

        {/* Single plan card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto relative rounded-3xl p-6 sm:p-10 bg-card shadow-elevated border-2 border-primary/20"
        >
          <div className="text-center mb-6 mt-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 bg-primary/10">
              <Sparkles className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-2xl font-display font-bold text-foreground mb-2">
              Family Garden Essentiel
            </h3>
            <p className="text-muted-foreground">
              Tout ce qu'il vous faut pour préserver l'histoire de votre famille.
            </p>
          </div>

          <div className="text-center mb-8">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-5xl font-display font-bold text-foreground">
                {base.toFixed(2).replace('.', ',')}
              </span>
              <span className="text-2xl font-display font-bold text-foreground">€</span>
              <span className="text-muted-foreground ml-1">TTC /{period}</span>
            </div>
            {isYearly && (
              <p className="text-sm text-muted-foreground mt-1">soit 2,49 €/mois — 2 mois offerts</p>
            )}
            <p className="inline-flex items-center gap-1.5 text-xs font-medium text-secondary mt-3 px-3 py-1 rounded-full bg-secondary/10">
              <Gift className="w-3.5 h-3.5" />
              14 jours d'essai gratuit
            </p>
          </div>

          <ul className="space-y-3 mb-8 max-w-md mx-auto">
            {includedFeatures.map((feature) => (
              <li key={feature} className="flex items-start gap-3">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5 text-secondary" />
                <span className="text-sm text-foreground">{feature}</span>
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
                  <h4 className="font-display font-semibold text-foreground">
                    Arbre généalogique interactif
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Option facultative à{' '}
                    <strong>{(withTree ? addon : (isYearly ? ADDON_YEARLY : ADDON_MONTHLY)).toFixed(2).replace('.', ',')} €/{period}</strong>.
                  </p>
                </div>
              </div>
              <Switch
                checked={withTree}
                onCheckedChange={setWithTree}
                aria-label="Ajouter l'arbre généalogique"
              />
            </div>
          </div>

          <div className="flex items-baseline justify-between mb-6 pb-6 border-b border-border">
            <span className="text-sm text-muted-foreground">Total</span>
            <div className="text-right">
              <span className="text-3xl font-display font-bold text-foreground">
                {total.toFixed(2).replace('.', ',')} €
              </span>
              <span className="text-sm text-muted-foreground">/{period}</span>
            </div>
          </div>

          <Button
            onClick={handleSubscribe}
            size="lg"
            className="w-full bg-[hsl(var(--hero-accent))] hover:bg-[hsl(var(--hero-accent))]/90 text-white text-[17px] sm:text-lg px-6 sm:px-8 py-4 sm:py-6 rounded-xl shadow-[0_14px_40px_-14px_rgba(0,0,0,0.35)] hover:-translate-y-0.5 transition-all font-semibold group h-auto min-h-14 flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin flex-shrink-0" />
                Chargement...
              </>
            ) : (
              <>
                <span className="text-center leading-snug text-balance">Commencer mes 14 jours d'essai gratuit</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground mt-4">
            🛡️ Annulation à tout moment · Paiement sécurisé Stripe
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
