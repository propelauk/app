import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingLayout } from '@/components/onboarding';
import { useOnboardingStore } from '@/lib/state/onboarding-store';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { cn } from '@/lib/cn';

const quizQuestions = [
  {
    id: 'currentProductivity',
    question: 'How productive do you feel currently?',
    labels: ['Not at all', 'Slightly', 'Moderate', 'Very', 'Extremely'],
  },
  {
    id: 'consistencyLevel',
    question: 'How consistent are you with focus work?',
    labels: ['Rarely', 'Sometimes', 'Often', 'Usually', 'Always'],
  },
  {
    id: 'distractionFrequency',
    question: 'How often do distractions pull you away?',
    labels: ['Rarely', 'Sometimes', 'Often', 'Usually', 'Always'],
  },
] as const;

function ScaleInput({
  value,
  onChange,
  labels,
}: {
  value: number;
  onChange: (value: number) => void;
  labels: readonly string[];
}) {
  return (
    <View className="mt-4">
      <View className="flex-row justify-between mb-2">
        {[1, 2, 3, 4, 5].map((num) => {
          const isSelected = value === num;
          const scale = useSharedValue(1);

          const animatedStyle = useAnimatedStyle(() => ({
            transform: [{ scale: scale.value }],
          }));

          return (
            <Pressable
              key={num}
              onPress={() => onChange(num)}
              onPressIn={() => {
                scale.value = withSpring(0.9);
              }}
              onPressOut={() => {
                scale.value = withSpring(1);
              }}
            >
              <Animated.View
                style={animatedStyle}
                className={cn(
                  'w-12 h-12 rounded-full items-center justify-center border-2',
                  isSelected
                    ? 'bg-teal-500 border-teal-400'
                    : 'bg-neutral-800 border-neutral-600'
                )}
              >
                <Text
                  className={cn(
                    'font-bold text-lg',
                    isSelected ? 'text-neutral-900' : 'text-neutral-300'
                  )}
                >
                  {num}
                </Text>
              </Animated.View>
            </Pressable>
          );
        })}
      </View>
      <View className="flex-row justify-between mt-1">
        <Text className="text-neutral-500 text-xs">{labels[0]}</Text>
        <Text className="text-neutral-500 text-xs">{labels[4]}</Text>
      </View>
    </View>
  );
}

export default function Step13Screen() {
  const router = useRouter();
  const quizAnswers = useOnboardingStore((s) => s.quizAnswers);
  const setQuizAnswers = useOnboardingStore((s) => s.setQuizAnswers);
  const markStepComplete = useOnboardingStore((s) => s.markStepComplete);

  const handleContinue = () => {
    markStepComplete(13);
    router.push('/onboarding/step14');
  };

  return (
    <OnboardingLayout
      currentStep={13}
      title="Quick productivity check"
      subtitle="Be honest—this helps us understand where you're starting from."
      onPrimaryPress={handleContinue}
    >
      {quizQuestions.map((q, index) => (
        <View key={q.id} className={index > 0 ? 'mt-8' : ''}>
          <Text className="text-white text-base font-medium">{q.question}</Text>
          <ScaleInput
            value={quizAnswers[q.id]}
            onChange={(value) => setQuizAnswers({ [q.id]: value })}
            labels={q.labels}
          />
        </View>
      ))}
    </OnboardingLayout>
  );
}
