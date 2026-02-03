import React from 'react';
import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { Home, FolderKanban, Target, Calendar, Users } from 'lucide-react-native';
import useAppStore from '@/lib/state/app-store';

export default function TabLayout() {
  const theme = useAppStore((s) => s.theme);
  const isDark = theme === 'dark';

  const colors = {
    background: isDark ? '#1a1a1f' : '#ffffff',
    card: isDark ? '#252529' : '#f5f5f7',
    border: isDark ? '#3a3a40' : '#e5e5e7',
    text: isDark ? '#e8e8e8' : '#1a1a1f',
    textMuted: isDark ? '#6b6b70' : '#8e8e93',
    primary: '#5b9a8b',
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
          height: 85,
          paddingTop: 8,
          paddingBottom: 28,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View className={focused ? 'opacity-100' : 'opacity-70'}>
              <Home size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: 'Projects',
          tabBarIcon: ({ color, focused }) => (
            <View className={focused ? 'opacity-100' : 'opacity-70'}>
              <FolderKanban size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="focus"
        options={{
          title: 'Focus',
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                backgroundColor: focused ? colors.primary : 'transparent',
                borderRadius: 16,
                padding: 10,
                marginTop: -12,
              }}
            >
              <Target
                size={28}
                color={focused ? '#ffffff' : color}
                strokeWidth={focused ? 2.5 : 2}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Schedule',
          tabBarIcon: ({ color, focused }) => (
            <View className={focused ? 'opacity-100' : 'opacity-70'}>
              <Calendar size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarIcon: ({ color, focused }) => (
            <View className={focused ? 'opacity-100' : 'opacity-70'}>
              <Users size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          href: null, // Hide from tab bar but keep accessible
        }}
      />
    </Tabs>
  );
}
