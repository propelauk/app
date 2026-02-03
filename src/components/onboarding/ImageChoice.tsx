import { Pressable, Text, View, Image } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { cn } from '@/lib/cn';

interface ImageOption<T extends string> {
  value: T;
  label: string;
  imageUrl?: string;
  emoji?: string;
  color?: string;
}

interface ImageChoiceProps<T extends string> {
  options: ImageOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  columns?: 2 | 3;
}

function ImageOptionItem<T extends string>({
  option,
  isSelected,
  onPress,
}: {
  option: ImageOption<T>;
  isSelected: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = isSelected ? withSpring(1.05) : withSpring(1);
  }, [isSelected]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.95);
      }}
      onPressOut={() => {
        scale.value = withSpring(isSelected ? 1.05 : 1);
      }}
      className="flex-1 p-1.5"
    >
      <Animated.View
        style={[
          animatedStyle,
          option.color ? { backgroundColor: option.color + '30' } : undefined,
        ]}
        className={cn(
          'rounded-2xl border-2 overflow-hidden aspect-square items-center justify-center',
          isSelected
            ? 'border-teal-400 bg-teal-500/20'
            : 'border-neutral-700 bg-neutral-800/50'
        )}
      >
        {option.imageUrl ? (
          <Image
            source={{ uri: option.imageUrl }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : option.emoji ? (
          <Text className="text-5xl">{option.emoji}</Text>
        ) : null}

        {/* Selection indicator */}
        {isSelected && (
          <View className="absolute top-2 right-2 w-6 h-6 rounded-full bg-teal-400 items-center justify-center">
            <Text className="text-neutral-900 text-xs font-bold">✓</Text>
          </View>
        )}
      </Animated.View>

      <Text
        className={cn(
          'text-center mt-2 text-sm font-medium',
          isSelected ? 'text-teal-300' : 'text-neutral-300'
        )}
      >
        {option.label}
      </Text>
    </Pressable>
  );
}

export function ImageChoice<T extends string>({
  options,
  value,
  onChange,
  columns = 2,
}: ImageChoiceProps<T>) {
  const rows: ImageOption<T>[][] = [];
  for (let i = 0; i < options.length; i += columns) {
    rows.push(options.slice(i, i + columns));
  }

  return (
    <View className="-mx-1.5">
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} className="flex-row">
          {row.map((option) => (
            <ImageOptionItem
              key={option.value}
              option={option}
              isSelected={value === option.value}
              onPress={() => onChange(option.value)}
            />
          ))}
          {/* Fill empty spaces in last row */}
          {row.length < columns &&
            Array(columns - row.length)
              .fill(null)
              .map((_, i) => <View key={`empty-${i}`} className="flex-1 p-1.5" />)}
        </View>
      ))}
    </View>
  );
}
