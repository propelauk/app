import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

// Service role client for admin operations
export const supabaseAdmin: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Anon client for public operations
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Get user from JWT token
export async function getUserFromToken(token: string) {
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  
  if (error || !user) {
    return null;
  }
  
  return user;
}

// Database types
export interface Profile {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  bio: string | null;
  timezone: string | null;
  avatar_url: string | null;
  onboarding_completed: boolean;
  created_at: string;
}

export interface Subscription {
  user_id: string;
  plan: 'free' | 'mid' | 'premium' | 'lifetime';
  status: 'active' | 'canceled' | 'unpaid';
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_end: string | null;
  updated_at: string;
}

export interface CommunityPost {
  id: string;
  user_id: string;
  content: string;
  category: 'win' | 'tip' | 'question' | 'motivation';
  likes_count: number;
  status: 'pending' | 'approved' | 'flagged' | 'deleted';
  created_at: string;
  updated_at: string;
}

export interface CommunityComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  likes_count: number;
  created_at: string;
}

export interface HelpRequest {
  id: string;
  user_id: string;
  message: string;
  budget_usd: number | null;
  contact_email: string;
  contact_phone: string | null;
  file_url: string | null;
  external_url: string | null;
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
}

export interface Backup {
  user_id: string;
  last_backup_at: string;
  backup_version: number;
}

export interface Feedback {
  id: string;
  user_id: string | null;
  message: string;
  created_at: string;
}

export interface FeatureFlag {
  flag_name: string;
  enabled: boolean;
  description: string | null;
}

export interface StaticPage {
  slug: string;
  title: string;
  content: string;
  updated_at: string;
}
