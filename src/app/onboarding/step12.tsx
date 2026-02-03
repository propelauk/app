import { useRouter } from 'expo-router';
import { OnboardingLayout, RadioInput } from '@/components/onboarding';
import { useOnboardingStore, GoalType } from '@/lib/state/onboarding-store';

const goalOptions: { value: GoalType; label: string; description: string; emoji: string }[] = [
  {
    value: 'short-term',
    label: 'Short-Term Goals',
    description: 'Daily tasks, weekly projects, quick wins',
    emoji: '🎯',
  },
  {
    value: 'long-term',
    label: 'Long-Term Goals',
    description: 'Big projects, career goals, learning new skills',
    emoji: '🏔️',
  },
  {
    value: 'both',
    label: 'Both',
    description: 'I juggle daily tasks while working toward bigger goals',
    emoji: '⚖️',
  },
];

export default function Step12Screen() {
  const router = useRouter();
  const goalType = useOnboardingStore((s) => s.goalType);
  const setGoalType = useOnboardingStore((s) => s.setGoalType);
  const markStepComplete = useOnboardingStore((s) => s.markStepComplete);

  const handleContinue = () => {
    if (goalType) {
      markStepComplete(12);
      router.push('/onboarding/step13');
    }
  };

  return (
    <OnboardingLayout
      currentStep={12}
      title="What type of goals are you working on?"
      subtitle="This helps us organize your projects and milestones."
      onPrimaryPress={handleContinue}
      primaryButtonDisabled={!goalType}
    >
      <RadioInput
        options={goalOptions}
        value={goalType}
        onChange={setGoalType}
      />
    </OnboardingLayout>
  );
}
