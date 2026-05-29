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
    background-color: #0a1628;
    background-image:
      radial-gradient(rgba(6,182,212,0.13) 1px, transparent 1px),
      linear-gradient(150deg, #060d1a 0%, #0a1628 50%, #0d1f3c 100%);
    background-size: 24px 24px, 100% 100%;
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
    background: rgba(6,182,212,0.07);
    top: -140px; right: -120px;
  }
  .mng-login-brand::after {
    content: '';
    position: absolute;
    width: 320px; height: 320px;
    border-radius: 50%;
    background: rgba(6,182,212,0.05);
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
    background: #f1f5f9;
    padding: 3rem 2rem;
  }
  .mng-login-form-inner {
    width: 100%;
    max-width: 400px;
    background: #ffffff;
    border-radius: 16px;
    padding: 2.5rem;
    box-shadow: 0 4px 24px rgba(15,23,42,0.08);
  }
  .mng-login-input-wrap {
    position: relative;
  }
  .mng-login-input-icon {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    display: flex;
    align-items: center;
    color: #94a3b8;
  }
  .mng-login-input {
    display: block;
    width: 100%;
    padding: 0.625rem 0.75rem 0.625rem 2.5rem;
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
    border-color: #06b6d4;
    box-shadow: 0 0 0 3px rgba(6,182,212,0.15);
    background: #ffffff;
  }
  .mng-login-input:focus + .mng-login-input-icon svg,
  .mng-login-input-wrap:focus-within .mng-login-input-icon svg {
    stroke: #06b6d4;
  }
  .mng-login-input::placeholder {
    color: #94a3b8;
  }
  .mng-login-btn {
    width: 100%;
    padding: 0.75rem;
    background: linear-gradient(135deg, #d97706, #f59e0b);
    color: #ffffff;
    border: none;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    letter-spacing: 0.05em;
    transition: opacity 0.15s, transform 0.1s, box-shadow 0.15s;
    font-family: inherit;
    text-transform: uppercase;
  }
  .mng-login-btn:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: 0 4px 18px rgba(217,119,6,0.45);
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
      background: #f1f5f9;
    }
    .mng-login-brand {
      display: none;
    }
    .mng-login-mobile-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem 1.5rem 1.5rem;
      background-color: #0a1628;
      background-image:
        radial-gradient(rgba(6,182,212,0.13) 1px, transparent 1px),
        linear-gradient(150deg, #060d1a 0%, #0a1628 50%, #0d1f3c 100%);
      background-size: 24px 24px, 100% 100%;
    }
    .mng-login-form-panel {
      padding: 1.5rem 1.25rem 2rem;
      align-items: flex-start;
    }
    .mng-login-form-inner {
      padding: 1.75rem;
    }
  }
`;

const IconEmail = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

const IconLock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

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
              <div style={{ display: 'inline-block', background: '#ffffff', borderRadius: 12, padding: '0.75rem 1.25rem', marginBottom: '1.75rem', boxShadow: '0 4px 24px rgba(6,182,212,0.2)' }}>
                <img src={logoUrl} alt="Logo" style={{ maxHeight: 56, maxWidth: 200, objectFit: 'contain', display: 'block' }} />
              </div>
            )}
            <h2 style={{ color: '#ffffff', fontSize: 30, fontWeight: 700, margin: '0 0 0.5rem', letterSpacing: '-0.01em' }}>
              Mango <span style={{ color: '#06b6d4' }}>MIS</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, margin: '0 0 2.5rem', lineHeight: 1.7, maxWidth: 240 }}>
              Your all-in-one platform for managing clients, projects, bids, and team performance.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', width: '100%', maxWidth: 220 }}>
              {['Fast & reliable', 'Secure & compliant', 'Real-time insights'].map((label) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#06b6d4', flexShrink: 0, display: 'inline-block', boxShadow: '0 0 6px rgba(6,182,212,0.6)' }} />
                  <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13 }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile header strip */}
        <div className="mng-login-mobile-header">
          {logoUrl && (
            <div style={{ display: 'inline-block', background: '#ffffff', borderRadius: 8, padding: '0.5rem 1rem', marginBottom: '0.625rem' }}>
              <img src={logoUrl} alt="Logo" style={{ maxHeight: 36, maxWidth: 160, objectFit: 'contain', display: 'block' }} />
            </div>
          )}
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, margin: 0, fontWeight: 500 }}>
            Business management, simplified.
          </p>
        </div>

        {/* Form panel */}
        <div className="mng-login-form-panel">
          <div className="mng-login-form-inner">
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '0 0 0.25rem' }}>{title}</h1>
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
                <div className="mng-login-input-wrap">
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
                  <span className="mng-login-input-icon"><IconEmail /></span>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label htmlFor="password" style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    style={{ background: 'none', border: 'none', color: '#06b6d4', cursor: 'pointer', padding: 0, fontSize: 13, fontWeight: 500 }}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="mng-login-input-wrap">
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="mng-login-input"
                  />
                  <span className="mng-login-input-icon"><IconLock /></span>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#06b6d4' }}
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
