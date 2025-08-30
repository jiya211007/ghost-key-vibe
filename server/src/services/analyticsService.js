import mongoose from 'mongoose';
import Article from '../models/Article.js';
import User from '../models/User.js';
import Comment from '../models/Comment.js';
import Like from '../models/Like.js';

class AnalyticsService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Get cache key
  getCacheKey(method, params = {}) {
    return `${method}_${JSON.stringify(params)}`;
  }

  // Get cached data or fetch fresh
  async getCachedData(key, fetchFunction) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    const data = await fetchFunction();
    this.cache.set(key, { data, timestamp: Date.now() });
    return data;
  }

  // Get platform overview statistics
  async getPlatformOverview() {
    const cacheKey = this.getCacheKey('platformOverview');
    
    return this.getCachedData(cacheKey, async () => {
      const [
        totalUsers,
        totalArticles,
        totalComments,
        totalLikes,
        totalViews,
        publishedArticles,
        pendingArticles,
        rejectedArticles
      ] = await Promise.all([
        User.countDocuments(),
        Article.countDocuments(),
        Comment.countDocuments(),
        Like.countDocuments(),
        Article.aggregate([
          { $group: { _id: null, totalViews: { $sum: '$views' } } }
        ]).then(result => result[0]?.totalViews || 0),
        Article.countDocuments({ status: 'published' }),
        Article.countDocuments({ status: 'pending' }),
        Article.countDocuments({ status: 'rejected' })
      ]);

      return {
        totalUsers,
        totalArticles,
        totalComments,
        totalLikes,
        totalViews,
        publishedArticles,
        pendingArticles,
        rejectedArticles,
        engagementRate: totalUsers > 0 ? ((totalLikes + totalComments) / totalUsers * 100).toFixed(2) : 0,
        averageViewsPerArticle: totalArticles > 0 ? (totalViews / totalArticles).toFixed(2) : 0
      };
    });
  }

  // Get user growth over time
  async getUserGrowth(days = 30) {
    const cacheKey = this.getCacheKey('userGrowth', { days });
    
    return this.getCachedData(cacheKey, async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const userGrowth = await User.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ]);

      return userGrowth.map(item => ({
        date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`,
        count: item.count
      }));
    });
  }

  // Get content performance metrics
  async getContentPerformance(limit = 10) {
    const cacheKey = this.getCacheKey('contentPerformance', { limit });
    
    return this.getCachedData(cacheKey, async () => {
      const topArticles = await Article.aggregate([
        { $match: { status: 'published' } },
        {
          $lookup: {
            from: 'users',
            localField: 'author',
            foreignField: '_id',
            as: 'author'
          }
        },
        { $unwind: '$author' },
        {
          $addFields: {
            engagementScore: {
              $add: [
                '$views',
                { $multiply: ['$likes', 2] },
                { $multiply: ['$comments', 3] }
              ]
            }
          }
        },
        { $sort: { engagementScore: -1 } },
        { $limit: limit },
        {
          $project: {
            title: 1,
            slug: 1,
            views: 1,
            likes: 1,
            comments: 1,
            engagementScore: 1,
            author: { username: 1, firstName: 1, lastName: 1 },
            category: 1,
            publishedAt: 1
          }
        }
      ]);

      return topArticles;
    });
  }

  // Get user engagement metrics
  async getUserEngagement() {
    const cacheKey = this.getCacheKey('userEngagement');
    
    return this.getCachedData(cacheKey, async () => {
      const userStats = await User.aggregate([
        {
          $lookup: {
            from: 'articles',
            localField: '_id',
            foreignField: 'author',
            as: 'articles'
          }
        },
        {
          $lookup: {
            from: 'comments',
            localField: '_id',
            foreignField: 'author',
            as: 'comments'
          }
        },
        {
          $lookup: {
            from: 'likes',
            localField: '_id',
            foreignField: 'user',
            as: 'likes'
          }
        },
        {
          $addFields: {
            articleCount: { $size: '$articles' },
            commentCount: { $size: '$comments' },
            likeCount: { $size: '$likes' },
            totalViews: {
              $sum: '$articles.views'
            }
          }
        },
        {
          $match: {
            $or: [
              { articleCount: { $gt: 0 } },
              { commentCount: { $gt: 0 } },
              { likeCount: { $gt: 0 } }
            ]
          }
        },
        { $sort: { totalViews: -1 } },
        { $limit: 20 }
      ]);

      return userStats;
    });
  }

  // Get category performance
  async getCategoryPerformance() {
    const cacheKey = this.getCacheKey('categoryPerformance');
    
    return this.getCachedData(cacheKey, async () => {
      const categoryStats = await Article.aggregate([
        { $match: { status: 'published' } },
        {
          $group: {
            _id: '$category',
            articleCount: { $sum: 1 },
            totalViews: { $sum: '$views' },
            totalLikes: { $sum: { $size: '$likes' } },
            totalComments: { $sum: { $size: '$comments' } }
          }
        },
        {
          $addFields: {
            averageViews: { $divide: ['$totalViews', '$articleCount'] },
            averageLikes: { $divide: ['$totalLikes', '$articleCount'] },
            averageComments: { $divide: ['$totalComments', '$articleCount'] }
          }
        },
        { $sort: { totalViews: -1 } }
      ]);

      return categoryStats;
    });
  }

  // Get traffic sources and patterns
  async getTrafficPatterns() {
    const cacheKey = this.getCacheKey('trafficPatterns');
    
    return this.getCachedData(cacheKey, async () => {
      const hourlyTraffic = await Article.aggregate([
        { $match: { status: 'published' } },
        {
          $group: {
            _id: { $hour: '$createdAt' },
            totalViews: { $sum: '$views' },
            articleCount: { $sum: 1 }
          }
        },
        { $sort: { '_id': 1 } }
      ]);

      const dailyTraffic = await Article.aggregate([
        { $match: { status: 'published' } },
        {
          $group: {
            _id: { $dayOfWeek: '$createdAt' },
            totalViews: { $sum: '$views' },
            articleCount: { $sum: 1 }
          }
        },
        { $sort: { '_id': 1 } }
      ]);

      return {
        hourly: hourlyTraffic.map(item => ({
          hour: item._id,
          views: item.totalViews,
          articles: item.articleCount
        })),
        daily: dailyTraffic.map(item => ({
          day: item._id,
          views: item.totalViews,
          articles: item.articleCount
        }))
      };
    });
  }

  // Get search and discovery metrics
  async getSearchMetrics() {
    const cacheKey = this.getCacheKey('searchMetrics');
    
    return this.getCachedData(cacheKey, async () => {
      const popularTags = await Article.aggregate([
        { $match: { status: 'published' } },
        { $unwind: '$tags' },
        {
          $group: {
            _id: '$tags',
            count: { $sum: 1 },
            totalViews: { $sum: '$views' }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 20 }
      ]);

      const searchTrends = await Article.aggregate([
        { $match: { status: 'published' } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            articleCount: { $sum: 1 },
            totalViews: { $sum: '$views' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 12 }
      ]);

      return {
        popularTags,
        searchTrends: searchTrends.map(item => ({
          period: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
          articles: item.articleCount,
          views: item.totalViews
        }))
      };
    });
  }

  // Get real-time analytics
  async getRealTimeAnalytics() {
    const now = new Date();
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [
      activeUsers,
      recentArticles,
      recentComments,
      recentLikes
    ] = await Promise.all([
      User.countDocuments({ lastActive: { $gte: lastHour } }),
      Article.countDocuments({ createdAt: { $gte: last24Hours } }),
      Comment.countDocuments({ createdAt: { $gte: last24Hours } }),
      Like.countDocuments({ createdAt: { $gte: last24Hours } })
    ]);

    return {
      activeUsers,
      recentArticles,
      recentComments,
      recentLikes,
      lastUpdated: now
    };
  }

  // Generate analytics report
  async generateAnalyticsReport(startDate, endDate) {
    const cacheKey = this.getCacheKey('analyticsReport', { startDate, endDate });
    
    return this.getCachedData(cacheKey, async () => {
      const [
        overview,
        userGrowth,
        contentPerformance,
        categoryPerformance,
        trafficPatterns
      ] = await Promise.all([
        this.getPlatformOverview(),
        this.getUserGrowth(Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))),
        this.getContentPerformance(20),
        this.getCategoryPerformance(),
        this.getTrafficPatterns()
      ]);

      return {
        period: { startDate, endDate },
        overview,
        userGrowth,
        contentPerformance,
        categoryPerformance,
        trafficPatterns,
        generatedAt: new Date()
      };
    });
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
    console.log('✅ Analytics cache cleared');
  }

  // Get cache statistics
  getCacheStats() {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    const validEntries = entries.filter(([_, value]) => now - value.timestamp < this.cacheTimeout);
    
    return {
      totalEntries: entries.length,
      validEntries: validEntries.length,
      expiredEntries: entries.length - validEntries.length,
      cacheSize: entries.length
    };
  }
}

export default new AnalyticsService();
