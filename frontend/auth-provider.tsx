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

  useEffect(() => {
    const token = getStoredToken('accessToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const isExpired = payload.exp && payload.exp * 1000 < Date.now();
        if (isExpired) {
          clearStoredTokens();
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
