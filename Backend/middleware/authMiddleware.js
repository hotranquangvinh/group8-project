const jwt = require("jsonwebtoken");
const User = require("../models/User");

// 🧩 Middleware: Kiểm tra JWT hợp lệ
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // Giải mã token bằng secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Lấy thông tin user (bỏ mật khẩu)
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(404).json({ message: "User không tồn tại" });
      }

      next();
    } catch (err) {
      return res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }
  } else {
    return res.status(401).json({ message: "Không có token, truy cập bị từ chối" });
  }
};

// 🧩 Middleware: Kiểm tra quyền Admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "Admin") {
    next();
  } else {
    res.status(403).json({ message: "Truy cập bị từ chối – chỉ Admin được phép" });
  }
};

module.exports = { protect, isAdmin };
