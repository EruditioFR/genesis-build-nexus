import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, HelpCircle, Shield, Clock, Users, CreditCard, Lock, Share2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

const FAQ = () => {
  const faqCategories = [
    {
      icon: HelpCircle,
      title: "Général",
      questions: [
        {
          question: "Qu'est-ce que Family Garden ?",
          answer: "Family Garden est une plateforme sécurisée qui vous permet de préserver vos souvenirs de famille : textes, photos, vidéos et audio. Créez votre journal de famille et transmettez vos moments précieux à vos proches."
        },
        {
          question: "Comment fonctionne un souvenir ?",
          answer: "Créez un souvenir en ajoutant du texte, des photos, vidéos ou audio. Choisissez une date associée au moment, reliez-le aux membres de votre famille, et partagez-le avec vos cercles privés."
        },
        {
          question: "Quels types de fichiers puis-je ajouter à mes souvenirs ?",
          answer: "Vous pouvez ajouter des photos (JPG, PNG, GIF), des vidéos (MP4, MOV), des fichiers audio (MP3, WAV) et du texte formaté. La taille maximale par fichier dépend de votre abonnement."
        }
      ]
    },
    {
      icon: Shield,
      title: "Sécurité & Confidentialité",
      questions: [
        {
          question: "Mes données sont-elles sécurisées ?",
          answer: "Absolument. Toutes vos données sont chiffrées de bout en bout avec les standards les plus élevés (AES-256). Seuls vous et vos destinataires autorisés peuvent accéder au contenu de vos souvenirs."
        },
        {
          question: "Qui peut voir mes souvenirs ?",
          answer: "Vous avez un contrôle total. Vous pouvez garder vos souvenirs privés, les partager avec des cercles spécifiques (famille, amis, collègues) ou désigner des destinataires individuels."
        },
        {
          question: "Que deviennent mes données si je supprime mon compte ?",
          answer: "Toutes vos données personnelles et souvenirs sont définitivement supprimés. Cette action est irréversible."
        }
      ]
    },
    {
      icon: Clock,
      title: "Souvenirs & Organisation",
      questions: [
        {
          question: "Puis-je modifier un souvenir après l'avoir créé ?",
          answer: "Oui, vous pouvez modifier ou supprimer un souvenir à tout moment. Vous pouvez également ajouter des médias, changer la date ou modifier les personnes associées."
        },
        {
          question: "Comment fonctionne le mode Héritage ?",
          answer: "Le mode Héritage permet de transmettre des souvenirs après votre décès. Vous désignez un gardien de confiance qui confirmera la transmission. Des vérifications régulières d'activité sont effectuées pour s'assurer de votre bien-être."
        },
        {
          question: "Combien de souvenirs puis-je créer ?",
          answer: "Avec l'abonnement gratuit, vous pouvez créer jusqu'à 5 souvenirs avec 100 Mo de stockage. Les abonnements Premium et Héritage offrent des souvenirs illimités avec un stockage étendu."
        }
      ]
    },
    {
      icon: Users,
      title: "Cercles & Partage",
      questions: [
        {
          question: "Qu'est-ce qu'un cercle ?",
          answer: "Un cercle est un groupe de personnes (famille, amis, collègues) avec qui vous pouvez partager facilement vos souvenirs. Créez différents cercles pour organiser vos partages."
        },
        {
          question: "Comment inviter quelqu'un dans mon cercle ?",
          answer: "Depuis la page Cercles, créez un cercle puis cliquez sur 'Ajouter un membre'. Entrez l'email de la personne, elle recevra une invitation pour rejoindre votre cercle."
        },
        {
          question: "Les membres de mon cercle peuvent-ils voir tous mes souvenirs ?",
          answer: "Non, vous choisissez spécifiquement quels souvenirs partager avec chaque cercle. Les membres ne voient que les souvenirs que vous leur avez explicitement partagés."
        }
      ]
    },
    {
      icon: Lock,
      title: "Gardiens",
      questions: [
        {
          question: "Qu'est-ce qu'un gardien ?",
          answer: "Un gardien est une personne de confiance que vous désignez pour gérer vos souvenirs en mode Héritage. Il sera contacté pour confirmer et débloquer la transmission de vos souvenirs le moment venu."
        },
        {
          question: "Comment choisir un bon gardien ?",
          answer: "Choisissez quelqu'un de confiance, susceptible d'être joignable sur le long terme, et qui comprend l'importance de cette responsabilité. Vous pouvez désigner plusieurs gardiens pour plus de sécurité."
        },
        {
          question: "Le gardien peut-il accéder au contenu de mes souvenirs ?",
          answer: "Non, le gardien ne peut pas voir le contenu de vos souvenirs. Son rôle est uniquement de confirmer et autoriser leur transmission aux destinataires que vous avez choisis."
        }
      ]
    },
    {
      icon: CreditCard,
      title: "Abonnements & Paiements",
      questions: [
        {
          question: "Quels sont les différents abonnements disponibles ?",
          answer: "Nous proposons trois formules : Gratuit (5 souvenirs, 100 Mo), Premium (souvenirs illimités, 10 Go, 9,99€/mois) et Héritage (toutes les fonctionnalités Premium + mode héritage avancé, 19,99€/mois)."
        },
        {
          question: "Puis-je changer d'abonnement à tout moment ?",
          answer: "Oui, vous pouvez passer à un abonnement supérieur à tout moment. Le changement prend effet immédiatement. Pour rétrograder, le changement s'appliquera à la fin de votre période de facturation."
        },
        {
          question: "Que se passe-t-il si j'arrête mon abonnement ?",
          answer: "Vos souvenirs existants sont conservés et resteront accessibles en lecture seule. Vous ne pourrez plus créer de nouveaux souvenirs au-delà de la limite gratuite jusqu'à la reprise d'un abonnement."
        }
      ]
    },
    {
      icon: Share2,
      title: "Notifications & Réception",
      questions: [
        {
          question: "Comment les destinataires sont-ils notifiés ?",
          answer: "Les destinataires reçoivent un email les informant qu'un souvenir leur est destiné. Ils peuvent créer un compte gratuit pour accéder au souvenir et laisser des commentaires."
        },
        {
          question: "Puis-je voir si mon souvenir a été consulté ?",
          answer: "Oui, vous pouvez suivre le statut de vos souvenirs : partagé, vu. Vous recevez une notification lorsqu'un destinataire consulte votre souvenir."
        },
        {
          question: "Les destinataires peuvent-ils répondre à un souvenir ?",
          answer: "Oui, les destinataires peuvent laisser des commentaires et réactions sur les souvenirs qu'ils reçoivent, créant ainsi un fil de souvenirs partagés."
        }
      ]
    },
    {
      icon: Download,
      title: "Export & Sauvegarde",
      questions: [
        {
          question: "Puis-je télécharger mes souvenirs ?",
          answer: "Oui, vous pouvez exporter vos souvenirs au format PDF ou ZIP contenant tous les médias. Cette fonctionnalité est disponible pour tous les souvenirs que vous avez créés."
        },
        {
          question: "Mes données sont-elles sauvegardées ?",
          answer: "Oui, toutes vos données sont automatiquement sauvegardées quotidiennement sur des serveurs sécurisés en Europe, avec une redondance géographique pour une sécurité maximale."
        },
        {
          question: "Puis-je importer des souvenirs depuis d'autres plateformes ?",
          answer: "Nous travaillons sur des fonctionnalités d'import depuis les réseaux sociaux et services de stockage cloud. Restez informé de nos mises à jour !"
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-12 sm:py-20 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-4 mb-8">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
              <span className="text-sm text-muted-foreground">Retour à l'accueil</span>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary mb-6">
                <HelpCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Centre d'aide</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
                Questions Fréquentes
              </h1>
              <p className="text-lg text-muted-foreground">
                Trouvez rapidement des réponses à vos questions sur Family Garden
              </p>
            </motion.div>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="py-12 sm:py-20">
          <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
            <div className="space-y-12">
              {faqCategories.map((category, categoryIndex) => (
                <motion.div
                  key={category.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                      <category.icon className="w-5 h-5 text-secondary" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-display font-semibold text-foreground">
                      {category.title}
                    </h2>
                  </div>
                  
                  <Accordion type="single" collapsible className="space-y-3">
                    {category.questions.map((item, index) => (
                      <AccordionItem
                        key={index}
                        value={`${category.title}-${index}`}
                        className="border border-border rounded-xl px-6 bg-card shadow-sm"
                      >
                        <AccordionTrigger className="text-left font-medium text-foreground hover:text-secondary transition-colors py-5">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </motion.div>
              ))}
            </div>

            {/* Contact CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="mt-16 text-center p-8 sm:p-12 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-border"
            >
              <h3 className="text-xl sm:text-2xl font-display font-semibold text-foreground mb-3">
                Vous n'avez pas trouvé votre réponse ?
              </h3>
              <p className="text-muted-foreground mb-6">
                Notre équipe est là pour vous aider. Contactez-nous et nous vous répondrons dans les plus brefs délais.
              </p>
              <Button asChild className="bg-gradient-gold hover:opacity-90 text-secondary-foreground">
                <a href="mailto:contact@familygarden.fr">
                  Contacter le support
                </a>
              </Button>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default FAQ;
