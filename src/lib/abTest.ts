import { useState, useEffect } from 'react';

const AB_STORAGE_PREFIX = 'ab_test_';

export function useABVariant(testName: string, numVariants: number = 2): number {
  const [variant, setVariant] = useState<number>(() => {
    const stored = localStorage.getItem(`${AB_STORAGE_PREFIX}${testName}`);
    if (stored !== null) {
      const parsed = parseInt(stored, 10);
      if (!isNaN(parsed) && parsed >= 0 && parsed < numVariants) return parsed;
    }
    const newVariant = Math.floor(Math.random() * numVariants);
    localStorage.setItem(`${AB_STORAGE_PREFIX}${testName}`, String(newVariant));
    return newVariant;
  });

  useEffect(() => {
    // Track in GA
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'ab_test_variant', {
        test_name: testName,
        variant: variant,
      });
    }
  }, [testName, variant]);

  return variant;
}
