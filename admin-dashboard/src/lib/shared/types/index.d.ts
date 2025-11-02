/**
 * Shared types for the Unified Multi-App Platform
 */
export type UserRole = 'superadmin' | 'user';
export type AppName = 'app1' | 'app2' | 'admin-dashboard';
export type UserStatus = 'active' | 'inactive';
export interface User { 
    _id: string;
    email: string;
    role: UserRole;
    assignedApps: AppName[];
    createdAt: Date;
    status: UserStatus;
}
export interface JWTPayload {
    userId: string;
    role: UserRole;
    appAccess: AppName[];
    exp: number;
    iat: number;
}
export interface LoginRequest {
    email: string;
    password: string;
}
export interface LoginResponse {
    success: boolean;
    message: string;
    user?: Omit<User, 'passwordHash'>;
    tokens?: {
        accessToken: string;
        refreshToken: string;
        expiresAt: Date;
    };
    data?: {
        user: Omit<User, 'passwordHash'>;
        redirectUrl: string;
    };
}
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}
export interface CreateUserRequest {
    email: string;
    password: string;
    role: UserRole;
    assignedApps: AppName[];
}
export interface UpdateUserRequest {
    email?: string;
    role?: UserRole;
    assignedApps?: AppName[];
    status?: UserStatus;
}
export interface Session {
    _id: string;
    userId: string;
    jwtToken: string;
    createdAt: Date;
    expiresAt: Date;
}
export interface AuditLog {
    _id: string;
    userId: string;
    action: string;
    timestamp: Date;
    details?: Record<string, any>;
}
export interface AppMetadata {
    name: AppName;
    displayName: string;
    description: string;
    url: string;
    port: number;
    requiredRole?: UserRole;
}
export interface ValidationError {
    field: string;
    message: string;
}
export interface ApiError {
    code: string;
    message: string;
    details?: ValidationError[];
}
export interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<LoginResponse>;
    logout: () => Promise<void>;
    verifyToken: () => Promise<boolean>;
}
export interface RouteGuardProps {
    children: any;
    requiredApp?: AppName;
    requiredRole?: UserRole;
    fallbackUrl?: string;
}
export interface ApiClientConfig {
    baseURL: string;
    timeout?: number;
    withCredentials?: boolean;
}
//# sourceMappingURL=index.d.ts.map