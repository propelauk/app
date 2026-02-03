import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import useAppStore from '@/lib/state/app-store';
import { useOnboardingStore } from '@/lib/state/onboarding-store';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav({ colorScheme }: { colorScheme: 'light' | 'dark' }) {
  const router = useRouter();
  const segments = useSegments();
  const [isReady, setIsReady] = useState(false);
  const onboardingComplete = useOnboardingStore((s) => s.onboardingComplete);

  // Wait for store to hydrate
  useEffect(() => {
    const unsubscribe = useOnboardingStore.persist.onFinishHydration(() => {
      setIsReady(true);
    });

    // Check if already hydrated
    if (useOnboardingStore.persist.hasHydrated()) {
      setIsReady(true);
    }

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const inOnboarding = segments[0] === 'onboarding';

    if (!onboardingComplete && !inOnboarding) {
      // User hasn't completed onboarding, redirect to onboarding
      router.replace('/onboarding');
    } else if (onboardingComplete && inOnboarding) {
      // User has completed onboarding but is on onboarding screen, redirect to home
      router.replace('/(tabs)');
    }
  }, [isReady, onboardingComplete, segments]);

  if (!isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: '#171717', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#2dd4bf" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}



export default function RootLayout() {
  const theme = useAppStore((s) => s.theme);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardProvider>
          <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
          <RootLayoutNav colorScheme={theme} />
        </KeyboardProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}