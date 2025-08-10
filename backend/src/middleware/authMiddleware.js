const jwt = require('jsonwebtoken');
const { supabase } = require('../config/database');
const { logger } = require('../utils/logger');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Access denied. No token provided.',
        code: 'NO_TOKEN'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!decoded.userId) {
      return res.status(401).json({
        error: 'Invalid token format.',
        code: 'INVALID_TOKEN_FORMAT'
      });
    }

    // Verify user exists in Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, role, company_id, status')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      logger.warn('User not found during authentication', { userId: decoded.userId });
      return res.status(401).json({
        error: 'User not found.',
        code: 'USER_NOT_FOUND'
      });
    }

    if (user.status !== 'active') {
      logger.warn('Inactive user attempted access', { userId: decoded.userId, status: user.status });
      return res.status(401).json({
        error: 'User account is inactive.',
        code: 'USER_INACTIVE'
      });
    }

    // Add user info to request object
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      companyId: user.company_id
    };

    // Log successful authentication
    logger.debug('User authenticated successfully', {
      userId: user.id,
      email: user.email,
      role: user.role,
      endpoint: req.originalUrl
    });

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      logger.warn('Invalid JWT token provided', { token: req.headers.authorization?.substring(0, 20) + '...' });
      return res.status(401).json({
        error: 'Invalid token.',
        code: 'INVALID_TOKEN'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      logger.warn('Expired JWT token provided');
      return res.status(401).json({
        error: 'Token expired.',
        code: 'TOKEN_EXPIRED'
      });
    }

    logger.error('Authentication middleware error', {
      error: error.message,
      stack: error.stack,
      endpoint: req.originalUrl
    });

    return res.status(500).json({
      error: 'Authentication error.',
      code: 'AUTH_ERROR'
    });
  }
};

// Role-based access control middleware
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required.',
        code: 'AUTH_REQUIRED'
      });
    }

    if (!roles.includes(req.user.role)) {
      logger.warn('Insufficient permissions', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: roles,
        endpoint: req.originalUrl
      });

      return res.status(403).json({
        error: 'Insufficient permissions.',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    next();
  };
};

// Company access control middleware
const requireCompanyAccess = (companyIdParam = 'companyId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required.',
        code: 'AUTH_REQUIRED'
      });
    }

    const targetCompanyId = req.params[companyIdParam] || req.body.companyId;
    
    if (!targetCompanyId) {
      return res.status(400).json({
        error: 'Company ID is required.',
        code: 'COMPANY_ID_REQUIRED'
      });
    }

    // Allow admin users to access any company
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user belongs to the target company
    if (req.user.companyId !== targetCompanyId) {
      logger.warn('Company access denied', {
        userId: req.user.id,
        userCompanyId: req.user.companyId,
        targetCompanyId,
        endpoint: req.originalUrl
      });

      return res.status(403).json({
        error: 'Access denied to this company.',
        code: 'COMPANY_ACCESS_DENIED'
      });
    }

    next();
  };
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without authentication
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.userId) {
      const { data: user, error } = await supabase
        .from('users')
        .select('id, email, role, company_id, status')
        .eq('id', decoded.userId)
        .single();

      if (!error && user && user.status === 'active') {
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role,
          companyId: user.company_id
        };
      }
    }

    next();
  } catch (error) {
    // Log error but don't fail the request
    logger.debug('Optional authentication failed', { error: error.message });
    next();
  }
};

module.exports = {
  authMiddleware,
  requireRole,
  requireCompanyAccess,
  optionalAuth
}; 