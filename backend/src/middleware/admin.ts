import { authMiddleware, errorResponse } from './auth';
import type { User } from '@supabase/supabase-js';

// Admin user IDs from environment (comma-separated)
const ADMIN_USER_IDS = (process.env.ADMIN_USER_IDS || '').split(',').filter(Boolean);

export interface AdminRequest extends Request {
  user: User;
  isAdmin: true;
}

// Check if user is admin
export function isAdmin(userId: string): boolean {
  return ADMIN_USER_IDS.includes(userId);
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
  if (!isAdmin(user.id)) {
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
  
  return isAdmin(user.id);
}
