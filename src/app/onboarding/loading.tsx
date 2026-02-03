import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useOnboardingStore } from '@/lib/state/onboarding-store';
import { Sparkles, Users, Heart } from 'lucide-react-native';
import Animated, {
  FadeIn,
  FadeInUp,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  useSharedValue,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const loadingMessages = [
  { text: 'Personalizing your experience...', emoji: '✨' },
  { text: 'Setting up your focus zones...', emoji: '🎯' },
  { text: 'Calibrating productivity settings...', emoji: '⚙️' },
  { text: 'Preparing your dashboard...', emoji: '📊' },
  { text: 'Almost there...', emoji: '🚀' },
];

export default function LoadingScreen() {
  const router = useRouter();
  const firstName = useOnboardingStore((s) => s.firstName);
  const [messageIndex, setMessageIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const progressWidth = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    // Animate progress bar
    progressWidth.value = withTiming(100, {
      duration: 4000,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });

    // Pulse animation for icon
    pulseScale.value = withRepeat(
      withSequence(
        withSpring(1.1, { damping: 10 }),
        withSpring(1, { damping: 10 })
      ),
      -1,
      true
    );

    // Cycle through messages
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => {
        if (prev < loadingMessages.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 800);

    // Complete after loading
    const completeTimer = setTimeout(() => {
      setIsComplete(true);
      clearInterval(messageInterval);
    }, 4000);

    return () => {
      clearInterval(messageInterval);
      clearTimeout(completeTimer);
    };
  }, []);

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const animatedPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleContinue = () => {
    router.push('/onboarding/paywall');
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-900">
      <LinearGradient
        colors={['#171717', '#0f1419', '#171717']}
        style={{ flex: 1, justifyContent: 'center', padding: 24 }}
      >
        {!isComplete ? (
          // Loading State
          <View className="items-center">
            <Animated.View style={animatedPulseStyle}>
              <View className="w-32 h-32 rounded-full bg-teal-500/20 items-center justify-center border-2 border-teal-400/30">
                <Sparkles size={56} color="#2dd4bf" />
              </View>
            </Animated.View>

            <Animated.View entering={FadeIn.duration(500)} className="mt-8">
              <Text className="text-white text-2xl font-bold text-center">
                {loadingMessages[messageIndex].emoji}{' '}
                {loadingMessages[messageIndex].text}
              </Text>
            </Animated.View>

            {/* Progress Bar */}
            <View className="w-full mt-8">
              <View className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                <Animated.View
                  style={[
                    {
                      height: '100%',
                      backgroundColor: '#2dd4bf',
                      borderRadius: 9999,
                    },
                    animatedProgressStyle,
                  ]}
                />
              </View>
            </View>
          </View>
        ) : (
          // Complete State
          <View className="items-center">
            <Animated.View
              entering={FadeInUp.duration(600)}
              style={animatedPulseStyle}
            >
              <LinearGradient
                colors={['#0d9488', '#14b8a6', '#2dd4bf']}
                style={{
                  width: 128,
                  height: 128,
                  borderRadius: 64,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text className="text-6xl">🎉</Text>
              </LinearGradient>
            </Animated.View>

            <Animated.View entering={FadeInUp.duration(600).delay(200)} className="mt-8">
              <Text className="text-white text-3xl font-bold text-center">
                You've taken great steps{firstName ? `, ${firstName}` : ''}!
              </Text>
            </Animated.View>

            <Animated.View entering={FadeInUp.duration(600).delay(400)} className="mt-4">
              <Text className="text-neutral-400 text-lg text-center">
                Your personalized productivity partner is ready.
              </Text>
            </Animated.View>

            {/* Encouragement Cards */}
            <Animated.View
              entering={FadeInUp.duration(600).delay(600)}
              className="w-full mt-8"
            >
              <View className="bg-teal-500/10 border border-teal-400/30 rounded-2xl p-4 mb-3">
                <View className="flex-row items-center">
                  <Users size={24} color="#2dd4bf" />
                  <View className="ml-3 flex-1">
                    <Text className="text-teal-300 font-semibold">You are not alone</Text>
                    <Text className="text-neutral-400 text-sm mt-1">
                      Join thousands who've transformed their focus
                    </Text>
                  </View>
                </View>
              </View>

              <View className="bg-neutral-800/50 rounded-2xl p-4">
                <View className="flex-row items-center">
                  <Heart size={24} color="#f472b6" />
                  <View className="ml-3 flex-1">
                    <Text className="text-white font-semibold">Built for ADHD minds</Text>
                    <Text className="text-neutral-400 text-sm mt-1">
                      Every feature designed with you in mind
                    </Text>
                  </View>
                </View>
              </View>
            </Animated.View>

            {/* CTA Button */}
            <Animated.View
              entering={FadeInUp.duration(600).delay(800)}
              className="w-full mt-8"
            >
              <Pressable
                onPress={handleContinue}
                onPressIn={() => {
                  buttonScale.value = withSpring(0.97);
                }}
                onPressOut={() => {
                  buttonScale.value = withSpring(1);
                }}
              >
                <Animated.View
                  style={animatedButtonStyle}
                  className="bg-teal-500 py-4 rounded-2xl items-center"
                >
                  <Text className="text-neutral-900 text-lg font-semibold">
                    Let's lock it in! 🔒
                  </Text>
                </Animated.View>
              </Pressable>
            </Animated.View>
          </View>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}
