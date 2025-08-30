import { body, param, query, validationResult } from 'express-validator';
import sanitizeHtml from 'sanitize-html';
import xss from 'xss';

// Custom sanitization function
const sanitizeInput = (value) => {
  if (typeof value === 'string') {
    // Remove HTML tags and XSS
    let sanitized = xss(value);
    sanitized = sanitizeHtml(sanitized, {
      allowedTags: [],
      allowedAttributes: {}
    });
    return sanitized.trim();
  }
  return value;
};

// Custom validation for MongoDB ObjectId
const isValidObjectId = (value) => {
  if (!value) return false;
  const objectIdPattern = /^[0-9a-fA-F]{24}$/;
  return objectIdPattern.test(value);
};

// Custom validation for strong password
const isStrongPassword = (value) => {
  if (!value) return false;
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(value);
};

// Custom validation for username
const isValidUsername = (value) => {
  if (!value) return false;
  // 3-30 characters, alphanumeric and underscore only
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
  return usernameRegex.test(value);
};

// Custom validation for email
const isValidEmail = (value) => {
  if (!value) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
};

// Middleware to handle validation results
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages,
      code: 'VALIDATION_ERROR'
    });
  }
  
  next();
};

// Sanitize request body
export const sanitizeBody = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      req.body[key] = sanitizeInput(req.body[key]);
    });
  }
  next();
};

// Sanitize request query parameters
export const sanitizeQuery = (req, res, next) => {
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      req.query[key] = sanitizeInput(req.query[key]);
    });
  }
  next();
};

// Sanitize request parameters
export const sanitizeParams = (req, res, next) => {
  if (req.params) {
    Object.keys(req.params).forEach(key => {
      req.params[key] = sanitizeInput(req.params[key]);
    });
  }
  next();
};

// Validation rules for user registration
export const validateUserRegistration = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .custom(isValidUsername)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .custom(isValidEmail)
    .withMessage('Email format is invalid'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .custom(isStrongPassword)
    .withMessage('Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character'),
  
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),
  
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),
  
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  
  handleValidationErrors
];

// Validation rules for user login
export const validateUserLogin = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Validation rules for article creation
export const validateArticleCreation = [
  body('title')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Title must be between 10 and 200 characters'),
  
  body('content')
    .trim()
    .isLength({ min: 100 })
    .withMessage('Content must be at least 100 characters long'),
  
  body('category')
    .trim()
    .isIn([
      'Technology', 'Programming', 'Design', 'Business', 'Marketing',
      'Productivity', 'Career', 'Education', 'Health', 'Lifestyle', 'Other'
    ])
    .withMessage('Please select a valid category'),
  
  body('tags')
    .optional()
    .isArray({ min: 0, max: 10 })
    .withMessage('Tags must be an array with maximum 10 items'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Each tag must be between 1 and 20 characters'),
  
  body('excerpt')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Excerpt cannot exceed 300 characters'),
  
  body('metaTitle')
    .optional()
    .trim()
    .isLength({ max: 60 })
    .withMessage('Meta title cannot exceed 60 characters'),
  
  body('metaDescription')
    .optional()
    .trim()
    .isLength({ max: 160 })
    .withMessage('Meta description cannot exceed 160 characters'),
  
  handleValidationErrors
];

// Validation rules for article update
export const validateArticleUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Title must be between 10 and 200 characters'),
  
  body('content')
    .optional()
    .trim()
    .isLength({ min: 100 })
    .withMessage('Content must be at least 100 characters long'),
  
  body('category')
    .optional()
    .trim()
    .isIn([
      'Technology', 'Programming', 'Design', 'Business', 'Marketing',
      'Productivity', 'Career', 'Education', 'Health', 'Lifestyle', 'Other'
    ])
    .withMessage('Please select a valid category'),
  
  body('tags')
    .optional()
    .isArray({ min: 0, max: 10 })
    .withMessage('Tags must be an array with maximum 10 items'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Each tag must be between 1 and 20 characters'),
  
  body('excerpt')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Excerpt cannot exceed 300 characters'),
  
  handleValidationErrors
];

// Validation rules for comment creation
export const validateCommentCreation = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters'),
  
  body('article')
    .custom(isValidObjectId)
    .withMessage('Invalid article ID'),
  
  body('parentComment')
    .optional()
    .custom(isValidObjectId)
    .withMessage('Invalid parent comment ID'),
  
  handleValidationErrors
];

// Validation rules for comment update
export const validateCommentUpdate = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters'),
  
  handleValidationErrors
];

// Validation rules for user profile update
export const validateUserProfileUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),
  
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .custom(isValidUsername)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  handleValidationErrors
];

// Validation rules for password change
export const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .custom(isStrongPassword)
    .withMessage('New password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    }),
  
  handleValidationErrors
];

// Validation rules for article ID parameter
export const validateArticleId = [
  param('id')
    .custom(isValidObjectId)
    .withMessage('Invalid article ID'),
  
  handleValidationErrors
];

// Validation rules for comment ID parameter
export const validateCommentId = [
  param('id')
    .custom(isValidObjectId)
    .withMessage('Invalid comment ID'),
  
  handleValidationErrors
];

// Validation rules for user ID parameter
export const validateUserId = [
  param('id')
    .custom(isValidObjectId)
    .withMessage('Invalid user ID'),
  
  handleValidationErrors
];

// Validation rules for search queries
export const validateSearchQuery = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  
  query('category')
    .optional()
    .trim()
    .isIn([
      'Technology', 'Programming', 'Design', 'Business', 'Marketing',
      'Productivity', 'Career', 'Education', 'Health', 'Lifestyle', 'Other'
    ])
    .withMessage('Invalid category'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('sort')
    .optional()
    .isIn(['newest', 'oldest', 'popular', 'trending'])
    .withMessage('Invalid sort option'),
  
  handleValidationErrors
];

// Validation rules for pagination
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  handleValidationErrors
];

// Validation rules for admin actions
export const validateAdminAction = [
  body('action')
    .isIn(['approve', 'reject', 'hide', 'feature', 'unfeature', 'delete'])
    .withMessage('Invalid action'),
  
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Reason cannot exceed 500 characters'),
  
  handleValidationErrors
];

// Additional validation rules for new routes
export const validateProfileUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters'),
  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar must be a valid URL'),
  handleValidationErrors,
];

export const validateUserSearch = [
  query('q')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Search query must be at least 2 characters'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors,
];

export const validateArticleSearch = [
  query('q')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Search query must be at least 2 characters'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category cannot be empty'),
  query('tag')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Tag cannot be empty'),
  query('sortBy')
    .optional()
    .isIn(['relevance', 'date', 'views', 'likes'])
    .withMessage('Invalid sort option'),
  handleValidationErrors,
];

export const validateBulkAction = [
  body('action')
    .isIn(['approve', 'reject', 'hide'])
    .withMessage('Invalid action type'),
  body('targetType')
    .isIn(['articles', 'comments'])
    .withMessage('Invalid target type'),
  body('targetIds')
    .isArray({ min: 1 })
    .withMessage('Target IDs must be a non-empty array'),
  body('targetIds.*')
    .custom(isValidObjectId)
    .withMessage('Invalid target ID format'),
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Reason must be less than 500 characters'),
  handleValidationErrors,
];

export const validateUserRoleUpdate = [
  body('role')
    .isIn(['user', 'moderator', 'admin'])
    .withMessage('Invalid role. Must be user, moderator, or admin'),
  handleValidationErrors,
];
