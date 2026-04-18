import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Quote, Star } from 'lucide-react';

const KEYS = ['t1', 't2', 't3'] as const;

const SocialProofBand = () => {
  const { t } = useTranslation('landing');

  return (
    <section className="py-12 md:py-16 bg-[hsl(215_50%_18%)] border-y border-[hsl(var(--gold))]/15">
      <div className="container mx-auto px-4">
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
            {t('v3.socialProof.tagline')}{' '}
            <span className="text-[hsl(var(--gold))] font-semibold">
              {t('v3.socialProof.taglineHighlight')}
            </span>
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 max-w-6xl mx-auto">
          {KEYS.map((k, i) => {
            const author = t(`v3.socialProof.items.${k}.author`);
            const quote = t(`v3.socialProof.items.${k}.quote`);
            const role = t(`v3.socialProof.items.${k}.role`);
            return (
              <motion.figure
                key={k}
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
                  « {quote} »
                </blockquote>
                <figcaption className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[hsl(var(--gold))]/20 border border-[hsl(var(--gold))]/40 flex items-center justify-center text-[hsl(var(--gold))] font-display font-bold text-sm">
                    {author.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{author}</div>
                    <div className="text-xs text-white/60">{role}</div>
                  </div>
                </figcaption>
              </motion.figure>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SocialProofBand;
