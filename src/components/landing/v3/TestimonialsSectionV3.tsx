import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import marieImg from "@/assets/testimonials/testimonial-marie.jpg";
import thomasImg from "@/assets/testimonials/testimonial-thomas.jpg";
import sophieImg from "@/assets/testimonials/testimonial-sophie.jpg";
import jeanImg from "@/assets/testimonials/testimonial-jean.jpg";

const heroTestimonial = {
  name: "Marie L.",
  role: "Grand-mère, 68 ans — Lyon",
  avatar: marieImg,
  quote:
    "Pendant trente ans, j'ai gardé des cartons entiers de photos, de lettres, de cassettes audio. Avec Family Garden, j'ai enfin pu tout rassembler en un seul endroit, raconter chaque histoire à mes mots, et partager avec mes enfants et petits-enfants. Aujourd'hui, ma famille connaît son histoire — et c'est moi qui la leur ai transmise.",
  highlight: "ma famille connaît son histoire",
};

const secondaryTestimonials = [
  {
    name: "Thomas D.",
    role: "Papa de deux enfants, 45 ans",
    avatar: thomasImg,
    quote:
      "Mes enfants adorent regarder les souvenirs ensemble le dimanche soir. C'est devenu notre rituel familial. Et tout est en sécurité, hébergé en France — ça compte pour nous.",
  },
  {
    name: "Sophie M.",
    role: "Petite-fille, 35 ans",
    avatar: sophieImg,
    quote:
      "J'ai créé un compte pour ma grand-mère. Elle a 82 ans et se débrouille toute seule grâce à l'interface très simple. Elle nous envoie des souvenirs chaque semaine. Un vrai cadeau.",
  },
  {
    name: "Jean P.",
    role: "Retraité, 78 ans — Bordeaux",
    avatar: jeanImg,
    quote:
      "J'ai pu enregistrer ma voix racontant mon enfance pendant la guerre. Mes arrière-petits-enfants pourront m'écouter dans cinquante ans. C'est la plus belle chose que je laisserai derrière moi.",
  },
];

const Stars = ({ size = 16 }: { size?: number }) => (
  <div className="flex items-center gap-0.5" aria-label="5 étoiles sur 5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} size={size} className="fill-[hsl(var(--gold))] text-[hsl(var(--gold))]" />
    ))}
  </div>
);

const TestimonialsSectionV3 = () => {
  return (
    <section id="testimonials" className="py-20 md:py-28 bg-background relative overflow-hidden">
      {/* Soft background ornaments */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[hsl(var(--gold))]/[0.04] rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-block text-xs uppercase tracking-[0.2em] text-[hsl(var(--gold))] font-medium mb-4">
            Témoignages
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
            Des familles qui ont retrouvé{" "}
            <span className="text-[hsl(var(--gold))]">leur mémoire</span>
          </h2>
          <p className="mt-4 text-base md:text-lg text-muted-foreground">
            Plus de mille familles utilisent Family Garden pour préserver et transmettre leurs souvenirs.
          </p>
        </motion.div>

        {/* Hero testimonial */}
        <motion.article
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-5xl mx-auto mb-16"
        >
          <div className="grid md:grid-cols-[280px_1fr] gap-8 md:gap-12 items-center bg-card border border-border rounded-3xl p-6 md:p-10 shadow-sm hover:shadow-md transition-shadow">
            <div className="relative mx-auto md:mx-0">
              <div className="absolute inset-0 bg-[hsl(var(--gold))]/20 rounded-full blur-2xl" />
              <img
                src={heroTestimonial.avatar}
                alt={`Portrait de ${heroTestimonial.name}`}
                width={1024}
                height={1024}
                loading="lazy"
                className="relative w-48 h-48 md:w-64 md:h-64 rounded-full object-cover border-4 border-[hsl(var(--gold))]/30 shadow-lg"
              />
              <div className="absolute -top-2 -right-2 md:top-2 md:right-2 w-12 h-12 rounded-full bg-[hsl(var(--gold))] flex items-center justify-center shadow-lg">
                <Quote className="w-6 h-6 text-background" strokeWidth={2.5} />
              </div>
            </div>

            <div className="text-center md:text-left">
              <Stars size={20} />
              <blockquote className="mt-4 font-display text-xl md:text-2xl lg:text-[26px] leading-relaxed text-foreground italic">
                « {heroTestimonial.quote.split(heroTestimonial.highlight)[0]}
                <span className="not-italic font-semibold text-[hsl(var(--gold))]">
                  {heroTestimonial.highlight}
                </span>
                {heroTestimonial.quote.split(heroTestimonial.highlight)[1]} »
              </blockquote>
              <footer className="mt-6 flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
                <cite className="not-italic font-semibold text-foreground">{heroTestimonial.name}</cite>
                <span className="hidden md:inline text-muted-foreground">·</span>
                <span className="text-sm text-muted-foreground">{heroTestimonial.role}</span>
              </footer>
            </div>
          </div>
        </motion.article>

        {/* Secondary testimonials */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {secondaryTestimonials.map((t, idx) => (
            <motion.article
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 + idx * 0.1 }}
              className="group bg-card border border-border rounded-2xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col"
            >
              <div className="flex items-start justify-between mb-4">
                <Stars size={14} />
                <Quote className="w-5 h-5 text-[hsl(var(--gold))]/40 group-hover:text-[hsl(var(--gold))] transition-colors" />
              </div>

              <blockquote className="text-foreground/90 leading-relaxed text-[15px] flex-1 italic">
                « {t.quote} »
              </blockquote>

              <footer className="mt-6 pt-5 border-t border-border flex items-center gap-3">
                <img
                  src={t.avatar}
                  alt={`Portrait de ${t.name}`}
                  width={1024}
                  height={1024}
                  loading="lazy"
                  className="w-12 h-12 rounded-full object-cover border-2 border-[hsl(var(--gold))]/20"
                />
                <div className="min-w-0">
                  <cite className="not-italic font-semibold text-foreground text-sm block truncate">
                    {t.name}
                  </cite>
                  <span className="text-xs text-muted-foreground block truncate">{t.role}</span>
                </div>
              </footer>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSectionV3;
