import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/users';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  const [editErrors, setEditErrors] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
      setUsers(res.data);
    } catch (err) {
      console.error('Error:', err);
      alert('Lỗi tải dữ liệu!');
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
      const res = await axios.put(`${API_URL}/${id}`, userData);
      setUsers(users.map(u => u._id === id ? res.data : u));
      alert('✅ Cập nhật thành công!');
      handleCancelEdit();
    } catch (err) {
      alert('❌ Lỗi cập nhật: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Xóa user "${name}"?`)) return;
    
    setLoading(true);
    try {
      await axios.delete(`${API_URL}/${id}`);
      setUsers(users.filter(u => u._id !== id));
      alert('✅ Xóa thành công!');
    } catch (err) {
      alert('❌ Lỗi xóa: ' + (err.response?.data?.error || err.message));
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
                    <td style={{ padding: '10px' }}>{user.email}</td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      <button onClick={() => handleEdit(user)} disabled={loading || editingUser} style={{ marginRight: '5px', padding: '5px 10px', backgroundColor: '#2196F3', color: 'white', border: 'none', cursor: 'pointer' }}>✏️ Sửa</button>
                      <button onClick={() => handleDelete(user._id, user.name)} disabled={loading || editingUser} style={{ padding: '5px 10px', backgroundColor: '#f44336', color: 'white', border: 'none', cursor: 'pointer' }}>🗑️ Xóa</button>
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
