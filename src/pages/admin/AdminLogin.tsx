import { useState, useEffect, useCallback } from 'react';
import { Lock, Mail, AlertCircle, LogOut, Clock, XCircle, UserPlus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';
import type { StaffStatus } from '@/lib/types';

export interface StaffApprovalState {
  status: StaffStatus | 'loading' | 'no_profile';
  email: string;
}

interface AdminLoginProps {
  onLoggedIn: (session: Session) => void;
  session: Session | null;
  onLogout: () => void;
  approvalState: StaffApprovalState;
  onRefreshApproval: () => void;
}

export function useStaffApproval(session: Session | null): { state: StaffApprovalState; refresh: () => void } {
  const [state, setState] = useState<StaffApprovalState>({ status: 'loading', email: '' });

  const check = useCallback(async () => {
    if (!session) {
      setState({ status: 'loading', email: '' });
      return;
    }
    const { data, error } = await supabase
      .from('staff_profiles')
      .select('status, email')
      .eq('user_id', session.user.id)
      .maybeSingle();

if (error) {
  console.error('Supabase RLS/Query Error:', error);
}
if (!data) {
  console.warn('No profile found (RLS likely blocking read) for UID:', session.user.id);
}
    
    if (error || !data) {
      setState({ status: 'pending', email: session.user.email || '' });
    } else {
      const status = data.status as StaffStatus;
      setState({
        status: status === 'approved' || status === 'rejected' || status === 'pending' ? status : 'pending',
        email: data.email || session.user.email || '',
      });
    }
  }, [session]);

  useEffect(() => {
    check();
  }, [check]);

  return { state, refresh: check };
}

export default function AdminLogin({ onLoggedIn, session, onLogout, approvalState, onRefreshApproval }: AdminLoginProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);

  useEffect(() => {
    if (error) setError('');
  }, [mode, email, password]);

  // ---- Session active: show approval-gated screens ----
  if (session) {
    if (approvalState.status === 'loading') {
      return (
        <div className="pt-24 pb-12 min-h-screen bg-cream-50 flex items-center justify-center">
          <div className="text-warm-400 text-sm animate-pulse">Checking staff access...</div>
        </div>
      );
    }

    if (approvalState.status === 'pending' || approvalState.status === 'no_profile') {
      return (
        <div className="pt-24 pb-12 min-h-screen bg-cream-50 flex items-center justify-center">
          <div className="section-padding w-full">
            <div className="max-w-md mx-auto text-center bg-white rounded-4xl shadow-sm shadow-rose-100 border border-rose-100/40 p-8">
              <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-amber-500" />
              </div>
              <h2 className="font-display font-bold text-2xl text-warm-700 mb-2">Awaiting Approval</h2>
              <p className="text-warm-500 text-sm mb-2">
                Your staff account request has been received. An existing staff member needs to approve your access before you can use the dashboard.
              </p>
              <p className="text-warm-400 text-xs mb-6">Signed in as {approvalState.email}</p>
              <div className="flex gap-3">
                <button onClick={onRefreshApproval} className="btn-ghost flex-1 text-sm">
                  Check Again
                </button>
                <button onClick={onLogout} className="btn-ghost flex-1 text-sm">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (approvalState.status === 'rejected') {
      return (
        <div className="pt-24 pb-12 min-h-screen bg-cream-50 flex items-center justify-center">
          <div className="section-padding w-full">
            <div className="max-w-md mx-auto text-center bg-white rounded-4xl shadow-sm shadow-rose-100 border border-rose-100/40 p-8">
              <div className="w-16 h-16 mx-auto rounded-full bg-rose-100 flex items-center justify-center mb-4">
                <XCircle className="w-8 h-8 text-rose-500" />
              </div>
              <h2 className="font-display font-bold text-2xl text-warm-700 mb-2">Access Not Approved</h2>
              <p className="text-warm-500 text-sm mb-6">
                Your request for staff access was not approved. Please contact a café manager if you believe this is an error.
              </p>
              <button onClick={onLogout} className="btn-ghost w-full text-sm">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Approved or no_profile — let the parent component decide what to render.
    // If we end up here it means the parent hasn't swapped to the dashboard yet.
    return null;
  }

  // ---- No session: show login / signup form ----
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSignupSuccess(false);

    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.session) onLoggedIn(data.session);
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.session) {
          await supabase.auth.signOut();
        }
        setSignupSuccess(true);
        setMode('login');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
                Request Access
              </button>
            </div>

            {signupSuccess && (
              <div className="bg-mint-50 border border-mint-200 rounded-2xl p-3 flex items-start gap-2 mb-4">
                <UserPlus className="w-4 h-4 text-mint-500 shrink-0 mt-0.5" />
                <p className="text-sm text-mint-600">Account created! If you're the first staff member, you're already approved — just sign in to get started. Otherwise, your request is waiting for approval from existing staff.</p>
              </div>
            )}

            {mode === 'signup' && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 mb-4">
                <p className="text-xs text-amber-600">
                  New accounts start as <span className="font-semibold">pending</span> and need approval from existing staff. The very first staff member is auto-approved so the cafe isn't locked out.
                </p>
              </div>
            )}

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
                {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Request Access'}
              </button>
            </form>
            <p className="text-xs text-warm-400 text-center mt-4">
              {mode === 'login' ? 'New staff member? Request access above.' : 'Already have an account? Sign in above.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
