
import { useEffect, useState, type FormEvent } from 'react';
import { supabase } from './lib/supabase';
import type { Session } from '@supabase/supabase-js';

export default function AuthGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) setMessage(error.message);
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (active) setSession(nextSession);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage('');
    setBusy(true);

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });

        if (error) throw error;

        if (!data.session) {
          setMessage(
            'Account created! Check your email and confirm your account before logging in.'
          );
        } else {
          setMessage('Account created successfully!');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
      }
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : 'Something went wrong.'
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) setMessage(error.message);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading SmartCart AI...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
          <h1 className="text-3xl font-bold text-slate-900">
            SmartCart AI
          </h1>
          <p className="mb-6 mt-2 text-slate-500">
            Your personal shopping and price tracker
          </p>

          <div className="mb-6 flex gap-3">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setMessage('');
              }}
              className={`flex-1 rounded-lg px-4 py-2 ${
                mode === 'login'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setMessage('');
              }}
              className={`flex-1 rounded-lg px-4 py-2 ${
                mode === 'signup'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              Sign up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-sm font-medium"
              >
                Password (minimum 6 characters)
              </label>
              <input
                id="password"
                type="password"
                autoComplete={
                  mode === 'signup' ? 'new-password' : 'current-password'
                }
                minLength={6}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                placeholder="Enter password"
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white disabled:opacity-60"
            >
              {busy
                ? 'Please wait...'
                : mode === 'login'
                  ? 'Login'
                  : 'Create account'}
            </button>
          </form>

          {message && (
            <p
              role="status"
              className="mt-4 break-words text-sm text-slate-700"
            >
              {message}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-end gap-3 border-b bg-white px-4 py-2">
        <span className="text-sm text-slate-600">{session.user.email}</span>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg border px-3 py-2 text-sm"
        >
          Logout
        </button>
      </div>
      {children}
    </>
  );
}
