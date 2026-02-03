import { View, Text, TextInput, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingLayout } from '@/components/onboarding';
import { useOnboardingStore } from '@/lib/state/onboarding-store';
import { useState, useRef } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withSequence,
  useSharedValue,
} from 'react-native-reanimated';
import { cn } from '@/lib/cn';

export default function Step17Screen() {
  const router = useRouter();
  const pin = useOnboardingStore((s) => s.pin);
  const setPin = useOnboardingStore((s) => s.setPin);
  const markStepComplete = useOnboardingStore((s) => s.markStepComplete);

  const [localPin, setLocalPin] = useState(pin);
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');

  const pinInputRef = useRef<TextInput>(null);
  const confirmInputRef = useRef<TextInput>(null);
  const shakeAnimation = useSharedValue(0);

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

  const handlePinChange = (text: string) => {
    // Only allow numbers
    const numericText = text.replace(/[^0-9]/g, '');
    if (numericText.length <= 4) {
      setLocalPin(numericText);
      setError('');
    }
  };

  const handleConfirmPinChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, '');
    if (numericText.length <= 4) {
      setConfirmPin(numericText);
      setError('');
    }
  };

  const handleContinue = () => {
    if (step === 'enter') {
      if (localPin.length !== 4) {
        setError('Please enter a 4-digit PIN');
        shake();
        return;
      }
      setStep('confirm');
      setTimeout(() => confirmInputRef.current?.focus(), 100);
    } else {
      if (confirmPin !== localPin) {
        setError('PINs do not match. Please try again.');
        shake();
        setConfirmPin('');
        return;
      }
      setPin(localPin);
      markStepComplete(17);
      router.push('/onboarding/loading');
    }
  };

  // For web, we'll use a visible centered input
  const renderPinInput = (
    pinValue: string, 
    onChangeText: (text: string) => void,
    inputRef: React.RefObject<TextInput | null>,
    show: boolean
  ) => {
    return (
      <View className="items-center mt-4">
        {/* Visual PIN dots */}
        <View className="flex-row justify-center space-x-4 mb-4">
          {[0, 1, 2, 3].map((index) => (
            <View
              key={index}
              className={cn(
                'w-14 h-14 rounded-2xl items-center justify-center border-2',
                pinValue.length > index
                  ? 'bg-teal-500/20 border-teal-400'
                  : 'bg-neutral-800 border-neutral-600'
              )}
            >
              {pinValue.length > index ? (
                show ? (
                  <Text className="text-teal-400 text-2xl font-bold">
                    {pinValue[index]}
                  </Text>
                ) : (
                  <View className="w-3 h-3 rounded-full bg-teal-400" />
                )
              ) : null}
            </View>
          ))}
        </View>
        
        {/* Actual input - visible on web for accessibility */}
        <TextInput
          ref={inputRef}
          value={pinValue}
          onChangeText={onChangeText}
          keyboardType="number-pad"
          maxLength={4}
          autoFocus={inputRef === pinInputRef}
          secureTextEntry={!show}
          className="bg-neutral-800 text-white text-center text-2xl tracking-[0.5em] rounded-xl px-4 py-3 w-48 border-2 border-neutral-600 focus:border-teal-400"
          placeholder="••••"
          placeholderTextColor="#525252"
        />
      </View>
    );
  };

  return (
    <OnboardingLayout
      currentStep={17}
      title={step === 'enter' ? 'Create your PIN' : 'Confirm your PIN'}
      subtitle={
        step === 'enter'
          ? 'Choose a 4-digit PIN to secure your account.'
          : 'Enter your PIN again to confirm.'
      }
      onPrimaryPress={handleContinue}
      primaryButtonDisabled={step === 'enter' ? localPin.length !== 4 : confirmPin.length !== 4}
      primaryButtonText={step === 'enter' ? 'Continue' : 'Complete Setup'}
      keyboardAware
    >
      <View className="mt-4">
        {/* Icon */}
        <View className="items-center mb-8">
          <View className="w-24 h-24 rounded-full bg-teal-500/20 items-center justify-center border-2 border-teal-400/30">
            <Lock size={48} color="#2dd4bf" />
          </View>
        </View>

        {/* PIN Input */}
        <Animated.View style={animatedShakeStyle}>
          {step === 'enter' ? (
            <>
              {renderPinInput(localPin, handlePinChange, pinInputRef, showPin)}
              
              {/* Toggle visibility */}
              <Pressable
                onPress={() => setShowPin(!showPin)}
                className="flex-row items-center justify-center mt-4"
              >
                {showPin ? (
                  <EyeOff size={20} color="#a3a3a3" />
                ) : (
                  <Eye size={20} color="#a3a3a3" />
                )}
                <Text className="text-neutral-400 ml-2">
                  {showPin ? 'Hide' : 'Show'} PIN
                </Text>
              </Pressable>
            </>
          ) : (
            <>
              {renderPinInput(confirmPin, handleConfirmPinChange, confirmInputRef, showConfirmPin)}
              
              <Pressable
                onPress={() => setShowConfirmPin(!showConfirmPin)}
                className="flex-row items-center justify-center mt-4"
              >
                {showConfirmPin ? (
                  <EyeOff size={20} color="#a3a3a3" />
                ) : (
                  <Eye size={20} color="#a3a3a3" />
                )}
                <Text className="text-neutral-400 ml-2">
                  {showConfirmPin ? 'Hide' : 'Show'} PIN
                </Text>
              </Pressable>
            </>
          )}
        </Animated.View>

        {/* Error message */}
        {error ? (
          <Text className="text-red-400 text-sm text-center mt-4">{error}</Text>
        ) : null}

        {/* Security note */}
        <View className="mt-8 bg-neutral-800/50 rounded-2xl p-4">
          <Text className="text-neutral-400 text-sm text-center">
            🔐 Your PIN is stored securely on your device and never shared.
          </Text>
        </View>

        {/* Go back option */}
        {step === 'confirm' && (
          <Pressable
            onPress={() => {
              setStep('enter');
              setConfirmPin('');
              setError('');
            }}
            className="mt-4 items-center"
          >
            <Text className="text-neutral-400 text-sm">Change PIN</Text>
          </Pressable>
        )}
      </View>
    </OnboardingLayout>
  );
}
