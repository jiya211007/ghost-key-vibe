import rateLimit from 'express-rate-limit';
import { roleBasedRateLimit } from './auth.js';

// Default rate limit configuration (relaxed for demo)
const defaultLimits = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Very high limit for demo - limit each IP to 1000 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Store client IP in req.ip
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress || 'unknown';
  },
  // Custom handler for rate limit exceeded
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again later',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(req.rateLimit.windowMs / 1000)
    });
  },
  // Skip successful requests (optional)
  skipSuccessfulRequests: true,
  // Skip failed requests (optional)
  skipFailedRequests: false
};

// Role-based rate limits (relaxed for demo)
const roleLimits = {
  default: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000
  },
  user: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 2000
  },
  moderator: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5000
  },
  admin: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10000
  }
};

// Create rate limiter with role-based limits
export const createRoleBasedLimiter = () => {
  return rateLimit({
    ...defaultLimits,
    keyGenerator: (req) => {
      // Use user ID if authenticated, otherwise use IP
      if (req.user && req.user._id) {
        return `user:${req.user._id}`;
      }
      return req.ip || req.connection.remoteAddress || 'unknown';
    },
    max: (req) => {
      // Apply role-based limits
      if (req.user) {
        return roleLimits[req.user.role]?.max || roleLimits.default.max;
      }
      return roleLimits.default.max;
    },
    windowMs: (req) => {
      // Apply role-based window
      if (req.user) {
        return roleLimits[req.user.role]?.windowMs || roleLimits.default.windowMs;
      }
      return roleLimits.default.windowMs;
    }
  });
};

// Relaxed rate limiter for authentication endpoints (for demo/development)
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Very high limit for demo purposes - limit each IP to 1000 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later',
    code: 'AUTH_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress || 'unknown';
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts, please try again later',
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(req.rateLimit.windowMs / 1000)
    });
  },
  skipSuccessfulRequests: true, // Don't count successful requests
  skipFailedRequests: false
});

// Rate limiter for article creation
export const articleCreationRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: (req) => {
    // Different limits based on user role
    if (req.user?.role === 'admin') return 20;
    if (req.user?.role === 'moderator') return 10;
    if (req.user?.role === 'user') return 5;
    return 1; // Unauthenticated users
  },
  message: {
    success: false,
    message: 'Too many article creation attempts, please try again later',
    code: 'ARTICLE_CREATION_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    if (req.user && req.user._id) {
      return `article_creation:${req.user._id}`;
    }
    return req.ip || req.connection.remoteAddress || 'unknown';
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many article creation attempts, please try again later',
      code: 'ARTICLE_CREATION_RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(req.rateLimit.windowMs / 1000)
    });
  }
});

// Rate limiter for comment creation
export const commentCreationRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: (req) => {
    if (req.user?.role === 'admin') return 50;
    if (req.user?.role === 'moderator') return 30;
    if (req.user?.role === 'user') return 10;
    return 3; // Unauthenticated users
  },
  message: {
    success: false,
    message: 'Too many comment creation attempts, please try again later',
    code: 'COMMENT_CREATION_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    if (req.user && req.user._id) {
      return `comment_creation:${req.user._id}`;
    }
    return req.ip || req.connection.remoteAddress || 'unknown';
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many comment creation attempts, please try again later',
      code: 'COMMENT_CREATION_RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(req.rateLimit.windowMs / 1000)
    });
  }
});

// Rate limiter for search queries
export const searchRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: (req) => {
    if (req.user?.role === 'admin') return 100;
    if (req.user?.role === 'moderator') return 50;
    if (req.user?.role === 'user') return 20;
    return 10; // Unauthenticated users
  },
  message: {
    success: false,
    message: 'Too many search requests, please try again later',
    code: 'SEARCH_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    if (req.user && req.user._id) {
      return `search:${req.user._id}`;
    }
    return req.ip || req.connection.remoteAddress || 'unknown';
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many search requests, please try again later',
      code: 'SEARCH_RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(req.rateLimit.windowMs / 1000)
    });
  }
});

// Rate limiter for file uploads
export const uploadRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: (req) => {
    if (req.user?.role === 'admin') return 50;
    if (req.user?.role === 'moderator') return 25;
    if (req.user?.role === 'user') return 10;
    return 2; // Unauthenticated users
  },
  message: {
    success: false,
    message: 'Too many file upload attempts, please try again later',
    code: 'UPLOAD_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    if (req.user && req.user._id) {
      return `upload:${req.user._id}`;
    }
    return req.ip || req.connection.remoteAddress || 'unknown';
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many file upload attempts, please try again later',
      code: 'UPLOAD_RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(req.rateLimit.windowMs / 1000)
    });
  }
});

// Rate limiter for admin actions
export const adminActionRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: (req) => {
    if (req.user?.role === 'admin') return 100;
    if (req.user?.role === 'moderator') return 50;
    return 0; // Other users cannot perform admin actions
  },
  message: {
    success: false,
    message: 'Too many admin actions, please try again later',
    code: 'ADMIN_ACTION_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    if (req.user && req.user._id) {
      return `admin_action:${req.user._id}`;
    }
    return 'unauthorized';
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many admin actions, please try again later',
      code: 'ADMIN_ACTION_RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(req.rateLimit.windowMs / 1000)
    });
  }
});

// Rate limiter for password reset requests
export const passwordResetRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 password reset requests per hour
  message: {
    success: false,
    message: 'Too many password reset requests, please try again later',
    code: 'PASSWORD_RESET_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress || 'unknown';
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many password reset requests, please try again later',
      code: 'PASSWORD_RESET_RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(req.rateLimit.windowMs / 1000)
    });
  }
});

// Rate limiter for email verification requests
export const emailVerificationRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 email verification requests per hour
  message: {
    success: false,
    message: 'Too many email verification requests, please try again later',
    code: 'EMAIL_VERIFICATION_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress || 'unknown';
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many email verification requests, please try again later',
      code: 'EMAIL_VERIFICATION_RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(req.rateLimit.windowMs / 1000)
    });
  }
});

// Dynamic rate limiter that can be configured per route
export const createDynamicLimiter = (options = {}) => {
  return rateLimit({
    ...defaultLimits,
    ...options,
    keyGenerator: options.keyGenerator || defaultLimits.keyGenerator,
    handler: options.handler || defaultLimits.handler
  });
};

// Export all rate limiters
export const rateLimiters = {
  default: createRoleBasedLimiter(),
  auth: authRateLimit,
  articleCreation: articleCreationRateLimit,
  commentCreation: commentCreationRateLimit,
  search: searchRateLimit,
  upload: uploadRateLimit,
  adminAction: adminActionRateLimit,
  passwordReset: passwordResetRateLimit,
  emailVerification: emailVerificationRateLimit
};

// Specific rate limiters for different routes
export const userRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this user, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

export const articleRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: 'Too many article requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

export const commentRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: 'Too many comment requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

export const likeRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many like requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

export const adminRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per windowMs
  message: 'Too many admin requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
