import { View, Text, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingLayout } from '@/components/onboarding';
import { useOnboardingStore } from '@/lib/state/onboarding-store';
import { useState, useEffect } from 'react';
import { User } from 'lucide-react-native';
import { cn } from '@/lib/cn';

export default function Step15Screen() {
  const router = useRouter();
  const firstName = useOnboardingStore((s) => s.firstName);
  const lastName = useOnboardingStore((s) => s.lastName);
  const setName = useOnboardingStore((s) => s.setName);
  const markStepComplete = useOnboardingStore((s) => s.markStepComplete);

  const [localFirstName, setLocalFirstName] = useState(firstName);
  const [localLastName, setLocalLastName] = useState(lastName);
  const [firstNameFocused, setFirstNameFocused] = useState(false);
  const [lastNameFocused, setLastNameFocused] = useState(false);

  const handleContinue = () => {
    setName(localFirstName.trim(), localLastName.trim());
    markStepComplete(15);
    router.push('/onboarding/step16');
  };

  const isValid = localFirstName.trim().length > 0;

  return (
    <OnboardingLayout
      currentStep={15}
      title="What should we call you?"
      subtitle="Let's make this personal. Your name helps us personalize your experience."
      onPrimaryPress={handleContinue}
      primaryButtonDisabled={!isValid}
      keyboardAware
    >
      <View className="mt-4">
        {/* Icon */}
        <View className="items-center mb-8">
          <View className="w-24 h-24 rounded-full bg-teal-500/20 items-center justify-center border-2 border-teal-400/30">
            <User size={48} color="#2dd4bf" />
          </View>
        </View>

        {/* First Name Input */}
        <View className="mb-4">
          <Text className="text-neutral-400 text-sm mb-2 ml-1">First Name *</Text>
          <View
            className={cn(
              'bg-neutral-800 rounded-2xl border-2 px-4 py-4',
              firstNameFocused ? 'border-teal-400' : 'border-neutral-700'
            )}
          >
            <TextInput
              value={localFirstName}
              onChangeText={setLocalFirstName}
              onFocus={() => setFirstNameFocused(true)}
              onBlur={() => setFirstNameFocused(false)}
              placeholder="Enter your first name"
              placeholderTextColor="#737373"
              className="text-white text-lg"
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>
        </View>

        {/* Last Name Input */}
        <View>
          <Text className="text-neutral-400 text-sm mb-2 ml-1">Last Name (optional)</Text>
          <View
            className={cn(
              'bg-neutral-800 rounded-2xl border-2 px-4 py-4',
              lastNameFocused ? 'border-teal-400' : 'border-neutral-700'
            )}
          >
            <TextInput
              value={localLastName}
              onChangeText={setLocalLastName}
              onFocus={() => setLastNameFocused(true)}
              onBlur={() => setLastNameFocused(false)}
              placeholder="Enter your last name"
              placeholderTextColor="#737373"
              className="text-white text-lg"
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={isValid ? handleContinue : undefined}
            />
          </View>
        </View>

        {/* Privacy Note */}
        <View className="mt-6 bg-neutral-800/50 rounded-2xl p-4">
          <Text className="text-neutral-400 text-sm text-center">
            🔒 Your information stays private and is stored securely on your device.
          </Text>
        </View>
      </View>
    </OnboardingLayout>
  );
}
