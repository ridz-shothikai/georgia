/**
 * Authentication controller
 * Handles authentication-related HTTP requests
 */

import { Request, Response } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  verifyToken,
  refreshAccessToken,
  logoutAllSessions,
} from "../services/auth.service";
import { logger } from "../utils/logger";
import { AuditLog } from "../models";

/**
 * Login endpoint
 * POST /api/auth/login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
      return;
    }

    // Get client info
    const ipAddress = req.ip;
    const userAgent = req.get("User-Agent");

    // Attempt login
    const result = await loginUser({ email, password }, ipAddress, userAgent);

    console.log(result);

    if (result.success && result.tokens) {
      // Set HTTP-only cookies
      res.cookie("auth_token", result.tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.cookie("refresh_token", result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Log API call
      await AuditLog.create({
        userId: result.user?.id,
        action: "login",
        level: "info",
        message: "Login API call successful",
        details: { endpoint: "/api/auth/login" },
        ipAddress,
        userAgent,
        endpoint: "/api/auth/login",
        method: "POST",
        statusCode: 200,
      });

      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          user: result.user,
          tokens: {
            accessToken: result.tokens.accessToken,
            refreshToken: result.tokens.refreshToken,
          },
        },
      });
    } else {
      // Log failed login attempt
      await AuditLog.create({
        action: "login",
        level: "warn",
        message: "Login API call failed",
        details: {
          endpoint: "/api/auth/login",
          reason: result.message,
          email,
        },
        ipAddress,
        userAgent,
        endpoint: "/api/auth/login",
        method: "POST",
        statusCode: 401,
      });

      res.status(401).json({
        success: false,
        message: result.message,
      });
    }
  } catch (error) {
    console.log(error);
    logger.error("Login controller error:", error);

    // Log API error
    await AuditLog.create({
      action: "login",
      level: "error",
      message: "Login API error",
      details: {
        error: (error as Error).message,
        endpoint: "/api/auth/login",
      },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: "/api/auth/login",
      method: "POST",
      statusCode: 500,
    });

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Logout endpoint
 * POST /api/auth/logout
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get token from cookies or headers
    const token =
      req.cookies?.auth_token ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.substring(7)
        : null);

    if (!token) {
      res.status(400).json({
        success: false,
        message: "No active session found",
      });
      return;
    }

    // Get client info
    const ipAddress = req.ip;
    const userAgent = req.get("User-Agent");

    // Attempt logout
    const result = await logoutUser(token, ipAddress, userAgent);

    // Clear cookies
    res.clearCookie("auth_token");
    res.clearCookie("refresh_token");

    // Log API call
    await AuditLog.create({
      userId: req.user?.userId,
      action: "logout",
      level: "info",
      message: "Logout API call",
      details: {
        endpoint: "/api/auth/logout",
        success: result.success,
      },
      ipAddress,
      userAgent,
      endpoint: "/api/auth/logout",
      method: "POST",
      statusCode: result.success ? 200 : 400,
    });

    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    logger.error("Logout controller error:", error);

    // Log API error
    await AuditLog.create({
      userId: req.user?.userId,
      action: "logout",
      level: "error",
      message: "Logout API error",
      details: {
        error: (error as Error).message,
        endpoint: "/api/auth/logout",
      },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: "/api/auth/logout",
      method: "POST",
      statusCode: 500,
    });

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Register endpoint
 * POST /api/auth/register
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, role, assignedApps } =
      req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
      return;
    }

    // Get client info
    const ipAddress = req.ip;
    const userAgent = req.get("User-Agent");

    // Attempt registration
    const result = await registerUser(
      {
        email,
        password,
        firstName,
        lastName,
        role,
        assignedApps,
      },
      ipAddress,
      userAgent
    );

    if (result.success && result.tokens) {
      // Set HTTP-only cookies
      res.cookie("auth_token", result.tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.cookie("refresh_token", result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Log API call
      await AuditLog.create({
        userId: result.user?.id,
        action: "register",
        level: "info",
        message: "Registration API call successful",
        details: {
          endpoint: "/api/auth/register",
          role: result.user?.role,
        },
        ipAddress,
        userAgent,
        endpoint: "/api/auth/register",
        method: "POST",
        statusCode: 201,
      });

      res.status(201).json({
        success: true,
        message: result.message,
        user: result.user,
      });
    } else {
      // Log failed registration
      await AuditLog.create({
        action: "register",
        level: "warn",
        message: "Registration API call failed",
        details: {
          endpoint: "/api/auth/register",
          reason: result.message,
          email,
        },
        ipAddress,
        userAgent,
        endpoint: "/api/auth/register",
        method: "POST",
        statusCode: 400,
      });

      res.status(400).json({
        success: false,
        message: result.message,
      });
    }
  } catch (error) {
    logger.error("Register controller error:", error);

    // Log API error
    await AuditLog.create({
      action: "register",
      level: "error",
      message: "Registration API error",
      details: {
        error: (error as Error).message,
        endpoint: "/api/auth/register",
      },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: "/api/auth/register",
      method: "POST",
      statusCode: 500,
    });

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Verify token endpoint
 * GET /auth/verify
 */
