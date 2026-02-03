import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Types
export interface Task {
  id: string;
  projectId: string;
  title: string;
  completed: boolean;
  createdAt: number;
  completedAt?: number;
  priority: 'low' | 'medium' | 'high';
  estimatedMinutes?: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  color: string;
  createdAt: number;
  completedAt?: number;
  isActive: boolean;
}

export interface FocusSession {
  id: string;
  taskId?: string;
  projectId?: string;
  startTime: number;
  endTime?: number;
  durationMinutes: number;
  completed: boolean;
  date: string; // YYYY-MM-DD
}

export interface TimeBlock {
  id: string;
  title: string;
  taskId?: string;
  projectId?: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  date: string;      // YYYY-MM-DD
  type: 'focus' | 'break' | 'meeting' | 'personal';
}

export interface DailyProgress {
  date: string; // YYYY-MM-DD
  tasksCompleted: number;
  focusMinutes: number;
  sessionsCompleted: number;
}

interface AppState {
  // User preferences
  isPremium: boolean;
  theme: 'dark' | 'light';

  // Core data
  projects: Project[];
  tasks: Task[];
  focusSessions: FocusSession[];
  timeBlocks: TimeBlock[];
  dailyProgress: DailyProgress[];

  // Current state
  currentFocusTaskId: string | null;
  todaysFocusTaskId: string | null;
  streak: number;
  lastActiveDate: string | null;

  // Actions - Projects
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => string;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  // Actions - Tasks
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => string;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;
  setTodaysFocus: (taskId: string | null) => void;

  // Actions - Focus Sessions
  startFocusSession: (durationMinutes: number, taskId?: string) => string;
  endFocusSession: (id: string, completed: boolean) => void;

  // Actions - Time Blocks
  addTimeBlock: (block: Omit<TimeBlock, 'id'>) => string;
  updateTimeBlock: (id: string, updates: Partial<TimeBlock>) => void;
  deleteTimeBlock: (id: string) => void;

  // Actions - Progress
  updateDailyProgress: () => void;

  // Actions - Settings
  setTheme: (theme: 'dark' | 'light') => void;
  setPremium: (isPremium: boolean) => void;

  // Helpers
  getTasksForProject: (projectId: string) => Task[];
  getActiveProjects: () => Project[];
  getTodaysStats: () => { tasksCompleted: number; focusMinutes: number; sessionsCompleted: number };
  canAddProject: () => boolean;
  canAddTask: (projectId: string) => boolean;
  canStartFocusSession: () => boolean;
}

const generateId = () => Math.random().toString(36).substring(2, 15);
const getToday = () => new Date().toISOString().split('T')[0];

