// routes/user.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const checkRole = require('../middleware/checkRole'); // 🧩 Thêm middleware mới

// ==========================
// 🧩 USER MANAGEMENT (RBAC)
// ==========================

// 🟢 GET /api/users (vì đã mount ở /api/users trong server.js)
// → Chỉ Admin hoặc Moderator mới được xem danh sách toàn bộ user
router.get('/', protect, checkRole('Admin', 'Moderator'), userController.getUsers);

// 🟢 GET /api/users/:id
// → Admin, Moderator hoặc chính chủ được xem thông tin
router.get('/:id', protect, userController.getUserById);

// 🟡 PUT /api/users/:id
// → Admin, Moderator hoặc chính chủ được cập nhật thông tin
router.put('/:id', protect, userController.updateUser);

// 🔴 DELETE /api/users/:id
// → Chỉ Admin mới được xóa tài khoản người khác, còn user chỉ được xóa chính mình
router.delete('/:id', protect, userController.deleteUser);

// 🔑 PUT /api/users/:id/change-role
// → Chỉ Admin mới được đổi role của user khác
router.put('/:id/change-role', protect, checkRole('Admin'), userController.changeUserRole);

// 🔑 PUT /api/users/:id/reset-password
// → Chỉ Admin mới được reset password cho user khác
router.put('/:id/reset-password', protect, checkRole('Admin'), userController.resetUserPassword);

module.exports = router;