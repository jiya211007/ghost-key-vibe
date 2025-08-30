import Article from '../models/Article.js';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { AppError } from '../middleware/errorHandler.js';
import slugify from 'slugify';
import { sendEmail } from '../config/mailer.js';

// Create a new article
export const createArticle = asyncHandler(async (req, res) => {
  const { title, excerpt, content, category, tags } = req.body;
  const authorId = req.user.id;
  
  // Debug: Log the received data
  console.log('Received article data:', {
    title,
    excerpt: excerpt?.substring(0, 50) + '...',
    content: content?.substring(0, 50) + '...',
    category,
    tags: tags,
    tagsType: typeof tags,
    tagsIsArray: Array.isArray(tags)
  });

  // Generate slug from title
  const slug = slugify(title, { lower: true, strict: true });

  // Check if slug already exists
  const existingArticle = await Article.findOne({ slug });
  if (existingArticle) {
    throw new AppError('An article with this title already exists', 400);
  }

  // Process tags - handle multiple input formats
  let processedTags = [];
  
  // Check if we have individual tag fields (tags[0], tags[1], etc.)
  const tagFields = Object.keys(req.body).filter(key => key.startsWith('tags['));
  if (tagFields.length > 0) {
    // Extract tags from individual fields
    processedTags = tagFields
      .map(key => req.body[key])
      .map(tag => String(tag).trim())
      .filter(tag => tag.length > 0);
  } else if (tags) {
    // Handle regular tags field
    if (typeof tags === 'string') {
      // If tags is a string, split by comma
      processedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    } else if (Array.isArray(tags)) {
      // If tags is already an array, just clean it up
      processedTags = tags.map(tag => String(tag).trim()).filter(tag => tag.length > 0);
    } else if (typeof tags === 'object') {
      // If tags is an object, convert to array
      processedTags = Object.values(tags).map(tag => String(tag).trim()).filter(tag => tag.length > 0);
    }
  }
  
  console.log('Processed tags:', processedTags);

  // Calculate reading time and word count
  const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length;
  const readingTime = Math.ceil(wordCount / 200); // Assuming 200 words per minute

  // Create article
  const article = new Article({
    title,
    slug,
    excerpt,
    content,
    author: authorId,
    category,
    tags: processedTags,
    coverImage: req.file ? req.file.path : null,
    wordCount,
    readingTime,
    status: 'approved', // Auto-approve for demo purposes
    isPublished: true,
    publishedAt: new Date(),
    approvalDate: new Date()
  });

  await article.save();

  // Populate author information
  await article.populate('author', 'username firstName lastName avatar');

  // Send email notification to admin/moderators (if email service is configured)
  try {
    const admins = await User.find({ role: { $in: ['admin', 'moderator'] } });
    for (const admin of admins) {
      await sendEmail({
        to: admin.email,
        subject: 'New Article Submission',
        template: 'article_submitted',
        context: {
          adminName: admin.firstName || admin.username,
          articleTitle: title,
          authorName: req.user.firstName || req.user.username,
          articleUrl: `${process.env.CLIENT_URL}/admin/articles/${article._id}`,
        },
      });
    }
  } catch (error) {
    console.error('Failed to send email notification:', error);
  }

  console.log('Created article:', {
    id: article._id,
    slug: article.slug,
    title: article.title,
    status: article.status
  });

  res.status(201).json({
    success: true,
    message: 'Article created and published successfully!',
    data: {
      article: article
    },
  });
});

// Get all articles with filtering and pagination
export const getAllArticles = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    status = 'approved',
    category,
    tag,
    sortBy = 'publishedAt',
    sortOrder = 'desc',
    featured,
  } = req.query;

  // Build query
  const query = {};
  
  // Show all published articles universally (for demo purposes)
  query.isPublished = true;
  // Remove status restriction for universal visibility
  // if (status === 'approved') {
  //   query.status = 'approved';
  // }

  if (category) {
    query.category = category;
  }

  if (tag) {
    query.tags = { $in: [tag] };
  }

  if (featured === 'true') {
    query.isFeatured = true;
  }

  // Build sort options
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const skip = (page - 1) * limit;

  const [articles, total] = await Promise.all([
    Article.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'username firstName lastName avatar')
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

// Get article by slug
export const getArticleBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  // Allow universal access to all published articles
  const article = await Article.findOne({ 
    slug,
    isPublished: true
  })
    .populate('author', 'username firstName lastName avatar bio')
    .populate('category', 'name');

  if (!article) {
    throw new AppError('Article not found', 404);
  }

  res.json({
    success: true,
    data: article,
  });
});

