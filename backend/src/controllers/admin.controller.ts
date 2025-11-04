/**
 * Admin Controller
 * Handles administrative operations including user management, system monitoring, and platform administration
 */

import { Request, Response } from "express";
import { User } from "../models/User";
import { logger } from "../utils/logger";
import bcrypt from "bcrypt";

/**
 * Get system statistics and overview
 */
export const getSystemStats = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    logger.info("Fetching system statistics");

    // Get user statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: "active" });
    const inactiveUsers = await User.countDocuments({ status: "inactive" });
    const superAdmins = await User.countDocuments({ role: "superadmin" });

    // Get app assignment statistics
    const app1Users = await User.countDocuments({ assignedApps: "app1" });
    const app2Users = await User.countDocuments({ assignedApps: "app2" });

    // Recent user registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    const stats = {
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers,
        superAdmins: superAdmins,
        recentRegistrations: recentUsers,
      },
      apps: {
        totalApps: 3,
        app1Users: app1Users,
        app2Users: app2Users,
        adminDashboardUsers: superAdmins,
      },
      system: {
        uptime: process.uptime(),
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || "development",
        lastUpdated: new Date().toISOString(),
      },
    };

    res.json({
      success: true,
      message: "System statistics retrieved successfully",
      data: stats,
    });
  } catch (error) {
    logger.error("Error fetching system statistics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch system statistics",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get all users with pagination and filtering
 */
export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      role,
      status,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    logger.info(`Fetching users - Page: ${page}, Limit: ${limit}`);

    // Build filter query
    const filter: any = {};
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (search) {
      filter.email = { $regex: search, $options: "i" };
    }

    // Calculate pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build sort object
    const sort: any = {};
    sort[sortBy as string] = sortOrder === "desc" ? -1 : 1;

    // Execute queries
    const [users, totalUsers] = await Promise.all([
      User.find(filter)
        .select("-passwordHash")
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalUsers / limitNum);

    res.json({
      success: true,
      message: "Users retrieved successfully",
      data: {
        users,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalUsers,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
      },
    });
  } catch (error) {
    logger.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Create a new user (Admin only)
 */
export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password, role, assignedApps, fileCategories } = req.body;

    logger.info(`Creating new user: ${email}`);

    // Validation
    if (!email || !password || !role) {
      res.status(400).json({
        success: false,
        message: "Email, password, and role are required",
      });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
      return;
    }

    // Validate role
    if (
      ![
        "user",
        "gadhs-it-staff",
        "director",
        "manager",
        "clerk",
        "admin",
        "superadmin",
      ].includes(role)
    ) {
      res.status(400).json({
        success: false,
        message: 'Invalid role. Must be "user" or "superadmin"',
      });
      return;
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = new User({
      email,
      passwordHash: hashedPassword,
      role: role,
      assignedApps: assignedApps || [],
      status: "active",
      fileCategories: fileCategories || [],
      createdAt: new Date(),
    });

    await newUser.save();

    // Return user without password hash
    const { passwordHash, ...userResponse } = newUser.toObject();

    logger.info(`User created successfully: ${email}`);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: { user: userResponse },
    });
  } catch (error) {
    logger.error("Error creating user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create user",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Update user details (Admin only)
 */
export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { email, role, assignedApps, status } = req.body;

    logger.info(`Updating user: ${id}`);

    // Find user
    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Update fields
    if (email) user.email = email;
    if (role) user.role = role;
    if (assignedApps !== undefined) user.assignedApps = assignedApps;
    if (status) user.status = status;

    await user.save();

    // Return updated user without password hash
    const { passwordHash, ...userResponse } = user.toObject();

    logger.info(`User updated successfully: ${id}`);

    res.json({
      success: true,
      message: "User updated successfully",
      data: { user: userResponse },
    });
  } catch (error) {
    logger.error("Error updating user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Delete user (Admin only)
 */
export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const currentUser = (req as any).user;

    logger.info(`Deleting user: ${id}`);

    // Prevent self-deletion
    if (currentUser.userId === id) {
      res.status(400).json({
        success: false,
        message: "Cannot delete your own account",
      });
      return;
    }

    // Find and delete user
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    logger.info(`User deleted successfully: ${id}`);

    res.json({
      success: true,
      message: "User deleted successfully",
      data: { deletedUserId: id },
    });
  } catch (error) {
    logger.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    logger.info(`Fetching user by ID: ${id}`);

    const user = await User.findById(id).select("-passwordHash").lean();
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.json({
      success: true,
      message: "User retrieved successfully",
      data: { user },
    });
  } catch (error) {
    logger.error("Error fetching user by ID:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Bulk update user app assignments
 */
export const bulkUpdateUserApps = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userIds, assignedApps, action } = req.body;

    logger.info(`Bulk updating app assignments for ${userIds?.length} users`);

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      res.status(400).json({
        success: false,
        message: "User IDs array is required",
      });
      return;
    }

    if (!assignedApps || !Array.isArray(assignedApps)) {
      res.status(400).json({
        success: false,
        message: "Assigned apps array is required",
      });
      return;
    }

    let updateQuery: any;

    switch (action) {
      case "add":
        updateQuery = { $addToSet: { assignedApps: { $each: assignedApps } } };
        break;
      case "remove":
        updateQuery = { $pullAll: { assignedApps: assignedApps } };
        break;
      case "replace":
        updateQuery = { $set: { assignedApps: assignedApps } };
        break;
      default:
        res.status(400).json({
          success: false,
          message: 'Invalid action. Must be "add", "remove", or "replace"',
        });
        return;
    }

    const result = await User.updateMany(
      { _id: { $in: userIds } },
      updateQuery
    );

    logger.info(`Bulk update completed: ${result.modifiedCount} users updated`);

    res.json({
      success: true,
      message: "Bulk update completed successfully",
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
        action,
        assignedApps,
      },
    });
  } catch (error) {
    logger.error("Error in bulk update:", error);
    res.status(500).json({
      success: false,
      message: "Failed to perform bulk update",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get audit logs (placeholder for future implementation)
 */
export const getAuditLogs = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { page = 1 } = req.query;

    logger.info("Fetching audit logs");

    // Placeholder implementation - in a real system, this would fetch from an audit log collection
    const mockLogs = [
      {
        _id: "1",
        userId: "admin",
        action: "USER_CREATED",
        timestamp: new Date(),
        details: { email: "newuser@example.com" },
      },
      {
        _id: "2",
        userId: "admin",
        action: "USER_UPDATED",
        timestamp: new Date(Date.now() - 3600000),
        details: { userId: "123", changes: ["role"] },
      },
    ];

    res.json({
      success: true,
      message: "Audit logs retrieved successfully",
      data: {
        logs: mockLogs,
        pagination: {
          currentPage: parseInt(page as string),
          totalPages: 1,
          totalLogs: mockLogs.length,
        },
      },
    });
  } catch (error) {
    logger.error("Error fetching audit logs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch audit logs",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
