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
    background: linear-gradient(150deg, #9a3412 0%, #c2410c 30%, #ea580c 65%, #f97316 100%);
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
    background: rgba(255,255,255,0.06);
    top: -140px; right: -120px;
  }
  .mng-rp-brand::after {
    content: '';
    position: absolute;
    width: 320px; height: 320px;
    border-radius: 50%;
    background: rgba(255,255,255,0.06);
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
    background: #ffffff;
    padding: 3rem 2rem;
  }
  .mng-rp-form-inner {
    width: 100%;
    max-width: 380px;
  }
  .mng-rp-input {
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
  .mng-rp-input:focus {
    border-color: #ea580c;
    box-shadow: 0 0 0 3px rgba(234,88,12,0.12);
    background: #ffffff;
  }
  .mng-rp-input::placeholder {
    color: #94a3b8;
  }
  .mng-rp-btn {
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
  .mng-rp-btn:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(194,65,12,0.35);
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
    }
    .mng-rp-brand {
      display: none;
    }
    .mng-rp-mobile-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem 1.5rem 1.5rem;
      background: linear-gradient(150deg, #9a3412 0%, #c2410c 30%, #ea580c 65%, #f97316 100%);
    }
    .mng-rp-form-panel {
      padding: 2rem 1.25rem;
      align-items: flex-start;
    }
  }
`;

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

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!token) {
      setError('Invalid reset link. Please request a new one.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post('/auth/reset-password', { token, newPassword });
      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          window.location.href = '/login';
        }
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
      </div>
    </div>
  );

  const MobileHeader = () => (
    <div className="mng-rp-mobile-header">
      {logoUrl && (
        <img src={logoUrl} alt="Logo" style={{ maxHeight: 52, maxWidth: '55%', objectFit: 'contain', marginBottom: '0.625rem' }} />
      )}
      <p style={{ color: 'rgba(255,255,255,0.88)', fontSize: 13, margin: 0, fontWeight: 500 }}>
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
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', fontSize: 22 }}>
                ⚠️
              </div>
              <h1 style={{ fontSize: 26, fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem' }}>Invalid link</h1>
              <p style={{ color: '#dc2626', fontSize: 14, margin: '0 0 1.5rem' }}>
                This reset link is invalid or missing a token.
              </p>
              <a href="/login" style={{ color: '#ea580c', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>← Back to login</a>
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
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', fontSize: 22 }}>
                  ✅
                </div>
                <h1 style={{ fontSize: 26, fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem' }}>Password reset!</h1>
                <p style={{ color: '#475569', fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                  Your password has been reset successfully. Redirecting you to login…
                </p>
              </>
            ) : (
              <>
                <h1 style={{ fontSize: 26, fontWeight: 700, color: '#0f172a', margin: '0 0 0.25rem' }}>Set new password</h1>
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
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label htmlFor="rp-confirm" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151' }}>
                      Confirm new password
                    </label>
                    <input
                      id="rp-confirm"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Repeat your new password"
                      className="mng-rp-input"
                    />
                  </div>

                  <button type="submit" disabled={isSubmitting} className="mng-rp-btn" style={{ marginBottom: '1rem' }}>
                    {isSubmitting ? 'Saving…' : 'Reset Password'}
                  </button>

                  <div style={{ textAlign: 'center' }}>
                    <a href="/login" style={{ color: '#ea580c', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>← Back to login</a>
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
