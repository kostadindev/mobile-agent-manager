import { useState } from 'react';
import { Button } from 'konsta/react';
import { supabase } from '../../lib/supabase';
import { useT } from '../../i18n';

export default function AuthPage() {
  const t = useT();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkEmail, setCheckEmail] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setCheckEmail(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('auth.error'));
    } finally {
      setLoading(false);
    }
  };

  if (checkEmail) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface px-6">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-2xl font-bold text-on-surface mb-2">{t('app.title')}</h1>
          <p className="text-on-surface-muted">{t('auth.checkEmail')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-surface px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-on-surface text-center mb-1">{t('app.title')}</h1>
        <p className="text-on-surface-muted text-center text-sm mb-8">{t('app.subtitle')}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-on-surface-muted mb-1">{t('auth.email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-border bg-control-bg px-3 py-2.5 text-on-surface text-sm outline-none focus:ring-2 focus:ring-[#7c6aef]"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-on-surface-muted mb-1">{t('auth.password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-lg border border-border bg-control-bg px-3 py-2.5 text-on-surface text-sm outline-none focus:ring-2 focus:ring-[#7c6aef]"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <Button
            large
            className="!bg-[#7c6aef] !text-white w-full"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? '...' : isSignUp ? t('auth.signUp') : t('auth.signIn')}
          </Button>
        </form>

        <button
          onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
          className="block mx-auto mt-4 text-sm text-[#7c6aef] hover:underline"
        >
          {isSignUp ? t('auth.switchToSignIn') : t('auth.switchToSignUp')}
        </button>
      </div>
    </div>
  );
}
