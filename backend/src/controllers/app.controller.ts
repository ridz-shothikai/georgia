/**
 * App Controller
 * Handles app-related operations including metadata, access control, and assignments
 */

import { Request, Response } from 'express';
import { logger } from '../utils/logger';

/**
 * App metadata configuration
 */
const APP_METADATA = {
  app1: {
    name: 'app1' ,
    displayName: 'Application One',
    description: 'First application in the unified platform',
    url: '/app1',
    port: 3001,
    requiredRole: 'user' as const
  },
  app2: {
    name: 'app2',
    displayName: 'Application Two', 
    description: 'Second application in the unified platform',
    url: '/app2',
    port: 3002,
    requiredRole: 'user' as const
  },
  'admin-dashboard': {
    name: 'admin-dashboard',
    displayName: 'Admin Dashboard',
    description: 'Administrative interface for system management',
    url: '/admin-dashboard',
    port: 3003,
    requiredRole: 'superadmin' as const
  }
};

/**
 * Get all available applications
 */
export const getAllApps = async (_req: Request, res: Response): Promise<void> => {
  try {
    logger.info('Fetching all applications metadata');
    
    const apps = Object.values(APP_METADATA);
    
    res.json({
      success: true,
      message: 'Applications retrieved successfully',
      data: apps
    });
  } catch (error) {
    logger.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get specific application metadata
 */
export const getAppByName = async (req: Request, res: Response): Promise<void> => {
  try {
    const { appName } = req.params;
    
    logger.info(`Fetching metadata for app: ${appName}`);
    
    if (!appName || !(appName in APP_METADATA)) {
      res.status(404).json({
        success: false,
        message: 'Application not found'
      });
      return;
    }
    
    const app = APP_METADATA[appName as keyof typeof APP_METADATA];
    
    res.json({
      success: true,
      message: 'Application metadata retrieved successfully',
      data: app
    });
  } catch (error) {
    logger.error('Error fetching application metadata:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application metadata',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Check if user has access to specific app
 */
export const checkAppAccess = async (req: Request, res: Response): Promise<void> => {
  try {
    const { appName } = req.params;
    const user = (req as any).user; // From auth middleware
    
    logger.info(`Checking app access for user ${user?.userId} to app: ${appName}`);
    
    if (!appName || !(appName in APP_METADATA)) {
      res.status(404).json({
        success: false,
        message: 'Application not found'
      });
      return;
    }
    
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }
    
    const app = APP_METADATA[appName as keyof typeof APP_METADATA];
    const hasAccess = user.assignedApps?.includes(appName) || 
                     (app.requiredRole === 'superadmin' && user.role === 'superadmin');
    
    res.json({
      success: true,
      message: 'Access check completed',
      data: {
        hasAccess,
        app: app,
        userRole: user.role,
        assignedApps: user.assignedApps
      }
    });
  } catch (error) {
    logger.error('Error checking app access:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check app access',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get apps accessible to current user
 */
export const getUserAccessibleApps = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user; // From auth middleware
    
    logger.info(`Fetching accessible apps for user: ${user?.userId}`);
    
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }
    
    const allApps = Object.values(APP_METADATA);
    const accessibleApps = allApps.filter(app => {
      // Superadmin has access to all apps
      if (user.role === 'superadmin') {
        return true;
      }
      
      // Regular users only have access to assigned apps
      return user.assignedApps?.includes(app.name);
    });
    
    res.json({
      success: true,
      message: 'Accessible applications retrieved successfully',
      data: {
        apps: accessibleApps,
        userRole: user.role,
        assignedApps: user.assignedApps
      }
    });
  } catch (error) {
    logger.error('Error fetching accessible apps:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch accessible applications',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get app health status
 */
export const getAppHealth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { appName } = req.params;
    
    logger.info(`Checking health status for app: ${appName}`);
    
    if (!appName || !(appName in APP_METADATA)) {
      res.status(404).json({
        success: false,
        message: 'Application not found'
      });
      return;
    }
    
    const app = APP_METADATA[appName as keyof typeof APP_METADATA];
    
    // In a real implementation, this would check actual app health
    // For now, we'll return a mock health status
    const healthStatus = {
      status: 'healthy',
      uptime: '99.9%',
      lastChecked: new Date().toISOString(),
      responseTime: Math.floor(Math.random() * 100) + 50, // Mock response time
      version: '1.0.0'
    };
    
    res.json({
      success: true,
      message: 'App health status retrieved successfully',
      data: {
        app: app,
        health: healthStatus
      }
    });
  } catch (error) {
    logger.error('Error checking app health:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check app health',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};