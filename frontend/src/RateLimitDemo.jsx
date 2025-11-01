import React, { useState, useEffect } from 'react';
import axiosInstance from './axiosConfig';

export default function RateLimitDemo() {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('wrongpassword');
  const [attempts, setAttempts] = useState(0);
  const [rateLimited, setRateLimited] = useState(false);
  const [message, setMessage] = useState(null);
  const [logs, setLogs] = useState([]);

  const attemptLogin = async () => {
    setMessage(null);
    
    try {
      const res = await axiosInstance.post('/auth/login', { email, password });
      
      const newLog = {
        time: new Date().toLocaleTimeString(),
        status: 'success',
        message: '✅ Login thành công!',
        response: res.data
      };
      
      setLogs(prev => [newLog, ...prev]);
      setMessage({ type: 'success', text: '✅ Login thành công!' });
      setAttempts(prev => prev + 1);
      
    } catch (err) {
      const newLog = {
        time: new Date().toLocaleTimeString(),
        status: err.response?.status === 429 ? 'rate-limited' : 'error',
        message: err.response?.data?.message || err.message,
        statusCode: err.response?.status
      };
      
      setLogs(prev => [newLog, ...prev]);
      setAttempts(prev => prev + 1);
      
      if (err.response?.status === 429) {
        setRateLimited(true);
        setMessage({ 
          type: 'error', 
          text: '🚫 BỊ CHẶN! ' + (err.response?.data?.message || 'Rate limit exceeded') 
        });
      } else {
        setMessage({ 
          type: 'error', 
          text: '❌ ' + (err.response?.data?.message || err.message) 
        });
      }
    }
  };

  const resetDemo = () => {
    setAttempts(0);
    setRateLimited(false);
    setMessage(null);
    setLogs([]);
  };

  return (
    <div style={{
      background: '#fff',
      borderRadius: '12px',
      padding: '30px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <div style={{ marginBottom: '25px' }}>
        <h2 style={{ margin: 0, color: '#333' }}>🛡️ Rate Limiting Demo</h2>
        <p style={{ color: '#666', margin: '8px 0 0 0', fontSize: '14px' }}>
          Thử login sai nhiều lần để kích hoạt rate limiting
        </p>
      </div>

      {/* Status */}
      <div style={{
        padding: '20px',
        background: rateLimited ? '#ffebee' : '#e8f5e9',
        borderRadius: '8px',
        marginBottom: '20px',
        border: `2px solid ${rateLimited ? '#f44336' : '#4caf50'}`
      }}>
        <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '10px' }}>
          {rateLimited ? '🚫 RATE LIMITED!' : '✅ OK - Có thể login'}
        </div>
        <div style={{ fontSize: '14px', color: '#666' }}>
          Số lần thử: <strong>{attempts}</strong> / 5
        </div>
        <div style={{ fontSize: '13px', color: '#999', marginTop: '5px' }}>
          Giới hạn: 5 lần login / 10 phút
        </div>
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

      {/* Test Form */}
      <div style={{
        padding: '20px',
        background: '#f9f9f9',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>
            📧 Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              padding: '10px',
              width: '100%',
              border: '2px solid #e0e0e0',
              borderRadius: '6px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>
            🔑 Password (thử sai để test)
          </label>
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              padding: '10px',
              width: '100%',
              border: '2px solid #e0e0e0',
              borderRadius: '6px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={attemptLogin}
            disabled={rateLimited}
            style={{
              flex: 1,
              padding: '12px',
              background: rateLimited ? '#bdbdbd' : '#f44336',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: rateLimited ? 'not-allowed' : 'pointer'
            }}
          >
            {rateLimited ? '🚫 Bị chặn' : '🔐 Thử Login (Sai)'}
          </button>

          <button
            onClick={resetDemo}
            style={{
              padding: '12px 20px',
              background: '#2196f3',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            🔄 Reset
          </button>
        </div>
      </div>

      {/* Logs */}
      <div>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#333' }}>
          📋 Request Logs ({logs.length})
        </h3>
        
        {logs.length === 0 ? (
          <div style={{
            padding: '30px',
            textAlign: 'center',
            background: '#f9f9f9',
            borderRadius: '8px',
            color: '#999'
          }}>
            Chưa có requests. Click "Thử Login" để test!
          </div>
        ) : (
          <div style={{
            maxHeight: '300px',
            overflowY: 'auto',
            border: '1px solid #e0e0e0',
            borderRadius: '8px'
          }}>
            {logs.map((log, index) => (
              <div
                key={index}
                style={{
                  padding: '12px 15px',
                  borderBottom: index < logs.length - 1 ? '1px solid #f0f0f0' : 'none',
                  background: log.status === 'rate-limited' ? '#ffebee' :
                             log.status === 'error' ? '#fff3e0' :
                             '#e8f5e9'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontSize: '12px', color: '#999' }}>
                    {log.time}
                  </span>
                  <span style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: log.status === 'rate-limited' ? '#f44336' :
                               log.status === 'error' ? '#ff9800' :
                               '#4caf50',
                    color: '#fff',
                    fontWeight: '600'
                  }}>
                    {log.statusCode || log.status}
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: '#333' }}>
                  {log.message}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{
        marginTop: '20px',
        padding: '15px',
        background: '#fff3e0',
        borderRadius: '8px',
        fontSize: '13px',
        color: '#e65100',
        border: '1px solid #ffb74d'
      }}>
        <strong>⚠️ Cách test:</strong>
        <ol style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
          <li>Nhập email bất kỳ (không cần đúng)</li>
          <li>Password để sai (ví dụ: "wrongpassword")</li>
          <li>Click "Thử Login" nhiều lần (5-6 lần)</li>
          <li>Sau lần thứ 5, sẽ bị chặn 10 phút!</li>
          <li>Kiểm tra logs để thấy status code 429</li>
        </ol>
      </div>
    </div>
  );
}
