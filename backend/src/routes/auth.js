// src/routes/auth.js
import express from 'express';
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';

const router = express.Router();

// @desc    Register new user (passenger by default)
// @route   POST /api/v1/auth/register
// @access  Public
router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { email, password, phone, role = 'passenger' } = req.body;
    if (!email || !password) {
      res.status(400);
      throw new Error('Email and password are required');
    }
    const existing = await User.findOne({ email });
    if (existing) {
      res.status(400);
      throw new Error('User already exists');
    }
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const user = await User.create({ email, passwordHash, phone, role });
    // In a real system we'd send verification email / OTP here
    const token = generateToken(user);
    // HttpOnly cookie
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    res.status(201).json({
      message: 'User registered successfully',
      user: { id: user._id, email: user.email, role: user.role },
    });
  })
);

// @desc    Login existing user
// @route   POST /api/v1/auth/login
// @access  Public
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400);
      throw new Error('Email and password are required');
    }
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401);
      throw new Error('Invalid credentials');
    }
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401);
      throw new Error('Invalid credentials');
    }
    const token = generateToken(user);
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    res.json({
      message: 'Logged in successfully',
      user: { id: user._id, email: user.email, role: user.role },
    });
  })
);

// @desc    OTP verification placeholder
// @route   POST /api/v1/auth/otp-verify
// @access  Public
router.post(
  '/otp-verify',
  asyncHandler(async (req, res) => {
    // In a real implementation we would verify an OTP sent via SMS/email.
    // Here we simply respond with success for demo purposes.
    res.json({ message: 'OTP verified (stub)' });
  })
);

// @desc    Forgot password placeholder
// @route   POST /api/v1/auth/forgot-password
// @access  Public
router.post(
  '/forgot-password',
  asyncHandler(async (req, res) => {
    // Generate a reset token, email it to user – stubbed.
    res.json({ message: 'Password reset link sent (stub)' });
  })
);

// @desc    Reset password placeholder
// @route   POST /api/v1/auth/reset-password
// @access  Public
router.post(
  '/reset-password',
  asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;
    // Token verification and password update would go here – stubbed.
    res.json({ message: 'Password has been reset (stub)' });
  })
);

export default router;
