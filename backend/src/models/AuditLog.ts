/**
 * AuditLog model for MongoDB
 * Handles logging of user actions and system events for security and monitoring
 */

import mongoose, { Document, Schema } from "mongoose";

export type LogLevel = "info" | "warn" | "error" | "debug";
export type ActionType =
  | "login"
  | "logout"
  | "register"
  | "password_change"
  | "profile_update"
  | "user_create"
  | "user_update"
  | "user_delete"
  | "app_access"
  | "permission_change"
  | "system_error"
  | "api_call";

export interface IAuditLog extends Document {
  userId?: mongoose.Types.ObjectId | string; // Allow both ObjectId and string
  action: ActionType;
  level: LogLevel;
  message: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  appName?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  duration?: number; // in milliseconds
  timestamp: Date;

  // Methods
  isError(): boolean;
  isUserAction(): boolean;
  getFormattedMessage(): string;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    userId: {
      type: Schema.Types.Mixed, // Allow both ObjectId and string
      ref: "User",
      index: true,
      validate: {
        validator: function (v: any) {
          if (!v) return true; // Allow null/undefined
          // Allow ObjectId or string
          return mongoose.Types.ObjectId.isValid(v) || typeof v === "string";
        },
        message: "userId must be a valid ObjectId or string",
      },
    },
    action: {
      type: String,
      enum: {
        values: [
          "login",
          "logout",
          "register",
          "password_change",
          "profile_update",
          "user_create",
          "user_update",
          "user_delete",
          "app_access",
          "permission_change",
          "system_error",
          "api_call",
          "auth_middleware",
        ],
        message: "Invalid action type",
      },
      required: [true, "Action is required"],
      index: true,
    },
    level: {
      type: String,
      enum: {
        values: ["info", "warn", "error", "debug"],
        message: "Level must be info, warn, error, or debug",
      },
      required: [true, "Log level is required"],
      default: "info",
      index: true,
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      maxlength: [1000, "Message cannot exceed 1000 characters"],
    },
    details: {
      type: Schema.Types.Mixed,
      validate: {
        validator: function (v: any) {
          // Ensure details is an object if provided
          return !v || (typeof v === "object" && !Array.isArray(v));
        },
        message: "Details must be an object",
      },
    },
    ipAddress: {
      type: String,
      validate: {
        validator: function (v: string) {
          if (!v) return true; // Allow empty/null values

          // IPv4 validation
          const ipv4Regex =
            /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

          // IPv6 validation (including shorthand notation like ::1, ::ffff:192.0.2.1, etc.)
          const ipv6Regex =
            /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;

          return ipv4Regex.test(v) || ipv6Regex.test(v);
        },
        message: "Invalid IP address format",
      },
    },
    userAgent: {
      type: String,
      maxlength: [500, "User agent cannot exceed 500 characters"],
    },
    appName: {
      type: String,
      enum: {
        values: ["app1", "app2", "admin-dashboard", "api"],
        message: "Invalid app name",
      },
    },
    endpoint: {
      type: String,
      maxlength: [200, "Endpoint cannot exceed 200 characters"],
    },
    method: {
      type: String,
      enum: {
        values: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
        message: "Invalid HTTP method",
      },
    },
    statusCode: {
      type: Number,
      min: [100, "Status code must be at least 100"],
      max: [599, "Status code cannot exceed 599"],
    },
    duration: {
      type: Number,
      min: [0, "Duration cannot be negative"],
    },
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: false, // We use custom timestamp field
    toJSON: {
      transform: function (_doc, ret) {
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

// Indexes for better query performance
auditLogSchema.index({ timestamp: -1 }); // Most recent first
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ level: 1, timestamp: -1 });
auditLogSchema.index({ appName: 1, timestamp: -1 });
auditLogSchema.index({ statusCode: 1, timestamp: -1 });

// Compound indexes for common queries
auditLogSchema.index({ userId: 1, action: 1, timestamp: -1 });
auditLogSchema.index({ level: 1, action: 1, timestamp: -1 });

// TTL index to automatically delete old logs (keep for 90 days)
auditLogSchema.index(
  { timestamp: 1 },
  { expireAfterSeconds: 90 * 24 * 60 * 60 }
);

// Instance method to check if log is an error
auditLogSchema.methods.isError = function (): boolean {
  return this.level === "error" || (this.statusCode && this.statusCode >= 400);
};

// Instance method to check if log is a user action
auditLogSchema.methods.isUserAction = function (): boolean {
  const userActions: ActionType[] = [
    "login",
    "logout",
    "register",
    "password_change",
    "profile_update",
    "app_access",
  ];
  return userActions.includes(this.action);
};

// Instance method to get formatted message
auditLogSchema.methods.getFormattedMessage = function (): string {
  const timestamp = this.timestamp.toISOString();
  const level = this.level.toUpperCase();
  const action = this.action.toUpperCase();

  let formatted = `[${timestamp}] ${level} - ${action}: ${this.message}`;

  if (this.userId) {
    formatted += ` (User: ${this.userId})`;
  }

  if (this.ipAddress) {
    formatted += ` (IP: ${this.ipAddress})`;
  }

  return formatted;
};

// Static method to log user action
auditLogSchema.statics.logUserAction = function (
  userId: mongoose.Types.ObjectId | string,
  action: ActionType,
  message: string,
  details?: Record<string, any>,
  ipAddress?: string,
  userAgent?: string
) {
  return this.create({
    userId,
    action,
    level: "info",
    message,
    details,
    ipAddress,
    userAgent,
    timestamp: new Date(),
  });
};

// Static method to log API call
auditLogSchema.statics.logApiCall = function (
  userId: mongoose.Types.ObjectId | string | undefined,
  endpoint: string,
  method: string,
  statusCode: number,
  duration: number,
  ipAddress?: string,
  userAgent?: string,
  appName?: string
) {
  const level: LogLevel = statusCode >= 400 ? "error" : "info";
  const message = `${method} ${endpoint} - ${statusCode} (${duration}ms)`;

  return this.create({
    userId,
    action: "api_call",
    level,
    message,
    details: { endpoint, method, statusCode, duration },
    ipAddress,
    userAgent,
    appName,
    endpoint,
    method,
    statusCode,
    duration,
    timestamp: new Date(),
  });
};

// Static method to log system error
auditLogSchema.statics.logSystemError = function (
  error: Error,
  context?: Record<string, any>
) {
  return this.create({
    action: "system_error",
    level: "error",
    message: error.message,
    details: {
      stack: error.stack,
      name: error.name,
      ...context,
    },
    timestamp: new Date(),
  });
};

// Static method to get logs by user
auditLogSchema.statics.findByUser = function (
  userId: mongoose.Types.ObjectId | string,
  limit: number = 50,
  skip: number = 0
) {
  return this.find({ userId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .skip(skip)
    .populate("userId", "email firstName lastName");
};

// Static method to get logs by action
auditLogSchema.statics.findByAction = function (
  action: ActionType,
  limit: number = 50,
  skip: number = 0
) {
  return this.find({ action })
    .sort({ timestamp: -1 })
    .limit(limit)
    .skip(skip)
    .populate("userId", "email firstName lastName");
};

// Static method to get error logs
auditLogSchema.statics.findErrors = function (
  limit: number = 50,
  skip: number = 0
) {
  return this.find({ level: "error" })
    .sort({ timestamp: -1 })
    .limit(limit)
    .skip(skip)
    .populate("userId", "email firstName lastName");
};

// Static method to get recent logs
auditLogSchema.statics.findRecent = function (
  hours: number = 24,
  limit: number = 100
) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  return this.find({ timestamp: { $gte: since } })
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate("userId", "email firstName lastName");
};

export const AuditLog = mongoose.model<IAuditLog>("AuditLog", auditLogSchema);
