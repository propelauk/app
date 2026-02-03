import { useRouter } from 'expo-router';
import { OnboardingLayout, ImageChoice } from '@/components/onboarding';
import { useOnboardingStore, TimeOfDay } from '@/lib/state/onboarding-store';

const timeOptions: { value: TimeOfDay; label: string; emoji: string }[] = [
  {
    value: 'morning',
    label: 'Morning',
    emoji: '🌅',
  },
  {
    value: 'afternoon',
    label: 'Afternoon',
    emoji: '☀️',
  },
  {
    value: 'evening',
    label: 'Evening',
    emoji: '🌙',
  },
  {
    value: 'flexible',
    label: 'Flexible',
    emoji: '🔄',
  },
];

export default function Step10Screen() {
  const router = useRouter();
  const preferredTimeOfDay = useOnboardingStore((s) => s.preferredTimeOfDay);
  const setPreferredTimeOfDay = useOnboardingStore((s) => s.setPreferredTimeOfDay);
  const markStepComplete = useOnboardingStore((s) => s.markStepComplete);

  const handleContinue = () => {
    if (preferredTimeOfDay) {
      markStepComplete(10);
      router.push('/onboarding/step11');
    }
  };

  return (
    <OnboardingLayout
      currentStep={10}
      title="When do you focus best?"
      subtitle="We'll suggest optimal times for your focus sessions."
      onPrimaryPress={handleContinue}
      primaryButtonDisabled={!preferredTimeOfDay}
    >
      <ImageChoice
        options={timeOptions}
        value={preferredTimeOfDay}
        onChange={setPreferredTimeOfDay}
        columns={2}
      />
    </OnboardingLayout>
  );
}
