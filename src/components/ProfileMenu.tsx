import { View, Text, Pressable, Image, Modal, Share } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '@/lib/state/onboarding-store';
import {
  User,
  Settings,
  Lock,
  Mail,
  HelpCircle,
  LogOut,
  X,
  ChevronRight,
  Crown,
  Share2,
  Sliders,
} from 'lucide-react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutRight,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { cn } from '@/lib/cn';
import * as Haptics from 'expo-haptics';

const SHARE_MESSAGE = "I use Propela to keep myself focused and boost my productivity 🚀\n\nDownload it now and unlock your potential!";

interface ProfileMenuProps {
  isDark?: boolean;
}

interface MenuItemProps {
  icon: typeof Settings;
  label: string;
  description?: string;
  onPress: () => void;
  iconColor?: string;
  showChevron?: boolean;
  danger?: boolean;
}

function MenuItem({
  icon: Icon,
  label,
  description,
  onPress,
  iconColor = '#2dd4bf',
  showChevron = true,
  danger = false,
}: MenuItemProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.98);
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}
    >
      <Animated.View
        style={animatedStyle}
        className="flex-row items-center py-4 px-4 bg-neutral-800/50 rounded-xl mb-2"
      >
        <View
          className={cn(
            'w-10 h-10 rounded-full items-center justify-center',
            danger ? 'bg-red-500/20' : 'bg-teal-500/20'
          )}
        >
          <Icon size={20} color={danger ? '#ef4444' : iconColor} />
        </View>
        <View className="flex-1 ml-3">
          <Text
            className={cn(
              'font-medium',
              danger ? 'text-red-400' : 'text-white'
            )}
          >
            {label}
          </Text>
          {description && (
            <Text className="text-neutral-500 text-sm mt-0.5">{description}</Text>
          )}
        </View>
        {showChevron && (
          <ChevronRight size={20} color="#525252" />
        )}
      </Animated.View>
    </Pressable>
  );
}

