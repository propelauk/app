import { supabaseAdmin } from '../../lib/supabase';
import { adminMiddleware } from '../../middleware/admin';
import { jsonResponse, errorResponse, handleCors } from '../../middleware/auth';

// GET /admin/analytics - Get high-level analytics
export async function getAnalytics(request: Request): Promise<Response> {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  const authResult = await adminMiddleware(request);
  if (authResult instanceof Response) return authResult;

  try {
    // Get total users count
    const { count: totalUsers } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Get users by plan
    const { data: planCounts } = await supabaseAdmin
      .from('subscriptions')
      .select('plan');

    const planDistribution = {
      free: 0,
      mid: 0,
      premium: 0,
      lifetime: 0,
    };

    planCounts?.forEach(s => {
      if (s.plan in planDistribution) {
        planDistribution[s.plan as keyof typeof planDistribution]++;
      }
    });

    // Calculate free users (total - paid)
    const paidUsers = planDistribution.mid + planDistribution.premium + planDistribution.lifetime;
    planDistribution.free = (totalUsers || 0) - paidUsers;

    // Get subscription status counts
    const { data: statusCounts } = await supabaseAdmin
      .from('subscriptions')
      .select('status');

    const statusDistribution = {
      active: 0,
      canceled: 0,
      unpaid: 0,
    };

    statusCounts?.forEach(s => {
      if (s.status in statusDistribution) {
        statusDistribution[s.status as keyof typeof statusDistribution]++;
      }
    });

    // Get community stats
    const { count: totalPosts } = await supabaseAdmin
      .from('community_posts')
      .select('*', { count: 'exact', head: true });

    const { count: pendingPosts } = await supabaseAdmin
      .from('community_posts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    const { count: approvedPosts } = await supabaseAdmin
      .from('community_posts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved');

    const { count: totalComments } = await supabaseAdmin
      .from('community_comments')
      .select('*', { count: 'exact', head: true });

    // Get help request stats
    const { count: totalHelpRequests } = await supabaseAdmin
      .from('help_requests')
      .select('*', { count: 'exact', head: true });

    const { count: newHelpRequests } = await supabaseAdmin
      .from('help_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'new');

    // Get feedback count
    const { count: totalFeedback } = await supabaseAdmin
      .from('feedback')
      .select('*', { count: 'exact', head: true });

    // Get new users this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const { count: newUsersThisWeek } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', oneWeekAgo.toISOString());

    // Calculate MRR (Monthly Recurring Revenue) estimate
    // These are example prices - adjust to your actual pricing
    const MID_MONTHLY_PRICE = 9.99;
    const PREMIUM_MONTHLY_PRICE = 19.99;
    
    const activeMid = planCounts?.filter(s => s.plan === 'mid').length || 0;
    const activePremium = planCounts?.filter(s => s.plan === 'premium').length || 0;
    const estimatedMRR = (activeMid * MID_MONTHLY_PRICE) + (activePremium * PREMIUM_MONTHLY_PRICE);

    return jsonResponse({
      users: {
        total: totalUsers || 0,
        newThisWeek: newUsersThisWeek || 0,
        byPlan: planDistribution,
      },
      subscriptions: {
        total: paidUsers,
        byStatus: statusDistribution,
        churnRate: statusDistribution.canceled / Math.max(paidUsers, 1),
        estimatedMRR: Math.round(estimatedMRR * 100) / 100,
      },
      community: {
        totalPosts: totalPosts || 0,
        pendingPosts: pendingPosts || 0,
        approvedPosts: approvedPosts || 0,
        totalComments: totalComments || 0,
      },
      support: {
        totalHelpRequests: totalHelpRequests || 0,
        newHelpRequests: newHelpRequests || 0,
        totalFeedback: totalFeedback || 0,
      },
    });
  } catch (error) {
    console.error('Get analytics exception:', error);
    return errorResponse('Failed to fetch analytics', 500);
  }
}

// GET /admin/analytics/trends - Get trend data over time
export async function getTrends(request: Request): Promise<Response> {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  const authResult = await adminMiddleware(request);
  if (authResult instanceof Response) return authResult;

  try {
    const url = new URL(request.url);
    const days = parseInt(url.searchParams.get('days') || '30', 10);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get daily user signups
    const { data: userSignups } = await supabaseAdmin
      .from('profiles')
      .select('created_at')
      .gte('created_at', startDate.toISOString());

    // Get daily posts
    const { data: posts } = await supabaseAdmin
      .from('community_posts')
      .select('created_at')
      .gte('created_at', startDate.toISOString());

    // Group by day
    const dailyStats: Record<string, { users: number; posts: number }> = {};

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dailyStats[dateStr] = { users: 0, posts: 0 };
    }

    userSignups?.forEach(u => {
      const dateStr = u.created_at.split('T')[0];
      if (dailyStats[dateStr]) {
        dailyStats[dateStr].users++;
      }
    });

    posts?.forEach(p => {
      const dateStr = p.created_at.split('T')[0];
      if (dailyStats[dateStr]) {
        dailyStats[dateStr].posts++;
      }
    });

    // Convert to array sorted by date
    const trends = Object.entries(dailyStats)
      .map(([date, stats]) => ({
        date,
        ...stats,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return jsonResponse({ trends, days });
  } catch (error) {
    console.error('Get trends exception:', error);
    return errorResponse('Failed to fetch trends', 500);
  }
}
