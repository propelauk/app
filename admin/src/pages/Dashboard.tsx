import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Users, CreditCard, MessageSquare, HelpCircle, TrendingUp, DollarSign } from 'lucide-react';
import clsx from 'clsx';

interface Analytics {
  users: { total: number; thisMonth: number; thisWeek: number };
  subscriptions: { total: number; byPlan: Record<string, number>; estimatedMRR: number };
  community: { totalPosts: number; pendingPosts: number; totalComments: number };
  support: { openHelpRequests: number; totalFeedback: number };
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  color: 'teal' | 'blue' | 'purple' | 'orange' | 'pink';
}) {
  const colors = {
    teal: 'bg-teal-500/20 text-teal-400',
    blue: 'bg-blue-500/20 text-blue-400',
    purple: 'bg-purple-500/20 text-purple-400',
    orange: 'bg-orange-500/20 text-orange-400',
    pink: 'bg-pink-500/20 text-pink-400',
  };

  return (
    <div className="bg-neutral-800 rounded-xl p-6 border border-neutral-700">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-neutral-400 text-sm">{title}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
          {subtitle && <p className="text-neutral-500 text-sm mt-1">{subtitle}</p>}
        </div>
        <div className={clsx('p-3 rounded-lg', colors[color])}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .getAnalytics()
      .then(setAnalytics)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-400">
        {error}
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Users"
          value={analytics.users.total}
          subtitle={`+${analytics.users.thisMonth} this month`}
          icon={Users}
          color="teal"
        />
        <StatCard
          title="Active Subscriptions"
          value={analytics.subscriptions.total}
          icon={CreditCard}
          color="blue"
        />
        <StatCard
          title="Estimated MRR"
          value={`$${analytics.subscriptions.estimatedMRR.toFixed(2)}`}
          icon={DollarSign}
          color="purple"
        />
        <StatCard
          title="Pending Posts"
          value={analytics.community.pendingPosts}
          subtitle={`${analytics.community.totalPosts} total posts`}
          icon={MessageSquare}
          color="orange"
        />
        <StatCard
          title="Open Support Tickets"
          value={analytics.support.openHelpRequests}
          icon={HelpCircle}
          color="pink"
        />
        <StatCard
          title="New Users This Week"
          value={analytics.users.thisWeek}
          icon={TrendingUp}
          color="teal"
        />
      </div>

      {/* Subscription Breakdown */}
      <div className="bg-neutral-800 rounded-xl p-6 border border-neutral-700 mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Subscriptions by Plan</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(analytics.subscriptions.byPlan).map(([plan, count]) => (
            <div
              key={plan}
              className="bg-neutral-700/50 rounded-lg p-4 text-center"
            >
              <p className="text-2xl font-bold text-white">{count}</p>
              <p className="text-neutral-400 text-sm capitalize">{plan}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-neutral-800 rounded-xl p-6 border border-neutral-700">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <a
            href="/community?status=pending"
            className="px-4 py-2 bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-colors"
          >
            Review Pending Posts ({analytics.community.pendingPosts})
          </a>
          <a
            href="/support?status=open"
            className="px-4 py-2 bg-pink-500/20 text-pink-400 rounded-lg hover:bg-pink-500/30 transition-colors"
          >
            View Open Tickets ({analytics.support.openHelpRequests})
          </a>
          <a
            href="/users"
            className="px-4 py-2 bg-teal-500/20 text-teal-400 rounded-lg hover:bg-teal-500/30 transition-colors"
          >
            Manage Users
          </a>
        </div>
      </div>
    </div>
  );
}
