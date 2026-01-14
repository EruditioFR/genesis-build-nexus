import { useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";

const COOKIE_CONSENT_KEY = "memoryvitae-cookie-consent";
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

// Déclarations pour TypeScript
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

// Vérifie si l'utilisateur a accepté les cookies analytiques
export const hasAnalyticsConsent = (): boolean => {
  try {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) return false;
    const parsed = JSON.parse(consent);
    return parsed.type === "all";
  } catch {
    return false;
  }
};

// Initialise Google Analytics
const initializeGA = () => {
  if (!GA_MEASUREMENT_ID) {
    console.warn("Google Analytics: VITE_GA_MEASUREMENT_ID non configuré");
    return;
  }

  // Évite la double initialisation
  if (document.getElementById("ga-script")) return;

  // Crée le script gtag
  const script = document.createElement("script");
  script.id = "ga-script";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Initialise dataLayer et gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  };
  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID, {
    anonymize_ip: true, // Conforme RGPD
    cookie_flags: "SameSite=None;Secure",
  });
};

// Supprime Google Analytics
const removeGA = () => {
  const script = document.getElementById("ga-script");
  if (script) {
    script.remove();
  }
  
  // Supprime les cookies GA
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
    if (name.startsWith("_ga") || name.startsWith("_gid") || name.startsWith("_gat")) {
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    }
  }
};

// Hook principal pour Google Analytics
export const useGoogleAnalytics = () => {
  const location = useLocation();

  // Initialise GA selon le consentement
  useEffect(() => {
    if (hasAnalyticsConsent()) {
      initializeGA();
    } else {
      removeGA();
    }

    // Écoute les changements de consentement
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === COOKIE_CONSENT_KEY) {
        if (hasAnalyticsConsent()) {
          initializeGA();
        } else {
          removeGA();
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Track les changements de page
  useEffect(() => {
    if (hasAnalyticsConsent() && window.gtag && GA_MEASUREMENT_ID) {
      window.gtag("config", GA_MEASUREMENT_ID, {
        page_path: location.pathname + location.search,
        anonymize_ip: true,
      });
    }
  }, [location]);

  // Fonction pour tracker des événements personnalisés
  const trackEvent = useCallback((action: string, category: string, label?: string, value?: number) => {
    if (hasAnalyticsConsent() && window.gtag) {
      window.gtag("event", action, {
        event_category: category,
        event_label: label,
        value: value,
      });
    }
  }, []);

  return { trackEvent, hasConsent: hasAnalyticsConsent };
};

export default useGoogleAnalytics;
