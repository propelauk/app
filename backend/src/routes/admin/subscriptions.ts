import { supabaseAdmin } from '../../lib/supabase';
import { stripe } from '../../lib/stripe';
import { adminMiddleware } from '../../middleware/admin';
import { jsonResponse, errorResponse, handleCors } from '../../middleware/auth';
import type { PlanType } from '../../lib/stripe';

// GET /admin/subscriptions - List all subscriptions
export async function listSubscriptions(request: Request): Promise<Response> {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  const authResult = await adminMiddleware(request);
  if (authResult instanceof Response) return authResult;

  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);
    const plan = url.searchParams.get('plan') as PlanType | null;
    const status = url.searchParams.get('status');
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('subscriptions')
      .select(`
        *,
        profiles:user_id (first_name, last_name)
      `, { count: 'exact' })
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (plan) {
      query = query.eq('plan', plan);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: subscriptions, error, count } = await query;

    if (error) {
      console.error('List subscriptions error:', error);
      return errorResponse('Failed to fetch subscriptions', 500);
    }

    // Get user emails
    const userIds = subscriptions?.map(s => s.user_id) || [];
    const userEmails: Record<string, string> = {};

    for (const userId of userIds) {
      const { data } = await supabaseAdmin.auth.admin.getUserById(userId);
      if (data.user?.email) {
        userEmails[userId] = data.user.email;
      }
    }

    return jsonResponse({
      subscriptions: subscriptions?.map(s => ({
        userId: s.user_id,
        email: userEmails[s.user_id],
        firstName: s.profiles?.first_name,
        lastName: s.profiles?.last_name,
        plan: s.plan,
        status: s.status,
        stripeCustomerId: s.stripe_customer_id,
        stripeSubscriptionId: s.stripe_subscription_id,
        currentPeriodEnd: s.current_period_end,
        updatedAt: s.updated_at,
      })) || [],
      pagination: {
        page,
        limit,
        total: count || 0,
      },
    });
  } catch (error) {
    console.error('List subscriptions exception:', error);
    return errorResponse('Failed to fetch subscriptions', 500);
  }
}

// PUT /admin/subscriptions/:userId - Manually update subscription
export async function updateSubscription(request: Request, userId: string): Promise<Response> {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  const authResult = await adminMiddleware(request);
  if (authResult instanceof Response) return authResult;

  try {
    const body = await request.json() as {
      plan?: PlanType;
      status?: 'active' | 'canceled' | 'unpaid';
    };

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (body.plan) {
      updates.plan = body.plan;
    }

    if (body.status) {
      updates.status = body.status;
    }

    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Update subscription error:', error);
      return errorResponse('Failed to update subscription', 500);
    }

    return jsonResponse({
      message: 'Subscription updated successfully',
      subscription: {
        plan: data.plan,
        status: data.status,
        updatedAt: data.updated_at,
      },
    });
  } catch (error) {
    console.error('Update subscription exception:', error);
    return errorResponse('Failed to update subscription', 500);
  }
}

// POST /admin/subscriptions/:userId/cancel - Cancel subscription in Stripe
export async function cancelSubscription(request: Request, userId: string): Promise<Response> {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  const authResult = await adminMiddleware(request);
  if (authResult instanceof Response) return authResult;

  try {
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('stripe_subscription_id')
      .eq('user_id', userId)
      .single();

    if (!subscription?.stripe_subscription_id) {
      // Just update local status
      await supabaseAdmin
        .from('subscriptions')
        .update({
          plan: 'free',
          status: 'canceled',
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      return jsonResponse({ message: 'Subscription canceled locally (no Stripe subscription)' });
    }

    // Cancel in Stripe
    await stripe.subscriptions.cancel(subscription.stripe_subscription_id);

    // Update local
    await supabaseAdmin
      .from('subscriptions')
      .update({
        plan: 'free',
        status: 'canceled',
        stripe_subscription_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    return jsonResponse({ message: 'Subscription canceled successfully' });
  } catch (error) {
    console.error('Cancel subscription exception:', error);
    return errorResponse('Failed to cancel subscription', 500);
  }
}

// POST /admin/subscriptions/:userId/grant - Grant free premium access
export async function grantPremium(request: Request, userId: string): Promise<Response> {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  const authResult = await adminMiddleware(request);
  if (authResult instanceof Response) return authResult;

  try {
    const body = await request.json() as {
      plan: PlanType;
      duration?: string; // 'permanent' | '30d' | '90d' | '365d'
    };

    const { plan, duration = 'permanent' } = body;

    if (!plan || plan === 'free') {
      return errorResponse('Must specify a paid plan');
    }

    let currentPeriodEnd: string | null = null;

    if (duration !== 'permanent') {
      const days = parseInt(duration.replace('d', ''), 10);
      const date = new Date();
      date.setDate(date.getDate() + days);
      currentPeriodEnd = date.toISOString();
    }

    // Upsert subscription
    const { error } = await supabaseAdmin
      .from('subscriptions')
      .upsert({
        user_id: userId,
        plan,
        status: 'active',
        current_period_end: currentPeriodEnd,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Grant premium error:', error);
      return errorResponse('Failed to grant premium access', 500);
    }

    return jsonResponse({
      message: `Granted ${plan} access ${duration === 'permanent' ? 'permanently' : `for ${duration}`}`,
    });
  } catch (error) {
    console.error('Grant premium exception:', error);
    return errorResponse('Failed to grant premium access', 500);
  }
}
