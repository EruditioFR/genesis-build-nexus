import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';

type Testimonial = {
  quote: string;
  author: string;
  role: string;
  initials: string;
};

const testimonials: Testimonial[] = [
  {
    quote:
      "J'ai enregistré la voix de ma mère qui raconte mon enfance. Un cadeau inestimable pour mes enfants.",
    author: 'Camille',
    role: 'Maman de 2 enfants',
    initials: 'C',
  },
  {
    quote:
      'Trois générations qui contribuent au même journal de famille. Mes parents adorent y revenir le dimanche.',
    author: 'Julien',
    role: 'Papa, Lyon',
    initials: 'J',
  },
  {
    quote:
      "Tout est privé, sans pub, sans algorithme. Enfin un endroit où mes souvenirs m'appartiennent vraiment.",
    author: 'Sophie',
    role: 'Photographe',
    initials: 'S',
  },
];

const SocialProofBand = () => {
  return (
    <section className="py-12 md:py-16 bg-[hsl(215_50%_18%)] border-y border-[hsl(var(--gold))]/15">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center gap-3 mb-8 md:mb-10"
        >
          <div className="flex items-center gap-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className="w-4 h-4 md:w-5 md:h-5 fill-[hsl(var(--gold))] text-[hsl(var(--gold))]"
              />
            ))}
          </div>
          <p className="text-sm md:text-base text-white/80 text-center font-medium">
            Plébiscité par les familles qui veulent{' '}
            <span className="text-[hsl(var(--gold))] font-semibold">
              préserver l'essentiel
            </span>
          </p>
        </motion.div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 max-w-6xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.figure
              key={t.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="relative p-6 md:p-7 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-sm hover:bg-white/[0.06] hover:border-[hsl(var(--gold))]/30 transition-colors"
            >
              <Quote
                className="absolute top-4 right-4 w-6 h-6 text-[hsl(var(--gold))]/30"
                strokeWidth={2}
              />
              <blockquote className="text-sm md:text-base text-white/90 leading-relaxed mb-5 pr-6">
                « {t.quote} »
              </blockquote>
              <figcaption className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[hsl(var(--gold))]/20 border border-[hsl(var(--gold))]/40 flex items-center justify-center text-[hsl(var(--gold))] font-display font-bold text-sm">
                  {t.initials}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{t.author}</div>
                  <div className="text-xs text-white/60">{t.role}</div>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProofBand;
