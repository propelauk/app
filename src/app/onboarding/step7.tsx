import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingLayout } from '@/components/onboarding';
import { useOnboardingStore, ThemePreference } from '@/lib/state/onboarding-store';
import { Sun, Moon, Smartphone } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { cn } from '@/lib/cn';

const themeOptions: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'auto', label: 'Auto', icon: Smartphone },
];

function ThemeCard({
  option,
  isSelected,
  onPress,
}: {
  option: (typeof themeOptions)[0];
  isSelected: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const Icon = option.icon;

  useEffect(() => {
    scale.value = isSelected ? withSpring(1.05) : withSpring(1);
  }, [isSelected]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.95);
      }}
      onPressOut={() => {
        scale.value = withSpring(isSelected ? 1.05 : 1);
      }}
      className="flex-1 mx-1.5"
    >
      <Animated.View
        style={animatedStyle}
        className={cn(
          'aspect-square rounded-2xl border-2 items-center justify-center',
          isSelected
            ? 'bg-teal-500/20 border-teal-400'
            : 'bg-neutral-800/50 border-neutral-700'
        )}
      >
        <View
          className={cn(
            'w-16 h-16 rounded-full items-center justify-center mb-3',
            isSelected ? 'bg-teal-500/30' : 'bg-neutral-700/50'
          )}
        >
          <Icon size={32} color={isSelected ? '#2dd4bf' : '#a3a3a3'} />
        </View>
        <Text
          className={cn(
            'text-base font-semibold',
            isSelected ? 'text-teal-300' : 'text-neutral-300'
          )}
        >
          {option.label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export default function Step7Screen() {
  const router = useRouter();
  const themePreference = useOnboardingStore((s) => s.themePreference);
  const setThemePreference = useOnboardingStore((s) => s.setThemePreference);
  const markStepComplete = useOnboardingStore((s) => s.markStepComplete);

  const handleContinue = () => {
    markStepComplete(7);
    router.push('/onboarding/step8');
  };

  return (
    <OnboardingLayout
      currentStep={7}
      title="Choose your visual theme"
      subtitle="Pick a theme that's easy on your eyes. You can change this later."
      onPrimaryPress={handleContinue}
    >
      <View className="flex-row -mx-1.5 mt-4">
        {themeOptions.map((option) => (
          <ThemeCard
            key={option.value}
            option={option}
            isSelected={themePreference === option.value}
            onPress={() => setThemePreference(option.value)}
          />
        ))}
      </View>

      {/* Preview */}
      <View className="mt-8">
        <Text className="text-neutral-400 text-sm mb-3 text-center">Preview</Text>
        <View
          className={cn(
            'rounded-2xl p-6 border',
            themePreference === 'light'
              ? 'bg-white border-neutral-200'
              : 'bg-neutral-800 border-neutral-700'
          )}
        >
          <View className="flex-row items-center mb-4">
            <View
              className={cn(
                'w-10 h-10 rounded-full mr-3',
                themePreference === 'light' ? 'bg-teal-100' : 'bg-teal-500/20'
              )}
            />
            <View className="flex-1">
              <View
                className={cn(
                  'h-3 w-24 rounded',
                  themePreference === 'light' ? 'bg-neutral-300' : 'bg-neutral-600'
                )}
              />
              <View
                className={cn(
                  'h-2 w-16 rounded mt-2',
                  themePreference === 'light' ? 'bg-neutral-200' : 'bg-neutral-700'
                )}
              />
            </View>
          </View>
          <View
            className={cn(
              'h-3 w-full rounded',
              themePreference === 'light' ? 'bg-neutral-200' : 'bg-neutral-700'
            )}
          />
          <View
            className={cn(
              'h-3 w-3/4 rounded mt-2',
              themePreference === 'light' ? 'bg-neutral-200' : 'bg-neutral-700'
            )}
          />
        </View>
      </View>
    </OnboardingLayout>
  );
}
