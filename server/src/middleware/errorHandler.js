// Error handling middleware
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error details
  console.error('🚨 Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?._id,
    timestamp: new Date().toISOString()
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = {
      message,
      statusCode: 404,
      code: 'RESOURCE_NOT_FOUND'
    };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    error = {
      message,
      statusCode: 400,
      code: 'DUPLICATE_FIELD',
      field
    };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = {
      message,
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      errors: Object.values(err.errors).map(val => ({
        field: val.path,
        message: val.message,
        value: val.value
      }))
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = {
      message,
      statusCode: 401,
      code: 'INVALID_TOKEN'
    };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = {
      message,
      statusCode: 401,
      code: 'TOKEN_EXPIRED'
    };
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File too large';
    error = {
      message,
      statusCode: 400,
      code: 'FILE_TOO_LARGE'
    };
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    const message = 'Too many files';
    error = {
      message,
      statusCode: 400,
      code: 'TOO_MANY_FILES'
    };
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Unexpected file field';
    error = {
      message,
      statusCode: 400,
      code: 'UNEXPECTED_FILE_FIELD'
    };
  }

  // Rate limit errors
  if (err.status === 429) {
    error = {
      message: 'Too many requests',
      statusCode: 429,
      code: 'RATE_LIMIT_EXCEEDED'
    };
  }

  // Default error
  const statusCode = error.statusCode || err.statusCode || 500;
  const message = error.message || 'Internal Server Error';
  const code = error.code || 'INTERNAL_SERVER_ERROR';

  // Don't leak error details in production
  const response = {
    success: false,
    message,
    code,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: error
    })
  };

  // Add field-specific errors if they exist
  if (error.errors) {
    response.errors = error.errors;
  }

  // Add field information for duplicate key errors
  if (error.field) {
    response.field = error.field;
  }

  res.status(statusCode).json(response);
};

// 404 handler for undefined routes
export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    code: 'ROUTE_NOT_FOUND'
  });
};

// Async error wrapper
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Custom error class
export class AppError extends Error {
  constructor(message, statusCode, code = 'APP_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error types
export const ErrorTypes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  CONFLICT_ERROR: 'CONFLICT_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  FILE_UPLOAD_ERROR: 'FILE_UPLOAD_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR'
};

// Create specific error types
export const createValidationError = (message, errors = []) => {
  const error = new AppError(message, 400, ErrorTypes.VALIDATION_ERROR);
  error.errors = errors;
  return error;
};

export const createAuthenticationError = (message) => {
  return new AppError(message, 401, ErrorTypes.AUTHENTICATION_ERROR);
};

export const createAuthorizationError = (message) => {
  return new AppError(message, 403, ErrorTypes.AUTHORIZATION_ERROR);
};

export const createNotFoundError = (message) => {
  return new AppError(message, 404, ErrorTypes.NOT_FOUND_ERROR);
};

export const createConflictError = (message) => {
  return new AppError(message, 409, ErrorTypes.CONFLICT_ERROR);
};

export const createRateLimitError = (message) => {
  return new AppError(message, 429, ErrorTypes.RATE_LIMIT_ERROR);
};

export const createFileUploadError = (message) => {
  return new AppError(message, 400, ErrorTypes.FILE_UPLOAD_ERROR);
};

export const createDatabaseError = (message) => {
  return new AppError(message, 500, ErrorTypes.DATABASE_ERROR);
};

export const createExternalServiceError = (message) => {
  return new AppError(message, 502, ErrorTypes.EXTERNAL_SERVICE_ERROR);
};

// Error response formatter
export const formatErrorResponse = (error, req) => {
  const baseResponse = {
    success: false,
    message: error.message,
    code: error.code || 'UNKNOWN_ERROR',
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method
  };

  // Add development details
  if (process.env.NODE_ENV === 'development') {
    baseResponse.stack = error.stack;
    baseResponse.details = {
      name: error.name,
      statusCode: error.statusCode,
      isOperational: error.isOperational
    };
  }

  // Add field-specific errors
  if (error.errors) {
    baseResponse.errors = error.errors;
  }

  // Add field information
  if (error.field) {
    baseResponse.field = error.field;
  }

  return baseResponse;
};

// Global error handler for unhandled rejections
export const handleUnhandledRejection = (reason, promise) => {
  console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
  // In production, you might want to exit the process
  // process.exit(1);
};

// Global error handler for uncaught exceptions
export const handleUncaughtException = (error) => {
  console.error('🚨 Uncaught Exception:', error);
  // In production, you might want to exit the process
  // process.exit(1);
};

// Setup global error handlers
export const setupGlobalErrorHandlers = () => {
  process.on('unhandledRejection', handleUnhandledRejection);
  process.on('uncaughtException', handleUncaughtException);
};
