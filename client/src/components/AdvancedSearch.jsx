import React, { useState, useEffect } from 'react';
import { Search, Filter, X, Calendar, User, Tag, Eye, Heart, MessageCircle } from 'lucide-react';

const AdvancedSearch = ({ 
  onSearch, 
  onFilter, 
  categories = [], 
  showAdvanced = false,
  onToggleAdvanced 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSort, setSelectedSort] = useState('newest');
  const [dateRange, setDateRange] = useState('');
  const [minViews, setMinViews] = useState('');
  const [minLikes, setMinLikes] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);

  // Sort options
  const sortOptions = [
    { value: 'newest', label: 'Newest First', icon: Calendar },
    { value: 'oldest', label: 'Oldest First', icon: Calendar },
    { value: 'mostViews', label: 'Most Views', icon: Eye },
    { value: 'mostLikes', label: 'Most Likes', icon: Heart },
    { value: 'mostComments', label: 'Most Comments', icon: MessageCircle },
    { value: 'trending', label: 'Trending', icon: '🔥' }
  ];

  // Handle search
  const handleSearch = () => {
    const filters = {
      query: searchQuery,
      category: selectedCategory,
      sort: selectedSort,
      dateRange,
      minViews: minViews ? parseInt(minViews) : undefined,
      minLikes: minLikes ? parseInt(minLikes) : undefined,
      tags: selectedTags
    };
    
    onSearch(searchQuery);
    onFilter(filters);
  };

  // Handle filter changes
  const handleFilterChange = () => {
    handleSearch();
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedSort('newest');
    setDateRange('');
    setMinViews('');
    setMinLikes('');
    setSelectedTags([]);
    
    onSearch('');
    onFilter({});
  };

  // Add tag
  const addTag = (tag) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Remove tag
  const removeTag = (tagToRemove) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  // Check if any filters are active
  const hasActiveFilters = searchQuery || selectedCategory || selectedSort !== 'newest' || 
                          dateRange || minViews || minLikes || selectedTags.length > 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
      {/* Basic Search */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search articles, authors, or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
        
        <button
          onClick={handleSearch}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
        >
          Search
        </button>
        
        <button
          onClick={onToggleAdvanced}
          className={`px-4 py-3 rounded-lg border transition-colors ${
            showAdvanced
              ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 border-primary-300 dark:border-primary-700'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  handleFilterChange();
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sort By
              </label>
              <select
                value={selectedSort}
                onChange={(e) => {
                  setSelectedSort(e.target.value);
                  handleFilterChange();
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date Range
              </label>
              <select
                value={dateRange}
                onChange={(e) => {
                  setDateRange(e.target.value);
                  handleFilterChange();
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>

            {/* Min Views */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Min Views
              </label>
              <input
                type="number"
                placeholder="0"
                value={minViews}
                onChange={(e) => setMinViews(e.target.value)}
                onBlur={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>

          {/* Min Likes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Min Likes
              </label>
              <input
                type="number"
                placeholder="0"
                value={minLikes}
                onChange={(e) => setMinLikes(e.target.value)}
                onBlur={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            {/* Popular Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Popular Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {['React', 'JavaScript', 'Node.js', 'Python', 'Machine Learning', 'Web Development'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => addTag(tag)}
                    disabled={selectedTags.includes(tag)}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 cursor-not-allowed'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Selected Tags */}
          {selectedTags.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Selected Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 text-sm rounded-full"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-primary-500 hover:text-primary-700 dark:hover:text-primary-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Filter Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {hasActiveFilters && 'Filters applied'}
            </div>
            
            <div className="flex items-center space-x-3">
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Clear All
                </button>
              )}
              
              <button
                onClick={handleSearch}
                className="px-6 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;
