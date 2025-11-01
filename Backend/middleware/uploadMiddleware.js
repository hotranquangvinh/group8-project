// middleware/uploadMiddleware.js
const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

// 📁 Thư mục tạm lưu ảnh
const uploadPath = path.join(__dirname, "../uploads");

// Tạo thư mục nếu chưa tồn tại
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

// 🧩 Cấu hình Multer
const storage = multer.memoryStorage(); // dùng memoryStorage để Sharp xử lý trong RAM

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ cho phép upload file ảnh!"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // Giới hạn 2MB
});

// 🧩 Middleware xử lý ảnh trước khi upload
const resizeImage = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const filename = `avatar-${Date.now()}.jpeg`;
    const outputPath = path.join(uploadPath, filename);

    // Resize ảnh về 300x300, nén và lưu tạm
    await sharp(req.file.buffer)
      .resize(300, 300)
      .jpeg({ quality: 90 })
      .toFile(outputPath);

    req.file.path = outputPath; // để controller biết đường dẫn file
    next();
  } catch (err) {
    console.error("❌ Lỗi resize ảnh:", err);
    res.status(500).json({ message: "Xử lý ảnh thất bại" });
  }
};

module.exports = { upload, resizeImage };
