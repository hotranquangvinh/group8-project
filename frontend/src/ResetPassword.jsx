import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from './axiosConfig';

export default function ResetPassword() {
  const navigate = useNavigate();
  const { token } = useParams(); // Get token from URL params
  
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    console.log('🔑 Reset password token:', token);
    if (!token) {
      setMessage({ type: 'error', text: '❌ Token không hợp lệ hoặc thiếu trong URL' });
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    
    // Validation
    if (!password || password.length < 6) {
      return setMessage({ type: 'error', text: '❌ Mật khẩu phải có tối thiểu 6 ký tự' });
    }
    
    if (password !== confirm) {
      return setMessage({ type: 'error', text: '❌ Mật khẩu xác nhận không khớp' });
    }
    
    if (!token) {
      return setMessage({ type: 'error', text: '❌ Token không hợp lệ' });
    }

    setLoading(true);
    
    try {
      console.log('🔄 Resetting password with token:', token);
      
      const res = await axiosInstance.post(`/auth/reset-password/${token}`, { password });
      
      console.log('✅ Reset password response:', res.data);
      
      setMessage({ 
        type: 'success', 
        text: '✅ ' + (res.data?.message || 'Đổi mật khẩu thành công! Đang chuyển đến trang đăng nhập...') 
      });
      
      setPassword(''); 
      setConfirm('');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (err) {
      console.error('❌ Reset password error:', err);
      const errMsg = err.response?.data?.message || err.message;
      setMessage({ type: 'error', text: `❌ ${errMsg}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{ 
        maxWidth: '500px', 
        width: '100%',
        background: '#fff', 
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>🔒</div>
          <h2 style={{ margin: 0, color: '#333' }}>Đặt lại mật khẩu</h2>
          <p style={{ color: '#666', margin: '10px 0 0 0' }}>
            Nhập mật khẩu mới của bạn
          </p>
        </div>

        {message && (
          <div style={{ 
            marginBottom: '20px', 
            padding: '12px 16px',
            borderRadius: '8px',
            background: message.type === 'error' ? '#ffebee' : '#e8f5e9',
            color: message.type === 'error' ? '#c62828' : '#2e7d32',
            border: `1px solid ${message.type === 'error' ? '#ef5350' : '#66bb6a'}`,
            fontSize: '14px'
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              fontWeight: 600, 
              marginBottom: '8px',
              color: '#333'
            }}>
              🔑 Mật khẩu mới
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? 'text' : 'password'}
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="Tối thiểu 6 ký tự"
                style={{ 
                  padding: '12px 16px', 
                  paddingRight: '45px',
                  width: '100%',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border 0.3s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '18px'
                }}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{ 
              display: 'block', 
              fontWeight: 600, 
              marginBottom: '8px',
              color: '#333'
            }}>
              ✅ Xác nhận mật khẩu
            </label>
            <input 
              type={showPassword ? 'text' : 'password'}
              value={confirm} 
              onChange={e => setConfirm(e.target.value)} 
              placeholder="Nhập lại mật khẩu"
              style={{ 
                padding: '12px 16px', 
                width: '100%',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border 0.3s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || !token} 
            style={{ 
              padding: '14px 20px', 
              width: '100%',
              background: (loading || !token) ? '#bdbdbd' : 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
              color: '#fff', 
              border: 'none', 
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: (loading || !token) ? 'not-allowed' : 'pointer',
              transition: 'transform 0.2s',
              marginBottom: '15px'
            }}
            onMouseEnter={(e) => !loading && token && (e.target.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            {loading ? '⏳ Đang xử lý...' : '🔄 Đổi mật khẩu'}
          </button>

          <div style={{ textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => navigate('/login')}
              style={{
                background: 'none',
                border: 'none',
                color: '#667eea',
                cursor: 'pointer',
                fontSize: '14px',
                textDecoration: 'underline'
              }}
            >
              ← Quay lại đăng nhập
            </button>
          </div>
        </form>

        <div style={{
          marginTop: '30px',
          padding: '15px',
          background: '#f5f5f5',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#666'
        }}>
          <strong>🔐 Bảo mật:</strong>
          <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
            <li>Mật khẩu nên chứa chữ hoa, chữ thường và số</li>
            <li>Không sử dụng mật khẩu dễ đoán</li>
            <li>Token reset chỉ dùng được 1 lần</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
