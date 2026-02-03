import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Switch, Linking, Share, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ChevronLeft,
  Moon,
  Sun,
  Crown,
  Bell,
  Shield,
  HelpCircle,
  MessageSquare,
  ChevronRight,
  Share2,
  CreditCard,
  Trash2,
  AlertTriangle
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import useAppStore from '@/lib/state/app-store';
import { useOnboardingStore } from '@/lib/state/onboarding-store';

const SHARE_MESSAGE = "I use Propela to keep myself focused and boost my productivity 🚀\n\nDownload it now and unlock your potential!";

export default function SettingsScreen() {
  const router = useRouter();
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  
  // Get plan from onboarding store for consistency
  const selectedPlan = useOnboardingStore((s) => s.selectedPlan);
  const resetOnboarding = useOnboardingStore((s) => s.resetOnboarding);
  const isPremium = selectedPlan === 'pro' || selectedPlan === 'premium';
  
  // Focus reminders state
  const [focusReminders, setFocusReminders] = useState(false);

  const isDark = theme === 'dark';

  const colors = {
    background: isDark ? '#1a1a1f' : '#f8f8fa',
    card: isDark ? '#252529' : '#ffffff',
    text: isDark ? '#e8e8e8' : '#1a1a1f',
    textSecondary: isDark ? '#9a9a9f' : '#6b6b70',
    textMuted: isDark ? '#6b6b70' : '#9a9a9f',
    primary: '#5b9a8b',
    border: isDark ? '#3a3a40' : '#e8e8eb',
    premium: '#e8a54b',
    danger: '#ef4444',
  };

  const handleThemeToggle = () => {
    setTheme(isDark ? 'light' : 'dark');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleFocusRemindersToggle = () => {
    setFocusReminders(!focusReminders);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleUpgrade = () => {
    router.push('/onboarding/paywall');
  };

  const handleShareApp = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await Share.share({
        message: SHARE_MESSAGE,
        title: 'Share Propela',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleManageSubscription = () => {
    router.push('/onboarding/paywall');
  };

  const handleDeleteAccount = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone. All your data, projects, tasks, and progress will be permanently deleted.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => {
            // Confirm again for safety
            Alert.alert(
              'Final Confirmation',
              'This is your last chance. Are you absolutely sure you want to delete your account?',
              [
                {
                  text: 'Keep My Account',
                  style: 'cancel',
                },
                {
                  text: 'Yes, Delete Everything',
                  style: 'destructive',
                  onPress: () => {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    // Reset all data
                    resetOnboarding();
                    router.replace('/onboarding');
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  interface SettingRowProps {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    showChevron?: boolean;
  }

  const SettingRow = ({ icon, title, subtitle, onPress, rightElement, showChevron = true }: SettingRowProps) => (
    <Pressable
      onPress={onPress}
      className="flex-row items-center py-4 px-4 active:opacity-70"
      disabled={!onPress && !rightElement}
    >
      <View
        className="w-10 h-10 rounded-xl items-center justify-center mr-4"
        style={{ backgroundColor: colors.border }}
      >
        {icon}
      </View>
      <View className="flex-1">
        <Text style={{ color: colors.text }} className="text-base font-medium">
          {title}
        </Text>
        {subtitle && (
          <Text style={{ color: colors.textMuted }} className="text-sm mt-0.5">
            {subtitle}
          </Text>
        )}
      </View>
      {rightElement}
      {showChevron && onPress && !rightElement && (
        <ChevronRight size={20} color={colors.textMuted} />
      )}
    </Pressable>
  );

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Header */}
        <View className="flex-row items-center px-4 py-3">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center rounded-full active:opacity-50"
          >
            <ChevronLeft size={28} color={colors.text} />
          </Pressable>
          <Text style={{ color: colors.text }} className="text-xl font-bold ml-2">
            Settings
          </Text>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Premium Banner */}
          {!isPremium && (
            <Animated.View
              entering={FadeInDown.delay(100).duration(500)}
              className="mx-6 mt-4"
            >
              <Pressable
                onPress={handleUpgrade}
                className="p-5 rounded-2xl active:scale-98"
                style={{ backgroundColor: colors.premium + '15' }}
              >
                <View className="flex-row items-center">
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center"
                    style={{ backgroundColor: colors.premium }}
                  >
                    <Crown size={24} color="#ffffff" />
                  </View>
                  <View className="ml-4 flex-1">
                    <Text style={{ color: colors.text }} className="text-lg font-bold">
                      Upgrade to Premium
                    </Text>
                    <Text style={{ color: colors.textSecondary }} className="text-sm mt-1">
                      Unlimited projects, tasks, and focus sessions
                    </Text>
                  </View>
                </View>
                <View
                  className="mt-4 py-3 rounded-xl items-center"
                  style={{ backgroundColor: colors.premium }}
                >
                  <Text className="text-white font-semibold">
                    Try Premium Free
                  </Text>
                </View>
              </Pressable>
            </Animated.View>
          )}

          {/* Premium Active Banner */}
          {isPremium && (
            <Animated.View
              entering={FadeInDown.delay(100).duration(500)}
              className="mx-6 mt-4"
            >
              <View
                className="p-5 rounded-2xl flex-row items-center"
                style={{ backgroundColor: colors.card }}
              >
                <View
                  className="w-12 h-12 rounded-full items-center justify-center"
                  style={{ backgroundColor: selectedPlan === 'premium' ? '#7c3aed' : colors.premium }}
                >
                  <Crown size={24} color="#ffffff" />
                </View>
                <View className="ml-4 flex-1">
                  <Text style={{ color: selectedPlan === 'premium' ? '#a855f7' : colors.premium }} className="text-lg font-bold">
                    {selectedPlan === 'premium' ? 'Premium' : 'Pro'} Active
                  </Text>
                  <Text style={{ color: colors.textSecondary }} className="text-sm mt-1">
                    You have {selectedPlan === 'premium' ? 'full' : 'premium'} access
                  </Text>
                </View>
              </View>
            </Animated.View>
          )}

          {/* Appearance Section */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(500)}
            className="mx-6 mt-6"
          >
            <Text style={{ color: colors.textMuted }} className="text-sm font-medium mb-2 px-4 uppercase tracking-wider">
              Appearance
            </Text>
            <View
              className="rounded-2xl overflow-hidden"
              style={{ backgroundColor: colors.card }}
            >
              <SettingRow
                icon={isDark ? <Moon size={20} color={colors.primary} /> : <Sun size={20} color={colors.premium} />}
                title="Dark Mode"
                subtitle={isDark ? 'On' : 'Off'}
                showChevron={false}
                rightElement={
                  <Switch
                    value={isDark}
                    onValueChange={handleThemeToggle}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor="#ffffff"
                  />
                }
              />
            </View>
          </Animated.View>

          {/* Notifications Section */}
          <Animated.View
            entering={FadeInDown.delay(300).duration(500)}
            className="mx-6 mt-6"
          >
            <Text style={{ color: colors.textMuted }} className="text-sm font-medium mb-2 px-4 uppercase tracking-wider">
              Notifications
            </Text>
            <View
              className="rounded-2xl overflow-hidden"
              style={{ backgroundColor: colors.card }}
            >
              <SettingRow
                icon={<Bell size={20} color={colors.primary} />}
                title="Focus Reminders"
                subtitle="Get gentle reminders to stay on track"
                showChevron={false}
                rightElement={
                  <Switch
                    value={focusReminders}
                    onValueChange={handleFocusRemindersToggle}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor="#ffffff"
                  />
                }
              />
            </View>
          </Animated.View>

          {/* Support Section */}
          <Animated.View
            entering={FadeInDown.delay(400).duration(500)}
            className="mx-6 mt-6"
          >
            <Text style={{ color: colors.textMuted }} className="text-sm font-medium mb-2 px-4 uppercase tracking-wider">
              Support
            </Text>
            <View
              className="rounded-2xl overflow-hidden"
              style={{ backgroundColor: colors.card }}
            >
              <SettingRow
                icon={<HelpCircle size={20} color={colors.primary} />}
                title="Help & FAQ"
                onPress={() => router.push('/help-faq')}
              />
              <View className="h-px ml-14" style={{ backgroundColor: colors.border }} />
              <SettingRow
                icon={<MessageSquare size={20} color={colors.primary} />}
                title="Send Feedback"
                onPress={() => router.push('/send-feedback')}
              />
              <View className="h-px ml-14" style={{ backgroundColor: colors.border }} />
              <SettingRow
                icon={<Share2 size={20} color={colors.primary} />}
                title="Share Propela"
                subtitle="Invite friends to stay focused"
                onPress={handleShareApp}
              />
              <View className="h-px ml-14" style={{ backgroundColor: colors.border }} />
              <SettingRow
                icon={<Shield size={20} color={colors.primary} />}
                title="Privacy Policy"
                onPress={() => router.push('/privacy-policy')}
              />
            </View>
          </Animated.View>

          {/* Subscription Section */}
          <Animated.View
            entering={FadeInDown.delay(500).duration(500)}
            className="mx-6 mt-6"
          >
            <Text style={{ color: colors.textMuted }} className="text-sm font-medium mb-2 px-4 uppercase tracking-wider">
              Subscription
            </Text>
            <View
              className="rounded-2xl overflow-hidden"
              style={{ backgroundColor: colors.card }}
            >
              <View className="px-4 py-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View
                      className="w-10 h-10 rounded-xl items-center justify-center mr-4"
                      style={{ backgroundColor: isPremium ? (selectedPlan === 'premium' ? '#7c3aed' : colors.premium) + '20' : colors.border }}
                    >
                      <Crown size={20} color={isPremium ? (selectedPlan === 'premium' ? '#a855f7' : colors.premium) : colors.textMuted} />
                    </View>
                    <View>
                      <Text style={{ color: colors.text }} className="text-base font-medium">
                        Current Plan
                      </Text>
                      <Text style={{ color: isPremium ? (selectedPlan === 'premium' ? '#a855f7' : colors.premium) : colors.textMuted }} className="text-sm font-semibold mt-0.5">
                        {selectedPlan === 'premium' ? 'Premium' : selectedPlan === 'pro' ? 'Pro' : 'Free'}
                      </Text>
                    </View>
                  </View>
                  {!isPremium && (
                    <View className="bg-amber-500/20 px-2 py-1 rounded-full">
                      <Text className="text-amber-500 text-xs font-medium">Limited</Text>
                    </View>
                  )}
                </View>
                {!isPremium && (
                  <Text style={{ color: colors.textSecondary }} className="text-sm mt-3 ml-14">
                    1 active project • 5 tasks per project • 3 daily sessions
                  </Text>
                )}
              </View>
              <View className="h-px" style={{ backgroundColor: colors.border }} />
              <SettingRow
                icon={<CreditCard size={20} color={colors.primary} />}
                title={isPremium ? "Manage Subscription" : "Upgrade Plan"}
                subtitle={isPremium ? "View billing and plan details" : "Unlock unlimited access"}
                onPress={handleManageSubscription}
              />
            </View>
          </Animated.View>

          {/* Account Section */}
          <Animated.View
            entering={FadeInDown.delay(600).duration(500)}
            className="mx-6 mt-6"
          >
            <Text style={{ color: colors.textMuted }} className="text-sm font-medium mb-2 px-4 uppercase tracking-wider">
              Account
            </Text>
            <View
              className="rounded-2xl overflow-hidden"
              style={{ backgroundColor: colors.card }}
            >
              <Pressable
                onPress={handleDeleteAccount}
                className="flex-row items-center py-4 px-4 active:opacity-70"
              >
                <View
                  className="w-10 h-10 rounded-xl items-center justify-center mr-4"
                  style={{ backgroundColor: colors.danger + '15' }}
                >
                  <Trash2 size={20} color={colors.danger} />
                </View>
                <View className="flex-1">
                  <Text style={{ color: colors.danger }} className="text-base font-medium">
                    Delete Account
                  </Text>
                  <Text style={{ color: colors.textMuted }} className="text-sm mt-0.5">
                    Permanently delete all your data
                  </Text>
                </View>
                <AlertTriangle size={18} color={colors.danger} />
              </Pressable>
            </View>
          </Animated.View>

          {/* App Info */}
          <Animated.View
            entering={FadeInDown.delay(700).duration(500)}
            className="mt-8 items-center"
          >
            <Text style={{ color: colors.textMuted }} className="text-sm">
              Propela v1.0.0
            </Text>
            <Text style={{ color: colors.textMuted }} className="text-xs mt-1">
              Made with calm for ADHD entrepreneurs
            </Text>
          </Animated.View>

          {/* Spacer for scroll */}
          <View className="h-8" />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
