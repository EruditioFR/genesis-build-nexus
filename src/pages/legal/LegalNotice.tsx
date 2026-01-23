import { useEffect } from "react";
import { ArrowLeft, Server, Shield, Globe, Building2, CreditCard, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
const LegalNotice = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const subprocessors = [
    {
      name: "Supabase (AWS)",
      purpose: "Base de données, authentification, stockage",
      location: "Union Européenne",
      guarantees: "RGPD, SOC 2 Type II",
    },
    {
      name: "Stripe",
      purpose: "Traitement des paiements",
      location: "UE / US",
      guarantees: "PCI DSS Level 1, CCT",
    },
    {
      name: "Resend",
      purpose: "Envoi d'emails transactionnels",
      location: "US",
      guarantees: "CCT, DPF",
    },
    {
      name: "Google Analytics",
      purpose: "Analyse de trafic (anonymisée)",
      location: "US",
      guarantees: "CCT, anonymisation IP",
    },
  ];
  return (
    <div className="min-h-screen bg-background">
      <Header forceSolid />
      <div className="container mx-auto px-4 py-8 max-w-4xl pt-24">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Link>
        </Button>

        <h1 className="text-3xl font-display font-bold text-foreground mb-8">Mentions Légales</h1>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              1. Éditeur du site
            </h2>
            <div className="text-muted-foreground leading-relaxed space-y-2">
              <p>JEAN-BAPTISTE BEJOT</p>

              <p>
                <strong>SIRET :</strong> 51089741600036
              </p>

              <p>
                <strong>Email :</strong> contact@familygarden.fr
              </p>
              <p>
                <strong>Téléphone :</strong> +33 6 66 69 24 41
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">2. Directeur de la publication</h2>
            <p className="text-muted-foreground leading-relaxed">Nom : JEAN-BAPTISTE BEJOT</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4 flex items-center gap-2">
              <Server className="w-5 h-5 text-primary" />
              3. Hébergement et infrastructure technique
            </h2>

            <div className="bg-muted/50 rounded-lg p-6 space-y-6">
              {/* Application Hosting */}
              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-secondary" />
                  Hébergeur de l'application
                </h3>
                <div className="text-muted-foreground space-y-1 ml-6">
                  <p>
                    <strong>Plateforme :</strong> Lovable
                  </p>
                  <p>
                    <strong>Infrastructure :</strong> Supabase sur Amazon Web Services (AWS)
                  </p>
                  <p>
                    <strong>Région de stockage :</strong> Union Européenne (eu-west-1 Irlande / eu-central-1 Francfort)
                  </p>
                  <p>
                    <strong>Site web :</strong>{" "}
                    <a
                      href="https://lovable.dev"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      https://lovable.dev
                    </a>
                  </p>
                </div>
              </div>

              {/* Database Hosting */}
              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Server className="w-4 h-4 text-secondary" />
                  Hébergeur de la base de données et du stockage
                </h3>
                <div className="text-muted-foreground space-y-1 ml-6">
                  <p>
                    <strong>Société :</strong> Supabase Inc.
                  </p>
                  <p>
                    <strong>Adresse :</strong> 970 Toa Payoh North #07-04, Singapore 318992
                  </p>
                  <p>
                    <strong>Infrastructure :</strong> Amazon Web Services (AWS)
                  </p>
                  <p>
                    <strong>Région :</strong> Union Européenne
                  </p>
                  <p>
                    <strong>Site web :</strong>{" "}
                    <a
                      href="https://supabase.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      https://supabase.com
                    </a>
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="secondary">SOC 2 Type II</Badge>
                    <Badge variant="secondary">HIPAA Compliant</Badge>
                    <Badge variant="secondary">RGPD Compliant</Badge>
                  </div>
                </div>
              </div>

              {/* AWS Infrastructure */}
              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-secondary" />
                  Infrastructure cloud
                </h3>
                <div className="text-muted-foreground space-y-1 ml-6">
                  <p>
                    <strong>Fournisseur :</strong> Amazon Web Services (AWS)
                  </p>
                  <p>
                    <strong>Région :</strong> Europe (Irlande eu-west-1, Francfort eu-central-1)
                  </p>
                  <p>
                    <strong>Site web :</strong>{" "}
                    <a
                      href="https://aws.amazon.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      https://aws.amazon.com
                    </a>
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="secondary">ISO 27001</Badge>
                    <Badge variant="secondary">SOC 1/2/3</Badge>
                    <Badge variant="secondary">PCI DSS Level 1</Badge>
                  </div>
                </div>
              </div>

              {/* Payment Hosting */}
              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-secondary" />
                  Prestataire de paiement
                </h3>
                <div className="text-muted-foreground space-y-1 ml-6">
                  <p>
                    <strong>Société :</strong> Stripe, Inc.
                  </p>
                  <p>
                    <strong>Adresse :</strong> 354 Oyster Point Boulevard, South San Francisco, CA 94080, USA
                  </p>
                  <p>
                    <strong>Site web :</strong>{" "}
                    <a
                      href="https://stripe.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      https://stripe.com
                    </a>
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="secondary">PCI DSS Level 1</Badge>
                    <Badge variant="secondary">SOC 2</Badge>
                  </div>
                </div>
              </div>

              {/* Email Provider */}
              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-secondary" />
                  Prestataire d'envoi d'emails
                </h3>
                <div className="text-muted-foreground space-y-1 ml-6">
                  <p>
                    <strong>Société :</strong> Resend Inc.
                  </p>
                  <p>
                    <strong>Site web :</strong>{" "}
                    <a
                      href="https://resend.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      https://resend.com
                    </a>
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="secondary">CCT</Badge>
                    <Badge variant="secondary">Data Privacy Framework</Badge>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              4. Sous-traitants et transferts de données
            </h2>

            <p className="text-muted-foreground leading-relaxed mb-4">
              Conformément à l'article 28 du RGPD, nous faisons appel aux sous-traitants suivants pour le traitement de
              vos données :
            </p>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-border rounded-lg">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-border px-4 py-3 text-left text-foreground font-semibold">
                      Sous-traitant
                    </th>
                    <th className="border border-border px-4 py-3 text-left text-foreground font-semibold">Finalité</th>
                    <th className="border border-border px-4 py-3 text-left text-foreground font-semibold">
                      Localisation
                    </th>
                    <th className="border border-border px-4 py-3 text-left text-foreground font-semibold">
                      Garanties
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {subprocessors.map((sp, index) => (
                    <tr key={index} className="hover:bg-muted/50">
                      <td className="border border-border px-4 py-3 text-muted-foreground font-medium">{sp.name}</td>
                      <td className="border border-border px-4 py-3 text-muted-foreground">{sp.purpose}</td>
                      <td className="border border-border px-4 py-3 text-muted-foreground">{sp.location}</td>
                      <td className="border border-border px-4 py-3 text-muted-foreground">{sp.guarantees}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mt-4">
              <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                Garanties pour les transferts hors UE
              </h4>
              <ul className="text-muted-foreground space-y-1 text-sm">
                <li>
                  • <strong>Clauses Contractuelles Types (CCT)</strong> approuvées par la Commission Européenne
                  (Décision 2021/914)
                </li>
                <li>
                  • <strong>Data Privacy Framework (DPF)</strong> pour les entreprises américaines certifiées
                </li>
                <li>
                  • <strong>Mesures supplémentaires</strong> : chiffrement de bout en bout, pseudonymisation des données
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">5. Propriété intellectuelle</h2>
            <p className="text-muted-foreground leading-relaxed">
              L'ensemble du contenu de ce site (hors contenus des utilisateurs : textes, images, vidéos, logos, icônes,
              sons, logiciels, etc.) est la propriété exclusive de Family Garden ou de ses partenaires. Toute
              reproduction, représentation, modification, publication, transmission, dénaturation, totale ou partielle
              du site ou de son contenu, par quelque procédé que ce soit, et sur quelque support que ce soit est
              interdite sans autorisation écrite préalable de Family Garden.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              6. Protection des données personnelles
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et
              Libertés, vous disposez d'un droit d'accès, de rectification, d'effacement et de portabilité de vos
              données personnelles.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Pour plus d'informations sur le traitement de vos données, consultez notre{" "}
              <Link to="/privacy" className="text-primary hover:underline">
                Politique de Confidentialité
              </Link>
              .
            </p>
            <div className="bg-muted/50 rounded-lg p-4 mt-4">
              <p className="font-semibold text-foreground mb-2">Délégué à la Protection des Données (DPO)</p>
              <p className="text-muted-foreground">
                Email :{" "}
                <a href="mailto:dpo@familygarden.fr" className="text-primary hover:underline">
                  dpo@familygarden.fr
                </a>
              </p>
              <p className="text-muted-foreground mt-2">
                <strong>Autorité de contrôle :</strong> CNIL - Commission Nationale de l'Informatique et des Libertés
              </p>
              <p className="text-muted-foreground">
                Site web :{" "}
                <a
                  href="https://www.cnil.fr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  www.cnil.fr
                </a>
              </p>
              <p className="text-muted-foreground">Adresse : 3 Place de Fontenoy, TSA 80715, 75334 Paris Cedex 07</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">7. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              Ce site utilise des cookies pour améliorer l'expérience utilisateur et analyser le trafic. Les cookies
              essentiels sont nécessaires au fonctionnement du site. Les cookies analytiques nous aident à comprendre
              comment les visiteurs interagissent avec le site.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Vous pouvez gérer vos préférences de cookies dans les paramètres de votre navigateur.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">8. Liens hypertextes</h2>
            <p className="text-muted-foreground leading-relaxed">
              Ce site peut contenir des liens vers d'autres sites web. Family Garden n'est pas responsable du contenu de
              ces sites externes et ne peut être tenu responsable des dommages résultant de leur utilisation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">9. Droit applicable</h2>
            <p className="text-muted-foreground leading-relaxed">
              Les présentes mentions légales sont régies par le droit français. En cas de litige, et après échec de
              toute tentative de recherche d'une solution amiable, les tribunaux français seront seuls compétents.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">10. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              Pour toute question concernant ces mentions légales, vous pouvez nous contacter à :
              <a href="mailto:contact@familygarden.fr" className="text-primary hover:underline ml-1">
                contact@familygarden.fr
              </a>
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};
export default LegalNotice;
