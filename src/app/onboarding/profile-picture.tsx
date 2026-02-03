import { View, Text, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useOnboardingStore } from '@/lib/state/onboarding-store';
import { Camera, User, ImagePlus } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfilePictureScreen() {
  const router = useRouter();
  const firstName = useOnboardingStore((s) => s.firstName);
  const profilePictureUri = useOnboardingStore((s) => s.profilePictureUri);
  const setProfilePictureUri = useOnboardingStore((s) => s.setProfilePictureUri);
  const completeOnboarding = useOnboardingStore((s) => s.completeOnboarding);

  const [isLoading, setIsLoading] = useState(false);
  const buttonScale = useSharedValue(1);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      return;
    }

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

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setProfilePictureUri(result.assets[0].uri);
    }
  };

  const handleContinue = () => {
    // Mark onboarding as complete and navigate to main app
    completeOnboarding();
    router.replace('/(tabs)');
  };

  const handleSkip = () => {
    // Mark onboarding as complete even when skipping
    completeOnboarding();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-900">
      <View className="flex-1 px-6 justify-center">
        {/* Header */}
        <Animated.View entering={FadeInUp.duration(500)} className="items-center mb-8">
          <Text className="text-white text-3xl font-bold text-center">
            Add a profile picture
          </Text>
          <Text className="text-neutral-400 text-base text-center mt-2">
            Help us personalize your experience{firstName ? `, ${firstName}` : ''}
          </Text>
        </Animated.View>

        {/* Profile Picture Preview */}
        <Animated.View
          entering={FadeInUp.duration(500).delay(200)}
          className="items-center mb-8"
        >
          <Pressable onPress={pickImage}>
            {profilePictureUri ? (
              <View className="relative">
                <Image
                  source={{ uri: profilePictureUri }}
                  className="w-40 h-40 rounded-full"
                />
                <View className="absolute bottom-0 right-0 w-12 h-12 bg-teal-500 rounded-full items-center justify-center border-4 border-neutral-900">
                  <Camera size={20} color="#171717" />
                </View>
              </View>
            ) : (
              <LinearGradient
                colors={['#0d9488', '#14b8a6', '#2dd4bf']}
                style={{
                  width: 160,
                  height: 160,
                  borderRadius: 80,
                  padding: 3,
                }}
              >
                <View className="flex-1 rounded-full bg-neutral-900 items-center justify-center">
                  <User size={64} color="#525252" />
                  <View className="absolute bottom-0 right-0 w-12 h-12 bg-teal-500 rounded-full items-center justify-center border-4 border-neutral-900">
                    <Camera size={20} color="#171717" />
                  </View>
                </View>
              </LinearGradient>
            )}
          </Pressable>
        </Animated.View>

        {/* Options */}
        <Animated.View
          entering={FadeInUp.duration(500).delay(400)}
          className="space-y-3"
        >
          <Pressable
            onPress={pickImage}
            className="bg-neutral-800 rounded-2xl p-4 flex-row items-center mb-3"
          >
            <View className="w-12 h-12 rounded-full bg-teal-500/20 items-center justify-center">
              <ImagePlus size={24} color="#2dd4bf" />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-white font-semibold">Choose from library</Text>
              <Text className="text-neutral-400 text-sm">Pick your best photo</Text>
            </View>
          </Pressable>

          <Pressable
            onPress={takePhoto}
            className="bg-neutral-800 rounded-2xl p-4 flex-row items-center"
          >
            <View className="w-12 h-12 rounded-full bg-teal-500/20 items-center justify-center">
              <Camera size={24} color="#2dd4bf" />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-white font-semibold">Take a photo</Text>
              <Text className="text-neutral-400 text-sm">Use your camera</Text>
            </View>
          </Pressable>
        </Animated.View>
      </View>

      {/* Bottom Buttons */}
      <View className="px-6 pb-6">
        <Animated.View entering={FadeInUp.duration(500).delay(600)}>
          <Pressable
            onPress={handleContinue}
            onPressIn={() => {
              buttonScale.value = withSpring(0.97);
            }}
            onPressOut={() => {
              buttonScale.value = withSpring(1);
            }}
          >
            <Animated.View
              style={animatedButtonStyle}
              className="bg-teal-500 py-4 rounded-2xl items-center"
            >
              <Text className="text-neutral-900 text-lg font-semibold">
                {profilePictureUri ? 'Continue' : 'Continue without photo'}
              </Text>
            </Animated.View>
          </Pressable>
        </Animated.View>

        {!profilePictureUri && (
          <Animated.View entering={FadeInUp.duration(500).delay(800)}>
            <Pressable onPress={handleSkip} className="py-4 items-center mt-2">
              <Text className="text-neutral-400 text-base">Skip for now</Text>
            </Pressable>
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
}
