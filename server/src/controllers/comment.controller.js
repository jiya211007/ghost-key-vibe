import Comment from '../models/Comment.js';
import Article from '../models/Article.js';
import User from '../models/User.js';
import Like from '../models/Like.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { AppError } from '../middleware/errorHandler.js';

// Create a new comment
export const createComment = asyncHandler(async (req, res) => {
  const { content, articleSlug, parentCommentId } = req.body;
  const authorId = req.user.id;

  // Find the article
  const article = await Article.findOne({ slug: articleSlug, status: 'approved', isPublished: true });
  if (!article) {
    throw new AppError('Article not found or not published', 404);
  }

  // Check if this is a reply to another comment
  let parentComment = null;
  if (parentCommentId) {
    parentComment = await Comment.findById(parentCommentId);
    if (!parentComment) {
      throw new AppError('Parent comment not found', 404);
    }
  }

  // Create comment
  const comment = new Comment({
    content,
    author: authorId,
    article: article._id,
    parentComment: parentCommentId || null,
    status: 'pending', // Default status for new comments
  });

  await comment.save();

  // Update article comment count
  article.comments += 1;
  await article.save();

  // If this is a reply, update parent comment
  if (parentComment) {
    parentComment.replies.push(comment._id);
    await parentComment.save();
  }

  // Populate author information
  await comment.populate('author', 'username firstName lastName avatar');

  res.status(201).json({
    success: true,
    message: 'Comment created successfully and submitted for review',
    data: comment,
  });
});

// Get comments by article
export const getCommentsByArticle = asyncHandler(async (req, res) => {
  const { articleSlug } = req.params;
  const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  // Find the article
  const article = await Article.findOne({ slug: articleSlug, status: 'approved', isPublished: true });
  if (!article) {
    throw new AppError('Article not found or not published', 404);
  }

  // Build query for top-level comments only
  const query = {
    article: article._id,
    parentComment: null, // Only top-level comments
    status: 'approved',
  };

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const skip = (page - 1) * limit;

  const [comments, total] = await Promise.all([
    Comment.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'username firstName lastName avatar')
      .populate({
        path: 'replies',
        match: { status: 'approved' },
        populate: {
          path: 'author',
          select: 'username firstName lastName avatar',
        },
        options: { sort: { createdAt: 1 } },
      }),
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

// Update comment
export const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  const userId = req.user.id;

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new AppError('Comment not found', 404);
  }

  // Check ownership or admin rights
  if (comment.author.toString() !== userId && req.user.role !== 'admin') {
    throw new AppError('You can only edit your own comments', 403);
  }

  // Update comment
  comment.content = content;
  comment.isEdited = true;
  comment.editedAt = new Date();
  comment.editHistory.push({
    content: comment.content,
    editedAt: comment.editedAt,
  });
  comment.status = 'pending'; // Reset to pending for review

  await comment.save();

  // Populate author information
  await comment.populate('author', 'username firstName lastName avatar');

  res.json({
    success: true,
    message: 'Comment updated successfully and submitted for review',
    data: comment,
  });
});

// Delete comment
export const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user.id;

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new AppError('Comment not found', 404);
  }

  // Check ownership or admin rights
  if (comment.author.toString() !== userId && req.user.role !== 'admin') {
    throw new AppError('You can only delete your own comments', 403);
  }

  // Update article comment count
  const article = await Article.findById(comment.article);
  if (article) {
    article.comments = Math.max(0, article.comments - 1);
    await article.save();
  }

  // Remove from parent comment replies if it's a reply
  if (comment.parentComment) {
    const parentComment = await Comment.findById(comment.parentComment);
    if (parentComment) {
      parentComment.replies = parentComment.replies.filter(replyId => replyId.toString() !== commentId);
      await parentComment.save();
    }
  }

  await Comment.findByIdAndDelete(commentId);

  res.json({
    success: true,
    message: 'Comment deleted successfully',
  });
});

