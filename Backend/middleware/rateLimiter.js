// middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

// ⚙️ Giới hạn login: 5 lần / 10 phút
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 phút
  max: 5, // Tối đa 5 lần login
  message: {
    message: "⚠️ Bạn đã đăng nhập quá nhiều lần. Vui lòng thử lại sau 10 phút.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { loginLimiter };
