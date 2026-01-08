import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="py-16 sm:py-24 relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-hero" />
      
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/2 -right-1/4 w-[400px] sm:w-[800px] h-[400px] sm:h-[800px] rounded-full border border-primary-foreground/10"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/2 -left-1/4 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] rounded-full border border-secondary/20"
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Icon */}
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="inline-flex items-center justify-center w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-secondary/20 mb-6 sm:mb-8"
          >
            <Heart className="w-7 h-7 sm:w-10 sm:h-10 text-secondary fill-secondary" />
          </motion.div>

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-display font-bold text-primary-foreground mb-4 sm:mb-6 leading-tight">
            Vos souvenirs méritent
            <br />
            <span className="text-gradient-gold">d'être préservés</span>
          </h2>

          {/* Subtitle */}
          <p className="text-sm sm:text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-8 sm:mb-10 px-2">
            Commencez dès aujourd'hui à construire l'héritage que vous laisserez aux générations futures. 
            Gratuit, sans engagement.
          </p>

          {/* CTA */}
          <Button asChild variant="hero" size="lg" className="group w-full sm:w-auto">
            <Link to="/signup">
              Créer ma première capsule
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>

          {/* Trust */}
          <p className="mt-6 sm:mt-8 text-xs sm:text-sm text-primary-foreground/60 px-4">
            Inscription gratuite • Aucune carte bancaire requise • Vos données restent privées
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
