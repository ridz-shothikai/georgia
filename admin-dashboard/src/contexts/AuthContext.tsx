"use client";

/**
 * Authentication Context for Admin Dashboard
 * Provides authentication state and methods throughout the admin application
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authApi, AuthState } from "../lib/shared/auth";

// Custom response type for verify endpoint
interface VerifyResponse {
  success: boolean;
  message: string;
  data?: {
    user: any;
  };
  error?: string;
}

// LocalStorage keys for user data
const USER_STORAGE_KEY = "auth_user";

const AuthContext = createContext<any | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Log initial state

  // Helper function to save user to localStorage
  const saveUserToStorage = (userData: any) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    }
  };

  // Helper function to get user from localStorage
  const getUserFromStorage = (): any | null => {
    if (typeof window !== "undefined") {
      try {
        const storedUser = localStorage.getItem(USER_STORAGE_KEY);
        return storedUser ? JSON.parse(storedUser) : null;
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
        localStorage.removeItem(USER_STORAGE_KEY);
        return null;
      }
    }
    return null;
  };

  // Helper function to clear user from localStorage
  const clearUserFromStorage = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  };

  // Initialize authentication state
  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log("AuthProvider: Initializing authentication...");

        // First, try to get user from localStorage for quick UI update
        const storedUser = getUserFromStorage();
        if (storedUser) {
          console.log("AuthProvider: Found user in localStorage:", storedUser);
          setUser(storedUser);
          // Don't set loading to false yet, we still need to verify the token
        }

        // Always verify token with server (works with cookies now)
        console.log("AuthProvider: Verifying token with server...");
        const response = (await authApi.verifyToken()) as VerifyResponse;
        console.log("AuthProvider: Token verification response:", response);

        if (response.success && response.data?.user) {
          console.log(
            "AuthProvider: Token verification successful, setting user:",
            response.data.user,
          );
          setUser(response.data.user);
          saveUserToStorage(response.data.user);
        } else {
          // console.log('AuthProvider: Token verification failed, clearing user');
          // setUser(null);
          // clearUserFromStorage();
        }
      } catch (error) {
        console.error("AuthProvider: Auth initialization error:", error);
        setUser(null);
        clearUserFromStorage();
      } finally {
        console.log(
          "AuthProvider: Auth initialization complete, setting loading to false",
        );
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<any> => {
    setIsLoading(true);
    try {
      const response = await authApi.login(email, password);
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        saveUserToStorage(response.data.user);
      }
      return response;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authApi.logout();
      setUser(null);
      clearUserFromStorage();
    } catch (error) {
      console.error("Logout error:", error);
      // Clear user data even if logout API fails
      setUser(null);
      clearUserFromStorage();
    } finally {
      setIsLoading(false);
    }
  };

  const verifyToken = async (): Promise<boolean> => {
    try {
      // First check if we have user in localStorage
      const storedUser = getUserFromStorage();
      if (storedUser) {
        // Verify token with server
        const response = (await authApi.verifyToken()) as VerifyResponse;
        console.log("Token verification response:", response);

        if (response.success && response.data?.user) {
          console.log("Token verification successful:", response.data.user);
          setUser(response.data.user);
          saveUserToStorage(response.data.user);
          return true;
        }
      } else {
        // No stored user, try to verify token
        const response = (await authApi.verifyToken()) as VerifyResponse;
        console.log("Token verification response:", response);

        if (response.success && response.data?.user) {
          console.log("Token verification successful:", response.data.user);
          setUser(response.data.user);
          saveUserToStorage(response.data.user);
          return true;
        }
      }

      // If token verification fails, try to refresh
      try {
        const refreshResponse = await authApi.refreshToken();
        if (refreshResponse.success) {
          // Retry verification with new token
          const retryResponse = (await authApi.verifyToken()) as VerifyResponse;
          if (retryResponse.success && retryResponse.data?.user) {
            setUser(retryResponse.data.user);
            saveUserToStorage(retryResponse.data.user);
            return true;
          }
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
      }

      setUser(null);
      clearUserFromStorage();
      return false;
    } catch (error) {
      console.error("Token verification error:", error);
      setUser(null);
      clearUserFromStorage();
      return false;
    }
  };

  const value: any = {
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
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
