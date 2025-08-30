import mongoose from 'mongoose';
import slugify from 'slugify';

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [10, 'Title must be at least 10 characters'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    minlength: [100, 'Content must be at least 100 characters']
  },
  excerpt: {
    type: String,
    maxlength: [300, 'Excerpt cannot exceed 300 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Technology',
      'Programming',
      'Design',
      'Business',
      'Marketing',
      'Productivity',
      'Career',
      'Education',
      'Health',
      'Lifestyle',
      'Other'
    ]
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [20, 'Tag cannot exceed 20 characters']
  }],
  coverImage: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected', 'hidden'],
    default: 'pending'
  },
  approvalDate: {
    type: Date
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectionReason: {
    type: String,
    maxlength: [500, 'Rejection reason cannot exceed 500 characters']
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  featuredAt: {
    type: Date
  },
  // Engagement metrics
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  comments: {
    type: Number,
    default: 0
  },
  shares: {
    type: Number,
    default: 0
  },
  // SEO fields
  metaTitle: {
    type: String,
    maxlength: [60, 'Meta title cannot exceed 60 characters']
  },
  metaDescription: {
    type: String,
    maxlength: [160, 'Meta description cannot exceed 160 characters']
  },
  // Reading time estimation
  readingTime: {
    type: Number,
    default: 0
  },
  // Content statistics
  wordCount: {
    type: Number,
    default: 0
  },
  // Moderation fields
  moderationNotes: [{
    note: String,
    moderator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full URL
articleSchema.virtual('url').get(function() {
  return `/articles/${this.slug}`;
});

// Virtual for author name
articleSchema.virtual('authorName').get(function() {
  return this.author?.fullName || this.author?.username || 'Unknown Author';
});

// Virtual for approval status
articleSchema.virtual('isApproved').get(function() {
  return this.status === 'approved';
});

// Virtual for is public
articleSchema.virtual('isPublic').get(function() {
  return this.status === 'approved' && this.isPublished;
});

// Indexes for better query performance
articleSchema.index({ slug: 1 });
articleSchema.index({ author: 1 });
articleSchema.index({ status: 1 });
articleSchema.index({ category: 1 });
articleSchema.index({ tags: 1 });
articleSchema.index({ isPublished: 1 });
articleSchema.index({ publishedAt: -1 });
articleSchema.index({ createdAt: -1 });
articleSchema.index({ views: -1 });
articleSchema.index({ likes: -1 });
articleSchema.index({ isFeatured: 1 });

// Compound indexes for common queries
articleSchema.index({ status: 1, isPublished: 1 });
articleSchema.index({ category: 1, status: 1 });
articleSchema.index({ author: 1, status: 1 });

// Pre-save middleware to generate slug
articleSchema.pre('save', function(next) {
  if (!this.isModified('title')) return next();
  
  // Generate slug from title
  this.slug = slugify(this.title, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g
  });
  
  // Ensure slug uniqueness by adding timestamp if needed
  if (this.isNew) {
    this.slug = `${this.slug}-${Date.now()}`;
  }
  
  next();
});

// Pre-save middleware to calculate reading time and word count
articleSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    // Calculate word count (rough estimation)
    const words = this.content.trim().split(/\s+/).length;
    this.wordCount = words;
    
    // Calculate reading time (average 200 words per minute)
    this.readingTime = Math.ceil(words / 200);
  }
  
  // Generate excerpt if not provided
  if (!this.excerpt && this.content) {
    this.excerpt = this.content.substring(0, 300).replace(/\s+\S*$/, '') + '...';
  }
  
  next();
});

// Pre-save middleware to handle approval
articleSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'approved') {
    this.approvalDate = new Date();
    this.isPublished = true;
    this.publishedAt = new Date();
  }
  
  if (this.isModified('status') && this.status === 'rejected') {
    this.isPublished = false;
    this.publishedAt = undefined;
  }
  
  next();
});

// Instance method to increment views
articleSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Instance method to update engagement counts
articleSchema.methods.updateEngagementCounts = function() {
  return this.model('Like').countDocuments({ article: this._id, isActive: true })
    .then(likeCount => {
      this.likes = likeCount;
      return this.model('Comment').countDocuments({ article: this._id, isActive: true });
    })
    .then(commentCount => {
      this.comments = commentCount;
      return this.save();
    });
};

// Instance method to approve article
articleSchema.methods.approve = function(moderatorId) {
  this.status = 'approved';
  this.approvedBy = moderatorId;
  this.approvalDate = new Date();
  this.isPublished = true;
  this.publishedAt = new Date();
  return this.save();
};

// Instance method to reject article
articleSchema.methods.reject = function(moderatorId, reason) {
  this.status = 'rejected';
  this.rejectionReason = reason;
  this.isPublished = false;
  this.publishedAt = undefined;
  return this.save();
};

// Instance method to hide article
articleSchema.methods.hide = function() {
  this.status = 'hidden';
  this.isPublished = false;
  return this.save();
};

// Instance method to feature article
articleSchema.methods.feature = function() {
  this.isFeatured = true;
  this.featuredAt = new Date();
  return this.save();
};

// Instance method to unfeature article
articleSchema.methods.unfeature = function() {
  this.isFeatured = false;
  this.featuredAt = undefined;
  return this.save();
};

// Static method to find published articles
articleSchema.statics.findPublished = function() {
  return this.find({ status: 'approved', isPublished: true });
};

// Static method to find pending articles
articleSchema.statics.findPending = function() {
  return this.find({ status: 'pending' });
};

// Static method to find trending articles
articleSchema.statics.findTrending = function(limit = 10) {
  return this.find({ status: 'approved', isPublished: true })
    .sort({ views: -1, likes: -1, createdAt: -1 })
    .limit(limit);
};

// Static method to find featured articles
articleSchema.statics.findFeatured = function(limit = 5) {
  return this.find({ status: 'approved', isPublished: true, isFeatured: true })
    .sort({ featuredAt: -1 })
    .limit(limit);
};

// Static method to find articles by category
articleSchema.statics.findByCategory = function(category, limit = 20) {
  return this.find({ status: 'approved', isPublished: true, category })
    .sort({ publishedAt: -1 })
    .limit(limit);
};

// Static method to search articles
articleSchema.statics.search = function(query, limit = 20) {
  const searchRegex = new RegExp(query, 'i');
  return this.find({
    status: 'approved',
    isPublished: true,
    $or: [
      { title: searchRegex },
      { content: searchRegex },
      { tags: searchRegex },
      { category: searchRegex }
    ]
  })
  .sort({ publishedAt: -1 })
  .limit(limit);
};

const Article = mongoose.model('Article', articleSchema);

export default Article;
