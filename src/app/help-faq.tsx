import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ChevronLeft, ChevronDown, ChevronUp, HelpCircle, MessageCircle, Zap, Shield, CreditCard, Smartphone } from 'lucide-react-native';
import Animated, { FadeInDown, useAnimatedStyle, withTiming, useSharedValue } from 'react-native-reanimated';
import useAppStore from '@/lib/state/app-store';
import { cn } from '@/lib/cn';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    id: '1',
    category: 'Getting Started',
    question: 'How do I create my first project?',
    answer: 'Go to the Projects tab and tap the "+" button. Give your project a name, choose a color, and you\'re ready to go! You can add tasks to your project right away.',
  },
  {
    id: '2',
    category: 'Getting Started',
    question: 'What is a Focus Session?',
    answer: 'A Focus Session is a dedicated time block where you work on a specific task without distractions. We use the Pomodoro technique - typically 25 minutes of focused work followed by a 5-minute break. You can customize these durations in settings.',
  },
  {
    id: '3',
    category: 'Focus Timer',
    question: 'How does the focus timer work?',
    answer: 'Start a focus session by tapping the play button on the Focus tab. The timer will count down your focus duration. When complete, you\'ll be reminded to take a break. Completing sessions builds your streak!',
  },
  {
    id: '4',
    category: 'Focus Timer',
    question: 'Can I customize my focus and break durations?',
    answer: 'Yes! Go to Settings > Focus Settings to adjust your preferred focus duration (10-60 minutes) and break duration (5-15 minutes). Find what works best for your ADHD brain.',
  },
  {
    id: '5',
    category: 'ADHD Support',
    question: 'How is this app designed for ADHD?',
    answer: 'We understand ADHD challenges like overwhelm, distraction, and difficulty starting tasks. That\'s why we offer: bite-sized tasks, visual progress tracking, gentle reminders, streaks for motivation, and a calm, non-overwhelming interface.',
  },
  {
    id: '6',
    category: 'ADHD Support',
    question: 'What if I keep getting distracted?',
    answer: 'It\'s okay - that\'s normal with ADHD! Try shorter focus sessions (even 10 minutes counts), remove phone notifications during sessions, and use our "Today\'s Focus" feature to commit to just one important task.',
  },
  {
    id: '7',
    category: 'Premium',
    question: 'What\'s included in Premium?',
    answer: 'Premium unlocks: unlimited projects, detailed analytics, custom themes, streak protection (save your streak if you miss a day), AI-powered insights, and priority support.',
  },
  {
    id: '8',
    category: 'Premium',
    question: 'Can I try Premium for free?',
    answer: 'Yes! We offer a 7-day free trial of Premium. You can cancel anytime during the trial and won\'t be charged.',
  },
  {
    id: '9',
    category: 'Account',
    question: 'How do I change my PIN?',
    answer: 'Go to your Profile (tap your avatar) > Change PIN. You\'ll need to enter your current PIN first, then create a new 4-digit PIN.',
  },
  {
    id: '10',
    category: 'Account',
    question: 'Is my data secure?',
    answer: 'Yes! Your data is encrypted and stored securely. Your PIN is stored only on your device. We never share your personal information with third parties.',
  },
  {
    id: '11',
    category: 'Troubleshooting',
    question: 'The app is running slowly, what should I do?',
    answer: 'Try closing and reopening the app. If issues persist, go to Settings > Clear Cache. Make sure you have the latest version of the app installed.',
  },
  {
    id: '12',
    category: 'Troubleshooting',
    question: 'I lost my streak, can I recover it?',
    answer: 'Premium users have Streak Protection which can restore your streak. Free users: don\'t worry! Every day is a fresh start. Your progress is still saved.',
  },
];

const categories = [...new Set(faqData.map(item => item.category))];

const categoryIcons: Record<string, typeof HelpCircle> = {
  'Getting Started': Zap,
  'Focus Timer': Zap,
  'ADHD Support': HelpCircle,
  'Premium': CreditCard,
  'Account': Shield,
  'Troubleshooting': Smartphone,
};

