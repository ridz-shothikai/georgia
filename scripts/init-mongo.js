// MongoDB initialization script for Unified Multi-App Platform
// This script runs when the MongoDB container starts for the first time

// Switch to the unified-platform database
db = db.getSiblingDB("unified-platform");

// Create collections with validation
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "email",
        "passwordHash",
        "role",
        "assignedApps",
        "createdAt",
        "status",
      ],
      properties: {
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$",
          description: "must be a valid email address",
        },
        passwordHash: {
          bsonType: "string",
          description: "must be a string and is required",
        },
        role: {
          bsonType: "string",
          enum: ["superadmin", "user"],
          description: "must be either superadmin or user",
        },
        assignedApps: {
          bsonType: "array",
          items: {
            bsonType: "string",
            enum: ["region14", "region2", "dashboard"],
          },
          description: "must be an array of valid app names",
        },
        createdAt: {
          bsonType: "date",
          description: "must be a date",
        },
        status: {
          bsonType: "string",
          enum: ["active", "inactive"],
          description: "must be either active or inactive",
        },
      },
    },
  },
});

db.createCollection("sessions", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "jwtToken", "createdAt", "expiresAt"],
      properties: {
        userId: {
          bsonType: "objectId",
          description: "must be a valid ObjectId",
        },
        jwtToken: {
          bsonType: "string",
          description: "must be a string",
        },
        createdAt: {
          bsonType: "date",
          description: "must be a date",
        },
        expiresAt: {
          bsonType: "date",
          description: "must be a date",
        },
      },
    },
  },
});

db.createCollection("logs", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "action", "timestamp"],
      properties: {
        userId: {
          bsonType: "objectId",
          description: "must be a valid ObjectId",
        },
        action: {
          bsonType: "string",
          description: "must be a string describing the action",
        },
        timestamp: {
          bsonType: "date",
          description: "must be a date",
        },
        details: {
          bsonType: "object",
          description: "optional object with additional details",
        },
      },
    },
  },
});

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ status: 1 });
db.users.createIndex({ createdAt: 1 });

db.sessions.createIndex({ userId: 1 });
db.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
db.sessions.createIndex({ createdAt: 1 });

db.logs.createIndex({ userId: 1 });
db.logs.createIndex({ timestamp: 1 });
db.logs.createIndex({ action: 1 });

// Create initial superadmin user
// Note: In production, this should be done securely with proper password hashing
const bcrypt = require("bcryptjs");
const adminEmail = "admin@platform.com";
const adminPassword = "admin123"; // Change this in production!

// Check if admin user already exists
const existingAdmin = db.users.findOne({ email: adminEmail });
console.log("🚀 ~ existingAdmin:", existingAdmin);

if (!existingAdmin) {
  // In a real scenario, you'd hash the password properly
  // For now, we'll insert a placeholder that the backend will handle
  db.users.insertOne({
    email: adminEmail,
    passwordHash: "$2a$12$placeholder.hash.will.be.replaced.by.backend",
    role: "superadmin",
    assignedApps: ["region14", "region2", "dashboard"],
    createdAt: new Date(),
    status: "active",
  });

  print("✅ Initial superadmin user created: " + adminEmail);
  print("⚠️  Default password: admin123 - CHANGE THIS IN PRODUCTION!");
} else {
  print("ℹ️  Superadmin user already exists");
}

// Create sample regular users for testing
const sampleUsers = [
  {
    email: "user1@platform.com",
    passwordHash: "$2a$12$placeholder.hash.will.be.replaced.by.backend",
    role: "user",
    assignedApps: ["region14"],
    createdAt: new Date(),
    status: "active",
  },
  {
    email: "user2@platform.com",
    passwordHash: "$2a$12$placeholder.hash.will.be.replaced.by.backend",
    role: "user",
    assignedApps: ["region2"],
    createdAt: new Date(),
    status: "active",
  },
  {
    email: "user3@platform.com",
    passwordHash: "$2a$12$placeholder.hash.will.be.replaced.by.backend",
    role: "user",
    assignedApps: ["region14", "region2"],
    createdAt: new Date(),
    status: "active",
  },
];

sampleUsers.forEach((user) => {
  const existing = db.users.findOne({ email: user.email });
  if (!existing) {
    db.users.insertOne(user);
    print("✅ Sample user created: " + user.email);
  }
});

print("🎉 MongoDB initialization completed successfully!");
print("📊 Database: unified-platform");
print("📋 Collections: users, sessions, logs");
print("🔍 Indexes created for optimal performance");
print("👤 Sample users ready for testing");
