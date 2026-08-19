import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { z } from "zod";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { getRouteSeo } from "@/lib/routeSeoMeta.mjs";
import SEOHead from "@/components/seo/SEOHead";
import { createBreadcrumbSchema } from "@/lib/seoSchemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Check,
  X,
  Minus,
  ShieldCheck,
  Lock,
  RefreshCw,
  Server,
  TreePine,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const SITE_URL = "https://familygarden.fr";
const PRICE = 2.99;

const included = [
  "20 Go de stockage sécurisé",
  "Souvenirs illimités : texte, photo, vidéo, audio",
  "Cercles de partage illimités",
  "Chronologie interactive par décennie, année et mois",
  "Souvenirs testament (legs posthume) et gardiens",
  "Podcast IA de vos souvenirs",
  "Journal de famille privé, sans publicité",
  "Export de vos données à tout moment",
];

const guarantees = [
  { icon: RefreshCw, text: "Sans engagement, résiliable en 1 clic" },
  { icon: ShieldCheck, text: "Hébergement européen, conforme RGPD" },
  { icon: Lock, text: "Vos souvenirs restent privés et exportables" },
  { icon: Server, text: "Sauvegardes quotidiennes sécurisées" },
];

type Cell = boolean | "partial" | string;

const comparison: { label: string; fg: Cell; cloud: Cell; social: Cell; genea: Cell }[] = [
  { label: "Prix indicatif", fg: "2,99 €/mois", cloud: "≈ 2,99 €/mois", social: "Gratuit (publicité)", genea: "≈ 10 à 20 €/mois" },
  { label: "Stockage inclus", fg: "20 Go", cloud: "200 Go", social: "Variable", genea: "Limité" },
  { label: "Journal de famille privé", fg: true, cloud: false, social: false, genea: "partial" },
  { label: "Récits et souvenirs racontés", fg: true, cloud: false, social: "partial", genea: "partial" },
  { label: "Enregistrements de voix", fg: true, cloud: false, social: false, genea: "partial" },
  { label: "Chronologie familiale interactive", fg: true, cloud: false, social: false, genea: "partial" },
  { label: "Cercles de partage privés", fg: true, cloud: "partial", social: "partial", genea: false },
  { label: "Sans publicité ni exploitation des données", fg: true, cloud: true, social: false, genea: "partial" },
  { label: "Transmission posthume (souvenirs testament)", fg: true, cloud: false, social: false, genea: false },
  { label: "Podcast IA de vos souvenirs", fg: true, cloud: false, social: false, genea: false },
  { label: "Arbre généalogique", fg: "En option 5 €/mois", cloud: false, social: false, genea: true },
  { label: "Hébergement européen (RGPD)", fg: true, cloud: "partial", social: false, genea: "partial" },
];

const CellView = ({ value }: { value: Cell }) => {
  if (value === true) return <Check className="w-5 h-5 text-primary mx-auto" aria-label="Inclus" />;
  if (value === false) return <X className="w-5 h-5 text-muted-foreground/50 mx-auto" aria-label="Non disponible" />;
  if (value === "partial") return <Minus className="w-5 h-5 text-muted-foreground mx-auto" aria-label="Partiel" />;
  return <span className="text-sm text-foreground">{value}</span>;
};

const trialSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, { message: "Veuillez indiquer votre prénom" })
    .max(60, { message: "Le prénom doit faire moins de 60 caractères" }),
  email: z
    .string()
    .trim()
    .email({ message: "Adresse e-mail invalide" })
    .max(255, { message: "L'adresse e-mail doit faire moins de 255 caractères" }),
});

