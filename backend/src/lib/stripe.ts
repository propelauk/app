import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
});

// Price IDs from environment
export const STRIPE_PRICES = {
  mid: {
    monthly: process.env.STRIPE_PRICE_MID_MONTHLY!,
    yearly: process.env.STRIPE_PRICE_MID_YEARLY!,
  },
  premium: {
    monthly: process.env.STRIPE_PRICE_PREMIUM_MONTHLY!,
    yearly: process.env.STRIPE_PRICE_PREMIUM_YEARLY!,
  },
  lifetime: process.env.STRIPE_PRICE_LIFETIME!,
};

export type PlanType = 'free' | 'mid' | 'premium' | 'lifetime';
export type BillingCycle = 'monthly' | 'yearly' | 'lifetime';

// Get price ID for plan and cycle
export function getPriceId(plan: Exclude<PlanType, 'free'>, cycle: BillingCycle): string | null {
  if (plan === 'lifetime') {
    return STRIPE_PRICES.lifetime;
  }
  
  if (cycle === 'lifetime') {
    return null;
  }
  
  return STRIPE_PRICES[plan]?.[cycle] ?? null;
}

// Determine plan from price ID
export function getPlanFromPriceId(priceId: string): PlanType {
  if (priceId === STRIPE_PRICES.lifetime) return 'lifetime';
  if (priceId === STRIPE_PRICES.premium.monthly || priceId === STRIPE_PRICES.premium.yearly) return 'premium';
  if (priceId === STRIPE_PRICES.mid.monthly || priceId === STRIPE_PRICES.mid.yearly) return 'mid';
  return 'free';
}

// Create checkout session
export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string,
  metadata: Record<string, string>
): Promise<Stripe.Checkout.Session> {
  const isLifetime = priceId === STRIPE_PRICES.lifetime;
  
  return stripe.checkout.sessions.create({
    customer: customerId,
    mode: isLifetime ? 'payment' : 'subscription',
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
    allow_promotion_codes: true,
  });
}

// Create or get Stripe customer
export async function getOrCreateCustomer(
  userId: string,
  email: string,
  name?: string
): Promise<string> {
  // Search for existing customer by metadata
  const existingCustomers = await stripe.customers.list({
    email,
    limit: 1,
  });
  
  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0].id;
  }
  
  // Create new customer
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      user_id: userId,
    },
  });
  
  return customer.id;
}

// Cancel subscription
export async function cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  return stripe.subscriptions.cancel(subscriptionId);
}

// Get subscription details
export async function getSubscription(subscriptionId: string): Promise<Stripe.Subscription | null> {
  try {
    return await stripe.subscriptions.retrieve(subscriptionId);
  } catch {
    return null;
  }
}

// Create customer portal session
export async function createPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

// Verify webhook signature
export function constructWebhookEvent(
  body: string,
  signature: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
}
