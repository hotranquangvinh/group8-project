import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/profile';

export default function Profile({ token }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState(null);
  
  // Form state for editing
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    avatar: ''
  });

  // Fetch profile data when component mounts
  useEffect(() => {
    if (token) {
      fetchProfile();
    }
  }, [token]);

  const fetchProfile = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data);
      setFormData({
        name: res.data.name || '',
        email: res.data.email || '',
        avatar: res.data.avatar || ''
      });
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message;
      setMessage({ type: 'error', text: `Lỗi tải profile: ${errMsg}` });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    // Validation
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setMessage({ type: 'error', text: 'Tên phải có ít nhất 2 ký tự' });
      return;
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(formData.email)) {
      setMessage({ type: 'error', text: 'Email không hợp lệ' });
      return;
    }

    setLoading(true);
    try {
      const res = await axios.put(
        API_URL,
        {
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          avatar: formData.avatar.trim()
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // backend may return { message, user } or the updated user object directly
      const updated = res.data?.user || res.data;
      setProfile(updated);
      setMessage({ type: 'success', text: 'Cập nhật profile thành công!' });
      setIsEditing(false);
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message;
      setMessage({ type: 'error', text: `Lỗi cập nhật: ${errMsg}` });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: profile?.name || '',
      email: profile?.email || '',
      avatar: profile?.avatar || ''
    });
    setMessage(null);
  };

  if (!token) {
    return (
      <div style={{ padding: 20, background: '#fff3cd', borderRadius: 8, textAlign: 'center' }}>
        <p style={{ margin: 0, color: '#856404' }}>⚠️ Vui lòng đăng nhập để xem profile</p>
      </div>
    );
  }

  if (loading && !profile) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <p>⏳ Đang tải thông tin...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, background: '#fff', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
        👤 Thông tin cá nhân
        {!isEditing && profile && (
          <button
            onClick={() => setIsEditing(true)}
            style={{ 
              marginLeft: 'auto', 
              padding: '6px 12px', 
              background: '#2196F3', 
              color: '#fff', 
              border: 'none', 
              borderRadius: 6, 
              cursor: 'pointer',
              fontSize: 14
            }}
          >
            ✏️ Chỉnh sửa
          </button>
        )}
      </h3>

      {message && (
        <div style={{ 
          marginBottom: 15, 
          padding: 10, 
          background: message.type === 'error' ? '#ffebee' : '#e8f5e9',
          color: message.type === 'error' ? '#c62828' : '#2e7d32',
          borderRadius: 6,
          border: `1px solid ${message.type === 'error' ? '#ef5350' : '#66bb6a'}`
        }}>
          {message.text}
        </div>
      )}

      {!isEditing && profile ? (
        // View Mode
        <div>
          <div style={{ marginBottom: 20 }}>
            {profile.avatar && (
              <div style={{ marginBottom: 15, textAlign: 'center' }}>
                <img 
                  src={profile.avatar} 
                  alt="Avatar" 
                  style={{ 
                    width: 120, 
                    height: 120, 
                    borderRadius: '50%', 
                    objectFit: 'cover',
                    border: '3px solid #2196F3'
                  }} 
                />
              </div>
            )}
            
            <div style={{ marginBottom: 12 }}>
              <strong style={{ display: 'block', marginBottom: 4, color: '#555' }}>Tên:</strong>
              <div style={{ padding: 10, background: '#f5f5f5', borderRadius: 6 }}>{profile.name}</div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <strong style={{ display: 'block', marginBottom: 4, color: '#555' }}>Email:</strong>
              <div style={{ padding: 10, background: '#f5f5f5', borderRadius: 6 }}>{profile.email}</div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <strong style={{ display: 'block', marginBottom: 4, color: '#555' }}>Vai trò:</strong>
              <div style={{ padding: 10, background: '#f5f5f5', borderRadius: 6 }}>
                <span style={{ 
                  padding: '4px 10px', 
                  background: profile.role === 'admin' ? '#ff9800' : '#4caf50',
                  color: '#fff',
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: 'bold'
                }}>
                  {profile.role === 'admin' ? '👑 Admin' : '👤 User'}
                </span>
              </div>
            </div>

            {profile.createdAt && (
              <div style={{ marginBottom: 12 }}>
                <strong style={{ display: 'block', marginBottom: 4, color: '#555' }}>Ngày tạo:</strong>
                <div style={{ padding: 10, background: '#f5f5f5', borderRadius: 6, fontSize: 14 }}>
                  {new Date(profile.createdAt).toLocaleString('vi-VN')}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : isEditing ? (
        // Edit Mode
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: '600', color: '#555' }}>
              Tên <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Nhập tên đầy đủ"
              disabled={loading}
              style={{ 
                padding: 10, 
                width: '100%', 
                border: '1px solid #ddd', 
                borderRadius: 6,
                fontSize: 14,
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: '600', color: '#555' }}>
              Email <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="user@example.com"
              disabled={loading}
              style={{ 
                padding: 10, 
                width: '100%', 
                border: '1px solid #ddd', 
                borderRadius: 6,
                fontSize: 14,
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: 15 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: '600', color: '#555' }}>
              URL Avatar (tùy chọn)
            </label>
            <input
              type="text"
              name="avatar"
              value={formData.avatar}
              onChange={handleInputChange}
              placeholder="https://example.com/avatar.jpg"
              disabled={loading}
              style={{ 
                padding: 10, 
                width: '100%', 
                border: '1px solid #ddd', 
                borderRadius: 6,
                fontSize: 14,
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 20px',
                background: loading ? '#ccc' : '#4CAF50',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: 14,
                fontWeight: 'bold'
              }}
            >
              {loading ? '⏳ Đang lưu...' : '💾 Lưu thay đổi'}
            </button>
            
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              style={{
                padding: '10px 20px',
                background: '#999',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: 14
              }}
            >
              ❌ Hủy
            </button>
          </div>
        </form>
      ) : null}

      <div style={{ 
        marginTop: 20, 
        padding: 10, 
        background: '#e3f2fd', 
        borderRadius: 6,
        fontSize: 12,
        color: '#1565c0'
      }}>
        💡 <strong>Lưu ý:</strong> Thông tin profile được lấy từ JWT token và API backend.
      </div>
    </div>
  );
}
