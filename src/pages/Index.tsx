import { useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import JsonLdSchema from "@/components/seo/JsonLdSchema";
import SEOHead from "@/components/seo/SEOHead";
import { websiteSchema, howToSchema } from "@/lib/seoSchemas";

// Lazy load below-the-fold components to improve LCP
const FeaturesSection = lazy(() => import("@/components/landing/FeaturesSection"));
const HowItWorksSection = lazy(() => import("@/components/landing/HowItWorksSection"));
const PricingSection = lazy(() => import("@/components/landing/PricingSection"));
const TestimonialsSection = lazy(() => import("@/components/landing/TestimonialsSection"));
const FAQSection = lazy(() => import("@/components/landing/FAQSection"));
const CTASection = lazy(() => import("@/components/landing/CTASection"));
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

  // Show nothing while checking auth to prevent flash
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a2e]">
        <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If user is logged in, they'll be redirected
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
      {/* JSON-LD Structured Data for GEO optimization */}
      <JsonLdSchema type="all" />
      <Header />
      <main>
        <HeroSection />
        <Suspense fallback={<div className="min-h-[50vh]" />}>
          <FeaturesSection />
          <HowItWorksSection />
          <TestimonialsSection />
          <PricingSection />
          <FAQSection />
          <CTASection />
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