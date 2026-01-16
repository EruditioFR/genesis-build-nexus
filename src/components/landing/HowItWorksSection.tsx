import { motion } from "framer-motion";
import { Upload, Layers, Share2, Heart, Sparkles } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Créez votre compte",
    description: "Inscrivez-vous gratuitement et commencez à documenter votre histoire en quelques minutes.",
    color: "from-primary to-primary/70",
    bgColor: "bg-primary/10",
    accentColor: "text-primary"
  },
  {
    number: "02",
    icon: Layers,
    title: "Ajoutez vos souvenirs",
    description: "Uploadez photos, vidéos, enregistrements audio et rédigez vos histoires avec notre éditeur intuitif.",
    color: "from-secondary to-secondary/70",
    bgColor: "bg-secondary/10",
    accentColor: "text-secondary"
  },
  {
    number: "03",
    icon: Share2,
    title: "Organisez et partagez",
    description: "Structurez vos capsules en chapitres de vie et invitez votre famille à contribuer.",
    color: "from-accent to-accent/70",
    bgColor: "bg-accent/10",
    accentColor: "text-accent"
  },
  {
    number: "04",
    icon: Heart,
    title: "Préservez pour l'éternité",
    description: "Vos souvenirs sont sécurisés et prêts à être transmis aux générations futures.",
    color: "from-primary via-secondary to-accent",
    bgColor: "bg-gradient-to-br from-primary/10 to-secondary/10",
    accentColor: "text-primary"
  }
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-20 sm:py-32 bg-[#f5f0e8] relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/8 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16 sm:mb-20"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-semibold mb-6"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-primary">Comment ça marche ?</span>
          </motion.span>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-[#1a1a2e] mb-6 leading-tight">
            Créez votre capsule mémorielle
            <br />
            <span className="text-secondary">en 4 étapes simples</span>
          </h2>
        </motion.div>

        {/* What is a memory capsule explanation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-3xl mx-auto mb-16 sm:mb-24"
        >
          <div className="relative bg-white rounded-3xl p-8 sm:p-10 border border-primary/10 shadow-lg overflow-hidden">
            {/* Decorative gradient overlay */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-secondary/10 to-transparent rounded-bl-full" />
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-display font-bold text-[#1a1a2e]">
                  Qu'est-ce qu'une capsule mémorielle ?
                </h3>
              </div>
              <p className="text-[#1a1a2e]/80 leading-relaxed text-base sm:text-lg">
                Une capsule mémorielle est un espace numérique sécurisé où vous pouvez rassembler vos souvenirs les plus précieux : 
                photos, vidéos, enregistrements audio et textes. C'est votre héritage numérique, une façon unique de préserver 
                et transmettre votre histoire familiale aux générations futures.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Steps - Modern Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="relative h-full bg-white rounded-3xl p-6 sm:p-8 border border-primary/10 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1 overflow-hidden">
                {/* Background gradient on hover */}
                <div className={`absolute inset-0 ${step.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                {/* Step number watermark */}
                <div className="absolute -top-4 -right-4 text-[120px] font-display font-bold text-primary/5 select-none pointer-events-none group-hover:text-primary/10 transition-colors duration-500">
                  {step.number}
                </div>

                <div className="relative">
                  {/* Icon and number row */}
                  <div className="flex items-center gap-4 mb-5">
                    <motion.div
                      whileHover={{ scale: 1.05, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}
                    >
                      <step.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </motion.div>
                    <div className={`text-sm font-bold ${step.accentColor} uppercase tracking-wider`}>
                      Étape {step.number}
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl sm:text-2xl font-display font-bold text-[#1a1a2e] mb-3">
                    {step.title}
                  </h3>
                  <p className="text-[#1a1a2e]/70 leading-relaxed text-base sm:text-base">
                    {step.description}
                  </p>

                  {/* Progress indicator */}
                  <div className="mt-6 flex items-center gap-2">
                    {[1, 2, 3, 4].map((dot) => (
                      <div
                        key={dot}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          dot <= index + 1
                            ? `bg-gradient-to-r ${step.color} w-8`
                            : "bg-muted/30 w-4"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Connection lines between cards (desktop only) */}
        <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 pointer-events-none">
          <svg className="w-full h-full opacity-20" viewBox="0 0 100 100">
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="50%" stopColor="hsl(var(--secondary))" />
                <stop offset="100%" stopColor="hsl(var(--accent))" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
