import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

const TermsOfSale = () => {
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
          Conditions Générales de Vente
        </h1>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">1. Objet</h2>
            <p className="text-muted-foreground leading-relaxed">
              Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles 
              entre Family Garden et ses utilisateurs pour la souscription aux services payants proposés
              sur la plateforme.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">2. Services proposés</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Family Garden propose les abonnements suivants :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Gratuit :</strong> Accès limité aux fonctionnalités de base</li>
              <li><strong>Premium :</strong> Accès complet aux fonctionnalités avancées, stockage étendu</li>
              <li><strong>Héritage :</strong> Fonctionnalités Premium + options de transmission posthume</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">3. Prix et paiement</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Les prix sont indiqués en euros TTC. Le paiement s'effectue par carte bancaire via 
              notre prestataire sécurisé Stripe. Les abonnements sont facturés mensuellement ou 
              annuellement selon l'option choisie.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Les prix peuvent être modifiés à tout moment. En cas de modification, le nouveau prix 
              s'appliquera à la prochaine période de facturation, après notification préalable de 30 jours.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">4. Durée et renouvellement</h2>
            <p className="text-muted-foreground leading-relaxed">
              L'abonnement est souscrit pour une durée d'un mois ou d'un an selon l'option choisie. 
              Il est renouvelé automatiquement à chaque échéance, sauf résiliation par l'utilisateur 
              avant la date de renouvellement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">5. Droit de rétractation</h2>
            <p className="text-muted-foreground leading-relaxed">
              Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation 
              ne s'applique pas aux contrats de fourniture d'un contenu numérique non fourni sur un 
              support matériel dont l'exécution a commencé avec l'accord du consommateur.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Toutefois, nous offrons une garantie "satisfait ou remboursé" de 14 jours pour tout 
              nouvel abonnement Premium ou Héritage.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">6. Résiliation</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              L'utilisateur peut résilier son abonnement à tout moment depuis son espace personnel 
              ou via le portail de gestion d'abonnement. La résiliation prend effet à la fin de la 
              période de facturation en cours.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              En cas de résiliation, l'utilisateur conserve l'accès aux fonctionnalités payantes 
              jusqu'à la fin de la période déjà payée.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">7. Responsabilité</h2>
            <p className="text-muted-foreground leading-relaxed">
              Family Garden s'engage à fournir les services avec diligence. Nous ne pouvons être tenus 
              responsables des interruptions de service indépendantes de notre volonté, ni des dommages
              indirects liés à l'utilisation de nos services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">8. Protection des données</h2>
            <p className="text-muted-foreground leading-relaxed">
              Le traitement de vos données personnelles est régi par notre Politique de Confidentialité, 
              accessible depuis notre site. Nous nous engageons à protéger vos données conformément au RGPD.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">9. Modification des CGV</h2>
            <p className="text-muted-foreground leading-relaxed">
              Nous nous réservons le droit de modifier ces CGV. Les modifications seront notifiées 
              aux utilisateurs par email au moins 30 jours avant leur entrée en vigueur.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">10. Droit applicable et litiges</h2>
            <p className="text-muted-foreground leading-relaxed">
              Les présentes CGV sont soumises au droit français. En cas de litige, une solution 
              amiable sera recherchée avant toute action judiciaire. À défaut, les tribunaux 
              français seront seuls compétents.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">11. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              Pour toute question relative aux CGV, contactez-nous à : contact@familygarden.com
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TermsOfSale;
