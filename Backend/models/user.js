const mongoose = require("mongoose");

// Định nghĩa schema cho User
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },   // tên bắt buộc
  email: { type: String, required: true, unique: true } // email duy nhất
});

// Xuất model để dùng trong routes/controller
module.exports = mongoose.model("User", userSchema);