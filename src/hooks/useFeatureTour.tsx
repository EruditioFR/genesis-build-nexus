import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { driver, Config } from 'driver.js';
import 'driver.js/dist/driver.css';
import confetti from 'canvas-confetti';
import { TourType, getTourSteps, getTourStorageKey } from '@/lib/tourSteps';

// Inject custom styles for driver.js - COMPLETE UX OVERHAUL
const injectTourStyles = (totalSteps: number) => {
  const styleId = 'driver-custom-styles';
  const existing = document.getElementById(styleId);
  if (existing) existing.remove();
  
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    /* ========================================
       OVERLAY - Immersive dark backdrop
       ======================================== */
    .driver-overlay {
      background: rgba(10, 10, 20, 0.85) !important;
      backdrop-filter: blur(4px) !important;
      -webkit-backdrop-filter: blur(4px) !important;
    }
    
    /* ========================================
       MAIN POPOVER - Modern card design
       ======================================== */
    .driver-popover {
      all: unset !important;
      display: block !important;
      position: absolute !important;
      background: linear-gradient(
        145deg,
        hsl(var(--card)) 0%,
        hsl(var(--card) / 0.98) 100%
      ) !important;
      color: hsl(var(--card-foreground)) !important;
      border: 1px solid hsl(var(--border) / 0.5) !important;
      border-radius: 1rem !important;
      box-shadow: 
        0 0 0 1px hsl(var(--secondary) / 0.1),
        0 20px 40px -15px rgba(0, 0, 0, 0.3),
        0 0 60px -20px hsl(var(--secondary) / 0.25) !important;
      padding: 0 !important;
      min-width: 320px !important;
      max-width: 400px !important;
      overflow: hidden !important;
      animation: tourPopoverIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) !important;
      font-family: system-ui, -apple-system, sans-serif !important;
    }
    
    @keyframes tourPopoverIn {
      from {
        opacity: 0;
        transform: scale(0.92) translateY(8px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }
    
    /* ========================================
       PROGRESS BAR - Visual step indicator
       ======================================== */
    .driver-popover::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: hsl(var(--muted));
      z-index: 1;
    }
    
    .driver-popover::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      height: 3px;
      background: linear-gradient(90deg, hsl(var(--secondary)), hsl(var(--secondary) / 0.8));
      z-index: 2;
      transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      width: calc(var(--driver-progress, 0) * 100%);
      border-radius: 0 2px 2px 0;
    }
    
    /* ========================================
       HEADER SECTION with icon
       ======================================== */
    .driver-popover-title {
      display: flex !important;
      align-items: flex-start !important;
      gap: 0.5rem !important;
      font-family: var(--font-display, 'Playfair Display'), Georgia, serif !important;
      font-size: 1.25rem !important;
      font-weight: 700 !important;
      color: hsl(var(--foreground)) !important;
      line-height: 1.35 !important;
      margin: 0 !important;
      padding: 1.25rem 1.25rem 0.75rem !important;
      border: none !important;
    }
    
    /* ========================================
       DESCRIPTION - Clean and readable
       ======================================== */
    .driver-popover-description {
      color: hsl(var(--muted-foreground)) !important;
      font-size: 0.9375rem !important;
      line-height: 1.6 !important;
      margin: 0 !important;
      padding: 0 1.25rem 1rem !important;
    }
    
    /* ========================================
       FOOTER - Progress + Navigation
       ======================================== */
    .driver-popover-footer {
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      padding: 0.875rem 1.25rem !important;
      background: hsl(var(--muted) / 0.3) !important;
      border-top: 1px solid hsl(var(--border) / 0.5) !important;
      gap: 1rem !important;
    }
    
    /* Progress text with step dots */
    .driver-popover-progress-text {
      display: flex !important;
      align-items: center !important;
      gap: 0.5rem !important;
      color: hsl(var(--muted-foreground)) !important;
      font-size: 0.8125rem !important;
      font-weight: 500 !important;
      white-space: nowrap !important;
    }
    
    /* Step indicator dots */
    .driver-popover-progress-text::before {
      content: '';
      display: flex;
      gap: 4px;
    }
    
    /* Navigation buttons container */
    .driver-popover-navigation-btns {
      display: flex !important;
      align-items: center !important;
      gap: 0.5rem !important;
      margin: 0 !important;
    }
    
    /* ========================================
       BUTTON STYLES
       ======================================== */
    /* Previous button - ghost style */
    .driver-popover-prev-btn {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      background: transparent !important;
      color: hsl(var(--muted-foreground)) !important;
      border: none !important;
      border-radius: 0.5rem !important;
      padding: 0.5rem 0.875rem !important;
      font-size: 0.875rem !important;
      font-weight: 500 !important;
      cursor: pointer !important;
      transition: all 0.2s ease !important;
      white-space: nowrap !important;
    }
    
    .driver-popover-prev-btn:hover {
      background: hsl(var(--muted) / 0.5) !important;
      color: hsl(var(--foreground)) !important;
    }
    
    /* Next button - primary style */
    .driver-popover-next-btn {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      background: hsl(var(--secondary)) !important;
      color: hsl(var(--secondary-foreground)) !important;
      border: none !important;
      border-radius: 0.5rem !important;
      padding: 0.5rem 1rem !important;
      font-size: 0.875rem !important;
      font-weight: 600 !important;
      cursor: pointer !important;
      transition: all 0.2s ease !important;
      white-space: nowrap !important;
      box-shadow: 0 2px 8px -2px hsl(var(--secondary) / 0.4) !important;
    }
    
    .driver-popover-next-btn:hover {
      filter: brightness(1.05) !important;
      transform: translateY(-1px) !important;
      box-shadow: 0 4px 12px -2px hsl(var(--secondary) / 0.5) !important;
    }
    
    /* Done/Finish button - success style */
    .driver-popover-close-btn {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      background: linear-gradient(135deg, #22c55e, #16a34a) !important;
      color: white !important;
      border: none !important;
      border-radius: 0.5rem !important;
      padding: 0.5rem 1.25rem !important;
      font-size: 0.875rem !important;
      font-weight: 600 !important;
      cursor: pointer !important;
      transition: all 0.2s ease !important;
      white-space: nowrap !important;
      box-shadow: 0 2px 8px -2px rgba(34, 197, 94, 0.5) !important;
    }
    
    .driver-popover-close-btn:hover {
      filter: brightness(1.1) !important;
      transform: translateY(-1px) !important;
      box-shadow: 0 4px 12px -2px rgba(34, 197, 94, 0.6) !important;
    }
    
    /* ========================================
       CLOSE X BUTTON - Minimal
       ======================================== */
    .driver-popover-close-btn-x {
      position: absolute !important;
      top: 0.75rem !important;
      right: 0.75rem !important;
      width: 1.75rem !important;
      height: 1.75rem !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      background: transparent !important;
      border: none !important;
      border-radius: 0.375rem !important;
      color: hsl(var(--muted-foreground) / 0.6) !important;
      font-size: 1.25rem !important;
      font-weight: 300 !important;
      cursor: pointer !important;
      transition: all 0.15s ease !important;
      padding: 0 !important;
      line-height: 1 !important;
      z-index: 10 !important;
    }
    
    .driver-popover-close-btn-x:hover {
      background: hsl(var(--muted) / 0.5) !important;
      color: hsl(var(--foreground)) !important;
    }
    
    /* ========================================
       ARROW STYLES
       ======================================== */
    .driver-popover-arrow {
      border: none !important;
    }
    
    .driver-popover-arrow-side-left.driver-popover-arrow,
    .driver-popover-arrow-side-right.driver-popover-arrow,
    .driver-popover-arrow-side-top.driver-popover-arrow,
    .driver-popover-arrow-side-bottom.driver-popover-arrow {
      background: hsl(var(--card)) !important;
      box-shadow: -1px -1px 0 0 hsl(var(--border) / 0.3) !important;
    }
    
    /* ========================================
       HIGHLIGHTED ELEMENT
       ======================================== */
    .driver-highlighted-element {
      outline: 2px solid hsl(var(--secondary)) !important;
      outline-offset: 4px !important;
      border-radius: 8px !important;
      animation: tourHighlight 2s ease-in-out infinite !important;
    }
    
    @keyframes tourHighlight {
      0%, 100% {
        outline-offset: 4px;
        box-shadow: 0 0 0 4px hsl(var(--secondary) / 0.2);
      }
      50% {
        outline-offset: 6px;
        box-shadow: 0 0 0 8px hsl(var(--secondary) / 0.1);
      }
    }
    
    /* ========================================
       MOBILE RESPONSIVE
       ======================================== */
    @media (max-width: 640px) {
      .driver-popover {
        min-width: 280px !important;
        max-width: calc(100vw - 1.5rem) !important;
        margin: 0.5rem !important;
        border-radius: 0.875rem !important;
      }
      
      .driver-popover-title {
        font-size: 1.125rem !important;
        padding: 1rem 1rem 0.625rem !important;
      }
      
      .driver-popover-description {
        font-size: 0.875rem !important;
        padding: 0 1rem 0.875rem !important;
        line-height: 1.55 !important;
      }
      
      .driver-popover-footer {
        padding: 0.75rem 1rem !important;
        flex-wrap: wrap !important;
      }
      
      .driver-popover-progress-text {
        order: -1 !important;
        width: 100% !important;
        justify-content: center !important;
        padding-bottom: 0.625rem !important;
        margin-bottom: 0.5rem !important;
        border-bottom: 1px solid hsl(var(--border) / 0.3) !important;
      }
      
      .driver-popover-navigation-btns {
        width: 100% !important;
        justify-content: space-between !important;
      }
      
      .driver-popover-prev-btn,
      .driver-popover-next-btn,
      .driver-popover-close-btn {
        flex: 1 !important;
        padding: 0.625rem !important;
      }
      
      .driver-popover-close-btn-x {
        top: 0.5rem !important;
        right: 0.5rem !important;
        width: 1.5rem !important;
        height: 1.5rem !important;
        font-size: 1rem !important;
      }
    }
    
    /* ========================================
       KEYBOARD NAVIGATION HINT
       ======================================== */
    .driver-popover-footer::after {
      content: '← → pour naviguer';
      position: absolute;
      bottom: -1.75rem;
      left: 50%;
      transform: translateX(-50%);
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.5);
      background: rgba(0, 0, 0, 0.6);
      padding: 0.25rem 0.625rem;
      border-radius: 1rem;
      white-space: nowrap;
      opacity: 0;
      animation: fadeInHint 0.5s ease 1s forwards;
    }
    
    @keyframes fadeInHint {
      to { opacity: 1; }
    }
    
    @media (max-width: 640px) {
      .driver-popover-footer::after {
        content: 'Swipe pour naviguer';
      }
    }
  `;
  document.head.appendChild(style);
};

// Update progress bar CSS variable
const updateProgress = (current: number, total: number) => {
  const popover = document.querySelector('.driver-popover') as HTMLElement;
  if (popover) {
    popover.style.setProperty('--driver-progress', String(current / total));
  }
};

// Trigger confetti celebration
const triggerConfetti = () => {
  const duration = 2000;
  const end = Date.now() + duration;

  const colors = ['#c9a227', '#f5d742', '#22c55e', '#3b82f6'];

  (function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors,
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
};

export const useFeatureTour = (tourType: TourType) => {
  const driverRef = useRef<ReturnType<typeof driver> | null>(null);
  const currentStepRef = useRef(0);
  const { t } = useTranslation('common');
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);

  // Get localized button text from i18n
  const getButtonText = useCallback(() => {
    return {
      next: t('tour.buttons.next'),
      prev: t('tour.buttons.prev'),
      done: t('tour.buttons.done'),
      progress: t('tour.buttons.progress'),
    };
  }, [t]);

  const startDriverTour = useCallback(() => {
    const steps = getTourSteps(tourType);
    const totalSteps = steps.length;
    
    injectTourStyles(totalSteps);
    currentStepRef.current = 0;

    const buttonText = getButtonText();

    const config: Config = {
      showProgress: true,
      progressText: buttonText.progress,
      nextBtnText: buttonText.next,
      prevBtnText: buttonText.prev,
      doneBtnText: buttonText.done,
      animate: true,
      allowClose: true,
      overlayClickBehavior: 'close',
      stagePadding: 10,
      stageRadius: 10,
      popoverOffset: 16,
      showButtons: ['next', 'previous', 'close'],
      allowKeyboardControl: true,
      steps: steps.map((step, index) => ({
        element: step.element,
        popover: {
          ...step.popover,
          onPopoverRender: () => {
            currentStepRef.current = index;
            updateProgress(index + 1, totalSteps);
          },
        },
      })),
      onDestroyStarted: () => {
        // Check if we're on the last step
        if (currentStepRef.current === totalSteps - 1) {
          triggerConfetti();
        }
      },
      onDestroyed: () => {
        localStorage.setItem(getTourStorageKey(tourType), 'true');
      },
    };

    driverRef.current = driver(config);
    driverRef.current.drive();

    // Set initial progress
    setTimeout(() => updateProgress(1, totalSteps), 100);
  }, [tourType, getButtonText]);

  // Public startTour shows welcome dialog first
  const startTour = useCallback(() => {
    console.log('[Tour] startTour called, showing welcome dialog');
    setShowWelcomeDialog(true);
  }, []);

  // Start tour directly without welcome dialog (for manual restart)
  const startTourDirect = useCallback(() => {
    console.log('[Tour] startTourDirect called');
    startDriverTour();
  }, [startDriverTour]);

  const handleWelcomeStart = useCallback(() => {
    console.log('[Tour] Welcome dialog - Start clicked');
    setShowWelcomeDialog(false);
    // Small delay to ensure dialog is closed before tour starts
    setTimeout(() => {
      startDriverTour();
    }, 150);
  }, [startDriverTour]);

  const handleWelcomeSkip = useCallback(() => {
    console.log('[Tour] Welcome dialog - Skip clicked');
    setShowWelcomeDialog(false);
    // Mark as completed so it doesn't auto-show again
    localStorage.setItem(getTourStorageKey(tourType), 'true');
  }, [tourType]);

  const handleWelcomeClose = useCallback(() => {
    console.log('[Tour] Welcome dialog - Close clicked');
    setShowWelcomeDialog(false);
  }, []);

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
    startTourDirect,
    stopTour,
    isTourCompleted,
    resetTour,
    // Welcome dialog props - consumers render TourWelcomeDialog directly
    welcomeDialogProps: {
      isOpen: showWelcomeDialog,
      tourType,
      onStart: handleWelcomeStart,
      onSkip: handleWelcomeSkip,
      onClose: handleWelcomeClose,
    },
  };
};

export default useFeatureTour;
