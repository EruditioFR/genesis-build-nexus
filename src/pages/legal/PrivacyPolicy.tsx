import { useEffect } from "react";
import { ArrowLeft, Shield, Server, Lock, Globe, Database, Key, UserCheck, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

const PrivacyPolicy = () => {
  const { t, i18n } = useTranslation('legal');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const internationalTransfers = [
    { name: "Stripe", purpose: t('privacy.transfers.stripe'), guarantees: "CCT + Data Privacy Framework" },
    { name: "Resend", purpose: t('privacy.transfers.resend'), guarantees: "CCT" },
    { name: "Google Analytics", purpose: t('privacy.transfers.analytics'), guarantees: "CCT + Anonymisation IP" },
  ];

  const getLocale = () => {
    const localeMap: Record<string, string> = {
      fr: 'fr-FR',
      en: 'en-US',
      es: 'es-ES',
      ko: 'ko-KR',
      zh: 'zh-CN'
    };
    return localeMap[i18n.language] || 'fr-FR';
  };

  return (
    <div className="min-h-screen bg-background">
      <Header forceSolid />
      <div className="container mx-auto px-4 py-8 max-w-4xl pt-24">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.backToHome')}
          </Link>
        </Button>

        <h1 className="text-3xl font-display font-bold text-foreground mb-8">
          {t('privacy.title')}
        </h1>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground">
            {t('common.lastUpdated')} {new Date().toLocaleDateString(getLocale())}
          </p>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              {t('privacy.sections.intro.title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('privacy.sections.intro.content')}
            </p>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mt-4">
              <p className="text-sm text-muted-foreground">
                <strong>{t('privacy.sections.intro.controller')}:</strong> Family Garden SAS<br />
                <strong>Email :</strong> <a href="mailto:privacy@familygarden.fr" className="text-primary hover:underline">privacy@familygarden.fr</a>
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              {t('privacy.sections.dataCollected.title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t('privacy.sections.dataCollected.intro')}
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>{t('privacy.sections.dataCollected.identification.label')}:</strong> {t('privacy.sections.dataCollected.identification.content')}</li>
              <li><strong>{t('privacy.sections.dataCollected.profile.label')}:</strong> {t('privacy.sections.dataCollected.profile.content')}</li>
              <li><strong>{t('privacy.sections.dataCollected.userContent.label')}:</strong> {t('privacy.sections.dataCollected.userContent.content')}</li>
              <li><strong>{t('privacy.sections.dataCollected.technical.label')}:</strong> {t('privacy.sections.dataCollected.technical.content')}</li>
              <li><strong>{t('privacy.sections.dataCollected.payment.label')}:</strong> {t('privacy.sections.dataCollected.payment.content')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              {t('privacy.sections.dataUsage.title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t('privacy.sections.dataUsage.intro')}
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>{t('privacy.sections.dataUsage.purposes.provide')}</li>
              <li>{t('privacy.sections.dataUsage.purposes.manage')}</li>
              <li>{t('privacy.sections.dataUsage.purposes.payments')}</li>
              <li>{t('privacy.sections.dataUsage.purposes.notifications')}</li>
              <li>{t('privacy.sections.dataUsage.purposes.security')}</li>
              <li>{t('privacy.sections.dataUsage.purposes.support')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              {t('privacy.sections.legalBasis.title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('privacy.sections.legalBasis.intro')}
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
              <li><strong>{t('privacy.sections.legalBasis.contract')}:</strong> {t('privacy.sections.legalBasis.contractDesc')}</li>
              <li><strong>{t('privacy.sections.legalBasis.consent')}:</strong> {t('privacy.sections.legalBasis.consentDesc')}</li>
              <li><strong>{t('privacy.sections.legalBasis.legitimate')}:</strong> {t('privacy.sections.legalBasis.legitimateDesc')}</li>
              <li><strong>{t('privacy.sections.legalBasis.legal')}:</strong> {t('privacy.sections.legalBasis.legalDesc')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              {t('privacy.sections.retention.title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('privacy.sections.retention.content')}
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              {t('privacy.sections.retention.capsules')}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4 flex items-center gap-2">
              <Server className="w-5 h-5 text-primary" />
              {t('privacy.sections.hosting.title')}
            </h2>
            
            <div className="bg-muted/50 rounded-lg p-6 space-y-4">
              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-secondary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-foreground">{t('privacy.sections.hosting.location.title')}</h4>
                  <p className="text-muted-foreground text-sm mt-1">
                    {t('privacy.sections.hosting.location.content')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Database className="w-5 h-5 text-secondary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-foreground">{t('privacy.sections.hosting.infrastructure.title')}</h4>
                  <ul className="text-muted-foreground text-sm mt-1 space-y-1">
                    <li>• <strong>{t('privacy.sections.hosting.infrastructure.database')}:</strong> PostgreSQL (AWS EU)</li>
                    <li>• <strong>{t('privacy.sections.hosting.infrastructure.files')}:</strong> AWS S3 (EU)</li>
                    <li>• <strong>{t('privacy.sections.hosting.infrastructure.auth')}:</strong> Supabase Auth (EU)</li>
                    <li>• <strong>{t('privacy.sections.hosting.infrastructure.cdn')}:</strong> {t('privacy.sections.hosting.infrastructure.cdnDesc')}</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-secondary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-foreground">{t('privacy.sections.hosting.encryption.title')}</h4>
                  <ul className="text-muted-foreground text-sm mt-1 space-y-1">
                    <li>• <strong>{t('privacy.sections.hosting.encryption.atRest')}:</strong> AES-256</li>
                    <li>• <strong>{t('privacy.sections.hosting.encryption.inTransit')}:</strong> TLS 1.2 / TLS 1.3</li>
                    <li>• <strong>{t('privacy.sections.hosting.encryption.backups')}:</strong> {t('privacy.sections.hosting.encryption.backupsDesc')}</li>
                    <li>• <strong>{t('privacy.sections.hosting.encryption.replication')}:</strong> {t('privacy.sections.hosting.encryption.replicationDesc')}</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-primary" />
              {t('privacy.sections.rights.title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t('privacy.sections.rights.intro')}
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>{t('privacy.sections.rights.access')}:</strong> {t('privacy.sections.rights.accessDesc')}</li>
              <li><strong>{t('privacy.sections.rights.rectification')}:</strong> {t('privacy.sections.rights.rectificationDesc')}</li>
              <li><strong>{t('privacy.sections.rights.erasure')}:</strong> {t('privacy.sections.rights.erasureDesc')}</li>
              <li><strong>{t('privacy.sections.rights.restriction')}:</strong> {t('privacy.sections.rights.restrictionDesc')}</li>
              <li><strong>{t('privacy.sections.rights.portability')}:</strong> {t('privacy.sections.rights.portabilityDesc')}</li>
              <li><strong>{t('privacy.sections.rights.objection')}:</strong> {t('privacy.sections.rights.objectionDesc')}</li>
              <li><strong>{t('privacy.sections.rights.withdrawal')}:</strong> {t('privacy.sections.rights.withdrawalDesc')}</li>
            </ul>
            <div className="bg-muted/50 rounded-lg p-4 mt-4">
              <p className="text-muted-foreground">
                {t('privacy.sections.rights.exercise')} <a href="mailto:privacy@familygarden.fr" className="text-primary hover:underline">privacy@familygarden.fr</a>
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                {t('privacy.sections.rights.responseTime')}
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              {t('privacy.sections.security.title')}
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Key className="w-4 h-4 text-secondary" />
                  {t('privacy.sections.security.technical.title')}
                </h3>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>{t('privacy.sections.security.technical.aes')}</li>
                  <li>{t('privacy.sections.security.technical.tls')}</li>
                  <li>{t('privacy.sections.security.technical.twoFactor')}</li>
                  <li>{t('privacy.sections.security.technical.rls')}</li>
                  <li>{t('privacy.sections.security.technical.monitoring')}</li>
                  <li>{t('privacy.sections.security.technical.pentest')}</li>
                  <li>{t('privacy.sections.security.technical.waf')}</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-3">{t('privacy.sections.security.organizational.title')}</h3>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>{t('privacy.sections.security.organizational.access')}</li>
                  <li>{t('privacy.sections.security.organizational.training')}</li>
                  <li>{t('privacy.sections.security.organizational.procedures')}</li>
                  <li>{t('privacy.sections.security.organizational.audits')}</li>
                  <li>{t('privacy.sections.security.organizational.vulnerabilities')}</li>
                </ul>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-3">{t('privacy.sections.security.certifications.title')}</h4>
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
              {t('privacy.sections.transfers.title')}
            </h2>
            
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t('privacy.sections.transfers.intro')}
            </p>

            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2">{t('privacy.sections.transfers.guarantees.title')}</h4>
                <ul className="text-muted-foreground space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong>{t('privacy.sections.transfers.guarantees.scc')}</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong>{t('privacy.sections.transfers.guarantees.dpf')}</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong>{t('privacy.sections.transfers.guarantees.additional')}</strong></span>
                  </li>
                </ul>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-border rounded-lg">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border border-border px-4 py-3 text-left text-foreground font-semibold">{t('privacy.sections.transfers.table.processor')}</th>
                      <th className="border border-border px-4 py-3 text-left text-foreground font-semibold">{t('privacy.sections.transfers.table.purpose')}</th>
                      <th className="border border-border px-4 py-3 text-left text-foreground font-semibold">{t('privacy.sections.transfers.table.guarantees')}</th>
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
                {t('privacy.sections.transfers.request')}{" "}
                <a href="mailto:privacy@familygarden.fr" className="text-primary hover:underline">privacy@familygarden.fr</a>
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              {t('privacy.sections.cookies.title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('privacy.sections.cookies.intro')}
            </p>
            <div className="bg-muted/50 rounded-lg p-4 mt-4">
              <h4 className="font-semibold text-foreground mb-2">{t('privacy.sections.cookies.types.title')}</h4>
              <ul className="text-muted-foreground space-y-2 text-sm">
                <li><strong>{t('privacy.sections.cookies.types.essential')}:</strong> {t('privacy.sections.cookies.types.essentialDesc')}</li>
                <li><strong>{t('privacy.sections.cookies.types.analytics')}:</strong> {t('privacy.sections.cookies.types.analyticsDesc')}</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              {t('privacy.sections.modifications.title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('privacy.sections.modifications.content')}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              {t('privacy.sections.contact.title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('privacy.sections.contact.content')}{" "}
              <a href="mailto:privacy@familygarden.fr" className="text-primary hover:underline">privacy@familygarden.fr</a>
            </p>
            <div className="bg-muted/50 rounded-lg p-4 mt-4">
              <p className="font-semibold text-foreground mb-2">{t('privacy.sections.contact.authority')}</p>
              <p className="text-muted-foreground text-sm">
                {t('privacy.sections.contact.authorityDesc')}
              </p>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