// Update article
export const updateArticle = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const { title, excerpt, content, category, tags } = req.body;
  const userId = req.user.id;

  const article = await Article.findOne({ slug });
  if (!article) {
    throw new AppError('Article not found', 404);
  }

  // Check ownership or admin rights
  if (article.author.toString() !== userId && req.user.role !== 'admin') {
    throw new AppError('You can only edit your own articles', 403);
  }

  // Generate new slug if title changed
  let newSlug = article.slug;
  if (title && title !== article.title) {
    newSlug = slugify(title, { lower: true, strict: true });
    
    // Check if new slug already exists
    const existingArticle = await Article.findOne({ slug: newSlug, _id: { $ne: article._id } });
    if (existingArticle) {
      throw new AppError('An article with this title already exists', 400);
    }
  }

  // Process tags
  const processedTags = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

  // Calculate new reading time and word count
  const wordCount = content ? content.trim().split(/\s+/).filter(word => word.length > 0).length : article.wordCount;
  const readingTime = Math.ceil(wordCount / 200);

  // Update article
  article.title = title || article.title;
  article.slug = newSlug;
  article.excerpt = excerpt || article.excerpt;
  article.content = content || article.content;
  article.category = category || article.category;
  article.tags = processedTags.length > 0 ? processedTags : article.tags;
  article.coverImage = req.file ? req.file.path : article.coverImage;
  article.wordCount = wordCount;
  article.readingTime = readingTime;
  article.status = 'pending'; // Reset to pending for review
  article.updatedAt = new Date();

  await article.save();

  // Populate author information
  await article.populate('author', 'username firstName lastName avatar');

  res.json({
    success: true,
    message: 'Article updated successfully and submitted for review',
    data: article,
  });
});

// Delete article
export const deleteArticle = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const userId = req.user.id;

  const article = await Article.findOne({ slug });
  if (!article) {
    throw new AppError('Article not found', 404);
  }

  // Check ownership or admin rights
  if (article.author.toString() !== userId && req.user.role !== 'admin') {
    throw new AppError('You can only delete your own articles', 403);
  }

  await Article.findByIdAndDelete(article._id);

  res.json({
    success: true,
    message: 'Article deleted successfully',
  });
});

// Approve article
export const approveArticle = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const { moderationNotes } = req.body;
  const moderatorId = req.user.id;

  const article = await Article.findOne({ slug });
  if (!article) {
    throw new AppError('Article not found', 404);
  }

  article.status = 'approved';
  article.approvalDate = new Date();
  article.approvedBy = moderatorId;
  article.isPublished = true;
  article.publishedAt = new Date();
  if (moderationNotes) {
    article.moderationNotes = moderationNotes;
  }

  await article.save();

  // Send email notification to author
  try {
    const author = await User.findById(article.author);
    if (author) {
      await sendEmail({
        to: author.email,
        subject: 'Your Article Has Been Approved!',
        template: 'article_approved',
        context: {
          authorName: author.firstName || author.username,
          articleTitle: article.title,
          articleUrl: `${process.env.CLIENT_URL}/article/${article.slug}`,
        },
      });
    }
  } catch (error) {
    console.error('Failed to send approval email:', error);
  }

  res.json({
    success: true,
    message: 'Article approved successfully',
    data: article,
  });
});

// Reject article
export const rejectArticle = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const { rejectionReason } = req.body;
  const moderatorId = req.user.id;

  if (!rejectionReason) {
    throw new AppError('Rejection reason is required', 400);
  }

  const article = await Article.findOne({ slug });
  if (!article) {
    throw new AppError('Article not found', 404);
  }

  article.status = 'rejected';
  article.rejectionReason = rejectionReason;
  article.rejectedBy = moderatorId;
  article.rejectedAt = new Date();
  article.isPublished = false;

  await article.save();

  // Send email notification to author
  try {
    const author = await User.findById(article.author);
    if (author) {
      await sendEmail({
        to: author.email,
        subject: 'Article Review Update',
        template: 'article_rejected',
        context: {
          authorName: author.firstName || author.username,
          articleTitle: article.title,
          rejectionReason,
          articleUrl: `${process.env.CLIENT_URL}/article/${article.slug}/edit`,
        },
      });
    }
  } catch (error) {
    console.error('Failed to send rejection email:', error);
  }

  res.json({
    success: true,
    message: 'Article rejected successfully',
    data: article,
  });
});

// Hide article
export const hideArticle = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const { reason } = req.body;

  const article = await Article.findOne({ slug });
  if (!article) {
    throw new AppError('Article not found', 404);
  }

  article.isPublished = false;
  if (reason) {
    article.moderationNotes = reason;
  }

  await article.save();

  res.json({
    success: true,
    message: 'Article hidden successfully',
    data: article,
  });
});

