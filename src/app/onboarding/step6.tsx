import { useRouter } from 'expo-router';
import { OnboardingLayout, RadioInput } from '@/components/onboarding';
import { useOnboardingStore, TaskStyle } from '@/lib/state/onboarding-store';

const taskStyleOptions: { value: TaskStyle; label: string; description: string; emoji: string }[] = [
  {
    value: 'small-tasks',
    label: 'Many Small Tasks',
    description: 'I like breaking things into tiny, checkable steps',
    emoji: '✅',
  },
  {
    value: 'single-focus',
    label: 'Single Deep Focus',
    description: 'I prefer diving deep into one thing at a time',
    emoji: '🎯',
  },
  {
    value: 'mixed',
    label: 'Mix of Both',
    description: 'It depends on what I\'m working on',
    emoji: '🔀',
  },
];

export default function Step6Screen() {
  const router = useRouter();
  const taskStyle = useOnboardingStore((s) => s.taskStyle);
  const setTaskStyle = useOnboardingStore((s) => s.setTaskStyle);
  const markStepComplete = useOnboardingStore((s) => s.markStepComplete);

  const handleContinue = () => {
    if (taskStyle) {
      markStepComplete(6);
      router.push('/onboarding/step7');
    }
  };

  return (
    <OnboardingLayout
      currentStep={6}
      title="How do you prefer to work?"
      subtitle="This helps us structure your task lists and focus sessions."
      onPrimaryPress={handleContinue}
      primaryButtonDisabled={!taskStyle}
    >
      <RadioInput
        options={taskStyleOptions}
        value={taskStyle}
        onChange={setTaskStyle}
      />
    </OnboardingLayout>
  );
}
