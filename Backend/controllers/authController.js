const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const sendEmail = require("../config/nodemailer"); // import hàm gửi email

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
    if (!isMatch) return res.status(400).json({ message: "Sai mật khẩu" });

    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);

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

    // URL frontend để user click vào
    const resetURL = `http://localhost:3001/reset-password/${resetToken}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔑 Đặt lại mật khẩu</h1>
          </div>
          <div class="content">
            <p>Xin chào <strong>${user.name || user.email}</strong>,</p>
<p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản của mình.</p>
            <p>Click vào nút dưới đây để đặt lại mật khẩu (link có hiệu lực trong <strong>10 phút</strong>):</p>
            <p style="text-align: center;">
              <a href="${resetURL}" class="button">🔄 Đặt lại mật khẩu</a>
            </p>
            <p>Hoặc copy link này vào trình duyệt:</p>
            <p style="background: #fff; padding: 10px; border-left: 4px solid #667eea; word-break: break-all;">
              ${resetURL}
            </p>
            <p style="color: #f44336; margin-top: 20px;">
              ⚠️ Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
            </p>
          </div>
          <div class="footer">
            <p>Email này được gửi tự động, vui lòng không trả lời.</p>
            <p>&copy; 2025 Group8 - User Management System</p>
          </div>
        </div>
      </body>
      </html>
    `;

    console.log('📧 Sending forgot password email to:', user.email);
    console.log('🔗 Reset URL:', resetURL);

    // Gọi sendEmail với đúng tham số: (to, subject, htmlContent)
    await sendEmail(
      user.email,
      'Reset Password - Group8 App',
      htmlContent
    );

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
      return res.status(400).json({ message: "Token không hợp lệ hoặc đã hết hạn" });

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: "✅ Mật khẩu đã được đặt lại thành công!" });
  } catch (error) {
    console.error("❌ Reset password error:", error);
    res.status(500).json({ message: "Lỗi server: " + error.message });
  }
};