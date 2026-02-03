import { authMiddleware, errorResponse } from './auth';
import type { User } from '@supabase/supabase-js';
import { supabaseAdmin } from '../lib/supabase';

// Admin user IDs from environment (comma-separated) - as fallback
const ADMIN_USER_IDS = (process.env.ADMIN_USER_IDS || '').split(',').filter(Boolean);

export interface AdminRequest extends Request {
  user: User;
  isAdmin: true;
}

// Check if user is admin (checks both env variable and database)
export async function isAdmin(userId: string): Promise<boolean> {
  console.log('[Admin Check] Checking admin status for user:', userId);
  
  // First check env variable
  if (ADMIN_USER_IDS.includes(userId)) {
    console.log('[Admin Check] User found in ADMIN_USER_IDS env');
    return true;
  }
  
  // Then check database
  console.log('[Admin Check] Checking database...');
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('is_admin')
    .eq('id', userId)
    .single();
  
  console.log('[Admin Check] Database response:', { data, error });
    
  if (error || !data) {
    console.log('[Admin Check] No profile found or error');
    return false;
  }
  
  console.log('[Admin Check] is_admin value:', data.is_admin);
  return data.is_admin === true;
}

// Admin middleware - requires authentication + admin role
export async function adminMiddleware(
  request: Request
): Promise<{ user: User; isAdmin: true } | Response> {
  // First, authenticate
  const authResult = await authMiddleware(request);
  
  if (authResult instanceof Response) {
    return authResult;
  }
  
  const { user } = authResult;
  
  // Check admin status
  const userIsAdmin = await isAdmin(user.id);
  if (!userIsAdmin) {
    return errorResponse('Forbidden: Admin access required', 403);
  }
  
  return { user, isAdmin: true };
}

// Check admin status without full middleware (for conditional logic)
export async function checkIsAdmin(request: Request): Promise<boolean> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return false;
  }
  
  const token = authHeader.slice(7);
  const { getUserFromToken } = await import('../lib/supabase');
  const user = await getUserFromToken(token);
  
  if (!user) {
    return false;
  }
  
  return await isAdmin(user.id);
}
