import express from 'express';
import {
  register,
  login,
  refreshToken,
  logout,
  logoutAll,
  getMe,
  forgotPassword,
  resetPassword,
  changePassword,
  requestEmailVerification,
  verifyEmail,
  googleSignIn
} from '../controllers/auth.controller.js';

import {
  validateUserRegistration,
  validateUserLogin,
  validatePasswordChange,
  validateUserId
} from '../middleware/validate.js';

import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', validateUserRegistration, register);
router.post('/login', validateUserLogin, login);
router.post('/google-signin', googleSignIn);
router.post('/refresh', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/verify-email', verifyEmail);

// Protected routes
router.post('/logout', authenticateToken, logout);
router.post('/logout-all', authenticateToken, logoutAll);
router.get('/me', authenticateToken, getMe);
router.post('/change-password', authenticateToken, validatePasswordChange, changePassword);
router.post('/request-email-verification', authenticateToken, requestEmailVerification);

export default router;
