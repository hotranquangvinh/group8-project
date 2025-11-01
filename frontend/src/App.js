import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from './store/slices/authSlice';
import ProtectedRoute from './components/ProtectedRoute';
import AddUser from "./AddUser";
import UserList from "./UserList";
import SignUp from "./SignUp";
import Login from "./Login";
import Profile from "./Profile";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import UploadAvatar from "./UploadAvatar";
import TokenRefreshDemo from "./TokenRefreshDemo";
import AdminDashboard from "./AdminDashboard";
import ModeratorPanel from "./ModeratorPanel";
import ActivityLogs from "./ActivityLogs";
import RateLimitDemo from "./RateLimitDemo";
import "./App.css";

// Navigation Component
function Navigation() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const userRole = user?.role?.toLowerCase() || 'user';

  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('%c👤 USER INFO', 'background: #2196F3; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold;');
      console.log('📧 Email:', user.email || 'N/A');
      console.log('👤 Name:', user.name || 'N/A');
      console.log('🎭 Role:', userRole.toUpperCase());
      console.log('🆔 User ID:', user.id || 'N/A');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    } else if (!isAuthenticated) {
      console.log('%c⚠️ NOT LOGGED IN', 'background: #f44336; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold;');
    }
  }, [isAuthenticated, user, userRole]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    alert("✅ Đã đăng xuất (tokens đã được xóa)");
  };

  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
      <button onClick={() => navigate('/login')} style={{ padding: '8px 14px', background: window.location.pathname === '/login' ? '#2196F3' : '#eee', color: window.location.pathname === '/login' ? '#fff' : '#333', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Đăng nhập</button>
      <button onClick={() => navigate('/signup')} style={{ padding: '8px 14px', background: window.location.pathname === '/signup' ? '#2196F3' : '#eee', color: window.location.pathname === '/signup' ? '#fff' : '#333', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Đăng ký</button>
      {isAuthenticated && (
        <>
          <button onClick={() => navigate('/profile')} style={{ padding: '8px 14px', background: window.location.pathname === '/profile' ? '#2196F3' : '#eee', color: window.location.pathname === '/profile' ? '#fff' : '#333', border: 'none', borderRadius: 6, cursor: 'pointer' }}>👤 Profile</button>
          
          {/* Admin-only menu */}
          {userRole === 'admin' && (
            <>
              <button onClick={() => navigate('/admin')} style={{ padding: '8px 14px', background: window.location.pathname === '/admin' ? '#ff9800' : '#eee', color: window.location.pathname === '/admin' ? '#fff' : '#333', border: 'none', borderRadius: 6, cursor: 'pointer' }}>👑 Dashboard</button>
              <button onClick={() => navigate('/admin/activity-logs')} style={{ padding: '8px 14px', background: window.location.pathname === '/admin/activity-logs' ? '#ff9800' : '#eee', color: window.location.pathname === '/admin/activity-logs' ? '#fff' : '#333', border: 'none', borderRadius: 6, cursor: 'pointer' }}>📜 Activity Logs</button>
              <button onClick={() => navigate('/admin/rate-limit')} style={{ padding: '8px 14px', background: window.location.pathname === '/admin/rate-limit' ? '#ff9800' : '#eee', color: window.location.pathname === '/admin/rate-limit' ? '#fff' : '#333', border: 'none', borderRadius: 6, cursor: 'pointer' }}>🛡️ Rate Limit</button>
            </>
          )}
          
          {/* Moderator-only menu */}
          {userRole === 'moderator' && (
            <button onClick={() => navigate('/moderator')} style={{ padding: '8px 14px', background: window.location.pathname === '/moderator' ? '#2196f3' : '#eee', color: window.location.pathname === '/moderator' ? '#fff' : '#333', border: 'none', borderRadius: 6, cursor: 'pointer' }}>🛡️ Moderator</button>
          )}
          
          <button onClick={() => navigate('/demo')} style={{ padding: '8px 14px', background: window.location.pathname === '/demo' ? '#2196F3' : '#eee', color: window.location.pathname === '/demo' ? '#fff' : '#333', border: 'none', borderRadius: 6, cursor: 'pointer' }}>🔄 Demo Refresh</button>
        </>
      )}
      {isAuthenticated ? (
        <div style={{ marginLeft: 20, display: 'flex', gap: 8, alignItems: 'center' }}>
          {(() => {
            const roleConfig = {
              admin: { label: '👑 Admin', color: '#ff9800' },
              moderator: { label: '🛡️ Moderator', color: '#2196f3' },
              user: { label: '👤 User', color: '#4caf50' }
            };
            const config = roleConfig[userRole] || roleConfig.user;
            return (
              <span style={{ 
                padding: '4px 8px', 
                background: config.color, 
                color: '#fff', 
                borderRadius: 4, 
                fontSize: 12,
                fontWeight: '600'
              }}>
                {config.label}
              </span>
            );
          })()}
          <button onClick={handleLogout} style={{ padding: '6px 10px', background: '#f44336', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Đăng xuất</button>
        </div>
      ) : null}
    </div>
  );
}

function App() {
  const { token } = useSelector(state => state.auth);

  return (
    <BrowserRouter>
      <div style={{ 
        maxWidth: "1200px", 
        margin: "0 auto", 
        padding: "20px",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
      }}>
        <h1 style={{ 
          textAlign: "center", 
          color: "#2196F3",
          marginBottom: "30px",
          borderBottom: "3px solid #2196F3",
          paddingBottom: "10px"
        }}>
          🎯 Quản lý User - React + MongoDB
        </h1>
        
        <Navigation />

        <div style={{ maxWidth: 820, margin: '0 auto 30px' }}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            
            {/* Protected Routes */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile token={token} />
              </ProtectedRoute>
            } />
            
            <Route path="/demo" element={
              <ProtectedRoute>
                <TokenRefreshDemo />
              </ProtectedRoute>
            } />
            
            <Route path="/upload" element={
              <ProtectedRoute>
                <UploadAvatar token={token} />
              </ProtectedRoute>
            } />
            
            {/* Admin-only Routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/activity-logs" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ActivityLogs />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/rate-limit" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <RateLimitDemo />
              </ProtectedRoute>
            } />
            
            {/* Moderator-only Routes */}
            <Route path="/moderator" element={
              <ProtectedRoute allowedRoles={['moderator', 'admin']}>
                <ModeratorPanel />
              </ProtectedRoute>
            } />
            
            {/* Redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
        
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 12 }}>
          <AddUser />
        </div>
        
        <hr style={{ 
          margin: "30px 0", 
          border: "none", 
          borderTop: "2px dashed #ddd" 
        }} />
        
        <UserList token={token} />
        
        <footer style={{ 
          marginTop: "40px", 
          textAlign: "center", 
          color: "#999",
          fontSize: "12px"
        }}>
          Made with ❤️ by Group 8 | © 2025
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
