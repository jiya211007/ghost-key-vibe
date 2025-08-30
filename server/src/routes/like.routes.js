import express from 'express';
import {
  toggleLike,
  getLikesByTarget,
  getUserLikes,
  removeLike,
} from '../controllers/like.controller.js';
import {
  authenticateToken,
  requireOwnershipOrAdmin,
} from '../middleware/auth.js';
import { validatePagination } from '../middleware/validate.js';
import { likeRateLimit } from '../middleware/rateLimit.js';

const router = express.Router();

// Apply rate limiting to all like routes
router.use(likeRateLimit);

// All routes require authentication
router.use(authenticateToken);

// Like management
router.post('/toggle', toggleLike);
router.delete('/:likeId', requireOwnershipOrAdmin, removeLike);

// Get likes
router.get('/target/:targetType/:targetId', validatePagination, getLikesByTarget);
router.get('/user/:userId', validatePagination, getUserLikes);

export default router;
