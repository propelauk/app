import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useOnboardingStore } from '@/lib/state/onboarding-store';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react-native';
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { cn } from '@/lib/cn';

export default function LoginScreen() {
  const router = useRouter();
  const storedEmail = useOnboardingStore((s) => s.email);
  const storedPin = useOnboardingStore((s) => s.pin);
  const completeOnboarding = useOnboardingStore((s) => s.completeOnboarding);

  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [pinFocused, setPinFocused] = useState(false);
  const [error, setError] = useState('');

  const buttonScale = useSharedValue(1);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleLogin = () => {
    // Simple local validation (in production, this would check against backend)
    if (email.toLowerCase() === storedEmail.toLowerCase() && pin === storedPin) {
      completeOnboarding();
      router.replace('/(tabs)');
    } else {
      setError('Invalid email or PIN. Please try again.');
    }
  };

  const handleForgotPin = () => {
    // In production, this would trigger a PIN reset flow
    setError('PIN reset is not available in demo mode.');
  };

  const isValid = email.trim().length > 0 && pin.length === 4;

  return (
    <SafeAreaView className="flex-1 bg-neutral-900">
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
          {/* Header */}
          <View className="px-6 pt-4">
            <Pressable
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-neutral-800 items-center justify-center"
            >
              <ArrowLeft size={24} color="#fff" />
            </Pressable>
          </View>

          <View className="flex-1 px-6 justify-center">
            <Animated.View entering={FadeInUp.duration(500)}>
              <Text className="text-white text-3xl font-bold">Welcome back</Text>
              <Text className="text-neutral-400 text-base mt-2">
                Sign in to continue your productivity journey
              </Text>
            </Animated.View>

            {/* Form */}
            <Animated.View
              entering={FadeInUp.duration(500).delay(200)}
              className="mt-10"
            >
              {/* Email Input */}
              <View className="mb-4">
                <Text className="text-neutral-400 text-sm mb-2 ml-1">Email</Text>
                <View
                  className={cn(
                    'bg-neutral-800 rounded-2xl border-2 px-4 py-4 flex-row items-center',
                    emailFocused ? 'border-teal-400' : 'border-neutral-700'
                  )}
                >
                  <Mail size={20} color="#737373" />
                  <TextInput
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      setError('');
                    }}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    placeholder="you@example.com"
                    placeholderTextColor="#737373"
                    className="text-white text-base flex-1 ml-3"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                  />
                </View>
              </View>

              {/* PIN Input */}
              <View className="mb-4">
                <Text className="text-neutral-400 text-sm mb-2 ml-1">PIN</Text>
                <View
                  className={cn(
                    'bg-neutral-800 rounded-2xl border-2 px-4 py-4 flex-row items-center',
                    pinFocused ? 'border-teal-400' : 'border-neutral-700'
                  )}
                >
                  <Lock size={20} color="#737373" />
                  <TextInput
                    value={pin}
                    onChangeText={(text) => {
                      const numericText = text.replace(/[^0-9]/g, '');
                      if (numericText.length <= 4) {
                        setPin(numericText);
                        setError('');
                      }
                    }}
                    onFocus={() => setPinFocused(true)}
                    onBlur={() => setPinFocused(false)}
                    placeholder="Enter your 4-digit PIN"
                    placeholderTextColor="#737373"
                    className="text-white text-base flex-1 ml-3"
                    keyboardType="number-pad"
                    maxLength={4}
                    secureTextEntry={!showPin}
                  />
                  <Pressable onPress={() => setShowPin(!showPin)}>
                    {showPin ? (
                      <EyeOff size={20} color="#737373" />
                    ) : (
                      <Eye size={20} color="#737373" />
                    )}
                  </Pressable>
                </View>
              </View>

              {/* Error Message */}
              {error ? (
                <Animated.View entering={FadeInUp.duration(300)}>
                  <Text className="text-red-400 text-sm text-center mb-4">
                    {error}
                  </Text>
                </Animated.View>
              ) : null}

              {/* Forgot PIN */}
              <Pressable onPress={handleForgotPin} className="items-center mb-6">
                <Text className="text-teal-400 text-sm">Forgot your PIN?</Text>
              </Pressable>
            </Animated.View>
          </View>

          {/* Login Button */}
          <View className="px-6 pb-6">
            <Animated.View entering={FadeInUp.duration(500).delay(400)}>
              <Pressable
                onPress={handleLogin}
                disabled={!isValid}
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
                    isValid ? 'bg-teal-500' : 'bg-neutral-700'
                  )}
                >
                  <Text
                    className={cn(
                      'text-lg font-semibold',
                      isValid ? 'text-neutral-900' : 'text-neutral-400'
                    )}
                  >
                    Sign In
                  </Text>
                </Animated.View>
              </Pressable>
            </Animated.View>

            <Animated.View entering={FadeInUp.duration(500).delay(600)}>
              <Pressable
                onPress={() => router.push('/onboarding/step1')}
                className="py-4 items-center mt-2"
              >
                <Text className="text-neutral-400 text-base">
                  Don't have an account?{' '}
                  <Text className="text-teal-400">Sign up</Text>
                </Text>
              </Pressable>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
