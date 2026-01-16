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
      }} className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="inline-block px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-3 sm:mb-4">Comment ça marche ?</span>
          <h2 className="text-3xl sm:text-3xl md:text-5xl font-display font-bold text-foreground mb-4 sm:mb-6">Créez votre capsule mémorielle<br /><span className="text-secondary">en 4 étapes simples</span>
          </h2>
        </motion.div>

        {/* What is a memory capsule explanation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-3xl mx-auto mb-12 sm:mb-20"
        >
          <div className="bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 rounded-2xl p-6 sm:p-8 border border-border/50">
            <h3 className="text-lg sm:text-xl font-display font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="text-2xl">💊</span>
              Qu'est-ce qu'une capsule mémorielle ?
            </h3>
            <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
              Une capsule mémorielle est un espace numérique sécurisé où vous pouvez rassembler vos souvenirs les plus précieux : 
              photos, vidéos, enregistrements audio et textes. C'est votre héritage numérique, une façon unique de préserver 
              et transmettre votre histoire familiale aux générations futures.
            </p>
          </div>
        </motion.div>

        {/* Steps - Timeline Layout */}
        <div className="relative max-w-4xl mx-auto">
          {/* Vertical Connection Line - Mobile & Desktop */}
          <div className="absolute left-6 sm:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-secondary to-accent opacity-30 sm:-translate-x-1/2" />
          
          <div className="space-y-8 sm:space-y-12">
            {steps.map((step, index) => (
              <motion.div 
                key={step.number} 
                initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className={`relative flex items-center gap-4 sm:gap-8 ${
                  index % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'
                }`}
              >
                {/* Content Card */}
                <div className={`flex-1 ml-16 sm:ml-0 ${index % 2 === 0 ? 'sm:text-right' : 'sm:text-left'}`}>
                  <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-card hover:shadow-elevated transition-shadow duration-300">
                    <h3 className="text-lg sm:text-xl font-display font-semibold text-foreground mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Center Icon Node */}
                <div className="absolute left-0 sm:left-1/2 sm:-translate-x-1/2 z-10">
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center shadow-elevated ring-4 ring-background`}>
                    <step.icon className="w-5 h-5 sm:w-7 sm:h-7 text-primary-foreground" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-card shadow-card flex items-center justify-center text-[10px] sm:text-xs font-bold text-primary border border-border">
                    {step.number}
                  </span>
                </div>

                {/* Empty space for alternating layout on desktop */}
                <div className="hidden sm:block flex-1" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>;
};
export default HowItWorksSection;