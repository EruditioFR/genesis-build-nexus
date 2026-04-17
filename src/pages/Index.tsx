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
const VideoPreviewSection = lazy(() => import("@/components/landing/v2/VideoPreviewSection"));
const TestimonialsSection = lazy(() => import("@/components/landing/TestimonialsSection"));
const PricingSectionV3 = lazy(() => import("@/components/landing/v3/PricingSectionV3"));
const FAQSection = lazy(() => import("@/components/landing/FAQSection"));
const CTASectionV2 = lazy(() => import("@/components/landing/v2/CTASectionV2"));
const Footer = lazy(() => import("@/components/landing/Footer"));
const CookieBanner = lazy(() => import("@/components/CookieBanner"));

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
        title="Family Garden — Journal de famille privé et sécurisé"
        description="Créez votre journal de famille privé : rassemblez photos, vidéos, audio et textes, organisez-les simplement et partagez-les en cercles avec vos proches. Hébergement européen RGPD."
        jsonLd={[websiteSchema, howToSchema]}
      />
      <JsonLdSchema type="all" />
      <Header />
      <main>
        <HeroSectionV3 />
        <Suspense fallback={<div className="min-h-[50vh]" />}>
          <SocialProofBand />
          <PainPointsSection />
          <HowItWorksV3 />
          <LandingProductPreview />
          {/* <SolutionSection /> */}
          <AudienceSectionV3 />
          <VideoPreviewSection />
          <TestimonialsSection />
          <PricingSectionV3 />
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

export default Index;
