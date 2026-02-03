import { useRouter } from 'expo-router';
import { OnboardingLayout, RadioInput } from '@/components/onboarding';
import { useOnboardingStore, NotificationPreference } from '@/lib/state/onboarding-store';

const notificationOptions: { value: NotificationPreference; label: string; description: string; emoji: string }[] = [
  {
    value: 'gentle',
    label: 'Gentle Reminders',
    description: 'Soft nudges when focus time starts, breaks, and daily goals',
    emoji: '🔔',
  },
  {
    value: 'daily-summary',
    label: 'Daily Summary Only',
    description: 'One notification per day with your progress',
    emoji: '📊',
  },
  {
    value: 'none',
    label: 'No Notifications',
    description: "I'll open the app when I need it",
    emoji: '🔕',
  },
];

export default function Step9Screen() {
  const router = useRouter();
  const notificationPreference = useOnboardingStore((s) => s.notificationPreference);
  const setNotificationPreference = useOnboardingStore((s) => s.setNotificationPreference);
  const markStepComplete = useOnboardingStore((s) => s.markStepComplete);

  const handleContinue = () => {
    markStepComplete(9);
    router.push('/onboarding/step10');
  };

  return (
    <OnboardingLayout
      currentStep={9}
      title="How should we remind you?"
      subtitle="Stay on track without feeling overwhelmed by notifications."
      onPrimaryPress={handleContinue}
    >
      <RadioInput
        options={notificationOptions}
        value={notificationPreference}
        onChange={setNotificationPreference}
      />
    </OnboardingLayout>
  );
}
