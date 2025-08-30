import Like from '../models/Like.js';
import Article from '../models/Article.js';
import Comment from '../models/Comment.js';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { AppError } from '../middleware/errorHandler.js';

// Toggle like on a target (article or comment)
export const toggleLike = asyncHandler(async (req, res) => {
  const { targetType, targetId, type = 'like' } = req.body;
  const userId = req.user.id;

  // Validate target type
  if (!['article', 'comment'].includes(targetType)) {
    throw new AppError('Invalid target type. Must be "article" or "comment"', 400);
  }

  // Validate like type
  if (!['like', 'love', 'helpful', 'insightful'].includes(type)) {
    throw new AppError('Invalid like type', 400);
  }

  // Check if target exists
  let target;
  if (targetType === 'article') {
    target = await Article.findById(targetId);
  } else {
    target = await Comment.findById(targetId);
  }

  if (!target) {
    throw new AppError(`${targetType} not found`, 404);
  }

  // Check if user already liked this target
  const existingLike = await Like.findOne({
    user: userId,
    targetType,
    target: targetId,
    isActive: true,
  });

  if (existingLike) {
    // Unlike: deactivate existing like
    existingLike.isActive = false;
    await existingLike.save();

    // Update target like count
    if (targetType === 'article') {
      target.likes = Math.max(0, target.likes - 1);
      await target.save();
    } else {
      target.likes = Math.max(0, target.likes - 1);
      await target.save();
    }

    res.json({
      success: true,
      message: `${targetType} unliked successfully`,
      liked: false,
    });
  } else {
    // Like: create new like
    const like = new Like({
      user: userId,
      targetType,
      target: targetId,
      type,
    });

    await like.save();

    // Update target like count
    if (targetType === 'article') {
      target.likes += 1;
      await target.save();
    } else {
      target.likes += 1;
      await target.save();
    }

    res.json({
      success: true,
      message: `${targetType} liked successfully`,
      liked: true,
      data: like,
    });
  }
});

// Get likes for a specific target
export const getLikesByTarget = asyncHandler(async (req, res) => {
  const { targetType, targetId } = req.params;
  const { page = 1, limit = 20 } = req.query;

  // Validate target type
  if (!['article', 'comment'].includes(targetType)) {
    throw new AppError('Invalid target type. Must be "article" or "comment"', 400);
  }

  // Check if target exists
  let target;
  if (targetType === 'article') {
    target = await Article.findById(targetId);
  } else {
    target = await Comment.findById(targetId);
  }

  if (!target) {
    throw new AppError(`${targetType} not found`, 404);
  }

  const skip = (page - 1) * limit;

  const [likes, total] = await Promise.all([
    Like.find({
      targetType,
      target: targetId,
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'username firstName lastName avatar'),
    Like.countDocuments({
      targetType,
      target: targetId,
      isActive: true,
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  res.json({
    success: true,
    data: likes,
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

// Get likes by a specific user
export const getUserLikes = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 20, targetType } = req.query;

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const skip = (page - 1) * limit;

  // Build query
  const query = {
    user: userId,
    isActive: true,
  };

  if (targetType && ['article', 'comment'].includes(targetType)) {
    query.targetType = targetType;
  }

  const [likes, total] = await Promise.all([
    Like.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('target', 'title slug excerpt coverImage'),
    Like.countDocuments(query),
  ]);

  const totalPages = Math.ceil(total / limit);

  res.json({
    success: true,
    data: likes,
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

// Remove a specific like (admin or owner only)
export const removeLike = asyncHandler(async (req, res) => {
  const { likeId } = req.params;
  const userId = req.user.id;

  const like = await Like.findById(likeId);
  if (!like) {
    throw new AppError('Like not found', 404);
  }

  // Check ownership or admin rights
  if (like.user.toString() !== userId && req.user.role !== 'admin') {
    throw new AppError('You can only remove your own likes', 403);
  }

  // Deactivate like
  like.isActive = false;
  await like.save();

  // Update target like count
  if (like.targetType === 'article') {
    const article = await Article.findById(like.target);
    if (article) {
      article.likes = Math.max(0, article.likes - 1);
      await article.save();
    }
  } else if (like.targetType === 'comment') {
    const comment = await Comment.findById(like.target);
    if (comment) {
      comment.likes = Math.max(0, comment.likes - 1);
      await comment.save();
    }
  }

  res.json({
    success: true,
    message: 'Like removed successfully',
  });
});
