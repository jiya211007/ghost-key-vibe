import express from 'express';
import {
  createComment,
  getCommentsByArticle,
  updateComment,
  deleteComment,
  likeComment,
  unlikeComment,
  flagComment,
  approveComment,
  rejectComment,
  getReplies,
  createReply,
} from '../controllers/comment.controller.js';
import {
  authenticateToken,
  requireRole,
  requireOwnershipOrAdmin,
  requireModerationRights,
} from '../middleware/auth.js';
import {
  validateCommentCreation,
  validateCommentUpdate,
  validatePagination,
} from '../middleware/validate.js';
import { commentRateLimit } from '../middleware/rateLimit.js';

const router = express.Router();

// Apply rate limiting to all comment routes
router.use(commentRateLimit);

// Public routes
router.get('/article/:articleSlug', validatePagination, getCommentsByArticle);
router.get('/:commentId/replies', validatePagination, getReplies);

// Protected routes (require authentication)
router.use(authenticateToken);

// Comment CRUD operations
router.post('/', validateCommentCreation, createComment);
router.put('/:commentId', requireOwnershipOrAdmin, validateCommentUpdate, updateComment);
router.delete('/:commentId', requireOwnershipOrAdmin, deleteComment);

// Comment interactions
router.post('/:commentId/like', likeComment);
router.delete('/:commentId/like', unlikeComment);
router.post('/:commentId/flag', flagComment);

// Comment replies
router.post('/:commentId/replies', validateCommentCreation, createReply);

// Admin/Moderator routes
router.put('/:commentId/approve', requireModerationRights, approveComment);
router.put('/:commentId/reject', requireModerationRights, rejectComment);

export default router;
