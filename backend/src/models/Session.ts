/**
 * Session model for MongoDB
 * Handles user session management and JWT token tracking
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  refreshToken: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
  refreshExpiresAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  isExpired(): boolean;
  isRefreshExpired(): boolean;
  deactivate(): void;
}

const sessionSchema = new Schema<ISession>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  token: {
    type: String,
    unique: true,
    index: true
  },
  refreshToken: {
    type: String,

    unique: true,
    index: true
  },
  userAgent: {
    type: String,
   
  },
  ipAddress: {
    type: String,
  },
  expiresAt: {
    type: Date,
 
    index: { expireAfterSeconds: 0 } // MongoDB TTL index
  },
  refreshExpiresAt: {
    type: Date,
    index: { expireAfterSeconds: 0 } // MongoDB TTL index
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(_doc, ret) {
      delete (ret as any).token;
      delete (ret as any).refreshToken;
      delete (ret as any).__v;
      return ret;
    }
  }
});

// Compound indexes for better query performance
sessionSchema.index({ userId: 1, isActive: 1 });
sessionSchema.index({ token: 1, isActive: 1 });
sessionSchema.index({ refreshToken: 1, isActive: 1 });
sessionSchema.index({ expiresAt: 1, isActive: 1 });
sessionSchema.index({ createdAt: 1 });

// Instance method to check if token is expired
sessionSchema.methods.isExpired = function(): boolean {
  console.log("🚀 ~ new Date() > this.expiresAt:", new Date() > this.expiresAt)
  return new Date() > this.expiresAt;
};

// Instance method to check if refresh token is expired
sessionSchema.methods.isRefreshExpired = function(): boolean {
  console.log("🚀 ~ new Date() > this.refreshExpiresAt:", new Date() > this.refreshExpiresAt)
  return new Date() > this.refreshExpiresAt;
};

// Instance method to deactivate session
sessionSchema.methods.deactivate = function(): void {
  this.isActive = false;
};

// Static method to find active sessions for a user
sessionSchema.statics.findActiveByUserId = function(userId: mongoose.Types.ObjectId) {
  return this.find({
    userId,
    isActive: true,
    expiresAt: { $gt: new Date() }
  });
};

// Static method to find session by token
sessionSchema.statics.findByToken = function(token: string) {
  return this.findOne({
    token,
    isActive: true,
    expiresAt: { $gt: new Date() }
  }).populate('userId');
};

// Static method to find session by refresh token
sessionSchema.statics.findByRefreshToken = function(refreshToken: string) {
  return this.findOne({
    refreshToken,
    isActive: true,
    refreshExpiresAt: { $gt: new Date() }
  }).populate('userId');
};

// Static method to deactivate all sessions for a user
sessionSchema.statics.deactivateAllForUser = function(userId: mongoose.Types.ObjectId) {
  return this.updateMany(
    { userId, isActive: true },
    { isActive: false }
  );
};

// Static method to cleanup expired sessions
sessionSchema.statics.cleanupExpired = function() {
  const now = new Date();
  return this.deleteMany({
    $or: [
      { expiresAt: { $lt: now } },
      { refreshExpiresAt: { $lt: now } },
      { isActive: false }
    ]
  });
};

// Pre-save middleware to ensure expiration dates are valid
sessionSchema.pre('save', function(next) {
  // Ensure refresh token expires after regular token

  
  // Ensure tokens are not expired on creation
  const now = new Date();
  if (this.expiresAt <= now) {
    const error = new Error('Token cannot be expired on creation');
    return next(error);
  }
  
  next();
});

export const Session = mongoose.model<ISession>('Session', sessionSchema);