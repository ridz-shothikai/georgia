/**
 * User routes
 * Handles user-related HTTP endpoints with proper authentication and authorization
 */

import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
} from '../controllers/user.controller';
import {
  authMiddleware,
  adminOnlyMiddleware
} from '../middlewares/auth.middleware';

const router = Router();

/**
 * User Profile Routes
 * These routes allow users to manage their own profiles
 */

// GET /api/users/profile - Get current user's profile
router.get('/profile', authMiddleware, getProfile);

// PUT /api/users/profile - Update current user's profile
router.put('/profile', authMiddleware, updateProfile);

/**
 * Admin User Management Routes
 * These routes are restricted to admin users only
 */

// GET /api/users - Get all users (admin only, with pagination and filtering)
router.get('/', adminOnlyMiddleware, getAllUsers);

// GET /api/users/:id - Get specific user by ID (admin only)
router.get('/:id', adminOnlyMiddleware, getUserById);

// PUT /api/users/:id - Update specific user (admin only)
router.put('/:id', adminOnlyMiddleware, updateUser);

// DELETE /api/users/:id - Delete specific user (admin only)
router.delete('/:id', adminOnlyMiddleware, deleteUser);

export default router;