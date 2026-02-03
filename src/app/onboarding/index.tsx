import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Sparkles, ArrowRight } from 'lucide-react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

export default function WelcomeScreen() {
  const router = useRouter();
  const buttonScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.5);

  useEffect(() => {
    glowOpacity.value = withRepeat(
      withSequence(
        withSpring(1, { damping: 10 }),
        withSpring(0.5, { damping: 10 })
      ),
      -1,
      true
    );
  }, []);

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  return (
    <SafeAreaView className="flex-1 bg-neutral-900">
      <LinearGradient
        colors={['#171717', '#0f1419', '#171717']}
        style={{ flex: 1 }}
      >
        <View className="flex-1 px-6 justify-center">
          {/* Logo/Icon Section */}
          <Animated.View
            entering={FadeInDown.duration(800).delay(200)}
            className="items-center mb-12"
          >
            <Animated.View style={animatedGlowStyle}>
              <View className="w-28 h-28 rounded-full bg-teal-500/20 items-center justify-center border-2 border-teal-400/30">
                <Sparkles size={48} color="#2dd4bf" />
              </View>
            </Animated.View>
          </Animated.View>

          {/* Welcome Text */}
          <Animated.View entering={FadeInUp.duration(800).delay(400)}>
            <Text className="text-white text-4xl font-bold text-center leading-tight">
              Welcome to{'\n'}
              <Text className="text-teal-400">Propela</Text>
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(800).delay(600)}>
            <Text className="text-neutral-400 text-lg text-center mt-6 leading-relaxed px-4">
              Your personalized productivity partner designed for the way your mind actually works.
            </Text>
          </Animated.View>

          {/* Features Preview */}
          <Animated.View
            entering={FadeInUp.duration(800).delay(800)}
            className="mt-12 space-y-4"
          >
            {[
              { emoji: '🎯', text: 'Focus sessions tailored to you' },
              { emoji: '⚡', text: 'Smart breaks when you need them' },
              { emoji: '🏆', text: 'Celebrate every small win' },
            ].map((feature, index) => (
              <View
                key={index}
                className="flex-row items-center bg-neutral-800/50 rounded-2xl p-4 mb-3"
              >
                <Text className="text-2xl mr-4">{feature.emoji}</Text>
                <Text className="text-white text-base flex-1">{feature.text}</Text>
              </View>
            ))}
          </Animated.View>
        </View>

        {/* Bottom Buttons */}
        <View className="px-6 pb-6">
          <Animated.View entering={FadeInUp.duration(800).delay(1000)}>
            <Pressable
              onPress={() => router.push('/onboarding/step1')}
              onPressIn={() => {
                buttonScale.value = withSpring(0.97);
              }}
              onPressOut={() => {
                buttonScale.value = withSpring(1);
              }}
            >
              <Animated.View
                style={animatedButtonStyle}
                className="bg-teal-500 py-4 rounded-2xl flex-row items-center justify-center"
              >
                <Text className="text-neutral-900 text-lg font-semibold mr-2">
                  Get Started
                </Text>
                <ArrowRight size={20} color="#171717" />
              </Animated.View>
            </Pressable>
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(800).delay(1200)}>
            <Pressable
              onPress={() => router.push('/onboarding/login')}
              className="py-4 items-center mt-2"
            >
              <Text className="text-neutral-400 text-base">
                I have an account
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}
