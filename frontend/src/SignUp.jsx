import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/auth/signup';

export default function SignUp({ onSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const emailRegex = /\S+@\S+\.\S+/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!name.trim() || name.trim().length < 2) {
      setMessage({ type: 'error', text: 'Tên phải có ít nhất 2 ký tự' });
      return;
    }
    if (!emailRegex.test(email)) {
      setMessage({ type: 'error', text: 'Email không hợp lệ' });
      return;
    }
    if (!password || password.length < 6) {
      setMessage({ type: 'error', text: 'Mật khẩu phải có ít nhất 6 ký tự' });
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(API_URL, {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      setMessage({ type: 'success', text: res.data?.message || 'Đăng ký thành công' });
      setName(''); setEmail(''); setPassword('');
      if (onSuccess) onSuccess();
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message;
      setMessage({ type: 'error', text: `Lỗi: ${errMsg}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <h3>📝 Đăng ký</h3>
      {message && (
        <div style={{ 
          marginBottom: 10, 
          padding: '10px 12px',
          borderRadius: 6,
          background: message.type === 'error' ? '#ffebee' : '#e8f5e9',
          color: message.type === 'error' ? '#c62828' : '#2e7d32',
          border: `1px solid ${message.type === 'error' ? '#ef5350' : '#66bb6a'}`,
          fontWeight: '500'
        }}>
          {message.type === 'success' ? '✅ ' : '❌ '}{message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 8 }}>
          <label style={{ display: 'block', fontWeight: '600' }}>Tên</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Tên đầy đủ" style={{ padding: 8, width: '100%', maxWidth: 400 }} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label style={{ display: 'block', fontWeight: '600' }}>Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="user@example.com" style={{ padding: 8, width: '100%', maxWidth: 400 }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontWeight: '600' }}>Mật khẩu</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mật khẩu (6+ ký tự)" style={{ padding: 8, width: '100%', maxWidth: 400 }} />
        </div>

        <button type="submit" disabled={loading} style={{ padding: '8px 14px', background: loading ? '#ccc' : '#1976d2', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
          {loading ? '⏳ Đang gửi...' : 'Đăng ký'}
        </button>
      </form>
    </div>
  );
}
