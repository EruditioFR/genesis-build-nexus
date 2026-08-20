/**
 * Suivi d'événements produit (Google Analytics 4).
 * Les événements ne partent que si gtag est chargé (Consent Mode v2 gère le stockage).
 */

type EventParams = Record<string, string | number | boolean | undefined>;

export const trackEvent = (name: string, params: EventParams = {}) => {
  try {
    if (typeof window === 'undefined' || !window.gtag) return;
    window.gtag('event', name, params);
  } catch {
    // Le suivi ne doit jamais casser le parcours utilisateur
  }
};

/** Premier souvenir créé par un utilisateur (activation) */
export const trackFirstMemoryCreated = (params: EventParams = {}) =>
  trackEvent('first_memory_created', { event_category: 'activation', ...params });

/** Souvenir créé (tous les souvenirs) */
export const trackMemoryCreated = (params: EventParams = {}) =>
  trackEvent('memory_created', { event_category: 'engagement', ...params });

/** Échec d'envoi de média (photo, audio, vidéo) */
export const trackUploadFailed = (params: EventParams = {}) =>
  trackEvent('media_upload_failed', { event_category: 'error', ...params });

/** Échec d'enregistrement d'un souvenir */
export const trackMemorySaveFailed = (params: EventParams = {}) =>
  trackEvent('memory_save_failed', { event_category: 'error', ...params });
