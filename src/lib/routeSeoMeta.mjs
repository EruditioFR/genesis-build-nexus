/**
 * Single source of truth for per-route <head> metadata.
 *
 * Consumed twice:
 *  - at runtime by the page components (via <SEOHead />), for users and
 *    JS-executing crawlers;
 *  - at build time by scripts/prerender.mjs, which bakes the same title,
 *    description, canonical, Open Graph tags and JSON-LD into a static
 *    HTML file per route — so crawlers that do not run JavaScript see a
 *    different, correct <head> on every public page.
 *
 * Plain ESM (no TypeScript) so Node can import it directly during the build.
 * Types live in routeSeoMeta.d.mts.
 */

export const SITE_URL = "https://familygarden.fr";
export const BRAND = "Family Garden";

/** Public, indexable routes that get their own prerendered HTML file. */
export const ROUTE_SEO = {
  "/": {
    title: "Family Garden — Journal de famille privé, 2,99 €/mois",
    description:
      "Réunissez photos, vidéos, voix et récits de famille dans un journal privé et sécurisé. 2,99 €/mois, 14 jours d'essai gratuit, hébergement RGPD.",
    h1: "Family Garden, votre journal de famille privé",
    summary:
      "Family Garden réunit vos souvenirs de famille — photos, vidéos, enregistrements audio et récits — dans un journal privé, organisé sur une chronologie et un arbre généalogique, partagé uniquement avec les proches que vous choisissez.",
    schemas: ["organization", "website", "softwareApplication"],
  },
  "/tarifs": {
    title: "Tarif Family Garden : 2,99 €/mois — 14 jours d'essai gratuit",
    description:
      "Family Garden coûte 2,99 €/mois : 20 Go, souvenirs illimités, partage privé. Comparez avec le cloud et les sites de généalogie. Essai gratuit 14 jours.",
    h1: "Le tarif Family Garden : 2,99 € par mois",
    summary:
      "Un abonnement unique à 2,99 € par mois donne accès à toutes les fonctions de Family Garden et à 20 Go de stockage. L'arbre généalogique est une option à 5 € par mois. Chaque compte démarre par 14 jours d'essai gratuit, sans carte bancaire.",
    schemas: ["offer", "breadcrumb"],
  },
  "/pricing": {
    title: "Family Garden pricing: €2.99/month — 14-day free trial",
    description:
      "Family Garden costs €2.99/month: 20 GB, unlimited memories, private sharing. Compare it with cloud storage and genealogy sites. 14-day free trial.",
    h1: "Family Garden pricing: €2.99 per month",
    summary:
      "One subscription at €2.99 per month unlocks every Family Garden feature and 20 GB of storage. The family tree is a €5/month add-on. Every account starts with a 14-day free trial, no credit card required.",
    schemas: ["offer", "breadcrumb"],
  },
  "/premium": {
    title: "Tarifs Family Garden : 2,99 €/mois pour préserver vos souvenirs",
    description:
      "Un tarif unique et transparent : 2,99 €/mois, tous vos souvenirs et 20 Go. Option arbre généalogique à 5 €/mois. 14 jours d'essai gratuit sans carte.",
    h1: "Un abonnement unique, sans surprise",
    summary:
      "Family Garden propose un abonnement unique à 2,99 € par mois : souvenirs illimités, 20 Go de stockage, cercles de partage privés, chronologie et export de vos données. L'arbre généalogique s'ajoute pour 5 € par mois.",
    schemas: ["offer", "breadcrumb"],
  },
  "/faq": {
    title: "FAQ : journal de famille privé et arbre généalogique | Family Garden",
    description:
      "Toutes les réponses sur Family Garden : sécurité des données, partage familial, abonnement à 2,99 €/mois, gardiens, arbre généalogique, export, RGPD.",
    h1: "Questions fréquentes sur Family Garden",
    summary:
      "Sécurité et confidentialité des souvenirs, fonctionnement des cercles de partage, abonnement à 2,99 € par mois, option arbre généalogique, transmission aux gardiens, export et sauvegarde : les réponses détaillées aux questions les plus posées sur Family Garden.",
    schemas: ["faq", "breadcrumb"],
  },
  "/about": {
    title: "À propos : le journal de famille privé | Family Garden",
    description:
      "Découvrez Family Garden : pourquoi et comment nous aidons les familles à rassembler, organiser et transmettre leurs souvenirs, en France et en Europe.",
    h1: "À propos de Family Garden",
    summary:
      "Family Garden est un service français conçu pour que les familles rassemblent leurs souvenirs au même endroit, les organisent dans le temps et les transmettent aux générations suivantes, sans publicité et sans exploitation des données.",
    schemas: ["organization", "breadcrumb"],
  },
  "/blog": {
    title: "Blog Family Garden : conserver et transmettre ses souvenirs",
    description:
      "Guides pratiques pour conserver ses photos de famille, raconter sa vie à ses enfants, construire un arbre généalogique et transmettre sa mémoire familiale.",
    h1: "Le blog Family Garden",
    summary:
      "Des guides détaillés sur la conservation des photos de famille, l'écriture des souvenirs, la capsule temporelle numérique, l'arbre généalogique en ligne et la transmission de la mémoire familiale.",
    schemas: ["blog", "breadcrumb"],
  },
  "/demo": {
    title: "Démo Family Garden : créez un souvenir en 1 minute",
    description:
      "Testez Family Garden sans créer de compte : écrivez un souvenir, ajoutez une photo et voyez comment votre journal de famille privé prend forme.",
    h1: "Essayez Family Garden en une minute",
    summary:
      "Une démonstration guidée, sans inscription : vous écrivez un souvenir, ajoutez une photo et découvrez comment Family Garden le conserve, le date et le rend consultable par vos proches.",
    schemas: ["breadcrumb"],
  },
  "/privacy": {
    title: "Confidentialité et protection des données | Family Garden",
    description:
      "Comment Family Garden protège vos souvenirs : chiffrement, hébergement européen conforme au RGPD, aucune publicité, contrôle total sur vos contenus.",
    h1: "Politique de confidentialité",
    summary:
      "Family Garden protège vos données personnelles et vos souvenirs : chiffrement, hébergement européen conforme au RGPD, aucune revente de données, suppression et export possibles à tout moment.",
    schemas: ["breadcrumb"],
  },
  "/cgv": {
    title: "Conditions générales de vente | Family Garden",
    description:
      "Conditions générales de vente de Family Garden : abonnement à 2,99 €/mois, option arbre généalogique, paiement, résiliation et politique de remboursement.",
    h1: "Conditions générales de vente",
    summary:
      "Modalités d'abonnement à Family Garden : tarif, durée, renouvellement, moyens de paiement, droit de rétractation, résiliation et remboursement.",
    schemas: ["breadcrumb"],
  },
  "/terms": {
    title: "Conditions générales d'utilisation | Family Garden",
    description:
      "Conditions générales d'utilisation de Family Garden : création de compte, usage du service, contenus publiés, propriété intellectuelle et responsabilités.",
    h1: "Conditions générales d'utilisation",
    summary:
      "Règles d'utilisation de Family Garden : inscription, usage du service, contenus déposés par les utilisateurs, propriété intellectuelle et responsabilités de chacun.",
    schemas: ["breadcrumb"],
  },
  "/mentions-legales": {
    title: "Mentions légales | Family Garden",
    description:
      "Mentions légales de Family Garden : éditeur du site, hébergement, sous-traitants, protection des données personnelles et informations de contact.",
    h1: "Mentions légales",
    summary:
      "Éditeur, hébergeur, sous-traitants, délégué à la protection des données et coordonnées de contact du service Family Garden.",
    schemas: ["breadcrumb"],
  },
};

/** Human-readable breadcrumb labels used by the prerendered JSON-LD. */
export const ROUTE_BREADCRUMB_LABEL = {
  "/tarifs": "Tarifs",
  "/pricing": "Pricing",
  "/premium": "Abonnement",
  "/faq": "FAQ",
  "/about": "À propos",
  "/blog": "Blog",
  "/demo": "Démo",
  "/privacy": "Confidentialité",
  "/cgv": "CGV",
  "/terms": "CGU",
  "/mentions-legales": "Mentions légales",
};

/** Returns the metadata for a route, or undefined when it is not prerendered. */
export function getRouteSeo(path) {
  return ROUTE_SEO[path];
}
