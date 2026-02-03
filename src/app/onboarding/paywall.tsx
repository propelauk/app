import { View, Text, Pressable, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useOnboardingStore, PlanType, BillingCycle } from '@/lib/state/onboarding-store';
import { Check, X, Sparkles, Crown, Zap } from 'lucide-react-native';
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { cn } from '@/lib/cn';

interface Plan {
  id: PlanType;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  description: string;
  features: { text: string; included: boolean }[];
  icon: typeof Zap;
  popular?: boolean;
  gradient: readonly [string, string];
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: 'Get started with basic features',
    icon: Zap,
    gradient: ['#404040', '#525252'],
    features: [
      { text: '1 active project', included: true },
      { text: 'Basic focus timer', included: true },
      { text: 'Daily progress tracking', included: true },
      { text: 'Unlimited projects', included: false },
      { text: 'Advanced analytics', included: false },
      { text: 'Custom themes', included: false },
      { text: 'Priority support', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 9.99,
    yearlyPrice: 79.99,
    description: 'Everything you need to stay focused',
    icon: Crown,
    popular: true,
    gradient: ['#0d9488', '#14b8a6'],
    features: [
      { text: '5 active projects', included: true },
      { text: 'Advanced focus timer', included: true },
      { text: 'Detailed analytics', included: true },
      { text: 'Custom themes', included: true },
      { text: 'Streak protection (1/month)', included: true },
      { text: 'Unlimited projects', included: false },
      { text: 'Priority support', included: false },
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    monthlyPrice: 14.99,
    yearlyPrice: 119.99,
    description: 'Full access to everything',
    icon: Sparkles,
    gradient: ['#7c3aed', '#a855f7'],
    features: [
      { text: 'Unlimited projects', included: true },
      { text: 'Advanced focus timer', included: true },
      { text: 'Detailed analytics', included: true },
      { text: 'Custom themes', included: true },
      { text: 'Streak protection (3/month)', included: true },
      { text: 'AI-powered insights', included: true },
      { text: 'Priority support', included: true },
    ],
  },
];

function PlanCard({
  plan,
  isSelected,
  billingCycle,
  onSelect,
}: {
  plan: Plan;
  isSelected: boolean;
  billingCycle: BillingCycle;
  onSelect: () => void;
}) {
  const scale = useSharedValue(1);
  const Icon = plan.icon;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const price = billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
  const monthlyEquivalent =
    billingCycle === 'yearly' && plan.yearlyPrice > 0
      ? (plan.yearlyPrice / 12).toFixed(2)
      : null;

  return (
    <Pressable
      onPress={onSelect}
      onPressIn={() => {
        scale.value = withSpring(0.98);
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}
    >
      <Animated.View style={animatedStyle}>
        {plan.popular && (
          <View className="bg-teal-500 py-1 px-3 rounded-t-xl self-center -mb-1 z-10">
            <Text className="text-neutral-900 text-xs font-bold">MOST POPULAR</Text>
          </View>
        )}
        <LinearGradient
          colors={isSelected ? plan.gradient : ['#262626', '#262626']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 20,
            padding: isSelected ? 2 : 1,
          }}
        >
          <View
            className={cn(
              'bg-neutral-900 rounded-2xl p-4',
              isSelected && 'bg-neutral-900/95'
            )}
          >
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <View
                  className={cn(
                    'w-10 h-10 rounded-full items-center justify-center',
                    isSelected ? 'bg-teal-500/20' : 'bg-neutral-800'
                  )}
                >
                  <Icon size={20} color={isSelected ? '#2dd4bf' : '#a3a3a3'} />
                </View>
                <View className="ml-3">
                  <Text
                    className={cn(
                      'text-lg font-bold',
                      isSelected ? 'text-teal-300' : 'text-white'
                    )}
                  >
                    {plan.name}
                  </Text>
                </View>
              </View>

              {/* Selection indicator */}
              <View
                className={cn(
                  'w-6 h-6 rounded-full border-2 items-center justify-center',
                  isSelected
                    ? 'border-teal-400 bg-teal-400'
                    : 'border-neutral-500'
                )}
              >
                {isSelected && <Check size={14} color="#171717" strokeWidth={3} />}
              </View>
            </View>

            <Text className="text-neutral-400 text-sm mb-3">{plan.description}</Text>

            {/* Price */}
            <View className="mb-4">
              {price === 0 ? (
                <Text className="text-white text-2xl font-bold">Free</Text>
              ) : (
                <View className="flex-row items-baseline">
                  <Text className="text-white text-2xl font-bold">
                    ${price.toFixed(2)}
                  </Text>
                  <Text className="text-neutral-400 text-sm ml-1">
                    /{billingCycle === 'yearly' ? 'year' : 'month'}
                  </Text>
                </View>
              )}
              {monthlyEquivalent && (
                <Text className="text-teal-400 text-sm mt-1">
                  ${monthlyEquivalent}/month billed yearly
                </Text>
              )}
            </View>

            {/* Features */}
            <View className="space-y-2">
              {plan.features.slice(0, 4).map((feature, index) => (
                <View key={index} className="flex-row items-center mb-1">
                  {feature.included ? (
                    <Check size={16} color="#2dd4bf" />
                  ) : (
                    <X size={16} color="#525252" />
                  )}
                  <Text
                    className={cn(
                      'text-sm ml-2',
                      feature.included ? 'text-neutral-300' : 'text-neutral-500'
                    )}
                  >
                    {feature.text}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

export default function PaywallScreen() {
  const router = useRouter();
  const selectedPlan = useOnboardingStore((s) => s.selectedPlan);
  const billingCycle = useOnboardingStore((s) => s.billingCycle);
  const setSelectedPlan = useOnboardingStore((s) => s.setSelectedPlan);
  const setBillingCycle = useOnboardingStore((s) => s.setBillingCycle);
  const completeOnboarding = useOnboardingStore((s) => s.completeOnboarding);

  const buttonScale = useSharedValue(1);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleContinue = () => {
    // Don't complete onboarding yet - profile picture is next
    router.push('/onboarding/profile-picture');
  };

  const getButtonText = () => {
    if (selectedPlan === 'free') {
      return 'Continue with Free';
    }
    const plan = plans.find((p) => p.id === selectedPlan);
    const price =
      billingCycle === 'yearly' ? plan?.yearlyPrice : plan?.monthlyPrice;
    return `Subscribe for $${price?.toFixed(2)}/${billingCycle === 'yearly' ? 'year' : 'month'}`;
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-900">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View
          entering={FadeInUp.duration(500)}
          className="px-6 pt-6 pb-4"
        >
          <Text className="text-white text-3xl font-bold text-center">
            Choose your plan
          </Text>
          <Text className="text-neutral-400 text-base text-center mt-2">
            Start free or unlock premium features
          </Text>
        </Animated.View>

        {/* Billing Toggle */}
        <Animated.View
          entering={FadeInUp.duration(500).delay(100)}
          className="px-6 mb-6"
        >
          <View className="bg-neutral-800/50 rounded-2xl p-4 flex-row items-center justify-between">
            <Text className="text-white font-medium">Bill yearly</Text>
            <View className="flex-row items-center">
              <Text className="text-teal-400 text-sm mr-3">Save up to 33%</Text>
              <Switch
                value={billingCycle === 'yearly'}
                onValueChange={(value) =>
                  setBillingCycle(value ? 'yearly' : 'monthly')
                }
                trackColor={{ false: '#404040', true: '#0d9488' }}
                thumbColor={billingCycle === 'yearly' ? '#2dd4bf' : '#a3a3a3'}
              />
            </View>
          </View>
        </Animated.View>

        {/* Plans */}
        <View className="px-6 space-y-4">
          {plans.map((plan, index) => (
            <Animated.View
              key={plan.id}
              entering={FadeInUp.duration(500).delay(200 + index * 100)}
              className="mb-4"
            >
              <PlanCard
                plan={plan}
                isSelected={selectedPlan === plan.id}
                billingCycle={billingCycle}
                onSelect={() => setSelectedPlan(plan.id)}
              />
            </Animated.View>
          ))}
        </View>

        {/* Money back guarantee */}
        <Animated.View
          entering={FadeInUp.duration(500).delay(600)}
          className="px-6 mt-4"
        >
          <View className="bg-neutral-800/30 rounded-2xl p-4">
            <Text className="text-neutral-400 text-center text-sm">
              ✨ 7-day free trial on paid plans • Cancel anytime • 100% money-back
              guarantee
            </Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Fixed CTA */}
      <View className="absolute bottom-0 left-0 right-0 bg-neutral-900 px-6 pt-4 pb-8 border-t border-neutral-800">
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
            className={cn(
              'py-4 rounded-2xl items-center',
              selectedPlan === 'free' ? 'bg-neutral-700' : 'bg-teal-500'
            )}
          >
            <Text
              className={cn(
                'text-lg font-semibold',
                selectedPlan === 'free' ? 'text-white' : 'text-neutral-900'
              )}
            >
              {getButtonText()}
            </Text>
          </Animated.View>
        </Pressable>

        <Pressable
          onPress={handleContinue}
          className="mt-3 items-center"
        >
          <Text className="text-neutral-500 text-sm">
            {selectedPlan !== 'free' ? 'Maybe later' : 'Terms & Privacy'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
