import React, { useState, useEffect } from 'react';
import axiosInstance from './axiosConfig';

export default function TokenRefreshDemo() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tokenInfo, setTokenInfo] = useState(null);

  // Giải mã JWT để hiển thị thông tin token (không cần library)
  const decodeToken = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  // Lấy thông tin token từ localStorage
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      const decoded = decodeToken(token);
      if (decoded) {
        setTokenInfo({
          userId: decoded.id,
          email: decoded.email,
          role: decoded.role,
          issuedAt: new Date(decoded.iat * 1000).toLocaleString('vi-VN'),
          expiresAt: new Date(decoded.exp * 1000).toLocaleString('vi-VN'),
          expiresIn: Math.floor((decoded.exp * 1000 - Date.now()) / 1000), // seconds
        });
      }
    }
  }, [profile]); // Re-decode when profile is fetched (token might be refreshed)

  // Gọi API để lấy profile (sẽ trigger auto-refresh nếu token hết hạn)
  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/profile');
      setProfile(response.data);
      
      // Sau khi fetch thành công, kiểm tra xem token có được refresh không
      const newToken = localStorage.getItem('auth_token');
      const decoded = decodeToken(newToken);
      if (decoded) {
        setTokenInfo({
          userId: decoded.id,
          email: decoded.email,
          role: decoded.role,
          issuedAt: new Date(decoded.iat * 1000).toLocaleString('vi-VN'),
          expiresAt: new Date(decoded.exp * 1000).toLocaleString('vi-VN'),
          expiresIn: Math.floor((decoded.exp * 1000 - Date.now()) / 1000),
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: 20, 
      background: '#f5f5f5', 
      borderRadius: 8, 
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      maxWidth: 600,
      margin: '20px auto'
    }}>
      <h3 style={{ marginTop: 0, color: '#1976d2' }}>🔄 Demo Auto-Refresh Token</h3>
      
      {tokenInfo && (
        <div style={{ 
          background: '#fff', 
          padding: 15, 
          borderRadius: 6, 
          marginBottom: 15,
          border: '1px solid #e0e0e0'
        }}>
          <h4 style={{ marginTop: 0, color: '#333' }}>📋 Thông tin Access Token</h4>
          <div style={{ fontSize: 14 }}>
            <p><strong>User ID:</strong> {tokenInfo.userId}</p>
            <p><strong>Email:</strong> {tokenInfo.email}</p>
            <p><strong>Role:</strong> {tokenInfo.role}</p>
            <p><strong>Issued At:</strong> {tokenInfo.issuedAt}</p>
            <p><strong>Expires At:</strong> {tokenInfo.expiresAt}</p>
            <p style={{ 
              color: tokenInfo.expiresIn > 0 ? '#2e7d32' : '#c62828',
              fontWeight: 'bold'
            }}>
              {tokenInfo.expiresIn > 0 
                ? `⏱️ Còn ${tokenInfo.expiresIn} giây` 
                : '⚠️ Token đã hết hạn'}
            </p>
          </div>
        </div>
      )}

      <button 
        onClick={fetchProfile} 
        disabled={loading}
        style={{ 
          padding: '10px 16px', 
          background: loading ? '#ccc' : '#1976d2', 
          color: '#fff', 
          border: 'none', 
          borderRadius: 6, 
          cursor: loading ? 'not-allowed' : 'pointer',
          fontWeight: 'bold',
          marginBottom: 15
        }}
      >
        {loading ? '⏳ Đang lấy dữ liệu...' : '🔄 Gọi API Profile (Test Auto-Refresh)'}
      </button>

      {error && (
        <div style={{ 
          padding: 10, 
          background: '#ffebee', 
          color: '#c62828', 
          borderRadius: 6,
          marginBottom: 15,
          border: '1px solid #ef5350'
        }}>
          ❌ Lỗi: {error}
        </div>
      )}

      {profile && (
        <div style={{ 
          background: '#e8f5e9', 
          padding: 15, 
          borderRadius: 6,
          border: '1px solid #4caf50'
        }}>
          <h4 style={{ marginTop: 0, color: '#2e7d32' }}>✅ Dữ liệu Profile</h4>
          <pre style={{ 
            background: '#fff', 
            padding: 10, 
            borderRadius: 4,
            fontSize: 13,
            overflow: 'auto'
          }}>
            {JSON.stringify(profile, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ 
        marginTop: 20, 
        padding: 15, 
        background: '#fff3e0', 
        borderRadius: 6,
        fontSize: 13,
        border: '1px solid #ff9800'
      }}>
        <h4 style={{ marginTop: 0, color: '#e65100' }}>💡 Hướng dẫn Test</h4>
        <ol style={{ marginBottom: 0, paddingLeft: 20 }}>
          <li>Đăng nhập để có access token và refresh token</li>
          <li>Nhấn nút "Gọi API Profile" để test</li>
          <li>Nếu token hết hạn (401), axios interceptor sẽ:
            <ul>
              <li>Tự động gọi <code>/auth/refresh</code></li>
              <li>Lấy access token mới</li>
              <li>Retry request ban đầu</li>
              <li>Bạn không cần làm gì cả! 🎉</li>
            </ul>
          </li>
          <li>Kiểm tra thời gian "Expires At" để thấy token được refresh</li>
        </ol>
      </div>
    </div>
  );
}
