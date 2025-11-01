import React, { useState } from 'react';
import axiosInstance from './axiosConfig';

export default function ModeratorPanel() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Giả lập API lấy thống kê cho Moderator
  const fetchModeratorStats = async () => {
    setLoading(true);
    setMessage(null);
    try {
      // TODO: Replace with actual API endpoint when SV1 implements it
      // const res = await axiosInstance.get('/moderator/stats');
      
      // Mock data for demo
      await new Promise(resolve => setTimeout(resolve, 500));
      setStats({
        pendingReviews: 12,
        reportedUsers: 3,
        flaggedContent: 5,
        todayActions: 8
      });
      setMessage({ type: 'success', text: 'Đã tải thống kê thành công' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Lỗi tải dữ liệu' });
    } finally {
      setLoading(false);
    }
  };

  // Giả lập action moderator
  const handleModeratorAction = async (action) => {
    setLoading(true);
    setMessage(null);
    try {
      // TODO: Replace with actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 300));
      setMessage({ 
        type: 'success', 
        text: `✅ Đã thực hiện: ${action}` 
      });
    } catch (err) {
      setMessage({ type: 'error', text: 'Lỗi thực hiện action' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, background: '#fff', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h3 style={{ marginTop: 0, color: '#2196f3', display: 'flex', alignItems: 'center', gap: 8 }}>
        🛡️ Moderator Panel
        <button
          onClick={fetchModeratorStats}
          disabled={loading}
          style={{
            marginLeft: 'auto',
            padding: '6px 12px',
            background: loading ? '#ccc' : '#2196f3',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: 14
          }}
        >
          {loading ? '⏳ Đang tải...' : '🔄 Tải thống kê'}
        </button>
      </h3>

      {message && (
        <div style={{
          padding: 12,
          marginBottom: 15,
          borderRadius: 6,
          background: message.type === 'error' ? '#ffebee' : '#e8f5e9',
          color: message.type === 'error' ? '#c62828' : '#2e7d32',
          border: `1px solid ${message.type === 'error' ? '#ef5350' : '#66bb6a'}`
        }}>
          {message.text}
        </div>
      )}

      {stats && (
        <div style={{ marginBottom: 20 }}>
          <h4 style={{ marginTop: 0, marginBottom: 15, color: '#555' }}>📊 Thống kê</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 15 }}>
            <div style={{ padding: 15, background: '#e3f2fd', borderRadius: 6, border: '1px solid #2196f3' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1976d2' }}>{stats.pendingReviews}</div>
              <div style={{ fontSize: 14, color: '#555', marginTop: 5 }}>📝 Chờ duyệt</div>
            </div>
            <div style={{ padding: 15, background: '#fff3e0', borderRadius: 6, border: '1px solid #ff9800' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#f57c00' }}>{stats.reportedUsers}</div>
              <div style={{ fontSize: 14, color: '#555', marginTop: 5 }}>⚠️ User bị báo cáo</div>
            </div>
            <div style={{ padding: 15, background: '#ffebee', borderRadius: 6, border: '1px solid #f44336' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#d32f2f' }}>{stats.flaggedContent}</div>
              <div style={{ fontSize: 14, color: '#555', marginTop: 5 }}>🚩 Nội dung vi phạm</div>
            </div>
            <div style={{ padding: 15, background: '#e8f5e9', borderRadius: 6, border: '1px solid #4caf50' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#388e3c' }}>{stats.todayActions}</div>
              <div style={{ fontSize: 14, color: '#555', marginTop: 5 }}>✅ Đã xử lý hôm nay</div>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <h4 style={{ marginTop: 0, marginBottom: 15, color: '#555' }}>🎯 Hành động nhanh</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <button
            onClick={() => handleModeratorAction('Xem danh sách báo cáo')}
            disabled={loading}
            style={{
              padding: '10px 16px',
              background: '#2196f3',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 14
            }}
          >
            📋 Xem báo cáo
          </button>
          <button
            onClick={() => handleModeratorAction('Duyệt nội dung')}
            disabled={loading}
            style={{
              padding: '10px 16px',
              background: '#4caf50',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 14
            }}
          >
            ✅ Duyệt nội dung
          </button>
          <button
            onClick={() => handleModeratorAction('Khóa user vi phạm')}
            disabled={loading}
            style={{
              padding: '10px 16px',
              background: '#f44336',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 14
            }}
          >
            🔒 Khóa user
          </button>
          <button
            onClick={() => handleModeratorAction('Xóa nội dung vi phạm')}
            disabled={loading}
            style={{
              padding: '10px 16px',
              background: '#ff9800',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 14
            }}
          >
            🗑️ Xóa nội dung
          </button>
        </div>
      </div>

      <div style={{
        marginTop: 20,
        padding: 12,
        background: '#f5f5f5',
        borderRadius: 6,
        fontSize: 13,
        color: '#666'
      }}>
        💡 <strong>Lưu ý:</strong> Đây là panel demo cho Moderator. Các API thực tế cần được implement bởi SV1 (Backend).
      </div>
    </div>
  );
}
