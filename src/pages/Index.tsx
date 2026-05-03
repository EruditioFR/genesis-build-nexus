import { useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/landing/Header";
import HeroSectionV3 from "@/components/landing/v3/HeroSectionV3";
import SEOHead from "@/components/seo/SEOHead";
import JsonLdSchema from "@/components/seo/JsonLdSchema";
import { websiteSchema, howToSchema } from "@/lib/seoSchemas";

const LandingProductPreview = lazy(() => import("@/components/landing/LandingProductPreview"));
const SocialProofBand = lazy(() => import("@/components/landing/v3/SocialProofBand"));
const PainPointsSection = lazy(() => import("@/components/landing/v2/PainPointsSection"));
const HowItWorksV3 = lazy(() => import("@/components/landing/v3/HowItWorksV3"));
const SolutionSection = lazy(() => import("@/components/landing/v2/SolutionSection"));
const AudienceSectionV3 = lazy(() => import("@/components/landing/v3/AudienceSectionV3"));

const TestimonialsSection = lazy(() => import("@/components/landing/v3/TestimonialsSectionV3"));
const PricingSectionV3 = lazy(() => import("@/components/landing/v3/PricingSectionV3"));
const TrustBandV3 = lazy(() => import("@/components/landing/v3/TrustBandV3"));
const FAQSectionV3 = lazy(() => import("@/components/landing/v3/FAQSectionV3"));
const CTASectionV3 = lazy(() => import("@/components/landing/v3/CTASectionV3"));
const Footer = lazy(() => import("@/components/landing/v3/FooterV3"));

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a2e]">
        <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <SEOHead
        title="Family Garden : journal de famille privé, souvenirs et arbre généalogique"
        description="Créez votre journal de famille privé avec Family Garden. Rassemblez photos, vidéos, audio et textes, construisez votre arbre généalogique et partagez vos souvenirs en toute sécurité avec vos proches. Hébergement français RGPD."
        jsonLd={[websiteSchema, howToSchema]}
      />
      <JsonLdSchema type="all" />
      <Header />
      <main>
        <HeroSectionV3 />
        <Suspense fallback={<div className="min-h-[50vh]" />}>
          <SocialProofBand />
          <HowItWorksV3 />
          {/* <SolutionSection /> */}
          <AudienceSectionV3 />
          <TestimonialsSection />
          <TrustBandV3 />
          <PricingSectionV3 />
          <FAQSectionV3 />
          <CTASectionV3 />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  );
};

export default Index;
