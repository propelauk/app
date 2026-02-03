# Propela Backend API

Bun-powered REST API for the Propela ADHD productivity app. This backend serves as the source of truth for user accounts, subscriptions, community posts, help requests, and admin analytics—while keeping all personal productivity data offline on the device.

## Tech Stack

- **Runtime**: [Bun](https://bun.sh) - Fast JavaScript runtime
- **Database**: [Supabase](https://supabase.com) - Postgres with Row Level Security
- **Auth**: Supabase Auth - JWT-based authentication
- **Payments**: [Stripe](https://stripe.com) - Subscriptions and billing
- **Email**: [Resend](https://resend.com) - Transactional emails

## Setup

### 1. Install Dependencies

```bash
bun install
```

### 2. Environment Variables

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Required environment variables:

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (admin) |
| `STRIPE_SECRET_KEY` | Stripe secret API key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `RESEND_API_KEY` | Resend API key |
| `ADMIN_USER_IDS` | Comma-separated list of admin user IDs |
| `PORT` | Server port (default: 3000) |
| `CORS_ORIGIN` | Allowed CORS origin (default: *) |

### 3. Database Setup

Run the SQL schema in your Supabase project:

1. Go to Supabase Dashboard → SQL Editor
2. Paste the contents of `supabase/schema.sql`
3. Run the query

This creates all tables, indexes, triggers, and RLS policies.

### 4. Stripe Setup

1. Create products in Stripe Dashboard for each plan tier
2. Update price IDs in `src/lib/stripe.ts`
3. Set up webhook endpoint: `https://your-domain/subscription/webhook`
4. Enable these webhook events:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

### 5. Start Development Server

```bash
bun run dev
```

Server starts at `http://localhost:3000`

## API Endpoints

### Health Check

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | ❌ | Server health check |

### Subscriptions

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/subscription/checkout` | ✅ | Create Stripe checkout session |
| POST | `/subscription/portal` | ✅ | Create Stripe billing portal |
| GET | `/subscription/status` | ✅ | Get user's subscription status |
| POST | `/subscription/webhook` | ❌ | Stripe webhook handler |

### Community

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/community/posts` | 🔓 | List posts (optional auth for like status) |
| POST | `/community/posts` | ✅ | Create a new post |
| POST | `/community/posts/:id/like` | ✅ | Toggle post like |
| DELETE | `/community/posts/:id` | ✅ | Delete own post |
| POST | `/community/posts/:id/comments` | ✅ | Add comment to post |
| POST | `/community/comments/:id/like` | ✅ | Toggle comment like |

### Help Requests

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/help/requests` | ✅ | Submit help request (with file upload) |
| GET | `/help/requests` | ✅ | Get user's help requests |

### Backup

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/backup/metadata` | ✅ | Update backup metadata |
| GET | `/backup/metadata` | ✅ | Get backup metadata |

### Feedback

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/feedback` | 🔓 | Submit feedback (optional auth) |

### Static Pages

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/static/pages` | ❌ | List all static pages |
| GET | `/static/pages/:slug` | ❌ | Get specific page content |

### Feature Flags

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/feature-flags` | ❌ | Get all enabled feature flags |

### Admin: Users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admin/users` | 🔒 | List all users |
| GET | `/admin/users/:id` | 🔒 | Get user details |
| POST | `/admin/users/:id/ban` | 🔒 | Ban user |
| POST | `/admin/users/:id/unban` | 🔒 | Unban user |
| DELETE | `/admin/users/:id` | 🔒 | Delete user |
| POST | `/admin/users/:id/grant-premium` | 🔒 | Grant premium to user |

### Admin: Subscriptions

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admin/subscriptions` | 🔒 | List all subscriptions |
| PATCH | `/admin/subscriptions/:id` | 🔒 | Update subscription |
| POST | `/admin/subscriptions/:id/cancel` | 🔒 | Cancel subscription |

### Admin: Community

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admin/community/posts` | 🔒 | List all posts (any status) |
| POST | `/admin/community/posts/:id/approve` | 🔒 | Approve post |
| POST | `/admin/community/posts/:id/flag` | 🔒 | Flag post |
| DELETE | `/admin/community/posts/:id` | 🔒 | Delete post |
| POST | `/admin/community/posts/bulk-approve` | 🔒 | Bulk approve posts |
| GET | `/admin/community/comments` | 🔒 | List all comments |
| DELETE | `/admin/community/comments/:id` | 🔒 | Delete comment |

### Admin: Analytics

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admin/analytics` | 🔒 | Get dashboard analytics |
| GET | `/admin/analytics/trends` | 🔒 | Get signup/activity trends |

### Admin: Feature Flags

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admin/feature-flags` | 🔒 | List all feature flags |
| POST | `/admin/feature-flags` | 🔒 | Create feature flag |
| GET | `/admin/feature-flags/:key` | 🔒 | Get feature flag |
| PATCH | `/admin/feature-flags/:key` | 🔒 | Update feature flag |
| DELETE | `/admin/feature-flags/:key` | 🔒 | Delete feature flag |

### Admin: Support

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admin/support/help-requests` | 🔒 | List help requests |
| PATCH | `/admin/support/help-requests/:id` | 🔒 | Update request status |
| DELETE | `/admin/support/help-requests/:id` | 🔒 | Delete request |
| GET | `/admin/support/feedback` | 🔒 | List feedback |
| DELETE | `/admin/support/feedback/:id` | 🔒 | Delete feedback |

**Auth Legend:**
- ❌ No auth required
- 🔓 Optional auth
- ✅ Auth required
- 🔒 Admin only

## Subscription Tiers

| Plan | Features |
|------|----------|
| **Free** | 25-min focus sessions, 1 project, 5 tasks per project |
| **Mid** | 45-min sessions, 3 projects, 20 tasks per project |
| **Premium** | Unlimited sessions/projects/tasks, AI insights, community |
| **Lifetime** | Premium forever, one-time purchase |

## Architecture

```
backend/
├── src/
│   ├── index.ts           # Main server entry point
│   ├── lib/
│   │   ├── supabase.ts    # Supabase clients and helpers
│   │   ├── stripe.ts      # Stripe client and helpers
│   │   └── resend.ts      # Email templates and sending
│   ├── middleware/
│   │   ├── auth.ts        # JWT auth middleware
│   │   └── admin.ts       # Admin-only middleware
│   └── routes/
│       ├── subscription.ts # Subscription endpoints
│       ├── community.ts    # Community posts/comments
│       ├── help.ts         # Help request endpoints
│       ├── backup.ts       # Backup metadata
│       ├── feedback.ts     # Feedback submission
│       ├── static.ts       # Static pages
│       └── admin/          # Admin-only endpoints
│           ├── users.ts
│           ├── subscriptions.ts
│           ├── community.ts
│           ├── analytics.ts
│           ├── featureFlags.ts
│           └── support.ts
└── supabase/
    └── schema.sql          # Database schema
```

## Development

```bash
# Start dev server with hot reload
bun run dev

# Type check
bun run typecheck

# Production build (optional, Bun runs TS directly)
bun build src/index.ts --outdir dist
```

## Deployment

The backend can be deployed to any platform that supports Bun:

- **Fly.io**: `fly launch`
- **Railway**: Connect GitHub repo
- **Render**: Docker with Bun image
- **Self-hosted**: Any Linux server with Bun installed

Example Dockerfile:

```dockerfile
FROM oven/bun:1

WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile
COPY . .

EXPOSE 3000
CMD ["bun", "run", "src/index.ts"]
```

## Security Notes

1. **Row Level Security (RLS)**: All Supabase tables have RLS enabled
2. **JWT Validation**: All authenticated routes validate Supabase JWT tokens
3. **Admin Middleware**: Admin routes check `ADMIN_USER_IDS` env var
4. **File Upload Limits**: Help request files limited to 10MB
5. **CORS**: Configure `CORS_ORIGIN` for production

## Important: Offline-First Design

This backend does NOT store personal productivity data (tasks, projects, focus sessions, schedules). That data lives on-device only. The backend stores:

- User accounts and profiles
- Subscription status
- Community posts and comments
- Help requests and feedback
- Backup metadata (timestamps only, not actual data)
- Feature flags and static content
