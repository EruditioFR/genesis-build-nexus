import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, TreePine, Loader2, Sparkle, ShieldCheck, Lock, RefreshCw, Server, Gift } from "lucide-react";
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
  "Souvenirs illimités : texte, photo, vidéo, audio",
  "Cercles de partage illimités",
  "Chronologie interactive avancée",
  "Souvenirs testament (legs posthume)",
  "Podcast IA de vos souvenirs",
  "Sans publicité",
];

const guarantees = [
  { icon: RefreshCw, text: "Sans engagement, résiliable en 1 clic" },
  { icon: ShieldCheck, text: "Hébergement européen, conforme RGPD" },
  { icon: Lock, text: "Vos données restent privées et exportables" },
  { icon: Server, text: "Sauvegardes quotidiennes sécurisées" },
];

const PricingSectionV3 = () => {
  const [isYearly, setIsYearly] = useState(false);
  const [withTree, setWithTree] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { createCheckout } = useSubscription();
  const navigate = useNavigate();

  const base = isYearly ? ESSENTIAL_YEARLY : ESSENTIAL_MONTHLY;
  const addon = isYearly ? ADDON_YEARLY : ADDON_MONTHLY;
  const total = base + (withTree ? addon : 0);
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
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-48 sm:w-80 h-48 sm:h-80 rounded-full bg-[hsl(var(--gold))]/5 blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-64 sm:w-96 h-64 sm:h-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-8"
        >
          <div className="inline-block px-4 py-1.5 mb-4 rounded-full bg-[hsl(var(--gold))]/10 border border-[hsl(var(--gold))]/20">
            <span className="text-xs md:text-sm font-medium text-[hsl(var(--gold))] tracking-wider uppercase">
              Tarifs
            </span>
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
            Un tarif unique pour{' '}
            <span className="text-[hsl(var(--gold))]">accompagner votre histoire</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            2,99 €/mois pour tout Family Garden, avec 14 jours d'essai gratuit.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="max-w-3xl mx-auto mb-8 sm:mb-10"
        >
          <div className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-[hsl(var(--gold))]/15 via-[hsl(var(--gold))]/25 to-[hsl(var(--gold))]/15 border border-[hsl(var(--gold))]/40 shadow-sm">
            <Sparkle className="w-4 h-4 text-[hsl(var(--gold))] flex-shrink-0" />
            <p className="text-xs sm:text-sm text-foreground font-medium text-center">
              <span className="font-bold text-[hsl(var(--gold))]">14 jours d'essai gratuit</span> — Aucune carte requise pour commencer
            </p>
          </div>
        </motion.div>

        {/* Billing Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-center mb-10 sm:mb-12"
        >
          <div className="inline-flex items-center gap-3 bg-muted/50 rounded-full px-5 py-2 border border-border/50">
            <span className={`text-xs sm:text-sm font-medium transition-colors ${!isYearly ? "text-foreground" : "text-muted-foreground/60"}`}>
              Mensuel
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-300 flex-shrink-0 ${isYearly ? "bg-[hsl(var(--gold))]" : "bg-border"}`}
              aria-label="Basculer mensuel/annuel"
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-card shadow-sm transition-transform duration-300 ${isYearly ? "translate-x-5" : "translate-x-0"}`}
              />
            </button>
            <span className={`text-xs sm:text-sm font-medium transition-colors ${isYearly ? "text-foreground" : "text-muted-foreground/60"}`}>
              Annuel
            </span>
            {isYearly && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-[hsl(var(--gold))]/15 text-[hsl(var(--gold))] text-[10px] font-bold uppercase tracking-wider">
                2 mois offerts
              </span>
            )}
          </div>
        </motion.div>

        {/* Single plan card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto relative rounded-3xl p-6 sm:p-10 bg-[hsl(215_50%_18%)] text-white shadow-2xl border border-[hsl(var(--gold))]/30 ring-2 ring-[hsl(var(--gold))]/40"
        >
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
            <span className="px-4 py-1.5 rounded-full bg-[hsl(var(--gold))] text-[hsl(215_50%_18%)] text-xs font-bold uppercase tracking-wider whitespace-nowrap shadow-lg">
              ⭐ Tout inclus
            </span>
          </div>

          <div className="text-center mb-6 mt-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 bg-[hsl(var(--gold))]/15">
              <Sparkles className="w-7 h-7 text-[hsl(var(--gold))]" />
            </div>
            <h3 className="text-2xl font-display font-bold text-white mb-2">
              Family Garden Essentiel
            </h3>
            <p className="text-sm text-white/70">
              Tout ce qu'il vous faut pour préserver l'histoire de votre famille.
            </p>
          </div>

          <div className="mb-6 pb-6 border-b border-dashed border-white/20 text-center">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-5xl font-display font-bold text-white">
                {base.toFixed(2).replace('.', ',')} €
              </span>
              <span className="text-sm text-white/70 ml-1">TTC /{period}</span>
            </div>
            {isYearly && (
              <p className="text-xs text-white/60 mt-1">soit 2,49 €/mois — 2 mois offerts</p>
            )}
            <p className="inline-flex items-center gap-1.5 text-xs font-medium text-[hsl(var(--gold))] mt-3 px-3 py-1 rounded-full bg-[hsl(var(--gold))]/15">
              <Gift className="w-3.5 h-3.5" />
              14 jours d'essai gratuit
            </p>
          </div>

          <ul className="space-y-3 mb-6 max-w-md mx-auto">
            {includedFeatures.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5">
                <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 bg-[hsl(var(--gold))]/20">
                  <Check className="w-3 h-3 text-[hsl(var(--gold))]" strokeWidth={3} />
                </div>
                <span className="text-sm leading-relaxed text-white/85">
                  {feature}
                </span>
              </li>
            ))}
          </ul>

          {/* Family tree add-on */}
          <div className="rounded-2xl border border-white/20 bg-white/5 p-5 mb-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[hsl(var(--gold))]/15 shrink-0">
                  <TreePine className="w-5 h-5 text-[hsl(var(--gold))]" />
                </div>
                <div>
                  <h4 className="font-display font-semibold text-white">
                    Arbre généalogique interactif
                  </h4>
                  <p className="text-sm text-white/70 mt-1">
                    Option facultative à{' '}
                    <strong className="text-white">{addon.toFixed(2).replace('.', ',')} €/{period}</strong>.
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

          {/* Total */}
          <div className="flex items-baseline justify-between mb-6 pb-6 border-b border-white/20">
            <span className="text-sm text-white/70">Total</span>
            <div className="text-right">
              <span className="text-3xl font-display font-bold text-white">
                {total.toFixed(2).replace('.', ',')} €
              </span>
              <span className="text-sm text-white/70">/{period}</span>
            </div>
          </div>

          <Button
            onClick={handleSubscribe}
            variant="gold"
            size="lg"
            className="w-full h-auto min-h-11"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin flex-shrink-0" />
                Chargement...
              </>
            ) : (
              <span className="whitespace-pre-line text-center">{"Commencer mes 14 jours d'essai gratuit"}</span>
            )}
          </Button>

          <p className="text-xs text-center text-white/60 mt-4">
            🛡️ Annulation à tout moment · Paiement sécurisé Stripe
          </p>
        </motion.div>

        {/* Guarantees Band */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto mt-12 sm:mt-16"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 p-5 sm:p-6 rounded-2xl bg-muted/30 border border-border/40">
            {guarantees.map((g) => {
              const GIcon = g.icon;
              return (
                <div key={g.text} className="flex items-start gap-2.5">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[hsl(var(--gold))]/10 flex items-center justify-center mt-0.5">
                    <GIcon className="w-4 h-4 text-[hsl(var(--gold))]" />
                  </div>
                  <p className="text-xs sm:text-sm text-foreground leading-snug font-medium">
                    {g.text}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSectionV3;
