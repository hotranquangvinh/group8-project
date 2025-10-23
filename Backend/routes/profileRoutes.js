const express = require("express");
const router = express.Router();
const { getProfile, updateProfile } = require("../controllers/profileController");
const { protect } = require("../middleware/authMiddleware");

// chỉ cho phép user đã đăng nhập
router.get("/", protect, getProfile);
router.put("/", protect, updateProfile);

module.exports = router;
