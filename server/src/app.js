import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

// Import middleware
import { customDevFormat, customProdFormat, errorLogger } from './config/logger.js';
import { rateLimiters } from './middleware/rateLimit.js';
import { errorHandler, notFound, setupGlobalErrorHandlers } from './middleware/errorHandler.js';
import { sanitizeBody, sanitizeQuery, sanitizeParams } from './middleware/validate.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import articleRoutes from './routes/article.routes.js';
import commentRoutes from './routes/comment.routes.js';
import likeRoutes from './routes/like.routes.js';
import adminRoutes from './routes/admin.routes.js';

// Import database connection
import { connectDB } from './config/db.js';
import { verifyConnection as verifyEmailConnection } from './config/mailer.js';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();

// Setup global error handlers
setupGlobalErrorHandlers();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration - Dynamic for deployment
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  'https://your-vercel-domain.vercel.app' // Replace with your actual domain
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // In production, be more strict
    if (process.env.NODE_ENV === 'production') {
      return callback(new Error('CORS: Origin not allowed'), false);
    }
    
    // In development, allow all origins
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count']
}));

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// Request logging
if (process.env.NODE_ENV === 'development') {
  app.use(customDevFormat);
} else {
  app.use(customProdFormat);
}

// Input sanitization
app.use(sanitizeBody);
app.use(sanitizeQuery);
app.use(sanitizeParams);

// Rate limiting (relaxed for demo)
// app.use(rateLimiters.default); // Commented out for demo purposes

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes (rate limiting relaxed for demo)
app.use('/api/auth', authRoutes); // Remove rate limiting for auth
app.use('/api/users', userRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/admin', adminRoutes); // Remove rate limiting for admin

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// API documentation
app.get('/api/docs', (req, res) => {
  res.json({
    success: true,
    message: 'API Documentation',
    version: '1.0.0',
    endpoints: {
      auth: {
        base: '/api/auth',
        routes: [
          'POST /register - User registration',
          'POST /login - User login',
          'POST /refresh - Refresh access token',
          'POST /logout - User logout',
          'POST /logout-all - Logout from all devices',
          'GET /me - Get current user',
          'POST /forgot-password - Request password reset',
          'POST /reset-password - Reset password',
          'POST /change-password - Change password',
          'POST /verify-email - Request email verification'
        ]
      },
      users: {
        base: '/api/users',
        routes: [
          'GET / - Get all users (admin only)',
          'GET /:id - Get user by ID',
          'PUT /:id - Update user profile',
          'DELETE /:id - Delete user (admin only)'
        ]
      },
      articles: {
        base: '/api/articles',
        routes: [
          'GET / - Get all published articles',
          'POST / - Create new article',
          'GET /:id - Get article by ID',
          'PUT /:id - Update article',
          'DELETE /:id - Delete article',
          'GET /search - Search articles',
          'GET /trending - Get trending articles',
          'GET /featured - Get featured articles',
          'GET /category/:category - Get articles by category'
        ]
      },
      comments: {
        base: '/api/comments',
        routes: [
          'GET /article/:articleId - Get comments for article',
          'POST / - Create new comment',
          'PUT /:id - Update comment',
          'DELETE /:id - Delete comment',
          'POST /:id/reply - Reply to comment'
        ]
      },
      likes: {
        base: '/api/likes',
        routes: [
          'POST / - Like/unlike content',
          'GET /user/:userId - Get user likes',
          'GET /article/:articleId - Get article likes'
        ]
      },
      admin: {
        base: '/api/admin',
        routes: [
          'GET /articles/pending - Get pending articles',
          'POST /articles/:id/moderate - Moderate article',
          'GET /users - Get all users',
          'PUT /users/:id/role - Update user role',
          'GET /analytics - Get platform analytics'
        ]
      }
    },
    authentication: {
      type: 'JWT',
      accessToken: 'Bearer token in Authorization header',
      refreshToken: 'HttpOnly cookie'
    }
  });
});

// 404 handler for undefined routes
app.use(notFound);

// Error handling middleware (must be last)
app.use(errorHandler);

// Database connection will be handled in server.js after environment variables are loaded

export default app;
