import { useCallback, useEffect, useRef } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { TourType, getTourSteps, getTourStorageKey } from '@/lib/tourSteps';

// Inject custom styles for driver.js
const injectTourStyles = () => {
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
};

export const useFeatureTour = (tourType: TourType) => {
  const driverRef = useRef<ReturnType<typeof driver> | null>(null);

  const startTour = useCallback(() => {
    injectTourStyles();

    const steps = getTourSteps(tourType);

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
      steps: steps.map(step => ({
        element: step.element,
        popover: step.popover,
      })),
      onDestroyed: () => {
        // Mark tour as completed
        localStorage.setItem(getTourStorageKey(tourType), 'true');
      },
    });

    driverRef.current.drive();
  }, [tourType]);

  const stopTour = useCallback(() => {
    if (driverRef.current) {
      driverRef.current.destroy();
    }
  }, []);

  const isTourCompleted = useCallback(() => {
    return localStorage.getItem(getTourStorageKey(tourType)) === 'true';
  }, [tourType]);

  const resetTour = useCallback(() => {
    localStorage.removeItem(getTourStorageKey(tourType));
  }, [tourType]);

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

export default useFeatureTour;
