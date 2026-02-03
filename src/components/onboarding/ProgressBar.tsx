import { View, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const progress = currentStep / totalSteps;

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${withSpring(progress * 100, { damping: 15, stiffness: 100 })}%`,
    };
  });

  return (
    <View className="px-6 pt-4 pb-2">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-neutral-400 text-sm font-medium">
          Step {currentStep} of {totalSteps}
        </Text>
        <Text className="text-teal-400 text-sm font-semibold">
          {Math.round(progress * 100)}%
        </Text>
      </View>
      <View className="h-2 bg-neutral-800 rounded-full overflow-hidden">
        <Animated.View
          style={[
            {
              height: '100%',
              backgroundColor: '#2dd4bf',
              borderRadius: 9999,
            },
            animatedStyle,
          ]}
        />
      </View>
    </View>
  );
}
