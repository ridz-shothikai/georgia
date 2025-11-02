/**
 * Authentication routes
 * Handles user authentication endpoints
 */

import { Router } from 'express';
import { 
  login, 
  logout, 
  register, 
  verify, 
  refresh, 
  logoutAll 
} from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Public routes
router.post('/login', login);
router.post('/register', register);
router.post('/refresh', refresh);
router.get('/verify', verify);

// Protected routes
router.post('/logout', authMiddleware, logout);
router.post('/logout-all', authMiddleware, logoutAll);

export default router;