export function ProfileMenu({ isDark = true }: ProfileMenuProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const firstName = useOnboardingStore((s) => s.firstName);
  const lastName = useOnboardingStore((s) => s.lastName);
  const email = useOnboardingStore((s) => s.email);
  const profilePictureUri = useOnboardingStore((s) => s.profilePictureUri);
  const selectedPlan = useOnboardingStore((s) => s.selectedPlan);
  const resetOnboarding = useOnboardingStore((s) => s.resetOnboarding);

  const avatarScale = useSharedValue(1);

  const animatedAvatarStyle = useAnimatedStyle(() => ({
    transform: [{ scale: avatarScale.value }],
  }));

  const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'User';
  const initials = firstName ? firstName.charAt(0).toUpperCase() : 'U';

  const handleOpenMenu = () => {
    setIsMenuOpen(true);
  };

  const handleCloseMenu = () => {
    setIsMenuOpen(false);
  };

  const handleEditProfile = () => {
    handleCloseMenu();
    router.push('/edit-profile');
  };

  const handleChangePin = () => {
    handleCloseMenu();
    router.push('/change-pin');
  };

  const handleChangeEmail = () => {
    handleCloseMenu();
    router.push('/change-email');
  };

  const handleGetHelp = () => {
    handleCloseMenu();
    router.push('/get-help');
  };

  const handleSettings = () => {
    handleCloseMenu();
    router.push('/settings');
  };

  const handleUpgrade = () => {
    handleCloseMenu();
    router.push('/onboarding/paywall');
  };

  const handleShareApp = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await Share.share({
        message: SHARE_MESSAGE,
        title: 'Share Propela',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleLogout = () => {
    handleCloseMenu();
    resetOnboarding();
    router.replace('/onboarding');
  };

  return (
    <>
      {/* Profile Avatar Button */}
      <Pressable
        onPress={handleOpenMenu}
        onPressIn={() => {
          avatarScale.value = withSpring(0.95);
        }}
        onPressOut={() => {
          avatarScale.value = withSpring(1);
        }}
      >
        <Animated.View style={animatedAvatarStyle}>
          {profilePictureUri ? (
            <Image
              source={{ uri: profilePictureUri }}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <LinearGradient
              colors={['#0d9488', '#14b8a6']}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text className="text-white font-bold text-lg">{initials}</Text>
            </LinearGradient>
          )}
        </Animated.View>
      </Pressable>

      {/* Menu Modal */}
      <Modal
        visible={isMenuOpen}
        transparent
        animationType="fade"
        onRequestClose={handleCloseMenu}
      >
        <Pressable
          onPress={handleCloseMenu}
          className="flex-1 bg-black/60"
        >
          <Animated.View
            entering={SlideInRight.duration(300)}
            exiting={SlideOutRight.duration(300)}
            className="absolute top-0 right-0 bottom-0 w-80 bg-neutral-900"
          >
            <Pressable onPress={(e) => e.stopPropagation()}>
              <View className="flex-1 pt-16 px-4">
                {/* Close Button */}
                <Pressable
                  onPress={handleCloseMenu}
                  className="absolute top-12 right-4 w-10 h-10 rounded-full bg-neutral-800 items-center justify-center"
                >
                  <X size={20} color="#fff" />
                </Pressable>

                {/* Profile Header */}
                <View className="items-center mb-8">
                  {profilePictureUri ? (
                    <Image
                      source={{ uri: profilePictureUri }}
                      className="w-24 h-24 rounded-full mb-4"
                    />
                  ) : (
                    <LinearGradient
                      colors={['#0d9488', '#14b8a6', '#2dd4bf']}
                      style={{
                        width: 96,
                        height: 96,
                        borderRadius: 48,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 16,
                      }}
                    >
                      <Text className="text-white font-bold text-4xl">{initials}</Text>
                    </LinearGradient>
                  )}

                  <Text className="text-white text-xl font-bold">{fullName}</Text>
                  {email && (
                    <Text className="text-neutral-400 text-sm mt-1">{email}</Text>
                  )}

                  {/* Plan Badge */}
                  <View
                    className={cn(
                      'flex-row items-center mt-3 px-3 py-1.5 rounded-full',
                      selectedPlan === 'premium'
                        ? 'bg-purple-500/20'
                        : selectedPlan === 'pro'
                        ? 'bg-teal-500/20'
                        : 'bg-neutral-800'
                    )}
                  >
                    {selectedPlan !== 'free' && (
                      <Crown
                        size={14}
                        color={selectedPlan === 'premium' ? '#a855f7' : '#2dd4bf'}
                      />
                    )}
                    <Text
                      className={cn(
                        'text-sm font-medium',
                        selectedPlan === 'premium'
                          ? 'text-purple-400 ml-1'
                          : selectedPlan === 'pro'
                          ? 'text-teal-400 ml-1'
                          : 'text-neutral-400'
                      )}
                    >
                      {selectedPlan === 'premium'
                        ? 'Premium'
                        : selectedPlan === 'pro'
                        ? 'Pro'
                        : 'Free Plan'}
                    </Text>
                  </View>
                </View>

                {/* Menu Items */}
                <View>
                  <MenuItem
                    icon={User}
                    label="Edit Profile"
                    description="Update your name and photo"
                    onPress={handleEditProfile}
                  />

                  <MenuItem
                    icon={Lock}
                    label="Change PIN"
                    description="Update your security PIN"
                    onPress={handleChangePin}
                  />

                  <MenuItem
                    icon={Mail}
                    label="Change Email"
                    description="Update your email address"
                    onPress={handleChangeEmail}
                  />

                  <MenuItem
                    icon={HelpCircle}
                    label="Get Help"
                    description="Ask for project assistance"
                    onPress={handleGetHelp}
                  />

                  <MenuItem
                    icon={Sliders}
                    label="Settings"
                    description="Theme, notifications & more"
                    onPress={handleSettings}
                  />

                  <MenuItem
                    icon={Share2}
                    label="Share Propela"
                    description="Invite friends to stay focused"
                    onPress={handleShareApp}
                  />

                  {selectedPlan === 'free' && (
                    <View className="mt-4 mb-2">
                      <Pressable
                        onPress={handleUpgrade}
                        className="bg-teal-500 rounded-xl py-3 flex-row items-center justify-center"
                      >
                        <Crown size={18} color="#171717" />
                        <Text className="text-neutral-900 font-semibold ml-2">
                          Upgrade to Pro
                        </Text>
                      </Pressable>
                    </View>
                  )}

                  <View className="mt-4 pt-4 border-t border-neutral-800">
                    <MenuItem
                      icon={LogOut}
                      label="Sign Out"
                      onPress={handleLogout}
                      showChevron={false}
                      danger
                    />
                  </View>
                </View>
              </View>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
}
