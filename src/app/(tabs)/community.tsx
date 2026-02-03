import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, KeyboardAvoidingView, Platform, Modal, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  Heart, 
  MessageCircle, 
  Send,
  Plus,
  X,
  MoreHorizontal,
  User,
  Flame,
  Clock,
  TrendingUp
} from 'lucide-react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import useAppStore from '@/lib/state/app-store';
import { useOnboardingStore } from '@/lib/state/onboarding-store';

// Types
interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  timestamp: number;
  likes: number;
}

interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorInitials: string;
  authorColor: string;
  content: string;
  timestamp: number;
  likes: number;
  comments: Comment[];
  category: 'win' | 'tip' | 'question' | 'motivation';
}

// Mock community members with ADHD-friendly names
const COMMUNITY_MEMBERS = [
  { id: 'u1', name: 'Alex M.', initials: 'AM', color: '#5b9a8b' },
  { id: 'u2', name: 'Jordan K.', initials: 'JK', color: '#7b8cde' },
  { id: 'u3', name: 'Sam T.', initials: 'ST', color: '#de7b8c' },
  { id: 'u4', name: 'Taylor R.', initials: 'TR', color: '#c4a574' },
  { id: 'u5', name: 'Casey L.', initials: 'CL', color: '#9b7bde' },
  { id: 'u6', name: 'Morgan P.', initials: 'MP', color: '#5b8a9a' },
  { id: 'u7', name: 'Riley W.', initials: 'RW', color: '#de9b7b' },
  { id: 'u8', name: 'Quinn S.', initials: 'QS', color: '#7bde9b' },
];

