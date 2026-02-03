import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { XCircle, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';

interface Subscription {
  id: string;
  user_id: string;
  plan: string;
  status: string;
  billing_cycle: string;
  current_period_end: string;
  user: { email: string; display_name: string };
}

export function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [planFilter, setPlanFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const data = await api.getSubscriptions(page, planFilter || undefined, statusFilter || undefined);
      setSubscriptions(data.subscriptions);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [page, planFilter, statusFilter]);

  const handleCancel = async (sub: Subscription) => {
    if (!confirm(`Cancel subscription for ${sub.user.email}?`)) return;
    try {
      await api.cancelSubscription(sub.id);
      fetchSubscriptions();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to cancel');
    }
  };

  const planColors: Record<string, string> = {
    free: 'bg-neutral-500/20 text-neutral-400',
    mid: 'bg-blue-500/20 text-blue-400',
    premium: 'bg-purple-500/20 text-purple-400',
    lifetime: 'bg-amber-500/20 text-amber-400',
  };

  const statusColors: Record<string, string> = {
    active: 'bg-green-500/20 text-green-400',
    canceled: 'bg-red-500/20 text-red-400',
    past_due: 'bg-orange-500/20 text-orange-400',
    trialing: 'bg-blue-500/20 text-blue-400',
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Subscriptions</h1>
          <p className="text-neutral-400">{total} total subscriptions</p>
        </div>

        <div className="flex items-center gap-2">
          <Filter size={18} className="text-neutral-400" />
          <select
            value={planFilter}
            onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }}
            className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm"
          >
            <option value="">All Plans</option>
            <option value="free">Free</option>
            <option value="mid">Mid</option>
            <option value="premium">Premium</option>
            <option value="lifetime">Lifetime</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="canceled">Canceled</option>
            <option value="past_due">Past Due</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-400 mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-400"></div>
        </div>
      ) : (
        <>
          <div className="bg-neutral-800 rounded-xl border border-neutral-700 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-700">
                  <th className="text-left text-neutral-400 text-sm font-medium px-4 py-3">User</th>
                  <th className="text-left text-neutral-400 text-sm font-medium px-4 py-3">Plan</th>
                  <th className="text-left text-neutral-400 text-sm font-medium px-4 py-3">Status</th>
                  <th className="text-left text-neutral-400 text-sm font-medium px-4 py-3 hidden md:table-cell">Billing</th>
                  <th className="text-left text-neutral-400 text-sm font-medium px-4 py-3 hidden lg:table-cell">Renews</th>
                  <th className="text-right text-neutral-400 text-sm font-medium px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className="border-b border-neutral-700/50 hover:bg-neutral-700/30">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-white font-medium">{sub.user.display_name || 'No name'}</p>
                        <p className="text-neutral-400 text-sm">{sub.user.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={clsx('px-2 py-1 rounded text-xs font-medium capitalize', planColors[sub.plan])}>
                        {sub.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={clsx('px-2 py-1 rounded text-xs font-medium', statusColors[sub.status] || 'bg-neutral-500/20 text-neutral-400')}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-300 hidden md:table-cell capitalize">
                      {sub.billing_cycle}
                    </td>
                    <td className="px-4 py-3 text-neutral-400 text-sm hidden lg:table-cell">
                      {sub.current_period_end
                        ? format(new Date(sub.current_period_end), 'MMM d, yyyy')
                        : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end">
                        {sub.status === 'active' && sub.plan !== 'lifetime' && (
                          <button
                            onClick={() => handleCancel(sub)}
                            className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                            title="Cancel subscription"
                          >
                            <XCircle size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {subscriptions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-neutral-400">
                      No subscriptions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-neutral-400 text-sm">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
