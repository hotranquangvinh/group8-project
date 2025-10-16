import React, { useEffect, useState } from "react";
import axios from "axios";

function UserList() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "" });

  // Load danh sách users
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    axios
      .get("http://localhost:3000/api/users")
      .then((res) => setUsers(res.data))
      .catch((err) => console.error("Lỗi khi tải user:", err));
  };

  // Xóa user
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa user này?")) {
      try {
        await axios.delete(`http://localhost:3000/api/users/${id}`);
        setUsers(users.filter((user) => user._id !== id));
        alert("Xóa user thành công!");
      } catch (err) {
        console.error("Lỗi khi xóa user:", err);
        alert("Lỗi khi xóa user!");
      }
    }
  };

  // Bắt đầu sửa user
  const handleEdit = (user) => {
    setEditingUser(user._id);
    setEditForm({ name: user.name, email: user.email });
  };

  // Hủy sửa
  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditForm({ name: "", email: "" });
  };

  // Lưu thay đổi
  const handleSaveEdit = async (id) => {
    try {
      const res = await axios.put(`http://localhost:3000/api/users/${id}`, editForm);
      setUsers(users.map((user) => (user._id === id ? res.data : user)));
      setEditingUser(null);
      setEditForm({ name: "", email: "" });
      alert("Cập nhật user thành công!");
    } catch (err) {
      console.error("Lỗi khi cập nhật user:", err);
      alert("Lỗi khi cập nhật user!");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Danh sách User</h2>
      {users.length === 0 ? (
        <p>Chưa có user nào. Hãy thêm user mới!</p>
      ) : (
        <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Tên</th>
              <th>Email</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                {editingUser === user._id ? (
                  // Form chỉnh sửa inline
                  <>
                    <td>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        style={{ width: "100%", padding: "5px" }}
                      />
                    </td>
                    <td>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        style={{ width: "100%", padding: "5px" }}
                      />
                    </td>
                    <td>
                      <button
                        onClick={() => handleSaveEdit(user._id)}
                        style={{
                          padding: "5px 10px",
                          marginRight: "5px",
                          backgroundColor: "#4CAF50",
                          color: "white",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        Lưu
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        style={{
                          padding: "5px 10px",
                          backgroundColor: "#f44336",
                          color: "white",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        Hủy
                      </button>
                    </td>
                  </>
                ) : (
                  // Hiển thị thông tin user
                  <>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <button
                        onClick={() => handleEdit(user)}
                        style={{
                          padding: "5px 10px",
                          marginRight: "5px",
                          backgroundColor: "#2196F3",
                          color: "white",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
                        style={{
                          padding: "5px 10px",
                          backgroundColor: "#f44336",
                          color: "white",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        Xóa
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default UserList;
