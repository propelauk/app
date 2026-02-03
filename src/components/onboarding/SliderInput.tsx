import { View, Text, Pressable, Platform } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

interface SliderInputProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  showMarkers?: boolean;
  markers?: number[];
}

export function SliderInput({
  value,
  onChange,
  min,
  max,
  step = 5,
  unit = 'min',
  showMarkers = true,
  markers,
}: SliderInputProps) {
  const [localValue, setLocalValue] = useState(value);
  const [sliderWidth, setSliderWidth] = useState(0);
  const displayScale = useSharedValue(1);
  const thumbPosition = useSharedValue(0);

  useEffect(() => {
    setLocalValue(value);
    if (sliderWidth > 0) {
      thumbPosition.value = ((value - min) / (max - min)) * sliderWidth;
    }
  }, [value, sliderWidth]);

  const animatedDisplayStyle = useAnimatedStyle(() => ({
    transform: [{ scale: displayScale.value }],
  }));

  const animatedThumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: thumbPosition.value - 16 }],
  }));

  const animatedTrackStyle = useAnimatedStyle(() => ({
    width: thumbPosition.value,
  }));

  const updateValue = (newValue: number) => {
    setLocalValue(newValue);
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      displayScale.value = withSpring(1.1, { damping: 15 });
    })
    .onUpdate((event) => {
      const newPosition = Math.max(0, Math.min(sliderWidth, event.x));
      thumbPosition.value = newPosition;
      
      const rawValue = min + (newPosition / sliderWidth) * (max - min);
      const steppedValue = Math.round(rawValue / step) * step;
      const clampedValue = Math.max(min, Math.min(max, steppedValue));
      
      runOnJS(updateValue)(clampedValue);
    })
    .onEnd(() => {
      displayScale.value = withSpring(1);
      runOnJS(onChange)(localValue);
    });

  const tapGesture = Gesture.Tap()
    .onEnd((event) => {
      const newPosition = Math.max(0, Math.min(sliderWidth, event.x));
      thumbPosition.value = withSpring(newPosition);
      
      const rawValue = min + (newPosition / sliderWidth) * (max - min);
      const steppedValue = Math.round(rawValue / step) * step;
      const clampedValue = Math.max(min, Math.min(max, steppedValue));
      
      runOnJS(updateValue)(clampedValue);
      runOnJS(onChange)(clampedValue);
    });

  const composed = Gesture.Race(panGesture, tapGesture);

  const defaultMarkers = markers ?? [min, Math.round((min + max) / 2), max];

  return (
    <View className="py-4">
      {/* Current value display */}
      <View className="items-center mb-8">
        <Animated.View
          style={animatedDisplayStyle}
          className="bg-teal-500/20 border-2 border-teal-400 rounded-3xl px-8 py-4"
        >
          <Text className="text-teal-300 text-5xl font-bold text-center">
            {localValue}
          </Text>
          <Text className="text-teal-400 text-lg text-center mt-1">{unit}</Text>
        </Animated.View>
      </View>

      {/* Custom Slider */}
      <View className="px-2">
        <GestureDetector gesture={composed}>
          <View
            className="h-12 justify-center"
            onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}
          >
            {/* Track background */}
            <View className="h-2 rounded-full bg-neutral-700">
              {/* Active track */}
              <Animated.View
                style={animatedTrackStyle}
                className="h-2 rounded-full bg-teal-400"
              />
            </View>
            {/* Thumb */}
            <Animated.View
              style={animatedThumbStyle}
              className="absolute w-8 h-8 rounded-full bg-teal-400 shadow-lg"
            />
          </View>
        </GestureDetector>
      </View>

      {/* Markers */}
      {showMarkers && (
        <View className="flex-row justify-between px-2 mt-2">
          {defaultMarkers.map((marker) => (
            <Pressable
              key={marker}
              onPress={() => {
                const newPosition = ((marker - min) / (max - min)) * sliderWidth;
                thumbPosition.value = withSpring(newPosition);
                setLocalValue(marker);
                onChange(marker);
              }}
            >
              <Text
                className={`text-sm ${
                  localValue === marker ? 'text-teal-400 font-semibold' : 'text-neutral-500'
                }`}
              >
                {marker} {unit}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}
