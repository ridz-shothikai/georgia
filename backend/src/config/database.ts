/**
 * Database configuration for MongoDB connection
 * Handles connection settings and environment variables
 */

export interface DatabaseConfig {
  mongoUri: string;
  mongoTestUri: string;
  options: {
    maxPoolSize: number;
    serverSelectionTimeoutMS: number;
    socketTimeoutMS: number;
    bufferMaxEntries: number;
  };
}

/**
 * Database configuration object
 */
export const config: DatabaseConfig = {
  mongoUri:
    process.env.MONGO_URI ||
    "mongodb://admin:password@mongodb:27017/unified-platform?authSource=admin",
  mongoTestUri:
    process.env.MONGO_TEST_URI ||
    "mongodb://admin:password@mongodb:27017/unified-platform?authSource=admin",
  options: {
    maxPoolSize: parseInt(process.env.MONGO_MAX_POOL_SIZE || "10"),
    serverSelectionTimeoutMS: parseInt(
      process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS || "5000"
    ),
    socketTimeoutMS: parseInt(process.env.MONGO_SOCKET_TIMEOUT_MS || "45000"),
    bufferMaxEntries: 0, // Disable mongoose buffering
  },
};

/**
 * Get the appropriate MongoDB URI based on environment
 */
export const getMongoUri = (): string => {
  const env = process.env.NODE_ENV || "development";

  if (env === "test") {
    return config.mongoTestUri;
  }

  return config.mongoUri;
};

/**
 * Validate database configuration
 */
export const validateDatabaseConfig = (): void => {
  if (!config.mongoUri) {
    throw new Error("MONGO_URI environment variable is required");
  }

  // Basic URI validation
  if (
    !config.mongoUri.startsWith("mongodb://") &&
    !config.mongoUri.startsWith("mongodb+srv://")
  ) {
    throw new Error("Invalid MongoDB URI format");
  }
};
