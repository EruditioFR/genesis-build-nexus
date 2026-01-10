import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

        <h1 className="text-3xl font-display font-bold text-foreground mb-8">
          Politique de Confidentialité
        </h1>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              MemoriaVita s'engage à protéger la vie privée de ses utilisateurs. Cette politique de confidentialité 
              explique comment nous collectons, utilisons, stockons et protégeons vos données personnelles 
              conformément au Règlement Général sur la Protection des Données (RGPD).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">2. Données collectées</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Nous collectons les types de données suivants :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Données d'identification : nom, prénom, adresse email</li>
              <li>Données de profil : photo de profil, biographie, date de naissance</li>
              <li>Contenu utilisateur : capsules temporelles, photos, vidéos, textes</li>
              <li>Données techniques : adresse IP, type de navigateur, données de connexion</li>
              <li>Données de paiement : traitées par notre prestataire Stripe</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">3. Utilisation des données</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Vos données sont utilisées pour :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Fournir et améliorer nos services</li>
              <li>Gérer votre compte et vos capsules temporelles</li>
              <li>Traiter vos paiements et abonnements</li>
              <li>Vous envoyer des notifications relatives à vos capsules</li>
              <li>Assurer la sécurité de la plateforme</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">4. Base légale du traitement</h2>
            <p className="text-muted-foreground leading-relaxed">
              Nous traitons vos données sur les bases légales suivantes : l'exécution du contrat pour 
              fournir nos services, votre consentement pour les communications marketing, et notre 
              intérêt légitime pour améliorer nos services et assurer la sécurité.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">5. Conservation des données</h2>
            <p className="text-muted-foreground leading-relaxed">
              Vos données sont conservées pendant toute la durée de votre compte. En cas de suppression 
              de compte, vos données seront supprimées dans un délai de 30 jours, sauf obligation légale 
              de conservation. Les capsules temporelles sont conservées selon les paramètres que vous avez définis.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">6. Vos droits</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Conformément au RGPD, vous disposez des droits suivants :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Droit d'accès à vos données</li>
              <li>Droit de rectification</li>
              <li>Droit à l'effacement (droit à l'oubli)</li>
              <li>Droit à la portabilité des données</li>
              <li>Droit d'opposition au traitement</li>
              <li>Droit de retirer votre consentement</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Pour exercer ces droits, contactez-nous à : privacy@memoriavita.com
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">7. Sécurité</h2>
            <p className="text-muted-foreground leading-relaxed">
              Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées 
              pour protéger vos données : chiffrement des données, accès restreint, sauvegardes régulières, 
              et audits de sécurité.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">8. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              Nous utilisons des cookies essentiels pour le fonctionnement du site et des cookies 
              analytiques pour améliorer nos services. Vous pouvez gérer vos préférences de cookies 
              dans les paramètres de votre navigateur.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">9. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              Pour toute question concernant cette politique ou vos données personnelles, contactez 
              notre Délégué à la Protection des Données à : dpo@memoriavita.com
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
