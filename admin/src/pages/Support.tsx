import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Trash2, ChevronLeft, ChevronRight, Filter, ExternalLink, CheckCircle, Clock, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';

interface HelpRequest {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: string;
  file_url: string | null;
  created_at: string;
  user: { email: string; display_name: string };
}

interface Feedback {
  id: string;
  user_id: string | null;
  type: string;
  message: string;
  created_at: string;
  user: { email: string; display_name: string } | null;
}

type Tab = 'help' | 'feedback';

export function SupportPage() {
  const [activeTab, setActiveTab] = useState<Tab>('help');
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('open');
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);

  const fetchHelpRequests = async () => {
    setLoading(true);
    try {
      const data = await api.getHelpRequests(page, statusFilter || undefined);
      setHelpRequests(data.helpRequests);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load help requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const data = await api.getFeedback(page);
      setFeedback(data.feedback);
      setTotalPages(Math.ceil(data.total / 20));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'help') {
      fetchHelpRequests();
    } else {
      fetchFeedback();
    }
  }, [activeTab, page, statusFilter]);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.updateHelpRequestStatus(id, status);
      fetchHelpRequests();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update');
    }
  };

  const handleDeleteRequest = async (id: string) => {
    if (!confirm('Delete this help request?')) return;
    try {
      await api.deleteHelpRequest(id);
      fetchHelpRequests();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  const handleDeleteFeedback = async (id: string) => {
    if (!confirm('Delete this feedback?')) return;
    try {
      await api.deleteFeedback(id);
      fetchFeedback();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  const statusColors: Record<string, string> = {
    open: 'bg-yellow-500/20 text-yellow-400',
    in_progress: 'bg-blue-500/20 text-blue-400',
    resolved: 'bg-green-500/20 text-green-400',
    closed: 'bg-neutral-500/20 text-neutral-400',
  };

  const typeColors: Record<string, string> = {
    bug: 'bg-red-500/20 text-red-400',
    feature: 'bg-purple-500/20 text-purple-400',
    feedback: 'bg-teal-500/20 text-teal-400',
    other: 'bg-neutral-500/20 text-neutral-400',
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-white">Support</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => { setActiveTab('help'); setPage(1); }}
          className={clsx(
            'px-4 py-2 rounded-lg font-medium transition-colors',
            activeTab === 'help'
              ? 'bg-teal-500 text-white'
              : 'bg-neutral-800 text-neutral-400 hover:text-white'
          )}
        >
          Help Requests
        </button>
        <button
          onClick={() => { setActiveTab('feedback'); setPage(1); }}
          className={clsx(
            'px-4 py-2 rounded-lg font-medium transition-colors',
            activeTab === 'feedback'
              ? 'bg-teal-500 text-white'
              : 'bg-neutral-800 text-neutral-400 hover:text-white'
          )}
        >
          Feedback
        </button>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-400 mb-4">
          {error}
        </div>
      )}

      {activeTab === 'help' && (
        <>
          <div className="flex items-center gap-2 mb-4">
            <Filter size={18} className="text-neutral-400" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-400"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {helpRequests.map((request) => (
                <div
                  key={request.id}
                  className="bg-neutral-800 rounded-xl border border-neutral-700 overflow-hidden"
                >
                  <div
                    className="p-4 cursor-pointer hover:bg-neutral-700/30 transition-colors"
                    onClick={() => setExpandedRequest(expandedRequest === request.id ? null : request.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-white font-medium">{request.subject}</h3>
                          <span className={clsx('px-2 py-0.5 rounded text-xs font-medium', statusColors[request.status])}>
                            {request.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-neutral-400 text-sm">
                          {request.user.display_name || request.user.email} • {format(new Date(request.created_at), 'MMM d, yyyy HH:mm')}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {request.file_url && (
                          <a
                            href={request.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 rounded-lg hover:bg-blue-500/20 text-blue-400 transition-colors"
                            title="View attachment"
                          >
                            <ExternalLink size={18} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {expandedRequest === request.id && (
                    <div className="px-4 pb-4 border-t border-neutral-700 pt-4">
                      <p className="text-neutral-300 whitespace-pre-wrap mb-4">{request.message}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-neutral-400 text-sm mr-2">Update status:</span>
                        <button
                          onClick={() => handleUpdateStatus(request.id, 'in_progress')}
                          disabled={request.status === 'in_progress'}
                          className="px-3 py-1 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 disabled:opacity-50 rounded transition-colors text-sm flex items-center gap-1"
                        >
                          <Clock size={14} />
                          In Progress
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(request.id, 'resolved')}
                          disabled={request.status === 'resolved'}
                          className="px-3 py-1 bg-green-500/20 text-green-400 hover:bg-green-500/30 disabled:opacity-50 rounded transition-colors text-sm flex items-center gap-1"
                        >
                          <CheckCircle size={14} />
                          Resolved
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(request.id, 'closed')}
                          disabled={request.status === 'closed'}
                          className="px-3 py-1 bg-neutral-500/20 text-neutral-400 hover:bg-neutral-500/30 disabled:opacity-50 rounded transition-colors text-sm flex items-center gap-1"
                        >
                          <XCircle size={14} />
                          Close
                        </button>
                        <button
                          onClick={() => handleDeleteRequest(request.id)}
                          className="ml-auto px-3 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded transition-colors text-sm flex items-center gap-1"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {helpRequests.length === 0 && (
                <div className="text-center py-12 text-neutral-400">
                  No help requests found
                </div>
              )}
            </div>
          )}
        </>
      )}

      {activeTab === 'feedback' && (
        <>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-400"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {feedback.map((item) => (
                <div
                  key={item.id}
                  className="bg-neutral-800 rounded-xl p-4 border border-neutral-700"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={clsx('px-2 py-0.5 rounded text-xs font-medium capitalize', typeColors[item.type] || typeColors.other)}>
                          {item.type}
                        </span>
                        <span className="text-neutral-400 text-sm">
                          {item.user ? (item.user.display_name || item.user.email) : 'Anonymous'} • {format(new Date(item.created_at), 'MMM d, yyyy HH:mm')}
                        </span>
                      </div>
                      <p className="text-neutral-300 whitespace-pre-wrap">{item.message}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteFeedback(item.id)}
                      className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
              {feedback.length === 0 && (
                <div className="text-center py-12 text-neutral-400">
                  No feedback found
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
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
      )}
    </div>
  );
}
