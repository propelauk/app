import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Shield } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import useAppStore from '@/lib/state/app-store';

const sections = [
  {
    title: 'Introduction',
    content: `Welcome to Propela ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and related services.

By using Propela, you agree to the collection and use of information in accordance with this policy.`,
  },
  {
    title: 'Information We Collect',
    content: `**Personal Information**
- Name and email address (provided during account creation)
- Profile picture (optional)
- PIN for app security (stored locally on your device only)

**Usage Data**
- Focus session duration and completion
- Task and project data
- App usage patterns and preferences
- Device information (type, operating system)

**We DO NOT collect:**
- Location data
- Contact lists
- Financial information (processed securely by third-party payment providers)`,
  },
  {
    title: 'How We Use Your Information',
    content: `We use the collected information to:

• Provide and maintain our service
• Personalize your experience
• Track your productivity progress
• Send you relevant notifications (with your consent)
• Improve our app based on usage patterns
• Provide customer support
• Communicate about updates and new features

Your focus and task data is primarily stored locally on your device to ensure your privacy and enable offline functionality.`,
  },
  {
    title: 'Data Storage & Security',
    content: `**Local Storage**
Most of your data, including tasks, projects, and focus sessions, is stored locally on your device using encrypted storage. This means:
- Your data is available offline
- You maintain control over your information
- Data syncing (if enabled) is end-to-end encrypted

**Security Measures**
- PIN protection for app access
- Industry-standard encryption for data transmission
- Secure cloud infrastructure for synced data
- Regular security audits and updates`,
  },
  {
    title: 'Third-Party Services',
    content: `We may use third-party services that collect information:

• **Analytics**: To understand how users interact with our app (anonymized data only)
• **Payment Processing**: Secure payment handling through trusted providers
• **Cloud Services**: For optional data backup and sync

These services have their own privacy policies and we encourage you to review them.`,
  },
  {
    title: 'Your Rights',
    content: `You have the right to:

• **Access**: Request a copy of your personal data
• **Correction**: Update or correct your information
• **Deletion**: Request deletion of your account and data
• **Export**: Download your data in a portable format
• **Opt-out**: Disable analytics and marketing communications

To exercise these rights, contact us at privacy@propela.app`,
  },
  {
    title: 'Children\'s Privacy',
    content: `Propela is not intended for use by children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.`,
  },
  {
    title: 'Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. We will notify you of any changes by:

• Posting the new policy in the app
• Updating the "Last Updated" date
• Sending an email notification for significant changes

We encourage you to review this policy periodically.`,
  },
  {
    title: 'Contact Us',
    content: `If you have questions about this Privacy Policy, please contact us:

📧 Email: privacy@propela.app
🌐 Website: www.propela.app/privacy
📍 Address: [Company Address]

For urgent privacy concerns, please include "URGENT" in your subject line.`,
  },
];

export default function PrivacyPolicyScreen() {
  const router = useRouter();
  const theme = useAppStore((s) => s.theme);
  const isDark = theme === 'dark';

  const colors = {
    background: isDark ? '#171717' : '#f8f8fa',
    card: isDark ? '#252529' : '#ffffff',
    text: isDark ? '#e8e8e8' : '#1a1a1f',
    textSecondary: isDark ? '#9a9a9f' : '#6b6b70',
    border: isDark ? '#3a3a40' : '#e8e8eb',
    primary: '#2dd4bf',
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b" style={{ borderColor: colors.border }}>
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full"
        >
          <ChevronLeft size={28} color={colors.text} />
        </Pressable>
        <Text style={{ color: colors.text }} className="text-xl font-bold">
          Privacy Policy
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header Banner */}
        <Animated.View entering={FadeInDown.duration(500)} className="px-6 py-6">
          <View className="items-center mb-4">
            <View className="w-16 h-16 rounded-full bg-teal-500/20 items-center justify-center">
              <Shield size={32} color="#2dd4bf" />
            </View>
          </View>
          <Text style={{ color: colors.text }} className="text-center text-lg font-semibold">
            Your Privacy Matters
          </Text>
          <Text style={{ color: colors.textSecondary }} className="text-center mt-2 text-sm">
            Last Updated: February 2026
          </Text>
        </Animated.View>

        {/* Sections */}
        {sections.map((section, index) => (
          <Animated.View
            key={section.title}
            entering={FadeInDown.delay(100 + index * 50).duration(500)}
            className="px-6 mb-6"
          >
            <View
              className="rounded-xl p-4"
              style={{ backgroundColor: colors.card }}
            >
              <Text style={{ color: colors.primary }} className="text-lg font-bold mb-3">
                {section.title}
              </Text>
              <Text style={{ color: colors.textSecondary }} className="leading-6">
                {section.content}
              </Text>
            </View>
          </Animated.View>
        ))}

        {/* Footer */}
        <View className="px-6 mt-4">
          <View
            className="rounded-xl p-4"
            style={{ backgroundColor: colors.primary + '15' }}
          >
            <Text style={{ color: colors.text }} className="text-center text-sm">
              By using Propela, you acknowledge that you have read and understood this Privacy Policy.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
