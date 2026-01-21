import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { 
  Heart, 
  Shield, 
  Users, 
  Leaf, 
  Clock, 
  Lock,
  ArrowRight,
  CheckCircle2
} from "lucide-react";

const About = () => {
  useEffect(() => {
    // Update page title and meta for SEO
    document.title = "À propos de Family Garden | Notre mission et nos valeurs";
    
    // Add meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 
        'Découvrez l\'histoire de Family Garden, plateforme française de capsules mémorielles. Notre mission : préserver et transmettre vos souvenirs aux générations futures avec sécurité et respect de la vie privée.'
      );
    }

    // Add AboutPage JSON-LD schema
    const aboutSchema = {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "@id": "https://www.familygarden.fr/about#aboutpage",
      "name": "À propos de Family Garden",
      "description": "Découvrez l'histoire, la mission et les valeurs de Family Garden, plateforme française dédiée à la préservation des souvenirs familiaux.",
      "mainEntity": {
        "@type": "Organization",
        "@id": "https://www.familygarden.fr/#organization"
      },
      "isPartOf": {
        "@type": "WebSite",
        "@id": "https://www.familygarden.fr/#website"
      }
    };

    const script = document.createElement('script');
    script.id = 'about-jsonld';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(aboutSchema);
    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById('about-jsonld');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  const values = [
    {
      icon: Heart,
      title: "Bienveillance",
      description: "Chaque souvenir est précieux. Nous traitons vos données avec le plus grand respect et la plus grande attention."
    },
    {
      icon: Shield,
      title: "Sécurité",
      description: "Chiffrement AES-256 de niveau bancaire, serveurs européens conformes au RGPD, sauvegardes quotidiennes automatiques."
    },
    {
      icon: Users,
      title: "Transmission",
      description: "Faciliter le partage intergénérationnel des histoires familiales pour créer des liens durables entre les générations."
    },
    {
      icon: Leaf,
      title: "Pérennité",
      description: "Vos souvenirs méritent de traverser le temps. Notre infrastructure est conçue pour préserver vos données sur le long terme."
    },
    {
      icon: Clock,
      title: "Simplicité",
      description: "Une interface intuitive accessible à tous, des grands-parents aux petits-enfants, sans compétence technique requise."
    },
    {
      icon: Lock,
      title: "Confidentialité",
      description: "Vous gardez le contrôle total sur vos données. Aucune exploitation commerciale, aucun partage avec des tiers."
    }
  ];

  const milestones = [
    {
      year: "2024",
      title: "Naissance de Family Garden",
      description: "Création de la plateforme avec une vision claire : permettre à chaque famille de préserver son héritage numérique."
    },
    {
      year: "2024",
      title: "Lancement des capsules mémorielles",
      description: "Développement du concept de capsule mémorielle multimédia : textes, photos, vidéos et audio réunis dans un espace sécurisé."
    },
    {
      year: "2025",
      title: "Fonctionnalité Legacy",
      description: "Introduction du legs posthume programmé, permettant de transmettre des messages et souvenirs à ses proches selon ses souhaits."
    },
    {
      year: "2025",
      title: "Arbre généalogique intégré",
      description: "Liaison des capsules mémorielles à l'arbre généalogique pour une vision complète de l'histoire familiale."
    }
  ];

  const expertiseAreas = [
    "Préservation numérique des souvenirs familiaux",
    "Sécurité et chiffrement des données sensibles",
    "Transmission intergénérationnelle du patrimoine immatériel",
    "Expérience utilisateur accessible à tous les âges",
    "Conformité RGPD et protection de la vie privée"
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">
              À propos de <span className="text-primary">Family Garden</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Plateforme française de capsules mémorielles numériques, 
              Family Garden accompagne les familles dans la préservation et 
              la transmission de leurs souvenirs les plus précieux.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-display font-bold text-foreground mb-6">
                  Notre mission
                </h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Chez Family Garden, nous croyons que chaque histoire familiale mérite d'être préservée. 
                  Notre mission est de fournir un <strong>coffre-fort numérique sécurisé</strong> où 
                  les familles peuvent stocker, organiser et transmettre leurs souvenirs aux générations futures.
                </p>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Dans un monde où les photos s'accumulent sur des téléphones perdus et où les histoires 
                  orales risquent de disparaître, nous offrons une solution pérenne pour 
                  <strong> l'héritage numérique familial</strong>.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Notre plateforme permet de créer des <strong>capsules mémorielles</strong> enrichies 
                  de textes, photos, vidéos et enregistrements audio, organisées chronologiquement 
                  et partageables en toute sécurité avec les cercles de confiance que vous définissez.
                </p>
              </div>
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    Nos domaines d'expertise
                  </h3>
                  <ul className="space-y-3">
                    {expertiseAreas.map((area, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{area}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-display font-bold text-foreground mb-4">
                Nos valeurs
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Six piliers fondamentaux guident chaque décision que nous prenons 
                dans le développement de Family Garden.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {values.map((value, index) => (
                <Card key={index} className="bg-background border-border hover:border-primary/30 transition-colors">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <value.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {value.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-display font-bold text-foreground mb-4">
                Notre histoire
              </h2>
              <p className="text-muted-foreground">
                Les étapes clés du développement de Family Garden.
              </p>
            </div>
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex gap-6">
                  <div className="flex-shrink-0 w-16">
                    <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-semibold rounded-full">
                      {milestone.year}
                    </span>
                  </div>
                  <div className="flex-1 pb-8 border-l-2 border-primary/20 pl-6 relative">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {milestone.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {milestone.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-background border-primary/20">
              <CardContent className="p-8 md:p-12">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-display font-bold text-foreground mb-4">
                    Pourquoi nous faire confiance ?
                  </h2>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">
                      Sécurité de niveau entreprise
                    </h3>
                    <ul className="space-y-2 text-muted-foreground text-sm">
                      <li>• Chiffrement AES-256 des données au repos et en transit</li>
                      <li>• Hébergement sur serveurs européens conformes RGPD</li>
                      <li>• Sauvegardes quotidiennes automatiques géo-répliquées</li>
                      <li>• Authentification sécurisée avec option 2FA</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">
                      Engagement éthique
                    </h3>
                    <ul className="space-y-2 text-muted-foreground text-sm">
                      <li>• Aucune exploitation commerciale de vos données</li>
                      <li>• Aucun partage avec des tiers publicitaires</li>
                      <li>• Droit à l'export et à la suppression à tout moment</li>
                      <li>• Transparence totale sur l'utilisation des données</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-display font-bold text-foreground mb-4">
              Prêt à préserver vos souvenirs ?
            </h2>
            <p className="text-muted-foreground mb-8">
              Rejoignez Family Garden et commencez à créer votre héritage numérique familial dès aujourd'hui.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="gap-2">
                <Link to="/signup">
                  Créer mon compte gratuit
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/">
                  Découvrir les fonctionnalités
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
