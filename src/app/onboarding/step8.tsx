import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingLayout } from '@/components/onboarding';
import { useOnboardingStore, getMotivationalMessage } from '@/lib/state/onboarding-store';
import { Sparkles, Heart, Zap, Target } from 'lucide-react-native';
import Animated, {
  FadeInUp,
  FadeInDown,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

export default function Step8Screen() {
  const router = useRouter();
  const markStepComplete = useOnboardingStore((s) => s.markStepComplete);
  
  // Get state for personalized message
  const focusStruggle = useOnboardingStore((s) => s.focusStruggle);
  const motivationType = useOnboardingStore((s) => s.motivationType);
  const taskStyle = useOnboardingStore((s) => s.taskStyle);
  const focusDuration = useOnboardingStore((s) => s.focusDuration);

  const pulseScale = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withSpring(1.05, { damping: 10 }),
        withSpring(1, { damping: 10 })
      ),
      -1,
      true
    );
  }, []);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const handleContinue = () => {
    markStepComplete(8);
    router.push('/onboarding/step9');
  };

  const getPersonalizedMessage = () => {
    const messages = [];
    
    if (focusStruggle === 'distractions') {
      messages.push("We'll create a distraction-free zone just for you.");
    } else if (focusStruggle === 'overwhelm') {
      messages.push("We'll help break everything into bite-sized pieces.");
    } else if (focusStruggle === 'procrastination') {
      messages.push("We'll make starting feel effortless.");
    }
    
    if (motivationType === 'rewards') {
      messages.push('Every session earns you rewards! 🏆');
    } else if (motivationType === 'progress') {
      messages.push("You'll see your progress grow every day! 📈");
    }

    return messages.join(' ');
  };

  return (
    <OnboardingLayout
      currentStep={8}
      title="You're doing amazing!"
      subtitle="Let's keep going—we're almost there."
      onPrimaryPress={handleContinue}
      primaryButtonText="Keep Going"
    >
      <View className="flex-1 justify-center">
        {/* Motivational Card */}
        <Animated.View entering={FadeInUp.duration(600).delay(200)}>
          <LinearGradient
            colors={['#0d9488', '#14b8a6', '#2dd4bf']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 24, padding: 2 }}
          >
            <View className="bg-neutral-900 rounded-3xl p-6">
              <Animated.View style={animatedIconStyle} className="items-center mb-4">
                <View className="w-20 h-20 rounded-full bg-teal-500/20 items-center justify-center">
                  <Sparkles size={40} color="#2dd4bf" />
                </View>
              </Animated.View>
              
              <Text className="text-white text-xl font-bold text-center mb-3">
                Your Personalized Plan
              </Text>
              
              <Text className="text-neutral-300 text-center text-base leading-relaxed">
                {getPersonalizedMessage()}
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Stats Preview */}
        <Animated.View 
          entering={FadeInDown.duration(600).delay(400)}
          className="flex-row mt-6 -mx-1.5"
        >
          {[
            { icon: Target, label: 'Focus', value: `${focusDuration}min` },
            { icon: Zap, label: 'Style', value: taskStyle === 'small-tasks' ? 'Tasks' : taskStyle === 'single-focus' ? 'Deep' : 'Mixed' },
            { icon: Heart, label: 'Drive', value: motivationType?.slice(0, 6) ?? 'Set' },
          ].map((stat, index) => (
            <View key={index} className="flex-1 mx-1.5">
              <View className="bg-neutral-800/50 rounded-2xl p-4 items-center">
                <stat.icon size={24} color="#2dd4bf" />
                <Text className="text-teal-400 font-bold text-lg mt-2">{stat.value}</Text>
                <Text className="text-neutral-400 text-xs mt-1">{stat.label}</Text>
              </View>
            </View>
          ))}
        </Animated.View>

        {/* Encouragement */}
        <Animated.View 
          entering={FadeInUp.duration(600).delay(600)}
          className="mt-6"
        >
          <View className="bg-teal-500/10 border border-teal-400/30 rounded-2xl p-4">
            <Text className="text-teal-300 text-center">
              ✨ You've already made great choices. A few more steps and you'll be ready to focus like never before!
            </Text>
          </View>
        </Animated.View>
      </View>
    </OnboardingLayout>
  );
}
