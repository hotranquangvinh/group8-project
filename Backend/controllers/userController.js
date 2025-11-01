// controllers/userController.js
const User = require('../models/User');

// 🟢 Lấy danh sách tất cả user (chỉ Admin mới được)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // ẩn mật khẩu
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// 🟢 Lấy thông tin user theo ID (Admin hoặc chính chủ)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Nếu không phải admin và không phải chính chủ → chặn
    if (req.user.role !== 'Admin' && req.user._id.toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// 🟢 Tạo user mới (Admin có thể tạo thêm user)
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email đã tồn tại' });
    }

    const newUser = new User({ name, email, password, role });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// 🟢 Cập nhật user (Admin hoặc chính chủ)
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Nếu không phải admin và không phải chính chủ → chặn
    if (req.user.role !== 'Admin' && req.user._id.toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    user.name = name || user.name;
    user.email = email || user.email;

    // Chỉ Admin được phép đổi role
    if (req.user.role === 'Admin' && role) {
      user.role = role;
    }

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: 'Update failed: ' + error.message });
  }
};

// 🟢 Xóa user (Admin hoặc chính chủ)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Chỉ admin hoặc chính chủ mới được xóa
    if (req.user.role !== 'Admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await User.findByIdAndDelete(req.params.id);
res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// 🔑 Đổi role của user (chỉ Admin)
exports.changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['Admin', 'Moderator', 'User'].includes(role)) {
      return res.status(400).json({ message: 'Role không hợp lệ. Chỉ được: Admin, Moderator, User' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User không tồn tại' });

    user.role = role;
    await user.save();

    res.json({ 
      message: `Đã cập nhật role của ${user.name} thành ${role}`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server: ' + error.message });
  }
};

// 🔑 Reset password cho user (chỉ Admin)
exports.resetUserPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User không tồn tại' });

    user.password = newPassword; // Model sẽ tự động hash
    await user.save();

    res.json({ 
      message: `Đã reset mật khẩu cho ${user.email}`,
      email: user.email
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server: ' + error.message });
  }
};