// Feature article
export const featureArticle = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const article = await Article.findOne({ slug });
  if (!article) {
    throw new AppError('Article not found', 404);
  }

  article.isFeatured = !article.isFeatured;
  await article.save();

  res.json({
    success: true,
    message: article.isFeatured ? 'Article featured successfully' : 'Article unfeatured successfully',
    data: article,
  });
});

// Increment article views
export const incrementViews = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const article = await Article.findOne({ slug });
  if (!article) {
    throw new AppError('Article not found', 404);
  }

  article.views += 1;
  await article.save();

  res.json({
    success: true,
    message: 'View count updated',
  });
});

// Get trending articles
export const getTrendingArticles = asyncHandler(async (req, res) => {
  const { limit = 10, timeframe = '7d' } = req.query;

  let dateFilter = {};
  const now = new Date();

  switch (timeframe) {
    case '24h':
      dateFilter = { publishedAt: { $gte: new Date(now - 24 * 60 * 60 * 1000) } };
      break;
    case '7d':
      dateFilter = { publishedAt: { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) } };
      break;
    case '30d':
      dateFilter = { publishedAt: { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) } };
      break;
    default:
      dateFilter = { publishedAt: { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) } };
  }

  const articles = await Article.find({
    status: 'approved',
    isPublished: true,
    ...dateFilter,
  })
    .sort({ views: -1, likes: -1, comments: -1 })
    .limit(parseInt(limit))
    .populate('author', 'username firstName lastName avatar')
    .select('-content');

  res.json({
    success: true,
    data: articles,
  });
});

// Get related articles
export const getRelatedArticles = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const { limit = 5 } = req.query;

  const article = await Article.findOne({ slug });
  if (!article) {
    throw new AppError('Article not found', 404);
  }

  const relatedArticles = await Article.find({
    _id: { $ne: article._id },
    status: 'approved',
    isPublished: true,
    $or: [
      { category: article.category },
      { tags: { $in: article.tags } },
      { author: article.author },
    ],
  })
    .sort({ publishedAt: -1, views: -1 })
    .limit(parseInt(limit))
    .populate('author', 'username firstName lastName avatar')
    .select('-content');

  res.json({
    success: true,
    data: relatedArticles,
  });
});

// Search articles
export const searchArticles = asyncHandler(async (req, res) => {
  const { q: query, page = 1, limit = 12, category, tag, sortBy = 'relevance' } = req.query;

  if (!query || query.trim().length < 2) {
    throw new AppError('Search query must be at least 2 characters', 400);
  }

  const searchRegex = new RegExp(query.trim(), 'i');
  const skip = (page - 1) * limit;

  // Build search query
  const searchQuery = {
    status: 'approved',
    isPublished: true,
    $or: [
      { title: searchRegex },
      { excerpt: searchRegex },
      { content: searchRegex },
      { tags: searchRegex },
    ],
  };

  if (category) {
    searchQuery.category = category;
  }

  if (tag) {
    searchQuery.tags = { $in: [tag] };
  }

  // Build sort options
  let sortOptions = {};
  if (sortBy === 'relevance') {
    // Custom relevance scoring based on search matches
    sortOptions = { score: { $meta: 'textScore' } };
  } else if (sortBy === 'date') {
    sortOptions = { publishedAt: -1 };
  } else if (sortBy === 'views') {
    sortOptions = { views: -1 };
  } else if (sortBy === 'likes') {
    sortOptions = { likes: -1 };
  }

  const [articles, total] = await Promise.all([
    Article.find(searchQuery)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'username firstName lastName avatar')
      .select('-content'),
    Article.countDocuments(searchQuery),
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

// Get articles by category
export const getArticlesByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const { page = 1, limit = 12, sortBy = 'publishedAt', sortOrder = 'desc' } = req.query;

  const query = {
    category,
    status: 'approved',
    isPublished: true,
  };

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const skip = (page - 1) * limit;

  const [articles, total] = await Promise.all([
    Article.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'username firstName lastName avatar')
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

// Get articles by tag
export const getArticlesByTag = asyncHandler(async (req, res) => {
  const { tag } = req.params;
  const { page = 1, limit = 12, sortBy = 'publishedAt', sortOrder = 'desc' } = req.query;

  const query = {
    tags: { $in: [tag] },
    status: 'approved',
    isPublished: true,
  };

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const skip = (page - 1) * limit;

  const [articles, total] = await Promise.all([
    Article.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'username firstName lastName avatar')
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

// Get articles by author
export const getArticlesByAuthor = asyncHandler(async (req, res) => {
  const { authorId } = req.params;
  const { page = 1, limit = 12, sortBy = 'publishedAt', sortOrder = 'desc' } = req.query;

  const query = {
    author: authorId,
    status: 'approved',
    isPublished: true,
  };

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const skip = (page - 1) * limit;

  const [articles, total] = await Promise.all([
    Article.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'username firstName lastName avatar')
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
