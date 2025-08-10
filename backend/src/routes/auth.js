const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { supabase, db } = require('../config/database');
const { logger } = require('../utils/logger');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Validation middleware
const validateRegistration = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('firstName').trim().isLength({ min: 2 }).withMessage('First name is required'),
  body('lastName').trim().isLength({ min: 2 }).withMessage('Last name is required'),
  body('companyName').trim().isLength({ min: 2 }).withMessage('Company name is required'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number is required')
];

const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

const validatePasswordReset = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required')
];

const validatePasswordChange = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters long')
];

// User registration
router.post('/register', validateRegistration, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors.array()
      });
    }

    const { email, password, firstName, lastName, companyName, phone, role = 'user' } = req.body;

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(409).json({
        error: 'User with this email already exists',
        code: 'USER_EXISTS'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create company first
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert([{
        name: companyName,
        status: 'active',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (companyError) {
      logger.error('Company creation failed', { error: companyError.message });
      return res.status(500).json({
        error: 'Failed to create company',
        code: 'COMPANY_CREATION_FAILED'
      });
    }

    // Create user
    const userData = {
      email,
      password_hash: hashedPassword,
      first_name: firstName,
      last_name: lastName,
      company_id: company.id,
      phone,
      role,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: user, error: userError } = await supabase
      .from('users')
      .insert([userData])
      .select('id, email, first_name, last_name, role, company_id, status')
      .single();

    if (userError) {
      logger.error('User creation failed', { error: userError.message });
      return res.status(500).json({
        error: 'Failed to create user',
        code: 'USER_CREATION_FAILED'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    logger.info('User registered successfully', { userId: user.id, email: user.email });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        companyId: user.company_id
      },
      token,
      company: {
        id: company.id,
        name: company.name
      }
    });
  } catch (error) {
    logger.error('Registration error', { error: error.message, stack: error.stack });
    res.status(500).json({
      error: 'Registration failed',
      code: 'REGISTRATION_ERROR'
    });
  }
});

// User login
router.post('/login', validateLogin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, password_hash, first_name, last_name, role, company_id, status')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    if (user.status !== 'active') {
      return res.status(401).json({
        error: 'Account is inactive',
        code: 'ACCOUNT_INACTIVE'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Update last login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    logger.info('User logged in successfully', { userId: user.id, email: user.email });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        companyId: user.company_id
      },
      token
    });
  } catch (error) {
    logger.error('Login error', { error: error.message, stack: error.stack });
    res.status(500).json({
      error: 'Login failed',
      code: 'LOGIN_ERROR'
    });
  }
});

// Get current user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id, email, first_name, last_name, role, company_id, phone, status,
        created_at, updated_at, last_login,
        companies!inner(name as company_name, status as company_status)
      `)
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        companyId: user.company_id,
        companyName: user.company_name,
        phone: user.phone,
        status: user.status,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        lastLogin: user.last_login
      }
    });
  } catch (error) {
    logger.error('Profile fetch error', { error: error.message, userId: req.user.id });
    res.status(500).json({
      error: 'Failed to fetch profile',
      code: 'PROFILE_FETCH_ERROR'
    });
  }
});

// Update user profile
router.put('/profile', authMiddleware, [
  body('firstName').optional().trim().isLength({ min: 2 }),
  body('lastName').optional().trim().isLength({ min: 2 }),
  body('phone').optional().isMobilePhone()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors.array()
      });
    }

    const { firstName, lastName, phone } = req.body;
    const updates = { updated_at: new Date().toISOString() };

    if (firstName) updates.first_name = firstName;
    if (lastName) updates.last_name = lastName;
    if (phone) updates.phone = phone;

    const { data: user, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', req.user.id)
      .select('id, email, first_name, last_name, role, company_id, phone, status')
      .single();

    if (error || !user) {
      return res.status(500).json({
        error: 'Failed to update profile',
        code: 'PROFILE_UPDATE_ERROR'
      });
    }

    logger.info('Profile updated successfully', { userId: req.user.id });

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        companyId: user.company_id,
        phone: user.phone
      }
    });
  } catch (error) {
    logger.error('Profile update error', { error: error.message, userId: req.user.id });
    res.status(500).json({
      error: 'Failed to update profile',
      code: 'PROFILE_UPDATE_ERROR'
    });
  }
});

// Change password
router.put('/change-password', authMiddleware, validatePasswordChange, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Get current user with password hash
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', req.user.id)
      .single();

    if (userError || !user) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      return res.status(400).json({
        error: 'Current password is incorrect',
        code: 'INCORRECT_PASSWORD'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    const { error: updateError } = await supabase
      .from('users')
      .update({
        password_hash: hashedPassword,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.user.id);

    if (updateError) {
      return res.status(500).json({
        error: 'Failed to update password',
        code: 'PASSWORD_UPDATE_ERROR'
      });
    }

    logger.info('Password changed successfully', { userId: req.user.id });

    res.json({
      message: 'Password changed successfully'
    });
  } catch (error) {
    logger.error('Password change error', { error: error.message, userId: req.user.id });
    res.status(500).json({
      error: 'Failed to change password',
      code: 'PASSWORD_CHANGE_ERROR'
    });
  }
});

// Request password reset
router.post('/forgot-password', validatePasswordReset, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors.array()
      });
    }

    const { email } = req.body;

    // Check if user exists
    const { data: user } = await supabase
      .from('users')
      .select('id, email, first_name')
      .eq('email', email)
      .single();

    if (user) {
      // Generate reset token (in production, you'd send this via email)
      const resetToken = jwt.sign(
        { userId: user.id, type: 'password_reset' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Store reset token (you'd typically store this in a separate table)
      logger.info('Password reset requested', { userId: user.id, email: user.email });
    }

    // Always return success to prevent email enumeration
    res.json({
      message: 'If an account with that email exists, a password reset link has been sent'
    });
  } catch (error) {
    logger.error('Password reset request error', { error: error.message });
    res.status(500).json({
      error: 'Failed to process password reset request',
      code: 'PASSWORD_RESET_ERROR'
    });
  }
});

// Logout (client-side token removal)
router.post('/logout', authMiddleware, (req, res) => {
  logger.info('User logged out', { userId: req.user.id });
  res.json({
    message: 'Logout successful'
  });
});

// Refresh token
router.post('/refresh', authMiddleware, async (req, res) => {
  try {
    // Get fresh user data
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, role, company_id, status')
      .eq('id', req.user.id)
      .single();

    if (error || !user || user.status !== 'active') {
      return res.status(401).json({
        error: 'User not found or inactive',
        code: 'USER_INVALID'
      });
    }

    // Generate new token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      message: 'Token refreshed successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        companyId: user.company_id
      }
    });
  } catch (error) {
    logger.error('Token refresh error', { error: error.message, userId: req.user.id });
    res.status(500).json({
      error: 'Failed to refresh token',
      code: 'TOKEN_REFRESH_ERROR'
    });
  }
});

module.exports = router; 