export const verify = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get token from cookies or headers
    const token =
      req.cookies?.auth_token ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.substring(7)
        : null);

    if (!token) {
      res.status(401).json({
        success: false,
        message: "No token provided",
      });
      return;
    }

    // Verify token
    const result = await verifyToken(token);

    console.log("Topken", result);

    // Log API call
    await AuditLog.create({
      userId: result.valid ? result.payload?.userId : undefined,
      action: "api_call",
      level: result.valid ? "info" : "warn",
      message: `Token verification ${result.valid ? "successful" : "failed"}`,
      details: {
        endpoint: "/auth/verify",
        valid: result.valid,
        error: result.error,
      },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: "/auth/verify",
      method: "GET",
      statusCode: result.valid ? 200 : 401,
    });

    if (result.valid) {
      res.status(200).json({
        success: true,
        message: "Token is valid",
        data: {
          user: {
            id: result.payload?.userId,
            email: result.payload?.email,
            role: result.payload?.role,
            appAccess: result.payload?.appAccess,
          },
        },
      });
    } else {
      res.status(401).json({
        success: false,
        message: result.error || "Token verification failed",
      });
    }
  } catch (error) {
    logger.error("Verify controller error:", error);

    // Log API error
    await AuditLog.create({
      action: "api_call",
      level: "error",
      message: "Token verification API error",
      details: {
        error: (error as Error).message,
        endpoint: "/auth/verify",
      },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: "/auth/verify",
      method: "GET",
      statusCode: 500,
    });

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Refresh token endpoint
 * POST /api/auth/refresh
 */
export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get refresh token from cookies
    const refreshToken = req.cookies?.refresh_token;

    if (!refreshToken) {
      res.status(401).json({
        success: false,
        message: "No refresh token provided",
      });
      return;
    }

    // Get client info
    const ipAddress = req.ip;
    const userAgent = req.get("User-Agent");

    // Attempt token refresh
    const result = await refreshAccessToken(refreshToken, ipAddress, userAgent);

    if (result.success && result.tokens) {
      // Set new HTTP-only cookies
      res.cookie("auth_token", result.tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.cookie("refresh_token", result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Log API call
      await AuditLog.create({
        userId: result.user?.id,
        action: "refresh_token",
        level: "info",
        message: "Token refresh API call successful",
        details: { endpoint: "/auth/refresh" },
        ipAddress,
        userAgent,
        endpoint: "/auth/refresh",
        method: "POST",
        statusCode: 200,
      });

      res.status(200).json({
        success: true,
        message: result.message,
        user: result.user,
      });
    } else {
      // Log failed refresh
      await AuditLog.create({
        action: "refresh_token",
        level: "warn",
        message: "Token refresh API call failed",
        details: {
          endpoint: "/api/auth/refresh",
          reason: result.message,
        },
        ipAddress,
        userAgent,
        endpoint: "/api/auth/refresh",
        method: "POST",
        statusCode: 401,
      });

      res.status(401).json({
        success: false,
        message: result.message,
      });
    }
  } catch (error) {
    logger.error("Refresh controller error:", error);

    // Log API error
    await AuditLog.create({
      action: "refresh_token",
      level: "error",
      message: "Token refresh API error",
      details: {
        error: (error as Error).message,
        endpoint: "/api/auth/refresh",
      },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: "/api/auth/refresh",
      method: "POST",
      statusCode: 500,
    });

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Logout all sessions endpoint
 * POST /api/auth/logout-all
 */
export const logoutAll = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    // Get client info
    const ipAddress = req.ip;
    const userAgent = req.get("User-Agent");

    // Logout all sessions
    const result = await logoutAllSessions(
      req.user.userId,
      ipAddress,
      userAgent
    );

    // Clear cookies
    res.clearCookie("auth_token");
    res.clearCookie("refresh_token");

    // Log API call
    await AuditLog.create({
      userId: req.user.userId,
      action: "logout_all",
      level: "info",
      message: "Logout all sessions API call",
      details: {
        endpoint: "/api/auth/logout-all",
        success: result.success,
      },
      ipAddress,
      userAgent,
      endpoint: "/api/auth/logout-all",
      method: "POST",
      statusCode: result.success ? 200 : 400,
    });

    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    logger.error("Logout all controller error:", error);

    // Log API error
    await AuditLog.create({
      userId: req.user?.userId,
      action: "logout_all",
      level: "error",
      message: "Logout all sessions API error",
      details: {
        error: (error as Error).message,
        endpoint: "/api/auth/logout-all",
      },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: "/api/auth/logout-all",
      method: "POST",
      statusCode: 500,
    });

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
