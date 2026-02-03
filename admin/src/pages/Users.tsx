import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Search, Ban, CheckCircle, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';

interface User {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string;
  is_banned: boolean;
  created_at: string;
  subscription?: { plan: string; status: string };
}

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getUsers(page, 20, search || undefined);
      setUsers(data.users);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleBan = async (user: User) => {
    if (!confirm(`Are you sure you want to ${user.is_banned ? 'unban' : 'ban'} ${user.email}?`)) {
      return;
    }
    try {
      if (user.is_banned) {
        await api.unbanUser(user.id);
      } else {
        await api.banUser(user.id);
      }
      fetchUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Action failed');
    }
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`Are you sure you want to DELETE ${user.email}? This cannot be undone!`)) {
      return;
    }
    try {
      await api.deleteUser(user.id);
      fetchUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const planColors: Record<string, string> = {
    free: 'bg-neutral-500/20 text-neutral-400',
    mid: 'bg-blue-500/20 text-blue-400',
    premium: 'bg-purple-500/20 text-purple-400',
    lifetime: 'bg-amber-500/20 text-amber-400',
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-neutral-400">{total} total users</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email..."
              className="bg-neutral-800 border border-neutral-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-teal-500 w-64"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors"
          >
            Search
          </button>
        </form>
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
                  <th className="text-left text-neutral-400 text-sm font-medium px-4 py-3 hidden md:table-cell">Email</th>
                  <th className="text-left text-neutral-400 text-sm font-medium px-4 py-3 hidden lg:table-cell">Plan</th>
                  <th className="text-left text-neutral-400 text-sm font-medium px-4 py-3 hidden lg:table-cell">Joined</th>
                  <th className="text-left text-neutral-400 text-sm font-medium px-4 py-3">Status</th>
                  <th className="text-right text-neutral-400 text-sm font-medium px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-neutral-700/50 hover:bg-neutral-700/30">
                    <td className="px-4 py-3">
                      <Link to={`/users/${user.id}`} className="flex items-center gap-3 hover:text-teal-400">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-neutral-600 flex items-center justify-center text-white font-medium">
                            {user.display_name?.[0] || user.email[0].toUpperCase()}
                          </div>
                        )}
                        <span className="text-white font-medium">
                          {user.display_name || 'No name'}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-neutral-300 hidden md:table-cell">{user.email}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span
                        className={clsx(
                          'px-2 py-1 rounded text-xs font-medium',
                          planColors[user.subscription?.plan || 'free']
                        )}
                      >
                        {user.subscription?.plan || 'free'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-400 text-sm hidden lg:table-cell">
                      {format(new Date(user.created_at), 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-3">
                      {user.is_banned ? (
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-medium">
                          Banned
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleBan(user)}
                          className={clsx(
                            'p-2 rounded-lg transition-colors',
                            user.is_banned
                              ? 'hover:bg-green-500/20 text-green-400'
                              : 'hover:bg-orange-500/20 text-orange-400'
                          )}
                          title={user.is_banned ? 'Unban user' : 'Ban user'}
                        >
                          {user.is_banned ? <CheckCircle size={18} /> : <Ban size={18} />}
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                          title="Delete user"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
