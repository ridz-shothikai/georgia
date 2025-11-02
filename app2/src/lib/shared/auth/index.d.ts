/**
 * Authentication SDK for the Unified Multi-App Platform
 * Provides shared authentication utilities for all frontend apps
 */
import { JWTPayload, User, LoginResponse, ApiResponse } from '../types';
/**
 * JWT Token utilities
 */
export declare class TokenManager {
    private static readonly TOKEN_KEY;
    private static readonly REFRESH_TOKEN_KEY;
    /**
     * Decode JWT token payload without verification
     * Used for client-side token inspection
     */
    static decodeToken(token: string): JWTPayload | null;
    /**
     * Check if token is expired
     */
    static isTokenExpired(token: string): boolean;
    /**
     * Get token from cookies (for SSR)
     */
    static getTokenFromCookies(cookieString: string): string | null;
    /**
     * Extract user info from token
     */
    static getUserFromToken(token: string): Partial<User> | null;
}
/**
 * API Client for authentication endpoints
 */
export declare class AuthApiClient {
    private baseURL;
    constructor(baseURL?: string);
    /**
     * Login user
     */
    login(email: string, password: string): Promise<LoginResponse>;
    /**
     * Logout user
     */
    logout(): Promise<ApiResponse>;
    /**
     * Verify current token
     */
    verifyToken(): Promise<ApiResponse<User>>;
    /**
     * Refresh token
     */
    refreshToken(): Promise<ApiResponse>;
}
/**
 * Route protection utilities
 */
export declare class RouteGuard {
    /**
     * Check if user has access to specific app
     */
    static hasAppAccess(user: User | null, appName: string): boolean;
    /**
     * Check if user has required role
     */
    static hasRequiredRole(user: User | null, requiredRole: string): boolean;
    /**
     * Get redirect URL based on user role and app access
     */
    static getRedirectUrl(user: User | null): string;
}
/**
 * Authentication state management utilities
 */
export declare class AuthState {
    /**
     * Create authentication context value
     */
    static createAuthContext(user: User | null, isLoading?: boolean): {
        user: User | null;
        isLoading: boolean;
        isAuthenticated: boolean;
        hasAppAccess: (appName: string) => boolean;
        hasRole: (role: string) => boolean;
        getRedirectUrl: () => string;
    };
}
/**
 * Server-side authentication utilities
 */
export declare class ServerAuth {
    /**
     * Verify token on server side (for middleware)
     */
    static verifyServerToken(token: string, apiUrl: string): Promise<User | null>;
    /**
     * Extract token from request headers/cookies
     */
    static extractTokenFromRequest(req: any): string | null;
}
export declare const authApi: AuthApiClient;
export { TokenManager as Token, AuthApiClient as AuthAPI, RouteGuard as Guard, AuthState as State, ServerAuth as Server, };
//# sourceMappingURL=index.d.ts.map