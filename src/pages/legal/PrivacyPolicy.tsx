import { useEffect } from "react";
import { ArrowLeft, Shield, Server, Lock, Globe, Database, Key, UserCheck, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const internationalTransfers = [
    { name: "Stripe", purpose: "Paiements", guarantees: "CCT + Data Privacy Framework" },
    { name: "Resend", purpose: "Emails transactionnels", guarantees: "CCT" },
    { name: "Google Analytics", purpose: "Analyse de trafic", guarantees: "CCT + Anonymisation IP" },
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

        <h1 className="text-3xl font-display font-bold text-foreground mb-8">
          Politique de Confidentialité
        </h1>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              1. Introduction
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              MemoryVitae s'engage à protéger la vie privée de ses utilisateurs. Cette politique de confidentialité 
              explique comment nous collectons, utilisons, stockons et protégeons vos données personnelles 
              conformément au Règlement Général sur la Protection des Données (RGPD) du 27 avril 2016 et à la
              loi Informatique et Libertés du 6 janvier 1978 modifiée.
            </p>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mt-4">
              <p className="text-sm text-muted-foreground">
                <strong>Responsable du traitement :</strong> MemoryVitae SAS<br />
                <strong>Email :</strong> <a href="mailto:privacy@memoryvitae.com" className="text-primary hover:underline">privacy@memoryvitae.com</a>
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">2. Données collectées</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Nous collectons les types de données suivants :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Données d'identification :</strong> nom, prénom, adresse email</li>
              <li><strong>Données de profil :</strong> photo de profil, biographie, date de naissance</li>
              <li><strong>Contenu utilisateur :</strong> capsules temporelles, photos, vidéos, textes, arbres généalogiques</li>
              <li><strong>Données techniques :</strong> adresse IP, type de navigateur, données de connexion, logs d'accès</li>
              <li><strong>Données de paiement :</strong> traitées exclusivement par notre prestataire Stripe (nous ne stockons jamais vos données bancaires)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">3. Utilisation des données</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Vos données sont utilisées pour :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Fournir et améliorer nos services de capsules temporelles</li>
              <li>Gérer votre compte et vos abonnements</li>
              <li>Traiter vos paiements de manière sécurisée</li>
              <li>Vous envoyer des notifications relatives à vos capsules et à leur ouverture programmée</li>
              <li>Assurer la sécurité et la disponibilité de la plateforme</li>
              <li>Répondre à vos demandes d'assistance</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">4. Base légale du traitement</h2>
            <p className="text-muted-foreground leading-relaxed">
              Nous traitons vos données sur les bases légales suivantes :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
              <li><strong>Exécution du contrat (Art. 6.1.b RGPD) :</strong> pour fournir nos services de capsules temporelles</li>
              <li><strong>Consentement (Art. 6.1.a RGPD) :</strong> pour les communications marketing et les cookies analytiques</li>
              <li><strong>Intérêt légitime (Art. 6.1.f RGPD) :</strong> pour améliorer nos services et assurer la sécurité</li>
              <li><strong>Obligation légale (Art. 6.1.c RGPD) :</strong> pour les données de facturation et fiscales</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">5. Conservation des données</h2>
            <p className="text-muted-foreground leading-relaxed">
              Vos données sont conservées pendant toute la durée de votre compte actif. En cas de suppression 
              de compte, vos données personnelles seront supprimées dans un délai de 30 jours, sauf obligation légale 
              de conservation (données de facturation : 10 ans).
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Les capsules temporelles sont conservées selon les paramètres que vous avez définis, y compris 
              les capsules d'héritage numérique qui peuvent être transmises à vos gardiens désignés.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4 flex items-center gap-2">
              <Server className="w-5 h-5 text-primary" />
              6. Hébergement et localisation des données
            </h2>
            
            <div className="bg-muted/50 rounded-lg p-6 space-y-4">
              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-secondary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-foreground">Localisation des données</h4>
                  <p className="text-muted-foreground text-sm mt-1">
                    Vos données personnelles sont stockées sur des serveurs situés dans l'<strong>Union Européenne</strong> 
                    (régions AWS eu-west-1 Irlande et eu-central-1 Francfort), garantissant une protection 
                    conforme au RGPD sans transfert vers des pays tiers.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Database className="w-5 h-5 text-secondary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-foreground">Infrastructure technique</h4>
                  <ul className="text-muted-foreground text-sm mt-1 space-y-1">
                    <li>• <strong>Base de données :</strong> PostgreSQL hébergée sur AWS (région UE)</li>
                    <li>• <strong>Fichiers et médias :</strong> AWS S3 (région UE) avec chiffrement</li>
                    <li>• <strong>Authentification :</strong> Supabase Auth (région UE)</li>
                    <li>• <strong>CDN :</strong> Distribution de contenu depuis des serveurs européens</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-secondary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-foreground">Chiffrement et protection</h4>
                  <ul className="text-muted-foreground text-sm mt-1 space-y-1">
                    <li>• <strong>Chiffrement au repos :</strong> AES-256 pour toutes les données stockées</li>
                    <li>• <strong>Chiffrement en transit :</strong> TLS 1.2 / TLS 1.3 pour toutes les communications</li>
                    <li>• <strong>Sauvegardes :</strong> Quotidiennes, chiffrées, avec rétention de 30 jours</li>
                    <li>• <strong>Réplication :</strong> Données répliquées au sein de la région UE pour la haute disponibilité</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-primary" />
              7. Vos droits
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Conformément au RGPD (articles 15 à 22), vous disposez des droits suivants :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Droit d'accès (Art. 15) :</strong> obtenir une copie de vos données personnelles</li>
              <li><strong>Droit de rectification (Art. 16) :</strong> corriger des données inexactes</li>
              <li><strong>Droit à l'effacement (Art. 17) :</strong> demander la suppression de vos données</li>
              <li><strong>Droit à la limitation (Art. 18) :</strong> restreindre le traitement de vos données</li>
              <li><strong>Droit à la portabilité (Art. 20) :</strong> recevoir vos données dans un format structuré</li>
              <li><strong>Droit d'opposition (Art. 21) :</strong> vous opposer au traitement de vos données</li>
              <li><strong>Droit de retrait du consentement :</strong> retirer votre consentement à tout moment</li>
            </ul>
            <div className="bg-muted/50 rounded-lg p-4 mt-4">
              <p className="text-muted-foreground">
                Pour exercer ces droits, contactez-nous à : <a href="mailto:privacy@memoryvitae.com" className="text-primary hover:underline">privacy@memoryvitae.com</a>
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                Nous répondrons à votre demande dans un délai d'un mois conformément au RGPD.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              8. Sécurité des données
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Key className="w-4 h-4 text-secondary" />
                  Mesures techniques
                </h3>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>Chiffrement AES-256 pour toutes les données au repos</li>
                  <li>Protocole TLS 1.2+ pour toutes les communications réseau</li>
                  <li>Authentification à deux facteurs (2FA) disponible</li>
                  <li>Contrôle d'accès basé sur les rôles (Row Level Security - RLS)</li>
                  <li>Surveillance continue des accès et détection d'anomalies</li>
                  <li>Tests de pénétration réguliers par des experts indépendants</li>
                  <li>Pare-feu applicatif (WAF) et protection DDoS</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-3">Mesures organisationnelles</h3>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>Accès restreint aux données sur le principe du moindre privilège</li>
                  <li>Formation régulière du personnel à la protection des données</li>
                  <li>Procédures documentées de gestion des incidents de sécurité</li>
                  <li>Audits de sécurité annuels</li>
                  <li>Politique de gestion des vulnérabilités</li>
                </ul>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-3">Certifications de nos sous-traitants</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="font-medium text-foreground text-sm">Supabase</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <Badge variant="outline" className="text-xs">SOC 2 Type II</Badge>
                      <Badge variant="outline" className="text-xs">HIPAA</Badge>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">AWS</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <Badge variant="outline" className="text-xs">ISO 27001</Badge>
                      <Badge variant="outline" className="text-xs">SOC 1/2/3</Badge>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">Stripe</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <Badge variant="outline" className="text-xs">PCI DSS L1</Badge>
                      <Badge variant="outline" className="text-xs">SOC 2</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              9. Transferts internationaux de données
            </h2>
            
            <p className="text-muted-foreground leading-relaxed mb-4">
              Vos données sont principalement stockées dans l'Union Européenne. Cependant, certains de nos 
              sous-traitants sont situés aux États-Unis. Ces transferts sont encadrés par des garanties appropriées :
            </p>

            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2">Garanties juridiques</h4>
                <ul className="text-muted-foreground space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong>Clauses Contractuelles Types (CCT)</strong> approuvées par la Commission Européenne (Décision d'exécution 2021/914 du 4 juin 2021)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong>Data Privacy Framework (DPF)</strong> pour les entreprises américaines certifiées (Décision d'adéquation du 10 juillet 2023)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong>Mesures supplémentaires</strong> : chiffrement de bout en bout, pseudonymisation, évaluation d'impact des transferts</span>
                  </li>
                </ul>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-border rounded-lg">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border border-border px-4 py-3 text-left text-foreground font-semibold">Sous-traitant</th>
                      <th className="border border-border px-4 py-3 text-left text-foreground font-semibold">Finalité</th>
                      <th className="border border-border px-4 py-3 text-left text-foreground font-semibold">Garanties</th>
                    </tr>
                  </thead>
                  <tbody>
                    {internationalTransfers.map((transfer, index) => (
                      <tr key={index} className="hover:bg-muted/50">
                        <td className="border border-border px-4 py-3 text-muted-foreground font-medium">{transfer.name}</td>
                        <td className="border border-border px-4 py-3 text-muted-foreground">{transfer.purpose}</td>
                        <td className="border border-border px-4 py-3 text-muted-foreground">{transfer.guarantees}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-muted-foreground text-sm">
                Vous pouvez demander une copie des garanties appropriées en nous contactant à{" "}
                <a href="mailto:privacy@memoryvitae.com" className="text-primary hover:underline">privacy@memoryvitae.com</a>
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">10. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              Nous utilisons des cookies essentiels pour le fonctionnement du site et des cookies 
              analytiques (avec votre consentement) pour améliorer nos services.
            </p>
            <div className="bg-muted/50 rounded-lg p-4 mt-4">
              <h4 className="font-semibold text-foreground mb-2">Types de cookies utilisés</h4>
              <ul className="text-muted-foreground space-y-1 text-sm">
                <li>• <strong>Cookies essentiels :</strong> authentification, préférences de session (durée : session)</li>
                <li>• <strong>Cookies analytiques :</strong> Google Analytics avec anonymisation IP (durée : 13 mois)</li>
              </ul>
              <p className="text-muted-foreground text-sm mt-3">
                Vous pouvez gérer vos préférences de cookies dans les paramètres de votre navigateur ou via notre bannière de consentement.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">11. Délégué à la Protection des Données (DPO)</h2>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-foreground">Délégué à la Protection des Données</p>
                  <p className="text-muted-foreground">
                    Email : <a href="mailto:dpo@memoriavita.com" className="text-primary hover:underline">dpo@memoriavita.com</a>
                  </p>
                </div>
                <div className="border-t border-border pt-3">
                  <p className="font-semibold text-foreground">Autorité de contrôle</p>
                  <p className="text-muted-foreground text-sm">
                    Vous avez le droit d'introduire une réclamation auprès de la CNIL si vous estimez que 
                    le traitement de vos données ne respecte pas la réglementation :
                  </p>
                  <ul className="text-muted-foreground text-sm mt-2 space-y-1">
                    <li>• <strong>CNIL</strong> - Commission Nationale de l'Informatique et des Libertés</li>
                    <li>• Site web : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.cnil.fr</a></li>
                    <li>• Adresse : 3 Place de Fontenoy, TSA 80715, 75334 Paris Cedex 07</li>
                    <li>• Téléphone : 01 53 73 22 22</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">12. Modifications de cette politique</h2>
            <p className="text-muted-foreground leading-relaxed">
              Nous pouvons mettre à jour cette politique de confidentialité. En cas de modification substantielle, 
              nous vous en informerons par email ou par une notification sur notre site. Nous vous encourageons à 
              consulter régulièrement cette page.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">13. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              Pour toute question concernant cette politique ou vos données personnelles, contactez-nous :
            </p>
            <ul className="list-none pl-0 text-muted-foreground space-y-1 mt-4">
              <li>• Email général : <a href="mailto:contact@lalignedutemps.com" className="text-primary hover:underline">contact@lalignedutemps.com</a></li>
              <li>• Questions de confidentialité : <a href="mailto:privacy@lalignedutemps.com" className="text-primary hover:underline">privacy@lalignedutemps.com</a></li>
              <li>• Délégué à la Protection des Données : <a href="mailto:dpo@lalignedutemps.com" className="text-primary hover:underline">dpo@lalignedutemps.com</a></li>
            </ul>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