const PricingPage = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const routeSeo = getRouteSeo(pathname) ?? getRouteSeo("/tarifs")!;
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");


  const handleTrial = (e: React.FormEvent) => {
    e.preventDefault();
    const result = trialSchema.safeParse({ firstName, email });
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }
    const params = new URLSearchParams({
      email: result.data.email,
      firstName: result.data.firstName,
      source: "tarifs",
    });
    navigate(`/signup?${params.toString()}`);
  };

  const jsonLd = [
    createBreadcrumbSchema([
      { name: "Accueil", url: "/" },
      { name: "Tarifs", url: "/tarifs" },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "Product",
      "@id": `${SITE_URL}/tarifs#product`,
      name: "Family Garden — Journal de famille privé",
      description:
        "Journal de famille privé et sécurisé : photos, vidéos, voix et récits réunis pour 2,99 €/mois, avec 20 Go de stockage et 14 jours d'essai gratuit.",
      brand: { "@type": "Brand", name: "Family Garden" },
      offers: {
        "@type": "Offer",
        price: "2.99",
        priceCurrency: "EUR",
        availability: "https://schema.org/InStock",
        url: `${SITE_URL}/tarifs`,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": `${SITE_URL}/tarifs#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "Que comprend l'abonnement à 2,99 €/mois ?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "L'abonnement à 2,99 € par mois comprend toutes les fonctionnalités de Family Garden et 20 Go de stockage sécurisé : souvenirs illimités (texte, photo, vidéo, audio), cercles de partage, chronologie interactive, souvenirs testament et podcast IA. Seul l'arbre généalogique est en option à 5 € par mois.",
          },
        },
        {
          "@type": "Question",
          name: "L'essai de 14 jours est-il vraiment gratuit ?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Oui. Vous testez Family Garden pendant 14 jours sans payer. Vous choisissez ensuite de vous abonner à 2,99 € par mois ; sans abonnement, votre espace reste simplement inactif et vos souvenirs sont exportables.",
          },
        },
        {
          "@type": "Question",
          name: "Puis-je résilier à tout moment ?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Oui, l'abonnement est sans engagement et résiliable en un clic depuis votre profil. Vous pouvez exporter vos souvenirs quand vous le souhaitez.",
          },
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={routeSeo.title}
        description={routeSeo.description}
        jsonLd={jsonLd}
      />
      <Header />

      <main>
        {/* Hero prix */}
        <section className="pt-28 pb-16 sm:pt-32 sm:pb-20 bg-secondary/30">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <Badge variant="secondary" className="mb-4">Tarif unique et transparent</Badge>
              <h1 className="text-3xl sm:text-5xl font-serif font-bold text-foreground mb-5">
                Family Garden à 2,99 €/mois : votre journal de famille privé
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Un seul tarif, toutes les fonctionnalités et 20 Go de stockage sécurisé pour réunir
                vos souvenirs de famille — photos, vidéos, voix et récits. Vous commencez par
                14 jours d'essai gratuit, sans engagement. Découvrez{" "}
                <Link to="/about" className="text-primary underline underline-offset-4">notre démarche</Link>{" "}
                et notre guide pour créer une{" "}
                <Link to="/blog/capsule-temporelle-numerique-comment-en-creer-une" className="text-primary underline underline-offset-4">
                  capsule temporelle numérique
                </Link>.
              </p>


              <div className="flex flex-wrap items-baseline justify-center gap-2 mb-6">
                <span className="text-5xl sm:text-6xl font-bold text-foreground">{PRICE.toFixed(2).replace(".", ",")} €</span>
                <span className="text-xl text-muted-foreground">/ mois TTC</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button size="lg" asChild>
                  <a href="#essai">
                    Commencer mes 14 jours d'essai
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </a>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/demo">Essayer la démo en 2 minutes</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Ce qui est inclus */}
        <section className="py-16 sm:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground text-center mb-3">
                Tout est inclus pour 2,99 € par mois
              </h2>
              <p className="text-center text-muted-foreground mb-10">
                Pas d'options cachées, pas de paliers : une seule offre pour toute la famille.
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                  <CardContent className="p-6">
                    <ul className="grid sm:grid-cols-2 gap-3">
                      {included.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                          <Check className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <TreePine className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-foreground">Arbre généalogique</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Seule option payante : l'arbre généalogique complet, avec import GEDCOM,
                      photos et carte des lieux de vie.
                    </p>
                    <p className="text-2xl font-bold text-foreground">5 € <span className="text-base font-normal text-muted-foreground">/ mois</span></p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                {guarantees.map((g) => (
                  <div key={g.text} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <g.icon className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                    <span>{g.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Comparaison */}
        <section className="py-16 sm:py-20 bg-secondary/30">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground text-center mb-3">
                Family Garden comparé aux autres solutions
              </h2>
              <p className="text-center text-muted-foreground mb-10">
                Cloud photo, réseaux sociaux ou sites de généalogie : chacun résout une partie du
                besoin. Family Garden réunit vos souvenirs dans un journal de famille privé.
              </p>

              <div className="overflow-x-auto rounded-2xl border border-border bg-card">
                <table className="w-full min-w-[720px] text-sm">
                  <caption className="sr-only">
                    Comparaison de Family Garden avec le stockage cloud, les réseaux sociaux et les
                    sites de généalogie
                  </caption>
                  <thead>
                    <tr className="border-b border-border">
                      <th scope="col" className="text-left p-4 font-medium text-muted-foreground">Critère</th>
                      <th scope="col" className="p-4 font-semibold text-foreground bg-primary/5">Family Garden</th>
                      <th scope="col" className="p-4 font-medium text-muted-foreground">Cloud photo</th>
                      <th scope="col" className="p-4 font-medium text-muted-foreground">Réseaux sociaux</th>
                      <th scope="col" className="p-4 font-medium text-muted-foreground">Sites de généalogie</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.map((row) => (
                      <tr key={row.label} className="border-b border-border/60 last:border-0">
                        <th scope="row" className="text-left p-4 font-normal text-foreground">{row.label}</th>
                        <td className="p-4 text-center bg-primary/5"><CellView value={row.fg} /></td>
                        <td className="p-4 text-center"><CellView value={row.cloud} /></td>
                        <td className="p-4 text-center"><CellView value={row.social} /></td>
                        <td className="p-4 text-center"><CellView value={row.genea} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Prix indicatifs constatés publiquement, susceptibles d'évoluer. Comparaison par
                catégorie d'outils, à titre informatif.
              </p>
            </div>
          </div>
        </section>

        {/* Formulaire essai 14 jours */}
        <section id="essai" className="py-16 sm:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-2xl mx-auto"
            >
              <Card className="border-primary/20">
                <CardContent className="p-6 sm:p-10">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium text-primary">14 jours d'essai gratuit</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-3">
                    Testez Family Garden pendant 14 jours
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Indiquez votre prénom et votre adresse e-mail : vous créez votre espace en une
                    minute et vous découvrez toutes les fonctionnalités avant de payer.
                  </p>

                  <form onSubmit={handleTrial} className="space-y-4" noValidate>
                    <div>
                      <label htmlFor="trial-firstname" className="block text-sm font-medium text-foreground mb-1.5">
                        Prénom
                      </label>
                      <Input
                        id="trial-firstname"
                        name="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        maxLength={60}
                        autoComplete="given-name"
                        placeholder="Marie"
                      />
                    </div>
                    <div>
                      <label htmlFor="trial-email" className="block text-sm font-medium text-foreground mb-1.5">
                        Adresse e-mail
                      </label>
                      <Input
                        id="trial-email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        maxLength={255}
                        autoComplete="email"
                        placeholder="marie@exemple.fr"
                      />
                    </div>
                    <Button type="submit" size="lg" className="w-full">
                      Démarrer mes 14 jours d'essai
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      Sans carte bancaire pour l'essai. Ensuite 2,99 €/mois, sans engagement.
                      Vos données sont hébergées en Europe (RGPD).
                    </p>
                  </form>
                </CardContent>
              </Card>

              <div className="text-center mt-8 text-sm text-muted-foreground">
                Vous avez une question sur le tarif ?{" "}
                <Link to="/faq" className="text-primary underline underline-offset-4">
                  Consultez la FAQ
                </Link>{" "}
                ou{" "}
                <Link to="/premium" className="text-primary underline underline-offset-4">
                  voyez le détail de l'abonnement
                </Link>
                . Pour aller plus loin :{" "}
                <Link to="/blog/arbre-genealogique-en-ligne-photos-et-souvenirs" className="text-primary underline underline-offset-4">
                  l'arbre généalogique en option
                </Link>{" "}
                et{" "}
                <Link to="/blog/conserver-transmettre-souvenirs-de-famille" className="text-primary underline underline-offset-4">
                  conserver ses souvenirs de famille
                </Link>
                .
              </div>

            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PricingPage;
