import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote: "J'ai pu préserver toutes les histoires de ma grand-mère avant qu'il ne soit trop tard. Mes petits-enfants découvriront son incroyable parcours.",
    author: "Marie D.",
    role: "Retraitée, 68 ans",
    avatar: "M",
    gradient: "from-secondary to-gold-light",
  },
  {
    quote: "En tant qu'entrepreneur, documenter mon parcours était essentiel. MemoriaVita m'offre une plateforme élégante pour inspirer les futures générations.",
    author: "David L.",
    role: "Entrepreneur, 45 ans",
    avatar: "D",
    gradient: "from-primary to-navy-light",
  },
  {
    quote: "Grâce aux fonctionnalités collaboratives, toute ma famille a pu contribuer à la capsule de notre père. Un cadeau inestimable.",
    author: "Sophie M.",
    role: "Aidante familiale, 35 ans",
    avatar: "S",
    gradient: "from-accent to-terracotta-light",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-24 bg-gradient-warm relative overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Témoignages
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-6">
            Ils préservent leur
            <span className="text-secondary"> héritage</span>
          </h2>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              <div className="bg-card rounded-3xl p-8 shadow-card hover:shadow-elevated transition-shadow duration-300 h-full">
                {/* Quote Icon */}
                <div className="mb-6">
                  <Quote className="w-10 h-10 text-secondary/30" />
                </div>

                {/* Quote Text */}
                <p className="text-foreground/90 leading-relaxed mb-8 font-medium">
                  "{testimonial.quote}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center shadow-soft`}>
                    <span className="text-lg font-bold text-primary-foreground">
                      {testimonial.avatar}
                    </span>
                  </div>
                  <div>
                    <p className="font-display font-semibold text-foreground">
                      {testimonial.author}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
