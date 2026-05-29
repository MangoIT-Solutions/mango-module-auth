'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { apiClient } from '../api/client';

interface ForgotPasswordPageProps {
  onBack?: () => void;
}

const css = `
  .mng-fp-root {
    display: flex;
    min-height: 100vh;
  }
  .mng-fp-brand {
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
  .mng-fp-brand::before {
    content: '';
    position: absolute;
    width: 420px; height: 420px;
    border-radius: 50%;
    background: rgba(6,182,212,0.07);
    top: -140px; right: -120px;
  }
  .mng-fp-brand::after {
    content: '';
    position: absolute;
    width: 320px; height: 320px;
    border-radius: 50%;
    background: rgba(6,182,212,0.05);
    bottom: -100px; left: -100px;
  }
  .mng-fp-brand-inner {
    position: relative;
    z-index: 1;
    text-align: center;
  }
  .mng-fp-form-panel {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f1f5f9;
    padding: 3rem 2rem;
  }
  .mng-fp-form-inner {
    width: 100%;
    max-width: 400px;
    background: #ffffff;
    border-radius: 16px;
    padding: 2.5rem;
    box-shadow: 0 4px 24px rgba(15,23,42,0.08);
  }
  .mng-fp-input-wrap {
    position: relative;
  }
  .mng-fp-input-icon {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    display: flex;
    align-items: center;
    color: #94a3b8;
  }
  .mng-fp-input {
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
  .mng-fp-input:focus {
    border-color: #06b6d4;
    box-shadow: 0 0 0 3px rgba(6,182,212,0.15);
    background: #ffffff;
  }
  .mng-fp-input-wrap:focus-within .mng-fp-input-icon svg {
    stroke: #06b6d4;
  }
  .mng-fp-input::placeholder {
    color: #94a3b8;
  }
  .mng-fp-btn {
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
  .mng-fp-btn:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: 0 4px 18px rgba(217,119,6,0.45);
  }
  .mng-fp-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  .mng-fp-mobile-header {
    display: none;
  }
  @media (max-width: 820px) {
    .mng-fp-root {
      flex-direction: column;
      background: #f1f5f9;
    }
    .mng-fp-brand {
      display: none;
    }
    .mng-fp-mobile-header {
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
    .mng-fp-form-panel {
      padding: 1.5rem 1.25rem 2rem;
      align-items: flex-start;
    }
    .mng-fp-form-inner {
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

export function ForgotPasswordPage({ onBack }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/organisation-settings/public')
      .then((r) => r.json())
      .then((res) => { if (res.data?.logoPath) setLogoUrl(res.data.logoPath); })
      .catch(() => {});
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await apiClient.post('/auth/forgot-password', { email: email.trim() });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleBack() {
    if (onBack) { onBack(); } else { window.location.href = '/login'; }
  }

  return (
    <>
      <style>{css}</style>
      <div className="mng-fp-root">

        {/* Desktop brand panel */}
        <div className="mng-fp-brand">
          <div className="mng-fp-brand-inner">
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

        {/* Mobile header strip */}
        <div className="mng-fp-mobile-header">
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
        <div className="mng-fp-form-panel">
          <div className="mng-fp-form-inner">
            {submitted ? (
              <>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#ecfeff', border: '1px solid #a5f3fc', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', fontSize: 22 }}>
                  ✉️
                </div>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem' }}>Check your inbox</h1>
                <p style={{ color: '#475569', fontSize: 14, lineHeight: 1.7, margin: '0 0 1.75rem' }}>
                  If that email address is registered, you'll receive a password reset link shortly.
                </p>
                <button type="button" onClick={handleBack} className="mng-fp-btn">← Back to login</button>
              </>
            ) : (
              <>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '0 0 0.25rem' }}>Forgot password?</h1>
                <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 1.75rem', lineHeight: 1.6 }}>
                  Enter your registered email and we'll send you a reset link.
                </p>

                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label htmlFor="fp-email" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151' }}>
                      Email address
                    </label>
                    <div className="mng-fp-input-wrap">
                      <input
                        id="fp-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoFocus
                        placeholder="you@example.com"
                        className="mng-fp-input"
                      />
                      <span className="mng-fp-input-icon"><IconEmail /></span>
                    </div>
                  </div>

                  <button type="submit" disabled={isSubmitting} className="mng-fp-btn" style={{ marginBottom: '1rem' }}>
                    {isSubmitting ? 'Sending…' : 'Send Reset Link'}
                  </button>

                  <div style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={handleBack}
                      style={{ background: 'none', border: 'none', color: '#06b6d4', cursor: 'pointer', padding: 0, fontSize: 14, fontWeight: 500 }}
                    >
                      ← Back to login
                    </button>
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
