import { useEffect } from "react";
import { ArrowLeft, Server, Shield, Globe, Building2, CreditCard, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import SEOHead from "@/components/seo/SEOHead";
import { createBreadcrumbSchema } from "@/lib/seoSchemas";

const LegalNotice = () => {
  const { t } = useTranslation('legal');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const subprocessors = [
    {
      name: "Supabase (AWS)",
      purpose: t('privacy.sections.transfers.stripe'),
      location: t('legalNotice.sections.hosting.dbHost.regionValue'),
      guarantees: "RGPD, SOC 2 Type II",
    },
    {
      name: "Stripe",
      purpose: t('privacy.sections.transfers.stripe'),
      location: "UE / US",
      guarantees: "PCI DSS Level 1, CCT",
    },
    {
      name: "Resend",
      purpose: t('privacy.sections.transfers.resend'),
      location: "US",
      guarantees: "CCT, DPF",
    },
    {
      name: "Google Analytics",
      purpose: t('privacy.sections.transfers.analytics'),
      location: "US",
      guarantees: "CCT, IP anonymization",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Mentions légales | Family Garden"
        description="Mentions légales de Family Garden : éditeur, hébergement, sous-traitants, protection des données et informations de contact."
        jsonLd={createBreadcrumbSchema([
          { name: "Accueil", url: "/" },
          { name: "Mentions légales", url: "/mentions-legales" },
        ])}
      />
      <Header forceSolid />
      <div className="container mx-auto px-4 py-8 max-w-4xl pt-24">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.backToHome')}
          </Link>
        </Button>

        <h1 className="text-3xl font-display font-bold text-foreground mb-8">
          {t('legalNotice.title')}
        </h1>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              {t('legalNotice.sections.editor.title')}
            </h2>
            <div className="text-muted-foreground leading-relaxed space-y-2">
              <p>JEAN-BAPTISTE BEJOT</p>
              <p>
                <strong>{t('legalNotice.sections.editor.siret')}</strong> 51089741600036
              </p>
              <p>
                <strong>{t('legalNotice.sections.editor.email')}</strong> contact@familygarden.fr
              </p>
              <p>
                <strong>{t('legalNotice.sections.editor.phone')}</strong> +33 6 66 69 24 41
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              {t('legalNotice.sections.director.title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('legalNotice.sections.director.name')} JEAN-BAPTISTE BEJOT
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4 flex items-center gap-2">
              <Server className="w-5 h-5 text-primary" />
              {t('legalNotice.sections.hosting.title')}
            </h2>

            <div className="bg-muted/50 rounded-lg p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-secondary" />
                  {t('legalNotice.sections.hosting.appHost.title')}
                </h3>
                <div className="text-muted-foreground space-y-1 ml-6">
                  <p>
                    <strong>{t('legalNotice.sections.hosting.appHost.platform')}</strong> Lovable
                  </p>
                  <p>
                    <strong>{t('legalNotice.sections.hosting.appHost.infrastructure')}</strong> Supabase on Amazon Web Services (AWS)
                  </p>
                  <p>
                    <strong>{t('legalNotice.sections.hosting.appHost.region')}</strong> {t('legalNotice.sections.hosting.appHost.regionValue')}
                  </p>
                  <p>
                    <strong>{t('legalNotice.sections.hosting.appHost.website')}</strong>{" "}
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

              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Server className="w-4 h-4 text-secondary" />
                  {t('legalNotice.sections.hosting.dbHost.title')}
                </h3>
                <div className="text-muted-foreground space-y-1 ml-6">
                  <p>
                    <strong>{t('legalNotice.sections.hosting.dbHost.company')}</strong> Supabase Inc.
                  </p>
                  <p>
                    <strong>{t('legalNotice.sections.hosting.dbHost.address')}</strong> 970 Toa Payoh North #07-04, Singapore 318992
                  </p>
                  <p>
                    <strong>{t('legalNotice.sections.hosting.dbHost.infrastructure')}</strong> Amazon Web Services (AWS)
                  </p>
                  <p>
                    <strong>{t('legalNotice.sections.hosting.dbHost.region')}</strong> {t('legalNotice.sections.hosting.dbHost.regionValue')}
                  </p>
                  <p>
                    <strong>{t('legalNotice.sections.hosting.dbHost.website')}</strong>{" "}
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
                    <Badge variant="secondary">GDPR Compliant</Badge>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-secondary" />
                  {t('legalNotice.sections.hosting.cloudInfra.title')}
                </h3>
                <div className="text-muted-foreground space-y-1 ml-6">
                  <p>
                    <strong>{t('legalNotice.sections.hosting.cloudInfra.provider')}</strong> Amazon Web Services (AWS)
                  </p>
                  <p>
                    <strong>{t('legalNotice.sections.hosting.cloudInfra.region')}</strong> {t('legalNotice.sections.hosting.cloudInfra.regionValue')}
                  </p>
                  <p>
                    <strong>{t('legalNotice.sections.hosting.cloudInfra.website')}</strong>{" "}
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

              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-secondary" />
                  {t('legalNotice.sections.hosting.payment.title')}
                </h3>
                <div className="text-muted-foreground space-y-1 ml-6">
                  <p>
                    <strong>{t('legalNotice.sections.hosting.payment.company')}</strong> Stripe, Inc.
                  </p>
                  <p>
                    <strong>{t('legalNotice.sections.hosting.payment.address')}</strong> 354 Oyster Point Boulevard, South San Francisco, CA 94080, USA
                  </p>
                  <p>
                    <strong>{t('legalNotice.sections.hosting.payment.website')}</strong>{" "}
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

              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-secondary" />
                  {t('legalNotice.sections.hosting.email.title')}
                </h3>
                <div className="text-muted-foreground space-y-1 ml-6">
                  <p>
                    <strong>{t('legalNotice.sections.hosting.email.company')}</strong> Resend Inc.
                  </p>
                  <p>
                    <strong>{t('legalNotice.sections.hosting.email.website')}</strong>{" "}
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
              {t('legalNotice.sections.subprocessors.title')}
            </h2>

            <p className="text-muted-foreground leading-relaxed mb-4">
              {t('legalNotice.sections.subprocessors.intro')}
            </p>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-border rounded-lg">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-border px-4 py-3 text-left text-foreground font-semibold">
                      {t('legalNotice.sections.subprocessors.table.subprocessor')}
                    </th>
                    <th className="border border-border px-4 py-3 text-left text-foreground font-semibold">
                      {t('legalNotice.sections.subprocessors.table.purpose')}
                    </th>
                    <th className="border border-border px-4 py-3 text-left text-foreground font-semibold">
                      {t('legalNotice.sections.subprocessors.table.location')}
                    </th>
                    <th className="border border-border px-4 py-3 text-left text-foreground font-semibold">
                      {t('legalNotice.sections.subprocessors.table.guarantees')}
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
                {t('legalNotice.sections.subprocessors.guaranteesTitle')}
              </h4>
              <ul className="text-muted-foreground space-y-1 text-sm">
                <li>• <strong>{t('legalNotice.sections.subprocessors.scc')}</strong></li>
                <li>• <strong>{t('legalNotice.sections.subprocessors.dpf')}</strong></li>
                <li>• <strong>{t('legalNotice.sections.subprocessors.additional')}</strong></li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              {t('legalNotice.sections.ip.title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('legalNotice.sections.ip.content')}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              {t('legalNotice.sections.dataProtection.title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('legalNotice.sections.dataProtection.intro')}
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              {t('legalNotice.sections.dataProtection.moreInfo')}{" "}
              <Link to="/privacy" className="text-primary hover:underline">
                {t('legalNotice.sections.dataProtection.privacyLink')}
              </Link>.
            </p>
            <div className="bg-muted/50 rounded-lg p-4 mt-4">
              <p className="font-semibold text-foreground mb-2">{t('legalNotice.sections.dataProtection.dpo')}</p>
              <p className="text-muted-foreground">
                {t('legalNotice.sections.dataProtection.email')}{" "}
                <a href="mailto:contact@familygarden.fr" className="text-primary hover:underline">
                  contact@familygarden.fr
                </a>
              </p>
              <p className="text-muted-foreground mt-2">
                <strong>{t('legalNotice.sections.dataProtection.authority')}</strong> {t('legalNotice.sections.dataProtection.cnil')}
              </p>
              <p className="text-muted-foreground">
                {t('legalNotice.sections.dataProtection.website')}{" "}
                <a
                  href="https://www.cnil.fr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  www.cnil.fr
                </a>
              </p>
              <p className="text-muted-foreground">
                {t('legalNotice.sections.dataProtection.address')} 3 Place de Fontenoy, TSA 80715, 75334 Paris Cedex 07
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              {t('legalNotice.sections.cookies.title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('legalNotice.sections.cookies.content')}
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              {t('legalNotice.sections.cookies.manage')}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              {t('legalNotice.sections.links.title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('legalNotice.sections.links.content')}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              {t('legalNotice.sections.law.title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('legalNotice.sections.law.content')}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              {t('legalNotice.sections.contact.title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('legalNotice.sections.contact.content')}
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
