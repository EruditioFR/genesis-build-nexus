import { useEffect } from "react";
import { ArrowLeft, Server, Shield, Globe, Building2, CreditCard, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

const LegalNotice = () => {
  const { t } = useTranslation('legal');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const subprocessors = [
    {
      name: "Supabase (AWS)",
      purpose: t('notice.sections.subprocessors.supabase'),
      location: t('notice.sections.subprocessors.locationEU'),
      guarantees: "RGPD, SOC 2 Type II",
    },
    {
      name: "Stripe",
      purpose: t('notice.sections.subprocessors.stripe'),
      location: "UE / US",
      guarantees: "PCI DSS Level 1, CCT",
    },
    {
      name: "Resend",
      purpose: t('notice.sections.subprocessors.resend'),
      location: "US",
      guarantees: "CCT, DPF",
    },
    {
      name: "Google Analytics",
      purpose: t('notice.sections.subprocessors.analytics'),
      location: "US",
      guarantees: "CCT, IP anonymization",
    },
  ];

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
          {t('notice.title')}
        </h1>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              {t('notice.sections.editor.title')}
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
                <strong>{t('notice.sections.editor.phone')}:</strong> +33 6 66 69 24 41
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              {t('notice.sections.director.title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('notice.sections.director.name')}: JEAN-BAPTISTE BEJOT
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4 flex items-center gap-2">
              <Server className="w-5 h-5 text-primary" />
              {t('notice.sections.hosting.title')}
            </h2>

            <div className="bg-muted/50 rounded-lg p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-secondary" />
                  {t('notice.sections.hosting.application.title')}
                </h3>
                <div className="text-muted-foreground space-y-1 ml-6">
                  <p>
                    <strong>{t('notice.sections.hosting.application.platform')}:</strong> Lovable
                  </p>
                  <p>
                    <strong>{t('notice.sections.hosting.application.infrastructure')}:</strong> Supabase on Amazon Web Services (AWS)
                  </p>
                  <p>
                    <strong>{t('notice.sections.hosting.application.region')}:</strong> {t('notice.sections.hosting.application.regionValue')}
                  </p>
                  <p>
                    <strong>{t('notice.sections.hosting.application.website')}:</strong>{" "}
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
                  {t('notice.sections.hosting.database.title')}
                </h3>
                <div className="text-muted-foreground space-y-1 ml-6">
                  <p>
                    <strong>{t('notice.sections.hosting.database.company')}:</strong> Supabase Inc.
                  </p>
                  <p>
                    <strong>{t('notice.sections.hosting.database.address')}:</strong> 970 Toa Payoh North #07-04, Singapore 318992
                  </p>
                  <p>
                    <strong>{t('notice.sections.hosting.database.infrastructure')}:</strong> Amazon Web Services (AWS)
                  </p>
                  <p>
                    <strong>{t('notice.sections.hosting.database.region')}:</strong> {t('notice.sections.subprocessors.locationEU')}
                  </p>
                  <p>
                    <strong>{t('notice.sections.hosting.application.website')}:</strong>{" "}
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
                  {t('notice.sections.hosting.cloud.title')}
                </h3>
                <div className="text-muted-foreground space-y-1 ml-6">
                  <p>
                    <strong>{t('notice.sections.hosting.cloud.provider')}:</strong> Amazon Web Services (AWS)
                  </p>
                  <p>
                    <strong>{t('notice.sections.hosting.cloud.region')}:</strong> Europe (Ireland eu-west-1, Frankfurt eu-central-1)
                  </p>
                  <p>
                    <strong>{t('notice.sections.hosting.application.website')}:</strong>{" "}
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
                  {t('notice.sections.hosting.payment.title')}
                </h3>
                <div className="text-muted-foreground space-y-1 ml-6">
                  <p>
                    <strong>{t('notice.sections.hosting.database.company')}:</strong> Stripe, Inc.
                  </p>
                  <p>
                    <strong>{t('notice.sections.hosting.database.address')}:</strong> 354 Oyster Point Boulevard, South San Francisco, CA 94080, USA
                  </p>
                  <p>
                    <strong>{t('notice.sections.hosting.application.website')}:</strong>{" "}
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
                  {t('notice.sections.hosting.email.title')}
                </h3>
                <div className="text-muted-foreground space-y-1 ml-6">
                  <p>
                    <strong>{t('notice.sections.hosting.database.company')}:</strong> Resend Inc.
                  </p>
                  <p>
                    <strong>{t('notice.sections.hosting.application.website')}:</strong>{" "}
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
              {t('notice.sections.subprocessors.title')}
            </h2>

            <p className="text-muted-foreground leading-relaxed mb-4">
              {t('notice.sections.subprocessors.intro')}
            </p>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-border rounded-lg">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-border px-4 py-3 text-left text-foreground font-semibold">
                      {t('notice.sections.subprocessors.table.processor')}
                    </th>
                    <th className="border border-border px-4 py-3 text-left text-foreground font-semibold">
                      {t('notice.sections.subprocessors.table.purpose')}
                    </th>
                    <th className="border border-border px-4 py-3 text-left text-foreground font-semibold">
                      {t('notice.sections.subprocessors.table.location')}
                    </th>
                    <th className="border border-border px-4 py-3 text-left text-foreground font-semibold">
                      {t('notice.sections.subprocessors.table.guarantees')}
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
                {t('notice.sections.subprocessors.guarantees.title')}
              </h4>
              <ul className="text-muted-foreground space-y-1 text-sm">
                <li>• <strong>{t('notice.sections.subprocessors.guarantees.scc')}</strong></li>
                <li>• <strong>{t('notice.sections.subprocessors.guarantees.dpf')}</strong></li>
                <li>• <strong>{t('notice.sections.subprocessors.guarantees.additional')}</strong></li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              {t('notice.sections.intellectualProperty.title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('notice.sections.intellectualProperty.content')}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              {t('notice.sections.dataProtection.title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('notice.sections.dataProtection.content')}
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              {t('notice.sections.dataProtection.moreInfo')}{" "}
              <Link to="/privacy" className="text-primary hover:underline">
                {t('notice.sections.dataProtection.link')}
              </Link>.
            </p>
            <div className="bg-muted/50 rounded-lg p-4 mt-4">
              <p className="font-semibold text-foreground mb-2">{t('notice.sections.dataProtection.dpo')}</p>
              <p className="text-muted-foreground">
                Email :{" "}
                <a href="mailto:dpo@familygarden.fr" className="text-primary hover:underline">
                  dpo@familygarden.fr
                </a>
              </p>
              <p className="text-muted-foreground mt-2">
                <strong>{t('notice.sections.dataProtection.authority')}:</strong> CNIL - Commission Nationale de l'Informatique et des Libertés
              </p>
              <p className="text-muted-foreground">
                {t('notice.sections.hosting.application.website')}:{" "}
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
                {t('notice.sections.hosting.database.address')}: 3 Place de Fontenoy, TSA 80715, 75334 Paris Cedex 07
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              {t('notice.sections.cookies.title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('notice.sections.cookies.content')}
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              {t('notice.sections.cookies.management')}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              {t('notice.sections.links.title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('notice.sections.links.content')}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              {t('notice.sections.jurisdiction.title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('notice.sections.jurisdiction.content')}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              {t('notice.sections.contact.title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('notice.sections.contact.content')}
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
