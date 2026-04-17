import { motion } from "framer-motion";
import ContactDialog from "@/components/landing/ContactDialog";
import { HelpCircle, Mail, ArrowRight } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTranslation } from "react-i18next";

type FAQItem = {
  question: string;
  answer: string;
  source?: 'i18n';
  key?: string;
};

const FAQSectionV3 = () => {
  const { t } = useTranslation('landing');

  // 6 questions existantes (i18n) + 3 nouvelles questions tarifs/résiliation (FR direct)
  const items: FAQItem[] = [
    { source: 'i18n', key: 'q1', question: t('faq.items.q1.question'), answer: t('faq.items.q1.answer') },
    { source: 'i18n', key: 'q2', question: t('faq.items.q2.question'), answer: t('faq.items.q2.answer') },
    { source: 'i18n', key: 'q3', question: t('faq.items.q3.question'), answer: t('faq.items.q3.answer') },
    {
      question: "Puis-je essayer Premium gratuitement ?",
      answer:
        "Vous pouvez démarrer immédiatement avec le forfait gratuit (250 Mo, photos et textes) sans aucune carte bancaire. L'offre de lancement Premium à 5€/mois pendant 3 mois vous permet aussi de tester l'expérience complète à tarif réduit, résiliable à tout moment.",
    },
    {
      question: "Comment résilier ou changer de forfait ?",
      answer:
        "La résiliation se fait en un clic depuis votre espace Profil > Abonnement, sans justification ni frais. Vous pouvez aussi passer librement de Premium à Heritage (ou inversement) : la facturation est ajustée automatiquement au prorata.",
    },
    { source: 'i18n', key: 'q4', question: t('faq.items.q4.question'), answer: t('faq.items.q4.answer') },
    {
      question: "Où sont stockées mes données et puis-je tout exporter ?",
      answer:
        "Vos données sont hébergées exclusivement sur des serveurs européens conformes au RGPD, avec sauvegardes quotidiennes chiffrées. À tout moment, vous pouvez exporter l'ensemble de vos souvenirs (textes en PDF, médias originaux téléchargeables) — vos contenus vous appartiennent et restent récupérables.",
    },
    { source: 'i18n', key: 'q5', question: t('faq.items.q5.question'), answer: t('faq.items.q5.answer') },
    { source: 'i18n', key: 'q6', question: t('faq.items.q6.question'), answer: t('faq.items.q6.answer') },
  ];

  return (
    <section id="faq" className="py-16 sm:py-24 bg-background relative overflow-hidden">
      {/* Subtle background ornament */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[hsl(var(--gold))]/[0.03] blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-10 sm:mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 rounded-full bg-[hsl(var(--gold))]/10 border border-[hsl(var(--gold))]/20">
            <HelpCircle className="w-3.5 h-3.5 text-[hsl(var(--gold))]" />
            <span className="text-xs md:text-sm font-medium text-[hsl(var(--gold))] tracking-wider uppercase">
              {t('faq.badge')}
            </span>
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
            {t('faq.title')}{' '}
            <span className="text-[hsl(var(--gold))]">{t('faq.titleHighlight')}</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground">
            Tout ce que vous devez savoir avant de commencer à préserver vos souvenirs.
          </p>
        </motion.div>

        {/* Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-3">
            {items.map((item, index) => (
              <AccordionItem
                key={item.key ?? `extra-${index}`}
                value={`item-${index}`}
                className="bg-card rounded-2xl border border-border/60 px-5 sm:px-6 shadow-sm hover:border-[hsl(var(--gold))]/40 transition-colors data-[state=open]:border-[hsl(var(--gold))]/50 data-[state=open]:shadow-md"
              >
                <AccordionTrigger className="text-left font-display font-semibold text-foreground hover:no-underline py-5 sm:py-6 text-base sm:text-lg [&[data-state=open]>svg]:text-[hsl(var(--gold))]">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 sm:pb-6 leading-relaxed text-sm sm:text-base">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="max-w-3xl mx-auto mt-12 sm:mt-16"
        >
          <div className="relative rounded-3xl bg-gradient-to-br from-[hsl(215_50%_18%)] to-[hsl(215_50%_22%)] p-6 sm:p-10 text-center overflow-hidden">
            {/* Ornement */}
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-[hsl(var(--gold))]/10 blur-2xl" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-[hsl(var(--gold))]/10 blur-2xl" />

            <div className="relative">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[hsl(var(--gold))]/15 mb-4">
                <Mail className="w-6 h-6 text-[hsl(var(--gold))]" />
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-white mb-2">
                Vous n'avez pas trouvé votre réponse ?
              </h3>
              <p className="text-sm sm:text-base text-white/75 mb-6 max-w-xl mx-auto leading-relaxed">
                Notre équipe vous répond personnellement sous 48h. Toutes les questions
                sont les bienvenues, même les plus basiques.
              </p>
              <ContactDialog
                trigger={
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[hsl(var(--gold))] text-[hsl(215_50%_18%)] font-semibold text-sm sm:text-base hover:bg-[hsl(var(--gold))]/90 transition-colors group"
                  >
                    Nous écrire
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                }
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSectionV3;
