import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

const TermsOfUse = () => {
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
          Conditions Générales d'Utilisation
        </h1>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">1. Présentation du service</h2>
            <p className="text-muted-foreground leading-relaxed">
              Family Garden est une plateforme de préservation de souvenirs familiaux permettant aux 
              utilisateurs de créer, stocker et partager des capsules mémorielles numériques. Ces capsules 
              peuvent contenir des textes, photos, vidéos, enregistrements audio et autres contenus 
              multimédias destinés à être préservés et transmis aux générations futures.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">2. Acceptation des conditions</h2>
            <p className="text-muted-foreground leading-relaxed">
              L'utilisation de Family Garden implique l'acceptation pleine et entière des présentes 
              Conditions Générales d'Utilisation (CGU). Si vous n'acceptez pas ces conditions, veuillez 
              ne pas utiliser notre service. Nous nous réservons le droit de modifier ces CGU à tout moment. 
              Les modifications prendront effet dès leur publication sur le site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">3. Inscription et compte utilisateur</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Pour accéder aux fonctionnalités de Family Garden, vous devez créer un compte utilisateur 
              en fournissant des informations exactes et complètes. Vous êtes responsable de :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>La confidentialité de vos identifiants de connexion</li>
              <li>Toutes les activités effectuées sous votre compte</li>
              <li>La mise à jour de vos informations personnelles</li>
              <li>La notification immédiate en cas d'utilisation non autorisée de votre compte</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Vous devez être âgé d'au moins 16 ans pour créer un compte. Les mineurs de moins de 16 ans 
              doivent obtenir le consentement parental.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">4. Utilisation du service</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Vous vous engagez à utiliser Family Garden de manière responsable et légale. Il est interdit de :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Publier des contenus illégaux, diffamatoires, obscènes ou portant atteinte aux droits d'autrui</li>
              <li>Usurper l'identité d'une autre personne</li>
              <li>Tenter d'accéder aux comptes d'autres utilisateurs</li>
              <li>Utiliser le service à des fins commerciales non autorisées</li>
              <li>Transmettre des virus ou codes malveillants</li>
              <li>Perturber le fonctionnement normal de la plateforme</li>
              <li>Collecter des données personnelles d'autres utilisateurs sans leur consentement</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">5. Contenus utilisateurs</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Vous conservez tous les droits de propriété intellectuelle sur les contenus que vous 
              publiez sur Family Garden. En téléchargeant du contenu, vous nous accordez une licence 
              non exclusive pour :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Stocker, afficher et transmettre vos contenus selon vos paramètres de partage</li>
              <li>Créer des copies de sauvegarde pour la préservation de vos données</li>
              <li>Adapter techniquement vos contenus pour différents appareils (redimensionnement, compression)</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Vous garantissez que vous disposez des droits nécessaires sur tous les contenus que vous 
              publiez et que ceux-ci ne violent pas les droits de tiers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">6. Capsules mémorielles et fonctionnalité Héritage</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Family Garden propose une fonctionnalité unique de transmission de capsules après le décès 
              de l'utilisateur. Cette fonctionnalité implique :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>La désignation de gardiens de confiance qui pourront débloquer vos capsules</li>
              <li>La définition de conditions de déverrouillage (date, événement, décès)</li>
              <li>La responsabilité de tenir à jour les informations de vos gardiens</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Family Garden ne peut garantir la transmission en cas de cessation du service. Nous vous 
              recommandons de conserver des copies de vos contenus les plus importants.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">7. Cercles de partage</h2>
            <p className="text-muted-foreground leading-relaxed">
              Les cercles vous permettent de partager vos capsules avec des groupes de personnes de 
              confiance. Vous êtes responsable de la gestion de vos cercles et des personnes que vous 
              y invitez. Les membres d'un cercle peuvent visualiser les capsules partagées selon les 
              permissions que vous définissez.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">8. Stockage et conservation</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Family Garden s'engage à préserver vos contenus avec le plus grand soin. Cependant :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>L'espace de stockage est limité selon votre type d'abonnement</li>
              <li>Nous effectuons des sauvegardes régulières mais ne garantissons pas une récupération 
                  à 100% en cas de sinistre majeur</li>
              <li>Les comptes inactifs depuis plus de 2 ans (gratuits) peuvent faire l'objet d'une 
                  suppression après notification</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">9. Propriété intellectuelle</h2>
            <p className="text-muted-foreground leading-relaxed">
              La plateforme Family Garden, incluant son design, logo, fonctionnalités et code source, 
              est protégée par les droits de propriété intellectuelle. Toute reproduction, modification 
              ou utilisation non autorisée est strictement interdite.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">10. Limitation de responsabilité</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Family Garden est fourni "tel quel". Nous ne pouvons être tenus responsables :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Des interruptions temporaires du service pour maintenance</li>
              <li>Des pertes de données causées par des circonstances exceptionnelles</li>
              <li>De l'utilisation que vous faites du service</li>
              <li>Des contenus publiés par d'autres utilisateurs</li>
              <li>Des dommages indirects liés à l'utilisation du service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">11. Suspension et résiliation</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Nous nous réservons le droit de suspendre ou résilier votre compte en cas de :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Violation des présentes CGU</li>
              <li>Activité frauduleuse ou illégale</li>
              <li>Non-paiement des abonnements (pour les comptes premium)</li>
              <li>Demande des autorités compétentes</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Vous pouvez à tout moment supprimer votre compte depuis votre espace personnel. 
              La suppression entraîne l'effacement définitif de vos données après un délai de 30 jours.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">12. Protection des données personnelles</h2>
            <p className="text-muted-foreground leading-relaxed">
              Le traitement de vos données personnelles est détaillé dans notre{" "}
              <Link to="/privacy" className="text-secondary hover:text-secondary/80">
                Politique de Confidentialité
              </Link>
              . Nous nous engageons à respecter le Règlement Général sur la Protection des Données (RGPD) 
              et à protéger vos informations personnelles.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">13. Modifications du service</h2>
            <p className="text-muted-foreground leading-relaxed">
              Family Garden peut être amené à modifier, suspendre ou interrompre tout ou partie du 
              service, de manière temporaire ou permanente. Nous nous efforcerons de vous prévenir 
              dans un délai raisonnable en cas de modifications majeures.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">14. Droit applicable et juridiction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Les présentes CGU sont régies par le droit français. Tout litige relatif à leur 
              interprétation ou exécution sera soumis aux tribunaux français compétents, après 
              tentative de résolution amiable.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">15. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              Pour toute question concernant ces Conditions Générales d'Utilisation, vous pouvez 
              nous contacter à : contact@familygarden.fr
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TermsOfUse;
