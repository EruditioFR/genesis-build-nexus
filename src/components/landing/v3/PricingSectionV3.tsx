import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Crown, Building2, Loader2, Sparkle, ShieldCheck, Lock, RefreshCw, Server } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const PricingSectionV3 = () => {
  const { t } = useTranslation('landing');
  const [isYearly, setIsYearly] = useState(false);
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const { user } = useAuth();
  const { createCheckout } = useSubscription();
  const navigate = useNavigate();

  const plans = [
    {
      nameKey: "pricing.plans.free.name",
      icon: Sparkles,
      price: { monthly: 0, yearly: 0 },
      descriptionKey: "pricing.plans.free.description",
      featuresKeys: [
        "pricing.plans.free.features.storage",
        "pricing.plans.free.features.formats",
        "pricing.plans.free.features.sharing",
        "pricing.plans.free.features.timeline",
        "pricing.plans.free.features.ads",
      ],
      ctaKey: "pricing.cta.free",
      popular: false,
    },
    {
      nameKey: "pricing.plans.premium.name",
      icon: Crown,
      price: { monthly: 9, yearly: 50 },
      descriptionKey: "pricing.plans.premium.description",
      featuresKeys: [
        "pricing.plans.premium.features.storage",
        "pricing.plans.premium.features.formats",
        "pricing.plans.premium.features.sharing",
        "pricing.plans.premium.features.timeline",
        "pricing.plans.premium.features.noAds",
      ],
      ctaKey: "pricing.cta.premium",
      popular: true,
      tier: "premium" as const,
    },
    {
      nameKey: "pricing.plans.heritage.name",
      icon: Building2,
      price: { monthly: 15, yearly: 99 },
      descriptionKey: "pricing.plans.heritage.description",
      featuresKeys: [
        "pricing.plans.heritage.features.storage",
        "pricing.plans.heritage.features.formats",
        "pricing.plans.heritage.features.sharing",
        "pricing.plans.heritage.features.timeline",
        "pricing.plans.heritage.features.familyTree",
        "pricing.plans.heritage.features.podcast",
        "pricing.plans.heritage.features.vipSupport",
        "pricing.plans.heritage.features.noAds",
      ],
      ctaKey: "pricing.cta.heritage",
      popular: false,
      tier: "heritage" as const,
    },
  ];

  const guarantees = [
    { icon: RefreshCw, text: "Sans engagement, résiliable en 1 clic" },
    { icon: ShieldCheck, text: "Hébergement européen, conforme RGPD" },
    { icon: Lock, text: "Vos données restent privées et exportables" },
    { icon: Server, text: "Sauvegardes quotidiennes sécurisées" },
  ];

  const handleSubscribe = async (plan: typeof plans[0]) => {
    // Free plan → signup
    if (!plan.tier) {
      navigate('/signup');
      return;
    }
    // Paid plans, guest → direct checkout (no account required)
    if (!user) {
      const billing = isYearly ? 'yearly' : 'monthly';
      navigate(`/checkout?plan=${plan.tier}&billing=${billing}`);
      return;
    }
    // Paid plans, logged-in → Stripe checkout via subscription hook
    setLoadingTier(plan.tier);
    try {
      await createCheckout(plan.tier);
    } catch (error: any) {
      toast.error(error.message || t('pricing.error'));
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <section id="pricing" className="py-16 sm:py-24 bg-background relative overflow-hidden">
      {/* Background ornaments */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-48 sm:w-80 h-48 sm:h-80 rounded-full bg-[hsl(var(--gold))]/5 blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-64 sm:w-96 h-64 sm:h-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-8"
        >
          <div className="inline-block px-4 py-1.5 mb-4 rounded-full bg-[hsl(var(--gold))]/10 border border-[hsl(var(--gold))]/20">
            <span className="text-xs md:text-sm font-medium text-[hsl(var(--gold))] tracking-wider uppercase">
              {t('pricing.badge')}
            </span>
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
            Choisissez le forfait qui{' '}
            <span className="text-[hsl(var(--gold))]">accompagne votre histoire</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            {t('pricing.subtitle')}
          </p>
        </motion.div>

        {/* Promo Banner */}
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
              <span className="font-bold text-[hsl(var(--gold))]">Offre de lancement :</span>{' '}
              Premium à 5€/mois et Heritage à 9€/mois pendant 3 mois
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
              {t('pricing.monthly')}
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-300 flex-shrink-0 ${
                isYearly ? "bg-[hsl(var(--gold))]" : "bg-border"
              }`}
              aria-label="Toggle billing period"
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-card shadow-sm transition-transform duration-300 ${
                  isYearly ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <span className={`text-xs sm:text-sm font-medium transition-colors ${isYearly ? "text-foreground" : "text-muted-foreground/60"}`}>
              {t('pricing.yearly')}
            </span>
            {isYearly && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-[hsl(var(--gold))]/15 text-[hsl(var(--gold))] text-[10px] font-bold uppercase tracking-wider">
                2 mois offerts
              </span>
            )}
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="flex flex-col lg:flex-row lg:items-stretch gap-5 lg:gap-6 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            const isPopular = plan.popular;

            return (
              <motion.div
                key={plan.nameKey}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative rounded-3xl p-6 sm:p-8 flex-1 flex flex-col ${
                  isPopular
                    ? "bg-[hsl(215_50%_18%)] text-white shadow-2xl lg:scale-[1.04] z-10 border border-[hsl(var(--gold))]/30 ring-2 ring-[hsl(var(--gold))]/40"
                    : plan.tier === "heritage"
                    ? "bg-card border-2 border-[hsl(var(--gold))]/25 shadow-lg"
                    : "bg-card border border-border shadow-sm"
                }`}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1.5 rounded-full bg-[hsl(var(--gold))] text-[hsl(215_50%_18%)] text-xs font-bold uppercase tracking-wider whitespace-nowrap shadow-lg">
                      ⭐ {t('pricing.popular')}
                    </span>
                  </div>
                )}

                {/* Plan Header */}
                <div className="mb-6">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4 ${
                    isPopular
                      ? "bg-[hsl(var(--gold))]/15"
                      : plan.tier === "heritage"
                      ? "bg-[hsl(var(--gold))]/10"
                      : "bg-muted"
                  }`}>
                    <Icon className={`w-6 h-6 ${
                      isPopular || plan.tier === "heritage" ? "text-[hsl(var(--gold))]" : "text-foreground"
                    }`} />
                  </div>
                  <h3 className={`text-2xl font-display font-bold mb-1.5 ${
                    isPopular ? "text-white" : "text-foreground"
                  }`}>
                    {t(plan.nameKey)}
                  </h3>
                  <p className={`text-sm leading-relaxed ${
                    isPopular ? "text-white/70" : "text-muted-foreground"
                  }`}>
                    {t(plan.descriptionKey)}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-6 pb-6 border-b border-dashed border-border/60">
                  {plan.price.monthly === 0 ? (
                    <div className="flex items-baseline gap-2">
                      <span className={`text-4xl font-display font-bold ${
                        isPopular ? "text-white" : "text-foreground"
                      }`}>
                        Gratuit
                      </span>
                    </div>
                  ) : plan.tier === "premium" && !isYearly ? (
                    <>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-5xl font-display font-bold text-white">
                          5€
                        </span>
                        <span className="text-sm text-white/70">/mois TTC</span>
                      </div>
                      <p className="text-xs text-white/60">
                        Pendant 3 mois, puis 9€/mois
                      </p>
                    </>
                  ) : plan.tier === "heritage" && !isYearly ? (
                    <>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-5xl font-display font-bold text-foreground">
                          9€
                        </span>
                        <span className="text-sm text-muted-foreground">/mois TTC</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Pendant 3 mois, puis 15€/mois
                      </p>
                    </>
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <span className={`text-5xl font-display font-bold ${
                        isPopular ? "text-white" : "text-foreground"
                      }`}>
                        {isYearly ? plan.price.yearly : plan.price.monthly}€
                      </span>
                      <span className={`text-sm ${
                        isPopular ? "text-white/70" : "text-muted-foreground"
                      }`}>
                        /{isYearly ? t('pricing.perYear') : t('pricing.perMonth')} TTC
                      </span>
                    </div>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.featuresKeys.map((featureKey) => (
                    <li key={featureKey} className="flex items-start gap-2.5">
                      <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                        isPopular ? "bg-[hsl(var(--gold))]/20" : "bg-[hsl(var(--gold))]/10"
                      }`}>
                        <Check className="w-3 h-3 text-[hsl(var(--gold))]" strokeWidth={3} />
                      </div>
                      <span className={`text-sm leading-relaxed ${
                        isPopular ? "text-white/85" : "text-foreground/80"
                      }`}>
                        {t(featureKey)}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {plan.tier ? (
                  <Button
                    onClick={() => handleSubscribe(plan)}
                    variant={isPopular ? "gold" : plan.tier === "heritage" ? "gold" : "outline"}
                    size="lg"
                    className="w-full"
                    disabled={loadingTier === plan.tier}
                  >
                    {loadingTier === plan.tier ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t('pricing.loading')}
                      </>
                    ) : (
                      t(plan.ctaKey)
                    )}
                  </Button>
                ) : (
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="w-full"
                  >
                    <Link to="/signup">{t(plan.ctaKey)}</Link>
                  </Button>
                )}
              </motion.div>
            );
          })}
        </div>

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