const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      isPremium: false,
      theme: 'dark',
      projects: [],
      tasks: [],
      focusSessions: [],
      timeBlocks: [],
      dailyProgress: [],
      currentFocusTaskId: null,
      todaysFocusTaskId: null,
      streak: 0,
      lastActiveDate: null,

      // Project actions
      addProject: (project) => {
        const id = generateId();
        set((state) => ({
          projects: [...state.projects, { ...project, id, createdAt: Date.now() }],
        }));
        return id;
      },

      updateProject: (id, updates) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        }));
      },

      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          tasks: state.tasks.filter((t) => t.projectId !== id),
        }));
      },

      // Task actions
      addTask: (task) => {
        const id = generateId();
        set((state) => ({
          tasks: [...state.tasks, { ...task, id, createdAt: Date.now(), completed: false }],
        }));
        return id;
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        }));
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
          todaysFocusTaskId: state.todaysFocusTaskId === id ? null : state.todaysFocusTaskId,
        }));
      },

      completeTask: (id) => {
        const today = getToday();
        set((state) => {
          const updatedTasks = state.tasks.map((t) =>
            t.id === id ? { ...t, completed: true, completedAt: Date.now() } : t
          );

          // Update daily progress
          const existingProgress = state.dailyProgress.find((p) => p.date === today);
          let updatedProgress = state.dailyProgress;

          if (existingProgress) {
            updatedProgress = state.dailyProgress.map((p) =>
              p.date === today ? { ...p, tasksCompleted: p.tasksCompleted + 1 } : p
            );
          } else {
            updatedProgress = [...state.dailyProgress, {
              date: today,
              tasksCompleted: 1,
              focusMinutes: 0,
              sessionsCompleted: 0,
            }];
          }

          return {
            tasks: updatedTasks,
            dailyProgress: updatedProgress,
            todaysFocusTaskId: state.todaysFocusTaskId === id ? null : state.todaysFocusTaskId,
          };
        });
      },

      setTodaysFocus: (taskId) => {
        set({ todaysFocusTaskId: taskId });
      },

      // Focus session actions
      startFocusSession: (durationMinutes, taskId) => {
        const id = generateId();
        const task = taskId ? get().tasks.find((t) => t.id === taskId) : null;

        set((state) => ({
          focusSessions: [...state.focusSessions, {
            id,
            taskId,
            projectId: task?.projectId,
            startTime: Date.now(),
            durationMinutes,
            completed: false,
            date: getToday(),
          }],
          currentFocusTaskId: taskId ?? null,
        }));
        return id;
      },

      endFocusSession: (id, completed) => {
        const today = getToday();
        set((state) => {
          const session = state.focusSessions.find((s) => s.id === id);
          if (!session) return state;

          const actualMinutes = Math.round((Date.now() - session.startTime) / 60000);

          const updatedSessions = state.focusSessions.map((s) =>
            s.id === id ? { ...s, endTime: Date.now(), completed } : s
          );

          // Update daily progress
          const existingProgress = state.dailyProgress.find((p) => p.date === today);
          let updatedProgress = state.dailyProgress;

          if (existingProgress) {
            updatedProgress = state.dailyProgress.map((p) =>
              p.date === today ? {
                ...p,
                focusMinutes: p.focusMinutes + actualMinutes,
                sessionsCompleted: completed ? p.sessionsCompleted + 1 : p.sessionsCompleted,
              } : p
            );
          } else {
            updatedProgress = [...state.dailyProgress, {
              date: today,
              tasksCompleted: 0,
              focusMinutes: actualMinutes,
              sessionsCompleted: completed ? 1 : 0,
            }];
          }

          return {
            focusSessions: updatedSessions,
            dailyProgress: updatedProgress,
            currentFocusTaskId: null,
          };
        });
      },

      // Time block actions
      addTimeBlock: (block) => {
        const id = generateId();
        set((state) => ({
          timeBlocks: [...state.timeBlocks, { ...block, id }],
        }));
        return id;
      },

      updateTimeBlock: (id, updates) => {
        set((state) => ({
          timeBlocks: state.timeBlocks.map((b) =>
            b.id === id ? { ...b, ...updates } : b
          ),
        }));
      },

      deleteTimeBlock: (id) => {
        set((state) => ({
          timeBlocks: state.timeBlocks.filter((b) => b.id !== id),
        }));
      },

      // Progress actions
      updateDailyProgress: () => {
        const today = getToday();
        const state = get();
        const lastDate = state.lastActiveDate;

        // Check for streak
        if (lastDate) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];

          if (lastDate === yesterdayStr) {
            // Continue streak
            set({ streak: state.streak + 1, lastActiveDate: today });
          } else if (lastDate !== today) {
            // Reset streak
            set({ streak: 1, lastActiveDate: today });
          }
        } else {
          set({ streak: 1, lastActiveDate: today });
        }
      },

      // Settings actions
      setTheme: (theme) => set({ theme }),
      setPremium: (isPremium) => set({ isPremium }),

      // Helper methods
      getTasksForProject: (projectId) => {
        return get().tasks.filter((t) => t.projectId === projectId);
      },

      getActiveProjects: () => {
        return get().projects.filter((p) => p.isActive);
      },

      getTodaysStats: () => {
        const today = getToday();
        const progress = get().dailyProgress.find((p) => p.date === today);
        return {
          tasksCompleted: progress?.tasksCompleted ?? 0,
          focusMinutes: progress?.focusMinutes ?? 0,
          sessionsCompleted: progress?.sessionsCompleted ?? 0,
        };
      },

      canAddProject: () => {
        const state = get();
        if (state.isPremium) return true;
        const activeProjects = state.projects.filter((p) => p.isActive);
        return activeProjects.length < 1;
      },

      canAddTask: (projectId) => {
        const state = get();
        if (state.isPremium) return true;
        const projectTasks = state.tasks.filter((t) => t.projectId === projectId && !t.completed);
        return projectTasks.length < 5;
      },

      canStartFocusSession: () => {
        const state = get();
        if (state.isPremium) return true;
        const today = getToday();
        const todaySessions = state.focusSessions.filter((s) => s.date === today && s.completed);
        return todaySessions.length < 3;
      },
    }),
    {
      name: "adhd-productivity-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useAppStore;
