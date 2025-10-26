const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Đăng ký (Sign Up)
// Note: password hashing is handled by User model pre-save hook
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Kiểm tra email trùng
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email đã tồn tại' });

    // Tạo user mới (password will be hashed by model)
    const newUser = new User({ name, email, password });
    await newUser.save();

    res.status(201).json({ message: 'Đăng ký thành công', user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Đăng nhập (Login)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Tìm user theo email
    const user = await User.findOne({ email });
    console.log('[authController.login] attempt:', { email });
    if (user) console.log('[authController.login] found user, stored password hash:', user.password);
    if (!user) return res.status(400).json({ message: 'Email không tồn tại' });

    // So sánh mật khẩu bằng phương thức model (sử dụng bcrypt)
    const isMatch = await user.comparePassword(password);
    console.log('[authController.login] password compare result:', isMatch);
    if (!isMatch) return res.status(400).json({ message: 'Sai mật khẩu' });

    // Tạo token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.json({ message: 'Đăng nhập thành công', token });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Đăng xuất (Logout)
exports.logout = async (req, res) => {
  try {
    // Ở backend không lưu token nên chỉ cần báo client xóa token là xong
    res.json({ message: 'Đăng xuất thành công (xóa token phía client)' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// DEBUG: reset a user's password (development only)
exports.debugResetPassword = async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ message: 'Not allowed in production' });
  }
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) return res.status(400).json({ message: 'Missing email or newPassword' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Assign new raw password - model pre-save hook will hash it
    user.password = newPassword;
    await user.save();

    return res.json({ message: 'Password reset for debugging', email: user.email });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};