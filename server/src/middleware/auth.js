import { verifyAccessToken } from '../utils/jwt.js';
import User from '../models/User.js';

// Middleware to verify JWT access token
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required',
        code: 'TOKEN_MISSING'
      });
    }

    const result = verifyAccessToken(token);
    
    if (!result.valid) {
      if (result.expired) {
        return res.status(401).json({
          success: false,
          message: 'Access token has expired',
          code: 'TOKEN_EXPIRED'
        });
      } else {
        return res.status(401).json({
          success: false,
          message: 'Invalid access token',
          code: 'TOKEN_INVALID'
        });
      }
    }

    // Fetch user from database to ensure they still exist and are active
    const user = await User.findById(result.decoded.userId).select('-password -refreshTokens');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account is deactivated',
        code: 'USER_DEACTIVATED'
      });
    }

    // Attach user to request object
    req.user = user;
    req.token = result.decoded;
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed',
      code: 'AUTH_ERROR'
    });
  }
};

// Middleware to check if user is authenticated (optional)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const result = verifyAccessToken(token);
      
      if (result.valid) {
        const user = await User.findById(result.decoded.userId).select('-password -refreshTokens');
        
        if (user && user.isActive) {
          req.user = user;
          req.token = result.decoded;
        }
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication for optional routes
    next();
  }
};

// Middleware to check if user has required role
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        requiredRoles: roles,
        userRole: req.user.role
      });
    }

    next();
  };
};

// Middleware to check if user is admin
export const requireAdmin = (req, res, next) => {
  return requireRole('admin')(req, res, next);
};

// Middleware to check if user is moderator or admin
export const requireModerator = (req, res, next) => {
  return requireRole('moderator', 'admin')(req, res, next);
};

// Middleware to check if user owns the resource or is admin
export const requireOwnershipOrAdmin = (resourceModel, resourceIdField = 'id') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
      }

      // Admin can access everything
      if (req.user.role === 'admin') {
        return next();
      }

      const resourceId = req.params[resourceIdField] || req.body[resourceIdField];
      
      if (!resourceId) {
        return res.status(400).json({
          success: false,
          message: 'Resource ID is required',
          code: 'RESOURCE_ID_MISSING'
        });
      }

      const resource = await resourceModel.findById(resourceId);
      
      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found',
          code: 'RESOURCE_NOT_FOUND'
        });
      }

      // Check if user owns the resource
      if (resource.author && resource.author.toString() === req.user._id.toString()) {
        return next();
      }

      // Check if user is the resource owner (for user-specific resources)
      if (resource.user && resource.user.toString() === req.user._id.toString()) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only modify your own resources',
        code: 'ACCESS_DENIED'
      });
    } catch (error) {
      console.error('Ownership check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Ownership verification failed',
        code: 'OWNERSHIP_CHECK_ERROR'
      });
    }
  };
};

// Middleware to check if user can moderate content
export const requireModerationRights = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
  }

  if (!req.user.isModerator()) {
    return res.status(403).json({
      success: false,
      message: 'Moderation rights required',
      code: 'MODERATION_RIGHTS_REQUIRED'
    });
  }

  next();
};

// Middleware to rate limit based on user role
export const roleBasedRateLimit = (limits) => {
  return (req, res, next) => {
    if (!req.user) {
      // Apply default limits for unauthenticated users
      req.rateLimit = limits.default || { windowMs: 15 * 60 * 1000, max: 100 };
    } else {
      // Apply role-based limits
      req.rateLimit = limits[req.user.role] || limits.default || { windowMs: 15 * 60 * 1000, max: 100 };
    }
    
    next();
  };
};

// Middleware to log authentication attempts
export const logAuthAttempt = (req, res, next) => {
  const logData = {
    timestamp: new Date().toISOString(),
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    endpoint: req.originalUrl,
    method: req.method
  };

  if (req.user) {
    logData.userId = req.user._id;
    logData.username = req.user.username;
    logData.role = req.user.role;
  }

  console.log('🔐 Auth attempt:', logData);
  next();
};

// Middleware to refresh token if needed
export const refreshTokenIfNeeded = async (req, res, next) => {
  try {
    if (!req.user || !req.token) {
      return next();
    }

    const tokenExp = req.token.exp;
    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = tokenExp - now;

    // If token expires in less than 5 minutes, set refresh flag
    if (timeUntilExpiry < 300) {
      req.shouldRefreshToken = true;
    }

    next();
  } catch (error) {
    next();
  }
};
