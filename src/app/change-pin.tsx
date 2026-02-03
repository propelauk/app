import { View, Text, TextInput, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState, useRef } from 'react';
import { useOnboardingStore } from '@/lib/state/onboarding-store';
import { ChevronLeft, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react-native';
import Animated, { 
  FadeInDown, 
  useAnimatedStyle, 
  withSpring, 
  withSequence,
  useSharedValue 
} from 'react-native-reanimated';
import useAppStore from '@/lib/state/app-store';
import { cn } from '@/lib/cn';

type Step = 'current' | 'new' | 'confirm' | 'success';

export default function ChangePinScreen() {
  const router = useRouter();
  const theme = useAppStore((s) => s.theme);
  const isDark = theme === 'dark';

  const currentStoredPin = useOnboardingStore((s) => s.pin);
  const setPin = useOnboardingStore((s) => s.setPin);

  const [step, setStep] = useState<Step>('current');
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');

  const newPinRef = useRef<TextInput>(null);
  const confirmPinRef = useRef<TextInput>(null);
  const shakeAnimation = useSharedValue(0);

  const colors = {
    background: isDark ? '#171717' : '#f8f8fa',
    card: isDark ? '#252529' : '#ffffff',
    text: isDark ? '#e8e8e8' : '#1a1a1f',
    textSecondary: isDark ? '#9a9a9f' : '#6b6b70',
    border: isDark ? '#3a3a40' : '#e8e8eb',
    primary: '#2dd4bf',
  };

  const animatedShakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeAnimation.value }],
  }));

  const shake = () => {
    shakeAnimation.value = withSequence(
      withSpring(10, { damping: 2, stiffness: 500 }),
      withSpring(-10, { damping: 2, stiffness: 500 }),
      withSpring(10, { damping: 2, stiffness: 500 }),
      withSpring(0, { damping: 2, stiffness: 500 })
    );
  };

  const handlePinChange = (text: string, setter: (val: string) => void) => {
    const numericText = text.replace(/[^0-9]/g, '');
    if (numericText.length <= 4) {
      setter(numericText);
      setError('');
    }
  };

  const handleContinue = () => {
    if (step === 'current') {
      if (currentPin !== currentStoredPin) {
        setError('Incorrect PIN. Please try again.');
        shake();
        return;
      }
      setStep('new');
      setTimeout(() => newPinRef.current?.focus(), 100);
    } else if (step === 'new') {
      if (newPin.length !== 4) {
        setError('Please enter a 4-digit PIN');
        shake();
        return;
      }
      setStep('confirm');
      setTimeout(() => confirmPinRef.current?.focus(), 100);
    } else if (step === 'confirm') {
      if (confirmPin !== newPin) {
        setError('PINs do not match. Please try again.');
        shake();
        setConfirmPin('');
        return;
      }
      setPin(newPin);
      setStep('success');
    }
  };

  const renderPinDots = (pinValue: string) => (
    <View className="flex-row justify-center space-x-4 my-6">
      {[0, 1, 2, 3].map((index) => (
        <View
          key={index}
          className={cn(
            'w-14 h-14 rounded-2xl items-center justify-center border-2',
            pinValue.length > index
              ? 'bg-teal-500/20 border-teal-400'
              : 'border-neutral-600',
            isDark ? 'bg-neutral-800' : 'bg-white'
          )}
        >
          {pinValue.length > index ? (
            showPin ? (
              <Text style={{ color: colors.primary }} className="text-2xl font-bold">
                {pinValue[index]}
              </Text>
            ) : (
              <View className="w-3 h-3 rounded-full bg-teal-400" />
            )
          ) : null}
        </View>
      ))}
    </View>
  );

  const getStepInfo = () => {
    switch (step) {
      case 'current':
        return { title: 'Enter Current PIN', subtitle: 'Please verify your identity' };
      case 'new':
        return { title: 'Create New PIN', subtitle: 'Choose a 4-digit PIN' };
      case 'confirm':
        return { title: 'Confirm New PIN', subtitle: 'Enter your new PIN again' };
      default:
        return { title: '', subtitle: '' };
    }
  };

  const getCurrentPinValue = () => {
    switch (step) {
      case 'current': return currentPin;
      case 'new': return newPin;
      case 'confirm': return confirmPin;
      default: return '';
    }
  };

  const isButtonDisabled = () => {
    switch (step) {
      case 'current': return currentPin.length !== 4;
      case 'new': return newPin.length !== 4;
      case 'confirm': return confirmPin.length !== 4;
      default: return false;
    }
  };

  if (step === 'success') {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
        <View className="flex-1 items-center justify-center px-6">
          <Animated.View entering={FadeInDown.duration(500)} className="items-center">
            <View className="w-24 h-24 rounded-full bg-teal-500/20 items-center justify-center mb-6">
              <CheckCircle size={48} color="#2dd4bf" />
            </View>
            <Text style={{ color: colors.text }} className="text-2xl font-bold text-center">
              PIN Changed!
            </Text>
            <Text style={{ color: colors.textSecondary }} className="text-center mt-2">
              Your security PIN has been updated successfully.
            </Text>
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
          Change PIN
        </Text>
        <View className="w-10" />
      </View>

      <View className="flex-1 px-6 pt-8">
        {/* Icon */}
        <Animated.View entering={FadeInDown.duration(500)} className="items-center mb-8">
          <View className="w-20 h-20 rounded-full bg-teal-500/20 items-center justify-center">
            <Lock size={40} color="#2dd4bf" />
          </View>
        </Animated.View>

        {/* Step Info */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} className="items-center mb-4">
          <Text style={{ color: colors.text }} className="text-2xl font-bold text-center">
            {getStepInfo().title}
          </Text>
          <Text style={{ color: colors.textSecondary }} className="text-center mt-2">
            {getStepInfo().subtitle}
          </Text>
        </Animated.View>

        {/* PIN Input */}
        <Animated.View style={animatedShakeStyle}>
          {renderPinDots(getCurrentPinValue())}
          
          {/* Visible input for web */}
          <TextInput
            ref={step === 'new' ? newPinRef : step === 'confirm' ? confirmPinRef : undefined}
            value={getCurrentPinValue()}
            onChangeText={(text) => {
              if (step === 'current') handlePinChange(text, setCurrentPin);
              else if (step === 'new') handlePinChange(text, setNewPin);
              else handlePinChange(text, setConfirmPin);
            }}
            keyboardType="number-pad"
            maxLength={4}
            autoFocus
            secureTextEntry={!showPin}
            className="text-center text-2xl tracking-[0.5em] rounded-xl px-4 py-3 w-48 self-center border-2"
            style={{ 
              backgroundColor: colors.card, 
              color: colors.text,
              borderColor: colors.border 
            }}
            placeholder="••••"
            placeholderTextColor={colors.textSecondary}
          />
        </Animated.View>

        {/* Toggle visibility */}
        <Pressable
          onPress={() => setShowPin(!showPin)}
          className="flex-row items-center justify-center mt-4"
        >
          {showPin ? (
            <EyeOff size={20} color={colors.textSecondary} />
          ) : (
            <Eye size={20} color={colors.textSecondary} />
          )}
          <Text style={{ color: colors.textSecondary }} className="ml-2">
            {showPin ? 'Hide' : 'Show'} PIN
          </Text>
        </Pressable>

        {/* Error */}
        {error ? (
          <Text className="text-red-400 text-sm text-center mt-4">{error}</Text>
        ) : null}

        {/* Continue Button */}
        <View className="mt-8">
          <Pressable
            onPress={handleContinue}
            disabled={isButtonDisabled()}
            className={cn(
              'py-4 rounded-2xl items-center',
              isButtonDisabled() ? 'bg-neutral-700' : 'bg-teal-500'
            )}
          >
            <Text className={cn(
              'text-lg font-semibold',
              isButtonDisabled() ? 'text-neutral-400' : 'text-neutral-900'
            )}>
              {step === 'confirm' ? 'Change PIN' : 'Continue'}
            </Text>
          </Pressable>
        </View>

        {/* Step back for new/confirm */}
        {(step === 'new' || step === 'confirm') && (
          <Pressable
            onPress={() => {
              if (step === 'confirm') {
                setStep('new');
                setConfirmPin('');
              } else {
                setStep('current');
                setNewPin('');
              }
              setError('');
            }}
            className="mt-4 items-center"
          >
            <Text style={{ color: colors.textSecondary }}>Go Back</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}
