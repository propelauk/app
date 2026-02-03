import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function OnboardingLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: '#171717' },
          gestureEnabled: true,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="step1" />
        <Stack.Screen name="step2" />
        <Stack.Screen name="step3" />
        <Stack.Screen name="step4" />
        <Stack.Screen name="step5" />
        <Stack.Screen name="step6" />
        <Stack.Screen name="step7" />
        <Stack.Screen name="step8" />
        <Stack.Screen name="step9" />
        <Stack.Screen name="step10" />
        <Stack.Screen name="step11" />
        <Stack.Screen name="step12" />
        <Stack.Screen name="step13" />
        <Stack.Screen name="step14" />
        <Stack.Screen name="step15" />
        <Stack.Screen name="step16" />
        <Stack.Screen name="step17" />
        <Stack.Screen name="loading" options={{ gestureEnabled: false }} />
        <Stack.Screen name="paywall" options={{ gestureEnabled: false }} />
        <Stack.Screen name="profile-picture" options={{ gestureEnabled: false }} />
        <Stack.Screen name="login" />
      </Stack>
    </>
  );
}
