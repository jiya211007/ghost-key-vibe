import express from 'express';
import {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
  getUserArticles,
  getUserStats,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  searchUsers,
  getUserById,
  getPublicProfile,
} from '../controllers/user.controller.js';
import {
  authenticateToken,
  requireRole,
  requireOwnershipOrAdmin,
} from '../middleware/auth.js';
import {
  validateProfileUpdate,
  validatePasswordChange,
  validateUserSearch,
} from '../middleware/validate.js';
import { userRateLimit } from '../middleware/rateLimit.js';

const router = express.Router();

// Apply rate limiting to all user routes
router.use(userRateLimit);

// Public routes
router.get('/search', validateUserSearch, searchUsers);
router.get('/:userId/public', getUserById, getPublicProfile);

// Protected routes (require authentication)
router.use(authenticateToken);

// Profile management
router.get('/profile', getProfile);
router.put('/profile', validateProfileUpdate, updateProfile);
router.put('/password', validatePasswordChange, changePassword);
router.delete('/account', deleteAccount);

// User articles and stats
router.get('/articles', getUserArticles);
router.get('/stats', getUserStats);

// Social features
router.post('/:userId/follow', followUser);
router.delete('/:userId/follow', unfollowUser);
router.get('/:userId/followers', getFollowers);
router.get('/:userId/following', getFollowing);

// Admin routes
router.get('/:userId', requireRole(['admin', 'moderator']), getUserById);

export default router;
