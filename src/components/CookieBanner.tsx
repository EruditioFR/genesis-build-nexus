import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X } from "lucide-react";
import { Link } from "react-router-dom";

const COOKIE_CONSENT_KEY = "memoria-vita-cookie-consent";

type ConsentType = "all" | "essential" | null;

const CookieBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Petit délai pour ne pas perturber le chargement initial
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({ type: "all", date: new Date().toISOString() }));
    setShowBanner(false);
  };

  const handleAcceptEssential = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({ type: "essential", date: new Date().toISOString() }));
    setShowBanner(false);
  };

  const handleReject = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({ type: "essential", date: new Date().toISOString() }));
    setShowBanner(false);
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <div className="container mx-auto max-w-4xl">
            <div className="bg-card border border-border rounded-2xl shadow-elevated p-6 relative">
              {/* Close button */}
              <button
                onClick={handleReject}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Fermer"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Icon */}
                <div className="hidden md:flex w-12 h-12 rounded-full bg-secondary/10 items-center justify-center flex-shrink-0">
                  <Cookie className="w-6 h-6 text-secondary" />
                </div>

                {/* Content */}
                <div className="flex-1 pr-8 md:pr-0">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    🍪 Nous utilisons des cookies
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Nous utilisons des cookies pour améliorer votre expérience sur notre site, 
                    analyser le trafic et personnaliser le contenu. En cliquant sur "Tout accepter", 
                    vous consentez à l'utilisation de tous les cookies.{" "}
                    <Link to="/privacy" className="text-secondary hover:underline">
                      En savoir plus
                    </Link>
                  </p>

                  {/* Details section */}
                  <AnimatePresence>
                    {showDetails && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-muted/50 rounded-lg p-4 mb-4 space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-foreground">Cookies essentiels</p>
                              <p className="text-xs text-muted-foreground">
                                Nécessaires au fonctionnement du site. Ils ne peuvent pas être désactivés.
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-foreground">Cookies analytiques</p>
                              <p className="text-xs text-muted-foreground">
                                Nous aident à comprendre comment vous utilisez le site pour l'améliorer.
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-foreground">Cookies de personnalisation</p>
                              <p className="text-xs text-muted-foreground">
                                Permettent de personnaliser votre expérience et de mémoriser vos préférences.
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={handleAcceptAll}
                      variant="hero"
                      size="sm"
                      className="flex-1 sm:flex-none"
                    >
                      Tout accepter
                    </Button>
                    <Button
                      onClick={handleAcceptEssential}
                      variant="outline"
                      size="sm"
                      className="flex-1 sm:flex-none"
                    >
                      Essentiels uniquement
                    </Button>
                    <Button
                      onClick={() => setShowDetails(!showDetails)}
                      variant="ghost"
                      size="sm"
                      className="flex-1 sm:flex-none text-muted-foreground"
                    >
                      {showDetails ? "Masquer les détails" : "Personnaliser"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieBanner;
