'use client';

import { useState, type FormEvent } from 'react';
import { apiClient } from '../api/client';

interface ForgotPasswordPageProps {
  onBack?: () => void;
}

export function ForgotPasswordPage({ onBack }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
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

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div style={{ width: '100%', maxWidth: 400, padding: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Forgot Password</h1>

        {submitted ? (
          <>
            <p style={{ color: '#374151', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              If that email address is registered, you'll receive a password reset link shortly. Please check your inbox.
            </p>
            <button
              type="button"
              onClick={onBack ?? (() => { window.location.href = '/login'; })}
              style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', padding: 0, fontSize: 14 }}
            >
              ← Back to login
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: 14 }}>
              Enter your registered email address and we'll send you a link to reset your password.
            </p>

            {error && <p style={{ color: '#dc2626', marginBottom: '1rem', fontSize: 14 }}>{error}</p>}

            <div style={{ marginBottom: '1.25rem' }}>
              <label htmlFor="fp-email" style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
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
                style={{ display: 'block', width: '100%', padding: '0.5rem', marginTop: '0.25rem', boxSizing: 'border-box' }}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{ width: '100%', padding: '0.625rem', marginBottom: '1rem', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
            >
              {isSubmitting ? 'Sending…' : 'Send Reset Link'}
            </button>

            <div style={{ textAlign: 'center' }}>
              <button
                type="button"
                onClick={onBack ?? (() => { window.location.href = '/login'; })}
                style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', padding: 0, fontSize: 14 }}
              >
                ← Back to login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
