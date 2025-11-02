/**
 * User controller
 * Handles user management operations
 */

import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { User, AuditLog } from '../models';
import { logger } from '../utils/logger';

/**
 * Get current user profile
 */
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const user = await User.findById(userId)
      .select('-passwordHash')
      .lean();

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Log audit
    await AuditLog.create({
      userId: req.user?.userId ? new Types.ObjectId(req.user.userId) : undefined,
      action: 'profile_update',
      level: 'info',
      message: 'User viewed their profile',
      details: { viewedOwnProfile: true },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent') || '',
      endpoint: req.originalUrl,
      method: req.method,
      statusCode: 200
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          assignedApps: user.assignedApps,
          status: user.status,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      },
      message: 'Profile retrieved successfully'
    });

  } catch (error) {
    logger.error('Get profile error:', error);
    
    // Log error
    if (req.user?.userId) {
      await AuditLog.create({
        userId: new Types.ObjectId(req.user.userId),
        action: 'profile_view_error',
        level: 'error',
        message: 'Failed to retrieve user profile',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        ipAddress: req.ip || 'Unknown',
        userAgent: req.headers['user-agent'] || 'Unknown',
        endpoint: req.originalUrl,
        method: req.method,
        statusCode: 500
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { firstName, lastName } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    // Validate input
    if (!firstName && !lastName) {
      res.status(400).json({
        success: false,
        message: 'At least one field (firstName or lastName) is required'
      });
      return;
    }

    // Build update object
    const updateData: any = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    updateData.updatedAt = new Date();

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Log profile update
    await AuditLog.create({
      userId: new Types.ObjectId(userId),
      action: 'profile_update',
      level: 'info',
      message: 'User updated their profile',
      details: { updatedFields: Object.keys(updateData) },
      ipAddress: req.ip || 'Unknown',
      userAgent: req.headers['user-agent'] || 'Unknown',
      endpoint: req.originalUrl,
      method: req.method,
      statusCode: 200
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          assignedApps: user.assignedApps,
          status: user.status,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      },
      message: 'Profile updated successfully'
    });

  } catch (error) {
    logger.error('Update profile error:', error);
    
    // Log error
    if (req.user?.userId) {
      await AuditLog.create({
        userId: new Types.ObjectId(req.user.userId),
        action: 'profile_update_error',
        level: 'error',
        message: 'Failed to update user profile',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        ipAddress: req.ip || 'Unknown',
        userAgent: req.headers['user-agent'] || 'Unknown',
        endpoint: req.originalUrl,
        method: req.method,
        statusCode: 500
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get all users (admin only)
 */
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, search, role, status } = req.query;
    
    // Build filter
    const filter: any = {};
    
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      filter.role = role;
    }
    
    if (status !== undefined) {
      filter.status = status;
    }

    // Calculate pagination
    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string)));
    const skip = (pageNum - 1) * limitNum;

    // Get users and total count
    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-passwordHash')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(filter)
    ]);

    // Log audit
    await AuditLog.create({
      userId: req.user?.userId ? new Types.ObjectId(req.user.userId) : undefined,
      action: 'users_list',
      level: 'info',
      message: `Admin ${req.user?.email} viewed all users`,
      details: { page: pageNum, limit: limitNum, search, role, status, totalUsers: total },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent') || '',
      endpoint: req.originalUrl,
      method: req.method,
      statusCode: 200
    });

    res.json({
      success: true,
      data: {
        users: users.map(user => ({
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        assignedApps: user.assignedApps,
        status: user.status,
        createdAt: user.createdAt,
          updatedAt: user.updatedAt
        })),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      },
      message: 'Users retrieved successfully'
    });

  } catch (error) {
    logger.error('Get all users error:', error);
    
    // Log error
    if (req.user?.userId) {
      await AuditLog.create({
        userId: new Types.ObjectId(req.user.userId),
        action: 'users_list_error',
        level: 'error',
        message: 'Failed to retrieve user list',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        ipAddress: req.ip || 'Unknown',
        userAgent: req.headers['user-agent'] || 'Unknown',
        endpoint: req.originalUrl,
        method: req.method,
        statusCode: 500
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get user by ID (admin only)
 */
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId
    if (!id || !Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
      return;
    }

    const user = await User.findById(id)
      .select('-passwordHash')
      .lean();

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Log user access
    await AuditLog.create({
      userId: new Types.ObjectId(req.user!.userId),
      action: 'user_view',
      level: 'info',
      message: `Admin viewed user profile: ${user.email}`,
      details: { targetUserId: id },
      ipAddress: req.ip || 'Unknown',
      userAgent: req.headers['user-agent'] || 'Unknown',
      endpoint: req.originalUrl,
      method: req.method,
      statusCode: 200
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        assignedApps: user.assignedApps,
        status: user.status,
        createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      },
      message: 'User retrieved successfully'
    });

  } catch (error) {
    logger.error('Get user by ID error:', error);
    
    // Log error
    if (req.user?.userId) {
      await AuditLog.create({
        userId: new Types.ObjectId(req.user.userId),
        action: 'user_view_error',
        level: 'error',
        message: 'Failed to retrieve user by ID',
        details: { 
          targetUserId: req.params.id,
          error: error instanceof Error ? error.message : 'Unknown error' 
        },
        ipAddress: req.ip || 'Unknown',
        userAgent: req.headers['user-agent'] || 'Unknown',
        endpoint: req.originalUrl,
        method: req.method,
        statusCode: 500
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Update user (admin only)
 */
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { firstName, lastName, role, assignedApps, status } = req.body;

    if (!id || !Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
      return;
    }

    // Build update object
    const updateData: any = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (role !== undefined) updateData.role = role;
    if (assignedApps !== undefined) updateData.assignedApps = assignedApps;
    if (status !== undefined) updateData.status = status;
    updateData.updatedAt = new Date();

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Log audit
    await AuditLog.create({
      userId: req.user?.userId ? new Types.ObjectId(req.user.userId) : undefined,
      action: 'user_update',
      level: 'info',
      message: `Admin ${req.user?.email} updated user ${id}`,
      details: { updatedUserId: id, updatedFields: Object.keys(updateData) },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent') || '',
      endpoint: req.originalUrl,
      method: req.method,
      statusCode: 200
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        assignedApps: user.assignedApps,
        status: user.status,
        createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      },
      message: 'User updated successfully'
    });

  } catch (error) {
    logger.error('Update user error:', error);
    
    // Log error
    if (req.user?.userId) {
      await AuditLog.create({
        userId: new Types.ObjectId(req.user.userId),
        action: 'user_update_error',
        level: 'error',
        message: 'Failed to update user',
        details: { 
          targetUserId: req.params.id,
          error: error instanceof Error ? error.message : 'Unknown error' 
        },
        ipAddress: req.ip || 'Unknown',
        userAgent: req.headers['user-agent'] || 'Unknown',
        endpoint: req.originalUrl,
        method: req.method,
        statusCode: 500
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Delete user (admin only)
 */
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id || !Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
      return;
    }

    // Prevent self-deletion
    if (id === req.user?.userId) {
      res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
      return;
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Log audit
    await AuditLog.create({
      userId: req.user?.userId ? new Types.ObjectId(req.user.userId) : undefined,
      action: 'user_delete',
      level: 'info',
      message: `Admin ${req.user?.email} deleted user ${id}`,
      details: { deletedUserId: id, deletedUserEmail: user.email },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent') || '',
      endpoint: req.originalUrl,
      method: req.method,
      statusCode: 200
    });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    logger.error('Delete user error:', error);
    
    // Log error
    if (req.user?.userId) {
      await AuditLog.create({
        userId: new Types.ObjectId(req.user.userId),
        action: 'user_delete_error',
        level: 'error',
        message: 'Failed to delete user',
        details: { 
          targetUserId: req.params.id,
          error: error instanceof Error ? error.message : 'Unknown error' 
        },
        ipAddress: req.ip || 'Unknown',
        userAgent: req.headers['user-agent'] || 'Unknown',
        endpoint: req.originalUrl,
        method: req.method,
        statusCode: 500
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};