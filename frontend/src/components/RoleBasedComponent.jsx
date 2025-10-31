import React from 'react';

/**
 * RoleBasedComponent - Component wrapper để kiểm tra quyền truy cập
 * 
 * Props:
 * - allowedRoles: Array các role được phép xem (vd: ['admin', 'moderator'])
 * - currentRole: Role hiện tại của user
 * - fallback: Component hiển thị khi không có quyền (optional)
 * - children: Nội dung cần hiển thị khi có quyền
 * 
 * Usage:
 * <RoleBasedComponent allowedRoles={['admin', 'moderator']} currentRole={userRole}>
 *   <AdminPanel />
 * </RoleBasedComponent>
 */
export default function RoleBasedComponent({ 
  allowedRoles = [], 
  currentRole, 
  fallback = null, 
  children 
}) {
  // Normalize role to lowercase để tránh lỗi case-sensitive
  const normalizedRole = currentRole ? String(currentRole).toLowerCase() : '';
  const normalizedAllowedRoles = allowedRoles.map(role => String(role).toLowerCase());

  // Kiểm tra role hiện tại có trong danh sách allowed không
  const hasAccess = normalizedAllowedRoles.includes(normalizedRole);

  // Nếu có quyền, hiển thị children
  if (hasAccess) {
    return <>{children}</>;
  }

  // Nếu không có quyền, hiển thị fallback hoặc null
  return fallback;
}

/**
 * Hook để lấy role từ token
 */
export function useUserRole(token) {
  if (!token) return null;

  try {
    const payload = token.split('.')[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const parsed = JSON.parse(decodeURIComponent(escape(decoded)));
    return parsed.role ? String(parsed.role).toLowerCase() : 'user';
  } catch (e) {
    console.error('Error decoding token:', e);
    return null;
  }
}

/**
 * Component hiển thị khi không có quyền truy cập
 */
export function NoAccessMessage({ requiredRoles = [] }) {
  return (
    <div style={{
      padding: 20,
      background: '#fff3cd',
      borderRadius: 8,
      border: '1px solid #ffc107',
      color: '#856404',
      textAlign: 'center',
      margin: '20px 0'
    }}>
      <h3 style={{ marginTop: 0 }}>🔒 Không có quyền truy cập</h3>
      <p style={{ margin: '10px 0' }}>
        Chức năng này chỉ dành cho: <strong>{requiredRoles.map(r => r.toUpperCase()).join(', ')}</strong>
      </p>
      <p style={{ fontSize: 14, color: '#666', margin: 0 }}>
        Vui lòng đăng nhập với tài khoản có quyền phù hợp.
      </p>
    </div>
  );
}
