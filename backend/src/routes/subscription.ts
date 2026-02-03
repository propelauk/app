import { supabaseAdmin, type Subscription } from '../lib/supabase';
import {
  stripe,
  getPriceId,
  getPlanFromPriceId,
  createCheckoutSession,
  getOrCreateCustomer,
  createPortalSession,
  constructWebhookEvent,
  type PlanType,
  type BillingCycle,
} from '../lib/stripe';
import { authMiddleware, jsonResponse, errorResponse, handleCors } from '../middleware/auth';
import { sendPaymentConfirmationEmail, sendPaymentFailedEmail } from '../lib/resend';
import type Stripe from 'stripe';

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://propela.app';

// POST /subscription/create-checkout
export async function createCheckout(request: Request): Promise<Response> {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  const authResult = await authMiddleware(request);
  if (authResult instanceof Response) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json() as {
      plan: PlanType;
      cycle: BillingCycle;
    };

    const { plan, cycle } = body;

    if (plan === 'free') {
      return errorResponse('Cannot checkout for free plan');
    }

    const priceId = getPriceId(plan, cycle);
    if (!priceId) {
      return errorResponse('Invalid plan or billing cycle');
    }

    // Get user profile for email/name
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('first_name, last_name')
      .eq('user_id', user.id)
      .single();

    const name = profile
      ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
      : undefined;

    // Get or create Stripe customer
    const customerId = await getOrCreateCustomer(user.id, user.email!, name);

    // Update subscription record with customer ID
    await supabaseAdmin
      .from('subscriptions')
      .upsert({
        user_id: user.id,
        stripe_customer_id: customerId,
        updated_at: new Date().toISOString(),
      });

    // Create checkout session
    const session = await createCheckoutSession(
      customerId,
      priceId,
      `${FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      `${FRONTEND_URL}/subscription/canceled`,
      {
        user_id: user.id,
        plan,
        cycle,
      }
    );

    return jsonResponse({ url: session.url });
  } catch (error) {
    console.error('Create checkout error:', error);
    return errorResponse('Failed to create checkout session', 500);
  }
}

// POST /subscription/create-portal
export async function createBillingPortal(request: Request): Promise<Response> {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  const authResult = await authMiddleware(request);
  if (authResult instanceof Response) return authResult;
  const { user } = authResult;

  try {
    // Get subscription with customer ID
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    if (!subscription?.stripe_customer_id) {
      return errorResponse('No subscription found');
    }

    const session = await createPortalSession(
      subscription.stripe_customer_id,
      `${FRONTEND_URL}/settings`
    );

    return jsonResponse({ url: session.url });
  } catch (error) {
    console.error('Create portal error:', error);
    return errorResponse('Failed to create billing portal', 500);
  }
}

// GET /subscription/status
export async function getSubscriptionStatus(request: Request): Promise<Response> {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  const authResult = await authMiddleware(request);
  if (authResult instanceof Response) return authResult;
  const { user } = authResult;

  try {
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!subscription) {
      // Return free plan if no subscription exists
      return jsonResponse({
        plan: 'free',
        status: 'active',
        current_period_end: null,
      });
    }

    return jsonResponse({
      plan: subscription.plan,
      status: subscription.status,
      current_period_end: subscription.current_period_end,
    });
  } catch (error) {
    console.error('Get subscription status error:', error);
    return errorResponse('Failed to get subscription status', 500);
  }
}

// POST /subscription/webhook (Stripe webhook handler)
export async function handleWebhook(request: Request): Promise<Response> {
  const signature = request.headers.get('stripe-signature');
  
  if (!signature) {
    return errorResponse('Missing stripe-signature header', 400);
  }

  let event: Stripe.Event;
  
  try {
    const body = await request.text();
    event = constructWebhookEvent(body, signature);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return errorResponse('Webhook signature verification failed', 400);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCanceled(subscription);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return jsonResponse({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return errorResponse('Webhook handler failed', 500);
  }
}

// Handle checkout session completed
async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id;
  const plan = session.metadata?.plan as PlanType;
  
  if (!userId || !plan) {
    console.error('Missing user_id or plan in checkout metadata');
    return;
  }

  const isLifetime = plan === 'lifetime';
  const subscriptionId = session.subscription as string | null;

  // Get period end from subscription
  let currentPeriodEnd: Date | null = null;
  if (subscriptionId) {
    const sub = await stripe.subscriptions.retrieve(subscriptionId);
    currentPeriodEnd = new Date(sub.current_period_end * 1000);
  }

  // Update subscription in database
  await supabaseAdmin
    .from('subscriptions')
    .upsert({
      user_id: userId,
      plan,
      status: 'active',
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: subscriptionId,
      current_period_end: isLifetime ? null : currentPeriodEnd?.toISOString(),
      updated_at: new Date().toISOString(),
    });

  // Send confirmation email
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('first_name')
    .eq('user_id', userId)
    .single();

  const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId);

  if (authUser?.user?.email && profile?.first_name) {
    const amount = session.amount_total
      ? `$${(session.amount_total / 100).toFixed(2)}`
      : 'N/A';

    await sendPaymentConfirmationEmail(
      authUser.user.email,
      profile.first_name,
      plan.charAt(0).toUpperCase() + plan.slice(1),
      amount,
      currentPeriodEnd?.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    );
  }
}

// Handle successful payment (recurring)
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  const subscriptionId = invoice.subscription as string;

  if (!subscriptionId) return;

  // Get subscription to determine plan
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const priceId = subscription.items.data[0]?.price.id;
  const plan = priceId ? getPlanFromPriceId(priceId) : 'free';

  // Find user by customer ID
  const { data: sub } = await supabaseAdmin
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!sub) return;

  // Update subscription status
  await supabaseAdmin
    .from('subscriptions')
    .update({
      plan,
      status: 'active',
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', sub.user_id);
}

// Handle failed payment
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  // Find user by customer ID
  const { data: sub } = await supabaseAdmin
    .from('subscriptions')
    .select('user_id, plan')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!sub) return;

  // Update subscription status
  await supabaseAdmin
    .from('subscriptions')
    .update({
      status: 'unpaid',
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', sub.user_id);

  // Send payment failed email
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('first_name')
    .eq('user_id', sub.user_id)
    .single();

  const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(sub.user_id);

  if (authUser?.user?.email && profile?.first_name) {
    await sendPaymentFailedEmail(
      authUser.user.email,
      profile.first_name,
      sub.plan.charAt(0).toUpperCase() + sub.plan.slice(1)
    );
  }
}

// Handle subscription updated
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const priceId = subscription.items.data[0]?.price.id;
  const plan = priceId ? getPlanFromPriceId(priceId) : 'free';

  // Map Stripe status to our status
  let status: Subscription['status'] = 'active';
  if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
    status = subscription.status as 'canceled' | 'unpaid';
  } else if (subscription.status === 'past_due') {
    status = 'unpaid';
  }

  // Find user by customer ID and update
  const { data: sub } = await supabaseAdmin
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!sub) return;

  await supabaseAdmin
    .from('subscriptions')
    .update({
      plan,
      status,
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', sub.user_id);
}

// Handle subscription canceled
async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  // Find user by customer ID
  const { data: sub } = await supabaseAdmin
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!sub) return;

  // Downgrade to free plan
  await supabaseAdmin
    .from('subscriptions')
    .update({
      plan: 'free',
      status: 'canceled',
      stripe_subscription_id: null,
      current_period_end: null,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', sub.user_id);
}
