import { View, Text, TextInput, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useOnboardingStore } from '@/lib/state/onboarding-store';
import { ChevronLeft, Mail, CheckCircle } from 'lucide-react-native';
import Animated, { FadeInDown, useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import useAppStore from '@/lib/state/app-store';
import { cn } from '@/lib/cn';

export default function ChangeEmailScreen() {
  const router = useRouter();
  const theme = useAppStore((s) => s.theme);
  const isDark = theme === 'dark';

  const currentEmail = useOnboardingStore((s) => s.email);
  const setEmail = useOnboardingStore((s) => s.setEmail);

  const [newEmail, setNewEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const buttonScale = useSharedValue(1);

  const colors = {
    background: isDark ? '#171717' : '#f8f8fa',
    card: isDark ? '#252529' : '#ffffff',
    text: isDark ? '#e8e8e8' : '#1a1a1f',
    textSecondary: isDark ? '#9a9a9f' : '#6b6b70',
    border: isDark ? '#3a3a40' : '#e8e8eb',
    primary: '#2dd4bf',
  };

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSave = () => {
    if (!validateEmail(newEmail)) {
      setError('Please enter a valid email address');
      return;
    }
    if (newEmail !== confirmEmail) {
      setError('Email addresses do not match');
      return;
    }
    if (newEmail.toLowerCase() === currentEmail.toLowerCase()) {
      setError('New email must be different from current email');
      return;
    }

    setIsSaving(true);
    setError('');

    // Simulate save
    setTimeout(() => {
      setEmail(newEmail.toLowerCase());
      setIsSaving(false);
      setShowSuccess(true);
    }, 500);
  };

  const isValid = newEmail.length > 0 && confirmEmail.length > 0 && !error;

  if (showSuccess) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
        <View className="flex-1 items-center justify-center px-6">
          <Animated.View entering={FadeInDown.duration(500)} className="items-center">
            <View className="w-24 h-24 rounded-full bg-teal-500/20 items-center justify-center mb-6">
              <CheckCircle size={48} color="#2dd4bf" />
            </View>
            <Text style={{ color: colors.text }} className="text-2xl font-bold text-center">
              Email Updated!
            </Text>
            <Text style={{ color: colors.textSecondary }} className="text-center mt-2">
              Your email has been changed to
            </Text>
            <Text style={{ color: colors.primary }} className="text-center font-medium mt-1">
              {newEmail}
            </Text>
            <Pressable
              onPress={() => router.back()}
              className="mt-8 bg-teal-500 px-8 py-4 rounded-2xl"
            >
              <Text className="text-neutral-900 font-semibold">Done</Text>
            </Pressable>
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full"
        >
          <ChevronLeft size={28} color={colors.text} />
        </Pressable>
        <Text style={{ color: colors.text }} className="text-xl font-bold">
          Change Email
        </Text>
        <View className="w-10" />
      </View>

      <View className="flex-1 px-6 pt-8">
        {/* Icon */}
        <Animated.View entering={FadeInDown.duration(500)} className="items-center mb-8">
          <View className="w-20 h-20 rounded-full bg-teal-500/20 items-center justify-center">
            <Mail size={40} color="#2dd4bf" />
          </View>
        </Animated.View>

        {/* Current Email */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} className="mb-6">
          <Text style={{ color: colors.textSecondary }} className="text-sm font-medium mb-2 ml-1">
            Current Email
          </Text>
          <View
            className="rounded-xl border px-4 py-4"
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
          >
            <Text style={{ color: colors.textSecondary }} className="text-base">
              {currentEmail || 'No email set'}
            </Text>
          </View>
        </Animated.View>

        {/* New Email */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)} className="mb-4">
          <Text style={{ color: colors.textSecondary }} className="text-sm font-medium mb-2 ml-1">
            New Email
          </Text>
          <View
            className="flex-row items-center rounded-xl border px-4"
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
          >
            <Mail size={20} color={colors.primary} />
            <TextInput
              value={newEmail}
              onChangeText={(text) => {
                setNewEmail(text);
                setError('');
              }}
              placeholder="Enter new email"
              placeholderTextColor={colors.textSecondary}
              style={{ color: colors.text }}
              className="flex-1 ml-3 py-4 text-base"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </Animated.View>

        {/* Confirm Email */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)} className="mb-4">
          <Text style={{ color: colors.textSecondary }} className="text-sm font-medium mb-2 ml-1">
            Confirm New Email
          </Text>
          <View
            className="flex-row items-center rounded-xl border px-4"
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
          >
            <Mail size={20} color={colors.primary} />
            <TextInput
              value={confirmEmail}
              onChangeText={(text) => {
                setConfirmEmail(text);
                setError('');
              }}
              placeholder="Confirm new email"
              placeholderTextColor={colors.textSecondary}
              style={{ color: colors.text }}
              className="flex-1 ml-3 py-4 text-base"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </Animated.View>

        {/* Error */}
        {error ? (
          <Text className="text-red-400 text-sm ml-1 mb-4">{error}</Text>
        ) : null}

        {/* Save Button */}
        <Animated.View entering={FadeInDown.delay(400).duration(500)} className="mt-4">
          <Pressable
            onPress={handleSave}
            disabled={!isValid || isSaving}
            onPressIn={() => { buttonScale.value = withSpring(0.97); }}
            onPressOut={() => { buttonScale.value = withSpring(1); }}
          >
            <Animated.View
              style={animatedButtonStyle}
              className={cn(
                'py-4 rounded-2xl items-center',
                !isValid || isSaving ? 'bg-neutral-700' : 'bg-teal-500'
              )}
            >
              <Text className={cn(
                'text-lg font-semibold',
                !isValid || isSaving ? 'text-neutral-400' : 'text-neutral-900'
              )}>
                {isSaving ? 'Saving...' : 'Update Email'}
              </Text>
            </Animated.View>
          </Pressable>
        </Animated.View>

        {/* Security Note */}
        <Animated.View entering={FadeInDown.delay(500).duration(500)} className="mt-6">
          <View 
            className="rounded-xl p-4"
            style={{ backgroundColor: colors.card }}
          >
            <Text style={{ color: colors.textSecondary }} className="text-sm text-center">
              📧 We'll send a verification email to confirm your new address.
            </Text>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
