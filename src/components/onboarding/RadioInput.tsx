import { Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { cn } from '@/lib/cn';

interface RadioOption<T extends string> {
  value: T;
  label: string;
  description?: string;
  emoji?: string;
}

interface RadioInputProps<T extends string> {
  options: RadioOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  columns?: 1 | 2;
}

function RadioItem<T extends string>({
  option,
  isSelected,
  onPress,
}: {
  option: RadioOption<T>;
  isSelected: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = isSelected ? withSpring(1.02) : withSpring(1);
  }, [isSelected]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.97);
      }}
      onPressOut={() => {
        scale.value = withSpring(isSelected ? 1.02 : 1);
      }}
    >
      <Animated.View
        style={animatedStyle}
        className={cn(
          'p-4 rounded-2xl border-2 mb-3',
          isSelected
            ? 'bg-teal-500/20 border-teal-400'
            : 'bg-neutral-800/50 border-neutral-700'
        )}
      >
        <View className="flex-row items-center">
          {option.emoji && (
            <Text className="text-2xl mr-3">{option.emoji}</Text>
          )}
          <View className="flex-1">
            <Text
              className={cn(
                'text-lg font-semibold',
                isSelected ? 'text-teal-300' : 'text-white'
              )}
            >
              {option.label}
            </Text>
            {option.description && (
              <Text className="text-neutral-400 text-sm mt-1">
                {option.description}
              </Text>
            )}
          </View>
          <View
            className={cn(
              'w-6 h-6 rounded-full border-2 items-center justify-center',
              isSelected ? 'border-teal-400 bg-teal-400' : 'border-neutral-500'
            )}
          >
            {isSelected && (
              <View className="w-3 h-3 rounded-full bg-neutral-900" />
            )}
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

export function RadioInput<T extends string>({
  options,
  value,
  onChange,
  columns = 1,
}: RadioInputProps<T>) {
  if (columns === 2) {
    return (
      <View className="flex-row flex-wrap -mx-1.5">
        {options.map((option) => (
          <View key={option.value} className="w-1/2 px-1.5">
            <RadioItem
              option={option}
              isSelected={value === option.value}
              onPress={() => onChange(option.value)}
            />
          </View>
        ))}
      </View>
    );
  }

  return (
    <View>
      {options.map((option) => (
        <RadioItem
          key={option.value}
          option={option}
          isSelected={value === option.value}
          onPress={() => onChange(option.value)}
        />
      ))}
    </View>
  );
}
