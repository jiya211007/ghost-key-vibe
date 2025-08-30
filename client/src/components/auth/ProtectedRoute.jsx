import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const ProtectedRoute = ({ children, requireAdmin = false, requireModerator = false }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check admin requirement
  if (requireAdmin && user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl font-bold text-danger-300 mb-4">403</div>
          <h1 className="text-2xl font-semibold text-gray-800 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-8">
            You don't have permission to access this page. Admin privileges required.
          </p>
          <button
            onClick={() => window.history.back()}
            className="btn btn-primary"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Check moderator requirement
  if (requireModerator && !['moderator', 'admin'].includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl font-bold text-warning-300 mb-4">403</div>
          <h1 className="text-2xl font-semibold text-gray-800 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-8">
            You don't have permission to access this page. Moderator privileges required.
          </p>
          <button
            onClick={() => window.history.back()}
            className="btn btn-primary"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // User is authenticated and has required permissions
  return children || <Outlet />;
};

export default ProtectedRoute;
