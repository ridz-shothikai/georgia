/**
 * Authentication middleware
 * Handles JWT token verification and user authentication
 */

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Session, AuditLog } from "../models";
import { logger } from "../utils/logger";

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
        appAccess: string[];
        sessionId: string;
      };
    }
  }
}

/**
 * Get JWT configuration
 */
const getJWTConfig = () => {
  return {
    accessSecret: process.env.JWT_ACCESS_SECRET || "default-access-secret",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "default-refresh-secret",
  };
};

/**
 * Extract token from request headers or cookies
 */
const extractToken = (req: Request): string | null => {
  // Check Authorization header
  const authHeader = req.headers.authorization;
  console.log("🚀 ~ extractToken ~ authHeader:", authHeader);
  // if (authHeader && authHeader.startsWith("Bearer ")) {
  //   return authHeader.substring(7);
  // }

  console.log("🚀 ~ extractToken ~ req.cookies:", req.cookies);

  // Check cookies
  if (req.cookies && req.cookies.auth_token) {
    return req.cookies.auth_token;
  }

  return null;
};

/**
 * Authentication middleware
 * Verifies JWT token and sets user in request
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req);
    console.log("🚀 ~ authMiddleware ~ token:", token);

    console.log("TOken::", token);

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Access token required",
      });
      return;
    }

    // const config = getJWTConfig();

    // Verify JWT token
    const decoded = jwt.decode(token) as any;

    // log decoded
    console.log("Decoded::", decoded);

    // Check if session is still active
    // const session = await Session.findById(decoded.sessionId).populate('userId');

    // console.log(session)

    // if (!session || !session.userId) {
    //   res.status(401).json({
    //     success: false,
    //     message: 'Invalid or expired session'
    //   });
    //   return;
    // }

    // Set user in request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      appAccess: decoded.appAccess || [],
      sessionId: decoded.sessionId,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: "Token expired",
      });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: "Invalid token",
      });
      return;
    }

    logger.error("Auth middleware error:", error);

    // Log authentication error
    await AuditLog.create({
      action: "auth_middleware",
      level: "error",
      message: "Authentication middleware error",
      details: {
        error: (error as Error).message,
        path: req.path,
        method: req.method,
      },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: req.path,
      method: req.method,
    });

    res.status(500).json({
      success: false,
      message: "Authentication error",
    });
  }
};

/**
 * Optional authentication middleware
 * Sets user in request if token is valid, but doesn't require authentication
 */
export const optionalAuthMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req);

    if (!token) {
      next();
      return;
    }

    const config = getJWTConfig();

    // Verify JWT token
    const decoded = jwt.verify(token, config.accessSecret) as any;

    // Check if session is still active
    const session = await Session.findOne({
      token,
      isActive: true,
      expiresAt: { $gt: new Date() },
    });

    if (session) {
      // Set user in request
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        appAccess: decoded.appAccess || [],
        sessionId: decoded.sessionId,
      };
    }

    next();
  } catch (error) {
    // For optional auth, we don't fail on token errors
    logger.warn("Optional auth middleware warning:", error);
    next();
  }
};

/**
 * Permission middleware factory
 * Creates middleware to check user permissions
 */
export const permissionMiddleware = (
  requiredRoles: string[] = [],
  requiredApps: string[] = []
) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      // Check role permissions
      if (requiredRoles.length > 0) {
        const hasRequiredRole =
          requiredRoles.includes(req.user.role) ||
          req.user.role === "superadmin";

        if (!hasRequiredRole) {
          // Log permission denied
          await AuditLog.create({
            userId: req.user.userId,
            action: "permission_denied",
            level: "warn",
            message: `Access denied - insufficient role permissions`,
            details: {
              userRole: req.user.role,
              requiredRoles,
              path: req.path,
              method: req.method,
            },
            ipAddress: req.ip,
            userAgent: req.get("User-Agent"),
            endpoint: req.path,
            method: req.method,
          });

          res.status(403).json({
            success: false,
            message: "Insufficient permissions",
          });
          return;
        }
      }

      // Check app access permissions
      if (requiredApps.length > 0 && req.user.role !== "superadmin") {
        const hasAppAccess = requiredApps.some((app) =>
          req.user!.appAccess.includes(app)
        );

        if (!hasAppAccess) {
          // Log permission denied
          await AuditLog.create({
            userId: req.user.userId,
            action: "permission_denied",
            level: "warn",
            message: `Access denied - insufficient app permissions`,
            details: {
              userApps: req.user.appAccess,
              requiredApps,
              path: req.path,
              method: req.method,
            },
            ipAddress: req.ip,
            userAgent: req.get("User-Agent"),
            endpoint: req.path,
            method: req.method,
          });

          res.status(403).json({
            success: false,
            message: "App access denied",
          });
          return;
        }
      }

      next();
    } catch (error) {
      logger.error("Permission middleware error:", error);

      // Log permission error
      await AuditLog.create({
        userId: req.user?.userId,
        action: "permission_middleware",
        level: "error",
        message: "Permission middleware error",
        details: {
          error: (error as Error).message,
          path: req.path,
          method: req.method,
        },
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        endpoint: req.path,
        method: req.method,
      });

      res.status(500).json({
        success: false,
        message: "Permission check error",
      });
    }
  };
};

/**
 * Admin only middleware
 * Shorthand for requiring superadmin role
 */
export const adminOnlyMiddleware = permissionMiddleware(["superadmin"]);

/**
 * User or admin middleware
 * Allows both user and superadmin roles
 */
export const userOrAdminMiddleware = permissionMiddleware([
  "user",
  "superadmin",
]);

/**
 * App access middleware factory
 * Creates middleware to check specific app access
 */
export const appAccessMiddleware = (appName: string) => {
  return permissionMiddleware([], [appName]);
};
