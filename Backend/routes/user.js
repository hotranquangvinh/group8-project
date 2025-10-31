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
// 🧩 USER MANAGEMENT (RBAC)
// ==========================
router.get('/', protect, checkRole('Admin', 'Moderator'), userController.getUsers);
router.get('/:id', protect, userController.getUserById);
router.put('/:id', protect, userController.updateUser);
router.delete('/:id', protect, userController.deleteUser);
router.put('/:id/change-role', protect, checkRole('Admin'), userController.changeUserRole);
router.put('/:id/reset-password', protect, checkRole('Admin'), userController.resetUserPassword);

// ==========================
// 🖼️ POST /api/users/avatar (UPLOAD AVATAR)
// ==========================
router.post('/avatar', protect, upload.single('avatar'), async (req, res) => {
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
});

module.exports = router;
