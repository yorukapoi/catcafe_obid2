import { useState, useEffect } from 'react';
import { Lock, Mail, Cat, AlertCircle, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';

interface AdminLoginProps {
  onLoggedIn: (session: Session) => void;
  session: Session | null;
  onLogout: () => void;
}

export default function AdminLogin({ onLoggedIn, session, onLogout }: AdminLoginProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (error) setError('');
  }, [mode, email, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.session) onLoggedIn(data.session);
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.session) {
          onLoggedIn(data.session);
        } else {
          setError('Account created! Please sign in with your credentials.');
          setMode('login');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (session) {
    return (
      <div className="pt-24 pb-12 min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="section-padding">
          <div className="max-w-md mx-auto text-center bg-white rounded-4xl shadow-sm shadow-rose-100 border border-rose-100/40 p-8">
            <div className="w-16 h-16 mx-auto rounded-full bg-mint-100 flex items-center justify-center mb-4">
              <Cat className="w-8 h-8 text-mint-500" />
            </div>
            <h2 className="font-display font-bold text-2xl text-warm-700 mb-2">Staff Session Active</h2>
            <p className="text-warm-500 text-sm mb-6">You're signed in as {session.user.email}</p>
            <button onClick={onLogout} className="btn-ghost w-full">
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-12 min-h-screen bg-cream-50 bg-paw-pattern flex items-center justify-center">
      <div className="section-padding w-full">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-rose-300 to-lavender-300 flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-display font-bold text-3xl text-warm-700 mb-1">Staff Portal</h1>
            <p className="text-warm-500 text-sm">Sign in to manage café content and applications</p>
          </div>

          <div className="bg-white rounded-4xl shadow-sm shadow-rose-100 border border-rose-100/40 p-6 sm:p-8">
            {/* Mode toggle */}
            <div className="flex gap-2 p-1 bg-cream-100 rounded-full mb-6">
              <button
                onClick={() => setMode('login')}
                className={`flex-1 py-2 rounded-full font-semibold text-sm transition-all ${
                  mode === 'login' ? 'bg-white text-rose-500 shadow-sm' : 'text-warm-400'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setMode('signup')}
                className={`flex-1 py-2 rounded-full font-semibold text-sm transition-all ${
                  mode === 'signup' ? 'bg-white text-rose-500 shadow-sm' : 'text-warm-400'
                }`}
              >
                Create Account
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-warm-600 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-300" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-pastel pl-11"
                    placeholder="staff@whiskers.cafe"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-warm-600 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-300" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-pastel pl-11"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              </div>
              {error && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-rose-600">{error}</p>
                </div>
              )}
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>
            <p className="text-xs text-warm-400 text-center mt-4">
              {mode === 'login' ? 'New staff member? Create an account above.' : 'Already have an account? Sign in above.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
