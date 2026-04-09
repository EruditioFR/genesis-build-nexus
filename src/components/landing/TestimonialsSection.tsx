import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { useTranslation } from "react-i18next";

const TESTIMONIAL_KEYS = ["t1", "t2", "t3"] as const;
const GRADIENTS = [
  "from-secondary to-gold-light",
  "from-primary to-navy-light",
  "from-accent to-terracotta-light",
];

const TestimonialsSection = () => {
  const { t } = useTranslation("landing");

  return (
    <section className="py-16 sm:py-24 bg-[#1a1a2e] relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-40 h-40 bg-[hsl(var(--gold))]/5 rounded-full blur-[80px]" />
        <div className="absolute bottom-10 right-20 w-60 h-60 bg-[hsl(var(--terracotta))]/5 rounded-full blur-[80px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-10 sm:mb-16"
        >
          <span className="inline-block px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-[hsl(var(--gold))]/15 text-[hsl(var(--gold-light))] text-sm font-medium mb-3 sm:mb-4">
            {t("testimonials.badge")}
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4 sm:mb-6">
            {t("testimonials.title")}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--gold-light))] to-[hsl(var(--terracotta-light))]"> {t("testimonials.titleHighlight")}</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 max-w-6xl mx-auto">
          {TESTIMONIAL_KEYS.map((key, index) => {
            const author = t(`testimonials.items.${key}.author`);
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-white/10 hover:border-white/20 transition-colors h-full">
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[hsl(var(--gold-light))] text-[hsl(var(--gold-light))]" />
                    ))}
                  </div>

                  <p className="text-base text-white/90 leading-relaxed mb-6 sm:mb-8 font-medium">
                    "{t(`testimonials.items.${key}.quote`)}"
                  </p>

                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br ${GRADIENTS[index]} flex items-center justify-center shadow-lg`}>
                      <span className="text-base sm:text-lg font-bold text-white">
                        {author.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-display font-semibold text-white text-base">
                        {author}
                      </p>
                      <p className="text-sm text-white/50">
                        {t(`testimonials.items.${key}.role`)}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
