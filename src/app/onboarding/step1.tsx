import { useRouter } from 'expo-router';
import { OnboardingLayout, RadioInput } from '@/components/onboarding';
import { useOnboardingStore, FocusStruggle } from '@/lib/state/onboarding-store';

const focusOptions: { value: FocusStruggle; label: string; description: string; emoji: string }[] = [
  {
    value: 'distractions',
    label: 'Distractions',
    description: 'I get pulled away by notifications, thoughts, or surroundings',
    emoji: '📱',
  },
  {
    value: 'overwhelm',
    label: 'Overwhelm',
    description: "I have so much to do that I don't know where to start",
    emoji: '🌊',
  },
  {
    value: 'procrastination',
    label: 'Procrastination',
    description: 'I struggle to get started even when I know what to do',
    emoji: '⏰',
  },
  {
    value: 'all',
    label: 'All of the above',
    description: "It's a mix of everything depending on the day",
    emoji: '🔄',
  },
];

export default function Step1Screen() {
  const router = useRouter();
  const focusStruggle = useOnboardingStore((s) => s.focusStruggle);
  const setFocusStruggle = useOnboardingStore((s) => s.setFocusStruggle);
  const markStepComplete = useOnboardingStore((s) => s.markStepComplete);

  const handleContinue = () => {
    if (focusStruggle) {
      markStepComplete(1);
      router.push('/onboarding/step2');
    }
  };

  return (
    <OnboardingLayout
      currentStep={1}
      title="What's your biggest focus challenge?"
      subtitle="Understanding your struggles helps us personalize your experience."
      onPrimaryPress={handleContinue}
      primaryButtonDisabled={!focusStruggle}
    >
      <RadioInput
        options={focusOptions}
        value={focusStruggle}
        onChange={setFocusStruggle}
      />
    </OnboardingLayout>
  );
}
