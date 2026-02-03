import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Check, Trash2, X, FolderPlus, ChevronRight, Lock } from 'lucide-react-native';
import Animated, { FadeInDown, FadeIn, Layout } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import useAppStore from '@/lib/state/app-store';
import { usePremiumFeature, FREE_TIER_LIMITS } from '@/lib/hooks/usePremiumFeature';

const PROJECT_COLORS = ['#5b9a8b', '#7b8cde', '#de7b8c', '#8cde7b', '#deb87b', '#b87bde'];

export default function ProjectsScreen() {
  const theme = useAppStore((s) => s.theme);
  const projects = useAppStore((s) => s.projects);
  const tasks = useAppStore((s) => s.tasks);
  const { isPremium, canAddProject: checkCanAddProject, canAddTask: checkCanAddTask } = usePremiumFeature();
  const addProject = useAppStore((s) => s.addProject);
  const addTask = useAppStore((s) => s.addTask);
  const completeTask = useAppStore((s) => s.completeTask);
  const deleteTask = useAppStore((s) => s.deleteTask);
  const deleteProject = useAppStore((s) => s.deleteProject);

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);

  // Form state
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectColor, setNewProjectColor] = useState(PROJECT_COLORS[0]);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const isDark = theme === 'dark';

  const colors = {
    background: isDark ? '#1a1a1f' : '#f8f8fa',
    card: isDark ? '#252529' : '#ffffff',
    text: isDark ? '#e8e8e8' : '#1a1a1f',
    textSecondary: isDark ? '#9a9a9f' : '#6b6b70',
    textMuted: isDark ? '#6b6b70' : '#9a9a9f',
    primary: '#5b9a8b',
    border: isDark ? '#3a3a40' : '#e8e8eb',
    danger: '#b87070',
    modalBg: isDark ? '#1a1a1f' : '#ffffff',
    inputBg: isDark ? '#2f2f35' : '#f5f5f7',
  };

  const activeProjects = useMemo(() =>
    projects.filter((p) => p.isActive),
    [projects]
  );

  const getProjectTasks = (projectId: string) => {
    return tasks.filter((t) => t.projectId === projectId);
  };

  // Check if can add project (with premium prompt)
  const canAddProject = () => {
    return checkCanAddProject(activeProjects.length);
  };

  // Check if can add task to project (with premium prompt)
  const canAddTask = (projectId: string) => {
    const projectTasks = getProjectTasks(projectId);
    return checkCanAddTask(projectTasks.length);
  };

  const handleAddProject = () => {
    if (!newProjectTitle.trim()) return;

    addProject({
      title: newProjectTitle.trim(),
      description: '',
      color: newProjectColor,
      isActive: true,
    });

    setNewProjectTitle('');
    setNewProjectColor(PROJECT_COLORS[0]);
    setShowProjectModal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim() || !selectedProjectId) return;

    addTask({
      projectId: selectedProjectId,
      title: newTaskTitle.trim(),
      priority: 'medium',
    });

    setNewTaskTitle('');
    setShowTaskModal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleCompleteTask = (taskId: string) => {
    completeTask(taskId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const openAddTask = (projectId: string) => {
    if (!canAddTask(projectId)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    setSelectedProjectId(projectId);
    setShowTaskModal(true);
  };

  const openAddProject = () => {
    if (!canAddProject()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    setShowProjectModal(true);
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Header */}
        <View className="px-6 pt-4 pb-4 flex-row justify-between items-center">
          <View>
            <Text style={{ color: colors.text }} className="text-3xl font-bold">
              Projects
            </Text>
            <Text style={{ color: colors.textSecondary }} className="text-base mt-1">
              Break it down, get it done
            </Text>
          </View>

          <Pressable
            onPress={openAddProject}
            className="w-12 h-12 rounded-2xl items-center justify-center active:scale-95"
            style={{ backgroundColor: canAddProject() ? colors.primary : colors.card }}
          >
            {canAddProject() ? (
              <Plus size={24} color="#ffffff" />
            ) : (
              <Lock size={20} color={colors.textMuted} />
            )}
          </Pressable>
        </View>

        {/* Free Tier Warning */}
        {!isPremium && activeProjects.length >= FREE_TIER_LIMITS.maxProjects && (
          <View className="mx-6 mb-4 p-4 rounded-2xl" style={{ backgroundColor: colors.card }}>
            <View className="flex-row items-center">
              <Lock size={16} color={colors.textMuted} />
              <Text style={{ color: colors.textSecondary }} className="ml-2 text-sm">
                Free tier: {FREE_TIER_LIMITS.maxProjects} active project, {FREE_TIER_LIMITS.maxTasksPerProject} tasks each
              </Text>
            </View>
          </View>
        )}

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }}
        >
          {activeProjects.length === 0 ? (
            <Animated.View
              entering={FadeIn.duration(600)}
              className="items-center justify-center py-20"
            >
              <FolderPlus size={64} color={colors.textMuted} strokeWidth={1} />
              <Text style={{ color: colors.text }} className="text-xl font-semibold mt-6">
                No projects yet
              </Text>
              <Text style={{ color: colors.textMuted }} className="text-base mt-2 text-center">
                Create your first project to start{'\n'}breaking down your goals
              </Text>
              <Pressable
                onPress={openAddProject}
                className="mt-8 px-8 py-4 rounded-2xl active:scale-95"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="text-white font-semibold text-lg">
                  Create Project
                </Text>
              </Pressable>
            </Animated.View>
          ) : (
            activeProjects.map((project, index) => {
              const projectTasks = getProjectTasks(project.id);
              const completedTasks = projectTasks.filter((t) => t.completed);
              const incompleteTasks = projectTasks.filter((t) => !t.completed);
              const progress = projectTasks.length > 0
                ? (completedTasks.length / projectTasks.length) * 100
                : 0;
              const isExpanded = expandedProjectId === project.id;

              return (
                <Animated.View
                  key={project.id}
                  entering={FadeInDown.delay(index * 100).duration(500)}
                  layout={Layout.springify()}
                  className="mb-4"
                >
                  <Pressable
                    onPress={() => setExpandedProjectId(isExpanded ? null : project.id)}
                    className="p-5 rounded-2xl active:opacity-90"
                    style={{ backgroundColor: colors.card }}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center flex-1">
                        <View
                          className="w-4 h-4 rounded-full mr-3"
                          style={{ backgroundColor: project.color }}
                        />
                        <Text style={{ color: colors.text }} className="text-xl font-semibold flex-1">
                          {project.title}
                        </Text>
                      </View>
                      <ChevronRight
                        size={20}
                        color={colors.textMuted}
                        style={{ transform: [{ rotate: isExpanded ? '90deg' : '0deg' }] }}
                      />
                    </View>

                    {/* Progress Bar */}
                    <View className="mt-4 h-2 rounded-full overflow-hidden" style={{ backgroundColor: colors.border }}>
                      <View
                        className="h-full rounded-full"
                        style={{ backgroundColor: project.color, width: `${progress}%` }}
                      />
                    </View>
                    <Text style={{ color: colors.textMuted }} className="text-sm mt-2">
                      {completedTasks.length}/{projectTasks.length} tasks completed
                    </Text>
                  </Pressable>

                  {/* Expanded Task List */}
                  {isExpanded && (
                    <Animated.View
                      entering={FadeIn.duration(300)}
                      className="mt-2 rounded-2xl overflow-hidden"
                      style={{ backgroundColor: colors.card }}
                    >
                      {incompleteTasks.map((task) => (
                        <View
                          key={task.id}
                          className="flex-row items-center p-4 border-b"
                          style={{ borderColor: colors.border }}
                        >
                          <Pressable
                            onPress={() => handleCompleteTask(task.id)}
                            className="w-6 h-6 rounded-full border-2 mr-3 items-center justify-center"
                            style={{ borderColor: colors.primary }}
                          />
                          <Text style={{ color: colors.text }} className="flex-1 text-base">
                            {task.title}
                          </Text>
                          <Pressable
                            onPress={() => deleteTask(task.id)}
                            className="p-2"
                          >
                            <Trash2 size={16} color={colors.danger} />
                          </Pressable>
                        </View>
                      ))}

                      {completedTasks.length > 0 && (
                        <View className="p-4">
                          <Text style={{ color: colors.textMuted }} className="text-sm mb-2">
                            Completed ({completedTasks.length})
                          </Text>
                          {completedTasks.slice(0, 3).map((task) => (
                            <View
                              key={task.id}
                              className="flex-row items-center py-2"
                            >
                              <View
                                className="w-5 h-5 rounded-full mr-3 items-center justify-center"
                                style={{ backgroundColor: colors.primary }}
                              >
                                <Check size={12} color="#ffffff" />
                              </View>
                              <Text style={{ color: colors.textMuted }} className="flex-1 line-through">
                                {task.title}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}

                      {/* Add Task Button */}
                      <Pressable
                        onPress={() => openAddTask(project.id)}
                        className="flex-row items-center justify-center p-4 border-t active:opacity-70"
                        style={{ borderColor: colors.border }}
                      >
                        {canAddTask(project.id) ? (
                          <>
                            <Plus size={18} color={colors.primary} />
                            <Text style={{ color: colors.primary }} className="ml-2 font-medium">
                              Add Task
                            </Text>
                          </>
                        ) : (
                          <>
                            <Lock size={16} color={colors.textMuted} />
                            <Text style={{ color: colors.textMuted }} className="ml-2">
                              Upgrade for more tasks
                            </Text>
                          </>
                        )}
                      </Pressable>

                      {/* Delete Project */}
                      <Pressable
                        onPress={() => {
                          deleteProject(project.id);
                          setExpandedProjectId(null);
                          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                        }}
                        className="flex-row items-center justify-center p-4 border-t active:opacity-70"
                        style={{ borderColor: colors.border }}
                      >
                        <Trash2 size={16} color={colors.danger} />
                        <Text style={{ color: colors.danger }} className="ml-2">
                          Delete Project
                        </Text>
                      </Pressable>
                    </Animated.View>
                  )}
                </Animated.View>
              );
            })
          )}
        </ScrollView>

        {/* Add Project Modal */}
        <Modal
          visible={showProjectModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowProjectModal(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1"
            style={{ backgroundColor: colors.modalBg }}
          >
            <SafeAreaView className="flex-1">
              <View className="flex-row justify-between items-center px-6 py-4">
                <Pressable onPress={() => setShowProjectModal(false)}>
                  <X size={24} color={colors.textMuted} />
                </Pressable>
                <Text style={{ color: colors.text }} className="text-lg font-semibold">
                  New Project
                </Text>
                <Pressable
                  onPress={handleAddProject}
                  disabled={!newProjectTitle.trim()}
                >
                  <Text
                    style={{ color: newProjectTitle.trim() ? colors.primary : colors.textMuted }}
                    className="text-lg font-semibold"
                  >
                    Create
                  </Text>
                </Pressable>
              </View>

              <View className="px-6 pt-4">
                <Text style={{ color: colors.textSecondary }} className="text-sm font-medium mb-2">
                  Project Name
                </Text>
                <TextInput
                  value={newProjectTitle}
                  onChangeText={setNewProjectTitle}
                  placeholder="What are you working on?"
                  placeholderTextColor={colors.textMuted}
                  className="text-lg p-4 rounded-xl"
                  style={{ backgroundColor: colors.inputBg, color: colors.text }}
                  autoFocus
                />

                <Text style={{ color: colors.textSecondary }} className="text-sm font-medium mt-6 mb-3">
                  Color
                </Text>
                <View className="flex-row space-x-3">
                  {PROJECT_COLORS.map((color) => (
                    <Pressable
                      key={color}
                      onPress={() => setNewProjectColor(color)}
                      className="w-10 h-10 rounded-full items-center justify-center"
                      style={{
                        backgroundColor: color,
                        borderWidth: newProjectColor === color ? 3 : 0,
                        borderColor: colors.text,
                      }}
                    >
                      {newProjectColor === color && (
                        <Check size={18} color="#ffffff" />
                      )}
                    </Pressable>
                  ))}
                </View>
              </View>
            </SafeAreaView>
          </KeyboardAvoidingView>
        </Modal>

        {/* Add Task Modal */}
        <Modal
          visible={showTaskModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowTaskModal(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1"
            style={{ backgroundColor: colors.modalBg }}
          >
            <SafeAreaView className="flex-1">
              <View className="flex-row justify-between items-center px-6 py-4">
                <Pressable onPress={() => setShowTaskModal(false)}>
                  <X size={24} color={colors.textMuted} />
                </Pressable>
                <Text style={{ color: colors.text }} className="text-lg font-semibold">
                  New Task
                </Text>
                <Pressable
                  onPress={handleAddTask}
                  disabled={!newTaskTitle.trim()}
                >
                  <Text
                    style={{ color: newTaskTitle.trim() ? colors.primary : colors.textMuted }}
                    className="text-lg font-semibold"
                  >
                    Add
                  </Text>
                </Pressable>
              </View>

              <View className="px-6 pt-4">
                <Text style={{ color: colors.textSecondary }} className="text-sm font-medium mb-2">
                  What needs to be done?
                </Text>
                <TextInput
                  value={newTaskTitle}
                  onChangeText={setNewTaskTitle}
                  placeholder="Make it small and specific"
                  placeholderTextColor={colors.textMuted}
                  className="text-lg p-4 rounded-xl"
                  style={{ backgroundColor: colors.inputBg, color: colors.text }}
                  autoFocus
                />
                <Text style={{ color: colors.textMuted }} className="text-sm mt-3">
                  Tip: Break big tasks into tiny, actionable steps
                </Text>
              </View>
            </SafeAreaView>
          </KeyboardAvoidingView>
        </Modal>
      </SafeAreaView>
    </View>
  );
}
