import { View, Text, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingLayout } from '@/components/onboarding';
import { useOnboardingStore } from '@/lib/state/onboarding-store';
import { useState } from 'react';
import { Mail, Sparkles } from 'lucide-react-native';
import { cn } from '@/lib/cn';

export default function Step16Screen() {
  const router = useRouter();
  const email = useOnboardingStore((s) => s.email);
  const setEmail = useOnboardingStore((s) => s.setEmail);
  const firstName = useOnboardingStore((s) => s.firstName);
  const markStepComplete = useOnboardingStore((s) => s.markStepComplete);

  const [localEmail, setLocalEmail] = useState(email);
  const [isFocused, setIsFocused] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (emailValue: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailValue);
  };

  const handleContinue = () => {
    const trimmedEmail = localEmail.trim().toLowerCase();
    
    if (!validateEmail(trimmedEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    setEmail(trimmedEmail);
    markStepComplete(16);
    router.push('/onboarding/step17');
  };

  const isValid = localEmail.trim().length > 0 && validateEmail(localEmail.trim());

  return (
    <OnboardingLayout
      currentStep={16}
      title="What's your email?"
      subtitle="Your personalized productivity partner awaits you."
      onPrimaryPress={handleContinue}
      primaryButtonDisabled={!isValid}
      keyboardAware
    >
      <View className="mt-4">
        {/* Personalized greeting */}
        {firstName && (
          <View className="bg-teal-500/10 border border-teal-400/30 rounded-2xl p-4 mb-6">
            <View className="flex-row items-center">
              <Sparkles size={20} color="#2dd4bf" />
              <Text className="text-teal-300 ml-2">
                Great to meet you, <Text className="font-bold">{firstName}</Text>! 
              </Text>
            </View>
          </View>
        )}

        {/* Email Icon */}
        <View className="items-center mb-8">
          <View className="w-24 h-24 rounded-full bg-teal-500/20 items-center justify-center border-2 border-teal-400/30">
            <Mail size={48} color="#2dd4bf" />
          </View>
        </View>

        {/* Email Input */}
        <View>
          <Text className="text-neutral-400 text-sm mb-2 ml-1">Email Address</Text>
          <View
            className={cn(
              'bg-neutral-800 rounded-2xl border-2 px-4 py-4',
              isFocused ? 'border-teal-400' : error ? 'border-red-400' : 'border-neutral-700'
            )}
          >
            <TextInput
              value={localEmail}
              onChangeText={(text) => {
                setLocalEmail(text);
                setError('');
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="you@example.com"
              placeholderTextColor="#737373"
              className="text-white text-lg"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              returnKeyType="done"
              onSubmitEditing={isValid ? handleContinue : undefined}
            />
          </View>
          {error ? (
            <Text className="text-red-400 text-sm mt-2 ml-1">{error}</Text>
          ) : null}
        </View>

        {/* Benefits */}
        <View className="mt-8">
          <Text className="text-neutral-400 text-sm mb-3">Why we need your email:</Text>
          {[
            '📊 Sync your progress across devices',
            '🔔 Receive daily productivity insights',
            '🔐 Recover your account if needed',
          ].map((benefit, index) => (
            <View key={index} className="flex-row items-center mb-2">
              <Text className="text-neutral-300 text-sm">{benefit}</Text>
            </View>
          ))}
        </View>

        {/* Privacy Note */}
        <View className="mt-6 bg-neutral-800/50 rounded-2xl p-4">
          <Text className="text-neutral-400 text-sm text-center">
            🔒 We never share your email and you can unsubscribe anytime.
          </Text>
        </View>
      </View>
    </OnboardingLayout>
  );
}
