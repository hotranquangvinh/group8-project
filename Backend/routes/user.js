// routes/user.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const checkRole = require('../middleware/checkRole');
const { cloudinary } = require('../config/cloudinary');
const User = require('../models/User');
const Log = require('../models/Log');
const logActivity = require('../middleware/logActivity');

// ==========================
// 🧩 Multer cấu hình upload tạm thời (RAM)
// ==========================
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 }, // Giới hạn 3MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Chỉ được upload file ảnh!'), false);
    }
    cb(null, true);
  },
});

// ==========================
// 🧩 USER MANAGEMENT (RBAC) + LOG ACTIVITY
// ==========================

// 📋 Lấy danh sách người dùng
router.get(
  '/',
  protect,
  checkRole('Admin', 'Moderator'),
  async (req, res, next) => {
    await logActivity(req.user._id, 'Xem danh sách người dùng', req.ip);
    next();
  },
  userController.getUsers
);

// 👤 Xem chi tiết người dùng
router.get(
  '/:id',
  protect,
  async (req, res, next) => {
    await logActivity(req.user._id, 'Xem chi tiết người dùng', req.ip);
    next();
  },
  userController.getUserById
);

// ✏️ Cập nhật người dùng
router.put(
  '/:id',
  protect,
  async (req, res, next) => {
    await logActivity(req.user._id, 'Cập nhật người dùng', req.ip);
    next();
  },
  userController.updateUser
);

// ❌ Xóa người dùng
router.delete(
  '/:id',
  protect,
  checkRole('Admin'),
  async (req, res, next) => {
    await logActivity(req.user._id, 'Xóa người dùng', req.ip);
    next();
  },
  userController.deleteUser
);

// 🔄 Thay đổi vai trò
router.put(
  '/:id/change-role',
  protect,
  checkRole('Admin'),
  async (req, res, next) => {
    await logActivity(req.user._id, 'Thay đổi vai trò người dùng', req.ip);
    next();
  },
  userController.changeUserRole
);

// 🔐 Reset mật khẩu người dùng
router.put(
  '/:id/reset-password',
  protect,
  checkRole('Admin'),
  async (req, res, next) => {
    await logActivity(req.user._id, 'Reset mật khẩu người dùng', req.ip);
    next();
  },
  userController.resetUserPassword
);

// ==========================
// 🖼️ POST /api/users/avatar (UPLOAD AVATAR)
// ==========================
router.post(
  '/avatar',
  protect,
  upload.single('avatar'),
  async (req, res, next) => {
    await logActivity(req.user._id, 'Upload avatar', req.ip);
    next();
  },
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Vui lòng chọn ảnh để upload' });
      }

      // Resize ảnh bằng Sharp
      const resizedBuffer = await sharp(req.file.buffer)
        .resize(300, 300)
        .toFormat('jpeg')
        .jpeg({ quality: 80 })
        .toBuffer();

      // Upload lên Cloudinary qua stream
      const streamUpload = () => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'avatars' },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          stream.end(resizedBuffer);
        });
      };

      const uploadResult = await streamUpload();

      // Cập nhật avatar vào DB
      const user = await User.findById(req.user._id);
      user.avatar = uploadResult.secure_url;
      await user.save();

      res.json({
        message: '✅ Upload avatar thành công!',
        avatarUrl: uploadResult.secure_url,
      });
    } catch (error) {
      console.error('❌ Upload avatar failed:', error);
      res.status(500).json({ message: 'Lỗi server: ' + error.message });
    }
  }
);

// ==========================
// 📜 GET /api/users/logs/all - Xem log hoạt động người dùng (Admin)
// ==========================
router.get('/logs/all', protect, checkRole('Admin'), async (req, res) => {
  try {
    const logs = await Log.find()
      .populate('user', 'email role')
      .sort({ timestamp: -1 });
    res.json({ message: '✅ Danh sách log hoạt động', logs });
  } catch (error) {
    console.error('❌ Lỗi lấy logs:', error);
    res.status(500).json({ message: 'Lỗi server: ' + error.message });
  }
});

module.exports = router;
