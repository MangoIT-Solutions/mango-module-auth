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
    background: linear-gradient(150deg, #9a3412 0%, #c2410c 30%, #ea580c 65%, #f97316 100%);
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
    background: rgba(255,255,255,0.06);
    top: -140px; right: -120px;
  }
  .mng-fp-brand::after {
    content: '';
    position: absolute;
    width: 320px; height: 320px;
    border-radius: 50%;
    background: rgba(255,255,255,0.06);
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
    background: #ffffff;
    padding: 3rem 2rem;
  }
  .mng-fp-form-inner {
    width: 100%;
    max-width: 380px;
  }
  .mng-fp-input {
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
  .mng-fp-input:focus {
    border-color: #ea580c;
    box-shadow: 0 0 0 3px rgba(234,88,12,0.12);
    background: #ffffff;
  }
  .mng-fp-input::placeholder {
    color: #94a3b8;
  }
  .mng-fp-btn {
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
  .mng-fp-btn:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(194,65,12,0.35);
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
    }
    .mng-fp-brand {
      display: none;
    }
    .mng-fp-mobile-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem 1.5rem 1.5rem;
      background: linear-gradient(150deg, #9a3412 0%, #c2410c 30%, #ea580c 65%, #f97316 100%);
    }
    .mng-fp-form-panel {
      padding: 2rem 1.25rem;
      align-items: flex-start;
    }
  }
`;

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
      // Show success even on error to avoid email enumeration
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleBack() {
    if (onBack) {
      onBack();
    } else {
      window.location.href = '/login';
    }
  }

  return (
    <>
      <style>{css}</style>
      <div className="mng-fp-root">

        {/* Desktop brand panel */}
        <div className="mng-fp-brand">
          <div className="mng-fp-brand-inner">
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

        {/* Mobile header strip */}
        <div className="mng-fp-mobile-header">
          {logoUrl && (
            <img src={logoUrl} alt="Logo" style={{ maxHeight: 52, maxWidth: '55%', objectFit: 'contain', marginBottom: '0.625rem' }} />
          )}
          <p style={{ color: 'rgba(255,255,255,0.88)', fontSize: 13, margin: 0, fontWeight: 500 }}>
            Business management, simplified.
          </p>
        </div>

        {/* Form panel */}
        <div className="mng-fp-form-panel">
          <div className="mng-fp-form-inner">
            {submitted ? (
              <>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', fontSize: 22 }}>
                  ✉️
                </div>
                <h1 style={{ fontSize: 26, fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem' }}>Check your inbox</h1>
                <p style={{ color: '#475569', fontSize: 14, lineHeight: 1.7, margin: '0 0 1.75rem' }}>
                  If that email address is registered, you'll receive a password reset link shortly.
                </p>
                <button type="button" onClick={handleBack} className="mng-fp-btn">
                  ← Back to login
                </button>
              </>
            ) : (
              <>
                <h1 style={{ fontSize: 26, fontWeight: 700, color: '#0f172a', margin: '0 0 0.25rem' }}>Forgot password?</h1>
                <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 1.75rem', lineHeight: 1.6 }}>
                  Enter your registered email and we'll send you a reset link.
                </p>

                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label htmlFor="fp-email" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151' }}>
                      Email address
                    </label>
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
                  </div>

                  <button type="submit" disabled={isSubmitting} className="mng-fp-btn" style={{ marginBottom: '1rem' }}>
                    {isSubmitting ? 'Sending…' : 'Send Reset Link'}
                  </button>

                  <div style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={handleBack}
                      style={{ background: 'none', border: 'none', color: '#ea580c', cursor: 'pointer', padding: 0, fontSize: 14, fontWeight: 500 }}
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
