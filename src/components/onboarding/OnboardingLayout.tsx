import { View, Text, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { ProgressBar } from './ProgressBar';
import { ReactNode } from 'react';

interface OnboardingLayoutProps {
  children: ReactNode;
  currentStep: number;
  totalSteps?: number;
  title: string;
  subtitle?: string;
  showProgress?: boolean;
  showBackButton?: boolean;
  primaryButtonText?: string;
  primaryButtonDisabled?: boolean;
  onPrimaryPress?: () => void;
  secondaryButtonText?: string;
  onSecondaryPress?: () => void;
  keyboardAware?: boolean;
}

export function OnboardingLayout({
  children,
  currentStep,
  totalSteps = 17,
  title,
  subtitle,
  showProgress = true,
  showBackButton = true,
  primaryButtonText = 'Continue',
  primaryButtonDisabled = false,
  onPrimaryPress,
  secondaryButtonText,
  onSecondaryPress,
  keyboardAware = false,
}: OnboardingLayoutProps) {
  const router = useRouter();
  const buttonScale = useSharedValue(1);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const content = (
    <>
      {/* Header */}
      <View className="px-4">
        {showBackButton && currentStep > 0 && (
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-neutral-800 items-center justify-center mb-4"
          >
            <ChevronLeft size={24} color="#fff" />
          </Pressable>
        )}

        {showProgress && currentStep > 0 && (
          <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
        )}
      </View>

      {/* Title Section */}
      <Animated.View
        entering={FadeInUp.duration(500).delay(100)}
        className="px-6 pt-6 pb-4"
      >
        <Text className="text-white text-3xl font-bold leading-tight">
          {title}
        </Text>
        {subtitle && (
          <Text className="text-neutral-400 text-lg mt-2 leading-relaxed">
            {subtitle}
          </Text>
        )}
      </Animated.View>

      {/* Content */}
      <Animated.View
        entering={FadeInDown.duration(500).delay(200)}
        className="flex-1 px-6"
      >
        {children}
      </Animated.View>

      {/* Footer Buttons */}
      <View className="px-6 pb-6 pt-4">
        {onPrimaryPress && (
          <Pressable
            onPress={onPrimaryPress}
            disabled={primaryButtonDisabled}
            onPressIn={() => {
              buttonScale.value = withSpring(0.97);
            }}
            onPressOut={() => {
              buttonScale.value = withSpring(1);
            }}
          >
            <Animated.View
              style={animatedButtonStyle}
              className={`py-4 rounded-2xl items-center ${
                primaryButtonDisabled
                  ? 'bg-neutral-700'
                  : 'bg-teal-500'
              }`}
            >
              <Text
                className={`text-lg font-semibold ${
                  primaryButtonDisabled ? 'text-neutral-400' : 'text-neutral-900'
                }`}
              >
                {primaryButtonText}
              </Text>
            </Animated.View>
          </Pressable>
        )}

        {secondaryButtonText && onSecondaryPress && (
          <Pressable
            onPress={onSecondaryPress}
            className="py-4 items-center mt-2"
          >
            <Text className="text-neutral-400 text-base">
              {secondaryButtonText}
            </Text>
          </Pressable>
        )}
      </View>
    </>
  );

  if (keyboardAware) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-900" edges={['top']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {content}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-900" edges={['top']}>
      {content}
    </SafeAreaView>
  );
}
