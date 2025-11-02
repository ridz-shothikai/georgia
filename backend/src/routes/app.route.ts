/**
 * App routes
 * Handles app-related endpoints and metadata
 */

import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import {
  getAllApps,
  getAppByName,
  checkAppAccess,
  getUserAccessibleApps,
  getAppHealth
} from '../controllers/app.controller';

const router = Router();

/**
 * @route GET /api/apps
 * @desc Get all available applications
 * @access Private
 */
router.get('/', authMiddleware, getAllApps);

/**
 * @route GET /api/apps/accessible
 * @desc Get apps accessible to current user
 * @access Private
 */
router.get('/accessible', authMiddleware, getUserAccessibleApps);

/**
 * @route GET /api/apps/:appName
 * @desc Get specific application metadata
 * @access Private
 */
router.get('/:appName', authMiddleware, getAppByName);

/**
 * @route GET /api/apps/:appName/access
 * @desc Check if user has access to specific app
 * @access Private
 */
router.get('/:appName/access', authMiddleware, checkAppAccess);

/**
 * @route GET /api/apps/:appName/health
 * @desc Get app health status
 * @access Private
 */
router.get('/:appName/health', authMiddleware, getAppHealth);

export default router;