import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { TourType, getTourSteps, getTourStorageKey } from '@/lib/tourSteps';

// Inject custom styles for driver.js - ENHANCED version
const injectTourStyles = () => {
  const styleId = 'driver-custom-styles';
  // Remove existing to ensure fresh styles
  const existing = document.getElementById(styleId);
  if (existing) existing.remove();
  
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    /* Overlay - darker and more immersive */
    .driver-overlay {
      background: rgba(0, 0, 0, 0.75) !important;
      backdrop-filter: blur(2px);
    }
    
    /* Main popover container - larger and more polished */
    .driver-popover {
      background: hsl(var(--card)) !important;
      color: hsl(var(--card-foreground)) !important;
      border: 2px solid hsl(var(--secondary) / 0.3) !important;
      border-radius: 1.25rem !important;
      box-shadow: 
        0 25px 50px -12px rgba(0, 0, 0, 0.25),
        0 0 0 1px hsl(var(--secondary) / 0.1),
        0 0 40px -15px hsl(var(--secondary) / 0.3) !important;
      padding: 1.75rem !important;
      min-width: 340px !important;
      max-width: 420px !important;
      animation: driverPopoverIn 0.3s ease-out !important;
    }
    
    @keyframes driverPopoverIn {
      from {
        opacity: 0;
        transform: scale(0.9) translateY(10px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }
    
    /* Title - larger with gradient accent */
    .driver-popover-title {
      font-family: var(--font-display, 'Playfair Display'), serif !important;
      font-size: 1.375rem !important;
      font-weight: 700 !important;
      color: hsl(var(--foreground)) !important;
      line-height: 1.3 !important;
      margin-bottom: 0.75rem !important;
      padding-bottom: 0.75rem !important;
      border-bottom: 1px solid hsl(var(--border) / 0.5) !important;
    }
    
    /* Description - more readable */
    .driver-popover-description {
      color: hsl(var(--muted-foreground)) !important;
      font-size: 1rem !important;
      line-height: 1.65 !important;
      margin-bottom: 1.25rem !important;
    }
    
    /* Progress section - visual progress bar */
    .driver-popover-progress-text {
      display: flex !important;
      align-items: center !important;
      gap: 0.75rem !important;
      color: hsl(var(--muted-foreground)) !important;
      font-size: 0.875rem !important;
      font-weight: 500 !important;
      padding: 0.5rem 0 !important;
    }
    
    /* Navigation footer */
    .driver-popover-navigation-btns {
      display: flex !important;
      gap: 0.75rem !important;
      margin-top: 0.5rem !important;
    }
    
    /* Previous button */
    .driver-popover-prev-btn {
      background: transparent !important;
      color: hsl(var(--foreground)) !important;
      border: 1.5px solid hsl(var(--border)) !important;
      border-radius: 0.75rem !important;
      padding: 0.75rem 1.25rem !important;
      font-size: 0.9375rem !important;
      font-weight: 600 !important;
      transition: all 0.2s ease !important;
      cursor: pointer !important;
    }
    
    .driver-popover-prev-btn:hover {
      background: hsl(var(--muted)) !important;
      border-color: hsl(var(--muted-foreground) / 0.3) !important;
      transform: translateX(-2px) !important;
    }
    
    /* Next and Done buttons */
    .driver-popover-next-btn,
    .driver-popover-close-btn {
      background: linear-gradient(135deg, hsl(var(--secondary)) 0%, hsl(var(--secondary) / 0.85) 100%) !important;
      color: hsl(var(--secondary-foreground)) !important;
      border: none !important;
      border-radius: 0.75rem !important;
      padding: 0.75rem 1.5rem !important;
      font-size: 0.9375rem !important;
      font-weight: 600 !important;
      text-shadow: none !important;
      transition: all 0.2s ease !important;
      cursor: pointer !important;
      box-shadow: 0 4px 14px -3px hsl(var(--secondary) / 0.4) !important;
    }
    
    .driver-popover-next-btn:hover,
    .driver-popover-close-btn:hover {
      transform: translateY(-1px) translateX(2px) !important;
      box-shadow: 0 6px 20px -3px hsl(var(--secondary) / 0.5) !important;
    }
    
    /* Close X button in corner - compact */
    .driver-popover-close-btn-x {
      position: absolute !important;
      top: 0.5rem !important;
      right: 0.5rem !important;
      width: 1.5rem !important;
      height: 1.5rem !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      background: hsl(var(--muted) / 0.7) !important;
      border: none !important;
      border-radius: 0.375rem !important;
      color: hsl(var(--muted-foreground)) !important;
      font-size: 0.875rem !important;
      cursor: pointer !important;
      transition: all 0.2s ease !important;
      padding: 0 !important;
      line-height: 1 !important;
    }
    
    .driver-popover-close-btn-x:hover {
      background: hsl(var(--destructive) / 0.15) !important;
      color: hsl(var(--destructive)) !important;
    }
    
    /* Arrow styles */
    .driver-popover-arrow {
      border: 2px solid hsl(var(--secondary) / 0.3) !important;
    }
    
    .driver-popover-arrow-side-left.driver-popover-arrow,
    .driver-popover-arrow-side-right.driver-popover-arrow,
    .driver-popover-arrow-side-top.driver-popover-arrow,
    .driver-popover-arrow-side-bottom.driver-popover-arrow {
      background: hsl(var(--card)) !important;
    }
    
    /* Highlighted element pulse animation */
    .driver-highlighted-element {
      animation: highlightPulse 2s ease-in-out infinite !important;
    }
    
    @keyframes highlightPulse {
      0%, 100% {
        box-shadow: 0 0 0 4px hsl(var(--secondary) / 0.3) !important;
      }
      50% {
        box-shadow: 0 0 0 8px hsl(var(--secondary) / 0.15) !important;
      }
    }
    
    /* Mobile responsive */
    @media (max-width: 640px) {
      .driver-popover {
        min-width: 290px !important;
        max-width: calc(100vw - 2rem) !important;
        padding: 1.25rem !important;
        margin: 0.5rem !important;
      }
      
      .driver-popover-title {
        font-size: 1.2rem !important;
      }
      
      .driver-popover-description {
        font-size: 0.9375rem !important;
      }
      
      .driver-popover-navigation-btns {
        flex-direction: column !important;
      }
      
      .driver-popover-prev-btn,
      .driver-popover-next-btn,
      .driver-popover-close-btn {
        width: 100% !important;
        justify-content: center !important;
      }
    }
  `;
  document.head.appendChild(style);
};

export const useFeatureTour = (tourType: TourType) => {
  const driverRef = useRef<ReturnType<typeof driver> | null>(null);
  const { t, i18n } = useTranslation('common');

  // Get localized button text from i18n
  const getButtonText = useCallback(() => {
    return {
      next: t('tour.buttons.next'),
      prev: t('tour.buttons.prev'),
      done: t('tour.buttons.done'),
      progress: t('tour.buttons.progress'),
    };
  }, [t]);

  const startTour = useCallback(() => {
    injectTourStyles();

    const steps = getTourSteps(tourType);
    const buttonText = getButtonText();

    driverRef.current = driver({
      showProgress: true,
      progressText: buttonText.progress,
      nextBtnText: buttonText.next,
      prevBtnText: buttonText.prev,
      doneBtnText: buttonText.done,
      animate: true,
      allowClose: true,
      overlayClickBehavior: 'close',
      stagePadding: 12,
      stageRadius: 12,
      popoverOffset: 20,
      showButtons: ['next', 'previous', 'close'],
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
  }, [tourType, getButtonText]);

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
