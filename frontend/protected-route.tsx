'use client';

import { useEffect } from 'react';
import { useAuth } from './auth-provider';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onUnauthorized?: () => void;
}

export function ProtectedRoute({ children, fallback = null, onUnauthorized }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      onUnauthorized?.();
    }
  }, [isAuthenticated, isLoading, onUnauthorized]);

  if (isLoading) {
    return <>{fallback}</>;
  }

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
