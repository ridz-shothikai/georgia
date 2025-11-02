/**
 * Authentication SDK for the Unified Multi-App Platform
 * Provides shared authentication utilities for all frontend apps
 */

import { JWTPayload, User, LoginResponse, ApiResponse } from '../types';

/**
 * JWT Token utilities with localStorage support
 */
export class TokenManager {
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';

  /**
   * Store tokens in localStorage
   */
  static setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, accessToken);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  /**
   * Get access token from localStorage
   */
  static getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  /**
   * Get refresh token from localStorage
   */
  static getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }
    return null;
  }

  /**
   * Clear tokens from localStorage
   */
  static clearTokens(): void {
    if (typeof window !== 'undefined') {
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
      const payload = token.split('.')[1];
      if (!payload) return null;
      
      const decoded = JSON.parse(atob(payload));
      return decoded as JWTPayload;
    } catch (error) {
      console.error('Token decode error:', error);
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  }

  /**
   * Get token from cookies (for SSR)
   */
  static getTokenFromCookies(cookieString: string): string | null {
    const cookies = cookieString.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    
    return cookies['auth_token'] || null;
  }

  /**
   * Get access token from browser cookies (client-side)
   */
  static getAccessTokenFromCookies(): string | null {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);
      
      return cookies['auth_token'] || null;
    }
    return null;
  }

  /**
   * Get refresh token from browser cookies (client-side)
   */
  static getRefreshTokenFromCookies(): string | null {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);
      
      return cookies['refresh_token'] || null;
    }
    return null;
  }

  /**
   * Get access token from either localStorage or cookies (fallback)
   */
  static getAccessTokenAny(): string | null {
    // First try localStorage (for backward compatibility)
    const localStorageToken = this.getAccessToken();
    if (localStorageToken) {
      return localStorageToken;
    }
    
    // Fallback to cookies
    return this.getAccessTokenFromCookies();
  }

  /**
   * Get refresh token from either localStorage or cookies (fallback)
   */
  static getRefreshTokenAny(): string | null {
    // First try localStorage (for backward compatibility)
    const localStorageToken = this.getRefreshToken();
    if (localStorageToken) {
      return localStorageToken;
    }
    
    // Fallback to cookies
    return this.getRefreshTokenFromCookies();
  }

  /**
   * Extract user info from token
   */
  static getUserFromToken(token: string): Partial<User> | null {
    const decoded = this.decodeToken(token);
    if (!decoded) return null;
    
    return {
      _id: decoded.userId,
      role: decoded.role,
      assignedApps: decoded.appAccess,
    } as Partial<User>;
  }
}

/**
 * API Client for authentication endpoints with localStorage token support
 */
