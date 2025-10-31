import React, { useState, useEffect } from 'react';
import axiosInstance from './axiosConfig';

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'login', 'logout', 'update', etc.
  const [searchEmail, setSearchEmail] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    setMessage(null);
    
    try {
      console.log('📜 Fetching activity logs...');
      
      const res = await axiosInstance.get('/users/logs/all');
      
      console.log('✅ Logs response:', res.data);
      
      setLogs(res.data?.logs || []);
      setMessage({ 
        type: 'success', 
        text: `✅ Đã tải ${res.data?.logs?.length || 0} logs` 
      });
      
    } catch (err) {
      console.error('❌ Fetch logs error:', err);
      const errMsg = err.response?.data?.message || err.message;
      setMessage({ type: 'error', text: `❌ ${errMsg}` });
    } finally {
      setLoading(false);
    }
  };

  // Filter logs
  const filteredLogs = logs.filter(log => {
    // Filter by action type
    if (filter !== 'all' && !log.action.toLowerCase().includes(filter.toLowerCase())) {
      return false;
    }
    
    // Filter by email search
    if (searchEmail && !log.user?.email?.toLowerCase().includes(searchEmail.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Get action icon
  const getActionIcon = (action) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('login')) return '🔐';
    if (actionLower.includes('logout')) return '🚪';
    if (actionLower.includes('update') || actionLower.includes('edit')) return '✏️';
    if (actionLower.includes('delete')) return '🗑️';
    if (actionLower.includes('create') || actionLower.includes('add')) return '➕';
    if (actionLower.includes('view') || actionLower.includes('read')) return '👁️';
    return '📝';
  };

  // Get action color
  const getActionColor = (action) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('login')) return '#4caf50';
    if (actionLower.includes('logout')) return '#ff9800';
    if (actionLower.includes('delete')) return '#f44336';
    if (actionLower.includes('update') || actionLower.includes('edit')) return '#2196f3';
    if (actionLower.includes('create')) return '#9c27b0';
    return '#757575';
  };

  return (
    <div style={{
      background: '#fff',
      borderRadius: '12px',
      padding: '30px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '25px' }}>
        <h2 style={{ 
          margin: 0, 
          color: '#333',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          📜 Activity Logs
          <span style={{
            fontSize: '14px',
            fontWeight: 'normal',
            color: '#999',
            background: '#f5f5f5',
            padding: '4px 12px',
            borderRadius: '12px'
          }}>
            {filteredLogs.length} logs
          </span>
        </h2>
        <p style={{ color: '#666', margin: '8px 0 0 0', fontSize: '14px' }}>
          Lịch sử hoạt động của tất cả người dùng
        </p>
      </div>

      {/* Message */}
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

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '15px',
        marginBottom: '25px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        {/* Search by email */}
        <input
          type="text"
          placeholder="🔍 Tìm theo email..."
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
          style={{
            padding: '10px 15px',
            border: '2px solid #e0e0e0',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
            flex: '1 1 250px',
            minWidth: '200px'
          }}
        />

        {/* Filter buttons */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['all', 'login', 'logout', 'update', 'delete', 'create'].map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              style={{
                padding: '8px 16px',
                background: filter === type ? '#2196f3' : '#f5f5f5',
                color: filter === type ? '#fff' : '#333',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: filter === type ? '600' : 'normal',
                transition: 'all 0.2s'
              }}
            >
              {type === 'all' ? '📋 Tất cả' : 
               type === 'login' ? '🔐 Login' :
               type === 'logout' ? '🚪 Logout' :
               type === 'update' ? '✏️ Update' :
               type === 'delete' ? '🗑️ Delete' :
               '➕ Create'}
            </button>
          ))}
        </div>

        {/* Refresh button */}
        <button
          onClick={fetchLogs}
          disabled={loading}
          style={{
            padding: '8px 16px',
            background: loading ? '#bdbdbd' : '#4caf50',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '13px',
            fontWeight: '600'
          }}
        >
          {loading ? '⏳ Loading...' : '🔄 Refresh'}
        </button>
      </div>

      {/* Logs Table */}
      {loading && logs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          ⏳ Đang tải logs...
        </div>
      ) : filteredLogs.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px',
          background: '#f9f9f9',
          borderRadius: '8px',
          color: '#999'
        }}>
          📭 Không có logs nào
          {(filter !== 'all' || searchEmail) && (
            <div style={{ marginTop: '10px', fontSize: '14px' }}>
              Thử xóa bộ lọc để xem tất cả logs
            </div>
          )}
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '14px'
          }}>
            <thead>
              <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #e0e0e0' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#555' }}>
                  #
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#555' }}>
                  📧 User
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#555' }}>
                  🎯 Action
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#555' }}>
                  🌐 IP Address
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#555' }}>
                  ⏰ Timestamp
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, index) => (
                <tr 
                  key={log._id || index}
                  style={{
                    borderBottom: '1px solid #f0f0f0',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#fafafa'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '12px', color: '#999' }}>
                    {index + 1}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontWeight: '500', color: '#333' }}>
                        {log.user?.email || 'N/A'}
                      </span>
                      {log.user?.role && (
                        <span style={{
                          fontSize: '11px',
                          color: '#fff',
                          background: log.user.role === 'Admin' ? '#ff9800' : 
                                     log.user.role === 'Moderator' ? '#2196f3' : '#4caf50',
                          padding: '2px 6px',
                          borderRadius: '3px',
                          width: 'fit-content'
                        }}>
                          {log.user.role}
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      background: getActionColor(log.action) + '15',
                      color: getActionColor(log.action),
                      fontWeight: '500'
                    }}>
                      {getActionIcon(log.action)} {log.action}
                    </span>
                  </td>
                  <td style={{ padding: '12px', color: '#666', fontFamily: 'monospace' }}>
                    {log.ip || 'Unknown'}
                  </td>
                  <td style={{ padding: '12px', color: '#666', fontSize: '13px' }}>
                    {formatTime(log.timestamp || log.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Stats */}
      {logs.length > 0 && (
        <div style={{
          marginTop: '25px',
          padding: '15px',
          background: '#f9f9f9',
          borderRadius: '8px',
          display: 'flex',
          gap: '20px',
          flexWrap: 'wrap',
          fontSize: '13px'
        }}>
          <div>
            <strong>📊 Total:</strong> {logs.length} logs
          </div>
          <div>
            <strong>🔐 Login:</strong> {logs.filter(l => l.action.toLowerCase().includes('login')).length}
          </div>
          <div>
            <strong>🚪 Logout:</strong> {logs.filter(l => l.action.toLowerCase().includes('logout')).length}
          </div>
          <div>
            <strong>✏️ Updates:</strong> {logs.filter(l => l.action.toLowerCase().includes('update')).length}
          </div>
        </div>
      )}

      {/* Info box */}
      <div style={{
        marginTop: '20px',
        padding: '15px',
        background: '#e3f2fd',
        borderRadius: '8px',
        fontSize: '13px',
        color: '#1565c0',
        border: '1px solid #90caf9'
      }}>
        <strong>💡 Lưu ý:</strong>
        <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
          <li>Logs được ghi tự động khi user thực hiện hành động</li>
          <li>Chỉ Admin mới có quyền xem tất cả logs</li>
          <li>Rate limiting: Tối đa 5 lần login / 10 phút để chống brute force</li>
        </ul>
      </div>
    </div>
  );
}
