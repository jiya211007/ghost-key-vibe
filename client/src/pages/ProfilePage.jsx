import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { 
  User, 
  Edit3, 
  FileText, 
  Eye, 
  Heart, 
  MessageCircle, 
  Calendar,
  Settings,
  LogOut,
  Plus,
  BookOpen,
  TrendingUp,
  Award,
  Clock,
  Tag
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { getArticles } from '../api/articles.js';
import { updateProfile } from '../api/auth.js';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    bio: user?.bio || '',
    website: user?.website || '',
    location: user?.location || ''
  });

  // Fetch user's articles
  const { data: userArticles = [], isLoading: articlesLoading } = useQuery({
    queryKey: ['user-articles', user?.id],
    queryFn: () => getArticles({ author: user?.id, limit: 50 }),
    enabled: !!user?.id,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      queryClient.invalidateQueries(['user', 'me']);
    },
    onError: () => {
      toast.error('Failed to update profile');
    },
  });

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(profileData);
  };

  const handleCancelEdit = () => {
    setProfileData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      bio: user?.bio || '',
      website: user?.website || '',
      location: user?.location || ''
    });
    setIsEditing(false);
  };

  // Calculate stats
  const stats = {
    totalArticles: userArticles.length,
    publishedArticles: userArticles.filter(a => a.status === 'published').length,
    pendingArticles: userArticles.filter(a => a.status === 'pending').length,
    totalViews: userArticles.reduce((sum, a) => sum + (a.views || 0), 0),
    totalLikes: userArticles.reduce((sum, a) => sum + (a.likes?.length || 0), 0),
    totalComments: userArticles.reduce((sum, a) => sum + (a.comments?.length || 0), 0)
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'articles', label: 'Articles', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <div className="flex flex-col space-y-6 md:space-y-0 md:flex-row md:items-start md:justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto sm:mx-0">
                <span className="text-primary-700 dark:text-primary-300 font-bold text-2xl sm:text-3xl">
                  {user?.firstName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                </span>
              </div>
              
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  {user?.firstName} {user?.lastName}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  @{user?.username}
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm max-w-md">
                  {user?.bio || 'No bio available'}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
              <Link
                to="/create"
                className="btn btn-primary flex items-center justify-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Write Article
              </Link>
              
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-outline flex items-center justify-center"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 lg:sticky lg:top-8">
              {/* Stats */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Articles</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {stats.totalArticles}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Views</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {stats.totalViews.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Likes</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {stats.totalLikes}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Comments</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {stats.totalComments}
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-3" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Quick Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Published</p>
                        <p className="text-2xl sm:text-3xl font-bold text-green-600">{stats.publishedArticles}</p>
                      </div>
                      <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                        <p className="text-2xl sm:text-3xl font-bold text-yellow-600">{stats.pendingArticles}</p>
                      </div>
                      <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Views</p>
                        <p className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.totalViews.toLocaleString()}</p>
                      </div>
                      <Eye className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Recent Articles
                  </h3>
                  
                  {articlesLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : userArticles.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        You haven't written any articles yet.
                      </p>
                      <Link to="/create" className="btn btn-primary">
                        Write Your First Article
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userArticles.slice(0, 5).map((article) => (
                        <div key={article._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex-1 min-w-0">
                            <Link
                              to={`/articles/${article.slug}`}
                              className="text-lg font-medium text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors line-clamp-1"
                            >
                              {article.title}
                            </Link>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                article.status === 'published' 
                                  ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                  : article.status === 'pending'
                                  ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                                  : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                              }`}>
                                {article.status}
                              </span>
                              <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center space-x-1">
                              <Eye className="w-4 h-4" />
                              <span>{article.views || 0}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Heart className="w-4 h-4" />
                              <span>{article.likes?.length || 0}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Articles Tab */}
            {activeTab === 'articles' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    My Articles ({userArticles.length})
                  </h3>
                  <Link to="/create" className="btn btn-primary btn-sm">
                    <Plus className="w-4 h-4 mr-2" />
                    New Article
                  </Link>
                </div>

                {articlesLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : userArticles.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No articles yet
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Start sharing your knowledge with the world!
                    </p>
                    <Link to="/create" className="btn btn-primary">
                      Write Your First Article
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userArticles.map((article) => (
                      <div key={article._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-2">
                              <Link
                                to={`/articles/${article.slug}`}
                                className="text-xl font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors line-clamp-1"
                              >
                                {article.title}
                              </Link>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                article.status === 'published' 
                                  ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                  : article.status === 'pending'
                                  ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                                  : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                              }`}>
                                {article.status}
                              </span>
                            </div>

                            <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                              {article.excerpt}
                            </p>

                            <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Eye className="w-4 h-4" />
                                <span>{article.views?.toLocaleString() || 0} views</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Heart className="w-4 h-4" />
                                <span>{article.likes?.length || 0} likes</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MessageCircle className="w-4 h-4" />
                                <span>{article.comments?.length || 0} comments</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 ml-4">
                            <Link
                              to={`/edit/${article.slug}`}
                              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                              title="Edit Article"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Profile Settings
                </h3>

                {isEditing ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={profileData.firstName}
                          onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={profileData.lastName}
                          onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Bio
                      </label>
                      <textarea
                        value={profileData.bio}
                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Website
                        </label>
                        <input
                          type="url"
                          value={profileData.website}
                          onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="https://yourwebsite.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Location
                        </label>
                        <input
                          type="text"
                          value={profileData.location}
                          onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="City, Country"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 pt-4">
                      <button
                        onClick={handleSaveProfile}
                        disabled={updateProfileMutation.isLoading}
                        className="btn btn-primary"
                      >
                        {updateProfileMutation.isLoading ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="btn btn-outline"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          First Name
                        </label>
                        <p className="text-gray-900 dark:text-white">
                          {user?.firstName || 'Not provided'}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Last Name
                        </label>
                        <p className="text-gray-900 dark:text-white">
                          {user?.lastName || 'Not provided'}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Username
                        </label>
                        <p className="text-gray-900 dark:text-white">
                          @{user?.username}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Email
                        </label>
                        <p className="text-gray-900 dark:text-white">
                          {user?.email}
                        </p>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Bio
                        </label>
                        <p className="text-gray-900 dark:text-white">
                          {user?.bio || 'No bio available'}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Website
                        </label>
                        <p className="text-gray-900 dark:text-white">
                          {user?.website ? (
                            <a 
                              href={user.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary-600 dark:text-primary-400 hover:underline"
                            >
                              {user.website}
                            </a>
                          ) : 'Not provided'}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Location
                        </label>
                        <p className="text-gray-900 dark:text-white">
                          {user?.location || 'Not provided'}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Joined
                        </label>
                        <p className="text-gray-900 dark:text-white">
                          {new Date(user?.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Role
                        </label>
                        <p className="text-gray-900 dark:text-white capitalize">
                          {user?.role}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="btn btn-primary"
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit Profile
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal Background */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={handleCancelEdit}></div>
      )}
    </div>
  );
};

export default ProfilePage;