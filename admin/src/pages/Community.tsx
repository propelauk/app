import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { CheckCircle, Flag, Trash2, ChevronLeft, ChevronRight, Filter, CheckCheck } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';

interface Post {
  id: string;
  user_id: string;
  content: string;
  category: string;
  status: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  user: { display_name: string; avatar_url: string };
}

export function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await api.getPosts(page, statusFilter || undefined);
      setPosts(data.posts);
      setTotalPages(data.totalPages);
      setTotal(data.total);
      setSelectedPosts(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [page, statusFilter]);

  const handleApprove = async (id: string) => {
    try {
      await api.approvePost(id);
      fetchPosts();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to approve');
    }
  };

  const handleFlag = async (id: string) => {
    const reason = prompt('Flag reason (optional):');
    try {
      await api.flagPost(id, reason || undefined);
      fetchPosts();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to flag');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    try {
      await api.deletePost(id);
      fetchPosts();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  const handleBulkApprove = async () => {
    if (selectedPosts.size === 0) return;
    try {
      await api.bulkApprovePosts(Array.from(selectedPosts));
      fetchPosts();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to bulk approve');
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedPosts);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedPosts(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedPosts.size === posts.length) {
      setSelectedPosts(new Set());
    } else {
      setSelectedPosts(new Set(posts.map((p) => p.id)));
    }
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    approved: 'bg-green-500/20 text-green-400',
    flagged: 'bg-red-500/20 text-red-400',
  };

  const categoryColors: Record<string, string> = {
    win: 'bg-emerald-500/20 text-emerald-400',
    struggle: 'bg-orange-500/20 text-orange-400',
    tip: 'bg-blue-500/20 text-blue-400',
    question: 'bg-purple-500/20 text-purple-400',
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Community</h1>
          <p className="text-neutral-400">{total} posts</p>
        </div>

        <div className="flex items-center gap-2">
          <Filter size={18} className="text-neutral-400" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="flagged">Flagged</option>
          </select>
          {selectedPosts.size > 0 && statusFilter === 'pending' && (
            <button
              onClick={handleBulkApprove}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <CheckCheck size={18} />
              Approve {selectedPosts.size}
            </button>
          )}
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
          {statusFilter === 'pending' && posts.length > 0 && (
            <div className="mb-4">
              <label className="flex items-center gap-2 text-neutral-400 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedPosts.size === posts.length}
                  onChange={toggleSelectAll}
                  className="rounded border-neutral-600 bg-neutral-700 text-teal-500 focus:ring-teal-500"
                />
                Select all
              </label>
            </div>
          )}

          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className={clsx(
                  'bg-neutral-800 rounded-xl p-4 border transition-colors',
                  selectedPosts.has(post.id) ? 'border-teal-500' : 'border-neutral-700'
                )}
              >
                <div className="flex items-start gap-4">
                  {statusFilter === 'pending' && (
                    <input
                      type="checkbox"
                      checked={selectedPosts.has(post.id)}
                      onChange={() => toggleSelect(post.id)}
                      className="mt-1 rounded border-neutral-600 bg-neutral-700 text-teal-500 focus:ring-teal-500"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      {post.user.avatar_url ? (
                        <img
                          src={post.user.avatar_url}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-neutral-600 flex items-center justify-center text-white text-sm font-medium">
                          {post.user.display_name?.[0] || '?'}
                        </div>
                      )}
                      <span className="text-white font-medium">{post.user.display_name || 'Anonymous'}</span>
                      <span className={clsx('px-2 py-0.5 rounded text-xs font-medium', categoryColors[post.category] || 'bg-neutral-500/20 text-neutral-400')}>
                        {post.category}
                      </span>
                      <span className={clsx('px-2 py-0.5 rounded text-xs font-medium', statusColors[post.status])}>
                        {post.status}
                      </span>
                      <span className="text-neutral-500 text-sm ml-auto">
                        {format(new Date(post.created_at), 'MMM d, yyyy HH:mm')}
                      </span>
                    </div>
                    <p className="text-neutral-300 whitespace-pre-wrap">{post.content}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-neutral-400">
                      <span>❤️ {post.likes_count}</span>
                      <span>💬 {post.comments_count}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {post.status === 'pending' && (
                      <button
                        onClick={() => handleApprove(post.id)}
                        className="p-2 rounded-lg hover:bg-green-500/20 text-green-400 transition-colors"
                        title="Approve"
                      >
                        <CheckCircle size={18} />
                      </button>
                    )}
                    {post.status !== 'flagged' && (
                      <button
                        onClick={() => handleFlag(post.id)}
                        className="p-2 rounded-lg hover:bg-orange-500/20 text-orange-400 transition-colors"
                        title="Flag"
                      >
                        <Flag size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {posts.length === 0 && (
              <div className="text-center py-12 text-neutral-400">
                No posts found
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
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
