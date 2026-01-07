import { motion } from "framer-motion";
import { 
  BookOpen, 
  Clock, 
  Users, 
  Shield, 
  Sparkles, 
  Download,
  Image,
  Video,
  Mic
} from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Capsules Mémorielles",
    description: "Créez des capsules riches combinant textes, photos, vidéos et audio pour raconter chaque moment important de votre vie.",
    color: "bg-secondary/10 text-secondary",
  },
  {
    icon: Clock,
    title: "Timeline Interactive",
    description: "Visualisez votre histoire sur une frise chronologique élégante, naviguez par décennies et découvrez le contexte historique.",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: Users,
    title: "Cercles de Partage",
    description: "Partagez sélectivement avec votre famille et vos amis. Définissez qui peut voir, commenter ou contribuer.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Shield,
    title: "Sécurité & Héritage",
    description: "Vos données sont chiffrées et sauvegardées. Programmez la transmission de votre héritage numérique.",
    color: "bg-terracotta/10 text-terracotta",
  },
  {
    icon: Sparkles,
    title: "Assistant IA",
    description: "Laissez notre IA vous guider avec des suggestions d'écriture, transcription audio et génération d'images.",
    color: "bg-secondary/10 text-secondary",
  },
  {
    icon: Download,
    title: "Export & Impression",
    description: "Exportez en PDF, commandez un livre physique premium ou téléchargez tous vos médias.",
    color: "bg-accent/10 text-accent",
  },
];

const mediaTypes = [
  { icon: Image, label: "Photos" },
  { icon: Video, label: "Vidéos" },
  { icon: Mic, label: "Audio" },
  { icon: BookOpen, label: "Textes" },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-gradient-warm relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-50">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-secondary/5 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Fonctionnalités
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-6">
            Tout ce dont vous avez besoin pour
            <span className="text-secondary"> préserver vos souvenirs</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Une plateforme complète qui combine la simplicité d'utilisation avec des fonctionnalités puissantes pour créer votre héritage numérique.
          </p>
        </motion.div>

        {/* Media Types Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex justify-center gap-6 md:gap-12 mb-16"
        >
          {mediaTypes.map((type, index) => (
            <div key={type.label} className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-2xl bg-card shadow-card flex items-center justify-center">
                <type.icon className="w-6 h-6 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">{type.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="h-full bg-card rounded-2xl p-8 shadow-soft hover:shadow-card transition-all duration-300 border border-transparent hover:border-secondary/20">
                <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-display font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
