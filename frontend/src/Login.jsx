import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser, clearError } from './store/slices/authSlice';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector(state => state.auth);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/profile');
    }
  }, [isAuthenticated, navigate]);

  // Handle Redux errors
  useEffect(() => {
    if (error) {
      setMessage({ type: 'error', text: error });
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!email.trim() || !password) {
      setMessage({ type: 'error', text: 'Vui lòng nhập email và mật khẩu' });
      return;
    }

    const result = await dispatch(loginUser({ 
      email: email.trim().toLowerCase(), 
      password 
    }));

    if (loginUser.fulfilled.match(result)) {
      setMessage({ type: 'success', text: 'Đăng nhập thành công!' });
      setTimeout(() => navigate('/profile'), 500);
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

      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <a href="/forgot-password" style={{ color: '#1976d2', textDecoration: 'none', fontSize: 14 }}>
          🔑 Quên mật khẩu?
        </a>
      </div>
    </div>
  );
}
