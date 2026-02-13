const SITE_URL = 'https://www.familygarden.fr';

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
  "url": SITE_URL,
  "publisher": { "@id": `${SITE_URL}/#organization` },
  "inLanguage": ["fr", "en", "es", "ko", "zh"],
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": `${SITE_URL}/capsules?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "Comment créer un souvenir sur Family Garden",
  "description": "Créez et partagez un souvenir familial en 4 étapes simples sur Family Garden.",
  "step": [
    {
      "@type": "HowToStep",
      "position": 1,
      "name": "Créez votre compte",
      "text": "Inscrivez-vous gratuitement et commencez à documenter votre histoire en quelques minutes.",
    },
    {
      "@type": "HowToStep",
      "position": 2,
      "name": "Ajoutez vos souvenirs",
      "text": "Uploadez photos, vidéos, enregistrements audio et rédigez vos histoires avec notre éditeur intuitif.",
    },
    {
      "@type": "HowToStep",
      "position": 3,
      "name": "Organisez et partagez",
      "text": "Structurez vos capsules en chapitres de vie et invitez votre famille à contribuer.",
    },
    {
      "@type": "HowToStep",
      "position": 4,
      "name": "Revivez quand vous voulez",
      "text": "Retrouvez vos moments en un clin d'œil grâce à la chronologie, et partagez-les avec vos proches.",
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
