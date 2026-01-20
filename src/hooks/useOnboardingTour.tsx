import { useCallback, useEffect, useRef } from 'react';
import { driver, DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useNavigate, useLocation } from 'react-router-dom';

const TOUR_STEPS: (DriveStep & { route?: string })[] = [
  {
    element: '[data-tour="welcome"]',
    popover: {
      title: '👋 Bienvenue sur Family Garden !',
      description: 'Découvrez comment préserver et partager vos souvenirs de famille. Cette visite vous guidera à travers les fonctionnalités principales.',
      side: 'bottom',
      align: 'center',
    },
    route: '/dashboard',
  },
  {
    element: '[data-tour="quick-actions"]',
    popover: {
      title: '🚀 Actions rapides',
      description: 'Créez un nouveau souvenir en un clic ! C\'est le moyen le plus rapide d\'ajouter des photos, vidéos ou textes à votre collection.',
      side: 'bottom',
      align: 'start',
    },
    route: '/dashboard',
  },
  {
    element: '[data-tour="stats"]',
    popover: {
      title: '📊 Vos statistiques',
      description: 'Suivez l\'évolution de votre collection : nombre de souvenirs, fichiers médias et cercles de partage.',
      side: 'top',
      align: 'center',
    },
    route: '/dashboard',
  },
  {
    element: '[data-tour="storage"]',
    popover: {
      title: '💾 Espace de stockage',
      description: 'Visualisez votre espace utilisé. Passez à Premium pour un stockage illimité !',
      side: 'top',
      align: 'start',
    },
    route: '/dashboard',
  },
  {
    element: '[data-tour="recent-capsules"]',
    popover: {
      title: '📦 Souvenirs récents',
      description: 'Retrouvez ici vos derniers souvenirs ajoutés. Cliquez sur une carte pour la consulter.',
      side: 'top',
      align: 'center',
    },
    route: '/dashboard',
  },
  {
    element: '[data-tour="nav-capsules"]',
    popover: {
      title: '🗂️ Toutes vos capsules',
      description: 'Accédez à l\'ensemble de vos souvenirs, organisés et filtrables par catégorie.',
      side: 'bottom',
      align: 'start',
    },
    route: '/dashboard',
  },
  {
    element: '[data-tour="nav-timeline"]',
    popover: {
      title: '📅 La chronologie',
      description: 'Visualisez vos souvenirs dans le temps, comme un album photo chronologique.',
      side: 'bottom',
      align: 'start',
    },
    route: '/dashboard',
  },
  {
    element: '[data-tour="nav-circles"]',
    popover: {
      title: '👨‍👩‍👧‍👦 Les cercles',
      description: 'Créez des cercles pour partager vos souvenirs avec la famille ou les amis proches.',
      side: 'bottom',
      align: 'start',
    },
    route: '/dashboard',
  },
  {
    element: '[data-tour="search"]',
    popover: {
      title: '🔍 Recherche globale',
      description: 'Retrouvez n\'importe quel souvenir instantanément grâce à la recherche.',
      side: 'bottom',
      align: 'end',
    },
    route: '/dashboard',
  },
  {
    element: '[data-tour="notifications"]',
    popover: {
      title: '🔔 Notifications',
      description: 'Restez informé des nouveaux partages et événements importants.',
      side: 'bottom',
      align: 'end',
    },
    route: '/dashboard',
  },
  {
    element: '[data-tour="user-menu"]',
    popover: {
      title: '👤 Votre profil',
      description: 'Gérez votre profil, vos paramètres et votre abonnement depuis ce menu.',
      side: 'bottom',
      align: 'end',
    },
    route: '/dashboard',
  },
  {
    popover: {
      title: '🎉 C\'est parti !',
      description: 'Vous êtes prêt à commencer ! Cliquez sur "Nouveau souvenir" pour créer votre première capsule temporelle.',
    },
  },
];

export const useOnboardingTour = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const driverRef = useRef<ReturnType<typeof driver> | null>(null);

  const startTour = useCallback(() => {
    // Navigate to dashboard first if not there
    if (location.pathname !== '/dashboard') {
      navigate('/dashboard');
      // Wait for navigation to complete
      setTimeout(() => {
        initTour();
      }, 500);
    } else {
      initTour();
    }
  }, [location.pathname, navigate]);

  const initTour = () => {
    // Add custom styles for driver.js
    const styleId = 'driver-custom-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .driver-popover {
          background: hsl(var(--card)) !important;
          color: hsl(var(--card-foreground)) !important;
          border: 1px solid hsl(var(--border)) !important;
          border-radius: 1rem !important;
          box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1) !important;
        }
        .driver-popover-title {
          font-family: var(--font-display), serif !important;
          font-size: 1.125rem !important;
          font-weight: 700 !important;
          color: hsl(var(--foreground)) !important;
        }
        .driver-popover-description {
          color: hsl(var(--muted-foreground)) !important;
          font-size: 0.875rem !important;
          line-height: 1.5 !important;
        }
        .driver-popover-progress-text {
          color: hsl(var(--muted-foreground)) !important;
        }
        .driver-popover-prev-btn {
          background: transparent !important;
          color: hsl(var(--foreground)) !important;
          border: 1px solid hsl(var(--border)) !important;
          border-radius: 0.5rem !important;
          padding: 0.5rem 1rem !important;
        }
        .driver-popover-prev-btn:hover {
          background: hsl(var(--muted)) !important;
        }
        .driver-popover-next-btn, .driver-popover-close-btn {
          background: hsl(var(--secondary)) !important;
          color: hsl(var(--secondary-foreground)) !important;
          border: none !important;
          border-radius: 0.5rem !important;
          padding: 0.5rem 1rem !important;
          text-shadow: none !important;
        }
        .driver-popover-next-btn:hover, .driver-popover-close-btn:hover {
          opacity: 0.9 !important;
        }
        .driver-overlay {
          background: rgba(0, 0, 0, 0.7) !important;
        }
        .driver-popover-arrow-side-left,
        .driver-popover-arrow-side-right,
        .driver-popover-arrow-side-top,
        .driver-popover-arrow-side-bottom {
          border-color: hsl(var(--card)) !important;
        }
      `;
      document.head.appendChild(style);
    }

    driverRef.current = driver({
      showProgress: true,
      progressText: '{{current}} sur {{total}}',
      nextBtnText: 'Suivant',
      prevBtnText: 'Précédent',
      doneBtnText: 'Terminer',
      animate: true,
      allowClose: true,
      stagePadding: 8,
      stageRadius: 8,
      popoverOffset: 15,
      steps: TOUR_STEPS.map(step => ({
        element: step.element,
        popover: step.popover,
      })),
      onDestroyed: () => {
        // Mark tour as completed
        localStorage.setItem('onboarding_tour_completed', 'true');
      },
    });

    driverRef.current.drive();
  };

  const stopTour = useCallback(() => {
    if (driverRef.current) {
      driverRef.current.destroy();
    }
  }, []);

  const isTourCompleted = useCallback(() => {
    return localStorage.getItem('onboarding_tour_completed') === 'true';
  }, []);

  const resetTour = useCallback(() => {
    localStorage.removeItem('onboarding_tour_completed');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (driverRef.current) {
        driverRef.current.destroy();
      }
    };
  }, []);

  return {
    startTour,
    stopTour,
    isTourCompleted,
    resetTour,
  };
};

export default useOnboardingTour;
