import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { checkMemberLoginAccess } from './memberAccessMiddleware.js';

export const authenticate = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      if (!req.user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'User account is inactive'
        });
      }

      // Check member login access (for members only)
      if (req.user.role === 'member' && req.user.canLogin === false) {
        return res.status(403).json({
          success: false,
          message: 'Your login access has been disabled. Please contact your gym administrator.'
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: error.message
    });
  }
};

// Optional authentication - doesn't fail if no token, but populates req.user if token is valid
export const optionalAuthenticate = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(); // No token, continue without authentication
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      if (req.user && !req.user.isActive) {
        // If user is inactive, don't set req.user but continue
        req.user = null;
      }
    } catch (error) {
      // Invalid token, continue without authentication
      req.user = null;
    }

    next();
  } catch (error) {
    // On error, continue without authentication
    next();
  }
};

