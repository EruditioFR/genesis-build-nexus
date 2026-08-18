const SITE_URL = 'https://familygarden.fr';

export const createBreadcrumbSchema = (items: { name: string; url: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, i) => ({
    "@type": "ListItem",
    "position": i + 1,
    "name": item.name,
    "item": `${SITE_URL}${item.url}`,
  })),
});

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  "name": "Family Garden",
  "alternateName": "FamilyGarden — Journal de famille privé et sécurisé",
  "url": SITE_URL,
  "description": "Plateforme française de journal de famille privé. Créez des capsules mémorielles multimédia, organisez-les sur une chronologie interactive et partagez-les en cercles privés avec vos proches.",
  "publisher": { "@id": `${SITE_URL}/#organization` },
  "inLanguage": ["fr", "en", "es", "ko", "zh", "it", "pt"],
};

export const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "Comment créer un souvenir sur Family Garden",
  "description": "Créez et partagez un souvenir familial en 4 étapes simples sur Family Garden, le journal de famille privé et sécurisé.",
  "totalTime": "PT5M",
  "tool": [
    { "@type": "HowToTool", "name": "Un navigateur web (ordinateur, tablette ou smartphone)" },
    { "@type": "HowToTool", "name": "Vos photos, vidéos ou enregistrements audio (optionnel)" }
  ],
  "step": [
    {
      "@type": "HowToStep",
      "position": 1,
      "name": "Créez votre compte",
      "text": "Créez votre compte Family Garden et profitez de 14 jours d'essai gratuit, sans carte bancaire, puis 2,99 €/mois pour tout Family Garden.",
      "url": `${SITE_URL}/signup`
    },
    {
      "@type": "HowToStep",
      "position": 2,
      "name": "Ajoutez vos souvenirs",
      "text": "Uploadez photos, vidéos, enregistrements audio et rédigez vos histoires avec l'éditeur intuitif. Ajoutez la date, le lieu et les personnes liées à chaque souvenir.",
    },
    {
      "@type": "HowToStep",
      "position": 3,
      "name": "Organisez et partagez",
      "text": "Classez vos capsules par catégories thématiques, invitez votre famille dans des cercles de partage sécurisés et définissez qui peut voir quoi.",
    },
    {
      "@type": "HowToStep",
      "position": 4,
      "name": "Revivez quand vous voulez",
      "text": "Retrouvez vos moments en un clin d'œil grâce à la chronologie interactive par décennies, et partagez-les avec vos proches.",
    },
  ],
};

export const createFaqSchema = (items: { question: string; answer: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": items.map((item) => ({
    "@type": "Question",
    "name": item.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": item.answer,
    },
  })),
});

export const siteNavigationSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "@id": `${SITE_URL}/#sitenav`,
  "name": "Navigation principale Family Garden",
  "itemListElement": [
    { name: "Tarifs — 2,99 €/mois", url: "/tarifs" },
    { name: "Questions fréquentes", url: "/faq" },
    { name: "Blog", url: "/blog" },
    { name: "Inspirations", url: "/inspirations" },
    { name: "Catégories de souvenirs", url: "/categories" },
    { name: "À propos", url: "/about" },
  ].map((item, i) => ({
    "@type": "SiteNavigationElement",
    "position": i + 1,
    "name": item.name,
    "url": `${SITE_URL}${item.url}`,
  })),
};
