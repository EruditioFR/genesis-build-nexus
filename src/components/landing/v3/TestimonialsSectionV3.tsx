import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Quote, Star } from "lucide-react";
import marieImg from "@/assets/testimonials/testimonial-marie.jpg";
import thomasImg from "@/assets/testimonials/testimonial-thomas.jpg";
import sophieImg from "@/assets/testimonials/testimonial-sophie.jpg";
import jeanImg from "@/assets/testimonials/testimonial-jean.jpg";

const SECONDARY = [
  { key: 'thomas', avatar: thomasImg },
  { key: 'sophie', avatar: sophieImg },
  { key: 'jean', avatar: jeanImg },
];

const TestimonialsSectionV3 = () => {
  const { t } = useTranslation('landing');

  const Stars = ({ size = 16 }: { size?: number }) => (
    <div className="flex items-center gap-0.5" aria-label={t('v3.testimonialsV3.starsLabel')}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={size} className="fill-[hsl(var(--gold))] text-[hsl(var(--gold))]" />
      ))}
    </div>
  );

  const heroQuote = t('v3.testimonialsV3.hero.quote');
  const heroHighlight = t('v3.testimonialsV3.hero.highlight');
  const heroName = t('v3.testimonialsV3.hero.name');
  const heroRole = t('v3.testimonialsV3.hero.role');
  const [beforeHL, afterHL] = heroQuote.includes(heroHighlight)
    ? [heroQuote.split(heroHighlight)[0], heroQuote.split(heroHighlight)[1]]
    : [heroQuote, ''];

  return (
    <section id="testimonials" className="py-20 md:py-28 bg-background relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[hsl(var(--gold))]/[0.04] rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-block text-xs uppercase tracking-[0.2em] text-[hsl(var(--gold))] font-medium mb-4">
            {t('v3.testimonialsV3.badge')}
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
            {t('v3.testimonialsV3.title')}{" "}
            <span className="text-[hsl(var(--gold))]">{t('v3.testimonialsV3.titleHighlight')}</span>
          </h2>
          <p className="mt-4 text-base md:text-lg text-muted-foreground">
            {t('v3.testimonialsV3.subtitle')}
          </p>
        </motion.div>

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
                src={marieImg}
                alt={heroName}
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
                « {beforeHL}
                <span className="not-italic font-semibold text-[hsl(var(--gold))]">
                  {heroHighlight}
                </span>
                {afterHL} »
              </blockquote>
              <footer className="mt-6 flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
                <cite className="not-italic font-semibold text-foreground">{heroName}</cite>
                <span className="hidden md:inline text-muted-foreground">·</span>
                <span className="text-sm text-muted-foreground">{heroRole}</span>
              </footer>
            </div>
          </div>
        </motion.article>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {SECONDARY.map((s, idx) => {
            const name = t(`v3.testimonialsV3.items.${s.key}.name`);
            const role = t(`v3.testimonialsV3.items.${s.key}.role`);
            const quote = t(`v3.testimonialsV3.items.${s.key}.quote`);
            return (
              <motion.article
                key={s.key}
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

                <blockquote className="text-foreground/90 leading-relaxed text-[15px] flex-1 italic whitespace-pre-line">
                  « {quote} »
                </blockquote>

                <footer className="mt-6 pt-5 border-t border-border flex items-center gap-3">
                  <img
                    src={s.avatar}
                    alt={name}
                    width={1024}
                    height={1024}
                    loading="lazy"
                    className="w-12 h-12 rounded-full object-cover border-2 border-[hsl(var(--gold))]/20"
                  />
                  <div className="min-w-0">
                    <cite className="not-italic font-semibold text-foreground text-sm block truncate">
                      {name}
                    </cite>
                    <span className="text-xs text-muted-foreground block truncate">{role}</span>
                  </div>
                </footer>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSectionV3;
