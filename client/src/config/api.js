import axios from 'axios';

// Environment-based API configuration
const getBaseURL = () => {
  // In production (Vercel), use the deployment URL
  if (process.env.NODE_ENV === 'production') {
    return process.env.VITE_API_URL || 'https://your-vercel-domain.vercel.app/api';
  }
  
  // In development, use local server
  return import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
};

// Create axios instance with environment-aware configuration
const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  timeout: 30000, // 30 seconds for Vercel functions
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with enhanced error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(`${getBaseURL()}/auth/refresh`, {}, { 
          withCredentials: true,
          timeout: 15000
        });
        
        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export { api, getBaseURL };
export default api;
