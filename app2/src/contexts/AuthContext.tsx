'use client';

/**
 * Authentication Context for App2
 * Provides authentication state and methods throughout the application
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthContextType } from '../lib/shared/types';
import { authApi, AuthState } from '../lib/shared/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize authentication state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const response = await authApi.verifyToken();
        if (response.success && response.data) {
          setUser(response.data);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(email, password);
      if (response.success && response.data) {
        setUser(response.data.user as User);
      }
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyToken = async (): Promise<boolean> => {
    try {
      const response = await authApi.verifyToken();
      if (response.success && response.data) {
        // setUser(response.data);
          const myData = response.data as unknown as any;
          setUser(myData.user);
        return true;
      }
      
      // If token verification fails, try to refresh the token
      if (!response.success && response.message?.includes('expired')) {
        try {
          const refreshResponse = await authApi.refreshToken();
          if (refreshResponse.success) {
            // Retry verification with new token
            const retryResponse = await authApi.verifyToken();
            if (retryResponse.success && retryResponse.data) {
              setUser(retryResponse.data);
              return true;
            }
          }
        } catch (refreshError) {
          console.error('Token refresh error:', refreshError);
        }
      }
      
      return false;
    } catch (error) {
      console.error('Token verification error:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    verifyToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}