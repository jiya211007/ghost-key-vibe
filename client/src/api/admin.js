import api from '../config/api.js';

// Get dashboard statistics
export const getDashboardStats = async () => {
  const response = await api.get('/admin/dashboard');
  return response.data;
};

// Get pending articles
export const getPendingArticles = async (params = {}) => {
  const response = await api.get('/admin/articles/pending', { params });
  return response.data;
};

// Get pending comments
export const getPendingComments = async (params = {}) => {
  const response = await api.get('/admin/comments/pending', { params });
  return response.data;
};

// Get flagged content
export const getFlaggedContent = async (params = {}) => {
  const response = await api.get('/admin/content/flagged', { params });
  return response.data;
};

// Get user management data
export const getUserManagement = async (params = {}) => {
  const response = await api.get('/admin/users', { params });
  return response.data;
};

// Get analytics data
export const getAnalytics = async (params = {}) => {
  const response = await api.get('/admin/analytics', { params });
  return response.data;
};

// Bulk actions for moderation
export const bulkAction = async (actionData) => {
  const response = await api.post('/admin/bulk-action', actionData);
  return response.data;
};

// Update user role
export const updateUserRole = async (userId, role) => {
  const response = await api.put(`/admin/users/${userId}/role`, { role });
  return response.data;
};

// Ban user
export const banUser = async (userId, reason) => {
  const response = await api.put(`/admin/users/${userId}/ban`, { reason });
  return response.data;
};

// Unban user
export const unbanUser = async (userId) => {
  const response = await api.put(`/admin/users/${userId}/unban`);
  return response.data;
};

// Get moderation queue
export const getModerationQueue = async () => {
  const response = await api.get('/admin/moderation/queue');
  return response.data;
};

// Get system logs
export const getSystemLogs = async (params = {}) => {
  const response = await api.get('/admin/logs', { params });
  return response.data;
};
