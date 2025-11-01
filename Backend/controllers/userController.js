// controllers/userController.js
const User = require('../models/User');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const cloudinary = require('../config/cloudinary'); // dùng config chính xác

// ===========================
// 🟢 LẤY DANH SÁCH USER
// ===========================
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// ===========================
// 🟢 LẤY USER THEO ID
// ===========================
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (req.user.role !== 'Admin' && req.user._id.toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// ===========================
// 🟢 TẠO USER
// ===========================
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email đã tồn tại' });

    const newUser = new User({ name, email, password, role });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// ===========================
// 🟢 CẬP NHẬT USER
// ===========================
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (req.user.role !== 'Admin' && req.user._id.toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    if (req.user.role === 'Admin' && role) user.role = role;

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: 'Update failed: ' + error.message });
  }
};

// ===========================
// 🔴 XOÁ USER
// ===========================
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (req.user.role !== 'Admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// ===========================
// 🔑 ĐỔI ROLE USER (Admin)
// ===========================
exports.changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['Admin', 'Moderator', 'User'].includes(role)) {
      return res.status(400).json({ message: 'Role không hợp lệ.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User không tồn tại' });

    user.role = role;
    await user.save();

    res.json({
      message: `Đã cập nhật role của ${user.name} thành ${role}`,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server: ' + error.message });
  }
};

// ===========================
// 🔑 RESET PASSWORD (Admin)
// ===========================
exports.resetUserPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User không tồn tại' });

    user.password = newPassword;
    await user.save();

    res.json({ message: `Đã reset mật khẩu cho ${user.email}`, email: user.email });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server: ' + error.message });
  }
};

// ===========================
// 🧩 UPLOAD AVATAR (Cloudinary)
// ===========================
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng chọn ảnh để upload' });
    }

    // 🔹 Resize tạm thời ảnh bằng Sharp
    const resizedPath = path.join(__dirname, `../uploads/resized-${req.file.filename}`);
    await sharp(req.file.path)
      .resize(300, 300)
      .toFile(resizedPath);

    // 🔹 Upload lên Cloudinary
    const result = await cloudinary.uploader.upload(resizedPath, {
      folder: 'avatars',
      use_filename: true,
      unique_filename: false,
    });

    // 🔹 Cập nhật vào MongoDB
    req.user.avatar = result.secure_url;
    await req.user.save();

    // 🔹 Xóa file tạm
    fs.unlinkSync(req.file.path);
    fs.unlinkSync(resizedPath);

    res.json({
      message: 'Upload avatar thành công!',
      avatarUrl: result.secure_url,
    });
  } catch (error) {
    console.error('❌ Upload avatar failed:', error);
    res.status(500).json({ message: 'Lỗi upload avatar: ' + error.message });
  }
};
