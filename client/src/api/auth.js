import api from '../config/api.js';

// API instance is configured in config/api.js with interceptors

// Authentication API functions

/**
 * User registration
 * @param {Object} userData - User registration data
 * @returns {Promise} API response
 */
export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response;
};

/**
 * User login
 * @param {Object} credentials - Login credentials
 * @returns {Promise} API response
 */
export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response;
};

/**
 * Refresh access token
 * @returns {Promise} API response
 */
export const refreshToken = async () => {
  const response = await api.post('/auth/refresh');
  return response;
};

/**
 * User logout
 * @returns {Promise} API response
 */
export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response;
};

/**
 * Logout from all devices
 * @returns {Promise} API response
 */
export const logoutAll = async () => {
  const response = await api.post('/auth/logout-all');
  return response;
};

/**
 * Get current user profile
 * @returns {Promise} API response
 */
export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response;
};

/**
 * Request password reset
 * @param {Object} data - Email data
 * @returns {Promise} API response
 */
export const forgotPassword = async (data) => {
  const response = await api.post('/auth/forgot-password', data);
  return response;
};

/**
 * Reset password with token
 * @param {Object} data - Reset password data
 * @returns {Promise} API response
 */
export const resetPassword = async (data) => {
  const response = await api.post('/auth/reset-password', data);
  return response;
};

/**
 * Change password
 * @param {Object} data - Password change data
 * @returns {Promise} API response
 */
export const changePassword = async (data) => {
  const response = await api.post('/auth/change-password', data);
  return response;
};

/**
 * Request email verification
 * @returns {Promise} API response
 */
export const requestEmailVerification = async () => {
  const response = await api.post('/auth/request-email-verification');
  return response;
};

/**
 * Verify email with token
 * @param {Object} data - Verification data
 * @returns {Promise} API response
 */
export const verifyEmail = async (data) => {
  const response = await api.post('/auth/verify-email', data);
  return response;
};

// Admin: Get all users
export const getUsers = async () => {
  const response = await api.get('/admin/users');
  return response.data;
};

// Admin: Update user role
export const updateUserRole = async (userId, role) => {
  const response = await api.put(`/admin/users/${userId}/role`, { role });
  return response.data;
};

// Admin: Delete user
export const deleteUser = async (userId) => {
  const response = await api.delete(`/admin/users/${userId}`);
  return response.data;
};

// Update user profile
export const updateProfile = async (profileData) => {
  const response = await api.put('/users/profile', profileData);
  return response.data;
};

// Export the api instance for use in other modules
export default api;
