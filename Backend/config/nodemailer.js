const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, htmlContent) => {
  try {
    // Tạo transporter sử dụng Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,  // tài khoản Gmail (có bật 2FA)
        pass: process.env.EMAIL_PASS,  // app password (16 ký tự)
      },
    });

    // Cấu hình nội dung email
    const mailOptions = {
      from: `"Group8 Support" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: htmlContent,
    };

    // Gửi email
    await transporter.sendMail(mailOptions);
    console.log("✅ Email đã được gửi tới:", to);
  } catch (error) {
    console.error("❌ Lỗi gửi email:", error.message);
    throw new Error("Không thể gửi email");
  }
};

module.exports = sendEmail;
