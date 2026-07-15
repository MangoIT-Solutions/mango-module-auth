'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiClient } from './api/client';

export interface User {
  userId: string;
  email: string;
  roleId: string;
  roleName: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: (redirectTo?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getStoredToken(key: string): string | null {
  return localStorage.getItem(key) || sessionStorage.getItem(key);
}

function clearStoredTokens() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('refreshToken');
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Global fetch interceptor: silently refreshes expired tokens on 401
  // and retries the original request, or redirects to /login if refresh fails.
  // This runs throughout the session, not just on page load.
  useEffect(() => {
    const originalFetch = window.fetch.bind(window);
    let pendingRefresh: Promise<string | null> | null = null;

    async function doRefresh(): Promise<string | null> {
      if (pendingRefresh) return pendingRefresh;
      pendingRefresh = (async () => {
        try {
          const storedRefresh = getStoredToken('refreshToken');
          if (!storedRefresh) return null;
          const res = await originalFetch('/api/auth/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: storedRefresh }),
          });
          if (!res.ok) return null;
          const body = await res.json();
          const newAccess: string = body.data?.accessToken;
          const newRefresh: string = body.data?.refreshToken;
          if (!newAccess) return null;
          clearStoredTokens();
          localStorage.setItem('accessToken', newAccess);
          if (newRefresh) localStorage.setItem('refreshToken', newRefresh);
          const payload = JSON.parse(atob(newAccess.split('.')[1]));
          setUser({ userId: payload.userId, email: payload.email, roleId: payload.roleId, roleName: payload.roleName });
          return newAccess;
        } catch {
          return null;
        } finally {
          pendingRefresh = null;
        }
      })();
      return pendingRefresh;
    }

    (window as typeof window).fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const response = await originalFetch(input, init);
      if (response.status !== 401) return response;

      // Don't intercept auth endpoints themselves — would cause infinite loops
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : (input as Request).url;
      if (url.includes('/auth/refresh') || url.includes('/auth/login')) return response;

      const newToken = await doRefresh();
      if (!newToken) {
        clearStoredTokens();
        setUser(null);
        window.location.href = '/login';
        return response;
      }

      // Retry original request with the new access token
      const retryHeaders = new Headers((init?.headers as HeadersInit) || {});
      retryHeaders.set('Authorization', `Bearer ${newToken}`);
      return originalFetch(input, { ...init, headers: retryHeaders });
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  useEffect(() => {
    async function init() {
      const token = getStoredToken('accessToken');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const isExpired = payload.exp && payload.exp * 1000 < Date.now();
          if (isExpired) {
            const storedRefresh = getStoredToken('refreshToken');
            if (storedRefresh) {
              try {
                const response = await apiClient.post<{ accessToken: string; refreshToken: string }>('/auth/refresh', { refreshToken: storedRefresh });
                if (response.data) {
                  clearStoredTokens();
                  localStorage.setItem('accessToken', response.data.accessToken);
                  localStorage.setItem('refreshToken', response.data.refreshToken);
                  const newPayload = JSON.parse(atob(response.data.accessToken.split('.')[1]));
                  setUser({ userId: newPayload.userId, email: newPayload.email, roleId: newPayload.roleId, roleName: newPayload.roleName });
                } else {
                  clearStoredTokens();
                }
              } catch {
                clearStoredTokens();
              }
            } else {
              clearStoredTokens();
            }
          } else {
            setUser({
              userId: payload.userId,
              email: payload.email,
              roleId: payload.roleId,
              roleName: payload.roleName,
            });
          }
        } catch {
          clearStoredTokens();
        }
      }
      setIsLoading(false);
    }
    init();
  }, []);

  const login = useCallback(async (email: string, password: string, rememberMe = false) => {
    const response = await apiClient.post<{ accessToken: string; refreshToken: string }>('/auth/login', {
      email,
      password,
      rememberMe,
    });

    if (response.data) {
      clearStoredTokens();
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      const payload = JSON.parse(atob(response.data.accessToken.split('.')[1]));
      setUser({
        userId: payload.userId,
        email: payload.email,
        roleId: payload.roleId,
        roleName: payload.roleName,
      });
    }
  }, []);

  const logout = useCallback((redirectTo: string = '/auth/login') => {
    clearStoredTokens();
    setUser(null);
    if (typeof window !== 'undefined') {
      window.location.href = redirectTo;
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
