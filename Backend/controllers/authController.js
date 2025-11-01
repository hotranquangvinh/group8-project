const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const sendEmail = require("../config/nodemailer");
const logActivity = require("../middleware/logActivity");

// =======================================
// 🔐 HÀM HỖ TRỢ TOKEN
// =======================================
const generateAccessToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRE || "15m",
  });
};

const generateRefreshToken = async (user) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRE || "7d",
  });

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await RefreshToken.create({ user: user._id, token, expiresAt });
  return token;
};

// =======================================
// 🧩 AUTH BASIC: SIGNUP, LOGIN, REFRESH, LOGOUT
// =======================================
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email đã tồn tại" });

    const newUser = new User({ name, email, password });
    await newUser.save();

    // 🔍 Ghi log
    await logActivity(newUser._id, "Đăng ký tài khoản", req.ip);

    res.status(201).json({ message: "Đăng ký thành công", user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Email không tồn tại" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await logActivity(null, `Đăng nhập thất bại (email: ${email})`, req.ip);
      return res.status(400).json({ message: "Sai mật khẩu" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);

    // 🔍 Ghi log
    await logActivity(user._id, "Đăng nhập thành công", req.ip);

    res.json({
      message: "Đăng nhập thành công",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(400).json({ message: "Thiếu refresh token" });

    const stored = await RefreshToken.findOne({ token: refreshToken });
    if (!stored)
      return res
        .status(403)
        .json({ message: "Refresh token không hợp lệ hoặc đã bị thu hồi" });

    jwt.verify(refreshToken, process.env.JWT_SECRET, async (err, decoded) => {
      if (err)
        return res
          .status(403)
          .json({ message: "Refresh token hết hạn hoặc không hợp lệ" });

      const user = await User.findById(decoded.id);
      if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

      const newAccessToken = generateAccessToken(user);

      // 🔍 Ghi log
      await logActivity(user._id, "Làm mới token truy cập", req.ip);

      res.json({ accessToken: newAccessToken });
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) await RefreshToken.deleteOne({ token: refreshToken });

    // 🔍 Ghi log
    if (req.user?._id) await logActivity(req.user._id, "Đăng xuất", req.ip);

    res.json({ message: "Đăng xuất thành công, token đã bị thu hồi" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// =======================================
// 🧠 DEBUG: RESET PASSWORD THỦ CÔNG
// =======================================
exports.debugResetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User không tồn tại" });

    user.password = newPassword;
    await user.save();

    await logActivity(user._id, "Reset mật khẩu (debug)", req.ip);

    res.json({ message: "Đã reset mật khẩu (debug)", email });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// =======================================
// ✉️ FORGOT PASSWORD – GỬI EMAIL TOKEN
// =======================================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy người dùng" });

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `http://localhost:3001/reset-password/${resetToken}`;
    const htmlContent = `
      <h2>🔑 Đặt lại mật khẩu</h2>
      <p>Xin chào <strong>${user.name || user.email}</strong>,</p>
      <p>Nhấn vào link dưới đây để đặt lại mật khẩu (hiệu lực 10 phút):</p>
      <a href="${resetURL}" target="_blank">Đặt lại mật khẩu</a>
      <p>Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
    `;

    await sendEmail(user.email, "Reset Password - Group8 App", htmlContent);

    // 🔍 Ghi log
    await logActivity(user._id, "Yêu cầu đặt lại mật khẩu", req.ip);

    res.json({ message: "✅ Đã gửi email đặt lại mật khẩu!" });
  } catch (error) {
    console.error("❌ Forgot password error:", error);
    res.status(500).json({ message: "Lỗi server: " + error.message });
  }
};

// =======================================
// 🔄 RESET PASSWORD – ĐỔI MẬT KHẨU MỚI
// =======================================
exports.resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user)
      return res
        .status(400)
        .json({ message: "Token không hợp lệ hoặc đã hết hạn" });

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // 🔍 Ghi log
    await logActivity(user._id, "Đặt lại mật khẩu thành công", req.ip);

    res.json({ message: "✅ Mật khẩu đã được đặt lại thành công!" });
  } catch (error) {
    console.error("❌ Reset password error:", error);
    res.status(500).json({ message: "Lỗi server: " + error.message });
  }
};
