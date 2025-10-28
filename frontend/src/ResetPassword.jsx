import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ResetPassword({ tokenProp }) {
  const [token, setToken] = useState(tokenProp || null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!token) {
      // try read from URL path: /reset-password/:token
      const path = window.location.pathname || '';
      const m = path.match(/\/reset-password\/(.+)/);
      if (m) setToken(m[1]);
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    if (!password || password.length < 6) return setMessage({ type: 'error', text: 'Password phải tối thiểu 6 ký tự' });
    if (password !== confirm) return setMessage({ type: 'error', text: 'Mật khẩu xác nhận không khớp' });
    if (!token) return setMessage({ type: 'error', text: 'Token không hợp lệ' });

    setLoading(true);
    try {
      const res = await axios.post(`http://localhost:3000/api/advanced/reset-password/${token}`, { password });
      setMessage({ type: 'success', text: res.data?.message || 'Đã đổi mật khẩu' });
      setPassword(''); setConfirm('');
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message;
      setMessage({ type: 'error', text: `Lỗi: ${errMsg}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: '0 auto', background: '#fff', borderRadius: 8 }}>
      <h3>🔁 Đổi mật khẩu</h3>
      {message && <div style={{ marginBottom: 12, color: message.type === 'error' ? '#c62828' : '#2e7d32' }}>{message.text}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 10 }}>
          <label style={{ display: 'block', fontWeight: 600 }}>Mật khẩu mới</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ padding: 8, width: '100%' }} />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label style={{ display: 'block', fontWeight: 600 }}>Xác nhận mật khẩu</label>
          <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} style={{ padding: 8, width: '100%' }} />
        </div>

        <button type="submit" disabled={loading} style={{ padding: '8px 14px', background: '#4caf50', color: '#fff', border: 'none', borderRadius: 6 }}>
          {loading ? '⏳ Đang xử lý...' : 'Đổi mật khẩu'}
        </button>
      </form>
    </div>
  );
}
