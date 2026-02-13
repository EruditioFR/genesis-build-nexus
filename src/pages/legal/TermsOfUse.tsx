import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import SEOHead from "@/components/seo/SEOHead";
import { createBreadcrumbSchema } from "@/lib/seoSchemas";

const TermsOfUse = () => {
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
        title="Conditions Générales d'Utilisation | Family Garden"
        description="Consultez les conditions générales d'utilisation de Family Garden : inscription, utilisation du service, propriété intellectuelle et responsabilités."
        jsonLd={createBreadcrumbSchema([
          { name: "Accueil", url: "/" },
          { name: "CGU", url: "/terms" },
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
          {t('terms.title')}
        </h1>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground">
            {t('common.lastUpdated')} {new Date().toLocaleDateString(getLocale())}
          </p>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              {t('terms.sections.presentation.title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('terms.sections.presentation.content')}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              {t('terms.sections.acceptance.title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('terms.sections.acceptance.content')}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              {t('terms.sections.registration.title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t('terms.sections.registration.intro')}
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              {(t('terms.sections.registration.items', { returnObjects: true }) as string[]).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              {t('terms.sections.registration.ageRequirement')}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              {t('terms.sections.usage.title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t('terms.sections.usage.intro')}
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              {(t('terms.sections.usage.items', { returnObjects: true }) as string[]).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              {t('terms.sections.userContent.title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t('terms.sections.userContent.intro')}
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              {(t('terms.sections.userContent.items', { returnObjects: true }) as string[]).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              {t('terms.sections.userContent.guarantee')}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              {t('terms.sections.capsules.title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t('terms.sections.capsules.intro')}
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              {(t('terms.sections.capsules.items', { returnObjects: true }) as string[]).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              {t('terms.sections.capsules.disclaimer')}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              {t('terms.sections.circles.title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('terms.sections.circles.content')}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              {t('terms.sections.storage.title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t('terms.sections.storage.intro')}
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              {(t('terms.sections.storage.items', { returnObjects: true }) as string[]).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              {t('terms.sections.ip.title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('terms.sections.ip.content')}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              {t('terms.sections.liability.title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t('terms.sections.liability.intro')}
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              {(t('terms.sections.liability.items', { returnObjects: true }) as string[]).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              {t('terms.sections.termination.title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t('terms.sections.termination.intro')}
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              {(t('terms.sections.termination.items', { returnObjects: true }) as string[]).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              {t('terms.sections.termination.deletion')}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              {t('terms.sections.dataProtection.title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('terms.sections.dataProtection.content')}{" "}
              <Link to="/privacy" className="text-secondary hover:text-secondary/80">
                {t('terms.sections.dataProtection.link')}
              </Link>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              {t('terms.sections.modifications.title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('terms.sections.modifications.content')}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              {t('terms.sections.law.title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('terms.sections.law.content')}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              {t('terms.sections.contact.title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('terms.sections.contact.content')} contact@familygarden.fr
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TermsOfUse;
