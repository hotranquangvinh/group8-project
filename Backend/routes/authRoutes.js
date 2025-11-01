const express = require('express');
const router = express.Router();
const { 
  signup, 
  login, 
  logout, 
  refreshToken, 
  forgotPassword, 
  resetPassword,
  debugResetPassword 
} = require('../controllers/authController');

// Auth routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh', refreshToken); // 🔥 route mới để cấp Access Token mới

// Forgot Password & Reset Password routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// DEBUG route - remove in production
router.post('/debug/reset-password', debugResetPassword);

module.exports = router;