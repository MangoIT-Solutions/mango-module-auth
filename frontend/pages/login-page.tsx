'use client';

import { useState, type FormEvent } from 'react';
import { useAuth } from '../auth-provider';

interface LoginPageProps {
  title?: string;
  onSuccess?: () => void;
  onForgotPassword?: () => void;
}

export function LoginPage({ title = 'Admin Login', onSuccess, onForgotPassword }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password, rememberMe);
      onSuccess?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleForgotPassword() {
    if (onForgotPassword) {
      onForgotPassword();
    } else {
      window.location.href = '/forgot-password';
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 400, padding: '2rem' }}>
        <h1>{title}</h1>

        {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}

        <div style={{ marginTop: '1.5rem' }}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            style={{ display: 'block', width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          />
        </div>

        <div style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <label htmlFor="password">Password</label>
            <button
              type="button"
              onClick={handleForgotPassword}
              style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', padding: 0, fontSize: 13 }}
            >
              Forgot password?
            </button>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            style={{ display: 'block', width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          />
        </div>

        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            id="remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            style={{ width: 16, height: 16, cursor: 'pointer' }}
          />
          <label htmlFor="remember-me" style={{ fontSize: 14, cursor: 'pointer', userSelect: 'none' }}>
            Remember me for 30 days
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          style={{ marginTop: '1.5rem', padding: '0.75rem 1.5rem', width: '100%', cursor: 'pointer' }}
        >
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
