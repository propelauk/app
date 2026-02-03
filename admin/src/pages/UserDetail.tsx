import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { ArrowLeft, Ban, CheckCircle, Trash2, Crown, Mail, Calendar, MessageSquare, HelpCircle } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';

interface UserDetail {
  user: {
    id: string;
    email: string;
    display_name: string;
    avatar_url: string;
    is_banned: boolean;
    created_at: string;
  };
  subscription: { plan: string; status: string; billing_cycle: string } | null;
  stats: { posts: number; comments: number; helpRequests: number };
}

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [grantingPremium, setGrantingPremium] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('premium');

  useEffect(() => {
    if (!id) return;
    api
      .getUser(id)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBan = async () => {
    if (!data || !id) return;
    if (!confirm(`Are you sure you want to ${data.user.is_banned ? 'unban' : 'ban'} this user?`)) {
      return;
    }
    try {
      if (data.user.is_banned) {
        await api.unbanUser(id);
      } else {
        await api.banUser(id);
      }
      const updated = await api.getUser(id);
      setData(updated);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Action failed');
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!confirm('Are you sure you want to DELETE this user? This cannot be undone!')) {
      return;
    }
    try {
      await api.deleteUser(id);
      navigate('/users');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const handleGrantPremium = async () => {
    if (!id) return;
    try {
      await api.grantPremium(id, selectedPlan);
      const updated = await api.getUser(id);
      setData(updated);
      setGrantingPremium(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to grant premium');
    }
  };

  const planColors: Record<string, string> = {
    free: 'bg-neutral-500/20 text-neutral-400 border-neutral-500',
    mid: 'bg-blue-500/20 text-blue-400 border-blue-500',
    premium: 'bg-purple-500/20 text-purple-400 border-purple-500',
    lifetime: 'bg-amber-500/20 text-amber-400 border-amber-500',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-400"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-400">
        {error || 'User not found'}
      </div>
    );
  }

  const { user, subscription, stats } = data;

  return (
    <div>
      <Link
        to="/users"
        className="inline-flex items-center gap-2 text-neutral-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={18} />
        Back to Users
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* User Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-neutral-800 rounded-xl p-6 border border-neutral-700">
            <div className="flex items-start gap-4">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt=""
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-neutral-600 flex items-center justify-center text-white text-2xl font-bold">
                  {user.display_name?.[0] || user.email[0].toUpperCase()}
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-white">
                    {user.display_name || 'No name'}
                  </h1>
                  {user.is_banned && (
                    <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-medium">
                      Banned
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-neutral-400 mb-1">
                  <Mail size={16} />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-400">
                  <Calendar size={16} />
                  <span>Joined {format(new Date(user.created_at), 'MMMM d, yyyy')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription */}
          <div className="bg-neutral-800 rounded-xl p-6 border border-neutral-700">
            <h2 className="text-lg font-semibold text-white mb-4">Subscription</h2>
            <div className="flex items-center justify-between">
              <div>
                <div
                  className={clsx(
                    'inline-flex px-3 py-1.5 rounded-lg text-sm font-medium border',
                    planColors[subscription?.plan || 'free']
                  )}
                >
                  {subscription?.plan || 'free'}
                  {subscription?.status && ` (${subscription.status})`}
                </div>
                {subscription?.billing_cycle && (
                  <p className="text-neutral-400 text-sm mt-2">
                    Billing: {subscription.billing_cycle}
                  </p>
                )}
              </div>
              <button
                onClick={() => setGrantingPremium(true)}
                className="px-4 py-2 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 rounded-lg transition-colors flex items-center gap-2"
              >
                <Crown size={18} />
                Grant Premium
              </button>
            </div>

            {/* Grant Premium Modal */}
            {grantingPremium && (
              <div className="mt-4 p-4 bg-neutral-700/50 rounded-lg">
                <h3 className="text-white font-medium mb-3">Grant Premium Access</h3>
                <select
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                  className="w-full bg-neutral-700 border border-neutral-600 rounded-lg px-3 py-2 text-white mb-3"
                >
                  <option value="mid">Mid ($4.99/mo)</option>
                  <option value="premium">Premium ($9.99/mo)</option>
                  <option value="lifetime">Lifetime</option>
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={handleGrantPremium}
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                  >
                    Grant Access
                  </button>
                  <button
                    onClick={() => setGrantingPremium(false)}
                    className="px-4 py-2 bg-neutral-600 hover:bg-neutral-500 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="bg-neutral-800 rounded-xl p-6 border border-neutral-700">
            <h2 className="text-lg font-semibold text-white mb-4">Activity</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-neutral-700/50 rounded-lg">
                <MessageSquare className="mx-auto mb-2 text-teal-400" size={24} />
                <p className="text-2xl font-bold text-white">{stats.posts}</p>
                <p className="text-neutral-400 text-sm">Posts</p>
              </div>
              <div className="text-center p-4 bg-neutral-700/50 rounded-lg">
                <MessageSquare className="mx-auto mb-2 text-blue-400" size={24} />
                <p className="text-2xl font-bold text-white">{stats.comments}</p>
                <p className="text-neutral-400 text-sm">Comments</p>
              </div>
              <div className="text-center p-4 bg-neutral-700/50 rounded-lg">
                <HelpCircle className="mx-auto mb-2 text-pink-400" size={24} />
                <p className="text-2xl font-bold text-white">{stats.helpRequests}</p>
                <p className="text-neutral-400 text-sm">Support Tickets</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-4">
          <div className="bg-neutral-800 rounded-xl p-6 border border-neutral-700">
            <h2 className="text-lg font-semibold text-white mb-4">Actions</h2>
            <div className="space-y-3">
              <button
                onClick={handleBan}
                className={clsx(
                  'w-full px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2',
                  user.is_banned
                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                    : 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'
                )}
              >
                {user.is_banned ? (
                  <>
                    <CheckCircle size={18} />
                    Unban User
                  </>
                ) : (
                  <>
                    <Ban size={18} />
                    Ban User
                  </>
                )}
              </button>
              <button
                onClick={handleDelete}
                className="w-full px-4 py-3 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 size={18} />
                Delete User
              </button>
            </div>
          </div>

          <div className="bg-neutral-800 rounded-xl p-6 border border-neutral-700">
            <h2 className="text-sm font-medium text-neutral-400 mb-2">User ID</h2>
            <code className="text-xs text-neutral-300 break-all">{user.id}</code>
          </div>
        </div>
      </div>
    </div>
  );
}
