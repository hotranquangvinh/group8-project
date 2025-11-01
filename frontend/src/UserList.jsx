import React, { useEffect, useState } from 'react';
import axiosInstance from './axiosConfig';

const API_URL = '/users'; // Relative path - axiosInstance đã có baseURL http://localhost:3000/api

// Nhận `token` từ App (đã set axios.defaults) để tránh race condition
export default function UserList({ token }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', role: 'User' });
  const [editErrors, setEditErrors] = useState({});
  const [showResetPassword, setShowResetPassword] = useState(null);
  const [newPassword, setNewPassword] = useState('');

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
      const role = payload.role ? String(payload.role).toLowerCase() : 'user';
      setCurrentUser({ id: payload.id, role });
      
      // Log thông tin user vào console
      console.log('%c🔐 USER AUTH INFO', 'background: #4CAF50; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold;');
      console.log('User ID:', payload.id);
      console.log('User Role:', role.toUpperCase());
      console.log('Can view users:', role === 'admin' || role === 'moderator' ? '✅ YES' : '❌ NO');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
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
    // Admin và Moderator được xem danh sách user
    const role = payload?.role ? String(payload.role).toLowerCase() : '';
    if (role === 'admin' || role === 'moderator') {
      fetchUsers();
    } else {
      // nếu không phải admin/moderator thì không gọi API tránh lỗi 404/403
      setUsers([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // axiosInstance đã tự động thêm Authorization header
      const res = await axiosInstance.get(API_URL);
      setUsers(res.data);
      
      // Log danh sách users vào console
      console.log('%c📋 USERS LIST', 'background: #9C27B0; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold;');
      console.log(`Total users: ${res.data.length}`);
      console.table(res.data.map(u => ({
        Name: u.name,
        Email: u.email,
        Role: u.role,
        ID: u._id
      })));
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    } catch (err) {
      console.error('Error fetching users:', err);
      const statusCode = err.response?.status;
      const msg = err.response?.data?.message || 'Lỗi tải dữ liệu!';

      // Nếu token cũ hoặc user không tồn tại → xoá token và yêu cầu đăng nhập lại
      if (statusCode === 401 || statusCode === 403) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        alert('Phiên đăng nhập không hợp lệ hoặc hết hạn. Vui lòng đăng nhập lại.');
        window.location.reload();
        return;
      }

      // Chỉ hiển thị lỗi nếu không phải do không có quyền admin
      if (statusCode !== 403) {
        console.warn('Fetch users failed:', msg);
      }
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
    setEditForm({ name: user.name, email: user.email, role: user.role || 'User' });
    setEditErrors({});
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditForm({ name: '', email: '', role: 'User' });
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
      
      // Nếu là Admin, cho phép đổi role
      if (currentUser.role === 'admin') {
        userData.role = editForm.role;
        console.log('%c🎭 ADMIN: Changing user role', 'background: #FF9800; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold;');
        console.log('User ID:', id);
        console.log('New Role:', editForm.role);
      }
      
      const res = await axiosInstance.put(`${API_URL}/${id}`, userData);
      setUsers(users.map(u => u._id === id ? res.data : u));
      
      console.log('%c✅ User updated successfully', 'background: #4CAF50; color: white; padding: 3px 8px; border-radius: 3px;');
      console.log('Updated user:', res.data);
      
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
      await axiosInstance.delete(`${API_URL}/${id}`);
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

  const handleResetPassword = async (userId, email) => {
    if (!newPassword || newPassword.length < 6) {
      return alert('Mật khẩu mới phải có ít nhất 6 ký tự');
    }
    
    if (!window.confirm(`Bạn có chắc muốn reset mật khẩu cho ${email}?`)) return;

    setLoading(true);
    try {
      console.log('%c🔑 ADMIN: Resetting password', 'background: #F44336; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold;');
      console.log('User ID:', userId);
      console.log('User Email:', email);
      
      await axiosInstance.put(`${API_URL}/${userId}/reset-password`, { newPassword });
      
      console.log('%c✅ Password reset successfully', 'background: #4CAF50; color: white; padding: 3px 8px; border-radius: 3px;');
      
      alert(`✅ Đã reset mật khẩu cho ${email}`);
      setShowResetPassword(null);
      setNewPassword('');
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      console.error('❌ Reset password failed:', msg);
      alert('❌ Lỗi reset password: ' + msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>📋 Danh sách User</h2>
      
      {/* Hiển thị thông báo nếu không phải admin/moderator */}
      {token && currentUser && currentUser.role !== 'admin' && currentUser.role !== 'moderator' && users.length === 0 && !loading && (
        <div style={{ 
          padding: 15, 
          background: '#fff3cd', 
          borderRadius: 6, 
          border: '1px solid #ffc107',
          color: '#856404',
          marginBottom: 15
        }}>
          ⚠️ <strong>Chỉ Admin và Moderator mới có quyền xem danh sách User</strong>
          <br />
          <small>Bạn đang đăng nhập với vai trò: <strong>User</strong></small>
        </div>
      )}
      
      {loading && <p>⏳ Đang tải...</p>}
      {users.length === 0 && !loading && (currentUser?.role === 'admin' || currentUser?.role === 'moderator') && <p>📭 Chưa có user</p>}

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
                      {/* Chỉ Admin mới được đổi role */}
                      {currentUser?.role === 'admin' ? (
                        <select
                          value={editForm.role}
                          onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                          style={{ width: '100%', padding: '5px', border: '1px solid #ddd' }}
                        >
                          <option value="User">👤 User</option>
                          <option value="Moderator">🛡️ Moderator</option>
                          <option value="Admin">👑 Admin</option>
                        </select>
                      ) : (
                        <span style={{ padding: '4px 10px', borderRadius: 6, color: '#fff', fontSize: 12, fontWeight: '600', background: '#4caf50', display: 'inline-block' }}>
                          {editForm.role}
                        </span>
                      )}
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
                      {(() => {
                        const role = String(user.role).toLowerCase();
                        const roleConfig = {
                          admin: { label: '👑 Admin', color: '#ff9800' },
                          moderator: { label: '🛡️ Moderator', color: '#2196f3' },
                          user: { label: '👤 User', color: '#4caf50' }
                        };
                        const config = roleConfig[role] || roleConfig.user;
                        return (
                          <span style={{ 
                            padding: '4px 10px', 
                            borderRadius: 6, 
                            color: '#fff', 
                            fontSize: 12, 
                            fontWeight: '600', 
                            background: config.color,
                            display: 'inline-block'
                          }}>
                            {config.label}
                          </span>
                        );
                      })()}
                    </td>
                    <td style={{ padding: '10px' }}>{user.email}</td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      {(currentUser && (currentUser.role === 'admin' || currentUser.role === 'moderator' || currentUser.id === user._id)) ? (
                        <div style={{ display: 'flex', gap: 5, justifyContent: 'center', flexWrap: 'wrap' }}>
                          <button onClick={() => handleEdit(user)} disabled={loading || editingUser} style={{ padding: '5px 10px', backgroundColor: '#2196F3', color: 'white', border: 'none', cursor: 'pointer', borderRadius: 4 }}>✏️ Sửa</button>
                          
                          {/* Chỉ Admin mới được reset password cho user khác */}
                          {currentUser.role === 'admin' && currentUser.id !== user._id && (
                            <button 
                              onClick={() => setShowResetPassword(showResetPassword === user._id ? null : user._id)} 
                              disabled={loading || editingUser}
                              style={{ padding: '5px 10px', backgroundColor: '#ff9800', color: 'white', border: 'none', cursor: 'pointer', borderRadius: 4 }}
                            >
                              🔑 Reset PW
                            </button>
                          )}
                          
                          {/* Chỉ Admin và Moderator mới được xóa user */}
                          {(currentUser.role === 'admin' || currentUser.role === 'moderator') && (
                            <button onClick={() => handleDelete(user._id, user.name)} disabled={loading || editingUser} style={{ padding: '5px 10px', backgroundColor: '#f44336', color: 'white', border: 'none', cursor: 'pointer', borderRadius: 4 }}>🗑️ Xóa</button>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: '#999' }}>Không có quyền</span>
                      )}
                      
                      {/* Form Reset Password */}
                      {showResetPassword === user._id && currentUser?.role === 'admin' && (
                        <div style={{ marginTop: 10, padding: 10, background: '#fff3cd', borderRadius: 4, border: '1px solid #ffc107' }}>
                          <div style={{ marginBottom: 5, fontSize: 12, fontWeight: 'bold', color: '#856404' }}>
                            🔑 Reset Password cho {user.email}
                          </div>
                          <input
                            type="password"
                            placeholder="Mật khẩu mới (min 6 ký tự)"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            style={{ width: '100%', padding: '5px', marginBottom: 5, border: '1px solid #ddd', borderRadius: 4 }}
                          />
                          <div style={{ display: 'flex', gap: 5 }}>
                            <button 
                              onClick={() => handleResetPassword(user._id, user.email)}
                              disabled={loading}
                              style={{ flex: 1, padding: '5px', backgroundColor: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer', borderRadius: 4, fontSize: 12 }}
                            >
                              ✅ Xác nhận
                            </button>
                            <button 
                              onClick={() => { setShowResetPassword(null); setNewPassword(''); }}
                              style={{ flex: 1, padding: '5px', backgroundColor: '#999', color: 'white', border: 'none', cursor: 'pointer', borderRadius: 4, fontSize: 12 }}
                            >
                              ❌ Hủy
                            </button>
                          </div>
                        </div>
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

