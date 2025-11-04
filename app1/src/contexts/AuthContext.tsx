"use client";

/**
 * Authentication Context for App1
 * Provides authentication state and methods throughout the app
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User, AuthContextType } from "../lib/shared/types";
import { authApi, AuthState } from "../lib/shared/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Verify token on mount and set up user state
  useEffect(() => {
    const verifyUser = async () => {
      try {
        setIsLoading(true);
        const response = await authApi.verifyToken();

        if (response.success && response.data) {
          const myData = response.data as unknown as any;
          setUser(myData.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Token verification failed:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    verifyUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authApi.login(email, password);

      if (response.success && response.data) {
        setUser(response.data.user as User);

        // Redirect to the appropriate URL
        if (response.data.redirectUrl) {
          window.location.href = response.data.redirectUrl;
        }
      }

      return response;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    console.log("🚀 ~ logout ~ logout: 444", window);
    try {
      setIsLoading(true);
      localStorage.clear();
      await authApi.logout();
      setUser(null);

      // Redirect to login page
      window.location.href = "http://localhost:3000/login";
    } catch (error) {
      console.error("Logout failed:", error);
      // Even if logout fails, clear local state
      setUser(null);
      window.location.href = "http://localhost:3000/login";
    } finally {
      setIsLoading(false);
    }
  };

  const verifyToken = async (): Promise<boolean> => {
    try {
      const response = await authApi.verifyToken();

      if (response.success && response.data) {
        setUser(response.data);
        return true;
      } else {
        // If token verification fails, try to refresh the token
        if (!response.success && response.message?.includes("expired")) {
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
            console.error("Token refresh error:", refreshError);
          }
        }

        setUser(null);
        return false;
      }
    } catch (error) {
      console.error("Token verification failed:", error);
      setUser(null);
      return false;
    }
  };

  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    verifyToken,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export { AuthContext };
