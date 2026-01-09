import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Play, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import heroBackground from "@/assets/hero-background.jpg";
const HeroSection = () => {
  return <section className="relative min-h-screen h-screen flex items-end sm:items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 h-full">
        <img src={heroBackground} alt="Souvenirs de famille" className="w-full h-full object-cover min-h-screen" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-primary/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-transparent to-transparent" />
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div animate={{
        y: [0, -20, 0],
        rotate: [0, 5, 0]
      }} transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut"
      }} className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-secondary/20 blur-3xl" />
        <motion.div animate={{
        y: [0, 20, 0],
        rotate: [0, -5, 0]
      }} transition={{
        duration: 10,
        repeat: Infinity,
        ease: "easeInOut"
      }} className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full bg-accent/20 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10 pt-16 sm:pt-32 pb-8 sm:pb-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
        <motion.div 
          initial={{
            opacity: 0,
            y: 20
          }} 
          animate={{
            opacity: 1,
            y: 0
          }} 
          transition={{
            duration: 0.6
          }} 
          className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-secondary/20 border border-secondary/30 mb-6 sm:mb-8 animate-pulse"
          style={{ animationDuration: '3s' }}
        >
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-foreground" />
            </motion.div>
            <span className="text-xs sm:text-sm font-medium text-primary-foreground">Préservez vos souvenirs pour l'éternité</span>
          </motion.div>

          {/* Main Title */}
          <motion.h1 initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.7,
          delay: 0.1
        }} className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-display font-bold text-primary-foreground leading-tight mb-4 sm:mb-6">
            Votre histoire mérite
            <br />
            <span className="text-gradient-gold">de traverser les générations</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.7,
          delay: 0.2
        }} className="text-base sm:text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2">Créez votre capsule mémorielle et transmettez votre héritage aux générations futures.
Textes, photos, vidéos, enregistrements sonores....
Tous vos souvenirs précieux en un seul endroit sécurisé.</motion.p>

          {/* CTA Buttons */}
          <motion.div initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.7,
          delay: 0.3
        }} className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="w-full sm:w-auto"
            >
              <Button asChild variant="hero" size="lg" className="group w-full">
                <Link to="/signup">
                  Commencer gratuitement
                  <motion.span
                    className="inline-flex"
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.span>
                </Link>
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="w-full sm:w-auto"
            >
              <Button asChild variant="ghost" size="lg" className="text-primary-foreground hover:bg-primary-foreground/10 group w-full">
                <a href="#how-it-works">
                  <motion.span 
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center mr-2 group-hover:bg-primary-foreground/30 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <Play className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
                  </motion.span>
                  Voir la démo
                </a>
              </Button>
            </motion.div>
          </motion.div>

          {/* Trust indicators */}
          <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} transition={{
          duration: 0.7,
          delay: 0.5
        }} className="mt-6 sm:mt-16 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-primary-foreground/60 px-2">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-xs sm:text-sm">Données sécurisées</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs sm:text-sm">Préservation à long terme</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-xs sm:text-sm">Partage familial</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div initial={{
      opacity: 0
    }} animate={{
      opacity: 1,
      y: [0, 10, 0]
    }} transition={{
      duration: 2,
      delay: 1,
      repeat: Infinity
    }} className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="w-6 h-10 rounded-full border-2 border-primary-foreground/30 flex items-start justify-center p-2">
          <div className="w-1 h-2 rounded-full bg-primary-foreground/50" />
        </div>
      </motion.div>
    </section>;
};
export default HeroSection;