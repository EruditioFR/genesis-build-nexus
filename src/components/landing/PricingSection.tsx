import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Crown, Building2, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const PricingSection = () => {
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
        "pricing.plans.free.features.timeline",
        "pricing.plans.free.features.ads",
      ],
      ctaKey: "pricing.cta.free",
      variant: "outline" as const,
      popular: false,
    },
    {
      nameKey: "pricing.plans.premium.name",
      icon: Crown,
      price: { monthly: 9.99, yearly: 99 },
      descriptionKey: "pricing.plans.premium.description",
      featuresKeys: [
        "pricing.plans.premium.features.storage",
        "pricing.plans.premium.features.formats",
        "pricing.plans.premium.features.sharing",
        "pricing.plans.premium.features.timeline",
        "pricing.plans.premium.features.noAds",
      ],
      ctaKey: "pricing.cta.premium",
      variant: "hero" as const,
      popular: true,
      tier: "premium" as const,
    },
    {
      nameKey: "pricing.plans.heritage.name",
      icon: Building2,
      price: { monthly: 19.99, yearly: 199 },
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
      variant: "gold" as const,
      popular: false,
      tier: "heritage" as const,
    },
  ];

  const handleSubscribe = async (plan: typeof plans[0]) => {
    if (!plan.tier) {
      navigate('/signup');
      return;
    }

    if (!user) {
      navigate('/signup');
      return;
    }

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
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 -left-20 w-48 sm:w-80 h-48 sm:h-80 rounded-full bg-secondary/5 blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-64 sm:w-96 h-64 sm:h-96 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-8 sm:mb-12"
        >
          <span className="inline-block px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-3 sm:mb-4">
            {t('pricing.badge')}
          </span>
          <h2 className="text-3xl sm:text-3xl md:text-5xl font-display font-bold text-foreground mb-4 sm:mb-6">
            {t('pricing.title')}
            <span className="text-secondary"> {t('pricing.titleHighlight')}</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground px-2">
            {t('pricing.subtitle')}
          </p>
        </motion.div>

        {/* Billing Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-12"
        >
          <span className={`text-sm font-medium ${!isYearly ? "text-foreground" : "text-muted-foreground"}`}>
            {t('pricing.monthly')}
          </span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className={`relative w-11 sm:w-12 h-6 rounded-full transition-colors duration-300 flex-shrink-0 border border-border sm:border-0 ${
              isYearly ? "bg-secondary" : "bg-muted"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-card shadow-sm transition-transform duration-300 ${
                isYearly ? "translate-x-5 sm:translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${isYearly ? "text-foreground" : "text-muted-foreground"}`}>
            {t('pricing.yearly')}
          </span>
          <span className="ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-medium">
            {t('pricing.discount')}
          </span>
        </motion.div>

        {/* Pricing Cards */}
        <div className="flex flex-col lg:flex-row lg:items-stretch gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.nameKey}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative rounded-2xl sm:rounded-3xl p-5 sm:p-8 flex-1 flex flex-col ${
                plan.popular
                  ? "bg-primary text-primary-foreground shadow-elevated lg:scale-105 z-10 order-first lg:order-none"
                  : "bg-card shadow-card border border-border"
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2">
                  <span className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-semibold shadow-gold whitespace-nowrap">
                    {t('pricing.popular')}
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-6 sm:mb-8 mt-2 sm:mt-0">
                <div className={`inline-flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl mb-3 sm:mb-4 ${
                  plan.popular ? "bg-primary-foreground/10" : "bg-muted"
                }`}>
                  <plan.icon className={`w-5 h-5 sm:w-7 sm:h-7 ${plan.popular ? "text-secondary" : "text-primary"}`} />
                </div>
                <h3 className={`text-xl sm:text-2xl font-display font-bold mb-1 sm:mb-2 ${
                  plan.popular ? "text-primary-foreground" : "text-foreground"
                }`}>
                  {t(plan.nameKey)}
                </h3>
                <p className={`text-sm ${plan.popular ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {t(plan.descriptionKey)}
                </p>
              </div>

              {/* Price */}
              <div className="text-center mb-6 sm:mb-8">
                <div className="flex items-baseline justify-center gap-1">
                  <span className={`text-3xl sm:text-5xl font-display font-bold ${
                    plan.popular ? "text-primary-foreground" : "text-foreground"
                  }`}>
                    {isYearly ? plan.price.yearly : plan.price.monthly}€
                  </span>
                  <span className={`text-sm ${plan.popular ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    /{isYearly ? t('pricing.perYear') : t('pricing.perMonth')}
                  </span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-2 sm:space-y-4 mb-6 sm:mb-8 flex-1">
                {plan.featuresKeys.map((featureKey) => (
                  <li key={featureKey} className="flex items-start gap-2 sm:gap-3">
                    <Check className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5 ${
                      plan.popular ? "text-secondary" : "text-secondary"
                    }`} />
                    <span className={`text-sm ${
                      plan.popular ? "text-primary-foreground/90" : "text-muted-foreground"
                    }`}>
                      {t(featureKey)}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              {plan.tier ? (
                <Button
                  onClick={() => handleSubscribe(plan)}
                  variant={plan.popular ? "hero" : plan.variant}
                  size="default"
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
                  variant={plan.variant}
                  size="default"
                  className="w-full"
                >
                  <Link to="/signup">{t(plan.ctaKey)}</Link>
                </Button>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;