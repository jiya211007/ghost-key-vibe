import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    default: ''
  },
  avatar: {
    type: String,
    default: ''
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true // Allow multiple null values
  },
  role: {
    type: String,
    enum: ['user', 'moderator', 'admin'],
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  refreshTokens: [{
    token: String,
    expiresAt: Date
  }],
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for display name
userSchema.virtual('displayName').get(function() {
  return this.username || this.fullName;
});

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to clean refresh tokens
userSchema.pre('save', function(next) {
  // Remove expired refresh tokens
  if (this.refreshTokens && this.refreshTokens.length > 0) {
    this.refreshTokens = this.refreshTokens.filter(token => 
      token.expiresAt > new Date()
    );
  }
  next();
});

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to check if user is admin
userSchema.methods.isAdmin = function() {
  return this.role === 'admin';
};

// Instance method to check if user is moderator or admin
userSchema.methods.isModerator = function() {
  return this.role === 'moderator' || this.role === 'admin';
};

// Instance method to add refresh token with retry logic
userSchema.methods.addRefreshToken = async function(token, expiresAt) {
  try {
    return await this.constructor.findByIdAndUpdate(
      this._id,
      { $push: { refreshTokens: { token, expiresAt } } },
      { new: true, maxTimeMS: 5000 }
    );
  } catch (error) {
    // If there's a conflict, retry once
    if (error.message.includes('conflict')) {
      console.log('Retrying addRefreshToken due to conflict...');
      await new Promise(resolve => setTimeout(resolve, 100));
      return await this.constructor.findByIdAndUpdate(
        this._id,
        { $push: { refreshTokens: { token, expiresAt } } },
        { new: true, maxTimeMS: 5000 }
      );
    }
    throw error;
  }
};

// Instance method to remove refresh token with retry logic
userSchema.methods.removeRefreshToken = async function(token) {
  try {
    return await this.constructor.findByIdAndUpdate(
      this._id,
      { $pull: { refreshTokens: { token } } },
      { new: true, maxTimeMS: 5000 }
    );
  } catch (error) {
    // If there's a conflict, retry once
    if (error.message.includes('conflict')) {
      console.log('Retrying removeRefreshToken due to conflict...');
      await new Promise(resolve => setTimeout(resolve, 100));
      return await this.constructor.findByIdAndUpdate(
        this._id,
        { $pull: { refreshTokens: { token } } },
        { new: true, maxTimeMS: 5000 }
      );
    }
    throw error;
  }
};

// Instance method to replace refresh token safely
userSchema.methods.replaceRefreshToken = async function(oldToken, newToken, expiresAt) {
  try {
    // Use a transaction-like approach with retries
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        // First remove the old token
        if (oldToken) {
          await this.constructor.updateOne(
            { _id: this._id },
            { $pull: { refreshTokens: { token: oldToken } } }
          );
        }
        
        // Then add the new token
        const result = await this.constructor.findByIdAndUpdate(
          this._id,
          { $push: { refreshTokens: { token: newToken, expiresAt } } },
          { new: true, maxTimeMS: 5000 }
        );
        
        return result;
      } catch (error) {
        if (error.message.includes('conflict') && attempt < 2) {
          console.log(`Retrying replaceRefreshToken attempt ${attempt + 1}...`);
          await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1)));
          continue;
        }
        throw error;
      }
    }
  } catch (error) {
    throw error;
  }
};

// Instance method to clear all refresh tokens
userSchema.methods.clearRefreshTokens = function() {
  return this.constructor.findByIdAndUpdate(
    this._id,
    { $set: { refreshTokens: [] } },
    { new: true, maxTimeMS: 5000 }
  );
};

// Static method to find by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find by username
userSchema.statics.findByUsername = function(username) {
  return this.findOne({ username: username.toLowerCase() });
};

// Static method to find active users
userSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

// Static method to find by role
userSchema.statics.findByRole = function(role) {
  return this.find({ role, isActive: true });
};

const User = mongoose.model('User', userSchema);

export default User;
