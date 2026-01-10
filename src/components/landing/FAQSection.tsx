import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Qu'est-ce qu'une capsule mémorielle ?",
    answer: "Une capsule mémorielle est un conteneur numérique sécurisé qui préserve vos souvenirs sous forme de textes, photos, vidéos et audio. C'est votre histoire personnelle, organisée chronologiquement et prête à être transmise aux générations futures. Chaque capsule est privée et accessible uniquement aux personnes que vous autorisez.",
  },
  {
    question: "Mes données sont-elles sécurisées ?",
    answer: "Absolument. Vos données sont chiffrées avec les standards les plus élevés (AES-256), sauvegardées quotidiennement sur des serveurs sécurisés, et vous gardez un contrôle total sur qui peut y accéder. Notre engagement : vos souvenirs restent privés.",
  },
  {
    question: "Comment fonctionne le partage familial ?",
    answer: "Vous pouvez créer des cercles de confiance (famille, amis) et inviter des membres par email. Pour chaque cercle, vous définissez les permissions : lecture seule, commentaires, ou contribution. Les membres peuvent ajouter leurs propres perspectives sur vos souvenirs partagés.",
  },
  {
    question: "Que se passe-t-il avec mes données si je ne renouvelle pas ?",
    answer: "Vos données ne sont jamais supprimées automatiquement. Si vous passez de Premium à Gratuit, vous conservez l'accès en lecture à tout votre contenu. Seules les fonctionnalités avancées sont désactivées. Vous pouvez toujours exporter vos données à tout moment.",
  },
  {
    question: "Comment fonctionne le legs posthume ?",
    answer: "Avec l'offre Legacy, vous désignez des contacts de confiance qui seront notifiés et recevront accès à certaines capsules selon vos souhaits. Vous pouvez programmer des révélations différées, définir des conditions d'accès, et laisser des messages personnels.",
  },
  {
    question: "Y a-t-il une application mobile ?",
    answer: "La plateforme web est entièrement responsive et fonctionne parfaitement sur mobile. Une application native iOS et Android est prévue dans notre roadmap pour permettre l'enregistrement direct et le mode hors-ligne.",
  },
];

const FAQSection = () => {
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
            FAQ
          </span>
          <h2 className="text-3xl sm:text-3xl md:text-5xl font-display font-bold text-foreground mb-4 sm:mb-6">
            Questions
            <span className="text-secondary"> fréquentes</span>
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
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-background rounded-xl sm:rounded-2xl border border-border px-4 sm:px-6 shadow-soft"
              >
                <AccordionTrigger className="text-left font-display font-semibold text-foreground hover:text-secondary py-4 sm:py-6 [&[data-state=open]]:text-secondary text-base">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4 sm:pb-6 leading-relaxed text-base">
                  {faq.answer}
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