// Like comment
export const likeComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user.id;

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new AppError('Comment not found', 404);
  }

  // Check if user already liked the comment
  const existingLike = await Like.findOne({
    user: userId,
    targetType: 'comment',
    target: commentId,
    isActive: true,
  });

  if (existingLike) {
    throw new AppError('You have already liked this comment', 400);
  }

  // Create like
  const like = new Like({
    user: userId,
    targetType: 'comment',
    target: commentId,
    type: 'like',
  });

  await like.save();

  // Update comment like count
  comment.likes += 1;
  await comment.save();

  res.json({
    success: true,
    message: 'Comment liked successfully',
  });
});

// Unlike comment
export const unlikeComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user.id;

  // Find and deactivate the like
  const like = await Like.findOne({
    user: userId,
    targetType: 'comment',
    target: commentId,
    isActive: true,
  });

  if (!like) {
    throw new AppError('You have not liked this comment', 400);
  }

  like.isActive = false;
  await like.save();

  // Update comment like count
  const comment = await Comment.findById(commentId);
  if (comment) {
    comment.likes = Math.max(0, comment.likes - 1);
    await comment.save();
  }

  res.json({
    success: true,
    message: 'Comment unliked successfully',
  });
});

// Flag comment
export const flagComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { reason } = req.body;
  const userId = req.user.id;

  if (!reason) {
    throw new AppError('Flag reason is required', 400);
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new AppError('Comment not found', 404);
  }

  // Check if user already flagged this comment
  if (comment.flaggedBy.includes(userId)) {
    throw new AppError('You have already flagged this comment', 400);
  }

  // Add flag
  comment.flaggedBy.push(userId);
  comment.flagCount += 1;
  comment.isFlagged = true;

  // Auto-hide comment if flag count reaches threshold
  if (comment.flagCount >= 3) {
    comment.status = 'hidden';
  }

  await comment.save();

  res.json({
    success: true,
    message: 'Comment flagged successfully',
  });
});

// Approve comment
export const approveComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const moderatorId = req.user.id;

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new AppError('Comment not found', 404);
  }

  comment.status = 'approved';
  comment.approvedBy = moderatorId;
  comment.approvedAt = new Date();

  await comment.save();

  res.json({
    success: true,
    message: 'Comment approved successfully',
    data: comment,
  });
});

// Reject comment
export const rejectComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { rejectionReason } = req.body;
  const moderatorId = req.user.id;

  if (!rejectionReason) {
    throw new AppError('Rejection reason is required', 400);
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new AppError('Comment not found', 404);
  }

  comment.status = 'rejected';
  comment.rejectionReason = rejectionReason;
  comment.rejectedBy = moderatorId;
  comment.rejectedAt = new Date();

  await comment.save();

  res.json({
    success: true,
    message: 'Comment rejected successfully',
    data: comment,
  });
});

// Get replies to a comment
export const getReplies = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new AppError('Comment not found', 404);
  }

  const skip = (page - 1) * limit;

  const [replies, total] = await Promise.all([
    Comment.find({
      parentComment: commentId,
      status: 'approved',
    })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'username firstName lastName avatar'),
    Comment.countDocuments({
      parentComment: commentId,
      status: 'approved',
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  res.json({
    success: true,
    data: replies,
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

// Create a reply to a comment
export const createReply = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  const authorId = req.user.id;

  const parentComment = await Comment.findById(commentId);
  if (!parentComment) {
    throw new AppError('Parent comment not found', 404);
  }

  // Find the article
  const article = await Article.findById(parentComment.article);
  if (!article || article.status !== 'approved' || !article.isPublished) {
    throw new AppError('Article not found or not published', 404);
  }

  // Create reply
  const reply = new Comment({
    content,
    author: authorId,
    article: article._id,
    parentComment: commentId,
    status: 'pending', // Default status for new replies
  });

  await reply.save();

  // Update parent comment replies
  parentComment.replies.push(reply._id);
  await parentComment.save();

  // Update article comment count
  article.comments += 1;
  await article.save();

  // Populate author information
  await reply.populate('author', 'username firstName lastName avatar');

  res.status(201).json({
    success: true,
    message: 'Reply created successfully and submitted for review',
    data: reply,
  });
});
