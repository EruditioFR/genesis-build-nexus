import { useEffect } from 'react';

interface JsonLdSchemaProps {
  type?: 'organization' | 'application' | 'faq' | 'all';
}

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://www.familygarden.fr/#organization",
  "name": "Family Garden",
  "alternateName": "FamilyGarden",
  "url": "https://www.familygarden.fr",
  "logo": {
    "@type": "ImageObject",
    "url": "https://www.familygarden.fr/logo.png",
    "width": 512,
    "height": 512
  },
  "image": "https://www.familygarden.fr/og-image.png",
  "description": "Plateforme française de journal de famille privé et sécurisé. Créez, organisez et partagez vos souvenirs multimédia (photos, vidéos, audio, textes) avec vos proches. Chiffrement AES-256 et hébergement européen conforme RGPD.",
  "foundingDate": "2024",
  "areaServed": {
    "@type": "Country",
    "name": "France"
  },
  "knowsLanguage": ["fr", "en", "es", "ko", "zh", "it", "pt"],
  "slogan": "Un espace privé pour raconter ses souvenirs, et partager les moments qui comptent.",
  "keywords": "journal de famille, capsule mémorielle, souvenirs familiaux, arbre généalogique, héritage numérique, album photo sécurisé, partage familial privé, RGPD, chronologie familiale",
  "sameAs": [],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "availableLanguage": ["French", "English", "Spanish", "Korean", "Chinese", "Italian", "Portuguese"],
    "url": "https://www.familygarden.fr/#contact"
  }
};

const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": "https://www.familygarden.fr/#app",
  "name": "Family Garden",
  "alternateName": "FamilyGarden — Journal de famille privé",
  "applicationCategory": "LifestyleApplication",
  "applicationSubCategory": "Family Memory Preservation",
  "operatingSystem": "Web",
  "description": "Application web de création de souvenirs numériques. Rassemblez photos, vidéos, audio et textes dans des souvenirs contextualisés, organisez-les sur une chronologie interactive par décennies, et partagez-les en cercles privés avec votre famille. Chiffrement AES-256, serveurs européens RGPD.",
  "abstract": "Family Garden est un journal de famille privé qui permet de préserver et transmettre ses souvenirs aux générations futures. Chaque souvenir combine plusieurs médias avec un contexte (date, lieu, personnes) et s'organise sur une chronologie interactive.",
  "offers": [
    {
      "@type": "Offer",
      "name": "Gratuit",
      "price": "0",
      "priceCurrency": "EUR",
      "description": "250 Mo de stockage, souvenirs texte et photo, chronologie basique"
    },
    {
      "@type": "Offer",
      "name": "Premium",
      "price": "4.99",
      "priceCurrency": "EUR",
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "price": "4.99",
        "priceCurrency": "EUR",
        "billingDuration": "P1M"
      },
      "description": "10 Go de stockage, tous formats multimédia, partage avancé, sans publicité"
    },
    {
      "@type": "Offer",
      "name": "Héritage",
      "price": "9.99",
      "priceCurrency": "EUR",
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "price": "9.99",
        "priceCurrency": "EUR",
        "billingDuration": "P1M"
      },
      "description": "20 Go, partage illimité, arbre généalogique interactif, legs posthume, support VIP"
    }
  ],
  "featureList": [
    "Souvenirs multimédia (texte, photo, vidéo, audio)",
    "Chronologie interactive par décennies",
    "Cercles de partage familial sécurisés",
    "Arbre généalogique interactif avec import/export GEDCOM",
    "Export PDF haute qualité",
    "Legs posthume programmé avec gardiens de confiance",
    "Chiffrement AES-256 de niveau bancaire",
    "Hébergement sur serveurs européens conformes RGPD",
    "Mode senior-friendly simplifié",
    "Support multilingue (FR, EN, ES, KO, ZH, IT, PT)",
    "Suggestions et inspirations guidées de souvenirs",
    "Catégories thématiques personnalisables"
  ],
  "screenshot": "https://www.familygarden.fr/og-image.png",
  "availableLanguage": ["fr", "en", "es", "ko", "zh", "it", "pt"],
  "inLanguage": "fr",
  "isAccessibleForFree": true,
  "provider": {
    "@id": "https://www.familygarden.fr/#organization"
  },
  "audience": {
    "@type": "PeopleAudience",
    "audienceType": "Familles, grands-parents, parents, généalogistes amateurs",
    "suggestedMinAge": 13
  }
};

const faqPageSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": "https://www.familygarden.fr/#faq",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Qu'est-ce qu'une capsule mémorielle Family Garden ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Une capsule mémorielle est un conteneur numérique sécurisé qui préserve vos souvenirs sous forme de textes, photos, vidéos et enregistrements audio. C'est votre histoire personnelle, organisée chronologiquement sur une frise interactive, prête à être transmise aux générations futures. Chaque capsule peut être enrichie de dates, de lieux et partagée avec vos cercles de confiance."
      }
    },
    {
      "@type": "Question",
      "name": "Mes données sont-elles sécurisées sur Family Garden ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Oui, la sécurité est notre priorité absolue. Vos données sont chiffrées avec le standard AES-256 de niveau bancaire, stockées sur des serveurs européens conformes au RGPD, et sauvegardées quotidiennement. Vous gardez un contrôle total sur qui peut accéder à vos souvenirs grâce aux cercles de partage personnalisables."
      }
    },
    {
      "@type": "Question",
      "name": "Comment fonctionne le partage familial sur Family Garden ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Vous pouvez créer des cercles de confiance (famille proche, famille élargie, amis) et inviter des membres par email. Pour chaque cercle, vous définissez les permissions : lecture seule, possibilité de commenter, ou droit de contribution. Chaque capsule peut être partagée avec un ou plusieurs cercles de votre choix."
      }
    },
    {
      "@type": "Question",
      "name": "Comment fonctionne le legs posthume sur Family Garden ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Avec l'offre Héritage, vous désignez des contacts de confiance (gardiens) qui seront notifiés et recevront accès à certains souvenirs selon vos souhaits après votre décès. Vous pouvez programmer des révélations différées, laisser des messages personnels pour chaque destinataire, et définir des conditions d'accès spécifiques."
      }
    },
    {
      "@type": "Question",
      "name": "Que se passe-t-il avec mes données si je ne renouvelle pas mon abonnement Family Garden ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Vos données ne sont jamais supprimées automatiquement. Si vous passez de Premium à Gratuit, vous conservez l'accès en lecture à tout votre contenu existant. Vous pouvez exporter l'intégralité de vos données (PDF, fichiers médias) à tout moment, quel que soit votre abonnement."
      }
    },
    {
      "@type": "Question",
      "name": "Y a-t-il une application mobile Family Garden ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "La plateforme web Family Garden est entièrement responsive et fonctionne parfaitement sur tous les appareils mobiles (smartphones et tablettes). Vous pouvez créer des capsules, enregistrer des audios et partager vos souvenirs depuis votre navigateur mobile. Une application native iOS et Android est en développement pour offrir l'enregistrement direct et le mode hors-ligne."
      }
    },
    {
      "@type": "Question",
      "name": "Quelle est la différence entre Family Garden et un simple album photo en ligne ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Family Garden va bien au-delà d'un album photo. C'est une plateforme de préservation de l'héritage familial qui combine : des capsules mémorielles multimédia contextualisées (dates, lieux, histoires), une chronologie interactive par décennies, un arbre généalogique pour relier les personnes aux souvenirs, des cercles de partage sécurisés, et surtout la possibilité de programmer la transmission de votre héritage numérique aux générations futures."
      }
    },
    {
      "@type": "Question",
      "name": "Family Garden est-il conforme au RGPD ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Oui, Family Garden est entièrement conforme au RGPD. Toutes les données sont hébergées sur des serveurs situés en Union Européenne, chiffrées avec le standard AES-256. L'utilisateur garde un contrôle total sur ses données : droit d'accès, de rectification, de portabilité et de suppression. Aucune donnée n'est revendue à des tiers."
      }
    }
  ]
};

const JsonLdSchema = ({ type = 'all' }: JsonLdSchemaProps) => {
  useEffect(() => {
    const scripts: HTMLScriptElement[] = [];

    const addSchema = (schema: object, id: string) => {
      if (document.getElementById(id)) return;
      
      const script = document.createElement('script');
      script.id = id;
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
      scripts.push(script);
    };

    if (type === 'all' || type === 'organization') {
      addSchema(organizationSchema, 'json-ld-organization');
    }
    if (type === 'all' || type === 'application') {
      addSchema(softwareApplicationSchema, 'json-ld-application');
    }
    if (type === 'all' || type === 'faq') {
      addSchema(faqPageSchema, 'json-ld-faq');
    }

    return () => {
      scripts.forEach(script => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      });
    };
  }, [type]);

  return null;
};

export default JsonLdSchema;
