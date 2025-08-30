import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    minlength: [1, 'Comment cannot be empty'],
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  article: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
    required: true
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  // Moderation fields
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'hidden'],
    default: 'approved'
  },
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderationDate: Date,
  moderationReason: {
    type: String,
    maxlength: [500, 'Moderation reason cannot exceed 500 characters']
  },
  // Engagement
  likes: {
    type: Number,
    default: 0
  },
  dislikes: {
    type: Number,
    default: 0
  },
  // Flags for inappropriate content
  isFlagged: {
    type: Boolean,
    default: false
  },
  flagCount: {
    type: Number,
    default: 0
  },
  flaggedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['spam', 'inappropriate', 'harassment', 'other'],
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Metadata
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  editHistory: [{
    content: String,
    editedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // SEO and analytics
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for is reply
commentSchema.virtual('isReply').get(function() {
  return !!this.parentComment;
});

// Virtual for reply count
commentSchema.virtual('replyCount').get(function() {
  return this.replies?.length || 0;
});

// Virtual for total engagement
commentSchema.virtual('totalEngagement').get(function() {
  return this.likes + this.dislikes;
});

// Virtual for approval status
commentSchema.virtual('isApproved').get(function() {
  return this.status === 'approved';
});

// Indexes for better query performance
commentSchema.index({ article: 1 });
commentSchema.index({ author: 1 });
commentSchema.index({ parentComment: 1 });
commentSchema.index({ status: 1 });
commentSchema.index({ createdAt: -1 });
commentSchema.index({ isFlagged: 1 });
commentSchema.index({ likes: -1 });

// Compound indexes
commentSchema.index({ article: 1, status: 1 });
commentSchema.index({ article: 1, parentComment: 1 });
commentSchema.index({ author: 1, status: 1 });

// Pre-save middleware to handle content sanitization
commentSchema.pre('save', function(next) {
  // Basic content sanitization (remove HTML tags)
  if (this.isModified('content')) {
    this.content = this.content.replace(/<[^>]*>/g, '');
  }
  
  // Update edit history if content changed
  if (this.isModified('content') && !this.isNew) {
    if (!this.editHistory) this.editHistory = [];
    
    // Store previous content in edit history
    const previousContent = this.editHistory.length > 0 
      ? this.editHistory[this.editHistory.length - 1].content 
      : this.content;
    
    this.editHistory.push({
      content: previousContent,
      editedAt: new Date()
    });
    
    this.isEdited = true;
    this.editedAt = new Date();
  }
  
  next();
});

// Pre-save middleware to handle moderation
commentSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status !== 'approved') {
    this.moderationDate = new Date();
  }
  
  next();
});

// Instance method to approve comment
commentSchema.methods.approve = function(moderatorId) {
  this.status = 'approved';
  this.moderatedBy = moderatorId;
  this.moderationDate = new Date();
  return this.save();
};

// Instance method to reject comment
commentSchema.methods.reject = function(moderatorId, reason) {
  this.status = 'rejected';
  this.moderatedBy = moderatorId;
  this.moderationDate = new Date();
  this.moderationReason = reason;
  return this.save();
};

// Instance method to hide comment
commentSchema.methods.hide = function(moderatorId) {
  this.status = 'hidden';
  this.moderatedBy = moderatorId;
  this.moderationDate = new Date();
  return this.save();
};

// Instance method to add reply
commentSchema.methods.addReply = function(replyId) {
  if (!this.replies.includes(replyId)) {
    this.replies.push(replyId);
    return this.save();
  }
  return Promise.resolve(this);
};

// Instance method to remove reply
commentSchema.methods.removeReply = function(replyId) {
  this.replies = this.replies.filter(id => id.toString() !== replyId.toString());
  return this.save();
};

// Instance method to flag comment
commentSchema.methods.flag = function(userId, reason) {
  // Check if user already flagged
  const existingFlag = this.flaggedBy.find(flag => 
    flag.user.toString() === userId.toString()
  );
  
  if (existingFlag) {
    // Update existing flag
    existingFlag.reason = reason;
    existingFlag.createdAt = new Date();
  } else {
    // Add new flag
    this.flaggedBy.push({
      user: userId,
      reason,
      createdAt: new Date()
    });
    this.flagCount += 1;
  }
  
  // Auto-flag if threshold reached
  if (this.flagCount >= 3) {
    this.isFlagged = true;
  }
  
  return this.save();
};

// Instance method to unflag comment
commentSchema.methods.unflag = function(userId) {
  this.flaggedBy = this.flaggedBy.filter(flag => 
    flag.user.toString() !== userId.toString()
  );
  this.flagCount = this.flaggedBy.length;
  
  if (this.flagCount < 3) {
    this.isFlagged = false;
  }
  
  return this.save();
};

// Instance method to like comment
commentSchema.methods.like = function() {
  this.likes += 1;
  return this.save();
};

// Instance method to unlike comment
commentSchema.methods.unlike = function() {
  if (this.likes > 0) {
    this.likes -= 1;
  }
  return this.save();
};

// Instance method to dislike comment
commentSchema.methods.dislike = function() {
  this.dislikes += 1;
  return this.save();
};

// Instance method to undislike comment
commentSchema.methods.undislike = function() {
  if (this.dislikes > 0) {
    this.dislikes -= 1;
  }
  return this.save();
};

// Static method to find approved comments
commentSchema.statics.findApproved = function() {
  return this.find({ status: 'approved' });
};

// Static method to find pending comments
commentSchema.statics.findPending = function() {
  return this.find({ status: 'pending' });
};

// Static method to find flagged comments
commentSchema.statics.findFlagged = function() {
  return this.find({ isFlagged: true });
};

// Static method to find comments by article
commentSchema.statics.findByArticle = function(articleId, options = {}) {
  const query = { article: articleId, status: 'approved' };
  
  if (options.parentOnly) {
    query.parentComment = null;
  }
  
  return this.find(query)
    .populate('author', 'username firstName lastName avatar')
    .populate('replies')
    .sort({ createdAt: options.sort || -1 });
};

// Static method to find replies to a comment
commentSchema.statics.findReplies = function(commentId) {
  return this.find({ parentComment: commentId, status: 'approved' })
    .populate('author', 'username firstName lastName avatar')
    .sort({ createdAt: 1 });
};

// Static method to count comments by article
commentSchema.statics.countByArticle = function(articleId) {
  return this.countDocuments({ article: articleId, status: 'approved' });
};

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
