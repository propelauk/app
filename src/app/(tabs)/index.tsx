import React, { useEffect, useMemo } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Play, Plus, CheckCircle, Clock, Flame, ChevronRight } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import useAppStore from '@/lib/state/app-store';
import { ProfileMenu } from '@/components/ProfileMenu';
import { useOnboardingStore } from '@/lib/state/onboarding-store';

export default function HomeScreen() {
  const router = useRouter();
  const theme = useAppStore((s) => s.theme);
  const tasks = useAppStore((s) => s.tasks);
  const projects = useAppStore((s) => s.projects);
  const todaysFocusTaskId = useAppStore((s) => s.todaysFocusTaskId);
  const streak = useAppStore((s) => s.streak);
  const setTodaysFocus = useAppStore((s) => s.setTodaysFocus);
  const updateDailyProgress = useAppStore((s) => s.updateDailyProgress);
  const getTodaysStats = useAppStore((s) => s.getTodaysStats);

  const firstName = useOnboardingStore((s) => s.firstName);

  const isDark = theme === 'dark';

  useEffect(() => {
    updateDailyProgress();
  }, [updateDailyProgress]);

  const todaysStats = useMemo(() => getTodaysStats(), [getTodaysStats, tasks]);

  const todaysFocusTask = useMemo(() => {
    if (!todaysFocusTaskId) return null;
    return tasks.find((t) => t.id === todaysFocusTaskId && !t.completed);
  }, [tasks, todaysFocusTaskId]);

  const incompleteTasks = useMemo(() => {
    return tasks.filter((t) => !t.completed).slice(0, 3);
  }, [tasks]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const colors = {
    background: isDark ? '#1a1a1f' : '#f8f8fa',
    card: isDark ? '#252529' : '#ffffff',
    text: isDark ? '#e8e8e8' : '#1a1a1f',
    textSecondary: isDark ? '#9a9a9f' : '#6b6b70',
    textMuted: isDark ? '#6b6b70' : '#9a9a9f',
    primary: '#5b9a8b',
    border: isDark ? '#3a3a40' : '#e8e8eb',
    gradientStart: isDark ? '#2a3a36' : '#e8f4f0',
    gradientEnd: isDark ? '#252529' : '#ffffff',
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <SafeAreaView className="flex-1" edges={['top']}>
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Header */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(600)}
            className="px-6 pt-4 pb-2"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text style={{ color: colors.textSecondary }} className="text-base">
                  {getGreeting()}{firstName ? `, ${firstName}` : ''}
                </Text>
                <Text style={{ color: colors.text }} className="text-3xl font-bold mt-1">
                  Let's focus today
                </Text>
              </View>
              <ProfileMenu isDark={isDark} />
            </View>
          </Animated.View>

          {/* Streak Badge */}
          {streak > 0 && (
            <Animated.View
              entering={FadeInDown.delay(200).duration(600)}
              className="px-6 mt-4"
            >
              <View
                className="flex-row items-center px-4 py-2 rounded-full self-start"
                style={{ backgroundColor: colors.card }}
              >
                <Flame size={18} color="#e8a54b" />
                <Text style={{ color: colors.text }} className="ml-2 font-semibold">
                  {streak} day streak
                </Text>
              </View>
            </Animated.View>
          )}

          {/* Today's Focus Card */}
          <Animated.View
            entering={FadeInDown.delay(300).duration(600)}
            className="px-6 mt-6"
          >
            <LinearGradient
              colors={[colors.gradientStart, colors.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: 20,
                padding: 24,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ color: colors.textSecondary }} className="text-sm font-medium uppercase tracking-wider">
                Today's Focus
              </Text>

              {todaysFocusTask ? (
                <>
                  <Text style={{ color: colors.text }} className="text-2xl font-bold mt-3">
                    {todaysFocusTask.title}
                  </Text>
                  <View className="flex-row items-center mt-2">
                    <Clock size={14} color={colors.textMuted} />
                    <Text style={{ color: colors.textMuted }} className="ml-1 text-sm">
                      {todaysFocusTask.estimatedMinutes ?? 25} min estimated
                    </Text>
                  </View>

                  <Pressable
                    onPress={() => router.push('/focus')}
                    className="mt-6 flex-row items-center justify-center py-4 rounded-2xl active:scale-98"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <Play size={20} color="#ffffff" fill="#ffffff" />
                    <Text className="ml-2 text-white font-semibold text-lg">
                      Start Focus Session
                    </Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <Text style={{ color: colors.textMuted }} className="text-lg mt-3">
                    Choose one task to focus on
                  </Text>
                  <Text style={{ color: colors.textMuted }} className="text-sm mt-1">
                    Select a single task for maximum clarity
                  </Text>

                  {incompleteTasks.length > 0 ? (
                    <View className="mt-4 space-y-2">
                      {incompleteTasks.map((task) => (
                        <Pressable
                          key={task.id}
                          onPress={() => setTodaysFocus(task.id)}
                          className="flex-row items-center p-3 rounded-xl active:opacity-80"
                          style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }}
                        >
                          <View
                            className="w-5 h-5 rounded-full border-2 mr-3"
                            style={{ borderColor: colors.primary }}
                          />
                          <Text style={{ color: colors.text }} className="flex-1 font-medium">
                            {task.title}
                          </Text>
                          <ChevronRight size={18} color={colors.textMuted} />
                        </Pressable>
                      ))}
                    </View>
                  ) : (
                    <Pressable
                      onPress={() => router.push('/projects')}
                      className="mt-6 flex-row items-center justify-center py-4 rounded-2xl active:opacity-80"
                      style={{
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        borderColor: colors.primary,
                        borderStyle: 'dashed',
                      }}
                    >
                      <Plus size={20} color={colors.primary} />
                      <Text style={{ color: colors.primary }} className="ml-2 font-semibold">
                        Create Your First Task
                      </Text>
                    </Pressable>
                  )}
                </>
              )}
            </LinearGradient>
          </Animated.View>

          {/* Quick Actions */}
          <Animated.View
            entering={FadeInUp.delay(400).duration(600)}
            className="px-6 mt-8"
          >
            <Text style={{ color: colors.text }} className="text-lg font-semibold mb-4">
              Quick Actions
            </Text>

            <View className="flex-row space-x-3">
              <Pressable
                onPress={() => router.push('/projects')}
                className="flex-1 p-4 rounded-2xl active:scale-98"
                style={{ backgroundColor: colors.card }}
              >
                <Plus size={24} color={colors.primary} />
                <Text style={{ color: colors.text }} className="mt-2 font-semibold">
                  Add Task
                </Text>
                <Text style={{ color: colors.textMuted }} className="text-sm mt-1">
                  Quick capture
                </Text>
              </Pressable>

              <Pressable
                onPress={() => router.push('/focus')}
                className="flex-1 p-4 rounded-2xl active:scale-98"
                style={{ backgroundColor: colors.card }}
              >
                <Clock size={24} color={colors.primary} />
                <Text style={{ color: colors.text }} className="mt-2 font-semibold">
                  5 Minutes
                </Text>
                <Text style={{ color: colors.textMuted }} className="text-sm mt-1">
                  Quick focus
                </Text>
              </Pressable>

              <Pressable
                onPress={() => router.push('/progress')}
                className="flex-1 p-4 rounded-2xl active:scale-98"
                style={{ backgroundColor: colors.card }}
              >
                <CheckCircle size={24} color={colors.primary} />
                <Text style={{ color: colors.text }} className="mt-2 font-semibold">
                  Review
                </Text>
                <Text style={{ color: colors.textMuted }} className="text-sm mt-1">
                  Today's wins
                </Text>
              </Pressable>
            </View>
          </Animated.View>

          {/* Today's Progress */}
          <Animated.View
            entering={FadeInUp.delay(500).duration(600)}
            className="px-6 mt-8"
          >
            <Text style={{ color: colors.text }} className="text-lg font-semibold mb-4">
              Today's Progress
            </Text>

            <View
              className="p-5 rounded-2xl"
              style={{ backgroundColor: colors.card }}
            >
              <View className="flex-row justify-between">
                <View className="items-center flex-1">
                  <Text style={{ color: colors.primary }} className="text-3xl font-bold">
                    {todaysStats.tasksCompleted}
                  </Text>
                  <Text style={{ color: colors.textMuted }} className="text-sm mt-1">
                    Tasks Done
                  </Text>
                </View>

                <View className="w-px h-12 self-center" style={{ backgroundColor: colors.border }} />

                <View className="items-center flex-1">
                  <Text style={{ color: colors.primary }} className="text-3xl font-bold">
                    {todaysStats.focusMinutes}
                  </Text>
                  <Text style={{ color: colors.textMuted }} className="text-sm mt-1">
                    Focus Min
                  </Text>
                </View>

                <View className="w-px h-12 self-center" style={{ backgroundColor: colors.border }} />

                <View className="items-center flex-1">
                  <Text style={{ color: colors.primary }} className="text-3xl font-bold">
                    {todaysStats.sessionsCompleted}
                  </Text>
                  <Text style={{ color: colors.textMuted }} className="text-sm mt-1">
                    Sessions
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Motivational Micro-copy */}
          <Animated.View
            entering={FadeInUp.delay(600).duration(600)}
            className="px-6 mt-8"
          >
            <Text style={{ color: colors.textMuted }} className="text-center text-sm italic">
              "Progress, not perfection. One task at a time."
            </Text>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
