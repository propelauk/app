import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, X, ChevronLeft, ChevronRight, Clock, Target, Coffee, Users, User } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import useAppStore, { TimeBlock } from '@/lib/state/app-store';

const HOURS = Array.from({ length: 16 }, (_, i) => i + 6); // 6am to 9pm

const BLOCK_TYPES: { value: TimeBlock['type']; label: string; Icon: typeof Target; color: string }[] = [
  { value: 'focus', label: 'Focus', Icon: Target, color: '#5b9a8b' },
  { value: 'break', label: 'Break', Icon: Coffee, color: '#c4a574' },
  { value: 'meeting', label: 'Meeting', Icon: Users, color: '#7b8cde' },
  { value: 'personal', label: 'Personal', Icon: User, color: '#de7b8c' },
];

export default function ScheduleScreen() {
  const theme = useAppStore((s) => s.theme);
  const timeBlocks = useAppStore((s) => s.timeBlocks);
  const tasks = useAppStore((s) => s.tasks);
  const addTimeBlock = useAppStore((s) => s.addTimeBlock);
  const deleteTimeBlock = useAppStore((s) => s.deleteTimeBlock);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);

  // Form state
  const [newBlockTitle, setNewBlockTitle] = useState('');
  const [newBlockType, setNewBlockType] = useState<TimeBlock['type']>('focus');
  const [newBlockDuration, setNewBlockDuration] = useState(60); // minutes

  const isDark = theme === 'dark';

  const colors = {
    background: isDark ? '#1a1a1f' : '#f8f8fa',
    card: isDark ? '#252529' : '#ffffff',
    text: isDark ? '#e8e8e8' : '#1a1a1f',
    textSecondary: isDark ? '#9a9a9f' : '#6b6b70',
    textMuted: isDark ? '#6b6b70' : '#9a9a9f',
    primary: '#5b9a8b',
    border: isDark ? '#3a3a40' : '#e8e8eb',
    modalBg: isDark ? '#1a1a1f' : '#ffffff',
    inputBg: isDark ? '#2f2f35' : '#f5f5f7',
    hourLine: isDark ? '#2f2f35' : '#f0f0f2',
  };

  const dateString = useMemo(() =>
    selectedDate.toISOString().split('T')[0],
    [selectedDate]
  );

  const todayBlocks = useMemo(() =>
    timeBlocks.filter((b) => b.date === dateString),
    [timeBlocks, dateString]
  );

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const openAddBlock = (hour: number) => {
    setSelectedHour(hour);
    setNewBlockTitle('');
    setNewBlockType('focus');
    setNewBlockDuration(60);
    setShowAddModal(true);
  };

  const handleAddBlock = () => {
    if (!newBlockTitle.trim() || selectedHour === null) return;

    const startTime = `${selectedHour.toString().padStart(2, '0')}:00`;
    const endHour = selectedHour + Math.ceil(newBlockDuration / 60);
    const endMinutes = newBlockDuration % 60;
    const endTime = `${endHour.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;

    addTimeBlock({
      title: newBlockTitle.trim(),
      startTime,
      endTime,
      date: dateString,
      type: newBlockType,
    });

    setShowAddModal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const getBlockStyle = (block: TimeBlock) => {
    const startHour = parseInt(block.startTime.split(':')[0], 10);
    const startMinutes = parseInt(block.startTime.split(':')[1], 10);
    const endHour = parseInt(block.endTime.split(':')[0], 10);
    const endMinutes = parseInt(block.endTime.split(':')[1], 10);

    const top = (startHour - 6) * 60 + startMinutes;
    const height = (endHour * 60 + endMinutes) - (startHour * 60 + startMinutes);

    const typeConfig = BLOCK_TYPES.find((t) => t.value === block.type);

    return {
      top,
      height: Math.max(height, 30),
      backgroundColor: typeConfig?.color ?? colors.primary,
    };
  };

  const incompleteTasks = useMemo(() =>
    tasks.filter((t) => !t.completed).slice(0, 5),
    [tasks]
  );

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Header */}
        <View className="px-6 pt-4 pb-4">
          <Text style={{ color: colors.text }} className="text-3xl font-bold">
            Schedule
          </Text>
          <Text style={{ color: colors.textSecondary }} className="text-base mt-1">
            Plan your focus time
          </Text>
        </View>

        {/* Date Navigator */}
        <View className="px-6 mb-4">
          <View
            className="flex-row items-center justify-between p-3 rounded-2xl"
            style={{ backgroundColor: colors.card }}
          >
            <Pressable
              onPress={() => navigateDate('prev')}
              className="p-2 active:opacity-50"
            >
              <ChevronLeft size={24} color={colors.text} />
            </Pressable>

            <Text style={{ color: colors.text }} className="text-lg font-semibold">
              {formatDate(selectedDate)}
            </Text>

            <Pressable
              onPress={() => navigateDate('next')}
              className="p-2 active:opacity-50"
            >
              <ChevronRight size={24} color={colors.text} />
            </Pressable>
          </View>
        </View>

        {/* Schedule Grid */}
        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          <View className="relative">
            {/* Hour Lines */}
            {HOURS.map((hour) => (
              <Pressable
                key={hour}
                onPress={() => openAddBlock(hour)}
                className="flex-row h-[60px] active:opacity-70"
              >
                <Text
                  style={{ color: colors.textMuted }}
                  className="w-12 text-sm"
                >
                  {hour.toString().padStart(2, '0')}:00
                </Text>
                <View
                  className="flex-1 border-t ml-2"
                  style={{ borderColor: colors.hourLine }}
                />
              </Pressable>
            ))}

            {/* Time Blocks */}
            <View className="absolute left-14 right-0 top-0">
              {todayBlocks.map((block, index) => {
                const style = getBlockStyle(block);
                const typeConfig = BLOCK_TYPES.find((t) => t.value === block.type);

                return (
                  <Animated.View
                    key={block.id}
                    entering={FadeIn.delay(index * 50).duration(300)}
                    className="absolute left-0 right-2 rounded-xl px-3 py-2"
                    style={{
                      top: style.top,
                      height: style.height,
                      backgroundColor: style.backgroundColor,
                    }}
                  >
                    <Pressable
                      onLongPress={() => {
                        deleteTimeBlock(block.id);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      }}
                      className="flex-1"
                    >
                      <View className="flex-row items-center">
                        {typeConfig && <typeConfig.Icon size={18} color="#ffffff" />}
                        <Text className="text-white font-semibold ml-2 text-sm" numberOfLines={1}>
                          {block.title}
                        </Text>
                      </View>
                      <Text className="text-white/70 text-xs mt-1">
                        {block.startTime} - {block.endTime}
                      </Text>
                    </Pressable>
                  </Animated.View>
                );
              })}
            </View>
          </View>

          {/* Quick Add from Tasks */}
          {incompleteTasks.length > 0 && (
            <Animated.View
              entering={FadeInDown.delay(200).duration(500)}
              className="mt-8"
            >
              <Text style={{ color: colors.text }} className="text-lg font-semibold mb-3">
                Quick Schedule
              </Text>
              <Text style={{ color: colors.textMuted }} className="text-sm mb-3">
                Tap an hour above, or schedule a task:
              </Text>

              {incompleteTasks.map((task) => (
                <View
                  key={task.id}
                  className="flex-row items-center p-3 rounded-xl mb-2"
                  style={{ backgroundColor: colors.card }}
                >
                  <Clock size={16} color={colors.textMuted} />
                  <Text style={{ color: colors.text }} className="flex-1 ml-3">
                    {task.title}
                  </Text>
                  <Pressable
                    onPress={() => {
                      setNewBlockTitle(task.title);
                      setNewBlockType('focus');
                      setSelectedHour(9);
                      setShowAddModal(true);
                    }}
                    className="px-3 py-1 rounded-lg"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <Text className="text-white text-sm font-medium">Schedule</Text>
                  </Pressable>
                </View>
              ))}
            </Animated.View>
          )}
        </ScrollView>

        {/* Floating Add Button */}
        <Pressable
          onPress={() => openAddBlock(9)}
          className="absolute bottom-28 right-6 w-14 h-14 rounded-full items-center justify-center shadow-lg active:scale-95"
          style={{ backgroundColor: colors.primary }}
        >
          <Plus size={28} color="#ffffff" />
        </Pressable>

        {/* Add Block Modal */}
        <Modal
          visible={showAddModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowAddModal(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1"
            style={{ backgroundColor: colors.modalBg }}
          >
            <SafeAreaView className="flex-1">
              <View className="flex-row justify-between items-center px-6 py-4">
                <Pressable onPress={() => setShowAddModal(false)}>
                  <X size={24} color={colors.textMuted} />
                </Pressable>
                <Text style={{ color: colors.text }} className="text-lg font-semibold">
                  Add Time Block
                </Text>
                <Pressable
                  onPress={handleAddBlock}
                  disabled={!newBlockTitle.trim()}
                >
                  <Text
                    style={{ color: newBlockTitle.trim() ? colors.primary : colors.textMuted }}
                    className="text-lg font-semibold"
                  >
                    Add
                  </Text>
                </Pressable>
              </View>

              <View className="px-6 pt-4">
                <Text style={{ color: colors.textSecondary }} className="text-sm font-medium mb-2">
                  What are you scheduling?
                </Text>
                <TextInput
                  value={newBlockTitle}
                  onChangeText={setNewBlockTitle}
                  placeholder="e.g., Deep work on project"
                  placeholderTextColor={colors.textMuted}
                  className="text-lg p-4 rounded-xl"
                  style={{ backgroundColor: colors.inputBg, color: colors.text }}
                  autoFocus
                />

                <Text style={{ color: colors.textSecondary }} className="text-sm font-medium mt-6 mb-3">
                  Type
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {BLOCK_TYPES.map((type) => {
                    const IconComponent = type.Icon;
                    return (
                      <Pressable
                        key={type.value}
                        onPress={() => setNewBlockType(type.value)}
                        className="flex-row items-center px-4 py-3 rounded-xl"
                        style={{
                          backgroundColor: newBlockType === type.value ? type.color : colors.card,
                        }}
                      >
                        <IconComponent
                          size={18}
                          color={newBlockType === type.value ? '#ffffff' : type.color}
                        />
                        <Text
                          style={{ color: newBlockType === type.value ? '#ffffff' : colors.text }}
                          className="ml-2 font-medium"
                        >
                          {type.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Text style={{ color: colors.textSecondary }} className="text-sm font-medium mt-6 mb-3">
                  Duration
                </Text>
                <View className="flex-row gap-2">
                  {[30, 60, 90, 120].map((duration) => (
                    <Pressable
                      key={duration}
                      onPress={() => setNewBlockDuration(duration)}
                      className="flex-1 py-3 rounded-xl items-center"
                      style={{
                        backgroundColor: newBlockDuration === duration ? colors.primary : colors.card,
                      }}
                    >
                      <Text
                        style={{ color: newBlockDuration === duration ? '#ffffff' : colors.text }}
                        className="font-medium"
                      >
                        {duration}m
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={{ color: colors.textMuted }} className="text-sm mt-6">
                  Starting at {selectedHour?.toString().padStart(2, '0')}:00
                </Text>
              </View>
            </SafeAreaView>
          </KeyboardAvoidingView>
        </Modal>
      </SafeAreaView>
    </View>
  );
}
