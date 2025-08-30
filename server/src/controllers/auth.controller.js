import User from '../models/User.js';
import { generateTokenPair, generatePasswordResetToken, generateEmailVerificationToken } from '../utils/jwt.js';
import { sendEmail } from '../config/mailer.js';
import { createNotFoundError, createAuthenticationError, createConflictError } from '../middleware/errorHandler.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { email, username, password, firstName, lastName, bio } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }]
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        throw createConflictError('Email already registered');
      }
      if (existingUser.username === username.toLowerCase()) {
        throw createConflictError('Username already taken');
      }
    }

    // Create new user
    const user = new User({
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      password,
      firstName,
      lastName,
      bio: bio || ''
    });

    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokenPair(user._id, user.role);

    // Add refresh token to user
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7); // 7 days
    await user.addRefreshToken(refreshToken, refreshTokenExpiry);

    // Set refresh token as HttpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Send welcome email if SMTP is configured
    if (process.env.SMTP_HOST) {
      try {
        await sendEmail(user.email, 'welcome', {
          userName: user.firstName,
          username: user.username
        });
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't fail registration if email fails
      }
    }

    // Return user data (without password) and access token
    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      bio: user.bio,
      role: user.role,
      isVerified: user.isVerified,
      avatar: user.avatar,
      preferences: user.preferences,
      createdAt: user.createdAt
    };

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userResponse,
        accessToken,
        expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m'
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw createAuthenticationError('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw createAuthenticationError('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw createAuthenticationError('Invalid credentials');
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokenPair(user._id, user.role);

    // Add refresh token and update last login atomically
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7); // 7 days
    
    await User.findByIdAndUpdate(
      user._id,
      {
        $push: { refreshTokens: { token: refreshToken, expiresAt: refreshTokenExpiry } },
        $set: { lastLogin: new Date() }
      },
      { new: true }
    );

    // Set refresh token as HttpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Return user data and access token
    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      bio: user.bio,
      role: user.role,
      isVerified: user.isVerified,
      avatar: user.avatar,
      preferences: user.preferences,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt
    };

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        accessToken,
        expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m'
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.cookies;

    if (!token) {
      throw createAuthenticationError('Refresh token is required');
    }

    // Verify refresh token
    let decoded;
    
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      throw createAuthenticationError('Invalid refresh token');
    }

    // Find user and check if refresh token exists
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      throw createAuthenticationError('User not found or inactive');
    }

    // Check if refresh token exists in user's tokens
    const tokenExists = user.refreshTokens.some(t => t.token === token);
    if (!tokenExists) {
      throw createAuthenticationError('Refresh token not found');
    }

    // Generate new token pair
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokenPair(user._id, user.role);

    // Replace refresh token safely using the new method
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7);
    
    const updatedUser = await user.replaceRefreshToken(token, newRefreshToken, refreshTokenExpiry);
    
    if (!updatedUser) {
      throw createAuthenticationError('Failed to update refresh token');
    }

    // Set new refresh token as HttpOnly cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: newAccessToken,
        expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m'
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.cookies;

    if (token && req.user) {
      // Remove refresh token from user atomically
      await User.findByIdAndUpdate(
        req.user._id,
        { $pull: { refreshTokens: { token } } },
        { new: true }
      );
    }

    // Clear refresh token cookie
    res.clearCookie('refreshToken');

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout from all devices
// @route   POST /api/auth/logout-all
// @access  Private
export const logoutAll = async (req, res, next) => {
  try {
    // Clear all refresh tokens atomically
    await User.findByIdAndUpdate(
      req.user._id,
      { $set: { refreshTokens: [] } },
      { new: true }
    );

    // Clear refresh token cookie
    res.clearCookie('refreshToken');

    res.json({
      success: true,
      message: 'Logged out from all devices'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = req.user;

    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      bio: user.bio,
      role: user.role,
      isVerified: user.isVerified,
      avatar: user.avatar,
      preferences: user.preferences,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.json({
      success: true,
      data: {
        user: userResponse
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request password reset
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if user exists or not
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent'
      });
    }

    // Generate password reset token
    const resetToken = generatePasswordResetToken(user._id);

    // In a real application, you would store this token in the database
    // with an expiration time and send it via email

    // Send password reset email if SMTP is configured
    if (process.env.SMTP_HOST) {
      try {
        const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
        
        // For now, we'll just log the token (in production, send via email)
        console.log('Password reset token:', resetToken);
        console.log('Reset URL:', resetUrl);
        
        // TODO: Send actual email with reset link
        // await sendEmail(user.email, 'passwordReset', {
        //   userName: user.firstName,
        //   resetUrl
        // });
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
        throw createExternalServiceError('Failed to send password reset email');
      }
    }

    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    // Verify reset token
    const jwt = require('jsonwebtoken');
    let decoded;
    
    try {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (error) {
      throw createAuthenticationError('Invalid or expired reset token');
    }

    if (decoded.type !== 'password_reset') {
      throw createAuthenticationError('Invalid token type');
    }

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw createNotFoundError('User not found');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Clear all refresh tokens (force re-login)
    await user.clearRefreshTokens();

    res.json({
      success: true,
      message: 'Password reset successful. Please log in with your new password.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   POST /api/auth/change-password
// @access  Private
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.user;

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw createAuthenticationError('Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Clear all refresh tokens (force re-login)
    await user.clearRefreshTokens();

    res.json({
      success: true,
      message: 'Password changed successfully. Please log in with your new password.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request email verification
// @route   POST /api/auth/verify-email
// @access  Private
export const requestEmailVerification = async (req, res, next) => {
  try {
    const user = req.user;

    if (user.isVerified) {
      return res.json({
        success: true,
        message: 'Email is already verified'
      });
    }

    // Generate verification token
    const verificationToken = generateEmailVerificationToken(user._id);

    // Send verification email if SMTP is configured
    if (process.env.SMTP_HOST) {
      try {
        const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
        
        // For now, we'll just log the token (in production, send via email)
        console.log('Email verification token:', verificationToken);
        console.log('Verification URL:', verificationUrl);
        
        // TODO: Send actual email with verification link
        // await sendEmail(user.email, 'emailVerification', {
        //   userName: user.firstName,
        //   verificationUrl
        // });
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        throw createExternalServiceError('Failed to send verification email');
      }
    }

    res.json({
      success: true,
      message: 'Verification email sent successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify email
// @route   POST /api/auth/verify-email
// @access  Public
export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;

    // Verify token
    const jwt = require('jsonwebtoken');
    let decoded;
    
    try {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (error) {
      throw createAuthenticationError('Invalid or expired verification token');
    }

    if (decoded.type !== 'email_verification') {
      throw createAuthenticationError('Invalid token type');
    }

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw createNotFoundError('User not found');
    }

    if (user.isVerified) {
      return res.json({
        success: true,
        message: 'Email is already verified'
      });
    }

    // Mark email as verified
    user.isVerified = true;
    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Google Sign-In/Sign-Up
// @route   POST /api/auth/google-signin
// @access  Public
export const googleSignIn = async (req, res, next) => {
  try {
    const { uid, email, displayName, photoURL, emailVerified } = req.body;

    if (!uid || !email) {
      throw createAuthenticationError('Google UID and email are required');
    }

    // Check if user already exists
    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      // User exists, update Google info if needed
      if (!user.googleId) {
        user.googleId = uid;
        user.avatar = photoURL || user.avatar;
        user.isVerified = emailVerified || user.isVerified;
        await user.save();
      }
    } else {
      // Create new user from Google data
      const [firstName, ...lastNameParts] = (displayName || 'User').split(' ');
      const lastName = lastNameParts.join(' ') || 'User';
      
      user = new User({
        email: email.toLowerCase(),
        username: email.split('@')[0].toLowerCase() + '_' + Date.now(), // Generate unique username
        googleId: uid,
        firstName: firstName,
        lastName: lastName,
        bio: `Welcome! I joined using Google Sign-In.`,
        avatar: photoURL || '',
        isVerified: emailVerified || false,
        password: 'google_auth_' + uid, // Placeholder password for Google users
        role: 'user'
      });

      await user.save();
    }

    // Check if user is active
    if (!user.isActive) {
      throw createAuthenticationError('Account is deactivated');
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokenPair(user._id, user.role);

    // Add refresh token and update last login
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7);
    
    await User.findByIdAndUpdate(
      user._id,
      {
        $push: { refreshTokens: { token: refreshToken, expiresAt: refreshTokenExpiry } },
        $set: { lastLogin: new Date() }
      },
      { new: true }
    );

    // Set refresh token as HttpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Return user data and access token
    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      bio: user.bio,
      role: user.role,
      isVerified: user.isVerified,
      avatar: user.avatar,
      preferences: user.preferences,
      googleId: user.googleId,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt
    };

    res.json({
      success: true,
      message: 'Google Sign-In successful',
      data: {
        user: userResponse,
        accessToken,
        expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m'
      }
    });
  } catch (error) {
    next(error);
  }
};
