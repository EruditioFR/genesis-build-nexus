import { lazy, Suspense } from 'react';
import Header from '@/components/landing/Header';
import HeroSectionV2 from '@/components/landing/v2/HeroSectionV2';
import SEOHead from '@/components/seo/SEOHead';
import JsonLdSchema from '@/components/seo/JsonLdSchema';
import { websiteSchema, howToSchema } from '@/lib/seoSchemas';

const LandingInspirationSlider = lazy(() => import('@/components/landing/LandingInspirationSlider'));
const LandingProductPreview = lazy(() => import('@/components/landing/LandingProductPreview'));
const PainPointsSection = lazy(() => import('@/components/landing/v2/PainPointsSection'));
const SolutionSection = lazy(() => import('@/components/landing/v2/SolutionSection'));
const AudienceSection = lazy(() => import('@/components/landing/v2/AudienceSection'));
const TestimonialsSection = lazy(() => import('@/components/landing/TestimonialsSection'));
const PricingSection = lazy(() => import('@/components/landing/PricingSection'));
const FAQSection = lazy(() => import('@/components/landing/FAQSection'));
const CTASectionV2 = lazy(() => import('@/components/landing/v2/CTASectionV2'));
const Footer = lazy(() => import('@/components/landing/Footer'));
const CookieBanner = lazy(() => import('@/components/CookieBanner'));

const IndexV2 = () => {
  return (
    <div className="min-h-screen">
      <SEOHead
        title="Family Garden — Journal de famille privé et sécurisé"
        description="Créez votre journal de famille privé : rassemblez photos, vidéos, audio et textes, organisez-les simplement et partagez-les en cercles avec vos proches. Hébergement européen RGPD."
        jsonLd={[websiteSchema, howToSchema]}
      />
      <JsonLdSchema type="all" />
      <Header />
      <main>
        <HeroSectionV2 />
        <Suspense fallback={<div className="min-h-[50vh]" />}>
          <PainPointsSection />
          <LandingInspirationSlider />
          <LandingProductPreview />
          <SolutionSection />
          <AudienceSection />
          <TestimonialsSection />
          <PricingSection />
          <FAQSection />
          <CTASectionV2 />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <Footer />
        <CookieBanner />
      </Suspense>
    </div>
  );
};

export default IndexV2;
