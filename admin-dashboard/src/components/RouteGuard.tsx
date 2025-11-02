'use client';

/**
 * Client-side Route Guard Component
 * Handles authentication checking and redirects for protected routes
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

interface RouteGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireSuperAdmin?: boolean;
  redirectTo?: string;
}

export default function RouteGuard({ 
  children, 
  requireAuth = true, 
  requireSuperAdmin = false,
  redirectTo = '/login' 
}: RouteGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) {
      return;
    }

    // If authentication is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      console.log('RouteGuard: User not authenticated, redirecting to:', redirectTo);
      router.push(redirectTo);
      return;
    }

    // If superadmin role is required but user doesn't have it
    if (requireSuperAdmin && user?.role !== 'superadmin') {
      console.log('RouteGuard: User is not superadmin, redirecting to unauthorized');
      router.push('/unauthorized');
      return;
    }

    // If user is authenticated but on login page, redirect to dashboard
    if (isAuthenticated && window.location.pathname === '/login') {
      console.log('RouteGuard: Authenticated user on login page, redirecting to dashboard');
      router.push('/');
      return;
    }
  }, [user, isLoading, isAuthenticated, requireAuth, requireSuperAdmin, redirectTo, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If authentication is required but user is not authenticated, don't render children
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // If superadmin is required but user doesn't have the role, don't render children
  if (requireSuperAdmin && user?.role !== 'superadmin') {
    return null;
  }

  // Render children if all checks pass
  return <>{children}</>;
}