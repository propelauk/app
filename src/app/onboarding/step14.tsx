import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingLayout } from '@/components/onboarding';
import { useOnboardingStore, getProductivityScore } from '@/lib/state/onboarding-store';
import { TrendingUp, Target, Zap, Award } from 'lucide-react-native';
import Animated, {
  FadeInUp,
  FadeInDown,
  useAnimatedStyle,
  withTiming,
  useSharedValue,
  Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

export default function Step14Screen() {
  const router = useRouter();
  const markStepComplete = useOnboardingStore((s) => s.markStepComplete);
  
  // Get user data for personalization
  const quizAnswers = useOnboardingStore((s) => s.quizAnswers);
  const focusStruggle = useOnboardingStore((s) => s.focusStruggle);
  const motivationType = useOnboardingStore((s) => s.motivationType);
  const focusDuration = useOnboardingStore((s) => s.focusDuration);
  const streakCommitment = useOnboardingStore((s) => s.streakCommitment);

  const productivityScore = getProductivityScore(quizAnswers);
  const scoreProgress = useSharedValue(0);

  useEffect(() => {
    scoreProgress.value = withTiming(productivityScore / 100, {
      duration: 1500,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [productivityScore]);

  const animatedScoreStyle = useAnimatedStyle(() => ({
    width: `${scoreProgress.value * 100}%`,
  }));

  const handleContinue = () => {
    markStepComplete(14);
    router.push('/onboarding/step15');
  };

  const getPersonalizedPrediction = () => {
    const weeklyMinutes = focusDuration * streakCommitment * 2; // Assume 2 sessions per day
    const weeklyHours = Math.round(weeklyMinutes / 60);
    
    if (focusStruggle === 'distractions') {
      return `With distraction-free sessions, you could reclaim ${weeklyHours}+ hours of productive time every week.`;
    } else if (focusStruggle === 'overwhelm') {
      return `Breaking tasks into ${focusDuration}-minute chunks means less stress and ${weeklyHours}+ hours of actual progress weekly.`;
    } else if (focusStruggle === 'procrastination') {
      return `Starting is the hardest part. Your ${focusDuration}-minute sessions make it easy—${weeklyHours}+ focused hours await!`;
    }
    return `You're set for ${weeklyHours}+ hours of focused work every week!`;
  };

  const getMotivationTip = () => {
    if (motivationType === 'rewards') {
      return "Unlock badges and rewards as you build your streak! 🏆";
    } else if (motivationType === 'deadlines') {
      return "We'll help you hit every deadline with smart reminders! ⏰";
    } else if (motivationType === 'accountability') {
      return "Track your progress and see how far you've come! 📊";
    } else if (motivationType === 'progress') {
      return "Watch your productivity graph climb higher each week! 📈";
    }
    return "Your personalized journey begins now!";
  };

  return (
    <OnboardingLayout
      currentStep={14}
      title="Your productivity preview"
      subtitle="Here's what we've learned about you."
      onPrimaryPress={handleContinue}
      primaryButtonText="Almost Done!"
    >
      <View className="flex-1">
        {/* Score Card */}
        <Animated.View entering={FadeInUp.duration(600).delay(200)}>
          <LinearGradient
            colors={['#0d9488', '#14b8a6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 24, padding: 1 }}
          >
            <View className="bg-neutral-900 rounded-3xl p-6">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-white text-lg font-semibold">
                  Current Score
                </Text>
                <View className="flex-row items-center">
                  <TrendingUp size={20} color="#2dd4bf" />
                  <Text className="text-teal-400 font-bold text-2xl ml-2">
                    {productivityScore}%
                  </Text>
                </View>
              </View>
              
              <View className="h-3 bg-neutral-800 rounded-full overflow-hidden">
                <Animated.View
                  style={[
                    {
                      height: '100%',
                      backgroundColor: '#2dd4bf',
                      borderRadius: 9999,
                    },
                    animatedScoreStyle,
                  ]}
                />
              </View>
              
              <Text className="text-neutral-400 text-sm mt-3">
                {productivityScore < 40
                  ? "Don't worry—this is your starting point. We'll help you grow!"
                  : productivityScore < 70
                  ? "Great foundation! Let's build on what's working."
                  : "You're already doing well! Time to optimize further."}
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Prediction */}
        <Animated.View 
          entering={FadeInDown.duration(600).delay(400)}
          className="mt-4"
        >
          <View className="bg-neutral-800/50 rounded-2xl p-4 border border-neutral-700">
            <View className="flex-row items-center mb-3">
              <Zap size={20} color="#fbbf24" />
              <Text className="text-white font-semibold ml-2">Your Potential</Text>
            </View>
            <Text className="text-neutral-300 leading-relaxed">
              {getPersonalizedPrediction()}
            </Text>
          </View>
        </Animated.View>

        {/* Motivation Tip */}
        <Animated.View 
          entering={FadeInDown.duration(600).delay(600)}
          className="mt-4"
        >
          <View className="bg-teal-500/10 border border-teal-400/30 rounded-2xl p-4">
            <View className="flex-row items-center mb-2">
              <Award size={20} color="#2dd4bf" />
              <Text className="text-teal-400 font-semibold ml-2">Personalized for You</Text>
            </View>
            <Text className="text-neutral-300">
              {getMotivationTip()}
            </Text>
          </View>
        </Animated.View>

        {/* CTA Preview */}
        <Animated.View 
          entering={FadeInUp.duration(600).delay(800)}
          className="mt-6 items-center"
        >
          <Text className="text-neutral-500 text-sm">
            Just a few more details and you're ready to go! 🚀
          </Text>
        </Animated.View>
      </View>
    </OnboardingLayout>
  );
}
