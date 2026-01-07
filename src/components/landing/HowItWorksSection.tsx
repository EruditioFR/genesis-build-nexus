import { motion } from "framer-motion";
import { Upload, Layers, Share2, Heart } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Créez votre compte",
    description: "Inscrivez-vous gratuitement et commencez à documenter votre histoire en quelques minutes.",
    color: "from-primary to-navy-light",
  },
  {
    number: "02",
    icon: Layers,
    title: "Ajoutez vos souvenirs",
    description: "Uploadez photos, vidéos, enregistrements audio et rédigez vos histoires avec notre éditeur intuitif.",
    color: "from-secondary to-gold-light",
  },
  {
    number: "03",
    icon: Share2,
    title: "Organisez et partagez",
    description: "Structurez vos capsules en chapitres de vie et invitez votre famille à contribuer.",
    color: "from-accent to-terracotta-light",
  },
  {
    number: "04",
    icon: Heart,
    title: "Préservez pour l'éternité",
    description: "Vos souvenirs sont sécurisés et prêts à être transmis aux générations futures.",
    color: "from-primary to-secondary",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 bg-card relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-accent" />
      
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            Comment ça marche
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-6">
            Créez votre héritage en
            <span className="text-secondary"> 4 étapes simples</span>
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-secondary to-accent opacity-20" />
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative"
              >
                {/* Step Card */}
                <div className="text-center">
                  {/* Number & Icon */}
                  <div className="relative inline-block mb-6">
                    <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-elevated`}>
                      <step.icon className="w-10 h-10 text-primary-foreground" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-card shadow-card flex items-center justify-center text-sm font-bold text-primary">
                      {step.number}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-display font-semibold text-foreground mb-3">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
