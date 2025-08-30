import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: [
      'article_approved',
      'article_rejected',
      'article_featured',
      'comment_received',
      'comment_replied',
      'like_received',
      'follow_received',
      'mention_received',
      'system_announcement'
    ],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  message: {
    type: String,
    required: true,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  // Related content references
  article: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article'
  },
  comment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  },
  like: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Like'
  },
  // Notification status
  isRead: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  // Priority levels
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  // Action data for interactive notifications
  actionUrl: String,
  actionText: String,
  // Metadata
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  // Expiration for time-sensitive notifications
  expiresAt: Date,
  // Email notification tracking
  emailSent: {
    type: Boolean,
    default: false
  },
  emailSentAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for notification age
notificationSchema.virtual('age').get(function() {
  const now = new Date();
  const diff = now - this.createdAt;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
});

// Virtual for is expired
notificationSchema.virtual('isExpired').get(function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
});

// Virtual for notification icon
notificationSchema.virtual('icon').get(function() {
  const iconMap = {
    article_approved: '✅',
    article_rejected: '❌',
    article_featured: '⭐',
    comment_received: '💬',
    comment_replied: '↩️',
    like_received: '❤️',
    follow_received: '👥',
    mention_received: '📢',
    system_announcement: '📢'
  };
  return iconMap[this.type] || '📌';
});

// Indexes for better query performance
notificationSchema.index({ recipient: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ isArchived: 1 });
notificationSchema.index({ priority: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ expiresAt: 1 });

// Compound indexes for common queries
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, isArchived: 1 });
notificationSchema.index({ recipient: 1, type: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });

// Pre-save middleware to handle expiration
notificationSchema.pre('save', function(next) {
  // Set default expiration for certain notification types
  if (!this.expiresAt) {
    const expirationMap = {
      article_approved: 30, // 30 days
      article_rejected: 7,  // 7 days
      article_featured: 60, // 60 days
      comment_received: 14, // 14 days
      comment_replied: 14,  // 14 days
      like_received: 7,     // 7 days
      follow_received: 30,  // 30 days
      mention_received: 7,  // 7 days
      system_announcement: 90 // 90 days
    };
    
    if (expirationMap[this.type]) {
      this.expiresAt = new Date();
      this.expiresAt.setDate(this.expiresAt.getDate() + expirationMap[this.type]);
    }
  }
  
  next();
});

// Instance method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Instance method to mark as unread
notificationSchema.methods.markAsUnread = function() {
  this.isRead = false;
  this.readAt = undefined;
  return this.save();
};

// Instance method to archive
notificationSchema.methods.archive = function() {
  this.isArchived = true;
  return this.save();
};

// Instance method to unarchive
notificationSchema.methods.unarchive = function() {
  this.isArchived = false;
  return this.save();
};

// Instance method to mark email as sent
notificationSchema.methods.markEmailSent = function() {
  this.emailSent = true;
  this.emailSentAt = new Date();
  return this.save();
};

// Static method to create notification
notificationSchema.statics.createNotification = function(data) {
  return this.create(data);
};

// Static method to find unread notifications
notificationSchema.statics.findUnread = function(recipientId) {
  return this.find({ recipient: recipientId, isRead: false, isArchived: false });
};

// Static method to find recent notifications
notificationSchema.statics.findRecent = function(recipientId, limit = 20) {
  return this.find({ 
    recipient: recipientId, 
    isArchived: false,
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } }
    ]
  })
  .sort({ createdAt: -1 })
  .limit(limit);
};

// Static method to find notifications by type
notificationSchema.statics.findByType = function(recipientId, type, limit = 20) {
  return this.find({ 
    recipient: recipientId, 
    type,
    isArchived: false 
  })
  .sort({ createdAt: -1 })
  .limit(limit);
};

// Static method to mark all as read
notificationSchema.statics.markAllAsRead = function(recipientId) {
  return this.updateMany(
    { recipient: recipientId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
};

// Static method to mark multiple as read
notificationSchema.statics.markMultipleAsRead = function(notificationIds) {
  return this.updateMany(
    { _id: { $in: notificationIds } },
    { isRead: true, readAt: new Date() }
  );
};

// Static method to archive old notifications
notificationSchema.statics.archiveOld = function(daysOld = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  return this.updateMany(
    { 
      createdAt: { $lt: cutoffDate },
      isRead: true,
      isArchived: false
    },
    { isArchived: true }
  );
};

// Static method to clean expired notifications
notificationSchema.statics.cleanExpired = function() {
  return this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
};

// Static method to get notification count
notificationSchema.statics.getUnreadCount = function(recipientId) {
  return this.countDocuments({ 
    recipient: recipientId, 
    isRead: false, 
    isArchived: false 
  });
};

// Static method to get notification statistics
notificationSchema.statics.getStats = function(recipientId) {
  return this.aggregate([
    { $match: { recipient: new mongoose.Types.ObjectId(recipientId) } },
    {
      $group: {
        _id: '$type',
        total: { $sum: 1 },
        unread: { $sum: { $cond: ['$isRead', 0, 1] } },
        archived: { $sum: { $cond: ['$isArchived', 1, 0] } }
      }
    }
  ]);
};

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
