import mongoose from 'mongoose';

const likeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetType: {
    type: String,
    enum: ['article', 'comment'],
    required: true
  },
  target: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'targetType'
  },
  // Like type (can be extended for different reaction types)
  type: {
    type: String,
    enum: ['like', 'love', 'helpful', 'insightful'],
    default: 'like'
  },
  // Status for moderation
  isActive: {
    type: Boolean,
    default: true
  },
  // Metadata
  ipAddress: String,
  userAgent: String,
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Virtual for target reference
likeSchema.virtual('targetRef').get(function() {
  return this.targetType === 'article' ? 'Article' : 'Comment';
});

// Indexes for better query performance
likeSchema.index({ user: 1, targetType: 1, target: 1 }, { unique: true });
likeSchema.index({ targetType: 1, target: 1 });
likeSchema.index({ user: 1 });
likeSchema.index({ isActive: 1 });
likeSchema.index({ createdAt: -1 });

// Compound indexes for common queries
likeSchema.index({ targetType: 1, target: 1, isActive: 1 });
likeSchema.index({ user: 1, isActive: 1 });

// Pre-save middleware to update timestamps
likeSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Instance method to toggle like
likeSchema.methods.toggle = function() {
  this.isActive = !this.isActive;
  return this.save();
};

// Instance method to activate like
likeSchema.methods.activate = function() {
  this.isActive = true;
  return this.save();
};

// Instance method to deactivate like
likeSchema.methods.deactivate = function() {
  this.isActive = false;
  return this.save();
};

// Static method to find active likes
likeSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

// Static method to find likes by target
likeSchema.statics.findByTarget = function(targetType, targetId, options = {}) {
  const query = { targetType, target: targetId };
  
  if (options.activeOnly !== false) {
    query.isActive = true;
  }
  
  return this.find(query)
    .populate('user', 'username firstName lastName avatar')
    .sort({ createdAt: options.sort || -1 });
};

// Static method to find likes by user
likeSchema.statics.findByUser = function(userId, options = {}) {
  const query = { user: userId };
  
  if (options.activeOnly !== false) {
    query.isActive = true;
  }
  
  if (options.targetType) {
    query.targetType = options.targetType;
  }
  
  return this.find(query)
    .populate('target', 'title content')
    .sort({ createdAt: options.sort || -1 });
};

// Static method to check if user liked target
likeSchema.statics.hasUserLiked = function(userId, targetType, targetId) {
  return this.findOne({ user: userId, targetType, target: targetId, isActive: true });
};

// Static method to count likes by target
likeSchema.statics.countByTarget = function(targetType, targetId) {
  return this.countDocuments({ targetType, target: targetId, isActive: true });
};

// Static method to count likes by user
likeSchema.statics.countByUser = function(userId, targetType = null) {
  const query = { user: userId, isActive: true };
  
  if (targetType) {
    query.targetType = targetType;
  }
  
  return this.countDocuments(query);
};

// Static method to get like statistics
likeSchema.statics.getStats = function(targetType, targetId) {
  return this.aggregate([
    { $match: { targetType, target: new mongoose.Types.ObjectId(targetId), isActive: true } },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 }
      }
    }
  ]);
};

// Static method to remove all likes by user
likeSchema.statics.removeByUser = function(userId) {
  return this.updateMany(
    { user: userId },
    { isActive: false }
  );
};

// Static method to remove all likes for target
likeSchema.statics.removeByTarget = function(targetType, targetId) {
  return this.updateMany(
    { targetType, target: targetId },
    { isActive: false }
  );
};

// Static method to get popular targets
likeSchema.statics.getPopularTargets = function(targetType, limit = 10) {
  return this.aggregate([
    { $match: { targetType, isActive: true } },
    {
      $group: {
        _id: '$target',
        likeCount: { $sum: 1 }
      }
    },
    { $sort: { likeCount: -1 } },
    { $limit: limit }
  ]);
};

// Static method to get user's liked content
likeSchema.statics.getUserLikedContent = function(userId, targetType, limit = 20) {
  return this.find({ user: userId, targetType, isActive: true })
    .populate('target')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get recent likes
likeSchema.statics.getRecentLikes = function(targetType = null, limit = 20) {
  const query = { isActive: true };
  
  if (targetType) {
    query.targetType = targetType;
  }
  
  return this.find(query)
    .populate('user', 'username firstName lastName avatar')
    .populate('target', 'title content')
    .sort({ createdAt: -1 })
    .limit(limit);
};

const Like = mongoose.model('Like', likeSchema);

export default Like;
