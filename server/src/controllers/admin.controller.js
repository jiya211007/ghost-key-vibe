import User from '../models/User.js';
import Article from '../models/Article.js';
import Comment from '../models/Comment.js';
import Like from '../models/Like.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { AppError } from '../middleware/errorHandler.js';

// Get dashboard statistics
export const getDashboardStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const lastWeek = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const lastMonth = new Date(now - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    newUsersThisWeek,
    newUsersThisMonth,
    totalArticles,
    pendingArticles,
    publishedArticles,
    totalComments,
    pendingComments,
    totalViews,
    totalLikes,
    flaggedContent,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ createdAt: { $gte: lastWeek } }),
    User.countDocuments({ createdAt: { $gte: lastMonth } }),
    Article.countDocuments(),
    Article.countDocuments({ status: 'pending' }),
    Article.countDocuments({ status: 'approved', isPublished: true }),
    Comment.countDocuments(),
    Comment.countDocuments({ status: 'pending' }),
    Article.aggregate([
      { $group: { _id: null, totalViews: { $sum: '$views' } } },
    ]),
    Like.countDocuments({ isActive: true }),
    Comment.countDocuments({ isFlagged: true }),
  ]);

  const stats = {
    users: {
      total: totalUsers,
      newThisWeek: newUsersThisWeek,
      newThisMonth: newUsersThisMonth,
    },
    articles: {
      total: totalArticles,
      pending: pendingArticles,
      published: publishedArticles,
    },
    comments: {
      total: totalComments,
      pending: pendingComments,
    },
    engagement: {
      totalViews: totalViews[0]?.totalViews || 0,
      totalLikes: totalLikes,
    },
    moderation: {
      flaggedContent: flaggedContent,
    },
  };

  res.json({
    success: true,
    data: stats,
  });
});

// Get pending articles for moderation
export const getPendingArticles = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status = 'pending' } = req.query;

  const query = {};
  if (status && status !== 'all') {
    query.status = status;
  }

  const skip = (page - 1) * limit;

  const [articles, total] = await Promise.all([
    Article.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'username firstName lastName avatar email')
      .select('-content'),
    Article.countDocuments(query),
  ]);

  const totalPages = Math.ceil(total / limit);

  res.json({
    success: true,
    data: articles,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  });
});

// Get pending comments for moderation
export const getPendingComments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status = 'pending' } = req.query;

  const query = {};
  if (status && status !== 'all') {
    query.status = status;
  }

  const skip = (page - 1) * limit;

  const [comments, total] = await Promise.all([
    Comment.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'username firstName lastName avatar email')
      .populate('article', 'title slug'),
    Comment.countDocuments(query),
  ]);

  const totalPages = Math.ceil(total / limit);

  res.json({
    success: true,
    data: comments,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  });
});

// Get flagged content
export const getFlaggedContent = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, contentType } = req.query;

  const skip = (page - 1) * limit;

  let flaggedContent = [];
  let total = 0;

  if (!contentType || contentType === 'comments') {
    const [flaggedComments, commentCount] = await Promise.all([
      Comment.find({ isFlagged: true })
        .sort({ flagCount: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('author', 'username firstName lastName avatar')
        .populate('article', 'title slug'),
      Comment.countDocuments({ isFlagged: true }),
    ]);

    flaggedContent = flaggedComments.map(comment => ({
      ...comment.toObject(),
      contentType: 'comment',
    }));
    total = commentCount;
  }

  const totalPages = Math.ceil(total / limit);

  res.json({
    success: true,
    data: flaggedContent,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  });
});

// Get user management data
export const getUserManagement = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, role, status, search } = req.query;

  const query = {};

  if (role && role !== 'all') {
    query.role = role;
  }

  if (status && status !== 'all') {
    query.isActive = status === 'active';
  }

  if (search) {
    const searchRegex = new RegExp(search, 'i');
    query.$or = [
      { username: searchRegex },
      { firstName: searchRegex },
      { lastName: searchRegex },
      { email: searchRegex },
    ];
  }

  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find(query)
      .select('-password -refreshTokens')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    User.countDocuments(query),
  ]);

  const totalPages = Math.ceil(total / limit);

  res.json({
    success: true,
    data: users,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  });
});

