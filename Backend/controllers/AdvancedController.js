const User = require('../models/User');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { cloudinary, uploadImage } = require('../config/cloudinary'); // destructure đúng
const multer = require('multer');
const fs = require('fs'); // để xóa file sau khi upload

// === Forgot Password ===
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Email không tồn tại' });

    // Tạo token reset
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 phút
    await user.save();

    // Link trỏ đến frontend (port 3001) để hiển thị form đổi mật khẩu
    const resetUrl = `http://localhost:3001/reset-password/${resetToken}`;

    // Gửi email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      to: user.email,
      subject: 'Yêu cầu đặt lại mật khẩu',
      html: `<p>Nhấn vào link sau để đặt lại mật khẩu:</p>
             <a href="${resetUrl}">${resetUrl}</a>`,
    });

    res.json({ message: 'Đã gửi email reset mật khẩu!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// === Reset Password ===
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });

    user.password = password; // để hook tự hash
user.resetPasswordToken = undefined;
user.resetPasswordExpire = undefined;
await user.save();

    res.json({ message: 'Đổi mật khẩu thành công!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// === Upload Avatar ===
const uploadAvatar = async (req, res) => {
  try {
    console.log('📷 Upload avatar request received');
    console.log('User:', req.user?.id);
    console.log('File:', req.file);

    if (!req.file) {
      return res.status(400).json({ message: 'Chưa chọn file ảnh' });
    }

    // Upload lên Cloudinary
    console.log('⬆️ Uploading to Cloudinary...');
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'avatars',
      resource_type: 'image',
    });
    
    console.log('✅ Cloudinary upload success:', result.secure_url);

    // Xóa file tạm
    fs.unlinkSync(req.file.path);
    console.log('🗑️ Temp file deleted');

    // Cập nhật avatar vào database
const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy user' });
    }

    user.avatar = result.secure_url;
    await user.save();

    console.log('💾 Avatar saved to database');
    
    res.json({ 
      message: 'Upload avatar thành công!', 
      avatar: user.avatar 
    });
  } catch (err) {
    console.error('❌ Upload avatar error:', err);
    
    // Xóa file tạm nếu có lỗi
    if (req.file?.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        console.error('Error deleting temp file:', e);
      }
    }
    
    res.status(500).json({ 
      message: 'Lỗi upload avatar: ' + err.message 
    });
  }
};

// === Export ===
module.exports = { forgotPassword, resetPassword, uploadAvatar };