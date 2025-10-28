import React, { useState } from 'react';
import axios from 'axios';

export default function UploadAvatar({ token }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleUpload = async () => {
    setMessage(null);
    if (!file) return setMessage({ type: 'error', text: 'Chưa chọn file' });
    const t = token || localStorage.getItem('auth_token');
    if (!t) return setMessage({ type: 'error', text: 'Bạn cần đăng nhập để upload avatar' });

    const fd = new FormData();
    fd.append('avatar', file);

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:3000/api/advanced/upload-avatar', fd, {
        headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'multipart/form-data' }
      });
      setMessage({ type: 'success', text: res.data?.message || 'Upload thành công' });
      setAvatarUrl(res.data?.avatar || null);
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message;
      setMessage({ type: 'error', text: `Lỗi: ${errMsg}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 700, margin: '0 auto', background: '#fff', borderRadius: 8 }}>
      <h3>📷 Upload Avatar</h3>
      {message && <div style={{ marginBottom: 10, color: message.type === 'error' ? '#c62828' : '#2e7d32' }}>{message.text}</div>}

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <input type="file" accept="image/*" onChange={handleFile} />
        <button onClick={handleUpload} disabled={loading} style={{ padding: '8px 12px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6 }}>
          {loading ? '⏳ Đang upload...' : 'Upload'}
        </button>
      </div>

      {preview && (
        <div style={{ marginTop: 12 }}>
          <strong>Preview:</strong>
          <div style={{ marginTop: 8 }}>
            <img src={preview} alt="preview" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: '50%' }} />
          </div>
        </div>
      )}

      {avatarUrl && (
        <div style={{ marginTop: 12 }}>
          <strong>Avatar trên server:</strong>
          <div style={{ marginTop: 8 }}>
            <img src={avatarUrl} alt="avatar" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: '50%' }} />
          </div>
        </div>
      )}
    </div>
  );
}
