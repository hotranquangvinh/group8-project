const mongoose = require("mongoose");
<<<<<<< HEAD
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  avatar: { type: String, default: "" }
}, { timestamps: true });

// Hash password trước khi lưu
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// So sánh mật khẩu khi login
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

=======

// Định nghĩa schema cho User
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },   // tên bắt buộc
  email: { type: String, required: true, unique: true } // email duy nhất
});

// Xuất model để dùng trong routes/controller
>>>>>>> 3c1f3ede5450a5688451229a46afba1d80840dd3
module.exports = mongoose.model("User", userSchema);