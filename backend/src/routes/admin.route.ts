/**
 * Admin Routes
 * Handles all administrative operations including user management and system monitoring
 */

import express from 'express';
import {
  getSystemStats,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserById,
  bulkUpdateUserApps,
  getAuditLogs
} from '../controllers/admin.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { permissionMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();

// Apply authentication middleware to all admin routes
router.use(authMiddleware);

// Apply superadmin permission middleware to all admin routes
router.use(permissionMiddleware(['superadmin']));

// System statistics and monitoring
router.get('/stats', getSystemStats);
router.get('/audit-logs', getAuditLogs);

// User management routes
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Bulk operations
router.post('/users/bulk-update-apps', bulkUpdateUserApps);

export default router;