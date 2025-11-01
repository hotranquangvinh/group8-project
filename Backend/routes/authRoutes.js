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

// 🧩 Import middleware Rate Limiter cho chống brute force
const { loginLimiter } = require('../middleware/rateLimiter');

// ============================================
// 🔐 AUTH ROUTES
// ============================================

// Đăng ký
router.post('/signup', signup);

// Đăng nhập (có rate limit)
router.post('/login', loginLimiter, login); // ✅ Thêm rate limiter ở đây

// Đăng xuất
router.post('/logout', logout);

// Refresh token (cấp Access Token mới)
router.post('/refresh', refreshToken);

// Quên mật khẩu & đặt lại mật khẩu
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// DEBUG: Reset thủ công (chỉ dùng khi test)
router.post('/debug/reset-password', debugResetPassword);

module.exports = router;
