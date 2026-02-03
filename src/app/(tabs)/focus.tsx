import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Play, Pause, RotateCcw, Lock, Check } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
  withSpring,
  FadeIn,
  FadeInUp,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Svg, { Circle } from 'react-native-svg';
import useAppStore from '@/lib/state/app-store';
import { usePremiumFeature } from '@/lib/hooks/usePremiumFeature';

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = width * 0.7;
const STROKE_WIDTH = 12;
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type SessionDuration = 5 | 15 | 25 | 45;

const DURATIONS: { value: SessionDuration; label: string; premium: boolean }[] = [
  { value: 5, label: '5 min', premium: false },
  { value: 15, label: '15 min', premium: false },
  { value: 25, label: '25 min', premium: false },
  { value: 45, label: '45 min', premium: true },
];

export default function FocusScreen() {
  const theme = useAppStore((s) => s.theme);
  const { isPremium, canUseLongSession } = usePremiumFeature();
  const tasks = useAppStore((s) => s.tasks);
  const todaysFocusTaskId = useAppStore((s) => s.todaysFocusTaskId);
  const startFocusSession = useAppStore((s) => s.startFocusSession);
  const endFocusSession = useAppStore((s) => s.endFocusSession);
  const canStartFocusSession = useAppStore((s) => s.canStartFocusSession);
  const completeTask = useAppStore((s) => s.completeTask);

  const [selectedDuration, setSelectedDuration] = useState<SessionDuration>(25);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(selectedDuration * 60);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessionComplete, setSessionComplete] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progress = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  const isDark = theme === 'dark';

  const colors = {
    background: isDark ? '#1a1a1f' : '#f8f8fa',
    card: isDark ? '#252529' : '#ffffff',
    text: isDark ? '#e8e8e8' : '#1a1a1f',
    textSecondary: isDark ? '#9a9a9f' : '#6b6b70',
    textMuted: isDark ? '#6b6b70' : '#9a9a9f',
    primary: '#5b9a8b',
    primaryMuted: isDark ? '#3a5a52' : '#c8e0da',
    border: isDark ? '#3a3a40' : '#e8e8eb',
    success: '#6b9b7a',
  };

  const todaysFocusTask = tasks.find((t) => t.id === todaysFocusTaskId && !t.completed);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = useCallback(() => {
    if (!canStartFocusSession()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    const sessionId = startFocusSession(selectedDuration, todaysFocusTaskId ?? undefined);
    setCurrentSessionId(sessionId);
    setIsRunning(true);
    setSessionComplete(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [canStartFocusSession, startFocusSession, selectedDuration, todaysFocusTaskId]);

  const handlePause = useCallback(() => {
    setIsRunning(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleResume = useCallback(() => {
    setIsRunning(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleReset = useCallback(() => {
    if (currentSessionId) {
      endFocusSession(currentSessionId, false);
    }
    setIsRunning(false);
    setTimeLeft(selectedDuration * 60);
    setCurrentSessionId(null);
    setSessionComplete(false);
    progress.value = withTiming(0, { duration: 300 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [currentSessionId, endFocusSession, selectedDuration, progress]);

  const handleComplete = useCallback(() => {
    setSessionComplete(false);
    setTimeLeft(selectedDuration * 60);
    setCurrentSessionId(null);
    progress.value = withTiming(0, { duration: 300 });
  }, [selectedDuration, progress]);

  const handleMarkTaskComplete = useCallback(() => {
    if (todaysFocusTaskId) {
      completeTask(todaysFocusTaskId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [todaysFocusTaskId, completeTask]);

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;
          const totalSeconds = selectedDuration * 60;
          const progressValue = 1 - newTime / totalSeconds;
          progress.value = withTiming(progressValue, { duration: 950 });

          if (newTime <= 0) {
            // Session complete
            if (currentSessionId) {
              endFocusSession(currentSessionId, true);
            }
            setIsRunning(false);
            setSessionComplete(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }

          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, selectedDuration, progress, currentSessionId, endFocusSession]);

  // Pulse animation when running
  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        pulseScale.value = withSpring(1.02, { damping: 15 });
        setTimeout(() => {
          pulseScale.value = withSpring(1, { damping: 15 });
        }, 500);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isRunning, pulseScale]);

  // Reset time when duration changes (only if not running)
  useEffect(() => {
    if (!isRunning && !currentSessionId) {
      setTimeLeft(selectedDuration * 60);
    }
  }, [selectedDuration, isRunning, currentSessionId]);

  const circleAnimatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
  }));

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Session Complete Overlay */}
        {sessionComplete && (
          <Animated.View
            entering={FadeIn.duration(400)}
            className="absolute inset-0 z-50 items-center justify-center px-6"
            style={{ backgroundColor: colors.background }}
          >
            <View
              className="w-24 h-24 rounded-full items-center justify-center mb-8"
              style={{ backgroundColor: colors.success }}
            >
              <Check size={48} color="#ffffff" strokeWidth={3} />
            </View>
            <Text style={{ color: colors.text }} className="text-3xl font-bold text-center">
              Great work!
            </Text>
            <Text style={{ color: colors.textSecondary }} className="text-lg text-center mt-3">
              You completed a {selectedDuration} minute focus session
            </Text>

            {todaysFocusTask && (
              <Pressable
                onPress={handleMarkTaskComplete}
                className="mt-8 px-8 py-4 rounded-2xl active:scale-95"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="text-white font-semibold text-lg">
                  Mark "{todaysFocusTask.title}" Complete
                </Text>
              </Pressable>
            )}

            <Pressable
              onPress={handleComplete}
              className="mt-4 px-8 py-4 rounded-2xl active:opacity-70"
            >
              <Text style={{ color: colors.primary }} className="font-semibold text-lg">
                Start Another Session
              </Text>
            </Pressable>
          </Animated.View>
        )}

        {/* Header */}
        <Animated.View
          entering={FadeInUp.delay(100).duration(500)}
          className="px-6 pt-4 items-center"
        >
          <Text style={{ color: colors.text }} className="text-3xl font-bold">
            Focus Mode
          </Text>
          <Text style={{ color: colors.textSecondary }} className="text-base mt-1">
            Distraction-free deep work
          </Text>
        </Animated.View>

        {/* Current Task */}
        {todaysFocusTask && !isRunning && !currentSessionId && (
          <Animated.View
            entering={FadeInUp.delay(200).duration(500)}
            className="mx-6 mt-6 p-4 rounded-2xl"
            style={{ backgroundColor: colors.card }}
          >
            <Text style={{ color: colors.textMuted }} className="text-sm uppercase tracking-wider">
              Focusing On
            </Text>
            <Text style={{ color: colors.text }} className="text-lg font-semibold mt-1">
              {todaysFocusTask.title}
            </Text>
          </Animated.View>
        )}

        {/* Timer Circle */}
        <View className="flex-1 items-center justify-center">
          <Animated.View style={containerAnimatedStyle}>
            <View style={{ width: CIRCLE_SIZE, height: CIRCLE_SIZE }}>
              <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE}>
                {/* Background Circle */}
                <Circle
                  cx={CIRCLE_SIZE / 2}
                  cy={CIRCLE_SIZE / 2}
                  r={RADIUS}
                  stroke={colors.primaryMuted}
                  strokeWidth={STROKE_WIDTH}
                  fill="transparent"
                />
                {/* Progress Circle */}
                <AnimatedCircle
                  cx={CIRCLE_SIZE / 2}
                  cy={CIRCLE_SIZE / 2}
                  r={RADIUS}
                  stroke={colors.primary}
                  strokeWidth={STROKE_WIDTH}
                  fill="transparent"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeLinecap="round"
                  rotation="-90"
                  origin={`${CIRCLE_SIZE / 2}, ${CIRCLE_SIZE / 2}`}
                  animatedProps={circleAnimatedProps}
                />
              </Svg>

              {/* Timer Text */}
              <View className="absolute inset-0 items-center justify-center">
                <Text style={{ color: colors.text }} className="text-6xl font-bold tracking-tight">
                  {formatTime(timeLeft)}
                </Text>
                {isRunning && (
                  <Text style={{ color: colors.textMuted }} className="text-sm mt-2">
                    Stay focused
                  </Text>
                )}
              </View>
            </View>
          </Animated.View>
        </View>

        {/* Duration Selector */}
        {!isRunning && !currentSessionId && (
          <Animated.View
            entering={FadeInUp.delay(300).duration(500)}
            className="px-6 mb-4"
          >
            <View className="flex-row justify-center space-x-2">
              {DURATIONS.map((duration) => {
                const isLocked = duration.premium && !isPremium;
                const isSelected = selectedDuration === duration.value;

                return (
                  <Pressable
                    key={duration.value}
                    onPress={() => {
                      if (isLocked) {
                        // Show upgrade prompt for 45-min sessions
                        canUseLongSession();
                        return;
                      }
                      setSelectedDuration(duration.value);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    className="px-5 py-3 rounded-xl flex-row items-center"
                    style={{
                      backgroundColor: isSelected ? colors.primary : colors.card,
                      opacity: isLocked ? 0.5 : 1,
                    }}
                  >
                    {isLocked && <Lock size={12} color={colors.textMuted} style={{ marginRight: 4 }} />}
                    <Text
                      style={{ color: isSelected ? '#ffffff' : colors.text }}
                      className="font-semibold"
                    >
                      {duration.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>
        )}

        {/* Controls */}
        <Animated.View
          entering={FadeInUp.delay(400).duration(500)}
          className="px-6 pb-8"
        >
          {/* Free Tier Warning */}
          {!isPremium && !canStartFocusSession() && !isRunning && (
            <View className="mb-4 p-4 rounded-2xl" style={{ backgroundColor: colors.card }}>
              <View className="flex-row items-center justify-center">
                <Lock size={16} color={colors.textMuted} />
                <Text style={{ color: colors.textSecondary }} className="ml-2 text-sm">
                  Free tier: 3 sessions per day. Upgrade for unlimited.
                </Text>
              </View>
            </View>
          )}

          <View className="flex-row justify-center space-x-4">
            {!isRunning && !currentSessionId ? (
              <Pressable
                onPress={handleStart}
                className="flex-1 py-5 rounded-2xl items-center justify-center flex-row active:scale-95"
                style={{
                  backgroundColor: canStartFocusSession() ? colors.primary : colors.card,
                }}
              >
                <Play size={24} color={canStartFocusSession() ? '#ffffff' : colors.textMuted} fill={canStartFocusSession() ? '#ffffff' : colors.textMuted} />
                <Text
                  style={{ color: canStartFocusSession() ? '#ffffff' : colors.textMuted }}
                  className="ml-3 text-xl font-semibold"
                >
                  Start Focus
                </Text>
              </Pressable>
            ) : (
              <>
                {/* Reset Button */}
                <Pressable
                  onPress={handleReset}
                  className="w-16 h-16 rounded-full items-center justify-center active:scale-95"
                  style={{ backgroundColor: colors.card }}
                >
                  <RotateCcw size={24} color={colors.textMuted} />
                </Pressable>

                {/* Play/Pause Button */}
                <Pressable
                  onPress={isRunning ? handlePause : handleResume}
                  className="w-20 h-20 rounded-full items-center justify-center active:scale-95"
                  style={{ backgroundColor: colors.primary }}
                >
                  {isRunning ? (
                    <Pause size={32} color="#ffffff" fill="#ffffff" />
                  ) : (
                    <Play size={32} color="#ffffff" fill="#ffffff" style={{ marginLeft: 4 }} />
                  )}
                </Pressable>

                {/* Spacer for symmetry */}
                <View className="w-16" />
              </>
            )}
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}
