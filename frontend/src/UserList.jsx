import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/users';

// Nhận `token` từ App (đã set axios.defaults) để tránh race condition
export default function UserList({ token }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  const [editErrors, setEditErrors] = useState({});

  const getToken = () => localStorage.getItem('auth_token');

  const parseJwt = (token) => {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decodeURIComponent(escape(decoded)));
    } catch (e) {
      return null;
    }
  };

  // initAuth nhận token làm tham số (App đã set axios.defaults)
  const initAuth = (t) => {
    if (!t) return null;
    const payload = parseJwt(t);
    if (payload) {
      setCurrentUser({ id: payload.id, role: payload.role ? String(payload.role).toLowerCase() : 'user' });
    }
    return payload;
  };

  // Chỉ khởi tạo auth và tải danh sách khi token thay đổi / tồn tại
  useEffect(() => {
    if (!token) {
      // Nếu chưa login, clear state
      setUsers([]);
      setCurrentUser(null);
      return;
    }

    // token đã có - set current user
    const payload = initAuth(token);
    // Chỉ fetch danh sách khi là Admin
    if (payload && payload.role && String(payload.role).toLowerCase() === 'admin') {
      fetchUsers();
    } else {
      // nếu không phải admin thì không gọi API tránh lỗi 404/403
      setUsers([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Lấy token từ prop hoặc localStorage để đảm bảo header luôn được gửi
      const t = token || getToken();
      if (!t) {
        // không có token → không gọi API
        setLoading(false);
        return alert('Bạn cần đăng nhập để xem danh sách users');
      }
      const res = await axios.get(API_URL, { headers: { Authorization: `Bearer ${t}` } });
      setUsers(res.data);
    } catch (err) {
      console.error('Error:', err);
      const statusCode = err.response && err.response.status;
      const msg = (err.response && err.response.data && err.response.data.message) || 'Lỗi tải dữ liệu!';

      // Nếu token cũ hoặc user không tồn tại → xoá token và yêu cầu đăng nhập lại
      if (statusCode === 401 || statusCode === 403 || (statusCode === 404 && msg && msg.toLowerCase().includes('user không tồn tại'))) {
        localStorage.removeItem('auth_token');
        alert('Phiên đăng nhập không hợp lệ hoặc hết hạn. Vui lòng đăng nhập lại.');
        // reload để App đọc lại token và về trang login
        window.location.reload();
        return;
      }

      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  // Validation
  const validateEditForm = () => {
    const errors = {};
    if (!editForm.name.trim()) {
      errors.name = 'Name không được để trống';
    } else if (editForm.name.trim().length < 2) {
      errors.name = 'Name phải có ít nhất 2 ký tự';
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!editForm.email.trim()) {
      errors.email = 'Email không được để trống';
    } else if (!emailRegex.test(editForm.email)) {
      errors.email = 'Email không hợp lệ';
    }

    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEdit = (user) => {
    // only allow edit if admin or self
    if (!currentUser) return alert('Bạn cần đăng nhập');
    if (currentUser.role !== 'admin' && currentUser.id !== user._id) return alert('Không có quyền sửa');
    setEditingUser(user._id);
    setEditForm({ name: user.name, email: user.email });
    setEditErrors({});
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditForm({ name: '', email: '' });
    setEditErrors({});
  };

  const handleSaveEdit = async (id) => {
    if (!validateEditForm()) return;

    setLoading(true);
    try {
      const userData = {
        name: editForm.name.trim(),
        email: editForm.email.trim().toLowerCase()
      };
      const t = token || getToken();
      if (!t) return alert('Bạn cần đăng nhập');
      const res = await axios.put(`${API_URL}/${id}`, userData, { headers: { Authorization: `Bearer ${t}` } });
      setUsers(users.map(u => u._id === id ? res.data : u));
      alert('✅ Cập nhật thành công!');
      handleCancelEdit();
    } catch (err) {
      const statusCode = err.response && err.response.status;
      const msg = (err.response && err.response.data && (err.response.data.message || err.response.data.error)) || err.message;
      if (statusCode === 401 || statusCode === 403) {
        localStorage.removeItem('auth_token');
        alert('Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.');
        window.location.reload();
        return;
      }
      alert('❌ Lỗi cập nhật: ' + msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Xóa user "${name}"?`)) return;
    // only admin or self can delete
    if (!currentUser) return alert('Bạn cần đăng nhập');
    if (currentUser.role !== 'admin' && currentUser.id !== id) return alert('Không có quyền xóa');

    setLoading(true);
    try {
      const t = token || getToken();
      if (!t) return alert('Bạn cần đăng nhập');
      await axios.delete(`${API_URL}/${id}`, { headers: { Authorization: `Bearer ${t}` } });
      setUsers(users.filter(u => u._id !== id));
      alert('✅ Xóa thành công!');
    } catch (err) {
      const statusCode = err.response && err.response.status;
      const msg = (err.response && err.response.data && (err.response.data.message || err.response.data.error)) || err.message;
      if (statusCode === 401 || statusCode === 403) {
        localStorage.removeItem('auth_token');
        alert('Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.');
        window.location.reload();
        return;
      }
      alert('❌ Lỗi xóa: ' + msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>📋 Danh sách User</h2>
      {loading && <p>⏳ Đang tải...</p>}
      {users.length === 0 && !loading && <p>📭 Chưa có user</p>}

      {users.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ backgroundColor: '#2196F3', color: 'white' }}>
              <th style={{ padding: '10px', textAlign: 'left' }}>Tên</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Vai trò</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Email</th>
              <th style={{ padding: '10px', textAlign: 'center', width: '200px' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, idx) => (
              <tr key={user._id} style={{ backgroundColor: idx % 2 === 0 ? '#fafafa' : 'white' }}>
                {editingUser === user._id ? (
                  <>
                    <td style={{ padding: '8px' }}>
                      <input
                        value={editForm.name}
                        onChange={(e) => {
                          setEditForm({ ...editForm, name: e.target.value });
                          if (editErrors.name) setEditErrors({ ...editErrors, name: '' });
                        }}
                        style={{
                          width: '100%',
                          padding: '5px',
                          border: editErrors.name ? '2px solid red' : '1px solid #ddd'
                        }}
                      />
                      {editErrors.name && <small style={{ color: 'red' }}>{editErrors.name}</small>}
                    </td>
                    <td style={{ padding: '8px' }}>
                      <input
                        value={editForm.email}
                        onChange={(e) => {
                          setEditForm({ ...editForm, email: e.target.value });
                          if (editErrors.email) setEditErrors({ ...editErrors, email: '' });
                        }}
                        style={{
                          width: '100%',
                          padding: '5px',
                          border: editErrors.email ? '2px solid red' : '1px solid #ddd'
                        }}
                      />
                      {editErrors.email && <small style={{ color: 'red' }}>{editErrors.email}</small>}
                    </td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>
                      <button onClick={() => handleSaveEdit(user._id)} style={{ marginRight: '5px', padding: '5px 10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer' }}>💾 Lưu</button>
                      <button onClick={handleCancelEdit} style={{ padding: '5px 10px', backgroundColor: '#999', color: 'white', border: 'none', cursor: 'pointer' }}>❌ Hủy</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td style={{ padding: '10px' }}>{user.name}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ padding: '4px 8px', borderRadius: 6, color: '#fff', fontSize: 12, fontWeight: '600', background: String(user.role).toLowerCase() === 'admin' ? '#ff9800' : '#4caf50' }}>
                        {String(user.role).toLowerCase() === 'admin' ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td style={{ padding: '10px' }}>{user.email}</td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      {(currentUser && (currentUser.role === 'admin' || currentUser.id === user._id)) ? (
                        <>
                          <button onClick={() => handleEdit(user)} disabled={loading || editingUser} style={{ marginRight: '5px', padding: '5px 10px', backgroundColor: '#2196F3', color: 'white', border: 'none', cursor: 'pointer' }}>✏️ Sửa</button>
                          <button onClick={() => handleDelete(user._id, user.name)} disabled={loading || editingUser} style={{ padding: '5px 10px', backgroundColor: '#f44336', color: 'white', border: 'none', cursor: 'pointer' }}>🗑️ Xóa</button>
                        </>
                      ) : (
                        <span style={{ color: '#999' }}>Không có quyền</span>
                      )}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p style={{ marginTop: '15px', color: '#666' }}>📊 Tổng số: {users.length} users</p>
    </div>
  );
}

