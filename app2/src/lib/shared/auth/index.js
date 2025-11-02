"use strict";
/**
 * Authentication SDK for the Unified Multi-App Platform
 * Provides shared authentication utilities for all frontend apps
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = exports.State = exports.Guard = exports.AuthAPI = exports.Token = exports.authApi = exports.ServerAuth = exports.AuthState = exports.RouteGuard = exports.AuthApiClient = exports.TokenManager = void 0;
/**
 * JWT Token utilities
 */
class TokenManager {
    static TOKEN_KEY = 'auth_token';
    static REFRESH_TOKEN_KEY = 'refresh_token';
    /**
     * Decode JWT token payload without verification
     * Used for client-side token inspection
     */
    static decodeToken(token) {
        try {
            const parts = token.split('.');
            if (parts.length !== 3)
                return null;
            const payload = JSON.parse(atob(parts[1] || ''));
            return payload;
        }
        catch (error) {
            console.error('Failed to decode token:', error);
            return null;
        }
    }
    /**
     * Check if token is expired
     */
    static isTokenExpired(token) {
        const payload = this.decodeToken(token);
        if (!payload)
            return true;
        const currentTime = Math.floor(Date.now() / 1000);
        return payload.exp < currentTime;
    }
    /**
     * Get token from cookies (for SSR)
     */
    static getTokenFromCookies(cookieString) {
        const cookies = cookieString.split(';').reduce((acc, cookie) => {
            const [key, value] = cookie.trim().split('=');
            if (key && value) {
                acc[key] = value;
            }
            return acc;
        }, {});
        return cookies[this.TOKEN_KEY] || null;
    }
    /**
     * Extract user info from token
     */
    static getUserFromToken(token) {
        const payload = this.decodeToken(token);
        if (!payload)
            return null;
        return {
            _id: payload.userId,
            role: payload.role,
            assignedApps: payload.appAccess,
        };
    }
}
exports.TokenManager = TokenManager;
exports.Token = TokenManager;
/**
 * API Client for authentication endpoints
 */
class AuthApiClient {
    baseURL;
    constructor(baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') {
        this.baseURL = baseURL;
    }
    /**
     * Login user
     */
    async login(email, password) {
        const response = await fetch(`${this.baseURL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Include cookies
            body: JSON.stringify({ email, password }),
        });
        if (!response.ok) {
            throw new Error(`Login failed: ${response.statusText}`);
        }
        return response.json();
    }
    /**
     * Logout user
     */
    async logout() {
        const response = await fetch(`${this.baseURL}/api/auth/logout`, {
            method: 'POST',
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error(`Logout failed: ${response.statusText}`);
        }
        return response.json();
    }
    /**
     * Verify current token
     */
    async verifyToken() {
        const response = await fetch(`${this.baseURL}/api/auth/verify`, {
            method: 'GET',
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error(`Token verification failed: ${response.statusText}`);
        }
        return response.json();
    }
    /**
     * Refresh token
     */
    async refreshToken() {
        const response = await fetch(`${this.baseURL}/api/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error(`Token refresh failed: ${response.statusText}`);
        }
        return response.json();
    }
}
exports.AuthApiClient = AuthApiClient;
exports.AuthAPI = AuthApiClient;
/**
 * Route protection utilities
 */
class RouteGuard {
    /**
     * Check if user has access to specific app
     */
    static hasAppAccess(user, appName) {
        if (!user)
            return false;
        // SuperAdmin has access to all apps
        if (user.role === 'superadmin')
            return true;
        // Check if user is assigned to the app
        return user.assignedApps.includes(appName);
    }
    /**
     * Check if user has required role
     */
    static hasRequiredRole(user, requiredRole) {
        if (!user)
            return false;
        // SuperAdmin has all permissions
        if (user.role === 'superadmin')
            return true;
        return user.role === requiredRole;
    }
    /**
     * Get redirect URL based on user role and app access
     */
    static getRedirectUrl(user) {
        if (!user)
            return '/login';
        // SuperAdmin goes to admin dashboard
        if (user.role === 'superadmin') {
            return '/admin-dashboard';
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
exports.RouteGuard = RouteGuard;
exports.Guard = RouteGuard;
/**
 * Authentication state management utilities
 */
class AuthState {
    /**
     * Create authentication context value
     */
    static createAuthContext(user, isLoading = false) {
        return {
            user,
            isLoading,
            isAuthenticated: !!user,
            hasAppAccess: (appName) => RouteGuard.hasAppAccess(user, appName),
            hasRole: (role) => RouteGuard.hasRequiredRole(user, role),
            getRedirectUrl: () => RouteGuard.getRedirectUrl(user),
        };
    }
}
exports.AuthState = AuthState;
exports.State = AuthState;
/**
 * Server-side authentication utilities
 */
class ServerAuth {
    /**
     * Verify token on server side (for middleware)
     */
    static async verifyServerToken(token, apiUrl) {
        try {
            const response = await fetch(`${apiUrl}/api/auth/verify`, {
                method: 'GET',
                headers: {
                    'Cookie': `auth_token=${token}`,
                },
            });
            if (!response.ok)
                return null;
            const result = await response.json();
            return result.success ? result.data || null : null;
        }
        catch (error) {
            console.error('Server token verification failed:', error);
            return null;
        }
    }
    /**
     * Extract token from request headers/cookies
     */
    static extractTokenFromRequest(req) {
        // Try cookies first
        if (req.cookies?.auth_token) {
            return req.cookies.auth_token;
        }
        // Try Authorization header
        const authHeader = req.headers?.authorization;
        if (authHeader?.startsWith('Bearer ')) {
            return authHeader.substring(7);
        }
        return null;
    }
}
exports.ServerAuth = ServerAuth;
exports.Server = ServerAuth;
// Export default instance for convenience
exports.authApi = new AuthApiClient();
//# sourceMappingURL=index.js.map