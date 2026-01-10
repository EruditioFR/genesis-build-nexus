import { motion } from "framer-motion";
import { Upload, Layers, Share2, Heart } from "lucide-react";
const steps = [{
  number: "01",
  icon: Upload,
  title: "Créez votre compte",
  description: "Inscrivez-vous gratuitement et commencez à documenter votre histoire en quelques minutes.",
  color: "from-primary to-navy-light"
}, {
  number: "02",
  icon: Layers,
  title: "Ajoutez vos souvenirs",
  description: "Uploadez photos, vidéos, enregistrements audio et rédigez vos histoires avec notre éditeur intuitif.",
  color: "from-secondary to-gold-light"
}, {
  number: "03",
  icon: Share2,
  title: "Organisez et partagez",
  description: "Structurez vos capsules en chapitres de vie et invitez votre famille à contribuer.",
  color: "from-accent to-terracotta-light"
}, {
  number: "04",
  icon: Heart,
  title: "Préservez pour l'éternité",
  description: "Vos souvenirs sont sécurisés et prêts à être transmis aux générations futures.",
  color: "from-primary to-secondary"
}];
const HowItWorksSection = () => {
  return <section id="how-it-works" className="py-16 sm:py-24 bg-card relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-accent" />
      
      <div className="container mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <motion.div initial={{
        opacity: 0,
        y: 30
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} transition={{
        duration: 0.6
      }} className="text-center max-w-3xl mx-auto mb-12 sm:mb-20">
          <span className="inline-block px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-accent/10 text-accent text-xs sm:text-sm font-medium mb-3 sm:mb-4">Comment ça marche ?</span>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-display font-bold text-foreground mb-4 sm:mb-6">Créez votre héritage<br /><span className="text-secondary">en 4 étapes simples</span>
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-secondary to-accent opacity-20" />
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {steps.map((step, index) => <motion.div key={step.number} initial={{
            opacity: 0,
            y: 40
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.5,
            delay: index * 0.15
          }} className="relative">
                {/* Step Card */}
                <div className="text-center">
                  {/* Number & Icon */}
                  <div className="relative inline-block mb-4 sm:mb-6">
                    <div className={`w-16 h-16 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-elevated`}>
                      <step.icon className="w-7 h-7 sm:w-10 sm:h-10 text-primary-foreground" />
                    </div>
                    <span className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-card shadow-card flex items-center justify-center text-xs sm:text-sm font-bold text-primary">
                      {step.number}
                    </span>
                  </div>
                  
                  <h3 className="text-sm sm:text-xl font-display font-semibold text-foreground mb-2 sm:mb-3">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-base text-muted-foreground leading-relaxed hidden sm:block">
                    {step.description}
                  </p>
                </div>
              </motion.div>)}
          </div>
        </div>
      </div>
    </section>;
};
export default HowItWorksSection;