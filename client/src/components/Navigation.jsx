import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  Menu, 
  X, 
  Search, 
  User, 
  LogOut, 
  Sun, 
  Moon,
  BookOpen,
  TrendingUp,
  Plus
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Dark mode toggle
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
    toast.success(isDarkMode ? 'Light mode enabled' : 'Dark mode enabled');
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  }, [location]);

  // Check if current route is active
  const isActiveRoute = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 md:space-x-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <span className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              Devnovate
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`nav-link ${isActiveRoute('/') ? 'active' : ''}`}
            >
              Home
            </Link>
            <Link
              to="/explore"
              className={`nav-link ${isActiveRoute('/explore') ? 'active' : ''}`}
            >
              Explore
            </Link>

            <Link
              to="/trending"
              className={`nav-link ${isActiveRoute('/trending') ? 'active' : ''}`}
            >
              <TrendingUp className="w-4 h-4 mr-1" />
              Trending
            </Link>
            {user && (
              <Link
                to="/create"
                className="btn btn-primary btn-sm flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" />
                Write
              </Link>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Search Button */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                    <span className="text-primary-700 dark:text-primary-300 font-semibold text-sm">
                      {user.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user.firstName || user.username}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <BookOpen className="w-4 h-4 mr-2" />
                        Admin Dashboard
                      </Link>
                    )}
                    <hr className="my-2 border-gray-200 dark:border-gray-600" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary btn-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="pb-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles, authors, or tags..."
                className="w-full px-4 py-3 pl-12 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all"
                autoFocus
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                Search
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="px-4 py-2 space-y-1">
            <Link
              to="/"
              className={`mobile-nav-link ${isActiveRoute('/') ? 'active' : ''}`}
            >
              Home
            </Link>
            <Link
              to="/explore"
              className={`mobile-nav-link ${isActiveRoute('/explore') ? 'active' : ''}`}
            >
              Explore
            </Link>
            <Link
              to="/trending"
              className={`mobile-nav-link ${isActiveRoute('/trending') ? 'active' : ''}`}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Trending
            </Link>
            {user && (
              <Link
                to="/create"
                className="mobile-nav-link text-primary-600 dark:text-primary-400"
              >
                <Plus className="w-4 h-4 mr-2" />
                Write Article
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
