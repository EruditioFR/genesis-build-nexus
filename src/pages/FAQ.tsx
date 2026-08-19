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
import { renderInlineLinks, stripInlineLinks } from "@/components/seo/InlineLinkText";


const FAQ = () => {
  const faqCategories = [
    {
      icon: HelpCircle,
      title: "Comprendre Family Garden",
      questions: [
        {
          question: "Qu'est-ce que Family Garden ?",
          answer: "Family Garden est un service en ligne français qui vous permet de créer un journal de famille privé. Concrètement, Family Garden réunit en un seul endroit vos souvenirs sous toutes leurs formes : photos, vidéos, enregistrements audio et récits écrits. Chaque souvenir est daté, situé et relié aux personnes concernées, puis organisé sur une chronologie interactive et sur un arbre généalogique. Vous choisissez précisément avec qui partager, grâce à des cercles privés, et vous pouvez programmer la transmission de certains souvenirs à vos proches. Family Garden est accessible depuis un ordinateur, une tablette ou un smartphone, sans publicité, avec un hébergement européen conforme au RGPD, à partir de [2,99 € par mois](/tarifs) après 14 jours d'essai gratuit."
        },
        {
          question: "Comment préserver les souvenirs de famille numériquement et durablement ?",
          answer: "Préserver ses souvenirs de famille numériquement demande plus qu'un simple stockage de photos. Il faut contextualiser chaque moment : qui était présent, où cela se passait, ce qui rendait ce souvenir précieux. Family Garden a été pensé spécifiquement pour cela. Vous créez des souvenirs qui combinent textes, photos, vidéos et enregistrements audio dans un même contenant, enrichis d'une date, d'un lieu et des personnes liées. Nos guides détaillent la méthode pour [conserver et transmettre ses souvenirs de famille](/blog/conserver-transmettre-souvenirs-de-famille). Ces souvenirs s'organisent ensuite sur une chronologie interactive par décennies, ce qui permet à vos proches de naviguer facilement dans votre histoire familiale, aujourd'hui comme dans cinquante ans. Tout est hébergé sur des serveurs européens chiffrés, avec sauvegarde quotidienne, pour garantir la pérennité du patrimoine familial."
        },
        {
          question: "Qu'est-ce qu'un journal de famille privé et à quoi cela sert-il ?",
          answer: "Un journal de famille privé est un espace numérique sécurisé où vous consignez l'histoire de votre famille au fil du temps : événements marquants, anecdotes, traditions, voyages, naissances, transmissions. Contrairement à un blog public ou à un réseau social, ce journal n'est jamais indexé, jamais monétisé et jamais visible par des inconnus. Chez Family Garden, vous décidez précisément qui voit quoi, en créant des cercles de partage (famille proche, famille élargie, amis intimes). La [démonstration en deux minutes](/demo) permet d'en juger sans créer de compte. L'objectif est double : structurer la mémoire familiale dans un lieu unique pour ne rien oublier, et préparer une transmission ordonnée aux générations suivantes, qui hériteront ainsi non seulement de photos, mais aussi du contexte et du sens qui les accompagnent."
        },
        {
          question: "Qu'est-ce qu'un souvenir Family Garden, concrètement ?",
          answer: "Un souvenir Family Garden est une fiche multimédia autonome qui raconte un moment précis de votre vie ou de celle de votre famille. Chaque souvenir peut combiner un texte rédigé librement, plusieurs photos, une ou plusieurs vidéos, des enregistrements audio (témoignage vocal, chanson, rire d'enfant) et des liens vers du contenu externe. Vous lui associez une date (précise ou approximative), un lieu, une [catégorie thématique](/categories), et les membres de la famille concernés. Le souvenir s'inscrit ensuite automatiquement sur la chronologie de votre journal et, si vous le souhaitez, sur la fiche des personnes qu'il mentionne dans l'arbre généalogique. C'est l'unité de base de tout votre patrimoine numérique sur la plateforme."
        }
      ]
    },
    {
      icon: GitCompare,
      title: "Family Garden vs autres outils",
      questions: [
        {
          question: "Quelle est la différence entre Family Garden et Google Photos ?",
          answer: "Google Photos est un service de stockage et de classement automatique de photos, conçu pour la commodité quotidienne. Family Garden est une plateforme de mémoire familiale conçue pour la transmission. La différence essentielle tient à la finalité : Google Photos cherche à organiser des images, Family Garden cherche à raconter une histoire. Sur Family Garden, vos médias sont contextualisés par un récit, reliés à des personnes identifiées dans un arbre généalogique, et regroupés en souvenirs cohérents plutôt qu'en simple flux chronologique. Vous gardez la main sur ce que voient vos proches grâce aux cercles de partage, vos données ne sont jamais utilisées pour entraîner des modèles publicitaires ou d'IA, et vous pouvez programmer un legs posthume pour transmettre certains souvenirs après votre décès. Le détail des fonctions incluses figure sur la [page tarifs](/tarifs)."
        },
        {
          question: "En quoi Family Garden est-il différent d'un site de généalogie classique ?",
          answer: "Les sites de généalogie classiques se concentrent sur la reconstitution d'arbres : noms, dates, lieux, parfois actes officiels. Family Garden inclut un arbre généalogique interactif avec import et export GEDCOM, mais il va au-delà. Chaque membre de l'arbre devient un point d'ancrage pour des souvenirs vivants : témoignages audio d'un grand-père, vidéos d'un mariage, photos d'une maison disparue, lettres numérisées. La généalogie cesse d'être une suite de cases et devient une mémoire incarnée. Vous pouvez taguer des personnes directement sur les photos, suivre leur présence à travers les décennies, et créer une vue chronologique mêlant événements biographiques et souvenirs partagés. C'est une généalogie augmentée, pensée pour les familles, pas seulement pour les chercheurs : voir notre guide [arbre généalogique en ligne avec photos et souvenirs](/blog/arbre-genealogique-en-ligne-photos-et-souvenirs)."
        },
        {
          question: "Pourquoi ne pas simplement utiliser un dossier partagé ou un disque dur familial ?",
          answer: "Un dossier partagé ou un disque dur stocke des fichiers, mais ne préserve ni le contexte, ni la mémoire collective, ni l'organisation chronologique. Au bout de quelques années, on retrouve des milliers d'images sans légendes, sans dates fiables, sans lien clair entre les personnes. Le disque dur, lui, finit toujours par tomber en panne ou par se perdre lors d'un déménagement. Family Garden résout ces deux problèmes : chaque souvenir porte son histoire avec lui (qui, quand, où, pourquoi), et les données sont sauvegardées quotidiennement sur des serveurs européens redondés. À la disparition d'un proche, la famille n'hérite pas d'un disque illisible, mais d'un journal structuré, navigable et compréhensible par tous, y compris les plus jeunes. Notre article explique comment [conserver et transmettre ses souvenirs de famille](/blog/conserver-transmettre-souvenirs-de-famille) durablement."
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
          answer: "Oui, Family Garden respecte intégralement le Règlement Général sur la Protection des Données. Vos contenus sont hébergés exclusivement sur des serveurs situés dans l'Union Européenne, ce qui garantit que vos données ne quittent jamais le territoire européen. Vous disposez de l'ensemble des droits RGPD : droit d'accès à vos données, droit de rectification, droit à la portabilité (export complet de vos souvenirs au format PDF et fichiers bruts), et droit à l'effacement définitif si vous décidez de fermer votre compte. Aucune donnée personnelle n'est cédée à des partenaires commerciaux. Notre [politique de confidentialité](/privacy) détaille précisément les traitements effectués, les durées de conservation et les sous-traitants techniques mobilisés."
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
          answer: "Avec le legs posthume, inclus dans l'[abonnement à 2,99 € par mois](/tarifs), vous désignez un ou plusieurs gardiens de confiance, généralement des proches susceptibles d'être joignables sur le long terme. Pour chaque souvenir, vous indiquez s'il doit faire partie du legs, à quel destinataire il s'adresse, et selon quelles conditions de délivrance (immédiate après décès, différée à une date précise, ou conditionnée à un événement comme une majorité). À votre décès, vos gardiens confirment l'événement via une procédure sécurisée. Le système notifie alors automatiquement chaque destinataire, qui reçoit un accès personnel à son lot de souvenirs accompagnés de vos messages. Les gardiens ne voient jamais le contenu : ils n'ont qu'un rôle d'autorisation, jamais de consultation."
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
          answer: "Oui, l'[arbre généalogique interactif](/blog/arbre-genealogique-en-ligne-photos-et-souvenirs), proposé en [option à 5 € par mois](/tarifs), supporte plusieurs centaines de membres. Vous pouvez le construire manuellement personne par personne, ou importer un fichier GEDCOM existant si vous travaillez déjà sur un autre logiciel de généalogie. L'arbre s'affiche en mode sablier centré sur une personne, avec ses ascendants et ses descendants sur deux générations visibles à la fois. Chaque membre dispose d'une fiche détaillée : biographie, photos, événements de vie, souvenirs partagés où il apparaît. Vous pouvez exporter l'arbre au format GEDCOM standard pour le partager avec d'autres généalogistes, ou en PDF pour l'imprimer et l'offrir lors d'une réunion de famille."
        },
        {
          question: "Les destinataires de mes souvenirs doivent-ils payer un abonnement ?",
          answer: "Non. Toute personne invitée à consulter vos souvenirs accède à la plateforme gratuitement, sans aucune obligation d'abonnement. Elle peut visionner les contenus que vous lui partagez, laisser des commentaires et des réactions émotionnelles, sans avoir à payer. Seuls les utilisateurs qui souhaitent eux-mêmes créer activement leur propre journal de famille, poursuivre au-delà des 14 jours d'essai gratuit souscrivent l'abonnement à [2,99 € par mois](/tarifs). Cette logique garantit que vos souvenirs sont accessibles à tous vos proches sans qu'aucun frein financier ne pèse sur la transmission familiale."
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
          answer: "Family Garden fonctionne avec un [tarif unique et lisible](/tarifs) : 2,99 € par mois TTC donnent accès à l'ensemble du service en ligne, avec 20 Go de stockage, tous les formats de médias (texte, photo, vidéo, audio), la chronologie interactive, les cercles de partage illimités, l'export PDF et le legs posthume avec gardiens. Seul l'arbre généalogique interactif, plus gourmand en ressources, est proposé en option à 5 € par mois, activable et désactivable quand vous le souhaitez. Chaque nouveau compte démarre par 14 jours d'essai gratuit, sans carte bancaire, pour créer ses premiers souvenirs et juger sur pièces. Vous pouvez changer de formule ou résilier à tout moment depuis votre espace personnel, sans engagement de durée."
        },
        {
          question: "Que deviennent mes souvenirs si j'arrête mon abonnement ?",
          answer: "Vos souvenirs ne sont jamais supprimés automatiquement parce que vous arrêtez de payer. À la fin de votre abonnement, vous conservez l'accès en lecture à l'intégralité de vos contenus existants : tous les souvenirs, photos, vidéos et enregistrements audio restent consultables. Vous ne pouvez simplement plus créer de nouveaux souvenirs ni utiliser les fonctions avancées tant que vous ne reprenez pas l'abonnement. À tout moment, y compris pendant l'essai gratuit, vous pouvez exporter l'ensemble de vos données en PDF et en fichiers bruts pour en garder une copie personnelle sur votre ordinateur ou un disque externe. Votre patrimoine familial reste votre propriété exclusive, sans aucun enfermement dans la plateforme."
        }
      ]
    },
    {
      icon: Sparkles,
      title: "Souvenirs, capsules temporelles et transmission",
      questions: [
        {
          question: "Qu'est-ce qu'une capsule temporelle numérique ?",
          answer: "Une [capsule temporelle numérique](/blog/capsule-temporelle-numerique-comment-en-creer-une) est un ensemble de souvenirs — textes, photos, vidéos, enregistrements vocaux — rassemblés aujourd'hui pour être ouverts plus tard, à une date choisie ou par une personne précise. Là où la capsule temporelle traditionnelle se limitait à une boîte enterrée dans un jardin, la version numérique conserve les couleurs, les voix et le mouvement, sans risque d'humidité ni de perte matérielle. Sur Family Garden, chaque souvenir peut être programmé pour être révélé à une date future : les dix-huit ans d'un enfant, un anniversaire de mariage, ou après votre disparition dans le cadre du legs. Vous rédigez le message, vous joignez les médias, vous choisissez le destinataire, et la plateforme se charge de la délivrance au bon moment."
        },
        {
          question: "Comment créer une capsule temporelle numérique pour ses enfants ?",
          answer: "Commencez par définir le destinataire et l'occasion : un enfant qui aura dix-huit ans, un petit-enfant qui n'est pas encore né, ou toute la fratrie à une date anniversaire. Rassemblez ensuite les matériaux : quelques photos marquantes, un enregistrement vocal où vous racontez la journée de sa naissance, une lettre écrite à la première personne. Sur Family Garden, vous créez un souvenir par thème plutôt qu'un bloc unique : cela reste plus lisible à l'ouverture et vous pouvez enrichir la capsule au fil des années. Vous programmez enfin la date de révélation et désignez le destinataire. Notre guide complet détaille [comment créer une capsule temporelle numérique](/blog/capsule-temporelle-numerique-comment-en-creer-une) pas à pas. Le jour venu, il reçoit une notification et accède à un espace personnel contenant l'intégralité de ce que vous lui avez laissé, dans l'ordre que vous avez choisi."
        },
        {
          question: "Comment conserver ses souvenirs de famille en ligne sans les perdre ?",
          answer: "La première cause de perte des souvenirs familiaux n'est pas l'accident, c'est la dispersion : des photos sur un téléphone, d'autres sur un disque dur, des vidéos dans une messagerie, et personne qui sache où tout se trouve. Conserver durablement suppose trois conditions : un lieu unique, un contexte associé à chaque document, et un accès partagé avec au moins un proche. Family Garden réunit ces trois conditions en un service en ligne : vous déposez vos médias dans un espace unique hébergé sur des serveurs européens chiffrés et sauvegardés quotidiennement, vous documentez chaque souvenir avec sa date, son lieu et les personnes concernées, et vous ouvrez l'accès à vos cercles familiaux. L'export complet reste possible à tout moment pour conserver une copie hors ligne. Voir aussi : [conserver et transmettre ses souvenirs de famille](/blog/conserver-transmettre-souvenirs-de-famille)."
        },
        {
          question: "Comment raconter sa vie à ses enfants quand on ne sait pas par où commencer ?",
          answer: "La difficulté n'est presque jamais le manque de matière, mais l'absence de point de départ. La méthode la plus efficace consiste à renoncer à la chronologie : au lieu de reprendre votre vie depuis la naissance, répondez à une question précise à la fois. Family Garden propose pour cela une [bibliothèque de plus de cinquante questions guidées](/inspirations) — le premier métier, la rencontre avec votre conjoint, la maison de l'enfance, une odeur qui vous ramène en arrière — et vous répondez par écrit ou en enregistrant simplement votre voix, ce qui est souvent plus naturel. Comptez dix minutes par question. Au bout de quelques semaines, la chronologie interactive reconstitue automatiquement le récit dans l'ordre, et vos enfants héritent d'un ensemble cohérent plutôt que d'une intention jamais concrétisée. La méthode en sept étapes est détaillée dans l'article [raconter sa vie à ses enfants](/blog/raconter-sa-vie-a-ses-enfants-methode)."
        },
        {
          question: "Comment écrire une biographie familiale sans être écrivain ?",
          answer: "Une biographie familiale réussie n'a rien à voir avec un exercice littéraire : elle vaut par la précision des détails, pas par le style. Écrivez comme vous parleriez à un proche, à la première personne, en préférant les scènes concrètes aux généralités — la table de la cuisine, le nom du chien, le prix du pain à l'époque — car ce sont ces détails que la mémoire familiale perd en premier. Procédez par petits blocs indépendants d'une demi-page plutôt que par chapitres. Sur Family Garden, chaque bloc devient un souvenir daté que la plateforme replace ensuite sur la chronologie ; vous pouvez l'illustrer d'une photo, y adjoindre un enregistrement de votre voix, et l'exporter en PDF pour l'imprimer et l'offrir à votre famille — voir la méthode dans [raconter sa vie à ses enfants](/blog/raconter-sa-vie-a-ses-enfants-methode) lorsque l'ensemble vous semble abouti."
        },
        {
          question: "Quelle différence entre Family Garden et un site de généalogie comme Geneanet ou MyHeritage ?",
          answer: "Les sites de généalogie servent à remonter le temps : ils vous aident à retrouver des ancêtres, à consulter des archives d'état civil et à établir des filiations parfois sur plusieurs siècles. Family Garden fait l'inverse : la plateforme part du présent et des générations vivantes pour conserver ce qu'aucune archive ne contiendra jamais — les voix, les récits, les photos de famille, les anecdotes du quotidien. L'arbre généalogique y est un outil de mise en relation des souvenirs, pas une fin en soi : chaque personne de l'arbre est reliée aux moments où elle apparaît. Les deux usages sont complémentaires, et l'[import de fichiers GEDCOM](/blog/arbre-genealogique-en-ligne-photos-et-souvenirs) permet justement de récupérer un arbre déjà construit ailleurs pour y accrocher vos souvenirs."
        },
        {
          question: "Comment créer un arbre généalogique en ligne avec photos et souvenirs ?",
          answer: "Sur Family Garden, l'arbre généalogique se construit de deux façons : en saisissant les personnes une à une à partir de vous-même, ou en important un fichier GEDCOM issu d'un logiciel de généalogie existant, ce qui reprend en une seule opération les noms, dates et filiations déjà collectés. Chaque membre dispose ensuite d'une fiche enrichie : photo de portrait, biographie, lieux de vie affichés sur une carte, et surtout la liste des souvenirs où il apparaît. Vous pouvez identifier une personne directement sur une photo de famille, comme sur un réseau social mais dans un cadre strictement privé. L'arbre s'affiche en mode sablier autour d'une personne choisie et s'exporte en PDF ou en GEDCOM. Cette fonction est disponible [en option à 5 € par mois](/tarifs)."
        }
      ]
    },
    {
      icon: Lock,
      title: "Démarrer, essayer et s'inspirer",
      questions: [
        {
          question: "Combien coûte Family Garden et que comprend l'essai de 14 jours ?",
          answer: "Family Garden coûte 2,99 € par mois TTC, sans engagement, avec 20 Go de stockage et toutes les fonctions du journal de famille ; seul l'arbre généalogique est une option à 5 € par mois. L'essai de 14 jours est complet et sans carte bancaire : vous créez de vrais souvenirs, vous invitez vos proches dans un cercle, vous testez la chronologie et l'export PDF, et vous décidez ensuite. Le détail des inclusions, la comparaison avec les autres solutions et le calcul du coût annuel figurent sur la [page tarifs](/tarifs), et le fonctionnement général est décrit sur la page [à propos de Family Garden](/about)."
        },
        {
          question: "Puis-je essayer Family Garden sans créer de compte ?",
          answer: "Oui. Une [démonstration interactive](/demo) vous permet de créer un premier souvenir en deux minutes, avec un texte, une photo et une date, sans inscription ni carte bancaire. Vous voyez immédiatement à quoi ressemble un souvenir une fois enregistré dans un journal de famille privé. Ce souvenir de démonstration est temporaire : il est effacé si vous ne poursuivez pas, mais vous pouvez le conserver en ouvrant un compte à la fin du parcours, puis profiter des 14 jours d'essai décrits sur la [page tarifs](/tarifs)."
        },
        {
          question: "Comment créer un arbre généalogique avec photos et souvenirs ?",
          answer: "Vous partez de vous-même et vous ajoutez vos parents, grands-parents et descendants, ou vous importez un fichier GEDCOM existant. Chaque personne reçoit ensuite une fiche avec portrait, biographie, lieux de vie et souvenirs associés, et vous pouvez identifier les visages directement sur les photos de famille. Le guide complet, étape par étape, est détaillé dans notre article [arbre généalogique en ligne : photos et souvenirs](/blog/arbre-genealogique-en-ligne-photos-et-souvenirs). L'arbre est une option à 5 € par mois, présentée sur la [page tarifs](/tarifs)."
        },
        {
          question: "Par quels thèmes commencer mon journal de famille ?",
          answer: "Commencez par ce dont vous vous souvenez le mieux plutôt que par le début de votre vie : l'enfance, la maison familiale, les vacances, le premier métier, les rencontres. Family Garden organise les souvenirs par thèmes : la page [catégories de souvenirs](/categories) montre les grandes familles disponibles et ce qu'on y range habituellement. Si vous manquez d'idées, la page [inspirations](/inspirations) propose une cinquantaine de questions guidées auxquelles répondre en dix minutes, à l'écrit ou à la voix. La méthode complète est décrite dans l'article [raconter sa vie à ses enfants](/blog/raconter-sa-vie-a-ses-enfants-methode)."
        },
        {
          question: "Family Garden est-il disponible en plusieurs langues ?",
          answer: "Oui, l'interface existe en sept langues : français, anglais, espagnol, italien, portugais, coréen et chinois. Le changement de langue s'effectue à tout moment depuis le sélecteur du menu, et vos souvenirs restent bien sûr rédigés dans la langue de votre choix, ce qui est précieux pour les familles réparties sur plusieurs pays. Nos guides éditoriaux sont eux aussi traduits : vous les retrouvez dans la langue affichée depuis le [blog Family Garden](/blog)."
        },
        {
          question: "Où trouver des conseils pour écrire et conserver mes souvenirs ?",
          answer: "Le [blog Family Garden](/blog) réunit nos guides pratiques sur la mémoire familiale : créer une [capsule temporelle numérique](/blog/capsule-temporelle-numerique-comment-en-creer-une), [conserver et transmettre ses souvenirs de famille](/blog/conserver-transmettre-souvenirs-de-famille), raconter sa vie à ses enfants en sept étapes, ou construire un arbre généalogique enrichi de photos. Chaque article donne une méthode concrète, applicable en quelques séances courtes. Pour les questions pratiques sur le service lui-même, la présente FAQ et la [page tarifs](/tarifs) répondent à l'essentiel."
        }
      ]
    }
  ];


  // Build FAQ items for JSON-LD (texte pur, sans balisage de liens)
  const allFaqItems = faqCategories.flatMap((cat) =>
    cat.questions.map((q) => ({ question: q.question, answer: stripInlineLinks(q.answer) }))
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
                          {renderInlineLinks(item.answer)}
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
