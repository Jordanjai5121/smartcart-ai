import {
  createContext, useContext, useEffect, useRef, useState,
  type FormEvent, type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';

type AuthCtx = {
  session: Session | null;
  requireAuth: (then?: () => void) => void; // login irundha direct run, illana popup
  openLogin: () => void;
  logout: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({
  session: null,
  requireAuth: () => {},
  openLogin: () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(Ctx);

export default function AuthGate({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const pending = useRef<(() => void) | null>(null);

  useEffect(() => {
    let active = true;
    const cleanUrl = () =>
      window.history.replaceState({}, document.title, window.location.pathname);

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
      if (window.location.hash || window.location.search.includes('code=')) cleanUrl();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, next) => {
      if (!active) return;
      setSession(next);
      if (event === 'SIGNED_IN') {
        setShowLogin(false);
        setMessage('');
        cleanUrl();
        // login aanathum pending order/action continue aagum
        const fn = pending.current;
        pending.current = null;
        if (fn) setTimeout(fn, 0);
      }
    });

    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  const requireAuth = (then?: () => void) => {
    if (session) { then?.(); return; }
    pending.current = then ?? null;
    setShowLogin(true);
  };

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage('');
    setBusy(true);
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        setMessage(
          data.session
            ? 'Account created!'
            : 'Account created! Email-la confirm pannittu login pannunga.'
        );
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  const logout = async () => { await supabase.auth.signOut(); };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading SmartCart AI...</div>;
  }

  return (
    <Ctx.Provider value={{ session, requireAuth, openLogin: () => setShowLogin(true), logout }}>
      <div className="flex items-center justify-end gap-3 border-b bg-white px-4 py-2">
        {session ? (
          <>
            <span className="text-sm text-slate-600">{session.user.email}</span>
            <button type="button" onClick={logout} className="btn-ghost">Logout</button>
          </>
        ) : (
          <>
            <span className="text-sm text-slate-500">Guest mode</span>
            <button type="button" onClick={() => setShowLogin(true)} className="btn">Login / Sign up</button>
          </>
        )}
      </div>

      {children}

      {showLogin && !session && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">SmartCart AI</h2>
                <p className="text-sm text-slate-500">Order panna login pannunga</p>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => { pending.current = null; setShowLogin(false); setMessage(''); }}
                className="text-xl text-slate-400 hover:text-slate-700"
              >✕</button>
            </div>

            <div className="mb-4 flex gap-3">
              {(['login', 'signup'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setMode(m); setMessage(''); }}
                  className={`flex-1 rounded-lg px-4 py-2 ${mode === m ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}
                >
                  {m === 'login' ? 'Login' : 'Sign up'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email" required autoComplete="email" placeholder="you@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
              <input
                type="password" required minLength={6} placeholder="Password (min 6)"
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
              <button
                type="submit" disabled={busy}
                className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white disabled:opacity-60"
              >
                {busy ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create account'}
              </button>
            </form>

            {message && <p role="status" className="mt-4 break-words text-sm text-slate-700">{message}</p>}
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
}
