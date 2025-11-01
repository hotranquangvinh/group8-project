import React, { useState, useEffect } from 'react';
import axiosInstance from './axiosConfig';

export default function UploadAvatar({ token }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [currentAvatar, setCurrentAvatar] = useState(null);

  // Lấy avatar hiện tại của user khi component mount
  useEffect(() => {
    const fetchCurrentAvatar = async () => {
      try {
        const res = await axiosInstance.get('/profile');
        if (res.data?.avatar) {
          setCurrentAvatar(res.data.avatar);
          setAvatarUrl(res.data.avatar);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };
    
    if (token) {
      fetchCurrentAvatar();
    }
  }, [token]);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    
    // Validation: chỉ cho phép file ảnh
    if (!f.type.startsWith('image/')) {
      setMessage({ type: 'error', text: '❌ Chỉ được upload file ảnh (jpg, png, gif, etc.)' });
      return;
    }
    
    // Validation: giới hạn dung lượng 5MB
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (f.size > maxSize) {
      setMessage({ type: 'error', text: '❌ File quá lớn! Tối đa 5MB' });
      return;
    }
    
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setMessage(null);
  };

  const handleUpload = async () => {
    setMessage(null);
    if (!file) return setMessage({ type: 'error', text: '❌ Chưa chọn file' });

    const fd = new FormData();
    fd.append('avatar', file);

    setLoading(true);
    try {
      const res = await axiosInstance.post('/advanced/upload-avatar', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      console.log('%c📷 Avatar uploaded', 'background: #4CAF50; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold;');
      console.log('Avatar URL:', res.data?.avatar);
      
      setMessage({ type: 'success', text: '✅ ' + (res.data?.message || 'Upload thành công') });
      setAvatarUrl(res.data?.avatar || null);
      setCurrentAvatar(res.data?.avatar || null);
      
      // Reset file input
      setFile(null);
      setPreview(null);
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message;
      console.error('❌ Upload failed:', errMsg);
      setMessage({ type: 'error', text: `❌ Lỗi: ${errMsg}` });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    setMessage(null);
  };

  return (
    <div style={{ 
      padding: '30px', 
      maxWidth: '700px', 
      margin: '0 auto', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '12px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
    }}>
      <div style={{ background: 'white', padding: '30px', borderRadius: '8px' }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '32px' }}>📷</span>
          Upload Avatar
        </h2>
        
        {message && (
          <div style={{ 
            marginBottom: '20px', 
            padding: '12px 16px',
            borderRadius: '6px',
            background: message.type === 'error' ? '#ffebee' : '#e8f5e9',
            color: message.type === 'error' ? '#c62828' : '#2e7d32',
            border: `1px solid ${message.type === 'error' ? '#ef9a9a' : '#a5d6a7'}`,
            fontWeight: '500'
          }}>
            {message.text}
          </div>
        )}

        {/* Avatar hiện tại */}
        {currentAvatar && !preview && (
          <div style={{ marginBottom: '25px', textAlign: 'center' }}>
            <div style={{ 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#666', 
              marginBottom: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Avatar hiện tại
            </div>
            <div style={{ 
              width: '150px', 
              height: '150px', 
              margin: '0 auto',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '4px solid #667eea',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
            }}>
              <img 
                src={currentAvatar} 
                alt="current avatar" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            </div>
          </div>
        )}

        {/* Form upload */}
        <div style={{ 
          border: '2px dashed #ccc', 
          borderRadius: '8px', 
          padding: '25px',
          background: '#fafafa',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
            <label style={{ 
              cursor: 'pointer',
              padding: '12px 24px',
              background: '#667eea',
              color: 'white',
              borderRadius: '6px',
              fontWeight: '600',
              transition: 'all 0.3s',
              display: 'inline-block'
            }}>
              📁 Chọn ảnh
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFile}
                style={{ display: 'none' }}
              />
            </label>
            
            {file && (
              <div style={{ fontSize: '14px', color: '#666', textAlign: 'center' }}>
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                  {file.name}
                </div>
                <div style={{ fontSize: '12px', color: '#999' }}>
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
            )}
          </div>

          {/* Preview */}
          {preview && (
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#666', 
                marginBottom: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Preview
              </div>
              <div style={{ 
                width: '150px', 
                height: '150px', 
                margin: '0 auto',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '4px solid #667eea',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
              }}>
                <img 
                  src={preview} 
                  alt="preview" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              </div>
              
              <div style={{ marginTop: '15px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button 
                  onClick={handleUpload} 
                  disabled={loading}
                  style={{ 
                    padding: '10px 24px', 
                    background: loading ? '#ccc' : '#4CAF50',
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: '6px',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s'
                  }}
                >
                  {loading ? '⏳ Đang upload...' : '✅ Upload'}
                </button>
                
                <button 
                  onClick={handleRemoveFile}
                  disabled={loading}
                  style={{ 
                    padding: '10px 24px', 
                    background: '#f44336',
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: '6px',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  ❌ Hủy
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Avatar sau khi upload */}
        {avatarUrl && !preview && avatarUrl !== currentAvatar && (
          <div style={{ marginTop: '25px', textAlign: 'center' }}>
            <div style={{ 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#4CAF50', 
              marginBottom: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              ✅ Avatar mới đã upload
            </div>
            <div style={{ 
              width: '150px', 
              height: '150px', 
              margin: '0 auto',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '4px solid #4CAF50',
              boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
            }}>
              <img 
                src={avatarUrl} 
                alt="new avatar" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            </div>
            <div style={{ 
              marginTop: '12px', 
              fontSize: '12px', 
              color: '#999',
              wordBreak: 'break-all',
              padding: '8px',
              background: '#f5f5f5',
              borderRadius: '4px'
            }}>
              <strong>URL:</strong> {avatarUrl}
            </div>
          </div>
        )}

        {/* Hướng dẫn */}
        <div style={{ 
          marginTop: '25px', 
          padding: '15px',
          background: '#e3f2fd',
          borderRadius: '6px',
          border: '1px solid #90caf9'
        }}>
          <div style={{ fontSize: '14px', color: '#1565c0', fontWeight: '600', marginBottom: '8px' }}>
            ℹ️ Lưu ý:
          </div>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#1976d2' }}>
            <li>Chỉ chấp nhận file ảnh (JPG, PNG, GIF, etc.)</li>
            <li>Dung lượng tối đa: 5MB</li>
            <li>Ảnh sẽ được resize và lưu trên Cloudinary</li>
            <li>Avatar sẽ tự động hiển thị trên Profile của bạn</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
