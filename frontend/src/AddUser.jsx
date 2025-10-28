import React, { useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:3000/api/auth/signup";

function AddUser() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation helper
  const validateForm = () => {
    const newErrors = {};

    // Validate name - không được để trống và trim
    if (!name.trim()) {
      newErrors.name = "Name không được để trống";
    } else if (name.trim().length < 2) {
      newErrors.name = "Name phải có ít nhất 2 ký tự";
    }

    // Validate email - regex đầy đủ
    const emailRegex = /\S+@\S+\.\S+/;
    if (!email.trim()) {
      newErrors.email = "Email không được để trống";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Email không hợp lệ (ví dụ: user@example.com)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form trước khi submit
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Trim dữ liệu trước khi gửi
    const userData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
    };

    try {
  // signup is public endpoint; no auth header needed
  await axios.post(API_URL, userData);
      alert("✅ Đã thêm user thành công!");
      
      // Reset form
      setName("");
      setEmail("");
      setErrors({});
      
      // Reload trang để cập nhật danh sách
      window.location.reload();
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Lỗi khi thêm user!";
      alert(`❌ Lỗi: ${errorMsg}`);
      console.error("Error adding user:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clear error khi user bắt đầu nhập
  const handleNameChange = (e) => {
    setName(e.target.value);
    if (errors.name) {
      setErrors({ ...errors, name: "" });
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors({ ...errors, email: "" });
    }
  };

  return (
    <div style={{ 
      padding: "20px", 
      backgroundColor: "#f5f5f5", 
      borderRadius: "8px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      marginBottom: "20px"
    }}>
      <h2 style={{ marginTop: 0, color: "#333" }}>➕ Thêm User Mới</h2>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "#555" }}>
              Tên người dùng:
            </label>
            <input
              type="text"
              placeholder="Nhập tên (ví dụ: Nguyễn Văn A)"
              value={name}
              onChange={handleNameChange}
              style={{ 
                padding: "10px", 
                width: "100%",
                maxWidth: "400px",
                border: errors.name ? "2px solid #f44336" : "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
                boxSizing: "border-box"
              }}
              disabled={isSubmitting}
            />
            {errors.name && (
              <div style={{ color: "#f44336", fontSize: "12px", marginTop: "5px" }}>
                ⚠️ {errors.name}
              </div>
            )}
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "#555" }}>
              Email:
            </label>
            <input
              type="email"
              placeholder="Nhập email (ví dụ: user@example.com)"
              value={email}
              onChange={handleEmailChange}
              style={{ 
                padding: "10px", 
                width: "100%",
                maxWidth: "400px",
                border: errors.email ? "2px solid #f44336" : "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
                boxSizing: "border-box"
              }}
              disabled={isSubmitting}
            />
            {errors.email && (
              <div style={{ color: "#f44336", fontSize: "12px", marginTop: "5px" }}>
                ⚠️ {errors.email}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: "12px 30px",
              backgroundColor: isSubmitting ? "#ccc" : "#4CAF50",
              color: "white",
              border: "none",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              borderRadius: "4px",
              fontSize: "15px",
              fontWeight: "bold",
              transition: "background-color 0.3s"
            }}
          >
            {isSubmitting ? "⏳ Đang thêm..." : "➕ Thêm User"}
          </button>
        </div>
      </form>
      
      <div style={{ 
        fontSize: "12px", 
        color: "#666", 
        marginTop: "15px",
        padding: "10px",
        backgroundColor: "#fff3cd",
        borderLeft: "4px solid #ffc107",
        borderRadius: "4px"
      }}>
        💡 <strong>Lưu ý:</strong> 
        <ul style={{ margin: "5px 0", paddingLeft: "20px" }}>
          <li>Name phải có ít nhất 2 ký tự</li>
          <li>Email phải đúng định dạng (có @ và domain)</li>
          <li>Dữ liệu sẽ tự động trim khoảng trắng thừa</li>
        </ul>
      </div>
    </div>
  );
}

export default AddUser;
