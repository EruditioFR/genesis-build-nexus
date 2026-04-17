import { motion } from 'framer-motion';
import { Lock, Server, BadgeX, Brain, Zap } from 'lucide-react';

const trustPillars = [
  {
    icon: Lock,
    title: 'Chiffrement 256-bit',
    description: 'Protection bancaire',
  },
  {
    icon: Server,
    title: 'Serveurs en UE',
    description: 'Hébergement RGPD',
  },
  {
    icon: BadgeX,
    title: 'Sans publicité',
    description: 'Aucun tracking',
  },
  {
    icon: Brain,
    title: 'Sans IA d\'entraînement',
    description: 'Vos données vous appartiennent',
  },
  {
    icon: Zap,
    title: 'Résiliation 1 clic',
    description: 'Sans engagement',
  },
];

const TrustBandV3 = () => {
  return (
    <section className="relative py-12 md:py-16 bg-[hsl(var(--navy))] overflow-hidden border-y border-white/5">
      {/* Subtle gold accent line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-[hsl(var(--gold))]/40 to-transparent" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-[hsl(var(--gold))]/40 to-transparent" />

      {/* Decorative blob */}
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[hsl(var(--gold))]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[hsl(var(--gold-light))]">
            Vous êtes entre de bonnes mains
          </span>
        </motion.div>

        {/* Pillars grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-4 max-w-6xl mx-auto">
          {trustPillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="group flex flex-col items-center text-center px-2"
              >
                {/* Icon */}
                <div className="relative mb-3">
                  <div className="absolute inset-0 bg-[hsl(var(--gold))]/20 rounded-full blur-md scale-0 group-hover:scale-150 transition-transform duration-500" />
                  <div className="relative w-12 h-12 rounded-full border border-[hsl(var(--gold))]/30 bg-[hsl(var(--gold))]/10 flex items-center justify-center backdrop-blur-sm group-hover:border-[hsl(var(--gold))]/60 group-hover:bg-[hsl(var(--gold))]/20 transition-all duration-300">
                    <Icon className="w-5 h-5 text-[hsl(var(--gold-light))]" strokeWidth={1.75} />
                  </div>
                </div>

                {/* Text */}
                <h3 className="text-sm md:text-base font-display font-semibold text-white leading-tight mb-1">
                  {pillar.title}
                </h3>
                <p className="text-xs text-white/60 leading-snug">
                  {pillar.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrustBandV3;
