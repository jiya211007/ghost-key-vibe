import api from '../config/api.js';

// Get all articles with filtering and pagination
export const getArticles = async (params = {}) => {
  const response = await api.get('/articles', { params });
  return response.data;
};

// Get article by slug
export const getArticleBySlug = async (slug) => {
  const response = await api.get(`/articles/${slug}`);
  return response.data;
};

// Like an article
export const likeArticle = async (articleId) => {
  const response = await api.post(`/articles/${articleId}/like`);
  return response.data;
};

// Unlike an article
export const unlikeArticle = async (articleId) => {
  const response = await api.delete(`/articles/${articleId}/like`);
  return response.data;
};

// Add comment to article
export const addComment = async (articleId, commentData) => {
  const response = await api.post(`/articles/${articleId}/comments`, commentData);
  return response.data;
};

// Create new article
export const createArticle = async (articleData) => {
  const response = await api.post('/articles', articleData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Update article
export const updateArticle = async (slug, articleData) => {
  const formData = new FormData();
  
  // Append text fields
  Object.keys(articleData).forEach(key => {
    if (key !== 'coverImage') {
      formData.append(key, articleData[key]);
    }
  });
  
  // Append file if exists
  if (articleData.coverImage) {
    formData.append('coverImage', articleData.coverImage);
  }
  
  const response = await api.put(`/articles/${slug}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Delete article
export const deleteArticle = async (slug) => {
  const response = await api.delete(`/articles/${slug}`);
  return response.data;
};

// Search articles
export const searchArticles = async (query, params = {}) => {
  const response = await api.get('/articles/search', {
    params: { q: query, ...params },
  });
  return response.data;
};

// Get trending articles
export const getTrendingArticles = async (params = {}) => {
  const response = await api.get('/articles/trending', { params });
  return response.data;
};

// Get articles by category
export const getArticlesByCategory = async (category, params = {}) => {
  const response = await api.get(`/articles/category/${category}`, { params });
  return response.data;
};

// Get articles by tag
export const getArticlesByTag = async (tag, params = {}) => {
  const response = await api.get(`/articles/tag/${tag}`, { params });
  return response.data;
};

// Get articles by author
export const getArticlesByAuthor = async (authorId, params = {}) => {
  const response = await api.get(`/articles/author/${authorId}`, { params });
  return response.data;
};

// Increment article views
export const incrementViews = async (slug) => {
  const response = await api.post(`/articles/${slug}/view`);
  return response.data;
};

// Get related articles
export const getRelatedArticles = async (slug, params = {}) => {
  const response = await api.get(`/articles/${slug}/related`, { params });
  return response.data;
};

// Admin: Update article status
export const updateArticleStatus = async (articleId, status) => {
  const response = await api.put(`/admin/articles/${articleId}/status`, { status });
  return response.data;
};
