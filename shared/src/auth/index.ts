/**
 * Authentication SDK for the Unified Multi-App Platform
 * Provides shared authentication utilities for all frontend apps
 */

import { JWTPayload, User, LoginResponse, ApiResponse } from "../types";

/**
 * JWT Token utilities
 */
export class TokenManager {
  private static readonly TOKEN_KEY = "auth_token";
  private static readonly REFRESH_TOKEN_KEY = "refresh_token";

  /**
   * Store access token in localStorage
   */
  static setAccessToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  /**
   * Store refresh token in localStorage
   */
  static setRefreshToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
    }
  }

  /**
   * Get access token from localStorage
   */
  static getAccessToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  /**
   * Get refresh token from localStorage
   */
  static getRefreshToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }
    return null;
  }

  /**
   * Clear all tokens from localStorage
   */
  static clearTokens(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    }
  }

  /**
   * Decode JWT token payload without verification
   * Used for client-side token inspection
   */
  static decodeToken(token: string): JWTPayload | null {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) return null;

      const payload = JSON.parse(atob(parts[1] || ""));
      return payload as JWTPayload;
    } catch (error) {
      console.error("Failed to decode token:", error);
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(token: string): boolean {
    const payload = this.decodeToken(token);
    if (!payload) return true;

    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  }

  /**
   * Get token from cookies (for SSR)
   */
  static getTokenFromCookies(cookieString: string): string | null {
    const cookies = cookieString.split(";").reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split("=");
      if (key && value) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, string>);

    return cookies[this.TOKEN_KEY] || null;
  }

  /**
   * Extract user info from token
   */
  static getUserFromToken(token: string): Partial<User> | null {
    const payload = this.decodeToken(token);
    if (!payload) return null;

    return {
      _id: payload.userId,
      role: payload.role,
      assignedApps: payload.appAccess,
    };
  }
}

/**
 * API Client for authentication endpoints
 */
export class AuthApiClient {
  private baseURL: string;

  constructor(
    baseURL: string = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
  ) {
    this.baseURL = baseURL;
  }

  /**
   * Login user
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${this.baseURL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include cookies
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.statusText}`);
    }

    const result: any = (await response.json()) as LoginResponse;

    // Store tokens in localStorage for header-based authentication
    if (result.success && result.tokens) {
      TokenManager.setAccessToken(result.tokens.accessToken);
      TokenManager.setRefreshToken(result.tokens.refreshToken);
    }

    return result;
  }

  /**
   * Logout user
   */
  async logout(): Promise<ApiResponse> {
    const token = TokenManager.getAccessToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}/api/auth/logout`, {
      method: "POST",
      headers,
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Logout failed: ${response.statusText}`);
    }

    // Clear tokens from localStorage
    TokenManager.clearTokens();

    return response.json() as Promise<ApiResponse>;
  }

  /**
   * Verify current token
   */
  async verifyToken(): Promise<ApiResponse<User>> {
    const token = TokenManager.getAccessToken();

    if (!token) {
      throw new Error("No access token available");
    }

    const response = await fetch(`${this.baseURL}/auth/verify`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Token verification failed: ${response.statusText}`);
    }

    return response.json() as Promise<ApiResponse<User>>;
  }

  /**
   * Refresh token
   */
  async refreshToken(): Promise<ApiResponse> {
    const refreshToken = TokenManager.getRefreshToken();

    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await fetch(`${this.baseURL}/api/auth/refresh`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.statusText}`);
    }

    const result = (await response.json()) as ApiResponse;

    // Update tokens in localStorage if new ones are provided
    if (result.success && (result as any).tokens) {
      const tokens = (result as any).tokens;
      TokenManager.setAccessToken(tokens.accessToken);
      if (tokens.refreshToken) {
        TokenManager.setRefreshToken(tokens.refreshToken);
      }
    }

    return result;
  }
}

/**
 * Route protection utilities
 */
export class RouteGuard {
  /**
   * Check if user has access to specific app
   */
  static hasAppAccess(user: User | null, appName: string): boolean {
    if (!user) return false;

    // SuperAdmin has access to all apps
    if (user.role === "superadmin") return true;

    // Check if user is assigned to the app
    return user.assignedApps.includes(appName as any);
  }

  /**
   * Check if user has required role
   */
  static hasRequiredRole(user: User | null, requiredRole: string): boolean {
    if (!user) return false;

    // SuperAdmin has all permissions
    if (user.role === "superadmin") return true;

    return user.role === requiredRole;
  }

  /**
   * Get redirect URL based on user role and app access
   */
  static getRedirectUrl(user: User | null): string {
    if (!user) return "/login";

    // SuperAdmin goes to admin dashboard
    if (user.role === "superadmin") {
      return "/admin-dashboard";
    }

    // Regular users go to their first assigned app
    if (user.assignedApps.length > 0) {
      const firstApp = user.assignedApps[0];
      return `/${firstApp}`;
    }

    // No app access - redirect to unauthorized
    return "/unauthorized";
  }
}

/**
 * Authentication state management utilities
 */
export class AuthState {
  /**
   * Create authentication context value
   */
  static createAuthContext(user: User | null, isLoading: boolean = false) {
    return {
      user,
      isLoading,
      isAuthenticated: !!user,
      hasAppAccess: (appName: string) => RouteGuard.hasAppAccess(user, appName),
      hasRole: (role: string) => RouteGuard.hasRequiredRole(user, role),
      getRedirectUrl: () => RouteGuard.getRedirectUrl(user),
    };
  }
}

/**
 * Server-side authentication utilities
 */
export class ServerAuth {
  /**
   * Verify token on server side (for middleware)
   */
  static async verifyServerToken(
    token: string,
    apiUrl: string
  ): Promise<User | null> {
    try {
      const response = await fetch(`${apiUrl}/auth/verify`, {
        method: "GET",
        headers: {
          Cookie: `auth_token=${token}`,
        },
      });

      if (!response.ok) return null;

      const result = (await response.json()) as ApiResponse<User>;
      return result.success ? result.data || null : null;
    } catch (error) {
      console.error("Server token verification failed:", error);
      return null;
    }
  }

  /**
   * Extract token from request headers/cookies
   */
  static extractTokenFromRequest(req: any): string | null {
    // Try cookies first
    if (req.cookies?.auth_token) {
      return req.cookies.auth_token;
    }

    // Try Authorization header
    const authHeader = req.headers?.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      return authHeader.substring(7);
    }

    return null;
  }
}

// Export default instance for convenience
export const authApi = new AuthApiClient();

// Export all utilities
export {
  TokenManager as Token,
  AuthApiClient as AuthAPI,
  RouteGuard as Guard,
  AuthState as State,
  ServerAuth as Server,
};

// Re-export types from types module
export type { User, JWTPayload, LoginResponse, ApiResponse } from "../types";