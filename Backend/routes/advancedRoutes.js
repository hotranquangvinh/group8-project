const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const advancedController = require('../controllers/AdvancedController');

// Tạm lưu file trước khi upload lên Cloudinary
const upload = multer({ dest: 'uploads/' });

// === Forgot Password ===
router.post('/forgot-password', advancedController.forgotPassword);

// === Reset Password ===
router.post('/reset-password/:token', advancedController.resetPassword);

// === Upload Avatar ===
router.post('/upload-avatar', protect, upload.single('avatar'), advancedController.uploadAvatar);

module.exports = router;
