import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowRight, 
  Clock, 
  Eye, 
  Heart, 
  MessageCircle, 
  TrendingUp,
  BookOpen,
  Users,
  Star,
  Search,
  Filter,
  Calendar,
  Tag
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Import API functions
import { getArticles, getTrendingArticles } from '../api/articles.js';

// Placeholder data for empty states
const placeholderStats = {
  totalArticles: 0,
  totalUsers: 0,
  totalViews: 0,
  totalLikes: 0
};

const HomePage = () => {
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch featured articles from API (all articles for demo)
  const { data: featuredArticlesResponse, isLoading: featuredLoading } = useQuery({
    queryKey: ['featuredArticles'],
    queryFn: () => getArticles({ limit: 6 }), // Get all articles instead of filtering by featured
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Extract articles from API response - server returns {data: articles}
  const featuredArticles = featuredArticlesResponse?.data || [];
  
  // Debug logging
  console.log('Featured Articles Response:', featuredArticlesResponse);
  console.log('Extracted Featured Articles:', featuredArticles);

  // Fetch trending articles from API
  const { data: trendingArticlesResponse, isLoading: trendingLoading } = useQuery({
    queryKey: ['trendingArticles'],
    queryFn: () => getTrendingArticles({ limit: 5 }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Extract trending articles from API response
  const trendingArticles = trendingArticlesResponse?.data || [];

  // Auto-rotate hero articles
  useEffect(() => {
    if (featuredArticles.length > 0) {
      const interval = setInterval(() => {
        setCurrentHeroIndex((prev) => (prev + 1) % featuredArticles.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [featuredArticles.length]);

  const formatDate = (date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to explore page with search query
      window.location.href = `/explore?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/50 to-transparent"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Share Your Knowledge,
              <br />
              <span className="text-primary-200 bg-gradient-to-r from-primary-200 to-yellow-300 bg-clip-text text-transparent">
                Inspire the World
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Join thousands of developers sharing insights, tutorials, and experiences. 
              Build your reputation and help others grow in the tech community.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for articles, tutorials, or topics..."
                  className="w-full px-6 py-4 pl-14 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all"
                />
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/70" />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 bg-white text-primary-700 rounded-full hover:bg-gray-100 transition-colors font-medium"
                >
                  Search
                </button>
              </form>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/create"
                className="btn btn-secondary text-lg px-8 py-4 flex items-center justify-center group hover:scale-105 transition-transform"
              >
                <BookOpen className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                Start Writing
              </Link>
              <Link
                to="/explore"
                className="btn btn-outline-secondary text-lg px-8 py-4 flex items-center justify-center group hover:scale-105 transition-transform"
              >
                Explore Articles
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2 group-hover:scale-110 transition-transform">
                {placeholderStats.totalArticles.toLocaleString()}
              </div>
              <div className="text-gray-600 dark:text-gray-300">Articles Published</div>
            </div>
            <div className="text-center group">
              <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2 group-hover:scale-110 transition-transform">
                {placeholderStats.totalUsers.toLocaleString()}
              </div>
              <div className="text-gray-600 dark:text-gray-300">Active Writers</div>
            </div>
            <div className="text-center group">
              <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2 group-hover:scale-110 transition-transform">
                {placeholderStats.totalViews.toLocaleString()}
              </div>
              <div className="text-gray-600 dark:text-gray-300">Total Views</div>
            </div>
            <div className="text-center group">
              <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2 group-hover:scale-110 transition-transform">
                {placeholderStats.totalLikes.toLocaleString()}
              </div>
              <div className="text-gray-600 dark:text-gray-300">Likes Given</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Featured Articles Section */}
              <div className="mb-12">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Featured Articles</h2>
                    <p className="text-gray-600 dark:text-gray-300">Handpicked content from our top contributors</p>
                  </div>
                  <Link
                    to="/explore"
                    className="btn btn-outline flex items-center group hover:scale-105 transition-transform"
                  >
                    View All
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                {featuredLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden animate-pulse">
                        <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
                        <div className="p-6">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : featuredArticles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featuredArticles.map((article, index) => (
                      <article
                        key={article.id}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                      >
                        <div className="relative h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                          <img
                            src={article.coverImage}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-4 left-4">
                            <span className="inline-block bg-primary-600 text-white text-xs px-3 py-1 rounded-full font-medium">
                              {article.category}
                            </span>
                          </div>
                        </div>
                        
                        <div className="p-6">
                          <div className="flex items-center mb-3">
                            <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mr-3">
                              <span className="text-primary-700 dark:text-primary-300 font-semibold text-sm">
                                {getInitials(article.author?.firstName ? `${article.author.firstName} ${article.author.lastName}` : article.author?.username || 'Anonymous')}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {article.author?.firstName ? `${article.author.firstName} ${article.author.lastName}` : article.author?.username || 'Anonymous'}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {formatDate(article.publishedAt || article.createdAt)}
                              </div>
                            </div>
                          </div>

                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            <Link to={`/articles/${article.slug}`}>
                              {article.title}
                            </Link>
                          </h3>
                          
                          <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                            {article.excerpt}
                          </p>

                          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {article.readingTime} min read
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center">
                                <Eye className="h-4 w-4 mr-1" />
                                {article.views.toLocaleString()}
                              </div>
                              <div className="flex items-center">
                                <Heart className="h-4 w-4 mr-1" />
                                {article.likes.toLocaleString()}
                              </div>
                              <div className="flex items-center">
                                <MessageCircle className="h-4 w-4 mr-1" />
                                {article.comments.toLocaleString()}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {article.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-md"
                              >
                                <Tag className="w-3 h-3 mr-1" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                    <div className="text-gray-400 dark:text-gray-500 mb-4">
                      <BookOpen className="h-16 w-16 mx-auto" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">No Featured Articles Yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">Be the first to create amazing content!</p>
                    <Link
                      to="/create"
                      className="btn btn-primary"
                    >
                      Start Writing
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Trending Articles Sidebar */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-24">
                <div className="flex items-center mb-6">
                  <TrendingUp className="h-6 w-6 text-primary-600 mr-3" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Trending Now</h3>
                </div>

                {trendingLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                      </div>
                    ))}
                  </div>
                ) : trendingArticles.length > 0 ? (
                  <div className="space-y-4">
                    {trendingArticles.map((article, index) => (
                      <article
                        key={article.id}
                        className="group cursor-pointer"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                            <span className="text-primary-700 dark:text-primary-300 font-bold text-sm">
                              #{index + 1}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                              <Link to={`/articles/${article.slug}`}>
                                {article.title}
                              </Link>
                            </h4>
                            <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                              <span className="flex items-center">
                                <Eye className="w-3 h-3 mr-1" />
                                {article.views.toLocaleString()}
                              </span>
                              <span className="mx-2">•</span>
                              <span className="flex items-center">
                                <Heart className="w-3 h-3 mr-1" />
                                {article.likes.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No trending articles yet</p>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <Link
                    to="/trending"
                    className="btn btn-outline w-full justify-center group"
                  >
                    View All Trending
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Share Your Knowledge?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join our community of developers and start writing articles that help others learn and grow. 
            Your expertise could be exactly what someone needs to solve their next challenge.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="btn btn-secondary text-lg px-8 py-4 group hover:scale-105 transition-transform"
            >
              Get Started Today
            </Link>
            <Link
              to="/about"
              className="btn btn-outline-secondary text-lg px-8 py-4 group hover:scale-105 transition-transform"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
