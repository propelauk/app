import React, { useMemo } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Flame, CheckCircle, Clock, Target, TrendingUp, Settings } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import useAppStore from '@/lib/state/app-store';
import { useIsPremium } from '@/lib/hooks/useIsPremium';

export default function ProgressScreen() {
  const router = useRouter();
  const theme = useAppStore((s) => s.theme);
  const tasks = useAppStore((s) => s.tasks);
  const dailyProgress = useAppStore((s) => s.dailyProgress);
  const streak = useAppStore((s) => s.streak);
  const focusSessions = useAppStore((s) => s.focusSessions);
  const isPremium = useIsPremium();

  const isDark = theme === 'dark';

  const colors = {
    background: isDark ? '#1a1a1f' : '#f8f8fa',
    card: isDark ? '#252529' : '#ffffff',
    text: isDark ? '#e8e8e8' : '#1a1a1f',
    textSecondary: isDark ? '#9a9a9f' : '#6b6b70',
    textMuted: isDark ? '#6b6b70' : '#9a9a9f',
    primary: '#5b9a8b',
    primaryMuted: isDark ? '#3a5a52' : '#d4e8e3',
    border: isDark ? '#3a3a40' : '#e8e8eb',
    success: '#6b9b7a',
    warning: '#e8a54b',
  };

  // Get last 7 days of progress
  const weekProgress = useMemo(() => {
    const days: { date: string; label: string; tasksCompleted: number; focusMinutes: number }[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayProgress = dailyProgress.find((p) => p.date === dateStr);

      days.push({
        date: dateStr,
        label: date.toLocaleDateString('en-US', { weekday: 'short' }),
        tasksCompleted: dayProgress?.tasksCompleted ?? 0,
        focusMinutes: dayProgress?.focusMinutes ?? 0,
      });
    }

    return days;
  }, [dailyProgress]);

  // Calculate totals
  const weekTotals = useMemo(() => {
    return weekProgress.reduce(
      (acc, day) => ({
        tasksCompleted: acc.tasksCompleted + day.tasksCompleted,
        focusMinutes: acc.focusMinutes + day.focusMinutes,
      }),
      { tasksCompleted: 0, focusMinutes: 0 }
    );
  }, [weekProgress]);

  const maxTasks = Math.max(...weekProgress.map((d) => d.tasksCompleted), 1);
  const maxMinutes = Math.max(...weekProgress.map((d) => d.focusMinutes), 1);

  // All-time stats
  const allTimeStats = useMemo(() => {
    const completedTasks = tasks.filter((t) => t.completed).length;
    const completedSessions = focusSessions.filter((s) => s.completed).length;
    const totalFocusMinutes = dailyProgress.reduce((acc, p) => acc + p.focusMinutes, 0);

    return {
      completedTasks,
      completedSessions,
      totalFocusHours: Math.round(totalFocusMinutes / 60),
    };
  }, [tasks, focusSessions, dailyProgress]);

  // Today's reflection prompts
  const reflectionPrompts = [
    "What's one thing you accomplished today that you're proud of?",
    "What helped you stay focused today?",
    "What's one small win you can celebrate?",
    "What would make tomorrow even better?",
  ];

  const todayPrompt = reflectionPrompts[new Date().getDay() % reflectionPrompts.length];

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <SafeAreaView className="flex-1" edges={['top']}>
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {/* Header */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(500)}
            className="px-6 pt-4 pb-2 flex-row justify-between items-center"
          >
            <View>
              <Text style={{ color: colors.text }} className="text-3xl font-bold">
                Progress
              </Text>
              <Text style={{ color: colors.textSecondary }} className="text-base mt-1">
                Celebrate your wins
              </Text>
            </View>

            <Pressable
              onPress={() => router.push('/settings')}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.card }}
            >
              <Settings size={20} color={colors.textMuted} />
            </Pressable>
          </Animated.View>

          {/* Streak Card */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(500)}
            className="px-6 mt-6"
          >
            <View
              className="p-6 rounded-2xl flex-row items-center"
              style={{ backgroundColor: colors.card }}
            >
              <View
                className="w-16 h-16 rounded-full items-center justify-center"
                style={{ backgroundColor: colors.warning + '20' }}
              >
                <Flame size={32} color={colors.warning} />
              </View>
              <View className="ml-4 flex-1">
                <Text style={{ color: colors.text }} className="text-4xl font-bold">
                  {streak}
                </Text>
                <Text style={{ color: colors.textSecondary }} className="text-base">
                  day streak
                </Text>
              </View>
              {streak > 0 && (
                <Text style={{ color: colors.textMuted }} className="text-sm">
                  Keep it up!
                </Text>
              )}
            </View>
          </Animated.View>

          {/* This Week Stats */}
          <Animated.View
            entering={FadeInDown.delay(300).duration(500)}
            className="px-6 mt-6"
          >
            <Text style={{ color: colors.text }} className="text-lg font-semibold mb-4">
              This Week
            </Text>

            <View className="flex-row space-x-3">
              <View
                className="flex-1 p-4 rounded-2xl"
                style={{ backgroundColor: colors.card }}
              >
                <CheckCircle size={24} color={colors.success} />
                <Text style={{ color: colors.text }} className="text-3xl font-bold mt-2">
                  {weekTotals.tasksCompleted}
                </Text>
                <Text style={{ color: colors.textMuted }} className="text-sm">
                  tasks completed
                </Text>
              </View>

              <View
                className="flex-1 p-4 rounded-2xl"
                style={{ backgroundColor: colors.card }}
              >
                <Clock size={24} color={colors.primary} />
                <Text style={{ color: colors.text }} className="text-3xl font-bold mt-2">
                  {weekTotals.focusMinutes}
                </Text>
                <Text style={{ color: colors.textMuted }} className="text-sm">
                  focus minutes
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Weekly Chart */}
          <Animated.View
            entering={FadeInUp.delay(400).duration(500)}
            className="px-6 mt-6"
          >
            <Text style={{ color: colors.text }} className="text-lg font-semibold mb-4">
              Daily Activity
            </Text>

            <View
              className="p-5 rounded-2xl"
              style={{ backgroundColor: colors.card }}
            >
              {/* Tasks Chart */}
              <Text style={{ color: colors.textMuted }} className="text-sm mb-3">
                Tasks Completed
              </Text>
              <View className="flex-row items-end justify-between h-24 mb-6">
                {weekProgress.map((day, index) => {
                  const height = (day.tasksCompleted / maxTasks) * 100;
                  const isToday = index === 6;

                  return (
                    <View key={day.date} className="items-center flex-1">
                      <View
                        className="w-8 rounded-t-lg"
                        style={{
                          height: `${Math.max(height, 8)}%`,
                          backgroundColor: isToday ? colors.primary : colors.primaryMuted,
                        }}
                      />
                      <Text
                        style={{ color: isToday ? colors.text : colors.textMuted }}
                        className="text-xs mt-2"
                      >
                        {day.label}
                      </Text>
                    </View>
                  );
                })}
              </View>

              {/* Focus Minutes Chart */}
              <Text style={{ color: colors.textMuted }} className="text-sm mb-3">
                Focus Minutes
              </Text>
              <View className="flex-row items-end justify-between h-24">
                {weekProgress.map((day, index) => {
                  const height = (day.focusMinutes / maxMinutes) * 100;
                  const isToday = index === 6;

                  return (
                    <View key={day.date} className="items-center flex-1">
                      <View
                        className="w-8 rounded-t-lg"
                        style={{
                          height: `${Math.max(height, 8)}%`,
                          backgroundColor: isToday ? colors.success : colors.success + '40',
                        }}
                      />
                      <Text
                        style={{ color: isToday ? colors.text : colors.textMuted }}
                        className="text-xs mt-2"
                      >
                        {day.label}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </Animated.View>

          {/* All-Time Stats */}
          <Animated.View
            entering={FadeInUp.delay(500).duration(500)}
            className="px-6 mt-6"
          >
            <Text style={{ color: colors.text }} className="text-lg font-semibold mb-4">
              All Time
            </Text>

            <View
              className="p-5 rounded-2xl"
              style={{ backgroundColor: colors.card }}
            >
              <View className="flex-row justify-between">
                <View className="items-center flex-1">
                  <Text style={{ color: colors.primary }} className="text-2xl font-bold">
                    {allTimeStats.completedTasks}
                  </Text>
                  <Text style={{ color: colors.textMuted }} className="text-sm mt-1 text-center">
                    Tasks{'\n'}Completed
                  </Text>
                </View>

                <View className="w-px h-16 self-center" style={{ backgroundColor: colors.border }} />

                <View className="items-center flex-1">
                  <Text style={{ color: colors.primary }} className="text-2xl font-bold">
                    {allTimeStats.completedSessions}
                  </Text>
                  <Text style={{ color: colors.textMuted }} className="text-sm mt-1 text-center">
                    Focus{'\n'}Sessions
                  </Text>
                </View>

                <View className="w-px h-16 self-center" style={{ backgroundColor: colors.border }} />

                <View className="items-center flex-1">
                  <Text style={{ color: colors.primary }} className="text-2xl font-bold">
                    {allTimeStats.totalFocusHours}h
                  </Text>
                  <Text style={{ color: colors.textMuted }} className="text-sm mt-1 text-center">
                    Deep{'\n'}Work
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Weekly Reflection */}
          {isPremium && (
            <Animated.View
              entering={FadeInUp.delay(600).duration(500)}
              className="px-6 mt-6"
            >
              <Text style={{ color: colors.text }} className="text-lg font-semibold mb-4">
                Daily Reflection
              </Text>

              <View
                className="p-5 rounded-2xl"
                style={{ backgroundColor: colors.card }}
              >
                <TrendingUp size={24} color={colors.primary} />
                <Text style={{ color: colors.text }} className="text-base mt-3 leading-6">
                  {todayPrompt}
                </Text>
                <Text style={{ color: colors.textMuted }} className="text-sm mt-4 italic">
                  Take a moment to reflect on your progress.
                </Text>
              </View>
            </Animated.View>
          )}

          {/* Motivational Footer */}
          <Animated.View
            entering={FadeInUp.delay(700).duration(500)}
            className="px-6 mt-8"
          >
            <Text style={{ color: colors.textMuted }} className="text-center text-sm italic">
              "Small steps every day lead to big results."
            </Text>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
