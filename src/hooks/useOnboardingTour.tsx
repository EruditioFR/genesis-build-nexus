// Re-export for backward compatibility
// This hook now uses the new useFeatureTour hook with 'dashboard' as the tour type

import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFeatureTour } from './useFeatureTour';
import { getTourStorageKey } from '@/lib/tourSteps';

export const useOnboardingTour = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { startTour: startDashboardTour, stopTour, isTourCompleted, resetTour } = useFeatureTour('dashboard');

  const startTour = useCallback(() => {
    // Navigate to dashboard first if not there
    if (location.pathname !== '/dashboard') {
      navigate('/dashboard');
      // Wait for navigation to complete
      setTimeout(() => {
        startDashboardTour();
      }, 500);
    } else {
      startDashboardTour();
    }
  }, [location.pathname, navigate, startDashboardTour]);

  // Check legacy storage key as well for backward compatibility
  const isCompleted = useCallback(() => {
    return isTourCompleted() || localStorage.getItem('onboarding_tour_completed') === 'true';
  }, [isTourCompleted]);

  return {
    startTour,
    stopTour,
    isTourCompleted: isCompleted,
    resetTour,
  };
};

export default useOnboardingTour;
