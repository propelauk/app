import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ChevronLeft, MessageSquare, Star, CheckCircle } from 'lucide-react-native';
import Animated, { FadeInDown, useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import useAppStore from '@/lib/state/app-store';
import { useOnboardingStore } from '@/lib/state/onboarding-store';
import { cn } from '@/lib/cn';

const feedbackTypes = [
  { id: 'bug', emoji: '🐛', label: 'Bug Report' },
  { id: 'feature', emoji: '💡', label: 'Feature Request' },
  { id: 'improvement', emoji: '✨', label: 'Improvement' },
  { id: 'other', emoji: '💬', label: 'Other' },
];

export default function SendFeedbackScreen() {
  const router = useRouter();
  const theme = useAppStore((s) => s.theme);
  const isDark = theme === 'dark';
  
  const userEmail = useOnboardingStore((s) => s.email);
  const userName = useOnboardingStore((s) => s.firstName);

  const [feedbackType, setFeedbackType] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(0);
  const [email, setEmail] = useState(userEmail || '');
  const [isSending, setIsSending] = useState(false);
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

  const handleSend = () => {
    if (!feedbackType || !message.trim()) return;

    setIsSending(true);

    // Simulate sending
    setTimeout(() => {
      setIsSending(false);
      setShowSuccess(true);
    }, 1000);
  };

  const isValid = feedbackType && message.trim();

  if (showSuccess) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
        <View className="flex-1 items-center justify-center px-6">
          <Animated.View entering={FadeInDown.duration(500)} className="items-center">
            <View className="w-24 h-24 rounded-full bg-teal-500/20 items-center justify-center mb-6">
              <CheckCircle size={48} color="#2dd4bf" />
            </View>
            <Text style={{ color: colors.text }} className="text-2xl font-bold text-center">
              Thank You!
            </Text>
            <Text style={{ color: colors.textSecondary }} className="text-center mt-2 px-8">
              Your feedback helps us make Propela better{userName ? ` for you, ${userName}` : ''}.
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
          Send Feedback
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Intro */}
        <Animated.View entering={FadeInDown.duration(500)} className="items-center mb-6">
          <View className="w-16 h-16 rounded-full bg-teal-500/20 items-center justify-center mb-4">
            <MessageSquare size={32} color="#2dd4bf" />
          </View>
          <Text style={{ color: colors.text }} className="text-lg font-semibold text-center">
            We'd love to hear from you
          </Text>
          <Text style={{ color: colors.textSecondary }} className="text-center mt-1">
            Your feedback shapes the future of Propela
          </Text>
        </Animated.View>

        {/* Feedback Type */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} className="mb-6">
          <Text style={{ color: colors.textSecondary }} className="text-sm font-medium mb-3 ml-1">
            What type of feedback? *
          </Text>
          <View className="flex-row flex-wrap -mx-1">
            {feedbackTypes.map((type) => (
              <Pressable
                key={type.id}
                onPress={() => setFeedbackType(type.id)}
                className="w-1/2 px-1 mb-2"
              >
                <View
                  className={cn(
                    'rounded-xl p-4 items-center border-2',
                    feedbackType === type.id ? 'border-teal-400' : 'border-transparent'
                  )}
                  style={{ 
                    backgroundColor: feedbackType === type.id 
                      ? colors.primary + '20' 
                      : colors.card 
                  }}
                >
                  <Text className="text-2xl mb-2">{type.emoji}</Text>
                  <Text 
                    style={{ color: feedbackType === type.id ? colors.primary : colors.text }}
                    className="font-medium text-sm"
                  >
                    {type.label}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {/* Rating */}
        <Animated.View entering={FadeInDown.delay(150).duration(500)} className="mb-6">
          <Text style={{ color: colors.textSecondary }} className="text-sm font-medium mb-3 ml-1">
            How's your experience so far?
          </Text>
          <View className="flex-row justify-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable
                key={star}
                onPress={() => setRating(star)}
                className="p-2"
              >
                <Star
                  size={32}
                  color={star <= rating ? '#eab308' : colors.border}
                  fill={star <= rating ? '#eab308' : 'transparent'}
                />
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {/* Message */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)} className="mb-4">
          <Text style={{ color: colors.textSecondary }} className="text-sm font-medium mb-2 ml-1">
            Your Feedback *
          </Text>
          <View
            className="rounded-xl border px-4 py-3"
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
          >
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Tell us what's on your mind..."
              placeholderTextColor={colors.textSecondary}
              style={{ color: colors.text }}
              className="text-base min-h-[120px]"
              multiline
              textAlignVertical="top"
            />
          </View>
        </Animated.View>

        {/* Email */}
        <Animated.View entering={FadeInDown.delay(250).duration(500)} className="mb-6">
          <Text style={{ color: colors.textSecondary }} className="text-sm font-medium mb-2 ml-1">
            Email (optional - for follow up)
          </Text>
          <View
            className="rounded-xl border px-4"
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
          >
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              placeholderTextColor={colors.textSecondary}
              style={{ color: colors.text }}
              className="py-4 text-base"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </Animated.View>

        {/* Send Button */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <Pressable
            onPress={handleSend}
            disabled={!isValid || isSending}
            onPressIn={() => { buttonScale.value = withSpring(0.97); }}
            onPressOut={() => { buttonScale.value = withSpring(1); }}
          >
            <Animated.View
              style={animatedButtonStyle}
              className={cn(
                'py-4 rounded-2xl items-center',
                !isValid || isSending ? 'bg-neutral-700' : 'bg-teal-500'
              )}
            >
              <Text className={cn(
                'text-lg font-semibold',
                !isValid || isSending ? 'text-neutral-400' : 'text-neutral-900'
              )}>
                {isSending ? 'Sending...' : 'Send Feedback'}
              </Text>
            </Animated.View>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
