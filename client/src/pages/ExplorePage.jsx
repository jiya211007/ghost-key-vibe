import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Calendar,
  Eye,
  Heart,
  MessageCircle,
  Tag,
  Clock,
  TrendingUp,
  BookOpen,
  X
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getArticles } from '../api/articles.js';

const ExplorePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  // Get URL parameters
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'latest';
  const page = parseInt(searchParams.get('page')) || 1;

  // Local state for filters
  const [localSearch, setLocalSearch] = useState(search);
  const [localCategory, setLocalCategory] = useState(category);
  const [localSort, setLocalSort] = useState(sort);

  // Categories for filtering
  const categories = [
    'All',
    'Frontend Development',
    'Backend Development',
    'Full Stack',
    'Mobile Development',
    'DevOps',
    'Data Science',
    'Machine Learning',
    'Web Development',
    'UI/UX Design',
    'Testing',
    'Security',
    'Cloud Computing',
    'Blockchain',
    'Game Development'
  ];

  // Sort options
  const sortOptions = [
    { value: 'latest', label: 'Latest', icon: Calendar },
    { value: 'trending', label: 'Trending', icon: TrendingUp },
    { value: 'popular', label: 'Most Popular', icon: Heart },
    { value: 'views', label: 'Most Viewed', icon: Eye },
    { value: 'comments', label: 'Most Commented', icon: MessageCircle }
  ];

  // Fetch articles with filters
  const { data: articlesData, isLoading, error } = useQuery({
    queryKey: ['articles', { search, category, sort, page }],
    queryFn: () => getArticles({ 
      search, 
      category: category === 'All' ? '' : category, 
      sort, 
      page,
      limit: 12
    }),
    staleTime: 5 * 60 * 1000,
  });

  const articles = articlesData?.articles || [];
  const totalPages = articlesData?.totalPages || 1;
  const totalArticles = articlesData?.total || 0;

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (localSearch) params.set('search', localSearch);
    if (localCategory && localCategory !== 'All') params.set('category', localCategory);
    if (localSort !== 'latest') params.set('sort', localSort);
    if (page > 1) params.set('page', page.toString());
    
    setSearchParams(params);
  }, [localSearch, localCategory, localSort, page, setSearchParams]);

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    setLocalSearch(localSearch.trim());
  };

  // Handle filter changes
  const handleCategoryChange = (newCategory) => {
    setLocalCategory(newCategory);
    setSearchParams({ page: '1' }); // Reset to first page
  };

  const handleSortChange = (newSort) => {
    setLocalSort(newSort);
    setSearchParams({ page: '1' }); // Reset to first page
  };

  // Clear all filters
  const clearFilters = () => {
    setLocalSearch('');
    setLocalCategory('All');
    setLocalSort('latest');
    setSearchParams({});
  };

  // Pagination
  const goToPage = (newPage) => {
    setSearchParams(prev => ({ ...Object.fromEntries(prev), page: newPage.toString() }));
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase();
  };

  const formatDate = (date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Explore Articles
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Discover amazing content from developers around the world. 
              Find tutorials, insights, and stories that inspire and educate.
            </p>
          </div>

          {/* Search and Filters Bar */}
          <div className="max-w-4xl mx-auto">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative mb-6">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search articles, authors, or topics..."
                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Search
              </button>
            </form>

            {/* Filters and View Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {(localCategory !== 'All' || localSort !== 'latest') && (
                  <span className="ml-2 px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-xs rounded-full">
                    Active
                  </span>
                )}
              </button>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Category Filter */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleCategoryChange(cat)}
                      className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                        localCategory === cat
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Filter */}
              <div className="lg:w-64">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Sort By
                </label>
                <div className="space-y-2">
                  {sortOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleSortChange(option.value)}
                        className={`w-full flex items-center px-3 py-2 text-sm rounded-lg border transition-all ${
                          localSort === option.value
                            ? 'bg-primary-600 text-white border-primary-600'
                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                        }`}
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Clear Filters */}
              <div className="lg:w-auto flex items-end">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-600 dark:text-gray-400">
              {isLoading ? 'Loading...' : `Showing ${articles.length} of ${totalArticles} articles`}
            </p>
            {(localSearch || localCategory !== 'All' || localSort !== 'latest') && (
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span>Active filters:</span>
                {localSearch && (
                  <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded">
                    Search: "{localSearch}"
                  </span>
                )}
                {localCategory !== 'All' && (
                  <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded">
                    {localCategory}
                  </span>
                )}
                {localSort !== 'latest' && (
                  <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded">
                    {sortOptions.find(opt => opt.value === localSort)?.label}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Articles Grid/List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          // Loading Skeleton
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          // Error State
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">
              <BookOpen className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
              Error loading articles
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {error.message || 'Something went wrong. Please try again.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary"
            >
              Retry
            </button>
          </div>
        ) : articles.length === 0 ? (
          // Empty State
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <BookOpen className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
              No articles found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {localSearch 
                ? `No articles match your search for "${localSearch}"`
                : 'Try adjusting your filters or search terms'
              }
            </p>
            <button
              onClick={clearFilters}
              className="btn btn-primary"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          // Articles Display
          <>
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {articles.map((article) => (
                <article
                  key={article.id}
                  className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
                    viewMode === 'list' ? 'flex flex-col md:flex-row' : ''
                  }`}
                >
                  {/* Article Image */}
                  <div className={`relative ${
                    viewMode === 'list' ? 'md:w-48 md:flex-shrink-0' : ''
                  }`}>
                    <img
                      src={article.coverImage}
                      alt={article.title}
                      className={`w-full object-cover ${
                        viewMode === 'list' ? 'h-48 md:h-full' : 'h-48'
                      }`}
                    />
                    <div className="absolute top-4 left-4">
                      <span className="inline-block bg-primary-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                        {article.category}
                      </span>
                    </div>
                  </div>

                  {/* Article Content */}
                  <div className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                    {/* Author Info */}
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mr-3">
                        <span className="text-primary-700 dark:text-primary-300 font-semibold text-sm">
                          {getInitials(article.author.name)}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {article.author.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(article.publishedAt)}
                        </div>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                      <Link to={`/articles/${article.slug}`}>
                        {article.title}
                      </Link>
                    </h3>

                    {/* Excerpt */}
                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                      {article.excerpt}
                    </p>

                    {/* Stats and Tags */}
                    <div className="space-y-3">
                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
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

                      {/* Tags */}
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
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => goToPage(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    const isCurrent = pageNum === page;
                    const isNearCurrent = Math.abs(pageNum - page) <= 2;
                    
                    if (isCurrent || isNearCurrent || pageNum === 1 || pageNum === totalPages) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                            isCurrent
                              ? 'bg-primary-600 text-white'
                              : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (pageNum === page - 3 || pageNum === page + 3) {
                      return <span key={pageNum} className="px-2 text-gray-500">...</span>;
                    }
                    return null;
                  })}
                  
                  <button
                    onClick={() => goToPage(page + 1)}
                    disabled={page === totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;
