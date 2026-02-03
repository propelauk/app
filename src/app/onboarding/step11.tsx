import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingLayout, SliderInput } from '@/components/onboarding';
import { useOnboardingStore } from '@/lib/state/onboarding-store';
import { Flame } from 'lucide-react-native';

export default function Step11Screen() {
  const router = useRouter();
  const streakCommitment = useOnboardingStore((s) => s.streakCommitment);
  const setStreakCommitment = useOnboardingStore((s) => s.setStreakCommitment);
  const markStepComplete = useOnboardingStore((s) => s.markStepComplete);

  const handleContinue = () => {
    markStepComplete(11);
    router.push('/onboarding/step12');
  };

  const getCommitmentMessage = () => {
    if (streakCommitment <= 2) {
      return "Starting slow is smart! You can always increase later.";
    } else if (streakCommitment <= 4) {
      return "A balanced approach—you've got this!";
    } else if (streakCommitment <= 5) {
      return "Weekday warrior! Taking weekends off can help you recharge.";
    } else {
      return "Impressive commitment! Remember: rest days help too.";
    }
  };

  const getDayLabels = () => {
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    return days;
  };

  return (
    <OnboardingLayout
      currentStep={11}
      title="How many days per week?"
      subtitle="Set a realistic streak goal you can maintain."
      onPrimaryPress={handleContinue}
    >
      <SliderInput
        value={streakCommitment}
        onChange={setStreakCommitment}
        min={1}
        max={7}
        step={1}
        unit="days/week"
        markers={[1, 3, 5, 7]}
      />

      {/* Visual Calendar Preview */}
      <View className="mt-6">
        <Text className="text-neutral-400 text-sm mb-3 text-center">Your week</Text>
        <View className="flex-row justify-between px-4">
          {getDayLabels().map((day, index) => (
            <View
              key={index}
              className={`w-10 h-10 rounded-full items-center justify-center ${
                index < streakCommitment
                  ? 'bg-teal-500'
                  : 'bg-neutral-800 border border-neutral-700'
              }`}
            >
              <Text
                className={`font-semibold ${
                  index < streakCommitment ? 'text-neutral-900' : 'text-neutral-500'
                }`}
              >
                {day}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Streak Preview */}
      <View className="bg-teal-500/10 border border-teal-400/30 rounded-2xl p-4 mt-6">
        <View className="flex-row items-center mb-2">
          <Flame size={20} color="#f97316" />
          <Text className="text-teal-400 font-semibold text-base ml-2">
            {streakCommitment}-day streak goal
          </Text>
        </View>
        <Text className="text-neutral-300">
          {getCommitmentMessage()}
        </Text>
      </View>
    </OnboardingLayout>
  );
}
