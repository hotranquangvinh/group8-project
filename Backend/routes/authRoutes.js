const express = require('express');
const router = express.Router();
const { signup, login, logout, refreshToken, debugResetPassword } = require('../controllers/authController');

// Auth routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh', refreshToken); // 🔥 route mới để cấp Access Token mới

// DEBUG route - remove in production
router.post('/debug/reset-password', debugResetPassword);

module.exports = router;
