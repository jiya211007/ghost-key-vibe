import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';

// Generate access token
export const generateAccessToken = (userId, role) => {
  const payload = {
    userId,
    role,
    type: 'access',
    jti: nanoid(16) // JWT ID for token tracking
  };

  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
    issuer: 'devnovate-blog',
    audience: 'devnovate-users'
  });
};

// Generate refresh token
export const generateRefreshToken = (userId) => {
  const payload = {
    userId,
    type: 'refresh',
    jti: nanoid(32) // Longer ID for refresh tokens
  };

  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
    issuer: 'devnovate-blog',
    audience: 'devnovate-users'
  });
};

// Verify access token
export const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET, {
      issuer: 'devnovate-blog',
      audience: 'devnovate-users'
    });

    if (decoded.type !== 'access') {
      throw new Error('Invalid token type');
    }

    return {
      valid: true,
      expired: false,
      decoded
    };
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return {
        valid: false,
        expired: true,
        decoded: null
      };
    }
    
    return {
      valid: false,
      expired: false,
      decoded: null
    };
  }
};

// Verify refresh token
export const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
      issuer: 'devnovate-blog',
      audience: 'devnovate-users'
    });

    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    return {
      valid: true,
      expired: false,
      decoded
    };
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return {
        valid: false,
        expired: true,
        decoded: null
      };
    }
    
    return {
      valid: false,
      expired: false,
      decoded: null
    };
  }
};

// Decode token without verification (for logging/debugging)
export const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};

// Generate token pair
export const generateTokenPair = (userId, role) => {
  const accessToken = generateAccessToken(userId, role);
  const refreshToken = generateRefreshToken(userId);
  
  return {
    accessToken,
    refreshToken
  };
};

// Generate password reset token
export const generatePasswordResetToken = (userId) => {
  const payload = {
    userId,
    type: 'password_reset',
    jti: nanoid(16)
  };

  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: '1h', // Short expiry for security
    issuer: 'devnovate-blog',
    audience: 'devnovate-users'
  });
};

// Verify password reset token
export const verifyPasswordResetToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET, {
      issuer: 'devnovate-blog',
      audience: 'devnovate-users'
    });

    if (decoded.type !== 'password_reset') {
      throw new Error('Invalid token type');
    }

    return {
      valid: true,
      expired: false,
      decoded
    };
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return {
        valid: false,
        expired: true,
        decoded: null
      };
    }
    
    return {
      valid: false,
      expired: false,
      decoded: null
    };
  }
};

// Generate email verification token
export const generateEmailVerificationToken = (userId) => {
  const payload = {
    userId,
    type: 'email_verification',
    jti: nanoid(16)
  };

  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: '24h',
    issuer: 'devnovate-blog',
    audience: 'devnovate-users'
  });
};

// Verify email verification token
export const verifyEmailVerificationToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET, {
      issuer: 'devnovate-blog',
      audience: 'devnovate-users'
    });

    if (decoded.type !== 'email_verification') {
      throw new Error('Invalid token type');
    }

    return {
      valid: true,
      expired: false,
      decoded
    };
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return {
        valid: false,
        expired: true,
        decoded: null
      };
    }
    
    return {
      valid: false,
      expired: false,
      decoded: null
    };
  }
};

// Get token expiration time
export const getTokenExpiration = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (decoded && decoded.exp) {
      return new Date(decoded.exp * 1000);
    }
    return null;
  } catch (error) {
    return null;
  }
};

// Check if token is expired
export const isTokenExpired = (token) => {
  const expiration = getTokenExpiration(token);
  if (!expiration) return true;
  
  return new Date() > expiration;
};

// Get token payload without verification
export const getTokenPayload = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (decoded && decoded.iat) {
      return {
        ...decoded,
        issuedAt: new Date(decoded.iat * 1000),
        expiresAt: decoded.exp ? new Date(decoded.exp * 1000) : null
      };
    }
    return null;
  } catch (error) {
    return null;
  }
};