export default function HelpFaqScreen() {
  const router = useRouter();
  const theme = useAppStore((s) => s.theme);
  const isDark = theme === 'dark';
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const colors = {
    background: isDark ? '#171717' : '#f8f8fa',
    card: isDark ? '#252529' : '#ffffff',
    text: isDark ? '#e8e8e8' : '#1a1a1f',
    textSecondary: isDark ? '#9a9a9f' : '#6b6b70',
    border: isDark ? '#3a3a40' : '#e8e8eb',
    primary: '#2dd4bf',
  };

  const filteredFaqs = selectedCategory 
    ? faqData.filter(item => item.category === selectedCategory)
    : faqData;

  const FAQItemComponent = ({ item, index }: { item: FAQItem; index: number }) => {
    const isExpanded = expandedId === item.id;

    return (
      <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
        <Pressable
          onPress={() => setExpandedId(isExpanded ? null : item.id)}
          className="rounded-xl mb-3 overflow-hidden"
          style={{ backgroundColor: colors.card }}
        >
          <View className="flex-row items-center p-4">
            <View className="flex-1 pr-4">
              <Text style={{ color: colors.primary }} className="text-xs font-medium mb-1">
                {item.category}
              </Text>
              <Text style={{ color: colors.text }} className="font-medium">
                {item.question}
              </Text>
            </View>
            {isExpanded ? (
              <ChevronUp size={20} color={colors.textSecondary} />
            ) : (
              <ChevronDown size={20} color={colors.textSecondary} />
            )}
          </View>
          
          {isExpanded && (
            <View className="px-4 pb-4">
              <View className="h-px mb-3" style={{ backgroundColor: colors.border }} />
              <Text style={{ color: colors.textSecondary }} className="leading-6">
                {item.answer}
              </Text>
            </View>
          )}
        </Pressable>
      </Animated.View>
    );
  };

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
          Help & FAQ
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Search/Contact Banner */}
        <View className="px-6 mb-6">
          <View
            className="rounded-xl p-4"
            style={{ backgroundColor: colors.primary + '15' }}
          >
            <View className="flex-row items-center">
              <MessageCircle size={24} color={colors.primary} />
              <View className="flex-1 ml-3">
                <Text style={{ color: colors.text }} className="font-medium">
                  Can't find what you need?
                </Text>
                <Pressable onPress={() => router.push('/get-help')}>
                  <Text style={{ color: colors.primary }} className="font-medium mt-1">
                    Contact Support →
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4"
          contentContainerStyle={{ paddingHorizontal: 24 }}
        >
          <Pressable
            onPress={() => setSelectedCategory(null)}
            className={cn(
              'px-4 py-2 rounded-full mr-2',
              !selectedCategory ? 'bg-teal-500' : ''
            )}
            style={selectedCategory ? { backgroundColor: colors.card } : undefined}
          >
            <Text 
              className={cn('font-medium', !selectedCategory ? 'text-neutral-900' : '')}
              style={selectedCategory ? { color: colors.textSecondary } : undefined}
            >
              All
            </Text>
          </Pressable>
          {categories.map((category) => {
            const isSelected = selectedCategory === category;
            return (
              <Pressable
                key={category}
                onPress={() => setSelectedCategory(category)}
                className={cn(
                  'px-4 py-2 rounded-full mr-2',
                  isSelected ? 'bg-teal-500' : ''
                )}
                style={!isSelected ? { backgroundColor: colors.card } : undefined}
              >
                <Text 
                  className={cn('font-medium', isSelected ? 'text-neutral-900' : '')}
                  style={!isSelected ? { color: colors.textSecondary } : undefined}
                >
                  {category}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* FAQ List */}
        <View className="px-6">
          {filteredFaqs.map((item, index) => (
            <FAQItemComponent key={item.id} item={item} index={index} />
          ))}
        </View>

        {/* Still need help */}
        <View className="px-6 mt-6">
          <Pressable
            onPress={() => router.push('/send-feedback')}
            className="rounded-xl p-4"
            style={{ backgroundColor: colors.card }}
          >
            <Text style={{ color: colors.text }} className="font-medium text-center">
              💬 Send us feedback
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
