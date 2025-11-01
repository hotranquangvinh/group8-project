// config/cloudinary.js
const cloudinary = require('cloudinary').v2;
const path = require('path');
const dotenv = require('dotenv');

// 🧩 Load biến môi trường
dotenv.config({ path: path.join(__dirname, '../.env') });

// ⚙️ Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 🧠 Hàm tiện ích upload ảnh
const uploadImage = async (filePath, folder = 'avatars') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder, // lưu trong thư mục riêng
      resource_type: 'image',
      use_filename: true,
      unique_filename: false,
      overwrite: true,
    });
    return result.secure_url; // trả về URL ảnh
  } catch (error) {
    console.error('❌ Lỗi upload Cloudinary:', error);
    throw new Error('Không thể upload ảnh lên Cloudinary');
  }
};

module.exports = { cloudinary, uploadImage };
