import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * ProtectedRoute - Component bảo vệ routes chỉ cho phép user đã đăng nhập
 * 
 * Props:
 * - children: Component cần bảo vệ
 * - allowedRoles: Array các roles được phép truy cập (optional)
 * - redirectTo: Đường dẫn redirect khi không có quyền (default: '/login')
 * 
 * Usage:
 * <ProtectedRoute>
 *   <Profile />
 * </ProtectedRoute>
 * 
 * <ProtectedRoute allowedRoles={['admin']}>
 *   <AdminDashboard />
 * </ProtectedRoute>
 */
export default function ProtectedRoute({ 
  children, 
  allowedRoles = null,
  redirectTo = '/login' 
}) {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(3);

  // Countdown và auto redirect khi chưa đăng nhập
  useEffect(() => {
    if (!isAuthenticated && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (!isAuthenticated && countdown === 0) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, countdown, navigate, redirectTo]);

  // Nếu chưa đăng nhập, hiển thị thông báo với countdown
  if (!isAuthenticated) {
    return (
      <div style={{
        padding: 40,
        textAlign: 'center',
        maxWidth: 600,
        margin: '100px auto',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 16,
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        color: '#fff'
      }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>🔐</div>
        <h2 style={{ margin: '0 0 16px 0', fontSize: 28 }}>Yêu cầu đăng nhập</h2>
        <p style={{ fontSize: 16, marginBottom: 24, opacity: 0.9 }}>
          Bạn cần đăng nhập để truy cập trang này.
        </p>
        <div style={{
          background: 'rgba(255,255,255,0.2)',
          padding: 16,
          borderRadius: 8,
          marginBottom: 24
        }}>
          <p style={{ margin: 0, fontSize: 14 }}>
            Tự động chuyển hướng trong <strong style={{ 
              fontSize: 32, 
              display: 'block', 
              margin: '8px 0',
              fontWeight: 'bold'
            }}>{countdown}</strong> giây...
          </p>
        </div>
        <button
          onClick={() => navigate(redirectTo)}
          style={{
            padding: '14px 32px',
            background: '#fff',
            color: '#667eea',
            border: 'none',
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          Đăng nhập ngay →
        </button>
      </div>
    );
  }

  // Nếu có yêu cầu role cụ thể
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.role ? String(user.role).toLowerCase() : '';
    const normalizedAllowedRoles = allowedRoles.map(role => String(role).toLowerCase());
    
    // Kiểm tra role có trong danh sách allowed không
    if (!normalizedAllowedRoles.includes(userRole)) {
      return (
        <div style={{
          padding: 40,
          textAlign: 'center',
          maxWidth: 600,
          margin: '40px auto',
          background: '#fff3cd',
          borderRadius: 8,
          border: '2px solid #ffc107'
        }}>
          <h2 style={{ color: '#856404', marginTop: 0 }}>🔒 Không có quyền truy cập</h2>
          <p style={{ fontSize: 16, color: '#666' }}>
            Trang này chỉ dành cho: <strong>{allowedRoles.join(', ').toUpperCase()}</strong>
          </p>
          <p style={{ fontSize: 14, color: '#999' }}>
            Vai trò của bạn: <strong style={{ color: '#856404' }}>{userRole.toUpperCase()}</strong>
          </p>
          <button
            onClick={() => window.history.back()}
            style={{
              marginTop: 20,
              padding: '10px 20px',
              background: '#2196f3',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 'bold'
            }}
          >
            ← Quay lại
          </button>
        </div>
      );
    }
  }

  // Có quyền truy cập, hiển thị component
  return children;
}

/**
 * PublicRoute - Component cho routes chỉ dành cho user chưa đăng nhập
 * (Ví dụ: Login, Signup - nếu đã login thì redirect về home)
 */
export function PublicRoute({ children, redirectTo = '/' }) {
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
