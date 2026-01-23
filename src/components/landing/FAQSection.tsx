import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTranslation } from "react-i18next";

const FAQSection = () => {
  const { t } = useTranslation('landing');

  const faqKeys = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'];

  return (
    <section id="faq" className="py-16 sm:py-24 bg-card relative">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-10 sm:mb-16"
        >
          <span className="inline-block px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-3 sm:mb-4">
            {t('faq.badge')}
          </span>
          <h2 className="text-3xl sm:text-3xl md:text-5xl font-display font-bold text-foreground mb-4 sm:mb-6">
            {t('faq.title')}
            <span className="text-secondary"> {t('faq.titleHighlight')}</span>
          </h2>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-3 sm:space-y-4">
            {faqKeys.map((key, index) => (
              <AccordionItem
                key={key}
                value={`item-${index}`}
                className="bg-background rounded-xl sm:rounded-2xl border border-border px-4 sm:px-6 shadow-soft"
              >
                <AccordionTrigger className="text-left font-display font-semibold text-foreground hover:text-secondary py-4 sm:py-6 [&[data-state=open]]:text-secondary text-base">
                  {t(`faq.items.${key}.question`)}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4 sm:pb-6 leading-relaxed text-base">
                  {t(`faq.items.${key}.answer`)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;