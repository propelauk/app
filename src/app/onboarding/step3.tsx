import { useRouter } from 'expo-router';
import { OnboardingLayout, SliderInput } from '@/components/onboarding';
import { useOnboardingStore } from '@/lib/state/onboarding-store';
import { View, Text } from 'react-native';

export default function Step3Screen() {
  const router = useRouter();
  const breakDuration = useOnboardingStore((s) => s.breakDuration);
  const setBreakDuration = useOnboardingStore((s) => s.setBreakDuration);
  const focusDuration = useOnboardingStore((s) => s.focusDuration);
  const markStepComplete = useOnboardingStore((s) => s.markStepComplete);

  const handleContinue = () => {
    markStepComplete(3);
    router.push('/onboarding/step4');
  };

  // Suggest break based on focus duration
  const suggestedBreak = focusDuration <= 25 ? 5 : focusDuration <= 45 ? 10 : 15;

  return (
    <OnboardingLayout
      currentStep={3}
      title="How long should your breaks be?"
      subtitle="Regular breaks help maintain focus and prevent burnout."
      onPrimaryPress={handleContinue}
    >
      <SliderInput
        value={breakDuration}
        onChange={setBreakDuration}
        min={3}
        max={20}
        step={1}
        unit="minutes"
        markers={[3, 5, 10, 15, 20]}
      />

      {/* Suggestion Card */}
      <View className="bg-teal-500/10 border border-teal-400/30 rounded-2xl p-4 mt-6">
        <Text className="text-teal-400 font-semibold text-base">
          💡 Recommendation
        </Text>
        <Text className="text-neutral-300 mt-2">
          Based on your {focusDuration}-minute focus sessions, we suggest{' '}
          <Text className="text-teal-300 font-semibold">{suggestedBreak}-minute breaks</Text>.
        </Text>
      </View>
    </OnboardingLayout>
  );
}