// Get analytics data
export const getAnalytics = asyncHandler(async (req, res) => {
  const { timeframe = '30d' } = req.query;

  const now = new Date();
  let startDate;

  switch (timeframe) {
    case '7d':
      startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(now - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
  }

  const [
    userGrowth,
    articleGrowth,
    viewGrowth,
    topCategories,
    topAuthors,
    engagementTrends,
  ] = await Promise.all([
    // User growth over time
    User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),

    // Article growth over time
    Article.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),

    // View growth over time
    Article.aggregate([
      { $match: { publishedAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$publishedAt' } },
          views: { $sum: '$views' },
        },
      },
      { $sort: { _id: 1 } },
    ]),

    // Top categories
    Article.aggregate([
      { $match: { status: 'approved', isPublished: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalViews: { $sum: '$views' },
          totalLikes: { $sum: '$likes' },
        },
      },
      { $sort: { totalViews: -1 } },
      { $limit: 10 },
    ]),

    // Top authors
    Article.aggregate([
      { $match: { status: 'approved', isPublished: true } },
      {
        $group: {
          _id: '$author',
          articleCount: { $sum: 1 },
          totalViews: { $sum: '$views' },
          totalLikes: { $sum: '$likes' },
        },
      },
      { $sort: { totalViews: -1 } },
      { $limit: 10 },
    ]),

    // Engagement trends
    Article.aggregate([
      { $match: { publishedAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$publishedAt' } },
          avgViews: { $avg: '$views' },
          avgLikes: { $avg: '$likes' },
          avgComments: { $avg: '$comments' },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  // Populate author information for top authors
  const topAuthorsWithInfo = await User.populate(topAuthors, {
    path: '_id',
    select: 'username firstName lastName avatar',
  });

  const analytics = {
    userGrowth,
    articleGrowth,
    viewGrowth,
    topCategories,
    topAuthors: topAuthorsWithInfo,
    engagementTrends,
  };

  res.json({
    success: true,
    data: analytics,
  });
});

// Bulk actions for moderation
export const bulkAction = asyncHandler(async (req, res) => {
  const { action, targetType, targetIds, reason } = req.body;

  if (!action || !targetType || !targetIds || !Array.isArray(targetIds)) {
    throw new AppError('Invalid bulk action parameters', 400);
  }

  let results = [];

  switch (action) {
    case 'approve':
      if (targetType === 'articles') {
        results = await Article.updateMany(
          { _id: { $in: targetIds } },
          {
            status: 'approved',
            approvalDate: new Date(),
            approvedBy: req.user.id,
            isPublished: true,
            publishedAt: new Date(),
          }
        );
      } else if (targetType === 'comments') {
        results = await Comment.updateMany(
          { _id: { $in: targetIds } },
          {
            status: 'approved',
            approvedBy: req.user.id,
            approvedAt: new Date(),
          }
        );
      }
      break;

    case 'reject':
      if (targetType === 'articles') {
        results = await Article.updateMany(
          { _id: { $in: targetIds } },
          {
            status: 'rejected',
            rejectionReason: reason || 'Bulk rejection',
            rejectedBy: req.user.id,
            rejectedAt: new Date(),
            isPublished: false,
          }
        );
      } else if (targetType === 'comments') {
        results = await Comment.updateMany(
          { _id: { $in: targetIds } },
          {
            status: 'rejected',
            rejectionReason: reason || 'Bulk rejection',
            rejectedBy: req.user.id,
            rejectedAt: new Date(),
          }
        );
      }
      break;

    case 'hide':
      if (targetType === 'articles') {
        results = await Article.updateMany(
          { _id: { $in: targetIds } },
          {
            isPublished: false,
            moderationNotes: reason || 'Bulk hidden',
          }
        );
      } else if (targetType === 'comments') {
        results = await Comment.updateMany(
          { _id: { $in: targetIds } },
          {
            status: 'hidden',
            moderationNotes: reason || 'Bulk hidden',
          }
        );
      }
      break;

    default:
      throw new AppError('Invalid action type', 400);
  }

  res.json({
    success: true,
    message: `Bulk action "${action}" completed successfully`,
    data: results,
  });
});

// Update user role
export const updateUserRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  if (!['user', 'moderator', 'admin'].includes(role)) {
    throw new AppError('Invalid role. Must be user, moderator, or admin', 400);
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Prevent changing own role
  if (user._id.toString() === req.user.id) {
    throw new AppError('You cannot change your own role', 400);
  }

  user.role = role;
  await user.save();

  res.json({
    success: true,
    message: `User role updated to ${role}`,
    data: user,
  });
});

// Ban user
export const banUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { reason } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Prevent banning self
  if (user._id.toString() === req.user.id) {
    throw new AppError('You cannot ban yourself', 400);
  }

  user.isActive = false;
  user.bannedAt = new Date();
  user.banReason = reason || 'No reason provided';
  user.bannedBy = req.user.id;

  await user.save();

  res.json({
    success: true,
    message: 'User banned successfully',
    data: user,
  });
});

// Unban user
export const unbanUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  user.isActive = true;
  user.bannedAt = undefined;
  user.banReason = undefined;
  user.bannedBy = undefined;

  await user.save();

  res.json({
    success: true,
    message: 'User unbanned successfully',
    data: user,
  });
});

// Get moderation queue
export const getModerationQueue = asyncHandler(async (req, res) => {
  const [
    pendingArticles,
    pendingComments,
    flaggedComments,
    recentUsers,
  ] = await Promise.all([
    Article.countDocuments({ status: 'pending' }),
    Comment.countDocuments({ status: 'pending' }),
    Comment.countDocuments({ isFlagged: true }),
    User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
  ]);

  const queue = {
    pendingArticles,
    pendingComments,
    flaggedComments,
    recentUsers,
    total: pendingArticles + pendingComments + flaggedComments,
  };

  res.json({
    success: true,
    data: queue,
  });
});

// Get system logs (placeholder for future implementation)
export const getSystemLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, level, startDate, endDate } = req.query;

  // This is a placeholder - in a real application, you would have a logging system
  // For now, we'll return an empty result
  const logs = [];
  const total = 0;

  res.json({
    success: true,
    data: logs,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
    },
    message: 'System logs not yet implemented',
  });
});
