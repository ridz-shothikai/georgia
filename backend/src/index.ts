/**
 * Main Express server entry point for Unified Multi-App Platform
 * Handles server initialization, middleware setup, and route configuration
 */

// Load environment variables first
import dotenv from "dotenv";
import path from "path";
import bcrypt from "bcryptjs";

// Load .env file or fallback to .env.example
const envPath = path.resolve(__dirname, "../.env");
const envExamplePath = path.resolve(__dirname, "../.env.example");

try {
  console.log("Attempting to load .env file");
  dotenv.config({ path: envPath });
} catch (error) {
  // If .env doesn't exist, load .env.example
  dotenv.config({ path: envExamplePath });
  console.log("Loaded .env.example file");
}

console.log(process.env.SUPER_ADMIN_PASSWORD);

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { config } from "./config/database";
import { logger } from "./utils/logger";
import { errorHandler } from "./middlewares/errorHandler";

// Import routes
import authRoutes from "./routes/auth.route";
import userRoutes from "./routes/user.route";
import appRoutes from "./routes/app.route";
import adminRoutes from "./routes/admin.route";

const app = express();
const PORT = process.env.PORT || 5005;

// Trust the reverse proxy (like Nginx)
app.set("trust proxy", 1);
/**
 * Database connection
 */

const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(config.mongoUri);

    const db = mongoose.connection.db;

    // Disable validation temporarily (your existing logic)
    if (db) {
      const collections = await db.listCollections().toArray();

      for (const col of collections) {
        try {
          await db.command({
            collMod: col.name,
            validator: {},
            validationLevel: "off",
          });
          console.log(`🔓 Validation disabled for: ${col.name}`);
        } catch (err) {
          // `collMod` fails for system collections — ignore silently
        }
      }
    }

    // --- SUPER ADMIN SEED LOGIC (by EMAIL) ---
    const superAdminEmail =
      process.env.SUPER_ADMIN_EMAIL || "admin@platform.com";
    console.log("🚀 ~ connectDatabase ~ superAdminEmail:", superAdminEmail);
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || "admin123"; // Change in production!
    console.log(
      "🚀 ~ connectDatabase ~ superAdminPassword:",
      superAdminPassword
    );

    const hashedPassword = await bcrypt.hash(superAdminPassword, 12);
    const Users = mongoose.connection.collection("users");

    // ✅ Check by EMAIL (not role)
    const existingAdmin = await Users.findOne({ email: superAdminEmail });
    console.log("🚀 ~ connectDatabase ~ existingAdmin:", existingAdmin);

    if (!existingAdmin) {
      await Users.insertOne({
        email: superAdminEmail,
        passwordHash: hashedPassword,
        role: "superadmin",
        assignedApps: ["region14", "region2", "dashboard"],
        createdAt: new Date(),
        status: "active",
      });

      logger.info(`✅ Super Admin created: ${superAdminEmail}`);
      logger.info(
        `⚠️ Default password: ${superAdminPassword} (change in production)`
      );
    } else {
      logger.info(`ℹ️ Super Admin already exists: ${superAdminEmail}`);
    }

    logger.info("✅ MongoDB connected successfully");
  } catch (error) {
    logger.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
};

/**
 * Security middleware setup
 */
const setupSecurity = (): void => {
  // Helmet for security headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    })
  );

  // Rate limiting
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"), // limit each IP to 100 requests per windowMs
    message: {
      success: false,
      message: "Too many requests from this IP, please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use("/api/", limiter);

  // CORS configuration
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN?.split(",") || [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
      ],
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    })
  );
};

/**
 * General middleware setup
 */
const setupMiddleware = (): void => {
  // Body parsing
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Cookie parsing
  app.use(cookieParser(process.env.COOKIE_SECRET));

  // Request logging
  app.use((req, _res, next) => {
    logger.info(`${req.method} ${req.path} - ${req.ip}`);
    next();
  });
};

/**
 * Routes setup
 */
const setupRoutes = (): void => {
  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({
      success: true,
      message: "Unified Multi-App Platform API is running",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
    });
  });

  // API routes
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/apps", appRoutes);
  app.use("/api/admin", adminRoutes);

  // 404 handler for undefined routes
  app.use("*", (req, res) => {
    res.status(404).json({
      success: false,
      message: `Route ${req.originalUrl} not found`,
    });
  });
};

/**
 * Error handling setup
 */
const setupErrorHandling = (): void => {
  app.use(errorHandler);
};

/**
 * Server initialization
 */
const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDatabase();

    // Setup middleware and routes
    setupSecurity();
    setupMiddleware();
    setupRoutes();
    setupErrorHandling();

    // Start server
    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
      logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

/**
 * Graceful shutdown handling
 */
const setupGracefulShutdown = (): void => {
  process.on("SIGTERM", async () => {
    logger.info("🛑 SIGTERM received, shutting down gracefully");
    await mongoose.connection.close();
    process.exit(0);
  });

  process.on("SIGINT", async () => {
    logger.info("🛑 SIGINT received, shutting down gracefully");
    await mongoose.connection.close();
    process.exit(0);
  });
};

// Initialize server
if (require.main === module) {
  setupGracefulShutdown();
  startServer();
}

export default app;
