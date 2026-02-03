import { useRouter } from 'expo-router';
import { OnboardingLayout, SliderInput } from '@/components/onboarding';
import { useOnboardingStore } from '@/lib/state/onboarding-store';

export default function Step2Screen() {
  const router = useRouter();
  const focusDuration = useOnboardingStore((s) => s.focusDuration);
  const setFocusDuration = useOnboardingStore((s) => s.setFocusDuration);
  const markStepComplete = useOnboardingStore((s) => s.markStepComplete);
  const focusStruggle = useOnboardingStore((s) => s.focusStruggle);

  const handleContinue = () => {
    markStepComplete(2);
    router.push('/onboarding/step3');
  };

  // Dynamic subtitle based on previous answer
  const getSubtitle = () => {
    if (focusStruggle === 'distractions') {
      return "Shorter sessions can help you stay engaged. Let's find your sweet spot.";
    } else if (focusStruggle === 'overwhelm') {
      return 'Breaking work into timed sessions makes big tasks feel manageable.';
    } else if (focusStruggle === 'procrastination') {
      return 'A defined time limit makes starting easier—you only need to focus for this long!';
    }
    return 'Choose a focus duration that feels achievable for you.';
  };

  return (
    <OnboardingLayout
      currentStep={2}
      title="How long can you focus?"
      subtitle={getSubtitle()}
      onPrimaryPress={handleContinue}
    >
      <SliderInput
        value={focusDuration}
        onChange={setFocusDuration}
        min={10}
        max={60}
        step={5}
        unit="minutes"
        markers={[10, 25, 45, 60]}
      />
    </OnboardingLayout>
  );
}
