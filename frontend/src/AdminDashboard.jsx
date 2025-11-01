import React, { useState, useEffect } from 'react';
import axiosInstance from './axiosConfig';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setMessage(null);
    try {
      // Fetch all users to calculate stats
      const res = await axiosInstance.get('/users');
      const allUsers = res.data;
      setUsers(allUsers);

      // Calculate stats by role
      const roleStats = {
        total: allUsers.length,
        admin: allUsers.filter(u => String(u.role).toLowerCase() === 'admin').length,
        moderator: allUsers.filter(u => String(u.role).toLowerCase() === 'moderator').length,
        user: allUsers.filter(u => String(u.role).toLowerCase() === 'user').length
      };

      setStats(roleStats);
      setMessage({ type: 'success', text: '✅ Đã tải thống kê thành công' });
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Lỗi tải dữ liệu dashboard' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, background: '#fff', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h3 style={{ marginTop: 0, color: '#ff9800', display: 'flex', alignItems: 'center', gap: 8 }}>
        👑 Admin Dashboard
        <button
          onClick={fetchDashboardData}
          disabled={loading}
          style={{
            marginLeft: 'auto',
            padding: '6px 12px',
            background: loading ? '#ccc' : '#ff9800',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: 14
          }}
        >
          {loading ? '⏳ Đang tải...' : '🔄 Làm mới'}
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

      {loading && !stats && (
        <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
          <p>⏳ Đang tải thống kê...</p>
        </div>
      )}

      {stats && (
        <>
          <div style={{ marginBottom: 25 }}>
            <h4 style={{ marginTop: 0, marginBottom: 15, color: '#555' }}>📊 Thống kê người dùng theo vai trò</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 15 }}>
              <div style={{ 
                padding: 20, 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                borderRadius: 8, 
                color: '#fff',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}>
                <div style={{ fontSize: 36, fontWeight: 'bold' }}>{stats.total}</div>
                <div style={{ fontSize: 14, marginTop: 5, opacity: 0.9 }}>👥 Tổng người dùng</div>
              </div>
              
              <div style={{ 
                padding: 20, 
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
                borderRadius: 8, 
                color: '#fff',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}>
                <div style={{ fontSize: 36, fontWeight: 'bold' }}>{stats.admin}</div>
                <div style={{ fontSize: 14, marginTop: 5, opacity: 0.9 }}>👑 Admin</div>
              </div>
              
              <div style={{ 
                padding: 20, 
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 
                borderRadius: 8, 
                color: '#fff',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}>
                <div style={{ fontSize: 36, fontWeight: 'bold' }}>{stats.moderator}</div>
                <div style={{ fontSize: 14, marginTop: 5, opacity: 0.9 }}>🛡️ Moderator</div>
              </div>
              
              <div style={{ 
                padding: 20, 
                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', 
                borderRadius: 8, 
                color: '#fff',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}>
                <div style={{ fontSize: 36, fontWeight: 'bold' }}>{stats.user}</div>
                <div style={{ fontSize: 14, marginTop: 5, opacity: 0.9 }}>👤 User</div>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <h4 style={{ marginTop: 0, marginBottom: 15, color: '#555' }}>📈 Biểu đồ phân bố</h4>
            <div style={{ 
              background: '#f5f5f5', 
              borderRadius: 8, 
              padding: 20,
              border: '1px solid #ddd'
            }}>
              {/* Simple bar chart */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 14, color: '#666' }}>👑 Admin</span>
                  <span style={{ fontSize: 14, fontWeight: 'bold', color: '#ff9800' }}>
                    {((stats.admin / stats.total) * 100).toFixed(1)}%
                  </span>
                </div>
                <div style={{ background: '#ddd', height: 20, borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ 
                    background: '#ff9800', 
                    height: '100%', 
                    width: `${(stats.admin / stats.total) * 100}%`,
                    transition: 'width 0.3s'
                  }}></div>
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 14, color: '#666' }}>🛡️ Moderator</span>
                  <span style={{ fontSize: 14, fontWeight: 'bold', color: '#2196f3' }}>
                    {((stats.moderator / stats.total) * 100).toFixed(1)}%
                  </span>
                </div>
                <div style={{ background: '#ddd', height: 20, borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ 
                    background: '#2196f3', 
                    height: '100%', 
                    width: `${(stats.moderator / stats.total) * 100}%`,
                    transition: 'width 0.3s'
                  }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 14, color: '#666' }}>👤 User</span>
                  <span style={{ fontSize: 14, fontWeight: 'bold', color: '#4caf50' }}>
                    {((stats.user / stats.total) * 100).toFixed(1)}%
                  </span>
                </div>
                <div style={{ background: '#ddd', height: 20, borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ 
                    background: '#4caf50', 
                    height: '100%', 
                    width: `${(stats.user / stats.total) * 100}%`,
                    transition: 'width 0.3s'
                  }}></div>
                </div>
              </div>
            </div>
          </div>

          <div style={{
            padding: 15,
            background: '#e3f2fd',
            borderRadius: 6,
            border: '1px solid #2196f3',
            fontSize: 13,
            color: '#1565c0'
          }}>
            💡 <strong>Thông tin:</strong> Dữ liệu được tính toán từ danh sách user trong database. 
            Nhấn "Làm mới" để cập nhật số liệu mới nhất.
          </div>
        </>
      )}
    </div>
  );
}
