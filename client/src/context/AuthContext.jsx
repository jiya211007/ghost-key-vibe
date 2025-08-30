import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

// API functions
import { login as loginApi, register as registerApi, logout as logoutApi, getMe } from '../api/auth.js';

// Create context
const AuthContext = createContext();

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  accessToken: localStorage.getItem('accessToken') || null,
};

// Action types
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_USER: 'SET_USER',
  SET_TOKEN: 'SET_TOKEN',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER',
  CLEAR_AUTH: 'CLEAR_AUTH',
};

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    
    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
      };
    
    case AUTH_ACTIONS.SET_TOKEN:
      return {
        ...state,
        accessToken: action.payload,
      };
    
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        isAuthenticated: true,
        isLoading: false,
      };
    
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
      };
    
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    
    case AUTH_ACTIONS.CLEAR_AUTH:
      return {
        ...state,
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
      };
    
    default:
      return state;
  }
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const queryClient = useQueryClient();

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      
      if (token) {
        try {
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
          const userData = await getMe();
          dispatch({ type: AUTH_ACTIONS.SET_USER, payload: userData.data.user });
        } catch (error) {
          console.error('Auth check failed:', error);
          // Clear invalid token
          localStorage.removeItem('accessToken');
          dispatch({ type: AUTH_ACTIONS.CLEAR_AUTH });
        }
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    checkAuth();
  }, []);

  // Update localStorage when token changes
  useEffect(() => {
    if (state.accessToken) {
      localStorage.setItem('accessToken', state.accessToken);
    } else {
      localStorage.removeItem('accessToken');
    }
  }, [state.accessToken]);

  // Login function
  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      
      const response = await loginApi(credentials);
      const { user, accessToken } = response.data.data;
      
      dispatch({ 
        type: AUTH_ACTIONS.LOGIN_SUCCESS, 
        payload: { user, accessToken } 
      });
      
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      
      const response = await registerApi(userData);
      const { user, accessToken } = response.data.data;
      
      dispatch({ 
        type: AUTH_ACTIONS.LOGIN_SUCCESS, 
        payload: { user, accessToken } 
      });
      
      toast.success('Registration successful! Welcome to Devnovate!');
      return { success: true };
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      if (state.accessToken) {
        await logoutApi();
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear auth state regardless of API call success
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      
      // Clear query cache
      queryClient.clear();
      
      // Clear localStorage
      localStorage.removeItem('accessToken');
      
      toast.success('Logged out successfully');
    }
  };

  // Update user function
  const updateUser = (updates) => {
    dispatch({ type: AUTH_ACTIONS.UPDATE_USER, payload: updates });
  };

  // Check if user has specific role
  const hasRole = (role) => {
    if (!state.user) return false;
    return state.user.role === role;
  };

  // Check if user is admin
  const isAdmin = () => hasRole('admin');

  // Check if user is moderator or admin
  const isModerator = () => hasRole('moderator') || hasRole('admin');

  // Check if user can moderate content
  const canModerate = () => isModerator();

  // Check if user owns resource
  const ownsResource = (resourceUserId) => {
    if (!state.user) return false;
    return state.user._id === resourceUserId;
  };

  // Check if user can edit resource
  const canEditResource = (resourceUserId) => {
    return isAdmin() || ownsResource(resourceUserId);
  };

  // Check if user can delete resource
  const canDeleteResource = (resourceUserId) => {
    return isAdmin() || ownsResource(resourceUserId);
  };

  // Get user's display name
  const getUserDisplayName = () => {
    if (!state.user) return '';
    return state.user.username || `${state.user.firstName} ${state.user.lastName}`;
  };

  // Context value
  const value = {
    // State
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    accessToken: state.accessToken,
    
    // Actions
    login,
    register,
    logout,
    updateUser,
    
    // Utility functions
    hasRole,
    isAdmin,
    isModerator,
    canModerate,
    ownsResource,
    canEditResource,
    canDeleteResource,
    getUserDisplayName,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// Export action types for testing
export { AUTH_ACTIONS };
