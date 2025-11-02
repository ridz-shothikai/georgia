/**
 * Shared types for the Unified Multi-App Platform
 */

// User roles in the system
export type UserRole = 'superadmin' | 'user';

// Available apps in the platform
export type AppName = 'app1' | 'app2' | 'admin-dashboard';

// User status
export type UserStatus = 'active' | 'inactive';

// User interface
export interface User {
  _id: string;
  email: string;
  role: UserRole;
  assignedApps: AppName[];
  createdAt: Date;
  status: UserStatus;
}

// JWT token payload
export interface JWTPayload {
  userId: string;
  role: UserRole;
  appAccess: AppName[];
  exp: number;
  iat: number;
}

// Login request/response types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    user: Omit<User, 'passwordHash'>;
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  };
  error?: string;
}

// API response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// User creation request (admin only)
export interface CreateUserRequest {
  email: string;
  password: string;
  role: UserRole;
  assignedApps: AppName[];
}

// User update request
export interface UpdateUserRequest {
  email?: string;
  role?: UserRole;
  assignedApps?: AppName[];
  status?: UserStatus;
}

// Session interface
export interface Session {
  _id: string;
  userId: string;
  jwtToken: string;
  createdAt: Date;
  expiresAt: Date;
}

// Audit log interface
export interface AuditLog {
  _id: string;
  userId: string;
  action: string;
  timestamp: Date;
  details?: Record<string, any>;
}

// App metadata
export interface AppMetadata {
  name: AppName;
  displayName: string;
  description: string;
  url: string;
  port: number;
  requiredRole?: UserRole;
}

// Error types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: ValidationError[];
}

// Auth context type for frontend
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  verifyToken: () => Promise<boolean>;
}

// Route protection types
export interface RouteGuardProps {
  children: any; // ReactNode equivalent for shared package
  requiredApp?: AppName;
  requiredRole?: UserRole;
  fallbackUrl?: string;
}

// API client configuration
export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  withCredentials?: boolean;
}