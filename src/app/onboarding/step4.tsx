import { useRouter } from 'expo-router';
import { OnboardingLayout, RadioInput } from '@/components/onboarding';
import { useOnboardingStore } from '@/lib/state/onboarding-store';

const workContextOptions = [
  {
    value: 'student',
    label: 'Student',
    description: 'Studying, homework, exam prep',
    emoji: '📚',
  },
  {
    value: 'remote-work',
    label: 'Remote Work',
    description: 'Working from home or coffee shops',
    emoji: '💻',
  },
  {
    value: 'office',
    label: 'Office Work',
    description: 'In-person workplace environment',
    emoji: '🏢',
  },
  {
    value: 'creative',
    label: 'Creative Work',
    description: 'Art, writing, design, music',
    emoji: '🎨',
  },
  {
    value: 'entrepreneur',
    label: 'Entrepreneur',
    description: 'Running my own business or projects',
    emoji: '🚀',
  },
  {
    value: 'personal',
    label: 'Personal Projects',
    description: 'Hobbies, side projects, learning new skills',
    emoji: '🌱',
  },
];

export default function Step4Screen() {
  const router = useRouter();
  const workContext = useOnboardingStore((s) => s.workContext);
  const setWorkContext = useOnboardingStore((s) => s.setWorkContext);
  const markStepComplete = useOnboardingStore((s) => s.markStepComplete);

  const handleContinue = () => {
    if (workContext) {
      markStepComplete(4);
      router.push('/onboarding/step5');
    }
  };

  return (
    <OnboardingLayout
      currentStep={4}
      title="What type of work do you do?"
      subtitle="This helps us tailor suggestions and break activities."
      onPrimaryPress={handleContinue}
      primaryButtonDisabled={!workContext}
    >
      <RadioInput
        options={workContextOptions}
        value={workContext}
        onChange={setWorkContext}
      />
    </OnboardingLayout>
  );
}
