import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, HelpCircle, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/seo/SEOHead";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <SEOHead
        title="Page non trouvée | Family Garden"
        description="La page que vous recherchez n'existe pas ou a été déplacée."
        noIndex={true}
      />
      <div className="text-center max-w-md px-6">
        <h1 className="mb-3 text-6xl font-display font-bold text-foreground">404</h1>
        <p className="mb-2 text-xl font-semibold text-foreground">Page non trouvée</p>
        <p className="mb-8 text-muted-foreground">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg" className="gap-2">
            <Link to="/">
              <Home className="w-4 h-4" />
              Retour à l'accueil
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link to="/faq">
              <HelpCircle className="w-4 h-4" />
              FAQ
            </Link>
          </Button>
          <Button asChild variant="ghost" size="lg" className="gap-2">
            <Link to="/about">
              <BookOpen className="w-4 h-4" />
              À propos
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
