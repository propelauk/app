import { useRouter } from 'expo-router';
import { OnboardingLayout, ImageChoice } from '@/components/onboarding';
import { useOnboardingStore, MotivationType } from '@/lib/state/onboarding-store';

const motivationOptions: { value: MotivationType; label: string; emoji: string }[] = [
  {
    value: 'rewards',
    label: 'Rewards',
    emoji: '🏆',
  },
  {
    value: 'deadlines',
    label: 'Deadlines',
    emoji: '⏰',
  },
  {
    value: 'accountability',
    label: 'Accountability',
    emoji: '🤝',
  },
  {
    value: 'progress',
    label: 'Seeing Progress',
    emoji: '📈',
  },
];

export default function Step5Screen() {
  const router = useRouter();
  const motivationType = useOnboardingStore((s) => s.motivationType);
  const setMotivationType = useOnboardingStore((s) => s.setMotivationType);
  const markStepComplete = useOnboardingStore((s) => s.markStepComplete);

  const handleContinue = () => {
    if (motivationType) {
      markStepComplete(5);
      router.push('/onboarding/step6');
    }
  };

  return (
    <OnboardingLayout
      currentStep={5}
      title="What motivates you most?"
      subtitle="We'll use this to make your experience more engaging."
      onPrimaryPress={handleContinue}
      primaryButtonDisabled={!motivationType}
    >
      <ImageChoice
        options={motivationOptions}
        value={motivationType}
        onChange={setMotivationType}
        columns={2}
      />
    </OnboardingLayout>
  );
}
