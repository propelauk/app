import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { Eye, EyeOff, LogIn } from 'lucide-react';

export function LoginPage() {
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Test the token by making an API call
      const response = await fetch('/api/admin/analytics', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Invalid token or not an admin');
      }

      login(token);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-3xl">P</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Propela Admin</h1>
          <p className="text-neutral-400 mt-2">Enter your admin JWT token to continue</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="bg-neutral-800 rounded-xl p-6 border border-neutral-700">
          <div className="mb-4">
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Admin JWT Token
            </label>
            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full bg-neutral-700 border border-neutral-600 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
              >
                {showToken ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <p className="text-xs text-neutral-500 mt-2">
              Get your token from the Propela app after logging in as an admin user
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !token}
            className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-neutral-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : (
              <>
                <LogIn size={20} />
                Login to Admin Panel
              </>
            )}
          </button>
        </form>

        <p className="text-center text-neutral-500 text-sm mt-6">
          Only users listed in ADMIN_USER_IDS can access this panel
        </p>
      </div>
    </div>
  );
}
