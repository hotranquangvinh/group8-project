import React, { useState, useEffect } from "react";
import axiosInstance from './axiosConfig'; // Import axios instance với interceptor
import { useUserRole } from './components/RoleBasedComponent';
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
import "./App.css";

function App() {
  const [view, setView] = useState("login"); // 'login', 'signup', or 'profile'
  const [token, setToken] = useState(null);
  const userRole = useUserRole(token); // Lấy role từ token

  useEffect(() => {
    const t = localStorage.getItem("auth_token");
    if (t) setToken(t);
  }, []);

  // Log role vào console mỗi khi token hoặc role thay đổi
  useEffect(() => {
    if (token && userRole) {
      const parseJwt = (token) => {
        try {
          const payload = token.split('.')[1];
          const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
          return JSON.parse(decodeURIComponent(escape(decoded)));
        } catch (e) {
          return null;
        }
      };
      
      const payload = parseJwt(token);
      console.log('%c👤 USER INFO', 'background: #2196F3; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold;');
      console.log('📧 Email:', payload?.email || 'N/A');
      console.log('👤 Name:', payload?.name || 'N/A');
      console.log('🎭 Role:', userRole.toUpperCase());
      console.log('🆔 User ID:', payload?.id || 'N/A');
      console.log('⏰ Token expires:', payload?.exp ? new Date(payload.exp * 1000).toLocaleString() : 'N/A');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    } else if (!token) {
      console.log('%c⚠️ NOT LOGGED IN', 'background: #f44336; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold;');
    }
  }, [token, userRole]);

  // Axios interceptor đã tự động xử lý Authorization header
  // Không cần set axios.defaults.headers nữa

  const handleLogin = (newToken) => {
    localStorage.setItem("auth_token", newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    // Xóa cả access token và refresh token
    localStorage.removeItem("auth_token");
    localStorage.removeItem("refresh_token");
    setToken(null);
    setView('login'); // Chuyển về trang login
    alert("✅ Đã đăng xuất (tokens đã được xóa)");
  };
  return (
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
      
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
        <button onClick={() => setView('login')} style={{ padding: '8px 14px', background: view === 'login' ? '#2196F3' : '#eee', color: view === 'login' ? '#fff' : '#333', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Đăng nhập</button>
        <button onClick={() => setView('signup')} style={{ padding: '8px 14px', background: view === 'signup' ? '#2196F3' : '#eee', color: view === 'signup' ? '#fff' : '#333', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Đăng ký</button>
        {token && (
          <>
            <button onClick={() => setView('profile')} style={{ padding: '8px 14px', background: view === 'profile' ? '#2196F3' : '#eee', color: view === 'profile' ? '#fff' : '#333', border: 'none', borderRadius: 6, cursor: 'pointer' }}>👤 Profile</button>
            
            {/* Admin-only menu */}
            {userRole === 'admin' && (
              <button onClick={() => setView('admin-dashboard')} style={{ padding: '8px 14px', background: view === 'admin-dashboard' ? '#ff9800' : '#eee', color: view === 'admin-dashboard' ? '#fff' : '#333', border: 'none', borderRadius: 6, cursor: 'pointer' }}>👑 Dashboard</button>
            )}
            
            {/* Moderator-only menu */}
            {userRole === 'moderator' && (
              <button onClick={() => setView('moderator-panel')} style={{ padding: '8px 14px', background: view === 'moderator-panel' ? '#2196f3' : '#eee', color: view === 'moderator-panel' ? '#fff' : '#333', border: 'none', borderRadius: 6, cursor: 'pointer' }}>🛡️ Moderator</button>
            )}
            
            <button onClick={() => setView('demo')} style={{ padding: '8px 14px', background: view === 'demo' ? '#2196F3' : '#eee', color: view === 'demo' ? '#fff' : '#333', border: 'none', borderRadius: 6, cursor: 'pointer' }}>🔄 Demo Refresh</button>
          </>
        )}
        {token ? (
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

      <div style={{ maxWidth: 820, margin: '0 auto 30px' }}>
        {window.location.pathname.startsWith('/reset-password/') ? (
          <ResetPassword onBack={() => window.location.href = '/'} />
        ) : view === 'forgot' ? (
          <ForgotPassword onBack={() => setView('login')} />
        ) : view === 'upload' ? (
          <UploadAvatar token={token} />
        ) : view === 'signup' ? (
          <SignUp onSuccess={() => setView('login')} />
        ) : view === 'profile' ? (
          <Profile token={token} />
        ) : view === 'demo' ? (
          <TokenRefreshDemo />
        ) : view === 'admin-dashboard' ? (
          <AdminDashboard />
        ) : view === 'moderator-panel' ? (
          <ModeratorPanel />
        ) : (
          <Login onLogin={handleLogin} />
        )}
      </div>
      
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 12 }}>
        <AddUser />
        <button onClick={() => setView('forgot')} style={{ padding: '8px 12px', borderRadius: 6, border: 'none', background: view === 'forgot' ? '#2196F3' : '#eee', color: view === 'forgot' ? '#fff' : '#333' }}>Quên mật khẩu</button>
        <button onClick={() => setView('upload')} style={{ padding: '8px 12px', borderRadius: 6, border: 'none', background: view === 'upload' ? '#2196F3' : '#eee', color: view === 'upload' ? '#fff' : '#333' }}>Upload Avatar</button>
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
  );
}

export default App;
