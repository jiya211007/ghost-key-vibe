import express from 'express';
import {
  createArticle,
  getAllArticles,
  getArticleBySlug,
  updateArticle,
  deleteArticle,
  approveArticle,
  rejectArticle,
  hideArticle,
  featureArticle,
  incrementViews,
  getTrendingArticles,
  getRelatedArticles,
  searchArticles,
  getArticlesByCategory,
  getArticlesByTag,
  getArticlesByAuthor,
} from '../controllers/article.controller.js';
import {
  authenticateToken,
  requireRole,
  requireOwnershipOrAdmin,
  requireModerationRights,
} from '../middleware/auth.js';
import {
  validateArticleCreation,
  validateArticleUpdate,
  validateArticleSearch,
  validatePagination,
} from '../middleware/validate.js';
import { articleRateLimit } from '../middleware/rateLimit.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Apply rate limiting to all article routes
router.use(articleRateLimit);

// Public routes
router.get('/', validatePagination, getAllArticles);
router.get('/trending', getTrendingArticles);
router.get('/search', validateArticleSearch, searchArticles);
router.get('/category/:category', validatePagination, getArticlesByCategory);
router.get('/tag/:tag', validatePagination, getArticlesByTag);
router.get('/author/:authorId', validatePagination, getArticlesByAuthor);
router.get('/:slug', getArticleBySlug);

// Protected routes (require authentication)
router.use(authenticateToken);

// Article creation and management
router.post('/', upload.single('coverImage'), validateArticleCreation, createArticle);
router.put('/:slug', requireOwnershipOrAdmin, upload.single('coverImage'), validateArticleUpdate, updateArticle);
router.delete('/:slug', requireOwnershipOrAdmin, deleteArticle);

// View tracking (increment views when article is viewed)
router.post('/:slug/view', incrementViews);

// Admin/Moderator routes
router.put('/:slug/approve', requireModerationRights, approveArticle);
router.put('/:slug/reject', requireModerationRights, rejectArticle);
router.put('/:slug/hide', requireModerationRights, hideArticle);
router.put('/:slug/feature', requireRole(['admin']), featureArticle);

// Get related articles (for authenticated users)
router.get('/:slug/related', getRelatedArticles);

export default router;
