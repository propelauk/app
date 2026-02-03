-- Propela Backend Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROFILES TABLE
-- Stores user profile information
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  bio TEXT,
  timezone VARCHAR(50) DEFAULT 'UTC',
  avatar_url TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);

-- Trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- SUBSCRIPTIONS TABLE
-- Stores subscription/payment information
-- =====================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan VARCHAR(20) DEFAULT 'free' CHECK (plan IN ('free', 'mid', 'premium', 'lifetime')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'unpaid')),
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  current_period_end TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for Stripe lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);

-- Trigger to auto-create subscription on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'free', 'active');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_subscription ON auth.users;
CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_subscription();

-- =====================================================
-- COMMUNITY POSTS TABLE
-- Stores community forum posts
-- =====================================================
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('win', 'tip', 'question', 'motivation')),
  likes_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'flagged', 'deleted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_community_posts_status ON community_posts(status);
CREATE INDEX IF NOT EXISTS idx_community_posts_category ON community_posts(category);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON community_posts(user_id);

-- =====================================================
-- COMMUNITY COMMENTS TABLE
-- Stores comments on community posts
-- =====================================================
CREATE TABLE IF NOT EXISTS community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_community_comments_post_id ON community_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_user_id ON community_comments(user_id);

-- =====================================================
-- COMMUNITY LIKES TABLES
-- Stores likes for posts and comments
-- =====================================================
CREATE TABLE IF NOT EXISTS community_post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

CREATE TABLE IF NOT EXISTS community_comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID REFERENCES community_comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- Functions to increment/decrement likes
CREATE OR REPLACE FUNCTION increment_post_likes(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE community_posts SET likes_count = likes_count + 1 WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_post_likes(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE community_posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_comment_likes(comment_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE community_comments SET likes_count = likes_count + 1 WHERE id = comment_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_comment_likes(comment_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE community_comments SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = comment_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- HELP REQUESTS TABLE
-- Stores user help/support requests
-- =====================================================
CREATE TABLE IF NOT EXISTS help_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  budget_usd NUMERIC(10, 2),
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(50),
  file_url TEXT,
  external_url TEXT,
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_help_requests_status ON help_requests(status);
CREATE INDEX IF NOT EXISTS idx_help_requests_created_at ON help_requests(created_at DESC);

-- =====================================================
-- BACKUPS TABLE
-- Stores backup metadata (NOT actual user data)
-- =====================================================
CREATE TABLE IF NOT EXISTS backups (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  last_backup_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  backup_version INTEGER DEFAULT 1
);

-- =====================================================
-- FEEDBACK TABLE
-- Stores user feedback
-- =====================================================
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);

-- =====================================================
-- FEATURE FLAGS TABLE
-- Stores feature flag configuration
-- =====================================================
CREATE TABLE IF NOT EXISTS feature_flags (
  flag_name VARCHAR(100) PRIMARY KEY,
  enabled BOOLEAN DEFAULT FALSE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default feature flags
INSERT INTO feature_flags (flag_name, enabled, description) VALUES
  ('community_enabled', true, 'Enable community forum features'),
  ('help_requests_enabled', true, 'Enable help request submissions'),
  ('premium_45min_sessions', true, 'Enable 45-minute focus sessions for premium users'),
  ('ai_insights', false, 'Enable AI-powered productivity insights'),
  ('streak_protection', true, 'Enable streak protection for premium users'),
  ('maintenance_mode', false, 'Put app in maintenance mode')
ON CONFLICT (flag_name) DO NOTHING;

-- =====================================================
-- STATIC PAGES TABLE
-- Stores static content (FAQ, Privacy, Terms, etc.)
-- =====================================================
CREATE TABLE IF NOT EXISTS static_pages (
  slug VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE static_pages ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read/update their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Subscriptions: Users can only view their own subscription
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Community Posts: Anyone can view approved posts
CREATE POLICY "Anyone can view approved posts" ON community_posts
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Users can view own posts" ON community_posts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create posts" ON community_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts" ON community_posts
  FOR DELETE USING (auth.uid() = user_id);

-- Community Comments: Anyone can view comments on approved posts
CREATE POLICY "Anyone can view comments" ON community_comments
  FOR SELECT USING (true);

CREATE POLICY "Users can create comments" ON community_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON community_comments
  FOR DELETE USING (auth.uid() = user_id);

-- Likes: Users can manage their own likes
CREATE POLICY "Users can manage post likes" ON community_post_likes
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage comment likes" ON community_comment_likes
  FOR ALL USING (auth.uid() = user_id);

-- Help Requests: Users can view/create their own requests
CREATE POLICY "Users can view own help requests" ON help_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create help requests" ON help_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Backups: Users can manage their own backup metadata
CREATE POLICY "Users can manage own backups" ON backups
  FOR ALL USING (auth.uid() = user_id);

-- Feedback: Users can create feedback
CREATE POLICY "Anyone can create feedback" ON feedback
  FOR INSERT WITH CHECK (true);

-- Feature Flags: Anyone can read
CREATE POLICY "Anyone can read feature flags" ON feature_flags
  FOR SELECT USING (true);

-- Static Pages: Anyone can read
CREATE POLICY "Anyone can read static pages" ON static_pages
  FOR SELECT USING (true);

-- =====================================================
-- STORAGE BUCKET FOR FILE UPLOADS
-- =====================================================
-- Run this separately in Supabase Storage settings or via SQL:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true);

-- Storage policy for uploads bucket
-- CREATE POLICY "Users can upload files" ON storage.objects
--   FOR INSERT WITH CHECK (bucket_id = 'uploads' AND auth.uid() IS NOT NULL);

-- CREATE POLICY "Anyone can view uploaded files" ON storage.objects
--   FOR SELECT USING (bucket_id = 'uploads');
