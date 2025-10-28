const User = require('../models/User');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const cloudinary = require('../config/cloudinary'); // file config Cloudinary
const multer = require('multer');

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
const upload = multer({ dest: 'uploads/' }); // tạm lưu file trước khi upload

const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Chưa chọn file ảnh' });

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'avatars',
    });

    const user = await User.findById(req.user.id); // req.user từ authMiddleware
    user.avatar = result.secure_url;
    await user.save();

    res.json({ message: 'Upload avatar thành công!', avatar: user.avatar });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// === Export ===
module.exports = { forgotPassword, resetPassword, uploadAvatar };