export class AuthApiClient {
  private baseURL: string;

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005') {
    this.baseURL = baseURL;
  }

  /**
   * Login user (uses cookies set by backend)
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies
      body: JSON.stringify({ email, password }),
    });

    // if (!response.ok) {
    //   throw new Error(`Login failed: ${response.statusText}`);
    // }

    const result = await response.json();
    
    // No need to store tokens in localStorage - backend sets cookies
    // The cookies will be automatically included in subsequent requests
    
    return result;
  }

  /**
   * Logout user (uses cookies)
   */
  async logout(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseURL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
      });

      const result = await response.json();
      
      // Clear any localStorage tokens as well (for cleanup)
      TokenManager.clearTokens();
      
      return result;
    } catch (error) {
      // Clear tokens even if logout API fails
      TokenManager.clearTokens();
      throw error;
    }
  }

  /**
   * Verify current token
   */
  async verifyToken(): Promise<ApiResponse<User>> {
    // Try to get token from cookies first (primary method), then localStorage (fallback)
    const token = TokenManager.getAccessTokenAny();
    
    if (!token) {
      return { success: false, message: 'No token found' };
    }

    if (TokenManager.isTokenExpired(token)) {
      TokenManager.clearTokens();
      return { success: false, message: 'Token expired' };
    }

    try {
      const response = await fetch(`${this.baseURL}/api/auth/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include', // Include cookies in the request
      });

      if (!response.ok) {
        TokenManager.clearTokens();
        return { success: false, message: 'Token verification failed' };
      }

      return response.json();
    } catch (error) {
      TokenManager.clearTokens();
      throw error;
    }
  }

  /**
   * Refresh token
   */
  async refreshToken(): Promise<ApiResponse> {
    // Try to get refresh token from cookies first (primary method), then localStorage (fallback)
    const refreshToken = TokenManager.getRefreshTokenAny();
    
    if (!refreshToken) {
      return { success: false, message: 'No refresh token found' };
    }

    try {
      const response = await fetch(`${this.baseURL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies in the request
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        TokenManager.clearTokens();
        return { success: false, message: 'Token refresh failed' };
      }

      const result = await response.json();
      
      // Store new tokens if provided in response (for localStorage compatibility)
      if (result.success && result.data?.tokens?.accessToken && result.data?.tokens?.refreshToken) {
        TokenManager.setTokens(result.data.tokens.accessToken, result.data.tokens.refreshToken);
      }

      return result;
    } catch (error) {
      TokenManager.clearTokens();
      throw error;
    }
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
    if (user.role === 'superadmin') return true;
    
    // Check if user is assigned to the app
    return user.assignedApps.includes(appName as any);
  }

  /**
   * Check if user has required role
   */
  static hasRequiredRole(user: User | null, requiredRole: string): boolean {
    if (!user) return false;
    
    // SuperAdmin has all permissions
    if (user.role === 'superadmin') return true;
    
    return user.role === requiredRole;
  }

  /**
   * Get redirect URL based on user role and app access
   */
  static getRedirectUrl(user: User | null): string {
    if (!user) return '/login';
    
    // SuperAdmin goes to admin dashboard
    if (user.role === 'superadmin') {
      return '/';
    }
    
    // Regular users go to their first assigned app
    if (user.assignedApps.length > 0) {
      const firstApp = user.assignedApps[0];
      return `/${firstApp}`;
    }
    
    // No app access - redirect to unauthorized
    return '/unauthorized';
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
  static async verifyServerToken(token: string, apiUrl: string): Promise<User | null> {
    try {
      const response = await fetch(`${apiUrl}/api/auth/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) return null;

      const result = await response.json();
      console.log('verifyServerToken - API response:', result);
      
      // Extract user from nested response structure
      if (result.success && result.data?.user) {
        console.log('verifyServerToken - returning user:', result.data.user);
        return result.data.user;
      }
      
      return null;
    } catch (error) {
      console.error('Server token verification failed:', error);
      return null;
    }
  }

  /**
   * Extract token from request headers/cookies
   */
  static extractTokenFromRequest(req: any): string | null {
    console.log('extractTokenFromRequest - headers:', req.headers);
    console.log('extractTokenFromRequest - cookies:', req.cookies);
    
    // Try Authorization header first (for localStorage tokens)
    const authHeader = req.headers?.authorization || req.headers?.get?.('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      console.log('Found token in Authorization header');
      return authHeader.substring(7);
    }

    // Try cookies - handle both plain object and Next.js RequestCookies
    let authToken = null;
    
    if (req.cookies) {
      // For Next.js middleware RequestCookies object
      if (typeof req.cookies.get === 'function') {
        const tokenCookie = req.cookies.get('auth_token');
        authToken = tokenCookie?.value;
      } 
      // For plain cookie object (backward compatibility)
      else if (req.cookies.auth_token) {
        authToken = req.cookies.auth_token;
      }
    }

    if (authToken) {
      console.log('Found token in cookies');
      return authToken;
    }

    console.log('No token found in request');
    return null;
  }
}

// Export default instance for convenience
export const authApi = new AuthApiClient();

export {
  TokenManager as Token,
  AuthApiClient as AuthAPI,
  RouteGuard as Guard,
  AuthState as State,
  ServerAuth as Server,
};