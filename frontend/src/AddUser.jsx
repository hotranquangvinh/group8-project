import React, { useState } from "react";
import axios from "axios";

function AddUser() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!name || !email) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    const newUser = { name, email };

    axios
      .post("http://localhost:3000/api/users", newUser)
      .then(() => {
        alert("Đã thêm user thành công!");
        setName("");
        setEmail("");
        // Reload trang để cập nhật danh sách
        window.location.reload();
      })
      .catch((err) => {
        console.error("Lỗi khi thêm user:", err);
        alert("Lỗi khi thêm user!");
      });
  };

  return (
    <div style={{ padding: "20px", backgroundColor: "#f5f5f5", borderRadius: "5px" }}>
      <h2>Thêm User mới</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "10px" }}>
          <input
            type="text"
            placeholder="Tên"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ padding: "8px", width: "200px", marginRight: "10px" }}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ padding: "8px", width: "200px", marginRight: "10px" }}
          />
          <button
            type="submit"
            style={{
              padding: "8px 20px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              cursor: "pointer",
              borderRadius: "3px",
            }}
          >
            Thêm User
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddUser;
