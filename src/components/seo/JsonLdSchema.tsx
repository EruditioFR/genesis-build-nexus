import { useEffect } from 'react';

interface JsonLdSchemaProps {
  type?: 'organization' | 'application' | 'faq' | 'all';
}

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://www.familygarden.fr/#organization",
  "name": "Family Garden",
  "url": "https://www.familygarden.fr",
  "logo": "https://www.familygarden.fr/logo.png",
  "description": "Plateforme française de capsules mémorielles pour préserver et transmettre vos souvenirs aux générations futures. Stockage sécurisé avec chiffrement AES-256 sur serveurs européens conformes RGPD.",
  "foundingDate": "2024",
  "areaServed": "France",
  "knowsLanguage": "fr",
  "slogan": "Préservez l'extraordinaire de votre vie ordinaire",
  "sameAs": []
};

const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": "https://www.familygarden.fr/#app",
  "name": "Family Garden",
  "applicationCategory": "LifestyleApplication",
  "operatingSystem": "Web",
  "description": "Application web de création de capsules mémorielles numériques. Stockez textes, photos, vidéos et audio pour créer votre héritage familial digital. Chiffrement de niveau bancaire AES-256, stockage sur serveurs européens RGPD.",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "EUR",
    "description": "Version gratuite disponible avec 500 Mo de stockage"
  },
  "featureList": [
    "Capsules mémorielles multimédia (texte, photo, vidéo, audio)",
    "Chronologie interactive par décennies",
    "Cercles de partage familial sécurisés",
    "Export PDF haute qualité",
    "Arbre généalogique interactif",
    "Legs posthume programmé",
    "Chiffrement AES-256",
    "Stockage européen conforme RGPD"
  ],
  "provider": {
    "@id": "https://www.familygarden.fr/#organization"
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
        "text": "Avec l'offre Legacy, vous désignez des contacts de confiance (gardiens) qui seront notifiés et recevront accès à certaines capsules selon vos souhaits après votre décès. Vous pouvez programmer des révélations différées, laisser des messages personnels pour chaque destinataire, et définir des conditions d'accès spécifiques."
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
    }
  ]
};

const JsonLdSchema = ({ type = 'all' }: JsonLdSchemaProps) => {
  useEffect(() => {
    const scripts: HTMLScriptElement[] = [];

    const addSchema = (schema: object, id: string) => {
      // Check if script already exists
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

    // Cleanup on unmount
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
