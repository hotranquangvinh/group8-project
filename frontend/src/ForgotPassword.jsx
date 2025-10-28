import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/advanced/forgot-password';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    if (!email.trim()) return setMessage({ type: 'error', text: 'Vui lòng nhập email' });
    setLoading(true);
    try {
      const res = await axios.post(API_URL, { email: email.trim().toLowerCase() });
      setMessage({ type: 'success', text: res.data?.message || 'Đã gửi email reset' });
      setEmail('');
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message;
      setMessage({ type: 'error', text: `Lỗi: ${errMsg}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: '0 auto', background: '#fff', borderRadius: 8 }}>
      <h3>🔑 Quên mật khẩu</h3>
      {message && (
        <div style={{ marginBottom: 12, color: message.type === 'error' ? '#c62828' : '#2e7d32' }}>{message.text}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 10 }}>
          <label style={{ display: 'block', fontWeight: 600 }}>Email nhận token</label>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="user@example.com" style={{ padding: 8, width: '100%' }} />
        </div>

        <button type="submit" disabled={loading} style={{ padding: '8px 14px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6 }}>
          {loading ? '⏳ Đang gửi...' : 'Gửi yêu cầu đặt lại mật khẩu'}
        </button>
      </form>
    </div>
  );
}
