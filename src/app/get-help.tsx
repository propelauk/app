import { View, Text, TextInput, Pressable, ScrollView, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { 
  ChevronLeft, 
  Upload, 
  Camera, 
  Link, 
  MessageSquare, 
  DollarSign, 
  Mail, 
  Phone,
  CheckCircle,
  FileText,
  X
} from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import Animated, { FadeInDown, useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import useAppStore from '@/lib/state/app-store';
import { useOnboardingStore } from '@/lib/state/onboarding-store';
import { cn } from '@/lib/cn';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function GetHelpScreen() {
  const router = useRouter();
  const theme = useAppStore((s) => s.theme);
  const isDark = theme === 'dark';
  
  const userEmail = useOnboardingStore((s) => s.email);
  const userName = useOnboardingStore((s) => s.firstName);

  const [selectedFile, setSelectedFile] = useState<{ name: string; size: number; uri: string } | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [message, setMessage] = useState('');
  const [budget, setBudget] = useState('');
  const [email, setEmail] = useState(userEmail || '');
  const [phone, setPhone] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

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

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      
      if (file.size && file.size > MAX_FILE_SIZE) {
        setError('File size must be less than 10MB');
        return;
      }

      setSelectedFile({
        name: file.name,
        size: file.size || 0,
        uri: file.uri,
      });
      setError('');
    } catch (err) {
      setError('Failed to pick file');
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSend = async () => {
    if (!message.trim()) {
      setError('Please describe what you need help with');
      return;
    }
    if (!email || !validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!phone.trim()) {
      setError('Please enter your phone number');
      return;
    }

    setIsSending(true);
    setError('');

    // Simulate sending (this will be connected to backend later)
    setTimeout(() => {
      setIsSending(false);
      setShowSuccess(true);
    }, 1500);
  };

  const isValid = message.trim() && email && phone.trim();

  if (showSuccess) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
        <View className="flex-1 items-center justify-center px-6">
          <Animated.View entering={FadeInDown.duration(500)} className="items-center">
            <View className="w-24 h-24 rounded-full bg-teal-500/20 items-center justify-center mb-6">
              <CheckCircle size={48} color="#2dd4bf" />
            </View>
            <Text style={{ color: colors.text }} className="text-2xl font-bold text-center">
              Request Sent!
            </Text>
            <Text style={{ color: colors.textSecondary }} className="text-center mt-2 px-8">
              Thank you{userName ? `, ${userName}` : ''}! We've received your help request and will get back to you within 24-48 hours.
            </Text>
            <View 
              className="mt-6 p-4 rounded-xl"
              style={{ backgroundColor: colors.card }}
            >
              <Text style={{ color: colors.textSecondary }} className="text-sm text-center">
                📧 We'll respond to: {email}
              </Text>
            </View>
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
          Get Help
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Intro */}
        <Animated.View entering={FadeInDown.duration(500)} className="mb-6">
          <Text style={{ color: colors.text }} className="text-lg font-semibold mb-2">
            Need project assistance?
          </Text>
          <Text style={{ color: colors.textSecondary }} className="text-sm">
            Share your project details and we'll help you stay on track. Upload files, describe your challenges, and let us know your budget.
          </Text>
        </Animated.View>

        {/* File Upload */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} className="mb-4">
          <Text style={{ color: colors.textSecondary }} className="text-sm font-medium mb-2 ml-1">
            Project File (Max 10MB)
          </Text>
          
          {selectedFile ? (
            <View
              className="rounded-xl border p-4 flex-row items-center"
              style={{ backgroundColor: colors.card, borderColor: colors.primary }}
            >
              <FileText size={24} color={colors.primary} />
              <View className="flex-1 ml-3">
                <Text style={{ color: colors.text }} className="font-medium" numberOfLines={1}>
                  {selectedFile.name}
                </Text>
                <Text style={{ color: colors.textSecondary }} className="text-sm">
                  {formatFileSize(selectedFile.size)}
                </Text>
              </View>
              <Pressable onPress={removeFile} className="p-2">
                <X size={20} color="#ef4444" />
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={pickDocument}
              className="rounded-xl border-2 border-dashed p-6 items-center"
              style={{ borderColor: colors.border }}
            >
              <Upload size={32} color={colors.primary} />
              <Text style={{ color: colors.text }} className="font-medium mt-3">
                Tap to upload file
              </Text>
              <Text style={{ color: colors.textSecondary }} className="text-sm mt-1">
                All file types accepted
              </Text>
            </Pressable>
          )}
        </Animated.View>

        {/* Photo/Video Instructions */}
        <Animated.View entering={FadeInDown.delay(150).duration(500)} className="mb-4">
          <View
            className="rounded-xl p-4"
            style={{ backgroundColor: colors.primary + '15' }}
          >
            <View className="flex-row items-start">
              <Camera size={20} color={colors.primary} />
              <View className="flex-1 ml-3">
                <Text style={{ color: colors.text }} className="font-medium text-sm">
                  📸 For visual projects
                </Text>
                <Text style={{ color: colors.textSecondary }} className="text-sm mt-1">
                  Take photos of your work or upload a video link (YouTube, Vimeo, Google Drive, Dropbox, etc.)
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Video URL */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)} className="mb-4">
          <Text style={{ color: colors.textSecondary }} className="text-sm font-medium mb-2 ml-1">
            Video/File URL (Optional)
          </Text>
          <View
            className="flex-row items-center rounded-xl border px-4"
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
          >
            <Link size={20} color={colors.primary} />
            <TextInput
              value={videoUrl}
              onChangeText={setVideoUrl}
              placeholder="Paste link to video or file manager"
              placeholderTextColor={colors.textSecondary}
              style={{ color: colors.text }}
              className="flex-1 ml-3 py-4 text-base"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </Animated.View>

        {/* Message */}
        <Animated.View entering={FadeInDown.delay(250).duration(500)} className="mb-4">
          <Text style={{ color: colors.textSecondary }} className="text-sm font-medium mb-2 ml-1">
            What do you need help with? *
          </Text>
          <View
            className="rounded-xl border px-4 py-3"
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
          >
            <View className="flex-row items-start">
              <MessageSquare size={20} color={colors.primary} className="mt-1" />
              <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder="Describe your project and what assistance you need..."
                placeholderTextColor={colors.textSecondary}
                style={{ color: colors.text }}
                className="flex-1 ml-3 text-base min-h-[120px]"
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>
        </Animated.View>

        {/* Budget */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)} className="mb-4">
          <Text style={{ color: colors.textSecondary }} className="text-sm font-medium mb-2 ml-1">
            Your Budget (USD)
          </Text>
          <View
            className="flex-row items-center rounded-xl border px-4"
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
          >
            <DollarSign size={20} color={colors.primary} />
            <TextInput
              value={budget}
              onChangeText={setBudget}
              placeholder="e.g., 500 or 1000-2000"
              placeholderTextColor={colors.textSecondary}
              style={{ color: colors.text }}
              className="flex-1 ml-3 py-4 text-base"
              keyboardType="numeric"
            />
          </View>
        </Animated.View>

        {/* Email */}
        <Animated.View entering={FadeInDown.delay(350).duration(500)} className="mb-4">
          <Text style={{ color: colors.textSecondary }} className="text-sm font-medium mb-2 ml-1">
            Best Email to Reach You *
          </Text>
          <View
            className="flex-row items-center rounded-xl border px-4"
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
          >
            <Mail size={20} color={colors.primary} />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              placeholderTextColor={colors.textSecondary}
              style={{ color: colors.text }}
              className="flex-1 ml-3 py-4 text-base"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </Animated.View>

        {/* Phone */}
        <Animated.View entering={FadeInDown.delay(400).duration(500)} className="mb-4">
          <Text style={{ color: colors.textSecondary }} className="text-sm font-medium mb-2 ml-1">
            Best Phone Number *
          </Text>
          <View
            className="flex-row items-center rounded-xl border px-4"
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
          >
            <Phone size={20} color={colors.primary} />
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="+1 (555) 000-0000"
              placeholderTextColor={colors.textSecondary}
              style={{ color: colors.text }}
              className="flex-1 ml-3 py-4 text-base"
              keyboardType="phone-pad"
            />
          </View>
        </Animated.View>

        {/* Error */}
        {error ? (
          <Text className="text-red-400 text-sm ml-1 mb-4">{error}</Text>
        ) : null}

        {/* Send Button */}
        <Animated.View entering={FadeInDown.delay(450).duration(500)} className="mt-4">
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
                {isSending ? 'Sending...' : 'Send Request'}
              </Text>
            </Animated.View>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
