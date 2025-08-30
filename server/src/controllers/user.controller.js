import User from '../models/User.js';
import Article from '../models/Article.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { AppError } from '../middleware/errorHandler.js';
import bcrypt from 'bcryptjs';

// Get current user profile
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
    .select('-password -refreshTokens')
    .populate('followers', 'username firstName lastName avatar')
    .populate('following', 'username firstName lastName avatar');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({
    success: true,
    data: user,
  });
});

// Update user profile
export const updateProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, bio, avatar, preferences } = req.body;

  const user = await User.findById(req.user.id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Update fields
  if (firstName !== undefined) user.firstName = firstName;
  if (lastName !== undefined) user.lastName = lastName;
  if (bio !== undefined) user.bio = bio;
  if (avatar !== undefined) user.avatar = avatar;
  if (preferences !== undefined) user.preferences = preferences;

  await user.save();

  // Return updated user without sensitive data
  const updatedUser = await User.findById(user._id)
    .select('-password -refreshTokens')
    .populate('followers', 'username firstName lastName avatar')
    .populate('following', 'username firstName lastName avatar');

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: updatedUser,
  });
});

// Change password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Verify current password
  const isPasswordValid = await user.comparePassword(currentPassword);
  if (!isPasswordValid) {
    throw new AppError('Current password is incorrect', 400);
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password changed successfully',
  });
});

// Delete user account
export const deleteAccount = asyncHandler(async (req, res) => {
  const { password } = req.body;

  const user = await User.findById(req.user.id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Verify password before deletion
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new AppError('Password is incorrect', 400);
  }

  // Delete user's articles (or mark as deleted)
  await Article.updateMany(
    { author: user._id },
    { status: 'deleted', isPublished: false }
  );

  // Delete user
  await User.findByIdAndDelete(user._id);

  res.json({
    success: true,
    message: 'Account deleted successfully',
  });
});

// Get user's articles
export const getUserArticles = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
  const userId = req.user.id;

  const query = { author: userId };
  if (status && status !== 'all') {
    query.status = status;
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const skip = (page - 1) * limit;

  const [articles, total] = await Promise.all([
    Article.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'username firstName lastName avatar')
      .populate('category', 'name'),
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

// Get user stats
export const getUserStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const [
    totalArticles,
    publishedArticles,
    pendingArticles,
    draftArticles,
    totalViews,
    totalLikes,
    totalComments,
  ] = await Promise.all([
    Article.countDocuments({ author: userId }),
    Article.countDocuments({ author: userId, status: 'approved', isPublished: true }),
    Article.countDocuments({ author: userId, status: 'pending' }),
    Article.countDocuments({ author: userId, status: 'draft' }),
    Article.aggregate([
      { $match: { author: userId } },
      { $group: { _id: null, totalViews: { $sum: '$views' } } },
    ]),
    Article.aggregate([
      { $match: { author: userId } },
      { $group: { _id: null, totalLikes: { $sum: '$likes' } } },
    ]),
    Article.aggregate([
      { $match: { author: userId } },
      { $group: { _id: null, totalComments: { $sum: '$comments' } } },
    ]),
  ]);

  const stats = {
    totalArticles,
    publishedArticles,
    pendingArticles,
    draftArticles,
    totalViews: totalViews[0]?.totalViews || 0,
    totalLikes: totalLikes[0]?.totalLikes || 0,
    totalComments: totalComments[0]?.totalComments || 0,
  };

  res.json({
    success: true,
    data: stats,
  });
});

// Follow a user
export const followUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user.id;

  if (currentUserId === userId) {
    throw new AppError('You cannot follow yourself', 400);
  }

  const [currentUser, userToFollow] = await Promise.all([
    User.findById(currentUserId),
    User.findById(userId),
  ]);

  if (!currentUser || !userToFollow) {
    throw new AppError('User not found', 404);
  }

  if (!userToFollow.isActive) {
    throw new AppError('Cannot follow inactive user', 400);
  }

  // Check if already following
  if (currentUser.following.includes(userId)) {
    throw new AppError('Already following this user', 400);
  }

  // Add to following/followers
  currentUser.following.push(userId);
  userToFollow.followers.push(currentUserId);

  await Promise.all([currentUser.save(), userToFollow.save()]);

  res.json({
    success: true,
    message: `You are now following ${userToFollow.username}`,
  });
});

// Unfollow a user
export const unfollowUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user.id;

  const [currentUser, userToUnfollow] = await Promise.all([
    User.findById(currentUserId),
    User.findById(userId),
  ]);

  if (!currentUser || !userToUnfollow) {
    throw new AppError('User not found', 404);
  }

  // Remove from following/followers
  currentUser.following = currentUser.following.filter(id => id.toString() !== userId);
  userToUnfollow.followers = userToUnfollow.followers.filter(id => id.toString() !== currentUserId);

  await Promise.all([currentUser.save(), userToUnfollow.save()]);

  res.json({
    success: true,
    message: `You have unfollowed ${userToUnfollow.username}`,
  });
});

// Get user's followers
export const getFollowers = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 20 } = req.query;

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const skip = (page - 1) * limit;

  const followers = await User.find({ _id: { $in: user.followers } })
    .select('username firstName lastName avatar bio')
    .skip(skip)
    .limit(parseInt(limit));

  const total = user.followers.length;
  const totalPages = Math.ceil(total / limit);

  res.json({
    success: true,
    data: followers,
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

// Get users that a user is following
export const getFollowing = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 20 } = req.query;

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const skip = (page - 1) * limit;

  const following = await User.find({ _id: { $in: user.following } })
    .select('username firstName lastName avatar bio')
    .skip(skip)
    .limit(parseInt(limit));

  const total = user.following.length;
  const totalPages = Math.ceil(total / limit);

  res.json({
    success: true,
    data: following,
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

// Search users
export const searchUsers = asyncHandler(async (req, res) => {
  const { q: query, page = 1, limit = 20 } = req.query;

  if (!query || query.trim().length < 2) {
    throw new AppError('Search query must be at least 2 characters', 400);
  }

  const searchRegex = new RegExp(query.trim(), 'i');
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find({
      $or: [
        { username: searchRegex },
        { firstName: searchRegex },
        { lastName: searchRegex },
        { bio: searchRegex },
      ],
      isActive: true,
    })
      .select('username firstName lastName avatar bio')
      .skip(skip)
      .limit(parseInt(limit)),
    User.countDocuments({
      $or: [
        { username: searchRegex },
        { firstName: searchRegex },
        { lastName: searchRegex },
        { bio: searchRegex },
      ],
      isActive: true,
    }),
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

// Get user by ID (for admin/moderator)
export const getUserById = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  const user = await User.findById(userId)
    .select('-password -refreshTokens')
    .populate('followers', 'username firstName lastName avatar')
    .populate('following', 'username firstName lastName avatar');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  req.userData = user;
  next();
});

// Get public user profile
export const getPublicProfile = asyncHandler(async (req, res) => {
  const user = req.userData;

  // Get user's published articles
  const articles = await Article.find({
    author: user._id,
    status: 'approved',
    isPublished: true,
  })
    .select('title slug excerpt coverImage publishedAt views likes comments')
    .sort({ publishedAt: -1 })
    .limit(5);

  const publicProfile = {
    _id: user._id,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    bio: user.bio,
    avatar: user.avatar,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
    articles,
  };

  res.json({
    success: true,
    data: publicProfile,
  });
});
