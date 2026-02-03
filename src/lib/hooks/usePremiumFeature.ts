import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '@/lib/state/onboarding-store';
import * as Haptics from 'expo-haptics';

// Feature limits for free users
export const FREE_TIER_LIMITS = {
  maxProjects: 1,
  maxTasksPerProject: 5,
  maxDailySessions: 3,
  maxSessionMinutes: 25, // Can't use 45 min sessions
};

export const PREMIUM_FEATURES = {
  unlimitedProjects: 'Unlimited Projects',
  unlimitedTasks: 'Unlimited Tasks',
  unlimitedSessions: 'Unlimited Focus Sessions',
  longSessions: '45-Minute Focus Sessions',
  advancedStats: 'Advanced Statistics',
  customThemes: 'Custom Themes',
  prioritySupport: 'Priority Support',
};

/**
 * Hook to check premium features and show upgrade prompts
 */
export function usePremiumFeature() {
  const router = useRouter();
  const selectedPlan = useOnboardingStore((s) => s.selectedPlan);
  const isPremium = selectedPlan === 'pro' || selectedPlan === 'premium';

  /**
   * Check if user can access a premium feature
   * If not, show an alert and optionally navigate to upgrade
   */
  const checkFeatureAccess = (
    featureName: string,
    options?: {
      showAlert?: boolean;
      navigateToUpgrade?: boolean;
      customMessage?: string;
    }
  ): boolean => {
    const { showAlert = true, navigateToUpgrade = true, customMessage } = options || {};

    if (isPremium) {
      return true;
    }

    if (showAlert) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      
      const message = customMessage || 
        `${featureName} is a premium feature. Upgrade your plan to unlock unlimited access and boost your productivity!`;

      Alert.alert(
        '🔒 Premium Feature',
        message,
        [
          {
            text: 'Maybe Later',
            style: 'cancel',
          },
          {
            text: 'Upgrade Now',
            onPress: () => {
              if (navigateToUpgrade) {
                router.push('/onboarding/paywall');
              }
            },
          },
        ]
      );
    }

    return false;
  };

  /**
   * Check if user can add more projects
   */
  const canAddProject = (currentProjectCount: number): boolean => {
    if (isPremium) return true;
    
    if (currentProjectCount >= FREE_TIER_LIMITS.maxProjects) {
      checkFeatureAccess('Multiple Projects', {
        customMessage: `Free accounts can only have ${FREE_TIER_LIMITS.maxProjects} active project. Upgrade to Pro to create unlimited projects!`,
      });
      return false;
    }
    return true;
  };

  /**
   * Check if user can add more tasks to a project
   */
  const canAddTask = (currentTaskCount: number): boolean => {
    if (isPremium) return true;
    
    if (currentTaskCount >= FREE_TIER_LIMITS.maxTasksPerProject) {
      checkFeatureAccess('More Tasks', {
        customMessage: `Free accounts can only have ${FREE_TIER_LIMITS.maxTasksPerProject} tasks per project. Upgrade to Pro for unlimited tasks!`,
      });
      return false;
    }
    return true;
  };

  /**
   * Check if user can start another focus session today
   */
  const canStartSession = (todaySessionCount: number): boolean => {
    if (isPremium) return true;
    
    if (todaySessionCount >= FREE_TIER_LIMITS.maxDailySessions) {
      checkFeatureAccess('More Focus Sessions', {
        customMessage: `You've used all ${FREE_TIER_LIMITS.maxDailySessions} free focus sessions for today. Upgrade to Pro for unlimited sessions!`,
      });
      return false;
    }
    return true;
  };

  /**
   * Check if user can use long focus sessions (45 min)
   */
  const canUseLongSession = (): boolean => {
    if (isPremium) return true;
    
    checkFeatureAccess('45-Minute Sessions', {
      customMessage: 'Extended 45-minute focus sessions are a premium feature. Upgrade to Pro to unlock longer deep work sessions!',
    });
    return false;
  };

  return {
    isPremium,
    checkFeatureAccess,
    canAddProject,
    canAddTask,
    canStartSession,
    canUseLongSession,
  };
}

/**
 * Standalone function to show upgrade prompt (for use outside of React components)
 */
export function showUpgradePrompt(
  featureName: string,
  router: ReturnType<typeof useRouter>,
  customMessage?: string
) {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  
  const message = customMessage || 
    `${featureName} is a premium feature. Upgrade your plan to unlock unlimited access!`;

  Alert.alert(
    '🔒 Premium Feature',
    message,
    [
      {
        text: 'Maybe Later',
        style: 'cancel',
      },
      {
        text: 'Upgrade Now',
        onPress: () => router.push('/onboarding/paywall'),
      },
    ]
  );
}
