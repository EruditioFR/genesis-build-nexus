import { useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";

const COOKIE_CONSENT_KEY = "familygarden-cookie-consent";
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || "G-173H7GYR34";

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

const getConsentModeState = () => {
  const granted = hasAnalyticsConsent() ? "granted" : "denied";

  return {
    analytics_storage: granted,
    ad_storage: granted,
    ad_user_data: granted,
    ad_personalization: granted,
    security_storage: "granted",
  } as const;
};

// Initialise Google Analytics en Consent Mode v2 : refus par défaut avant consentement
const initializeGA = () => {
  if (!GA_MEASUREMENT_ID) {
    console.warn("Google Analytics: VITE_GA_MEASUREMENT_ID non configuré");
    return;
  }

  // Évite la double initialisation
  if (document.getElementById("ga-script")) {
    window.gtag?.("consent", "update", getConsentModeState());
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  };

  window.gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    security_storage: "granted",
    wait_for_update: 500,
  });

  // Crée le script gtag
  const script = document.createElement("script");
  script.id = "ga-script";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.gtag("js", new Date());
  window.gtag("consent", "update", getConsentModeState());
  window.gtag("config", GA_MEASUREMENT_ID, {
    anonymize_ip: true, // Conforme RGPD
    cookie_flags: "SameSite=None;Secure",
  });
};

const updateGAConsent = () => {
  if (!window.gtag) return;
  window.gtag("consent", "update", getConsentModeState());
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

  // Initialise GA en Consent Mode puis met à jour selon le consentement
  useEffect(() => {
    initializeGA();
    updateGAConsent();

    if (!hasAnalyticsConsent()) removeGA();

    // Écoute les changements de consentement
    const handleConsentChange = () => {
      initializeGA();
      updateGAConsent();

      if (!hasAnalyticsConsent()) {
        removeGA();
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === COOKIE_CONSENT_KEY) handleConsentChange();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("familygarden-cookie-consent-change", handleConsentChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("familygarden-cookie-consent-change", handleConsentChange);
    };
  }, []);

  // Track les changements de page
  useEffect(() => {
    if (window.gtag && GA_MEASUREMENT_ID) {
      window.gtag("config", GA_MEASUREMENT_ID, {
        page_path: location.pathname + location.search,
        anonymize_ip: true,
      });
    }
  }, [location]);

  // Fonction pour tracker des événements personnalisés
  const trackEvent = useCallback((action: string, category: string, label?: string, value?: number) => {
    if (window.gtag) {
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
