import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Crown, Building2 } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Gratuit",
    icon: Sparkles,
    price: { monthly: 0, yearly: 0 },
    description: "Parfait pour commencer à préserver vos souvenirs",
    features: [
      "2 GB de stockage",
      "Capsules texte illimitées",
      "1 cercle de partage (5 membres)",
      "Export PDF basique (1x/mois)",
      "10 suggestions IA/mois",
      "Timeline basique",
    ],
    cta: "Commencer gratuitement",
    variant: "outline" as const,
    popular: false,
  },
  {
    name: "Premium",
    icon: Crown,
    price: { monthly: 9.99, yearly: 99 },
    description: "Pour les créateurs de contenu réguliers",
    features: [
      "50 GB de stockage",
      "Tous types de capsules illimités",
      "5 cercles (50 membres total)",
      "Export illimité (PDF, EPUB, GEDCOM)",
      "100 suggestions + 2h transcription/mois",
      "Timeline avancée + thèmes premium",
      "Intégrations cloud (Google, iCloud)",
      "Domaine personnalisé",
      "Sans publicité",
    ],
    cta: "Essayer Premium",
    variant: "hero" as const,
    popular: true,
  },
  {
    name: "Héritage",
    icon: Building2,
    price: { monthly: 24.99, yearly: 249 },
    description: "Pour les familles multigénérationnelles",
    features: [
      "500 GB de stockage",
      "Tout Premium inclus",
      "5 profils familiaux inclus",
      "Coffre-fort numérique chiffré",
      "Système de legs posthume",
      "Arbre généalogique interactif",
      "Biographe IA automatique",
      "1 livre physique/an inclus",
      "Support VIP téléphone",
      "Archivage garanti 100 ans",
    ],
    cta: "Choisir Legacy",
    variant: "gold" as const,
    popular: false,
  },
];

const PricingSection = () => {
  const [isYearly, setIsYearly] = useState(true);

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
          <span className="inline-block px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-secondary/10 text-secondary text-xs sm:text-sm font-medium mb-3 sm:mb-4">
            Tarifs
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-display font-bold text-foreground mb-4 sm:mb-6">
            Un plan pour chaque
            <span className="text-secondary"> histoire</span>
          </h2>
          <p className="text-sm sm:text-lg text-muted-foreground px-2">
            Commencez gratuitement et évoluez selon vos besoins. Pas de frais cachés.
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
          <span className={`text-xs sm:text-sm font-medium ${!isYearly ? "text-foreground" : "text-muted-foreground"}`}>
            Mensuel
          </span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className={`relative w-12 sm:w-14 h-6 sm:h-7 rounded-full transition-colors duration-300 ${
              isYearly ? "bg-secondary" : "bg-muted"
            }`}
          >
            <span
              className={`absolute top-0.5 sm:top-1 w-5 h-5 rounded-full bg-card shadow-sm transition-transform duration-300 ${
                isYearly ? "translate-x-6 sm:translate-x-8" : "translate-x-0.5 sm:translate-x-1"
              }`}
            />
          </button>
          <span className={`text-xs sm:text-sm font-medium ${isYearly ? "text-foreground" : "text-muted-foreground"}`}>
            Annuel
          </span>
          <span className="ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 rounded-full bg-accent/10 text-accent text-[10px] sm:text-xs font-medium">
            -17%
          </span>
        </motion.div>

        {/* Pricing Cards */}
        <div className="flex flex-col lg:flex-row lg:items-stretch gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative rounded-2xl sm:rounded-3xl p-5 sm:p-8 flex-1 ${
                plan.popular
                  ? "bg-primary text-primary-foreground shadow-elevated lg:scale-105 z-10 order-first lg:order-none"
                  : "bg-card shadow-card border border-border"
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2">
                  <span className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-secondary text-secondary-foreground text-xs sm:text-sm font-semibold shadow-gold whitespace-nowrap">
                    Le plus populaire
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
                  {plan.name}
                </h3>
                <p className={`text-xs sm:text-sm ${plan.popular ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {plan.description}
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
                  <span className={`text-xs sm:text-sm ${plan.popular ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    /{isYearly ? "an" : "mois"}
                  </span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-2 sm:space-y-4 mb-6 sm:mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 sm:gap-3">
                    <Check className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5 ${
                      plan.popular ? "text-secondary" : "text-secondary"
                    }`} />
                    <span className={`text-xs sm:text-sm ${
                      plan.popular ? "text-primary-foreground/90" : "text-muted-foreground"
                    }`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Button
                asChild
                variant={plan.popular ? "hero" : plan.variant}
                size="default"
                className="w-full"
              >
                <Link to="/signup">{plan.cta}</Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
