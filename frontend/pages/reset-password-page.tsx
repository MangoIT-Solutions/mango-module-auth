'use client';

import { useState, type FormEvent } from 'react';
import { apiClient } from '../api/client';

interface ResetPasswordPageProps {
  token?: string;
  onSuccess?: () => void;
}

export function ResetPasswordPage({ token: tokenProp, onSuccess }: ResetPasswordPageProps) {
  const token = tokenProp ?? (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('token') ?? '' : '');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

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

  if (!token) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div style={{ width: '100%', maxWidth: 400, padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: '#dc2626', marginBottom: '1rem' }}>Invalid or missing reset token.</p>
          <a href="/login" style={{ color: '#2563eb', fontSize: 14 }}>← Back to login</a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div style={{ width: '100%', maxWidth: 400, padding: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Set New Password</h1>

        {success ? (
          <p style={{ color: '#16a34a', lineHeight: 1.6 }}>
            Your password has been reset successfully. Redirecting to login…
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: 14 }}>
              Choose a new password for your account.
            </p>

            {error && <p style={{ color: '#dc2626', marginBottom: '1rem', fontSize: 14 }}>{error}</p>}

            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="rp-new" style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
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
                style={{ display: 'block', width: '100%', padding: '0.5rem', marginTop: '0.25rem', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label htmlFor="rp-confirm" style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
                Confirm new password
              </label>
              <input
                id="rp-confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Repeat your new password"
                style={{ display: 'block', width: '100%', padding: '0.5rem', marginTop: '0.25rem', boxSizing: 'border-box' }}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{ width: '100%', padding: '0.625rem', marginBottom: '1rem', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
            >
              {isSubmitting ? 'Saving…' : 'Reset Password'}
            </button>

            <div style={{ textAlign: 'center' }}>
              <a href="/login" style={{ color: '#2563eb', fontSize: 14, textDecoration: 'none' }}>← Back to login</a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
