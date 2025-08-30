import express from 'express';
import {
  getDashboardStats,
  getPendingArticles,
  getPendingComments,
  getFlaggedContent,
  getUserManagement,
  getAnalytics,
  bulkAction,
  updateUserRole,
  banUser,
  unbanUser,
  getSystemLogs,
  getModerationQueue,
} from '../controllers/admin.controller.js';
import {
  authenticateToken,
  requireRole,
  requireAdmin,
} from '../middleware/auth.js';
import {
  validateBulkAction,
  validateUserRoleUpdate,
  validatePagination,
} from '../middleware/validate.js';
import { adminRateLimit } from '../middleware/rateLimit.js';

const router = express.Router();

// Apply rate limiting to all admin routes
router.use(adminRateLimit);

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Dashboard and overview
router.get('/dashboard', getDashboardStats);
router.get('/analytics', getAnalytics);

// Content moderation
router.get('/articles/pending', validatePagination, getPendingArticles);
router.get('/comments/pending', validatePagination, getPendingComments);
router.get('/content/flagged', validatePagination, getFlaggedContent);
router.get('/moderation/queue', getModerationQueue);

// User management
router.get('/users', validatePagination, getUserManagement);
router.put('/users/:userId/role', validateUserRoleUpdate, updateUserRole);
router.put('/users/:userId/ban', banUser);
router.put('/users/:userId/unban', unbanUser);

// Bulk actions
router.post('/bulk-action', validateBulkAction, bulkAction);

// System logs
router.get('/logs', validatePagination, getSystemLogs);

export default router;
