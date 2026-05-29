'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useAuth } from '../auth-provider';

interface LoginPageProps {
  title?: string;
  onSuccess?: () => void;
  onForgotPassword?: () => void;
}

const css = `
  .mng-login-root {
    display: flex;
    min-height: 100vh;
  }
  .mng-login-brand {
    width: 42%;
    background: linear-gradient(150deg, #9a3412 0%, #c2410c 30%, #ea580c 65%, #f97316 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 2.5rem;
    position: relative;
    overflow: hidden;
  }
  .mng-login-brand::before {
    content: '';
    position: absolute;
    width: 420px; height: 420px;
    border-radius: 50%;
    background: rgba(255,255,255,0.06);
    top: -140px; right: -120px;
  }
  .mng-login-brand::after {
    content: '';
    position: absolute;
    width: 320px; height: 320px;
    border-radius: 50%;
    background: rgba(255,255,255,0.06);
    bottom: -100px; left: -100px;
  }
  .mng-login-brand-inner {
    position: relative;
    z-index: 1;
    text-align: center;
  }
  .mng-login-form-panel {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #ffffff;
    padding: 3rem 2rem;
  }
  .mng-login-form-inner {
    width: 100%;
    max-width: 380px;
  }
  .mng-login-input {
    display: block;
    width: 100%;
    padding: 0.625rem 0.75rem;
    margin-top: 0.375rem;
    border: 1.5px solid #e2e8f0;
    border-radius: 8px;
    font-size: 15px;
    color: #0f172a;
    background: #f8fafc;
    box-sizing: border-box;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
    font-family: inherit;
  }
  .mng-login-input:focus {
    border-color: #ea580c;
    box-shadow: 0 0 0 3px rgba(234,88,12,0.12);
    background: #ffffff;
  }
  .mng-login-input::placeholder {
    color: #94a3b8;
  }
  .mng-login-btn {
    width: 100%;
    padding: 0.75rem;
    background: linear-gradient(135deg, #c2410c, #ea580c);
    color: #ffffff;
    border: none;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    letter-spacing: 0.01em;
    transition: opacity 0.15s, transform 0.1s, box-shadow 0.15s;
    font-family: inherit;
  }
  .mng-login-btn:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(194,65,12,0.35);
  }
  .mng-login-btn:active:not(:disabled) {
    transform: translateY(0);
  }
  .mng-login-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  .mng-login-mobile-header {
    display: none;
  }
  @media (max-width: 820px) {
    .mng-login-root {
      flex-direction: column;
    }
    .mng-login-brand {
      display: none;
    }
    .mng-login-mobile-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem 1.5rem 1.5rem;
      background: linear-gradient(150deg, #9a3412 0%, #c2410c 30%, #ea580c 65%, #f97316 100%);
    }
    .mng-login-form-panel {
      padding: 2rem 1.25rem;
      align-items: flex-start;
    }
  }
`;

export function LoginPage({ title = 'Welcome back', onSuccess, onForgotPassword }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const { login } = useAuth();

  useEffect(() => {
    fetch('/api/organisation-settings/public')
      .then((r) => r.json())
      .then((res) => { if (res.data?.logoPath) setLogoUrl(res.data.logoPath); })
      .catch(() => {});
  }, []);

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
    <>
      <style>{css}</style>
      <div className="mng-login-root">

        {/* Desktop brand panel */}
        <div className="mng-login-brand">
          <div className="mng-login-brand-inner">
            {logoUrl && (
              <img
                src={logoUrl}
                alt="Logo"
                style={{ maxHeight: 80, maxWidth: '80%', objectFit: 'contain', marginBottom: '1.75rem', filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.22))' }}
              />
            )}
            <h2 style={{ color: '#ffffff', fontSize: 30, fontWeight: 700, margin: '0 0 0.75rem', textShadow: '0 1px 4px rgba(0,0,0,0.2)' }}>
              Mango MIS
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: 15, margin: 0, lineHeight: 1.7, maxWidth: 260 }}>
              Your all-in-one platform for managing clients, projects, bids, and team performance.
            </p>
            <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { icon: '⚡', text: 'Fast & reliable' },
                { icon: '🔒', text: 'Secure & compliant' },
                { icon: '📊', text: 'Real-time insights' },
              ].map(({ icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <span style={{ fontSize: 16 }}>{icon}</span>
                  <span style={{ color: 'rgba(255,255,255,0.78)', fontSize: 13 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile header strip */}
        <div className="mng-login-mobile-header">
          {logoUrl && (
            <img src={logoUrl} alt="Logo" style={{ maxHeight: 52, maxWidth: '55%', objectFit: 'contain', marginBottom: '0.625rem' }} />
          )}
          <p style={{ color: 'rgba(255,255,255,0.88)', fontSize: 13, margin: 0, fontWeight: 500 }}>
            Business management, simplified.
          </p>
        </div>

        {/* Form panel */}
        <div className="mng-login-form-panel">
          <div className="mng-login-form-inner">
            <h1 style={{ fontSize: 26, fontWeight: 700, color: '#0f172a', margin: '0 0 0.25rem' }}>{title}</h1>
            <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 1.75rem' }}>Sign in to your account to continue.</p>

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '0.625rem 0.875rem', marginBottom: '1.25rem', color: '#dc2626', fontSize: 14 }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="email" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151' }}>
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  placeholder="you@example.com"
                  className="mng-login-input"
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label htmlFor="password" style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    style={{ background: 'none', border: 'none', color: '#ea580c', cursor: 'pointer', padding: 0, fontSize: 13, fontWeight: 500 }}
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="mng-login-input"
                />
              </div>

              <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#ea580c' }}
                />
                <label htmlFor="remember-me" style={{ fontSize: 14, cursor: 'pointer', color: '#4b5563', userSelect: 'none' }}>
                  Remember me
                </label>
              </div>

              <button type="submit" disabled={isSubmitting} className="mng-login-btn">
                {isSubmitting ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>

      </div>
    </>
  );
}
