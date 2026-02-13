import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import SEOHead from "@/components/seo/SEOHead";
import { createBreadcrumbSchema } from "@/lib/seoSchemas";

const TermsOfSale = () => {
  const { t, i18n } = useTranslation('legal');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
      <SEOHead
        title="Conditions Générales de Vente | Family Garden"
        description="Consultez les conditions générales de vente de Family Garden : abonnements, paiements, garanties et politique de remboursement."
        jsonLd={createBreadcrumbSchema([
          { name: "Accueil", url: "/" },
          { name: "CGV", url: "/cgv" },
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
          {t('sale.title')}
        </h1>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground">
            {t('common.lastUpdated', { date: new Date().toLocaleDateString(getLocale()) })}
          </p>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              {t('sale.sections.purpose.title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('sale.sections.purpose.content')}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              {t('sale.sections.services.title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t('sale.sections.services.intro')}
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>{t('sale.sections.services.plans.free.name')}:</strong> {t('sale.sections.services.plans.free.description')}</li>
              <li><strong>{t('sale.sections.services.plans.premium.name')}:</strong> {t('sale.sections.services.plans.premium.description')}</li>
              <li><strong>{t('sale.sections.services.plans.legacy.name')}:</strong> {t('sale.sections.services.plans.legacy.description')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              {t('sale.sections.pricing.title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t('sale.sections.pricing.content')}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {t('sale.sections.pricing.modifications')}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              {t('sale.sections.duration.title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('sale.sections.duration.content')}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              {t('sale.sections.withdrawal.title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('sale.sections.withdrawal.content')}
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              {t('sale.sections.withdrawal.guarantee')}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              {t('sale.sections.cancellation.title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t('sale.sections.cancellation.content')}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {t('sale.sections.cancellation.access')}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              {t('sale.sections.liability.title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('sale.sections.liability.content')}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              {t('sale.sections.dataProtection.title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('sale.sections.dataProtection.content')}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              {t('sale.sections.modifications.title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('sale.sections.modifications.content')}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              {t('sale.sections.jurisdiction.title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('sale.sections.jurisdiction.content')}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              {t('sale.sections.contact.title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('sale.sections.contact.content')} contact@familygarden.fr
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TermsOfSale;
