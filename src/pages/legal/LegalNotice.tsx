import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

const LegalNotice = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl pt-24">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Link>
        </Button>

        <h1 className="text-3xl font-display font-bold text-foreground mb-8">
          Mentions Légales
        </h1>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">1. Éditeur du site</h2>
            <div className="text-muted-foreground leading-relaxed space-y-2">
              <p><strong>Nom de la société :</strong> MemoriaVita SAS</p>
              <p><strong>Forme juridique :</strong> Société par Actions Simplifiée</p>
              <p><strong>Capital social :</strong> [À compléter] €</p>
              <p><strong>Siège social :</strong> [Adresse à compléter]</p>
              <p><strong>RCS :</strong> [Numéro RCS à compléter]</p>
              <p><strong>SIRET :</strong> [Numéro SIRET à compléter]</p>
              <p><strong>Numéro de TVA intracommunautaire :</strong> [À compléter]</p>
              <p><strong>Email :</strong> contact@memoriavita.com</p>
              <p><strong>Téléphone :</strong> [À compléter]</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">2. Directeur de la publication</h2>
            <p className="text-muted-foreground leading-relaxed">
              <strong>Nom :</strong> [Nom du directeur de publication à compléter]
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">3. Hébergement</h2>
            <div className="text-muted-foreground leading-relaxed space-y-2">
              <p><strong>Hébergeur :</strong> Lovable / Supabase</p>
              <p><strong>Adresse :</strong> Services cloud hébergés dans l'Union Européenne</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">4. Propriété intellectuelle</h2>
            <p className="text-muted-foreground leading-relaxed">
              L'ensemble du contenu de ce site (textes, images, vidéos, logos, icônes, sons, logiciels, 
              etc.) est la propriété exclusive de MemoriaVita ou de ses partenaires. Toute reproduction, 
              représentation, modification, publication, transmission, dénaturation, totale ou partielle 
              du site ou de son contenu, par quelque procédé que ce soit, et sur quelque support que ce 
              soit est interdite sans autorisation écrite préalable de MemoriaVita.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">5. Protection des données personnelles</h2>
            <p className="text-muted-foreground leading-relaxed">
              Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi 
              Informatique et Libertés, vous disposez d'un droit d'accès, de rectification, d'effacement 
              et de portabilité de vos données personnelles.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Pour plus d'informations sur le traitement de vos données, consultez notre{" "}
              <Link to="/privacy" className="text-primary hover:underline">
                Politique de Confidentialité
              </Link>.
            </p>
            <div className="text-muted-foreground leading-relaxed mt-4 space-y-2">
              <p><strong>Délégué à la Protection des Données (DPO) :</strong></p>
              <p>Email : dpo@memoriavita.com</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">6. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              Ce site utilise des cookies pour améliorer l'expérience utilisateur et analyser le trafic. 
              Les cookies essentiels sont nécessaires au fonctionnement du site. Les cookies analytiques 
              nous aident à comprendre comment les visiteurs interagissent avec le site.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Vous pouvez gérer vos préférences de cookies dans les paramètres de votre navigateur.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">7. Liens hypertextes</h2>
            <p className="text-muted-foreground leading-relaxed">
              Ce site peut contenir des liens vers d'autres sites web. MemoriaVita n'est pas responsable 
              du contenu de ces sites externes et ne peut être tenu responsable des dommages résultant 
              de leur utilisation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">8. Droit applicable</h2>
            <p className="text-muted-foreground leading-relaxed">
              Les présentes mentions légales sont régies par le droit français. En cas de litige, 
              et après échec de toute tentative de recherche d'une solution amiable, les tribunaux 
              français seront seuls compétents.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">9. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              Pour toute question concernant ces mentions légales, vous pouvez nous contacter à : 
              contact@memoriavita.com
            </p>
          </section>

          <section className="mt-12 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground italic">
              Note : Certaines informations de cette page doivent être complétées avec les données 
              légales réelles de votre entreprise avant la mise en production du site.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LegalNotice;
