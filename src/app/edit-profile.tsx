import { View, Text, TextInput, Pressable, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useOnboardingStore } from '@/lib/state/onboarding-store';
import { ChevronLeft, Camera, User, Briefcase, MapPin, Calendar, Heart } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import Animated, { FadeInDown, useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import useAppStore from '@/lib/state/app-store';
import { cn } from '@/lib/cn';

export default function EditProfileScreen() {
  const router = useRouter();
  const theme = useAppStore((s) => s.theme);
  const isDark = theme === 'dark';

  const firstName = useOnboardingStore((s) => s.firstName);
  const lastName = useOnboardingStore((s) => s.lastName);
  const profilePictureUri = useOnboardingStore((s) => s.profilePictureUri);
  const setName = useOnboardingStore((s) => s.setName);
  const setProfilePictureUri = useOnboardingStore((s) => s.setProfilePictureUri);

  const [localFirstName, setLocalFirstName] = useState(firstName);
  const [localLastName, setLocalLastName] = useState(lastName);
  const [bio, setBio] = useState('');
  const [occupation, setOccupation] = useState('');
  const [location, setLocation] = useState('');
  const [birthday, setBirthday] = useState('');
  const [interests, setInterests] = useState('');
  const [isSaving, setIsSaving] = useState(false);
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

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setProfilePictureUri(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    
    // Save the name
    setName(localFirstName, localLastName);
    
    // Simulate save delay
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        router.back();
      }, 1500);
    }, 500);
  };

  const initials = localFirstName ? localFirstName.charAt(0).toUpperCase() : 'U';

  const InputField = ({ 
    label, 
    value, 
    onChangeText, 
    placeholder, 
    icon: Icon,
    multiline = false 
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    icon: typeof User;
    multiline?: boolean;
  }) => (
    <View className="mb-4">
      <Text style={{ color: colors.textSecondary }} className="text-sm font-medium mb-2 ml-1">
        {label}
      </Text>
      <View
        className={cn(
          'flex-row items-center rounded-xl border px-4',
          multiline ? 'py-3' : 'py-0'
        )}
        style={{ backgroundColor: colors.card, borderColor: colors.border }}
      >
        <Icon size={20} color={colors.primary} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          style={{ color: colors.text }}
          className={cn('flex-1 ml-3 text-base', multiline ? 'min-h-[100px]' : 'py-4')}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
        />
      </View>
    </View>
  );

  if (showSuccess) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
        <View className="flex-1 items-center justify-center px-6">
          <Animated.View entering={FadeInDown.duration(500)}>
            <View className="w-24 h-24 rounded-full bg-teal-500/20 items-center justify-center mb-6">
              <Text className="text-5xl">✓</Text>
            </View>
            <Text style={{ color: colors.text }} className="text-2xl font-bold text-center">
              Profile Updated!
            </Text>
            <Text style={{ color: colors.textSecondary }} className="text-center mt-2">
              Your changes have been saved.
            </Text>
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
          Edit Profile
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Profile Picture */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} className="items-center mb-8">
          <Pressable onPress={pickImage} className="relative">
            {profilePictureUri ? (
              <Image
                source={{ uri: profilePictureUri }}
                className="w-32 h-32 rounded-full"
              />
            ) : (
              <LinearGradient
                colors={['#0d9488', '#14b8a6', '#2dd4bf']}
                style={{
                  width: 128,
                  height: 128,
                  borderRadius: 64,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text className="text-white font-bold text-5xl">{initials}</Text>
              </LinearGradient>
            )}
            <View className="absolute bottom-0 right-0 w-10 h-10 bg-teal-500 rounded-full items-center justify-center border-4" style={{ borderColor: colors.background }}>
              <Camera size={20} color="#171717" />
            </View>
          </Pressable>
          <Text style={{ color: colors.primary }} className="mt-3 font-medium">
            Tap to change photo
          </Text>
        </Animated.View>

        {/* Form Fields */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <InputField
            label="First Name"
            value={localFirstName}
            onChangeText={setLocalFirstName}
            placeholder="Your first name"
            icon={User}
          />

          <InputField
            label="Last Name"
            value={localLastName}
            onChangeText={setLocalLastName}
            placeholder="Your last name"
            icon={User}
          />

          <InputField
            label="Bio"
            value={bio}
            onChangeText={setBio}
            placeholder="Tell us about yourself, your goals, and what drives you..."
            icon={Heart}
            multiline
          />

          <InputField
            label="Occupation"
            value={occupation}
            onChangeText={setOccupation}
            placeholder="What do you do?"
            icon={Briefcase}
          />

          <InputField
            label="Location"
            value={location}
            onChangeText={setLocation}
            placeholder="City, Country"
            icon={MapPin}
          />

          <InputField
            label="Birthday"
            value={birthday}
            onChangeText={setBirthday}
            placeholder="MM/DD/YYYY"
            icon={Calendar}
          />

          <InputField
            label="Interests"
            value={interests}
            onChangeText={setInterests}
            placeholder="What are you passionate about? (e.g., coding, music, fitness)"
            icon={Heart}
            multiline
          />
        </Animated.View>

        {/* Save Button */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)} className="mt-6">
          <Pressable
            onPress={handleSave}
            disabled={isSaving}
            onPressIn={() => { buttonScale.value = withSpring(0.97); }}
            onPressOut={() => { buttonScale.value = withSpring(1); }}
          >
            <Animated.View
              style={animatedButtonStyle}
              className={cn(
                'py-4 rounded-2xl items-center',
                isSaving ? 'bg-teal-600' : 'bg-teal-500'
              )}
            >
              <Text className="text-neutral-900 text-lg font-semibold">
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Text>
            </Animated.View>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
