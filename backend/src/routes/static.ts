import { supabaseAdmin, type StaticPage } from '../lib/supabase';
import { jsonResponse, errorResponse, handleCors } from '../middleware/auth';

// GET /static/:slug - Get static page content
export async function getStaticPage(request: Request, slug: string): Promise<Response> {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    const validSlugs = ['faq', 'privacy', 'terms', 'help', 'about'];
    
    if (!validSlugs.includes(slug)) {
      return errorResponse('Page not found', 404);
    }

    const { data, error } = await supabaseAdmin
      .from('static_pages')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Get static page error:', error);
      return errorResponse('Failed to fetch page', 500);
    }

    if (!data) {
      // Return default content if not found in DB
      const defaultContent = getDefaultContent(slug);
      return jsonResponse({
        slug,
        title: defaultContent.title,
        content: defaultContent.content,
        updatedAt: new Date().toISOString(),
      });
    }

    return jsonResponse({
      slug: data.slug,
      title: data.title,
      content: data.content,
      updatedAt: data.updated_at,
    });
  } catch (error) {
    console.error('Get static page exception:', error);
    return errorResponse('Failed to fetch page', 500);
  }
}

// GET /static - List all static pages
export async function listStaticPages(request: Request): Promise<Response> {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    const { data, error } = await supabaseAdmin
      .from('static_pages')
      .select('slug, title, updated_at')
      .order('slug');

    if (error) {
      console.error('List static pages error:', error);
      return errorResponse('Failed to fetch pages', 500);
    }

    return jsonResponse({
      pages: data?.map(p => ({
        slug: p.slug,
        title: p.title,
        updatedAt: p.updated_at,
      })) || [],
    });
  } catch (error) {
    console.error('List static pages exception:', error);
    return errorResponse('Failed to fetch pages', 500);
  }
}

// Default content for static pages
function getDefaultContent(slug: string): { title: string; content: string } {
  switch (slug) {
    case 'faq':
      return {
        title: 'Frequently Asked Questions',
        content: `
# Frequently Asked Questions

## Getting Started

### What is Propela?
Propela is an ADHD-friendly productivity app designed to help entrepreneurs stay focused and get things done. It works offline-first, so your data is always available.

### How do I get started?
1. Complete the onboarding to customize your experience
2. Create your first project
3. Break it down into small, manageable tasks
4. Use focus sessions to work on one thing at a time

## Focus Sessions

### How do focus sessions work?
Focus sessions use time-boxing to help you concentrate on one task. Choose 5, 15, 25, or 45 minutes, then work without distractions until the timer ends.

### What if I get distracted?
It's okay! ADHD brains get distracted. Just notice it, and gently bring your attention back to the task. The timer keeps you accountable.

## Premium

### What's included in Premium?
Premium unlocks unlimited projects, extended focus sessions, advanced analytics, custom themes, and priority support.

### Can I try Premium for free?
Yes! We offer a 7-day free trial. Cancel anytime during the trial and you won't be charged.

## Data & Privacy

### Is my data private?
Yes. Your productivity data (tasks, sessions, notes) stays on your device. We only store account info and community posts in the cloud.

### Can I export my data?
Yes, you can export your data anytime from Settings.
        `.trim(),
      };

    case 'privacy':
      return {
        title: 'Privacy Policy',
        content: `
# Privacy Policy

Last updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

## Introduction

Propela ("we", "our", or "us") is committed to protecting your privacy. This policy explains how we collect, use, and safeguard your information.

## Data We Collect

### Data stored on your device (not sent to us):
- Tasks and projects
- Focus session history
- Notes and preferences
- App settings

### Data stored in the cloud:
- Account information (email, name)
- Subscription status
- Community posts and comments
- Help requests (when you contact us)

## How We Use Your Data

- To provide and improve our services
- To process payments and subscriptions
- To respond to support requests
- To send important updates (you can opt out)

## Data Security

We use industry-standard encryption and security practices to protect your data. Your sensitive information is never sold to third parties.

## Your Rights

You have the right to:
- Access your data
- Delete your account
- Export your data
- Opt out of marketing emails

## Contact Us

Questions? Email us at privacy@propela.app
        `.trim(),
      };

    case 'terms':
      return {
        title: 'Terms of Service',
        content: `
# Terms of Service

Last updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

## Acceptance of Terms

By using Propela, you agree to these terms. If you don't agree, please don't use the app.

## Description of Service

Propela is a productivity application designed for people with ADHD. We provide tools for task management, focus sessions, and community support.

## User Accounts

- You must provide accurate information when creating an account
- You're responsible for keeping your password secure
- You must be 13 years or older to use Propela

## Subscriptions & Payments

- Free tier is available with limited features
- Premium subscriptions auto-renew unless canceled
- Refunds are handled case-by-case

## Community Guidelines

When using our community features:
- Be respectful and supportive
- No spam, harassment, or harmful content
- We reserve the right to remove content or ban users

## Limitation of Liability

Propela is provided "as is". We're not liable for any damages arising from your use of the app.

## Changes to Terms

We may update these terms. Continued use means you accept the changes.

## Contact

Questions? Email legal@propela.app
        `.trim(),
      };

    case 'help':
      return {
        title: 'Help Center',
        content: `
# Help Center

Welcome to Propela Help! Here's how to get the most out of the app.

## Quick Start Guide

1. **Complete Onboarding** - Tell us about your focus style
2. **Create a Project** - Start with one main goal
3. **Add Tasks** - Break it into small, specific actions
4. **Set Today's Focus** - Pick ONE task to prioritize
5. **Start a Focus Session** - Use the timer to stay on track

## Tips for ADHD Brains

### Make Tasks Tiny
Instead of "Work on presentation", try "Write slide 1 title". Small wins build momentum.

### Use Body Doubling
Work alongside others (virtually or in-person). The community tab can help!

### Embrace Imperfection
Done is better than perfect. Focus on progress, not perfection.

### Reward Yourself
Celebrate completed tasks! Your brain needs positive reinforcement.

## Troubleshooting

### App running slow?
Try closing and reopening. Your data is safely stored on your device.

### Lost my streak?
Streaks reset at midnight in your timezone. Premium users have streak protection.

### Need more help?
Use the "Get Help" feature to contact our support team directly.
        `.trim(),
      };

    case 'about':
      return {
        title: 'About Propela',
        content: `
# About Propela

## Our Mission

We believe everyone deserves tools that work with their brain, not against it.

Propela was created by entrepreneurs with ADHD, for people with ADHD. We understand the unique challenges of staying focused and productive when your brain works differently.

## Why Offline-First?

Your productivity data is personal. That's why Propela stores everything on your device by default. No internet? No problem. Your tasks, sessions, and progress are always available.

## The Team

We're a small team passionate about making productivity accessible. We use Propela every day to build Propela (very meta, we know).

## Connect With Us

- Email: hello@propela.app
- Twitter: @propela_app
- Community: Join thousands of users in the app!

## Support Development

Love Propela? A Premium subscription helps us keep building features and supporting the community. Thank you for being here! 💚
        `.trim(),
      };

    default:
      return {
        title: 'Page Not Found',
        content: 'The requested page could not be found.',
      };
  }
}