// Mock posts from community
const MOCK_POSTS: Post[] = [
  {
    id: 'p1',
    authorId: 'u1',
    authorName: 'Alex M.',
    authorInitials: 'AM',
    authorColor: '#5b9a8b',
    content: "Just completed my first 25-minute focus session without checking my phone! 🎉 Baby steps but it feels huge. The timer really helps me stay accountable.",
    timestamp: Date.now() - 1000 * 60 * 15, // 15 min ago
    likes: 24,
    category: 'win',
    comments: [
      { id: 'c1', authorId: 'u2', authorName: 'Jordan K.', content: "That's amazing! The first one is always the hardest 💪", timestamp: Date.now() - 1000 * 60 * 10, likes: 5 },
      { id: 'c2', authorId: 'u3', authorName: 'Sam T.', content: 'Congrats! Keep the momentum going!', timestamp: Date.now() - 1000 * 60 * 5, likes: 2 },
    ],
  },
  {
    id: 'p2',
    authorId: 'u4',
    authorName: 'Taylor R.',
    authorInitials: 'TR',
    authorColor: '#c4a574',
    content: "Tip that changed everything for me: I put my phone in another room during focus sessions. Out of sight = out of mind. My productivity literally doubled.",
    timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
    likes: 67,
    category: 'tip',
    comments: [
      { id: 'c3', authorId: 'u5', authorName: 'Casey L.', content: 'Trying this tomorrow! Thanks for sharing', timestamp: Date.now() - 1000 * 60 * 45, likes: 3 },
    ],
  },
  {
    id: 'p3',
    authorId: 'u6',
    authorName: 'Morgan P.',
    authorInitials: 'MP',
    authorColor: '#5b8a9a',
    content: "Anyone else struggle with starting tasks even when they're small? I know what I need to do but actually beginning feels impossible some days.",
    timestamp: Date.now() - 1000 * 60 * 60 * 4, // 4 hours ago
    likes: 89,
    category: 'question',
    comments: [
      { id: 'c4', authorId: 'u7', authorName: 'Riley W.', content: "100%! I use the 2-minute rule - if it takes less than 2 min, do it NOW. Helps build momentum.", timestamp: Date.now() - 1000 * 60 * 60 * 3, likes: 12 },
      { id: 'c5', authorId: 'u1', authorName: 'Alex M.', content: "I tell myself I'll just work for 5 minutes. Usually I keep going once I start!", timestamp: Date.now() - 1000 * 60 * 60 * 2, likes: 8 },
      { id: 'c6', authorId: 'u8', authorName: 'Quinn S.', content: 'Body doubling helps me - even having someone on a video call working alongside me', timestamp: Date.now() - 1000 * 60 * 60, likes: 15 },
    ],
  },
  {
    id: 'p4',
    authorId: 'u8',
    authorName: 'Quinn S.',
    authorInitials: 'QS',
    authorColor: '#7bde9b',
    content: "Day 14 of my streak! 🔥 Never thought I'd make it this far. This community keeps me going. You're all incredible.",
    timestamp: Date.now() - 1000 * 60 * 60 * 8, // 8 hours ago
    likes: 156,
    category: 'motivation',
    comments: [
      { id: 'c7', authorId: 'u2', authorName: 'Jordan K.', content: "14 days is HUGE! Keep crushing it! 🙌", timestamp: Date.now() - 1000 * 60 * 60 * 7, likes: 6 },
    ],
  },
  {
    id: 'p5',
    authorId: 'u3',
    authorName: 'Sam T.',
    authorInitials: 'ST',
    authorColor: '#de7b8c',
    content: "Finally finished that project I've been procrastinating on for 3 weeks! Breaking it into tiny tasks in Propela made all the difference. Each checkbox felt like a mini win.",
    timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
    likes: 203,
    category: 'win',
    comments: [
      { id: 'c8', authorId: 'u4', authorName: 'Taylor R.', content: 'The checkbox dopamine is real! Congrats on finishing!', timestamp: Date.now() - 1000 * 60 * 60 * 20, likes: 9 },
      { id: 'c9', authorId: 'u6', authorName: 'Morgan P.', content: "This gives me hope for my own projects 😭", timestamp: Date.now() - 1000 * 60 * 60 * 18, likes: 4 },
    ],
  },
  {
    id: 'p6',
    authorId: 'u5',
    authorName: 'Casey L.',
    authorInitials: 'CL',
    authorColor: '#9b7bde',
    content: "Does anyone else work better with background noise? I can't focus in complete silence but also can't handle music with lyrics. White noise has been my savior.",
    timestamp: Date.now() - 1000 * 60 * 60 * 36, // 1.5 days ago
    likes: 78,
    category: 'question',
    comments: [
      { id: 'c10', authorId: 'u7', authorName: 'Riley W.', content: 'Brown noise > white noise for me! Try it', timestamp: Date.now() - 1000 * 60 * 60 * 30, likes: 11 },
      { id: 'c11', authorId: 'u1', authorName: 'Alex M.', content: 'Coffee shop ambiance on YouTube is my go-to', timestamp: Date.now() - 1000 * 60 * 60 * 28, likes: 7 },
    ],
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All', icon: TrendingUp },
  { id: 'win', label: 'Wins', icon: Flame },
  { id: 'tip', label: 'Tips', icon: TrendingUp },
  { id: 'question', label: 'Questions', icon: MessageCircle },
  { id: 'motivation', label: 'Motivation', icon: Heart },
] as const;

type CategoryId = typeof CATEGORIES[number]['id'];

export default function CommunityScreen() {
  const router = useRouter();
  const theme = useAppStore((s) => s.theme);
  const firstName = useOnboardingStore((s) => s.firstName);
  
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState<Post['category']>('win');
  const [newCommentContent, setNewCommentContent] = useState('');
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());

  const isDark = theme === 'dark';

  const colors = {
    background: isDark ? '#1a1a1f' : '#f8f8fa',
    card: isDark ? '#252529' : '#ffffff',
    text: isDark ? '#e8e8e8' : '#1a1a1f',
    textSecondary: isDark ? '#9a9a9f' : '#6b6b70',
    textMuted: isDark ? '#6b6b70' : '#9a9a9f',
    primary: '#5b9a8b',
    border: isDark ? '#3a3a40' : '#e8e8eb',
    heart: '#ef4444',
    inputBg: isDark ? '#2f2f35' : '#f5f5f7',
    modalBg: isDark ? '#1a1a1f' : '#ffffff',
    win: '#6b9b7a',
    tip: '#7b8cde',
    question: '#de9b7b',
    motivation: '#c4a574',
  };

  const categoryColors: Record<Post['category'], string> = {
    win: colors.win,
    tip: colors.tip,
    question: colors.question,
    motivation: colors.motivation,
  };

  // Get user initials
  const userInitials = useMemo(() => {
    if (firstName) {
      return firstName.slice(0, 2).toUpperCase();
    }
    return 'ME';
  }, [firstName]);

  // Filter posts by category
  const filteredPosts = useMemo(() => {
    if (selectedCategory === 'all') return posts;
    return posts.filter((p) => p.category === selectedCategory);
  }, [posts, selectedCategory]);

  // Format timestamp
  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  };

  // Handle like post
  const handleLikePost = useCallback((postId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    setLikedPosts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, likes: likedPosts.has(postId) ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
  }, [likedPosts]);

  // Handle like comment
  const handleLikeComment = useCallback((commentId: string, postId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    setLikedComments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: p.comments.map((c) =>
                c.id === commentId
                  ? { ...c, likes: likedComments.has(commentId) ? c.likes - 1 : c.likes + 1 }
                  : c
              ),
            }
          : p
      )
    );
  }, [likedComments]);

  // Open comments modal
  const openComments = useCallback((post: Post) => {
    setSelectedPost(post);
    setNewCommentContent('');
    setShowCommentsModal(true);
  }, []);

  // Add new comment
  const handleAddComment = useCallback(() => {
    if (!newCommentContent.trim() || !selectedPost) return;

    const newComment: Comment = {
      id: `c-${Date.now()}`,
      authorId: 'me',
      authorName: firstName ? `${firstName} (You)` : 'You',
      content: newCommentContent.trim(),
      timestamp: Date.now(),
      likes: 0,
    };

    setPosts((prev) =>
      prev.map((p) =>
        p.id === selectedPost.id
          ? { ...p, comments: [...p.comments, newComment] }
          : p
      )
    );

    // Update selected post for modal
    setSelectedPost((prev) =>
      prev ? { ...prev, comments: [...prev.comments, newComment] } : null
    );

    setNewCommentContent('');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [newCommentContent, selectedPost, firstName]);

  // Add new post
  const handleAddPost = useCallback(() => {
    if (!newPostContent.trim()) return;

    const newPost: Post = {
      id: `p-${Date.now()}`,
      authorId: 'me',
      authorName: firstName ? `${firstName} (You)` : 'You',
      authorInitials: userInitials,
      authorColor: colors.primary,
      content: newPostContent.trim(),
      timestamp: Date.now(),
      likes: 0,
      comments: [],
      category: newPostCategory,
    };

    setPosts((prev) => [newPost, ...prev]);
    setNewPostContent('');
    setShowNewPostModal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [newPostContent, newPostCategory, firstName, userInitials, colors.primary]);

  // Category badge component
  const CategoryBadge = ({ category }: { category: Post['category'] }) => (
    <View
      className="px-2 py-1 rounded-full"
      style={{ backgroundColor: categoryColors[category] + '20' }}
    >
      <Text
        className="text-xs font-medium capitalize"
        style={{ color: categoryColors[category] }}
      >
        {category}
      </Text>
    </View>
  );

  // Post card component
  const PostCard = ({ post, index }: { post: Post; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 50).duration(400)}
      className="mb-4"
    >
      <View
        className="p-4 rounded-2xl"
        style={{ backgroundColor: colors.card }}
      >
        {/* Author row */}
        <View className="flex-row items-center mb-3">
          <View
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: post.authorColor }}
          >
            <Text className="text-white font-semibold text-sm">
              {post.authorInitials}
            </Text>
          </View>
          <View className="ml-3 flex-1">
            <Text style={{ color: colors.text }} className="font-semibold">
              {post.authorName}
            </Text>
            <Text style={{ color: colors.textMuted }} className="text-xs">
              {formatTime(post.timestamp)}
            </Text>
          </View>
          <CategoryBadge category={post.category} />
        </View>

        {/* Content */}
        <Text style={{ color: colors.text }} className="text-base leading-6 mb-4">
          {post.content}
        </Text>

        {/* Actions row */}
        <View className="flex-row items-center pt-3 border-t" style={{ borderColor: colors.border }}>
          <Pressable
            onPress={() => handleLikePost(post.id)}
            className="flex-row items-center mr-6 active:opacity-60"
          >
            <Heart
              size={20}
              color={likedPosts.has(post.id) ? colors.heart : colors.textMuted}
              fill={likedPosts.has(post.id) ? colors.heart : 'transparent'}
            />
            <Text
              style={{ color: likedPosts.has(post.id) ? colors.heart : colors.textMuted }}
              className="ml-2 text-sm"
            >
              {post.likes + (likedPosts.has(post.id) ? 1 : 0)}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => openComments(post)}
            className="flex-row items-center active:opacity-60"
          >
            <MessageCircle size={20} color={colors.textMuted} />
            <Text style={{ color: colors.textMuted }} className="ml-2 text-sm">
              {post.comments.length}
            </Text>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Header */}
        <Animated.View
          entering={FadeIn.duration(400)}
          className="px-6 pt-4 pb-2"
        >
          <Text style={{ color: colors.text }} className="text-3xl font-bold">
            Community
          </Text>
          <Text style={{ color: colors.textSecondary }} className="text-base mt-1">
            Share wins, tips & support
          </Text>
        </Animated.View>

        {/* Category Tabs */}
        <View className="px-6 py-3">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              const IconComponent = cat.icon;
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => {
                    setSelectedCategory(cat.id);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  className="flex-row items-center px-4 py-2 rounded-full"
                  style={{
                    backgroundColor: isActive ? colors.primary : colors.card,
                  }}
                >
                  <IconComponent
                    size={16}
                    color={isActive ? '#ffffff' : colors.textMuted}
                  />
                  <Text
                    className="ml-2 font-medium"
                    style={{ color: isActive ? '#ffffff' : colors.textSecondary }}
                  >
                    {cat.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Posts Feed */}
        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {filteredPosts.map((post, index) => (
            <PostCard key={post.id} post={post} index={index} />
          ))}

          {filteredPosts.length === 0 && (
            <View className="items-center py-20">
              <MessageCircle size={48} color={colors.textMuted} strokeWidth={1} />
              <Text style={{ color: colors.textSecondary }} className="mt-4 text-center">
                No posts in this category yet.{'\n'}Be the first to share!
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Floating New Post Button */}
        <Pressable
          onPress={() => setShowNewPostModal(true)}
          className="absolute bottom-28 right-6 w-14 h-14 rounded-full items-center justify-center shadow-lg active:scale-95"
          style={{ backgroundColor: colors.primary }}
        >
          <Plus size={28} color="#ffffff" />
        </Pressable>

        {/* New Post Modal */}
        <Modal
          visible={showNewPostModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowNewPostModal(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1"
            style={{ backgroundColor: colors.modalBg }}
          >
            <SafeAreaView className="flex-1">
              {/* Modal Header */}
              <View className="flex-row justify-between items-center px-6 py-4 border-b" style={{ borderColor: colors.border }}>
                <Pressable onPress={() => setShowNewPostModal(false)}>
                  <X size={24} color={colors.textMuted} />
                </Pressable>
                <Text style={{ color: colors.text }} className="text-lg font-semibold">
                  New Post
                </Text>
                <Pressable
                  onPress={handleAddPost}
                  disabled={!newPostContent.trim()}
                  className="px-4 py-2 rounded-full"
                  style={{ backgroundColor: newPostContent.trim() ? colors.primary : colors.border }}
                >
                  <Text
                    className="font-semibold"
                    style={{ color: newPostContent.trim() ? '#ffffff' : colors.textMuted }}
                  >
                    Post
                  </Text>
                </Pressable>
              </View>

              {/* Author Preview */}
              <View className="flex-row items-center px-6 py-4">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Text className="text-white font-semibold text-sm">
                    {userInitials}
                  </Text>
                </View>
                <Text style={{ color: colors.text }} className="ml-3 font-semibold">
                  {firstName || 'You'}
                </Text>
              </View>

              {/* Category Selection */}
              <View className="px-6 pb-4">
                <Text style={{ color: colors.textSecondary }} className="text-sm mb-2">
                  Category
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 8 }}
                >
                  {(['win', 'tip', 'question', 'motivation'] as const).map((cat) => (
                    <Pressable
                      key={cat}
                      onPress={() => setNewPostCategory(cat)}
                      className="px-4 py-2 rounded-full"
                      style={{
                        backgroundColor: newPostCategory === cat
                          ? categoryColors[cat]
                          : categoryColors[cat] + '20',
                      }}
                    >
                      <Text
                        className="font-medium capitalize"
                        style={{
                          color: newPostCategory === cat ? '#ffffff' : categoryColors[cat],
                        }}
                      >
                        {cat === 'win' ? '🎉 Win' : cat === 'tip' ? '💡 Tip' : cat === 'question' ? '❓ Question' : '✨ Motivation'}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              {/* Post Content Input */}
              <View className="flex-1 px-6">
                <TextInput
                  value={newPostContent}
                  onChangeText={setNewPostContent}
                  placeholder="Share a win, tip, or ask the community..."
                  placeholderTextColor={colors.textMuted}
                  multiline
                  className="flex-1 text-lg p-4 rounded-xl"
                  style={{ 
                    backgroundColor: colors.inputBg, 
                    color: colors.text,
                    textAlignVertical: 'top',
                  }}
                  autoFocus
                />
              </View>

              {/* Helpful Prompts */}
              <View className="px-6 py-4">
                <Text style={{ color: colors.textMuted }} className="text-sm">
                  💡 Ideas: Share a productivity tip, celebrate a win, or ask for advice!
                </Text>
              </View>
            </SafeAreaView>
          </KeyboardAvoidingView>
        </Modal>

        {/* Comments Modal */}
        <Modal
          visible={showCommentsModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowCommentsModal(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1"
            style={{ backgroundColor: colors.modalBg }}
          >
            <SafeAreaView className="flex-1">
              {/* Modal Header */}
              <View className="flex-row justify-between items-center px-6 py-4 border-b" style={{ borderColor: colors.border }}>
                <Pressable onPress={() => setShowCommentsModal(false)}>
                  <X size={24} color={colors.textMuted} />
                </Pressable>
                <Text style={{ color: colors.text }} className="text-lg font-semibold">
                  Comments
                </Text>
                <View className="w-6" />
              </View>

              {/* Original Post */}
              {selectedPost && (
                <View className="px-6 py-4 border-b" style={{ borderColor: colors.border }}>
                  <View className="flex-row items-center mb-2">
                    <View
                      className="w-8 h-8 rounded-full items-center justify-center"
                      style={{ backgroundColor: selectedPost.authorColor }}
                    >
                      <Text className="text-white font-semibold text-xs">
                        {selectedPost.authorInitials}
                      </Text>
                    </View>
                    <Text style={{ color: colors.text }} className="ml-2 font-semibold text-sm">
                      {selectedPost.authorName}
                    </Text>
                  </View>
                  <Text style={{ color: colors.text }} className="text-base leading-5">
                    {selectedPost.content}
                  </Text>
                </View>
              )}

              {/* Comments List */}
              <ScrollView
                className="flex-1"
                contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
              >
                {selectedPost?.comments.map((comment, index) => (
                  <Animated.View
                    key={comment.id}
                    entering={FadeInDown.delay(index * 50).duration(300)}
                    className="mb-4"
                  >
                    <View className="flex-row">
                      <View
                        className="w-8 h-8 rounded-full items-center justify-center"
                        style={{ 
                          backgroundColor: COMMUNITY_MEMBERS.find(m => m.id === comment.authorId)?.color || colors.primary 
                        }}
                      >
                        <Text className="text-white font-semibold text-xs">
                          {comment.authorName.slice(0, 2).toUpperCase()}
                        </Text>
                      </View>
                      <View className="flex-1 ml-3">
                        <View className="flex-row items-center">
                          <Text style={{ color: colors.text }} className="font-semibold text-sm">
                            {comment.authorName}
                          </Text>
                          <Text style={{ color: colors.textMuted }} className="ml-2 text-xs">
                            {formatTime(comment.timestamp)}
                          </Text>
                        </View>
                        <Text style={{ color: colors.text }} className="mt-1 leading-5">
                          {comment.content}
                        </Text>
                        <Pressable
                          onPress={() => handleLikeComment(comment.id, selectedPost!.id)}
                          className="flex-row items-center mt-2 active:opacity-60"
                        >
                          <Heart
                            size={14}
                            color={likedComments.has(comment.id) ? colors.heart : colors.textMuted}
                            fill={likedComments.has(comment.id) ? colors.heart : 'transparent'}
                          />
                          <Text
                            style={{ color: likedComments.has(comment.id) ? colors.heart : colors.textMuted }}
                            className="ml-1 text-xs"
                          >
                            {comment.likes + (likedComments.has(comment.id) ? 1 : 0)}
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  </Animated.View>
                ))}

                {selectedPost?.comments.length === 0 && (
                  <View className="items-center py-10">
                    <MessageCircle size={32} color={colors.textMuted} strokeWidth={1} />
                    <Text style={{ color: colors.textMuted }} className="mt-2 text-center">
                      No comments yet.{'\n'}Be the first to reply!
                    </Text>
                  </View>
                )}
              </ScrollView>

              {/* Comment Input */}
              <View
                className="absolute bottom-0 left-0 right-0 px-4 py-3 border-t"
                style={{ backgroundColor: colors.modalBg, borderColor: colors.border }}
              >
                <SafeAreaView edges={['bottom']}>
                  <View className="flex-row items-center">
                    <View
                      className="w-8 h-8 rounded-full items-center justify-center"
                      style={{ backgroundColor: colors.primary }}
                    >
                      <Text className="text-white font-semibold text-xs">
                        {userInitials}
                      </Text>
                    </View>
                    <TextInput
                      value={newCommentContent}
                      onChangeText={setNewCommentContent}
                      placeholder="Add a comment..."
                      placeholderTextColor={colors.textMuted}
                      className="flex-1 mx-3 px-4 py-2 rounded-full"
                      style={{ backgroundColor: colors.inputBg, color: colors.text }}
                    />
                    <Pressable
                      onPress={handleAddComment}
                      disabled={!newCommentContent.trim()}
                      className="w-10 h-10 rounded-full items-center justify-center"
                      style={{ 
                        backgroundColor: newCommentContent.trim() ? colors.primary : colors.border 
                      }}
                    >
                      <Send
                        size={18}
                        color={newCommentContent.trim() ? '#ffffff' : colors.textMuted}
                      />
                    </Pressable>
                  </View>
                </SafeAreaView>
              </View>
            </SafeAreaView>
          </KeyboardAvoidingView>
        </Modal>
      </SafeAreaView>
    </View>
  );
}
