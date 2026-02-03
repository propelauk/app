import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type FocusStruggle = 'distractions' | 'overwhelm' | 'procrastination' | 'all';
export type MotivationType = 'rewards' | 'deadlines' | 'accountability' | 'progress';
export type TaskStyle = 'small-tasks' | 'single-focus' | 'mixed';
export type ThemePreference = 'dark' | 'light' | 'auto';
export type NotificationPreference = 'gentle' | 'daily-summary' | 'none';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'flexible';
export type GoalType = 'long-term' | 'short-term' | 'both';
export type PlanType = 'free' | 'pro' | 'premium';
export type BillingCycle = 'monthly' | 'yearly';

interface QuizAnswers {
  currentProductivity: number; // 1-5 scale
  consistencyLevel: number; // 1-5 scale
  distractionFrequency: number; // 1-5 scale
}

interface OnboardingState {
  // Step tracking
  currentStep: number;
  completedSteps: number[];
  onboardingComplete: boolean;

  // Step 1: Focus struggle
  focusStruggle: FocusStruggle | null;

  // Step 2: Focus duration (minutes)
  focusDuration: number;

  // Step 3: Break duration (minutes)
  breakDuration: number;

  // Step 4: Work/Study context
  workContext: string | null;

  // Step 5: Motivation type
  motivationType: MotivationType | null;

  // Step 6: Task style
  taskStyle: TaskStyle | null;

  // Step 7: Theme preference
  themePreference: ThemePreference;

  // Step 9: Notification preference
  notificationPreference: NotificationPreference;

  // Step 10: Time of day
  preferredTimeOfDay: TimeOfDay | null;

  // Step 11: Streak commitment (days per week)
  streakCommitment: number;

  // Step 12: Goal type
  goalType: GoalType | null;

  // Step 13: Quiz answers
  quizAnswers: QuizAnswers;

  // Step 15: Name
  firstName: string;
  lastName: string;

  // Step 16: Email
  email: string;

  // Step 17: PIN
  pin: string;

  // Step 19: Plan selection
  selectedPlan: PlanType;
  billingCycle: BillingCycle;

  // Profile
  profilePictureUri: string | null;

  // Actions
  setCurrentStep: (step: number) => void;
  markStepComplete: (step: number) => void;
  setFocusStruggle: (value: FocusStruggle) => void;
  setFocusDuration: (value: number) => void;
  setBreakDuration: (value: number) => void;
  setWorkContext: (value: string) => void;
  setMotivationType: (value: MotivationType) => void;
  setTaskStyle: (value: TaskStyle) => void;
  setThemePreference: (value: ThemePreference) => void;
  setNotificationPreference: (value: NotificationPreference) => void;
  setPreferredTimeOfDay: (value: TimeOfDay) => void;
  setStreakCommitment: (value: number) => void;
  setGoalType: (value: GoalType) => void;
  setQuizAnswers: (answers: Partial<QuizAnswers>) => void;
  setName: (firstName: string, lastName: string) => void;
  setEmail: (email: string) => void;
  setPin: (pin: string) => void;
  setSelectedPlan: (plan: PlanType) => void;
  setBillingCycle: (cycle: BillingCycle) => void;
  setProfilePictureUri: (uri: string | null) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

const initialState = {
  currentStep: 0,
  completedSteps: [],
  onboardingComplete: false,
  focusStruggle: null,
  focusDuration: 25,
  breakDuration: 5,
  workContext: null,
  motivationType: null,
  taskStyle: null,
  themePreference: 'auto' as ThemePreference,
  notificationPreference: 'gentle' as NotificationPreference,
  preferredTimeOfDay: null,
  streakCommitment: 5,
  goalType: null,
  quizAnswers: {
    currentProductivity: 3,
    consistencyLevel: 3,
    distractionFrequency: 3,
  },
  firstName: '',
  lastName: '',
  email: '',
  pin: '',
  selectedPlan: 'free' as PlanType,
  billingCycle: 'yearly' as BillingCycle,
  profilePictureUri: null,
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      ...initialState,

      setCurrentStep: (step) => set({ currentStep: step }),

      markStepComplete: (step) =>
        set((state) => ({
          completedSteps: state.completedSteps.includes(step)
            ? state.completedSteps
            : [...state.completedSteps, step],
        })),

      setFocusStruggle: (value) => set({ focusStruggle: value }),
      setFocusDuration: (value) => set({ focusDuration: value }),
      setBreakDuration: (value) => set({ breakDuration: value }),
      setWorkContext: (value) => set({ workContext: value }),
      setMotivationType: (value) => set({ motivationType: value }),
      setTaskStyle: (value) => set({ taskStyle: value }),
      setThemePreference: (value) => set({ themePreference: value }),
      setNotificationPreference: (value) => set({ notificationPreference: value }),
      setPreferredTimeOfDay: (value) => set({ preferredTimeOfDay: value }),
      setStreakCommitment: (value) => set({ streakCommitment: value }),
      setGoalType: (value) => set({ goalType: value }),

      setQuizAnswers: (answers) =>
        set((state) => ({
          quizAnswers: { ...state.quizAnswers, ...answers },
        })),

      setName: (firstName, lastName) => set({ firstName, lastName }),
      setEmail: (email) => set({ email }),
      setPin: (pin) => set({ pin }),
      setSelectedPlan: (plan) => set({ selectedPlan: plan }),
      setBillingCycle: (cycle) => set({ billingCycle: cycle }),
      setProfilePictureUri: (uri) => set({ profilePictureUri: uri }),

      completeOnboarding: () => set({ onboardingComplete: true }),

      resetOnboarding: () => set(initialState),
    }),
    {
      name: 'onboarding-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Motivational messages based on user selections
export const getMotivationalMessage = (state: OnboardingState): string => {
  const messages: string[] = [];

  if (state.focusStruggle === 'distractions') {
    messages.push("We'll help you build a distraction-free zone.");
  } else if (state.focusStruggle === 'overwhelm') {
    messages.push("We'll break things down into manageable pieces.");
  } else if (state.focusStruggle === 'procrastination') {
    messages.push("We'll help you take that first step.");
  }

  if (state.motivationType === 'rewards') {
    messages.push('Unlock achievements as you progress!');
  } else if (state.motivationType === 'deadlines') {
    messages.push("We'll keep you on track with gentle reminders.");
  } else if (state.motivationType === 'accountability') {
    messages.push("You're building something great—we're here to support you.");
  }

  if (state.taskStyle === 'small-tasks') {
    messages.push('Small wins lead to big victories.');
  }

  return messages.length > 0
    ? messages.join(' ')
    : "You're taking the first step toward better focus. Let's do this together!";
};

// Get productivity score based on quiz
export const getProductivityScore = (quiz: QuizAnswers): number => {
  const total = quiz.currentProductivity + quiz.consistencyLevel + (6 - quiz.distractionFrequency);
  return Math.round((total / 15) * 100);
};
