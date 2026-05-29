'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { apiClient } from '../api/client';

interface ResetPasswordPageProps {
  token?: string;
  onSuccess?: () => void;
}

const css = `
  .mng-rp-root {
    display: flex;
    min-height: 100vh;
  }
  .mng-rp-brand {
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
  .mng-rp-brand::before {
    content: '';
    position: absolute;
    width: 420px; height: 420px;
    border-radius: 50%;
    background: rgba(6,182,212,0.07);
    top: -140px; right: -120px;
  }
  .mng-rp-brand::after {
    content: '';
    position: absolute;
    width: 320px; height: 320px;
    border-radius: 50%;
    background: rgba(6,182,212,0.05);
    bottom: -100px; left: -100px;
  }
  .mng-rp-brand-inner {
    position: relative;
    z-index: 1;
    text-align: center;
  }
  .mng-rp-form-panel {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f1f5f9;
    padding: 3rem 2rem;
  }
  .mng-rp-form-inner {
    width: 100%;
    max-width: 400px;
    background: #ffffff;
    border-radius: 16px;
    padding: 2.5rem;
    box-shadow: 0 4px 24px rgba(15,23,42,0.08);
  }
  .mng-rp-input-wrap {
    position: relative;
  }
  .mng-rp-input-icon {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    display: flex;
    align-items: center;
    color: #94a3b8;
  }
  .mng-rp-input {
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
  .mng-rp-input:focus {
    border-color: #06b6d4;
    box-shadow: 0 0 0 3px rgba(6,182,212,0.15);
    background: #ffffff;
  }
  .mng-rp-input-wrap:focus-within .mng-rp-input-icon svg {
    stroke: #06b6d4;
  }
  .mng-rp-input::placeholder {
    color: #94a3b8;
  }
  .mng-rp-btn {
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
    text-transform: uppercase;
    transition: opacity 0.15s, transform 0.1s, box-shadow 0.15s;
    font-family: inherit;
  }
  .mng-rp-btn:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: 0 4px 18px rgba(217,119,6,0.45);
  }
  .mng-rp-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  .mng-rp-mobile-header {
    display: none;
  }
  @media (max-width: 820px) {
    .mng-rp-root {
      flex-direction: column;
      background: #f1f5f9;
    }
    .mng-rp-brand {
      display: none;
    }
    .mng-rp-mobile-header {
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
    .mng-rp-form-panel {
      padding: 1.5rem 1.25rem 2rem;
      align-items: flex-start;
    }
    .mng-rp-form-inner {
      padding: 1.75rem;
    }
  }
`;

const IconLock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

export function ResetPasswordPage({ token: tokenProp, onSuccess }: ResetPasswordPageProps) {
  const token = tokenProp ?? (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('token') ?? '' : '');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/organisation-settings/public')
      .then((r) => r.json())
      .then((res) => { if (res.data?.logoPath) setLogoUrl(res.data.logoPath); })
      .catch(() => {});
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    if (newPassword.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (!token) { setError('Invalid reset link. Please request a new one.'); return; }

    setIsSubmitting(true);
    try {
      await apiClient.post('/auth/reset-password', { token, newPassword });
      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) { onSuccess(); } else { window.location.href = '/login'; }
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password. The link may have expired.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const BrandPanel = () => (
    <div className="mng-rp-brand">
      <div className="mng-rp-brand-inner">
        {logoUrl && (
          <div style={{ display: 'inline-block', background: '#ffffff', borderRadius: 12, padding: '0.75rem 1.25rem', marginBottom: '1.75rem', boxShadow: '0 4px 24px rgba(6,182,212,0.2)' }}>
            <img src={logoUrl} alt="Logo" style={{ maxHeight: 56, maxWidth: 200, objectFit: 'contain', display: 'block' }} />
          </div>
        )}
        <h2 style={{ color: '#ffffff', fontSize: 30, fontWeight: 700, margin: '0 0 0.5rem', letterSpacing: '-0.01em' }}>
          Mango <span style={{ color: '#06b6d4' }}>MIS</span>
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, margin: 0, lineHeight: 1.7, maxWidth: 240 }}>
          Your all-in-one platform for managing clients, projects, bids, and team performance.
        </p>
      </div>
    </div>
  );

  const MobileHeader = () => (
    <div className="mng-rp-mobile-header">
      {logoUrl && (
        <div style={{ display: 'inline-block', background: '#ffffff', borderRadius: 8, padding: '0.5rem 1rem', marginBottom: '0.625rem' }}>
          <img src={logoUrl} alt="Logo" style={{ maxHeight: 36, maxWidth: 160, objectFit: 'contain', display: 'block' }} />
        </div>
      )}
      <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, margin: 0, fontWeight: 500 }}>
        Business management, simplified.
      </p>
    </div>
  );

  if (!token) {
    return (
      <>
        <style>{css}</style>
        <div className="mng-rp-root">
          <BrandPanel />
          <MobileHeader />
          <div className="mng-rp-form-panel">
            <div className="mng-rp-form-inner">
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fef2f2', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', fontSize: 22 }}>
                ⚠️
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem' }}>Invalid link</h1>
              <p style={{ color: '#dc2626', fontSize: 14, margin: '0 0 1.5rem' }}>This reset link is invalid or missing a token.</p>
              <a href="/login" style={{ color: '#06b6d4', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>← Back to login</a>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{css}</style>
      <div className="mng-rp-root">
        <BrandPanel />
        <MobileHeader />

        <div className="mng-rp-form-panel">
          <div className="mng-rp-form-inner">
            {success ? (
              <>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#ecfeff', border: '1px solid #a5f3fc', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', fontSize: 22 }}>
                  ✅
                </div>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem' }}>Password reset!</h1>
                <p style={{ color: '#475569', fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                  Your password has been reset successfully. Redirecting you to login…
                </p>
              </>
            ) : (
              <>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '0 0 0.25rem' }}>Set new password</h1>
                <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 1.75rem', lineHeight: 1.6 }}>
                  Choose a strong password for your account.
                </p>

                {error && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '0.625rem 0.875rem', marginBottom: '1.25rem', color: '#dc2626', fontSize: 14 }}>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="rp-new" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151' }}>
                      New password
                    </label>
                    <div className="mng-rp-input-wrap">
                      <input
                        id="rp-new"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        autoFocus
                        minLength={8}
                        placeholder="At least 8 characters"
                        className="mng-rp-input"
                      />
                      <span className="mng-rp-input-icon"><IconLock /></span>
                    </div>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label htmlFor="rp-confirm" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151' }}>
                      Confirm new password
                    </label>
                    <div className="mng-rp-input-wrap">
                      <input
                        id="rp-confirm"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        placeholder="Repeat your new password"
                        className="mng-rp-input"
                      />
                      <span className="mng-rp-input-icon"><IconLock /></span>
                    </div>
                  </div>

                  <button type="submit" disabled={isSubmitting} className="mng-rp-btn" style={{ marginBottom: '1rem' }}>
                    {isSubmitting ? 'Saving…' : 'Reset Password'}
                  </button>

                  <div style={{ textAlign: 'center' }}>
                    <a href="/login" style={{ color: '#06b6d4', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>← Back to login</a>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
