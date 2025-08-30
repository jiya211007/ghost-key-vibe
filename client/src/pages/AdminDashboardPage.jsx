import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { 
  Shield, 
  Users, 
  FileText, 
  Eye, 
  Heart, 
  MessageCircle, 
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  BarChart3,
  Filter,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye as ViewIcon,
  Calendar,
  User,
  Tag
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { getArticles, updateArticleStatus, deleteArticle } from '../api/articles.js';
import { getUsers, updateUserRole, deleteUser } from '../api/auth.js';

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Local state
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch data
  const { data: articles = [], isLoading: articlesLoading } = useQuery({
    queryKey: ['adminArticles'],
    queryFn: () => getArticles({ limit: 100 }),
  });

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: getUsers,
  });

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: ({ articleId, status }) => updateArticleStatus(articleId, status),
    onSuccess: () => {
      toast.success('Article status updated successfully!');
      queryClient.invalidateQueries(['adminArticles']);
      queryClient.invalidateQueries(['articles']);
    },
    onError: () => toast.error('Failed to update article status'),
  });

  const deleteArticleMutation = useMutation({
    mutationFn: deleteArticle,
    onSuccess: () => {
      toast.success('Article deleted successfully!');
      queryClient.invalidateQueries(['adminArticles']);
      queryClient.invalidateQueries(['articles']);
    },
    onError: () => toast.error('Failed to delete article'),
  });

  const updateUserRoleMutation = useMutation({
    mutationFn: ({ userId, role }) => updateUserRole(userId, role),
    onSuccess: () => {
      toast.success('User role updated successfully!');
      queryClient.invalidateQueries(['adminUsers']);
    },
    onError: () => toast.error('Failed to update user role'),
  });

  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      toast.success('User deleted successfully!');
      queryClient.invalidateQueries(['adminUsers']);
    },
    onError: () => toast.error('Failed to delete user'),
  });

  // Filter articles
  const filteredArticles = articles.filter(article => {
    const matchesStatus = selectedStatus === 'all' || article.status === selectedStatus;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.author?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Calculate stats
  const stats = {
    totalUsers: users.length,
    totalArticles: articles.length,
    pendingArticles: articles.filter(a => a.status === 'pending').length,
    publishedArticles: articles.filter(a => a.status === 'published').length,
    totalViews: articles.reduce((sum, a) => sum + (a.views || 0), 0),
    totalLikes: articles.reduce((sum, a) => sum + (a.likes?.length || 0), 0),
    totalComments: articles.reduce((sum, a) => sum + (a.comments?.length || 0), 0)
  };

  // Handle actions
  const handleUpdateStatus = (articleId, status) => {
    updateStatusMutation.mutate({ articleId, status });
  };

  const handleDeleteArticle = (articleId) => {
    if (window.confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      deleteArticleMutation.mutate(articleId);
    }
  };

  const handleUpdateUserRole = (userId, role) => {
    updateUserRoleMutation.mutate({ userId, role });
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      deleteUserMutation.mutate(userId);
    }
  };

  // Tabs configuration
  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'articles', label: 'Articles', icon: FileText },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'moderation', label: 'Moderation', icon: Shield }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage content, users, and platform analytics
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 text-sm font-medium rounded-full">
                Admin
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-8">
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
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
                      </div>
                      <Users className="w-8 h-8 text-blue-500" />
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Articles</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalArticles}</p>
                      </div>
                      <FileText className="w-8 h-8 text-green-500" />
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Pending Review</p>
                        <p className="text-3xl font-bold text-yellow-600">{stats.pendingArticles}</p>
                      </div>
                      <Clock className="w-8 h-8 text-yellow-500" />
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Views</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalViews.toLocaleString()}</p>
                      </div>
                      <Eye className="w-8 h-8 text-purple-500" />
                    </div>
                  </div>
                </div>

                {/* Engagement Stats */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Engagement Overview
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {stats.totalLikes}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Likes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {stats.totalComments}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Comments</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-2">
                        {stats.totalViews.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Views</div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Recent Activity
                  </h3>
                  <div className="space-y-3">
                    {articles.slice(0, 5).map((article) => (
                      <div key={article.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${
                            article.status === 'published' ? 'bg-green-500' :
                            article.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                          }`} />
                          <span className="text-sm text-gray-900 dark:text-white font-medium line-clamp-1">
                            {article.title}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>{article.author?.name}</span>
                          <span>•</span>
                          <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Articles Tab */}
            {activeTab === 'articles' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Article Management
                  </h3>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search articles..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      />
                    </div>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="published">Published</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                {articlesLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : filteredArticles.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <p className="text-gray-600 dark:text-gray-400">No articles found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredArticles.map((article) => (
                      <div
                        key={article.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
                                {article.title}
                              </h4>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                article.status === 'published'
                                  ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                  : article.status === 'pending'
                                  ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                                  : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                              }`}>
                                {article.status}
                              </span>
                            </div>
                            
                            <p className="text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                              {article.excerpt}
                            </p>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                              <span className="flex items-center">
                                <User className="w-4 h-4 mr-1" />
                                {article.author?.name}
                              </span>
                              <span className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {new Date(article.createdAt).toLocaleDateString()}
                              </span>
                              <span className="flex items-center">
                                <Eye className="w-4 h-4 mr-1" />
                                {article.views?.toLocaleString() || 0}
                              </span>
                              <span className="flex items-center">
                                <Heart className="w-4 h-4 mr-1" />
                                {article.likes?.length || 0}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            {article.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(article.id, 'published')}
                                  className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                  title="Approve"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(article.id, 'rejected')}
                                  className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                  title="Reject"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            
                            <div className="relative">
                              <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg">
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                              
                              <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-1 z-10">
                                <button
                                  onClick={() => window.open(`/articles/${article.slug}`, '_blank')}
                                  className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                                >
                                  <ViewIcon className="w-4 h-4 mr-2 inline" />
                                  View
                                </button>
                                <button
                                  onClick={() => handleDeleteArticle(article.id)}
                                  className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                  <Trash2 className="w-4 h-4 mr-2 inline" />
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  User Management
                </h3>

                {usersLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <p className="text-gray-600 dark:text-gray-400">No users found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {users.map((userItem) => (
                      <div
                        key={userItem.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                              <span className="text-primary-700 dark:text-primary-300 font-semibold text-lg">
                                {userItem.firstName?.charAt(0) || userItem.username?.charAt(0) || 'U'}
                              </span>
                            </div>
                            
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {userItem.firstName} {userItem.lastName}
                              </h4>
                              <p className="text-gray-600 dark:text-gray-400">
                                @{userItem.username} • {userItem.email}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-500">
                                Joined {new Date(userItem.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <select
                              value={userItem.role}
                              onChange={(e) => handleUpdateUserRole(userItem.id, e.target.value)}
                              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                              <option value="moderator">Moderator</option>
                            </select>
                            
                            {userItem.id !== user?.id && (
                              <button
                                onClick={() => handleDeleteUser(userItem.id)}
                                className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Delete User"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Moderation Tab */}
            {activeTab === 'moderation' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Content Moderation
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Pending Articles */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Pending Review
                      </h4>
                      <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 text-sm rounded-full">
                        {stats.pendingArticles}
                      </span>
                    </div>
                    
                    {stats.pendingArticles === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                        No articles pending review
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {articles
                          .filter(a => a.status === 'pending')
                          .slice(0, 3)
                          .map((article) => (
                            <div key={article.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <h5 className="font-medium text-gray-900 dark:text-white mb-1 line-clamp-1">
                                {article.title}
                              </h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                by {article.author?.name}
                              </p>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleUpdateStatus(article.id, 'published')}
                                  className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(article.id, 'rejected')}
                                  className="px-3 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors"
                                >
                                  Reject
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Recent Activity */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Recent Moderation
                    </h4>
                    
                    <div className="space-y-3">
                      {articles
                        .filter(a => a.status !== 'pending')
                        .slice(0, 5)
                        .map((article) => (
                          <div key={article.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                                {article.title}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {article.status} • {new Date(article.updatedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <span className={`w-2 h-2 rounded-full ${
                              article.status === 'published' ? 'bg-green-500' : 'bg-red-500'
                            }`} />
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
