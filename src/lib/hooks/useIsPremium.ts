import { useOnboardingStore } from '@/lib/state/onboarding-store';
import useAppStore from '@/lib/state/app-store';
import { useEffect } from 'react';

/**
 * Hook to get premium status from the onboarding store's selectedPlan.
 * This is the single source of truth for premium status.
 * It also syncs the premium status to the app store for backwards compatibility.
 */
export function useIsPremium(): boolean {
  const selectedPlan = useOnboardingStore((s) => s.selectedPlan);
  const setPremium = useAppStore((s) => s.setPremium);
  
  const isPremium = selectedPlan === 'pro' || selectedPlan === 'premium';
  
  // Sync to app store for backwards compatibility
  useEffect(() => {
    setPremium(isPremium);
  }, [isPremium, setPremium]);
  
  return isPremium;
}

/**
 * Get the current plan name for display purposes
 */
export function usePlanName(): string {
  const selectedPlan = useOnboardingStore((s) => s.selectedPlan);
  
  switch (selectedPlan) {
    case 'premium':
      return 'Premium';
    case 'pro':
      return 'Pro';
    default:
      return 'Free';
  }
}
