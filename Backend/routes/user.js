// routes/user.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// ==========================
// 🧩 USER MANAGEMENT (Admin)
// ==========================

// 🟢 GET /api/users
// → Chỉ Admin mới được xem danh sách toàn bộ user
router.get('/users', protect, isAdmin, userController.getUsers);

// 🟢 GET /api/users/:id
// → Admin hoặc chính chủ được xem thông tin
router.get('/users/:id', protect, userController.getUserById);

// 🟡 PUT /api/users/:id
// → Admin hoặc chính chủ được cập nhật thông tin
router.put('/users/:id', protect, userController.updateUser);

// 🔴 DELETE /api/users/:id
// → Admin hoặc chính chủ được xóa tài khoản
router.delete('/users/:id', protect, userController.deleteUser);

module.exports = router;
