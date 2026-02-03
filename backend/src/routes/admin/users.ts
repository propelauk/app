import { supabaseAdmin } from '../../lib/supabase';
import { adminMiddleware } from '../../middleware/admin';
import { jsonResponse, errorResponse, handleCors } from '../../middleware/auth';

// GET /admin/users - List all users with pagination
export async function listUsers(request: Request): Promise<Response> {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  const authResult = await adminMiddleware(request);
  if (authResult instanceof Response) return authResult;

  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);
    const search = url.searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    // Get users from auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage: limit,
    });

    if (authError) {
      console.error('List users auth error:', authError);
      return errorResponse('Failed to fetch users', 500);
    }

    const userIds = authData.users.map(u => u.id);

    // Get profiles for these users
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .in('user_id', userIds);

    // Get subscriptions for these users
    const { data: subscriptions } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .in('user_id', userIds);

    // Merge data
    const users = authData.users.map(authUser => {
      const profile = profiles?.find(p => p.user_id === authUser.id);
      const subscription = subscriptions?.find(s => s.user_id === authUser.id);

      return {
        id: authUser.id,
        email: authUser.email,
        firstName: profile?.first_name,
        lastName: profile?.last_name,
        avatarUrl: profile?.avatar_url,
        onboardingCompleted: profile?.onboarding_completed ?? false,
        plan: subscription?.plan || 'free',
        subscriptionStatus: subscription?.status || 'active',
        createdAt: authUser.created_at,
        lastSignIn: authUser.last_sign_in_at,
        banned: authUser.banned_until ? true : false,
      };
    });

    // Filter by search if provided
    const filteredUsers = search
      ? users.filter(u =>
          u.email?.toLowerCase().includes(search.toLowerCase()) ||
          u.firstName?.toLowerCase().includes(search.toLowerCase()) ||
          u.lastName?.toLowerCase().includes(search.toLowerCase())
        )
      : users;

    return jsonResponse({
      users: filteredUsers,
      pagination: {
        page,
        limit,
        total: authData.users.length,
      },
    });
  } catch (error) {
    console.error('List users exception:', error);
    return errorResponse('Failed to fetch users', 500);
  }
}

// GET /admin/users/:id - Get single user details
export async function getUser(request: Request, userId: string): Promise<Response> {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  const authResult = await adminMiddleware(request);
  if (authResult instanceof Response) return authResult;

  try {
    // Get auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (authError || !authData.user) {
      return errorResponse('User not found', 404);
    }

    // Get profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Get subscription
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Get recent activity
    const { data: recentPosts } = await supabaseAdmin
      .from('community_posts')
      .select('id, content, category, status, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    const { data: helpRequests } = await supabaseAdmin
      .from('help_requests')
      .select('id, message, status, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    return jsonResponse({
      user: {
        id: authData.user.id,
        email: authData.user.email,
        emailConfirmed: authData.user.email_confirmed_at ? true : false,
        firstName: profile?.first_name,
        lastName: profile?.last_name,
        bio: profile?.bio,
        timezone: profile?.timezone,
        avatarUrl: profile?.avatar_url,
        onboardingCompleted: profile?.onboarding_completed ?? false,
        plan: subscription?.plan || 'free',
        subscriptionStatus: subscription?.status || 'active',
        stripeCustomerId: subscription?.stripe_customer_id,
        currentPeriodEnd: subscription?.current_period_end,
        createdAt: authData.user.created_at,
        lastSignIn: authData.user.last_sign_in_at,
        banned: authData.user.banned_until ? true : false,
        bannedUntil: authData.user.banned_until,
      },
      recentPosts,
      helpRequests,
    });
  } catch (error) {
    console.error('Get user exception:', error);
    return errorResponse('Failed to fetch user', 500);
  }
}

// POST /admin/users/:id/ban - Ban a user
export async function banUser(request: Request, userId: string): Promise<Response> {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  const authResult = await adminMiddleware(request);
  if (authResult instanceof Response) return authResult;

  try {
    const body = await request.json() as { duration?: string }; // 'permanent' | '7d' | '30d' | '90d'
    const duration = body.duration || 'permanent';

    let bannedUntil: string | undefined;
    
    if (duration !== 'permanent') {
      const days = parseInt(duration.replace('d', ''), 10);
      const date = new Date();
      date.setDate(date.getDate() + days);
      bannedUntil = date.toISOString();
    } else {
      // Ban for 100 years (effectively permanent)
      const date = new Date();
      date.setFullYear(date.getFullYear() + 100);
      bannedUntil = date.toISOString();
    }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      ban_duration: duration === 'permanent' ? 'none' : duration,
      // @ts-ignore - Supabase types may not include banned_until
      banned_until: bannedUntil,
    });

    if (error) {
      console.error('Ban user error:', error);
      return errorResponse('Failed to ban user', 500);
    }

    return jsonResponse({ message: 'User banned successfully', bannedUntil });
  } catch (error) {
    console.error('Ban user exception:', error);
    return errorResponse('Failed to ban user', 500);
  }
}

// POST /admin/users/:id/unban - Unban a user
export async function unbanUser(request: Request, userId: string): Promise<Response> {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  const authResult = await adminMiddleware(request);
  if (authResult instanceof Response) return authResult;

  try {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      ban_duration: 'none',
    });

    if (error) {
      console.error('Unban user error:', error);
      return errorResponse('Failed to unban user', 500);
    }

    return jsonResponse({ message: 'User unbanned successfully' });
  } catch (error) {
    console.error('Unban user exception:', error);
    return errorResponse('Failed to unban user', 500);
  }
}

// DELETE /admin/users/:id - Delete a user (soft delete)
export async function deleteUser(request: Request, userId: string): Promise<Response> {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  const authResult = await adminMiddleware(request);
  if (authResult instanceof Response) return authResult;

  try {
    // Delete from Supabase Auth
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
      console.error('Delete user error:', error);
      return errorResponse('Failed to delete user', 500);
    }

    // Cascade will handle related tables if set up properly in DB
    // Otherwise manually clean up:
    await supabaseAdmin.from('profiles').delete().eq('user_id', userId);
    await supabaseAdmin.from('subscriptions').delete().eq('user_id', userId);
    await supabaseAdmin.from('backups').delete().eq('user_id', userId);

    return jsonResponse({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user exception:', error);
    return errorResponse('Failed to delete user', 500);
  }
}
