import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

// Layout components
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';

// Pages
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';
import ExplorePage from './pages/ExplorePage.jsx';
import ArticleDetailPage from './pages/ArticleDetailPage.jsx';
import CreateArticlePage from './pages/CreateArticlePage.jsx';
import EditArticlePage from './pages/EditArticlePage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';
import TrendingPage from './pages/TrendingPage.jsx';

// Hooks
import { useAuth } from './context/AuthContext.jsx';

// API functions
import { getMe } from './api/auth.js';

function App() {
  const { user, isAuthenticated } = useAuth();

  // Fetch current user data if authenticated
  const { data: currentUser } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: getMe,
    enabled: isAuthenticated && !user,
    retry: false,
  });

  return (
    <div className="App min-h-screen bg-gray-50">
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Protected routes with layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="explore" element={<ExplorePage />} />
          <Route path="trending" element={<TrendingPage />} />
          <Route path="articles/:slug" element={<ArticleDetailPage />} />
          
          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="create" element={<CreateArticlePage />} />
            <Route path="edit/:slug" element={<EditArticlePage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
          
          {/* Admin routes */}
          <Route element={<ProtectedRoute requireAdmin />}>
            <Route path="admin" element={<AdminDashboardPage />} />
          </Route>
        </Route>
        
        {/* Catch all route */}
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
              <p className="text-xl text-gray-600 mb-8">Page not found</p>
              <a 
                href="/" 
                className="btn btn-primary"
              >
                Go Home
              </a>
            </div>
          </div>
        } />
      </Routes>
    </div>
  );
}

export default App;
