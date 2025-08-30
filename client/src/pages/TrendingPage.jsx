import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Eye, 
  Heart, 
  MessageCircle, 
  User, 
  Calendar,
  Tag,
  Filter,
  Clock,
  Star
} from 'lucide-react';
import { getTrendingArticles } from '../api/articles.js';
import { ArticleCardSkeleton } from '../components/LoadingSkeletons.jsx';

const TrendingPage = () => {
  const [timeframe, setTimeframe] = useState('week');
  const [category, setCategory] = useState('');

  // Fetch trending articles
  const { 
    data: trendingArticles = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['trending-articles', timeframe, category],
    queryFn: () => getTrendingArticles({ 
      timeframe, 
      category: category || undefined,
      limit: 20 
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const timeframes = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'all', label: 'All Time' }
  ];

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'Technology', label: 'Technology' },
    { value: 'Programming', label: 'Programming' },
    { value: 'Web Development', label: 'Web Development' },
    { value: 'Design', label: 'Design' },
    { value: 'Business', label: 'Business' },
    { value: 'AI & Machine Learning', label: 'AI & Machine Learning' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <TrendingUp className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Trending Articles
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Discover the most popular and engaging content on the platform
              </p>
            </div>
            
            <div className="hidden md:flex items-center space-x-4">
              <Star className="w-6 h-6 text-yellow-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Updated every hour
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Filter by:
              </span>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              {/* Timeframe Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Timeframe
                </label>
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {timeframes.map((tf) => (
                    <option key={tf.value} value={tf.value}>
                      {tf.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {error ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
            <div className="text-red-500 dark:text-red-400 mb-4">
              <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Failed to Load Trending Articles</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Unable to fetch trending content. Please try again later.
              </p>
            </div>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <ArticleCardSkeleton key={i} />
            ))}
          </div>
        ) : trendingArticles.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
            <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Trending Articles Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Be the first to create content that trends! Start writing and engaging with the community.
            </p>
            <Link
              to="/create"
              className="btn btn-primary"
            >
              Write Your First Article
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top 3 Articles - Featured Cards */}
            {trendingArticles.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <Star className="w-6 h-6 text-yellow-500 mr-2" />
                  Top Trending
                </h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {trendingArticles.slice(0, 3).map((article, index) => (
                    <div key={article._id} className="relative">
                      {/* Ranking Badge */}
                      <div className="absolute top-4 left-4 z-10">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                          index === 0 ? 'bg-yellow-500' : 
                          index === 1 ? 'bg-gray-400' : 'bg-amber-600'
                        }`}>
                          {index + 1}
                        </div>
                      </div>

                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                        {article.coverImage && (
                          <div className="h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                            <img
                              src={`${process.env.REACT_APP_SERVER_URL || 'http://localhost:5000'}/uploads/optimized/${article.coverImage}`}
                              alt={article.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        
                        <div className="p-6">
                          <div className="flex items-center space-x-2 mb-3">
                            <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 text-xs font-medium rounded-full">
                              {article.category}
                            </span>
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                              <Clock className="w-3 h-3 mr-1" />
                              {article.readingTime || 5} min read
                            </div>
                          </div>

                          <Link to={`/articles/${article.slug}`}>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 hover:text-primary-600 dark:hover:text-primary-400 transition-colors line-clamp-2">
                              {article.title}
                            </h3>
                          </Link>

                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                            {article.excerpt}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center space-x-1">
                                <Link
                                  to={`/profile/${article.author?.username}`}
                                  className="flex items-center space-x-2 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                >
                                  <div className="w-6 h-6 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                                    <span className="text-primary-700 dark:text-primary-300 text-xs font-semibold">
                                      {article.author?.firstName?.charAt(0) || article.author?.username?.charAt(0) || 'U'}
                                    </span>
                                  </div>
                                  <span className="text-sm text-gray-700 dark:text-gray-300">
                                    {article.author?.firstName || article.author?.username}
                                  </span>
                                </Link>
                              </div>
                            </div>

                            <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                              <div className="flex items-center space-x-1">
                                <Eye className="w-3 h-3" />
                                <span>{article.views?.toLocaleString() || 0}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Heart className="w-3 h-3" />
                                <span>{article.likes?.length || 0}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MessageCircle className="w-3 h-3" />
                                <span>{article.comments?.length || 0}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rest of Trending Articles */}
            {trendingArticles.length > 3 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  More Trending Articles
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {trendingArticles.slice(3).map((article, index) => (
                    <div key={article._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                      {article.coverImage && (
                        <div className="h-40 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                          <img
                            src={`${process.env.REACT_APP_SERVER_URL || 'http://localhost:5000'}/uploads/optimized/${article.coverImage}`}
                            alt={article.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      
                      <div className="p-5">
                        <div className="flex items-center justify-between mb-3">
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-full">
                            #{index + 4}
                          </span>
                          <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 text-xs font-medium rounded-full">
                            {article.category}
                          </span>
                        </div>

                        <Link to={`/articles/${article.slug}`}>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 hover:text-primary-600 dark:hover:text-primary-400 transition-colors line-clamp-2">
                            {article.title}
                          </h3>
                        </Link>

                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                          {article.excerpt}
                        </p>

                        <div className="flex items-center justify-between">
                          <Link
                            to={`/profile/${article.author?.username}`}
                            className="flex items-center space-x-2 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                          >
                            <div className="w-6 h-6 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                              <span className="text-primary-700 dark:text-primary-300 text-xs font-semibold">
                                {article.author?.firstName?.charAt(0) || article.author?.username?.charAt(0) || 'U'}
                              </span>
                            </div>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {article.author?.firstName || article.author?.username}
                            </span>
                          </Link>

                          <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center space-x-1">
                              <Eye className="w-3 h-3" />
                              <span>{article.views?.toLocaleString() || 0}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Heart className="w-3 h-3" />
                              <span>{article.likes?.length || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrendingPage;
