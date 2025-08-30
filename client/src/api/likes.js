import api from '../config/api.js';

// Toggle like on content
export const toggleLike = async (likeData) => {
  const response = await api.post('/likes/toggle', likeData);
  return response.data;
};

// Get likes for a specific target
export const getLikesByTarget = async (targetType, targetId, params = {}) => {
  const response = await api.get(`/likes/target/${targetType}/${targetId}`, { params });
  return response.data;
};

// Get likes by a specific user
export const getUserLikes = async (userId, params = {}) => {
  const response = await api.get(`/likes/user/${userId}`, { params });
  return response.data;
};

// Remove a specific like
export const removeLike = async (likeId) => {
  const response = await api.delete(`/likes/${likeId}`);
  return response.data;
};
