import React, { useState } from "react";
import axios from "axios";

function AddUser() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const newUser = { name, email };

    axios
      .post("http://localhost:3000/api/users", newUser)
      .then(() => {
        alert("Đã thêm user thành công!");
        setName("");
        setEmail("");
      })
      .catch((err) => console.error("Lỗi khi thêm user:", err));
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Thêm User mới</h2>
      <input
        type="text"
        placeholder="Tên"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button type="submit">Thêm</button>
    </form>
  );
}

export default AddUser;
