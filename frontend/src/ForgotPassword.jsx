import React, { useState } from 'react';
import axiosInstance from './axiosConfig';

export default function ForgotPassword({ onBack }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    
    // Validation
    if (!email.trim()) {
      return setMessage({ type: 'error', text: '❌ Vui lòng nhập email' });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return setMessage({ type: 'error', text: '❌ Email không hợp lệ' });
    }

    setLoading(true);
    
    try {
      console.log('📧 Sending forgot password request for:', email);
      
      const res = await axiosInstance.post('/auth/forgot-password', { 
        email: email.trim().toLowerCase() 
      });
      
      console.log('✅ Forgot password response:', res.data);
      
      setMessage({ 
        type: 'success', 
        text: '✅ ' + (res.data?.message || 'Đã gửi email reset password! Vui lòng kiểm tra hộp thư của bạn.') 
      });
      setEmail('');
      
    } catch (err) {
      console.error('❌ Forgot password error:', err);
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
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>🔑</div>
          <h2 style={{ margin: 0, color: '#333' }}>Quên mật khẩu?</h2>
          <p style={{ color: '#666', margin: '10px 0 0 0' }}>
            Nhập email của bạn để nhận link đặt lại mật khẩu
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
              📧 Email
            </label>
            <input 
              type="email"
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="your.email@example.com" 
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
            disabled={loading} 
            style={{ 
              padding: '14px 20px', 
              width: '100%',
              background: loading ? '#bdbdbd' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff', 
              border: 'none', 
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'transform 0.2s',
              marginBottom: '15px'
            }}
            onMouseEnter={(e) => !loading && (e.target.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            {loading ? '⏳ Đang gửi...' : '📨 Gửi email đặt lại mật khẩu'}
          </button>

          <div style={{ textAlign: 'center' }}>
            <button
              type="button"
              onClick={onBack || (() => window.location.href = '/')}
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
          <strong>💡 Lưu ý:</strong>
          <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
            <li>Link đặt lại mật khẩu có hiệu lực trong 10 phút</li>
            <li>Kiểm tra cả hộp thư spam nếu không thấy email</li>
            <li>Nếu không nhận được email, hãy thử lại sau vài phút</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
