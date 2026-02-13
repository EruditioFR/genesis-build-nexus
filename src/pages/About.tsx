import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import SEOHead from "@/components/seo/SEOHead";
import { createBreadcrumbSchema } from "@/lib/seoSchemas";
import { 
  Heart, 
  Shield, 
  Users, 
  Leaf, 
  Sparkles,
  Lock,
  ArrowRight,
  CheckCircle2
} from "lucide-react";

const About = () => {
  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": "https://www.familygarden.fr/about#aboutpage",
    "name": "À propos de Family Garden",
    "description": "Découvrez l'histoire, la mission et les valeurs de Family Garden, plateforme française dédiée à la préservation des souvenirs familiaux.",
    "mainEntity": { "@id": "https://www.familygarden.fr/#organization" },
    "isPartOf": { "@id": "https://www.familygarden.fr/#website" },
  };

  const values = [
    {
      icon: Heart,
      title: "Bienveillance",
      description: "Les moments de famille comptent. Nous concevons FamilyGarden pour qu'il soit simple, chaleureux et utile au quotidien."
    },
    {
      icon: Shield,
      title: "Sécurité",
      description: "Chiffrement et bonnes pratiques de sécurité, hébergement européen, et protection de l'accès à votre espace."
    },
    {
      icon: Users,
      title: "Partage",
      description: "Partagez vos souvenirs avec les bonnes personnes grâce aux cercles privés (grands-parents, parrain/marraine, proches)."
    },
    {
      icon: Leaf,
      title: "Pérennité",
      description: "Vous gardez la main : export, organisation et continuité. FamilyGarden est conçu pour durer sans vous enfermer."
    },
    {
      icon: Sparkles,
      title: "Simplicité",
      description: "Une interface intuitive accessible à tous, des grands-parents aux petits-enfants, sans compétence technique requise."
    },
    {
      icon: Lock,
      title: "Confidentialité",
      description: "Vous contrôlez qui voit quoi. Pas de revente de données, pas de partage publicitaire."
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
      <SEOHead
        title="À propos de Family Garden | Le journal de famille privé"
        description="Découvrez FamilyGarden : un journal de famille privé pour rassembler photos, vidéos, audios et textes, les organiser simplement et les partager en cercles avec vos proches."
        jsonLd={[
          aboutSchema,
          createBreadcrumbSchema([
            { name: "Accueil", url: "/" },
            { name: "À propos", url: "/about" },
          ]),
        ]}
      />
      <Header forceSolid />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-primary/10 via-gold/5 to-terracotta/5 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gold/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-terracotta/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
              <Heart className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Votre histoire familiale</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">
              À propos de <span className="bg-gradient-to-r from-primary via-gold to-terracotta bg-clip-text text-transparent">Family Garden</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              FamilyGarden est un journal de famille privé : un endroit simple pour rassembler 
              vos souvenirs (photos, vidéos, audios, textes), les organiser, et les partager 
              en cercle avec vos proches.
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
                  Chez FamilyGarden, nous croyons que les meilleurs moments se vivent… et se racontent. 
                  Notre mission : vous offrir un <strong>espace privé et simple</strong> pour créer un 
                  journal de famille qui donne du sens à vos souvenirs.
                </p>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Dans un monde où tout s'éparpille (téléphone, WhatsApp, drive…), FamilyGarden vous aide 
                  à retrouver vos souvenirs facilement et à les partager avec les bonnes personnes.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Concrètement : vous créez un souvenir, vous ajoutez vos contenus (photos/vidéo/texte/audio), 
                  et vous le partagez (ou non) dans des <strong>cercles privés</strong>.
                </p>
              </div>
              <Card className="bg-gradient-to-br from-primary/10 via-gold/5 to-terracotta/5 border-primary/20 shadow-lg">
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-gold flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </span>
                    Nos domaines d'expertise
                  </h3>
                  <ul className="space-y-3">
                    {expertiseAreas.map((area, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
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
      <section className="py-16 bg-gradient-to-b from-muted/30 via-gold/5 to-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 rounded-full mb-4">
                <Leaf className="w-4 h-4 text-gold" />
                <span className="text-sm font-medium text-gold">Ce qui nous guide</span>
              </div>
              <h2 className="text-3xl font-display font-bold text-foreground mb-4">
                Nos valeurs
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Six piliers fondamentaux guident chaque décision que nous prenons 
                dans le développement de Family Garden.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {values.map((value, index) => {
                const colorVariants = [
                  'from-primary to-primary/70',
                  'from-gold to-gold/70',
                  'from-terracotta to-terracotta/70',
                  'from-navy to-navy/70',
                  'from-primary to-gold',
                  'from-terracotta to-primary',
                ];
                return (
                  <Card key={index} className="bg-background border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 group">
                    <CardContent className="p-6">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorVariants[index]} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <value.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {value.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {value.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>


      {/* Trust Section */}
      <section className="py-16 bg-gradient-to-br from-navy/5 via-primary/5 to-gold/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-background border-navy/20 shadow-xl overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-primary via-gold to-terracotta" />
              <CardContent className="p-8 md:p-12">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-navy/10 rounded-full mb-4">
                    <Shield className="w-4 h-4 text-navy" />
                    <span className="text-sm font-medium text-navy">Votre confiance, notre priorité</span>
                  </div>
                  <h2 className="text-3xl font-display font-bold text-foreground mb-4">
                    Sécurité & confidentialité
                  </h2>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="p-6 rounded-xl bg-gradient-to-br from-primary/5 to-transparent border border-primary/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                        <Lock className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">
                        Protection de vos données
                      </h3>
                    </div>
                    <ul className="space-y-3 text-muted-foreground text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Connexions chiffrées (HTTPS) et protection de l'accès</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Hébergement européen (RGPD)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Sauvegardes et mesures de continuité</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Contrôle du partage via les cercles privés</span>
                      </li>
                    </ul>
                  </div>
                  <div className="p-6 rounded-xl bg-gradient-to-br from-gold/5 to-transparent border border-gold/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold to-gold/70 flex items-center justify-center">
                        <Heart className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">
                        Engagement éthique
                      </h3>
                    </div>
                    <ul className="space-y-3 text-muted-foreground text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                        <span>Aucune exploitation commerciale de vos données</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                        <span>Aucun partage avec des tiers publicitaires</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                        <span>Droit à l'export et à la suppression à tout moment</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                        <span>Transparence totale sur l'utilisation des données</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-primary/10 via-gold/10 to-terracotta/10 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-gold/15 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-sm rounded-full mb-6 border border-primary/20">
              <ArrowRight className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Lancez-vous</span>
            </div>
            <h2 className="text-3xl font-display font-bold text-foreground mb-4">
              Prêt à créer votre journal de famille ?
            </h2>
            <p className="text-muted-foreground mb-8">
              Commencez en 1 minute : créez votre premier souvenir, ajoutez une photo ou un audio, et invitez vos proches.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg">
                <Link to="/signup">
                  Créer mon compte gratuit
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-primary/30 hover:bg-primary/5">
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
