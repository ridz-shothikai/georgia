/**
 * User model for MongoDB
 * Handles user data structure and validation
 */

import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

// Define types locally for now (will be moved to shared package later)
export type UserRole = "superadmin" | "user";
export type AppName = "region14" | "region2" | "dashboard";

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  role: UserRole;
  assignedApps: AppName[];
  firstName?: string;
  lastName?: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  status: "active" | "inactive";

  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  getFullName(): string;
  hasAppAccess(appName: AppName): boolean;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please provide a valid email address",
      ],
    },
    passwordHash: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    role: {
      type: String,
      enum: {
        values: [
          "user",
          "gadhs-it-staff",
          "director",
          "manager",
          "clerk",
          "admin",
          "superadmin",
        ],
        message: "Role must be either superadmin or user",
      },
      required: [true, "Role is required"],
      default: "user",
    },
    assignedApps: [
      {
        type: String,
        enum: {
          values: ["region14", "region2", "dashboard"],
          message: "Invalid app name",
        },
      },
    ],
    firstName: {
      type: String,
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    lastLogin: {
      type: Date,
    },
    status: {
      type: String,
      enum: {
        values: ["active", "inactive"],
        message: "Status must be either active or inactive",
      },
      default: "active",
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (_doc, ret) {
        delete (ret as any).passwordHash;
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

// Indexes for better performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ createdAt: 1 });
userSchema.index({ lastLogin: 1 });

// Pre-save middleware to hash password
userSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("passwordHash")) return next();

  try {
    // Hash password with cost of 12
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || "12");
    this.passwordHash = await bcrypt.hash(this.passwordHash, saltRounds);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Instance method to compare password
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Instance method to get full name
userSchema.methods.getFullName = function (): string {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  if (this.firstName) {
    return this.firstName;
  }
  if (this.lastName) {
    return this.lastName;
  }
  return this.email.split("@")[0]; // Fallback to email username
};

// Instance method to check app access
userSchema.methods.hasAppAccess = function (appName: AppName): boolean {
  // Superadmin has access to all apps
  if (this.role === "superadmin") {
    return true;
  }

  // Regular users only have access to assigned apps
  return this.assignedApps.includes(appName);
};

// Static method to find active users
userSchema.statics.findActive = function () {
  return this.find({ status: "active" });
};

// Static method to find users by role
userSchema.statics.findByRole = function (role: UserRole) {
  return this.find({ role, status: "active" });
};

// Static method to find users with app access
userSchema.statics.findWithAppAccess = function (appName: AppName) {
  return this.find({
    $or: [{ role: "superadmin" }, { assignedApps: appName }],
    status: "active",
  });
};

// Virtual for user's display name
userSchema.virtual("displayName").get(function () {
  return this.getFullName();
});

// Ensure virtual fields are serialized
userSchema.set("toJSON", { virtuals: true });

export const User = mongoose.model<IUser>("User", userSchema);
