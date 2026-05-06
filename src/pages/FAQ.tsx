import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, HelpCircle, Shield, Clock, Users, CreditCard, Lock, Sparkles, GitCompare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import SEOHead from "@/components/seo/SEOHead";
import { createFaqSchema, createBreadcrumbSchema } from "@/lib/seoSchemas";

const FAQ = () => {
  const faqCategories = [
    {
      icon: HelpCircle,
      title: "Comprendre Family Garden",
      questions: [
        {
          question: "Comment préserver les souvenirs de famille numériquement et durablement ?",
          answer: "Préserver ses souvenirs de famille numériquement demande plus qu'un simple stockage de photos. Il faut contextualiser chaque moment : qui était présent, où cela se passait, ce qui rendait ce souvenir précieux. Family Garden a été pensé spécifiquement pour cela. Vous créez des souvenirs qui combinent textes, photos, vidéos et enregistrements audio dans un même contenant, enrichis d'une date, d'un lieu et des personnes liées. Ces souvenirs s'organisent ensuite sur une chronologie interactive par décennies, ce qui permet à vos proches de naviguer facilement dans votre histoire familiale, aujourd'hui comme dans cinquante ans. Tout est hébergé sur des serveurs européens chiffrés, avec sauvegarde quotidienne, pour garantir la pérennité du patrimoine familial."
        },
        {
          question: "Qu'est-ce qu'un journal de famille privé et à quoi cela sert-il ?",
          answer: "Un journal de famille privé est un espace numérique sécurisé où vous consignez l'histoire de votre famille au fil du temps : événements marquants, anecdotes, traditions, voyages, naissances, transmissions. Contrairement à un blog public ou à un réseau social, ce journal n'est jamais indexé, jamais monétisé et jamais visible par des inconnus. Chez Family Garden, vous décidez précisément qui voit quoi, en créant des cercles de partage (famille proche, famille élargie, amis intimes). L'objectif est double : structurer la mémoire familiale dans un lieu unique pour ne rien oublier, et préparer une transmission ordonnée aux générations suivantes, qui hériteront ainsi non seulement de photos, mais aussi du contexte et du sens qui les accompagnent."
        },
        {
          question: "Qu'est-ce qu'un souvenir Family Garden, concrètement ?",
          answer: "Un souvenir Family Garden est une fiche multimédia autonome qui raconte un moment précis de votre vie ou de celle de votre famille. Chaque souvenir peut combiner un texte rédigé librement, plusieurs photos, une ou plusieurs vidéos, des enregistrements audio (témoignage vocal, chanson, rire d'enfant) et des liens vers du contenu externe. Vous lui associez une date (précise ou approximative), un lieu, une catégorie thématique, et les membres de la famille concernés. Le souvenir s'inscrit ensuite automatiquement sur la chronologie de votre journal et, si vous le souhaitez, sur la fiche des personnes qu'il mentionne dans l'arbre généalogique. C'est l'unité de base de tout votre patrimoine numérique sur la plateforme."
        }
      ]
    },
    {
      icon: GitCompare,
      title: "Family Garden vs autres outils",
      questions: [
        {
          question: "Quelle est la différence entre Family Garden et Google Photos ?",
          answer: "Google Photos est un service de stockage et de classement automatique de photos, conçu pour la commodité quotidienne. Family Garden est une plateforme de mémoire familiale conçue pour la transmission. La différence essentielle tient à la finalité : Google Photos cherche à organiser des images, Family Garden cherche à raconter une histoire. Sur Family Garden, vos médias sont contextualisés par un récit, reliés à des personnes identifiées dans un arbre généalogique, et regroupés en souvenirs cohérents plutôt qu'en simple flux chronologique. Vous gardez la main sur ce que voient vos proches grâce aux cercles de partage, vos données ne sont jamais utilisées pour entraîner des modèles publicitaires ou d'IA, et vous pouvez programmer un legs posthume pour transmettre certains souvenirs après votre décès."
        },
        {
          question: "En quoi Family Garden est-il différent d'un site de généalogie classique ?",
          answer: "Les sites de généalogie classiques se concentrent sur la reconstitution d'arbres : noms, dates, lieux, parfois actes officiels. Family Garden inclut un arbre généalogique interactif avec import et export GEDCOM, mais il va au-delà. Chaque membre de l'arbre devient un point d'ancrage pour des souvenirs vivants : témoignages audio d'un grand-père, vidéos d'un mariage, photos d'une maison disparue, lettres numérisées. La généalogie cesse d'être une suite de cases et devient une mémoire incarnée. Vous pouvez taguer des personnes directement sur les photos, suivre leur présence à travers les décennies, et créer une vue chronologique mêlant événements biographiques et souvenirs partagés. C'est une généalogie augmentée, pensée pour les familles, pas seulement pour les chercheurs."
        },
        {
          question: "Pourquoi ne pas simplement utiliser un dossier partagé ou un disque dur familial ?",
          answer: "Un dossier partagé ou un disque dur stocke des fichiers, mais ne préserve ni le contexte, ni la mémoire collective, ni l'organisation chronologique. Au bout de quelques années, on retrouve des milliers d'images sans légendes, sans dates fiables, sans lien clair entre les personnes. Le disque dur, lui, finit toujours par tomber en panne ou par se perdre lors d'un déménagement. Family Garden résout ces deux problèmes : chaque souvenir porte son histoire avec lui (qui, quand, où, pourquoi), et les données sont sauvegardées quotidiennement sur des serveurs européens redondés. À la disparition d'un proche, la famille n'hérite pas d'un disque illisible, mais d'un journal structuré, navigable et compréhensible par tous, y compris les plus jeunes."
        }
      ]
    },
    {
      icon: Shield,
      title: "Sécurité, confidentialité et RGPD",
      questions: [
        {
          question: "Mes données et mes souvenirs sont-ils réellement sécurisés ?",
          answer: "Oui, la sécurité est au cœur de la conception de Family Garden. Toutes vos données sont chiffrées avec le standard AES-256, le même niveau de protection que celui utilisé par les banques. Les fichiers sont stockés sur des serveurs situés en Union Européenne, avec sauvegarde quotidienne et redondance géographique. L'accès à vos souvenirs est protégé par votre mot de passe personnel et, si vous l'activez, par une vérification à deux étapes. Aucun employé de Family Garden ne consulte vos contenus, et aucune donnée n'est revendue à des tiers, à des annonceurs ou utilisée pour entraîner des intelligences artificielles. Vous restez à tout moment l'unique propriétaire de votre patrimoine numérique."
        },
        {
          question: "Family Garden est-il conforme au RGPD européen ?",
          answer: "Oui, Family Garden respecte intégralement le Règlement Général sur la Protection des Données. Vos contenus sont hébergés exclusivement sur des serveurs situés dans l'Union Européenne, ce qui garantit que vos données ne quittent jamais le territoire européen. Vous disposez de l'ensemble des droits RGPD : droit d'accès à vos données, droit de rectification, droit à la portabilité (export complet de vos souvenirs au format PDF et fichiers bruts), et droit à l'effacement définitif si vous décidez de fermer votre compte. Aucune donnée personnelle n'est cédée à des partenaires commerciaux. Notre politique de confidentialité détaille précisément les traitements effectués, les durées de conservation et les sous-traitants techniques mobilisés."
        },
        {
          question: "Qui peut voir mes souvenirs et comment fonctionne le contrôle d'accès ?",
          answer: "Par défaut, tout souvenir que vous créez est strictement privé : vous seul y avez accès. Pour partager, vous créez des cercles de confiance (par exemple : famille proche, famille élargie, amis d'enfance) et vous décidez, pour chaque souvenir individuellement, avec quel cercle le partager. Les membres invités reçoivent un email et accèdent uniquement aux contenus que vous leur avez explicitement ouverts, jamais à l'ensemble de votre journal. Vous pouvez à tout moment retirer un partage, modifier les permissions d'un cercle, ou supprimer un membre. Aucun moteur de recherche n'indexe vos contenus, aucun lien public n'est généré sans votre action volontaire, et chaque accès est tracé pour votre tranquillité."
        }
      ]
    },
    {
      icon: Sparkles,
      title: "Legs posthume et transmission",
      questions: [
        {
          question: "Qu'est-ce qu'un legs posthume numérique et pourquoi en avoir un ?",
          answer: "Un legs posthume numérique est l'organisation, de votre vivant, de la transmission de vos contenus numériques après votre décès. Avec la dématérialisation croissante de nos vies, photos, lettres, témoignages et documents existent désormais essentiellement sous forme numérique, et risquent de disparaître ou de devenir inaccessibles à votre disparition faute d'instructions claires. Family Garden vous permet de désigner des gardiens de confiance qui, à votre décès, déclencheront la transmission de souvenirs spécifiques aux destinataires que vous aurez choisis. Vous pouvez préparer des messages personnels pour vos enfants, vos petits-enfants ou des proches éloignés, à délivrer à une date précise ou à un événement déterminé. C'est l'équivalent numérique du testament sentimental."
        },
        {
          question: "Comment fonctionne concrètement le legs posthume sur Family Garden ?",
          answer: "Avec l'offre Héritage, vous désignez un ou plusieurs gardiens de confiance, généralement des proches susceptibles d'être joignables sur le long terme. Pour chaque souvenir, vous indiquez s'il doit faire partie du legs, à quel destinataire il s'adresse, et selon quelles conditions de délivrance (immédiate après décès, différée à une date précise, ou conditionnée à un événement comme une majorité). À votre décès, vos gardiens confirment l'événement via une procédure sécurisée. Le système notifie alors automatiquement chaque destinataire, qui reçoit un accès personnel à son lot de souvenirs accompagnés de vos messages. Les gardiens ne voient jamais le contenu : ils n'ont qu'un rôle d'autorisation, jamais de consultation."
        },
        {
          question: "Comment choisir un bon gardien pour mon legs numérique ?",
          answer: "Choisir un gardien est une décision importante qui mérite réflexion. Privilégiez une personne plus jeune que vous, en bonne santé, avec qui vous entretenez une relation stable et durable, et qui comprend l'importance de cette responsabilité. Évitez de désigner uniquement votre conjoint si vous avez le même âge : un gardien plus jeune offre une meilleure garantie de continuité. Family Garden recommande d'en désigner au moins deux pour parer à toute indisponibilité. Le gardien n'a aucun accès au contenu de vos souvenirs : son rôle est strictement administratif, il confirme l'événement déclencheur et autorise la transmission selon vos consignes. Vous pouvez modifier vos gardiens à tout moment depuis votre espace personnel."
        }
      ]
    },
    {
      icon: Users,
      title: "Famille, cercles et arbre généalogique",
      questions: [
        {
          question: "Comment partager un souvenir avec ma famille sans rendre public ?",
          answer: "Le partage familial sur Family Garden ne passe jamais par un lien public ni par un réseau social. Vous créez des cercles de partage qui regroupent les personnes de votre famille, en les invitant nominativement par email. Chaque invité reçoit un message personnel et crée un compte gratuit pour accéder uniquement aux souvenirs que vous lui ouvrez. Pour chaque souvenir, vous choisissez avec quel cercle le partager (famille proche, cousins, grands-parents…), et vous définissez les permissions associées : lecture seule, possibilité d'ajouter un commentaire ou une réaction, voire droit de contribuer en ajoutant ses propres médias. Aucun contenu ne sort jamais de l'enceinte privée que vous avez délimitée."
        },
        {
          question: "Puis-je construire un arbre généalogique complet sur Family Garden ?",
          answer: "Oui, l'offre Héritage inclut un arbre généalogique interactif qui supporte plusieurs centaines de membres. Vous pouvez le construire manuellement personne par personne, ou importer un fichier GEDCOM existant si vous travaillez déjà sur un autre logiciel de généalogie. L'arbre s'affiche en mode sablier centré sur une personne, avec ses ascendants et ses descendants sur deux générations visibles à la fois. Chaque membre dispose d'une fiche détaillée : biographie, photos, événements de vie, souvenirs partagés où il apparaît. Vous pouvez exporter l'arbre au format GEDCOM standard pour le partager avec d'autres généalogistes, ou en PDF pour l'imprimer et l'offrir lors d'une réunion de famille."
        },
        {
          question: "Les destinataires de mes souvenirs doivent-ils payer un abonnement ?",
          answer: "Non. Toute personne invitée à consulter vos souvenirs accède à la plateforme gratuitement, sans aucune obligation d'abonnement. Elle peut visionner les contenus que vous lui partagez, laisser des commentaires et des réactions émotionnelles, sans avoir à payer. Seuls les utilisateurs qui souhaitent eux-mêmes créer activement leur propre journal de famille, dépasser le quota gratuit de stockage ou accéder à des fonctions avancées comme l'arbre généalogique et le legs posthume choisissent de souscrire un abonnement Premium ou Héritage. Cette logique garantit que vos souvenirs sont accessibles à tous vos proches sans qu'aucun frein financier ne pèse sur la transmission familiale."
        }
      ]
    },
    {
      icon: Clock,
      title: "Création, organisation et formats",
      questions: [
        {
          question: "Quels formats de fichiers puis-je intégrer à mes souvenirs ?",
          answer: "Family Garden accepte l'ensemble des formats multimédias couramment utilisés dans le cadre familial. Pour les photos : JPG, PNG, GIF et WebP, automatiquement optimisés pour réduire le poids sans perte visible de qualité. Pour les vidéos : MP4 et MOV, jusqu'à 50 Mo par fichier. Pour l'audio : MP3, WAV, M4A, OGG et WebM, jusqu'à 10 Mo par enregistrement, avec un enregistreur vocal intégré directement dans la plateforme pour capturer un témoignage en quelques secondes. Vous pouvez aussi rédiger des textes formatés avec un éditeur enrichi, intégrer des liens vers des vidéos YouTube ou des publications sur les réseaux sociaux, et taguer des personnes directement sur les photos pour les relier à votre arbre généalogique."
        },
        {
          question: "Puis-je modifier ou supprimer un souvenir après sa création ?",
          answer: "Oui, vous gardez la main sur l'intégralité de votre contenu à tout moment. Chaque souvenir peut être édité librement : modification du texte, ajout ou retrait de médias, changement de la date associée, modification du lieu, ajustement des personnes liées, changement de catégorie thématique, ou modification des cercles avec lesquels il est partagé. Si vous décidez de supprimer un souvenir, il est définitivement effacé de la plateforme ainsi que de l'accès des personnes avec qui il avait été partagé. Aucune trace n'est conservée après suppression. Cette liberté éditoriale permet à votre journal de famille d'évoluer naturellement avec votre vie, vos relectures et les souvenirs que vous voulez conserver ou laisser de côté."
        }
      ]
    },
    {
      icon: CreditCard,
      title: "Abonnements et fonctionnement",
      questions: [
        {
          question: "Quels sont les abonnements proposés et que comprennent-ils ?",
          answer: "Family Garden propose trois formules adaptées à différents usages. La formule Gratuite offre 250 Mo de stockage, des souvenirs en texte et photo, et le partage illimité avec vos cercles : c'est suffisant pour démarrer et tester la plateforme sans engagement. La formule Premium, à 4,99 € par mois en offre de lancement, étend le stockage à 10 Go, débloque tous les formats (vidéo, audio) et supprime la publicité. La formule Héritage, à 19,99 € par mois, inclut 20 Go de stockage, l'arbre généalogique interactif, le legs posthume avec gardiens, la génération de podcast à partir de vos souvenirs et un support prioritaire. Vous pouvez changer de formule à tout moment depuis votre espace personnel."
        },
        {
          question: "Que deviennent mes souvenirs si j'arrête mon abonnement Premium ou Héritage ?",
          answer: "Vos souvenirs ne sont jamais supprimés automatiquement parce que vous arrêtez de payer. Si vous repassez en formule Gratuite après avoir été en Premium ou Héritage, vous conservez l'accès en lecture à l'intégralité de vos contenus existants : tous les souvenirs, photos, vidéos et audios restent visibles et consultables, et vous pouvez continuer à les partager avec vos cercles. Vous ne pouvez simplement plus créer de nouveaux souvenirs au-delà du quota gratuit, ni utiliser les fonctions avancées comme l'arbre généalogique ou le legs posthume tant que vous ne reprenez pas un abonnement. À tout moment, vous pouvez exporter l'ensemble de vos données en PDF et en fichiers bruts pour en garder une copie personnelle."
        }
      ]
    }
  ];

  // Build FAQ items for JSON-LD
  const allFaqItems = faqCategories.flatMap((cat) =>
    cat.questions.map((q) => ({ question: q.question, answer: q.answer }))
  );

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="FAQ : journal de famille privé, souvenirs et arbre généalogique | Family Garden"
        description="Trouvez les réponses à vos questions sur Family Garden : sécurité, partage familial, abonnements, gardiens, arbre généalogique, export et sauvegarde de vos souvenirs."
        jsonLd={[
          createFaqSchema(allFaqItems),
          createBreadcrumbSchema([
            { name: "Accueil", url: "/" },
            { name: "FAQ", url: "/faq" },
          ]),
        ]}
      />
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
