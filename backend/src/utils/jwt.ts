/**
 * JWT utility functions
 * Handles token generation, verification, and management
 */

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Request } from 'express';
import { logger } from './logger';

// JWT Configuration interface
interface JWTConfig {
  accessSecret: string;
  refreshSecret: string;
  accessTokenExpiry: number; // in seconds
  refreshTokenExpiry: number; // in seconds
}

// JWT Payload interface
interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  appAccess: string[];
  sessionId?: string;
  iat?: number;
  exp?: number;
}

// Token pair interface
interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Get JWT configuration from environment variables
 */
const getJWTConfig = (): JWTConfig => {
  const accessSecret = process.env.JWT_ACCESS_SECRET;
  const refreshSecret = process.env.JWT_REFRESH_SECRET;

  if (!accessSecret || !refreshSecret) {
    throw new Error('JWT secrets must be defined in environment variables');
  }

  return {
    accessSecret,
    refreshSecret,
    accessTokenExpiry: 15 * 60, // 15 minutes in seconds
    refreshTokenExpiry: 7 * 24 * 60 * 60, // 7 days in seconds
  };
};

/**
 * Generate a secure random token
 */
export const generateSecureToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Calculate expiration date from seconds
 */
export const getExpirationDate = (seconds: number): Date => {
  return new Date(Date.now() + seconds * 1000);
};

/**
 * Generate access token
 */
export const generateAccessToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  const config = getJWTConfig();
  
  return jwt.sign(payload, config.accessSecret, {
    expiresIn: config.accessTokenExpiry,
    issuer: 'unified-platform',
    audience: 'platform-users'
  });
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  const config = getJWTConfig();
  
  return jwt.sign(payload, config.refreshSecret, {
    expiresIn: config.refreshTokenExpiry,
    issuer: 'unified-platform',
    audience: 'platform-users'
  });
};

/**
 * Generate both access and refresh tokens
 */
export const generateTokenPair = (payload: Omit<JWTPayload, 'iat' | 'exp'>): TokenPair => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload)
  };
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token: string): JWTPayload | null => {
  try {
    const config = getJWTConfig();
    const decoded = jwt.verify(token, config.accessSecret, {
      issuer: 'unified-platform',
      audience: 'platform-users'
    }) as JWTPayload;
    
    return decoded;
  } catch (error) {
    logger.warn('Access token verification failed:', error);
    return null;
  }
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): JWTPayload | null => {
  try {
    const config = getJWTConfig();
    const decoded = jwt.verify(token, config.refreshSecret, {
      issuer: 'unified-platform',
      audience: 'platform-users'
    }) as JWTPayload;
    
    return decoded;
  } catch (error) {
    logger.warn('Refresh token verification failed:', error);
    return null;
  }
};

/**
 * Extract token from Authorization header
 */
export const extractTokenFromHeader = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const bearerMatch = authHeader.match(/^Bearer\s+(.+)$/);
  if (!bearerMatch || !bearerMatch[1]) {
    return null;
  }

  return bearerMatch[1];
};

/**
 * Extract token from cookies
 */
export const extractTokenFromCookies = (req: Request): string | null => {
  return req.cookies?.auth_token || null;
};

/**
 * Extract token from request (header or cookies)
 */
export const extractToken = (req: Request): string | null => {
  return extractTokenFromHeader(req) || extractTokenFromCookies(req);
};

/**
 * Check if user has access to specific app
 */
export const hasAppAccess = (userApps: string[], requiredApp: string): boolean => {
  return userApps.includes(requiredApp) || userApps.includes('*');
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (payload: JWTPayload): boolean => {
  if (!payload.exp) {
    return true;
  }
  
  return Date.now() >= payload.exp * 1000;
};