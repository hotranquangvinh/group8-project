import React, { useEffect, useState } from "react";
import axios from "axios";
import AddUser from "./AddUser";
import UserList from "./UserList";

const API = process.env.REACT_APP_API_URL;

function App() {
  const [users, setUsers] = useState([]);

  // Lấy danh sách user từ MongoDB (qua backend)
  useEffect(() => {
    axios
      .get(`${API}/users`)
      .then((res) => setUsers(res.data))
      .catch((err) => console.error("Lỗi tải dữ liệu:", err));
  }, []);

  const handleAdd = async (user) => {
    try {
      const res = await axios.post(`${API}/users`, user);
      setUsers([...users, res.data]);
    } catch (err) {
      console.error("Lỗi thêm user:", err);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Frontend hiển thị dữ liệu thật từ MongoDB</h2>
      <AddUser onAdd={handleAdd} />
      <UserList users={users} />
    </div>
  );
}

export default App;
