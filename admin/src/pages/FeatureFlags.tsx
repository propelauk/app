import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Plus, Trash2, ToggleLeft, ToggleRight, Save } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';

interface FeatureFlag {
  key: string;
  enabled: boolean;
  description: string | null;
  updated_at: string;
}

export function FeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newFlag, setNewFlag] = useState({ key: '', enabled: false, description: '' });
  const [editingFlag, setEditingFlag] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState('');

  const fetchFlags = async () => {
    setLoading(true);
    try {
      const data = await api.getFeatureFlags();
      setFlags(data.flags);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load feature flags');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlags();
  }, []);

  const handleToggle = async (flag: FeatureFlag) => {
    try {
      await api.updateFeatureFlag(flag.key, !flag.enabled, flag.description || undefined);
      fetchFlags();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFlag.key) return;
    try {
      await api.createFeatureFlag(newFlag.key, newFlag.enabled, newFlag.description || undefined);
      setNewFlag({ key: '', enabled: false, description: '' });
      setShowCreateForm(false);
      fetchFlags();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create');
    }
  };

  const handleDelete = async (key: string) => {
    if (!confirm(`Delete feature flag "${key}"?`)) return;
    try {
      await api.deleteFeatureFlag(key);
      fetchFlags();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  const handleSaveDescription = async (key: string) => {
    const flag = flags.find((f) => f.key === key);
    if (!flag) return;
    try {
      await api.updateFeatureFlag(key, flag.enabled, editDescription);
      setEditingFlag(null);
      fetchFlags();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update');
    }
  };

  const startEditing = (flag: FeatureFlag) => {
    setEditingFlag(flag.key);
    setEditDescription(flag.description || '');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-400"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Feature Flags</h1>
          <p className="text-neutral-400">Toggle features on and off</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          New Flag
        </button>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-400 mb-4">
          {error}
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <form
          onSubmit={handleCreate}
          className="bg-neutral-800 rounded-xl p-4 border border-neutral-700 mb-6"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Create Feature Flag</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Key</label>
              <input
                type="text"
                value={newFlag.key}
                onChange={(e) => setNewFlag({ ...newFlag, key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') })}
                placeholder="my_feature_flag"
                className="w-full bg-neutral-700 border border-neutral-600 rounded-lg px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Description</label>
              <input
                type="text"
                value={newFlag.description}
                onChange={(e) => setNewFlag({ ...newFlag, description: e.target.value })}
                placeholder="What does this flag control?"
                className="w-full bg-neutral-700 border border-neutral-600 rounded-lg px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newFlag.enabled}
                onChange={(e) => setNewFlag({ ...newFlag, enabled: e.target.checked })}
                className="rounded border-neutral-600 bg-neutral-700 text-teal-500 focus:ring-teal-500"
              />
              <span className="text-neutral-300">Enabled by default</span>
            </label>
            <div className="flex-1" />
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 text-neutral-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors"
            >
              Create Flag
            </button>
          </div>
        </form>
      )}

      {/* Flags List */}
      <div className="bg-neutral-800 rounded-xl border border-neutral-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-700">
              <th className="text-left text-neutral-400 text-sm font-medium px-4 py-3">Flag</th>
              <th className="text-left text-neutral-400 text-sm font-medium px-4 py-3 hidden md:table-cell">Description</th>
              <th className="text-left text-neutral-400 text-sm font-medium px-4 py-3 hidden lg:table-cell">Updated</th>
              <th className="text-center text-neutral-400 text-sm font-medium px-4 py-3">Status</th>
              <th className="text-right text-neutral-400 text-sm font-medium px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {flags.map((flag) => (
              <tr key={flag.key} className="border-b border-neutral-700/50 hover:bg-neutral-700/30">
                <td className="px-4 py-3">
                  <code className="text-teal-400 bg-teal-500/10 px-2 py-1 rounded text-sm">{flag.key}</code>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  {editingFlag === flag.key ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="flex-1 bg-neutral-700 border border-neutral-600 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveDescription(flag.key)}
                        className="p-1 text-teal-400 hover:text-teal-300"
                      >
                        <Save size={16} />
                      </button>
                    </div>
                  ) : (
                    <span
                      className="text-neutral-300 text-sm cursor-pointer hover:text-white"
                      onClick={() => startEditing(flag)}
                    >
                      {flag.description || <span className="text-neutral-500 italic">Click to add description</span>}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-neutral-400 text-sm hidden lg:table-cell">
                  {format(new Date(flag.updated_at), 'MMM d, yyyy HH:mm')}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleToggle(flag)}
                    className={clsx(
                      'transition-colors',
                      flag.enabled ? 'text-green-400 hover:text-green-300' : 'text-neutral-500 hover:text-neutral-400'
                    )}
                  >
                    {flag.enabled ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end">
                    <button
                      onClick={() => handleDelete(flag.key)}
                      className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                      title="Delete flag"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {flags.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-400">
                  No feature flags found. Create one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Info */}
      <div className="mt-6 p-4 bg-neutral-800/50 rounded-lg border border-neutral-700">
        <h3 className="text-white font-medium mb-2">How to use feature flags</h3>
        <p className="text-neutral-400 text-sm">
          Feature flags are returned via the <code className="text-teal-400 bg-teal-500/10 px-1 rounded">GET /feature-flags</code> endpoint.
          The app fetches enabled flags on startup and uses them to conditionally show/hide features.
        </p>
        <div className="mt-3 text-sm text-neutral-400">
          <strong className="text-neutral-300">Common flags:</strong>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li><code className="text-teal-400">maintenance_mode</code> - Show maintenance page to all users</li>
            <li><code className="text-teal-400">community_enabled</code> - Enable/disable community features</li>
            <li><code className="text-teal-400">premium_45min_sessions</code> - Gate 45-min sessions behind premium</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
