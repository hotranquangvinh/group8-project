const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

// Load biến môi trường từ file .env
dotenv.config({ path: require('path').join(__dirname, '../.env') });

// Cấu hình Cloudinary với biến môi trường
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;
