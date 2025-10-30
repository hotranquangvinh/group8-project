// controllers/userController.js
const User = require('../models/User');

<<<<<<< HEAD
// 🟢 Lấy danh sách tất cả user (chỉ Admin mới được)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // ẩn mật khẩu
=======
// GET /api/users - Lấy danh sách user
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
>>>>>>> backend-forgot-password
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

<<<<<<< HEAD
// 🟢 Lấy thông tin user theo ID (Admin hoặc chính chủ)
exports.getUserById = async (req, res) => {
=======
// POST /api/users - Tạo user mới
exports.createUser = async (req, res) => {
>>>>>>> backend-forgot-password
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

<<<<<<< HEAD
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
=======
// PUT /api/users/:id - Cập nhật user
exports.updateUser = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
>>>>>>> backend-forgot-password
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: 'Update failed: ' + error.message });
  }
};

<<<<<<< HEAD
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
=======
// DELETE /api/users/:id - Xóa user
exports.deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
>>>>>>> backend-forgot-password
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
<<<<<<< HEAD
};
=======
};
>>>>>>> backend-forgot-password
