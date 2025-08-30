import api from '../config/api.js';

// Get comments by article
export const getCommentsByArticle = async (articleSlug, params = {}) => {
  const response = await api.get(`/comments/article/${articleSlug}`, { params });
  return response.data;
};

// Create new comment
export const createComment = async (commentData) => {
  const response = await api.post('/comments', commentData);
  return response.data;
};

// Update comment
export const updateComment = async (commentId, commentData) => {
  const response = await api.put(`/comments/${commentId}`, commentData);
  return response.data;
};

// Delete comment
export const deleteComment = async (commentId) => {
  const response = await api.delete(`/comments/${commentId}`);
  return response.data;
};

// Like comment
export const likeComment = async (commentId) => {
  const response = await api.post(`/comments/${commentId}/like`);
  return response.data;
};

// Unlike comment
export const unlikeComment = async (commentId) => {
  const response = await api.delete(`/comments/${commentId}/like`);
  return response.data;
};

// Flag comment
export const flagComment = async (commentId, reason) => {
  const response = await api.post(`/comments/${commentId}/flag`, { reason });
  return response.data;
};

// Get replies to a comment
export const getReplies = async (commentId, params = {}) => {
  const response = await api.get(`/comments/${commentId}/replies`, { params });
  return response.data;
};

// Create reply to a comment
export const createReply = async (commentId, content) => {
  const response = await api.post(`/comments/${commentId}/replies`, { content });
  return response.data;
};
