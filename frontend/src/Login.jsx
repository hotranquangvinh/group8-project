import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/auth/login';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!email.trim() || !password) {
      setMessage({ type: 'error', text: 'Vui lòng nhập email và mật khẩu' });
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(API_URL, { email: email.trim().toLowerCase(), password });
      const token = res.data?.token;
      if (token) {
        localStorage.setItem('auth_token', token);
        if (onLogin) onLogin(token);
        setMessage({ type: 'success', text: res.data?.message || 'Đăng nhập thành công' });
      } else {
        setMessage({ type: 'error', text: 'Không nhận được token từ server' });
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message;
      setMessage({ type: 'error', text: `Lỗi: ${errMsg}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <h3>🔐 Đăng nhập</h3>
      {message && (
        <div style={{ marginBottom: 10, color: message.type === 'error' ? '#c62828' : '#2e7d32' }}>{message.text}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 8 }}>
          <label style={{ display: 'block', fontWeight: '600' }}>Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="user@example.com" style={{ padding: 8, width: '100%', maxWidth: 400 }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontWeight: '600' }}>Mật khẩu</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mật khẩu" style={{ padding: 8, width: '100%', maxWidth: 400 }} />
        </div>

        <button type="submit" disabled={loading} style={{ padding: '8px 14px', background: loading ? '#ccc' : '#1976d2', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
          {loading ? '⏳ Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>
    </div>
  );
}
