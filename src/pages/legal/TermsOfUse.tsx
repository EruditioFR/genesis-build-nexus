import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const TermsOfUse = () => {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Button asChild variant="ghost" className="mb-8">
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Link>
        </Button>

        <h1 className="text-4xl font-bold text-foreground mb-8">
          Conditions Générales d'Utilisation
        </h1>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-muted-foreground mb-8">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Objet</h2>
            <p className="text-muted-foreground">
              Les présentes Conditions Générales d'Utilisation (CGU) ont pour objet de définir les modalités 
              et conditions d'utilisation des services proposés par MemoriaVita, ainsi que de définir les 
              droits et obligations des parties dans ce cadre.
            </p>
            <p className="text-muted-foreground mt-4">
              MemoriaVita est une plateforme de création et de conservation de capsules temporelles numériques 
              permettant aux utilisateurs de préserver et partager leurs souvenirs, messages et contenus 
              multimédias avec leurs proches.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Acceptation des conditions</h2>
            <p className="text-muted-foreground">
              L'accès et l'utilisation de la plateforme MemoriaVita sont subordonnés à l'acceptation et au 
              respect des présentes CGU. En créant un compte ou en utilisant nos services, vous acceptez 
              sans réserve l'intégralité des présentes conditions.
            </p>
            <p className="text-muted-foreground mt-4">
              Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser nos services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Inscription et compte utilisateur</h2>
            <p className="text-muted-foreground">
              Pour accéder à certaines fonctionnalités de la plateforme, vous devez créer un compte utilisateur. 
              Lors de l'inscription, vous vous engagez à :
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
              <li>Fournir des informations exactes, complètes et à jour</li>
              <li>Maintenir la confidentialité de vos identifiants de connexion</li>
              <li>Notifier immédiatement MemoriaVita en cas d'utilisation non autorisée de votre compte</li>
              <li>Être âgé d'au moins 16 ans ou disposer de l'autorisation d'un représentant légal</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Vous êtes responsable de toutes les activités effectuées sous votre compte.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Utilisation du service</h2>
            <p className="text-muted-foreground">
              En utilisant MemoriaVita, vous vous engagez à :
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
              <li>Respecter les lois et réglementations en vigueur</li>
              <li>Ne pas utiliser le service à des fins illicites ou non autorisées</li>
              <li>Ne pas tenter de contourner les mesures de sécurité de la plateforme</li>
              <li>Ne pas utiliser de robots, scripts ou autres moyens automatisés sans autorisation</li>
              <li>Respecter les droits des autres utilisateurs</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Usages interdits</h3>
            <p className="text-muted-foreground">
              Il est strictement interdit de :
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
              <li>Publier du contenu illégal, diffamatoire, obscène ou offensant</li>
              <li>Harceler, menacer ou porter atteinte à d'autres utilisateurs</li>
              <li>Usurper l'identité d'une personne ou entité</li>
              <li>Diffuser des virus ou codes malveillants</li>
              <li>Collecter des données personnelles d'autres utilisateurs sans leur consentement</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Contenu utilisateur</h2>
            <p className="text-muted-foreground">
              Vous conservez tous les droits de propriété intellectuelle sur le contenu que vous créez et 
              téléchargez sur MemoriaVita (textes, photos, vidéos, audio, etc.).
            </p>
            <p className="text-muted-foreground mt-4">
              En publiant du contenu sur la plateforme, vous accordez à MemoriaVita une licence non exclusive, 
              mondiale et gratuite pour héberger, stocker, reproduire et afficher ce contenu dans le cadre 
              du fonctionnement du service.
            </p>
            <p className="text-muted-foreground mt-4">
              Vous êtes seul responsable du contenu que vous publiez et garantissez que vous disposez de 
              tous les droits nécessaires pour le partager.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Propriété intellectuelle</h2>
            <p className="text-muted-foreground">
              La plateforme MemoriaVita, incluant son design, ses logos, ses textes, ses fonctionnalités et 
              son code source, est protégée par les droits de propriété intellectuelle.
            </p>
            <p className="text-muted-foreground mt-4">
              Toute reproduction, représentation, modification ou exploitation non autorisée de tout ou 
              partie de la plateforme est strictement interdite et constitue une contrefaçon sanctionnée 
              par le Code de la propriété intellectuelle.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Responsabilités</h2>
            <h3 className="text-xl font-semibold text-foreground mt-4 mb-3">Responsabilité de l'utilisateur</h3>
            <p className="text-muted-foreground">
              L'utilisateur est responsable de :
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
              <li>L'utilisation qu'il fait de la plateforme</li>
              <li>La véracité et la légalité des informations qu'il communique</li>
              <li>Le contenu qu'il publie et partage</li>
              <li>La préservation de la confidentialité de ses identifiants</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Responsabilité de MemoriaVita</h3>
            <p className="text-muted-foreground">
              MemoriaVita s'engage à mettre en œuvre tous les moyens nécessaires pour assurer la disponibilité 
              et la sécurité de la plateforme. Toutefois, MemoriaVita ne peut être tenu responsable :
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
              <li>Des interruptions temporaires du service pour maintenance ou mises à jour</li>
              <li>Des dommages indirects résultant de l'utilisation du service</li>
              <li>Du contenu publié par les utilisateurs</li>
              <li>Des pertes de données en cas de force majeure</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Modification des CGU</h2>
            <p className="text-muted-foreground">
              MemoriaVita se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs 
              seront informés de toute modification substantielle par email ou par notification sur la plateforme.
            </p>
            <p className="text-muted-foreground mt-4">
              La poursuite de l'utilisation du service après notification des modifications vaut acceptation 
              des nouvelles conditions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Résiliation</h2>
            <p className="text-muted-foreground">
              Vous pouvez à tout moment supprimer votre compte depuis les paramètres de votre profil. 
              La suppression du compte entraîne la suppression définitive de toutes vos données et 
              capsules, sauf dispositions contraires liées aux capsules héritage.
            </p>
            <p className="text-muted-foreground mt-4">
              MemoriaVita se réserve le droit de suspendre ou supprimer votre compte en cas de violation 
              des présentes CGU, sans préavis ni indemnité.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">10. Droit applicable et litiges</h2>
            <p className="text-muted-foreground">
              Les présentes CGU sont régies par le droit français. En cas de litige relatif à l'interprétation 
              ou l'exécution des présentes conditions, les parties s'efforceront de trouver une solution amiable.
            </p>
            <p className="text-muted-foreground mt-4">
              À défaut d'accord amiable, les tribunaux français seront seuls compétents pour connaître du litige.
            </p>
            <p className="text-muted-foreground mt-4">
              Conformément aux dispositions du Code de la consommation concernant le règlement amiable des litiges, 
              vous pouvez recourir au service de médiation proposé par MemoriaVita. Le médiateur peut être saisi 
              via notre page de contact.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">11. Contact</h2>
            <p className="text-muted-foreground">
              Pour toute question relative aux présentes Conditions Générales d'Utilisation, vous pouvez 
              nous contacter :
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
              <li>Par email : contact@memoriavita.com</li>
              <li>Via notre formulaire de contact sur la plateforme</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUse;
