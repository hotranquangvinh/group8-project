import React, { useState, useEffect } from "react";
import AddUser from "./AddUser";
import UserList from "./UserList";
import SignUp from "./SignUp";
import Login from "./Login";
import Profile from "./Profile";
import "./App.css";

function App() {
  const [view, setView] = useState("login"); // 'login', 'signup', or 'profile'
  const [token, setToken] = useState(null);

  useEffect(() => {
    const t = localStorage.getItem("auth_token");
    if (t) setToken(t);
  }, []);

  const handleLogin = (newToken) => {
    localStorage.setItem("auth_token", newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    setToken(null);
    alert("✅ Đã đăng xuất (token đã được xóa phía client)");
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
      
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
        <button onClick={() => setView('login')} style={{ padding: '8px 14px', background: view === 'login' ? '#2196F3' : '#eee', color: view === 'login' ? '#fff' : '#333', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Đăng nhập</button>
        <button onClick={() => setView('signup')} style={{ padding: '8px 14px', background: view === 'signup' ? '#2196F3' : '#eee', color: view === 'signup' ? '#fff' : '#333', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Đăng ký</button>
        {token && (
          <button onClick={() => setView('profile')} style={{ padding: '8px 14px', background: view === 'profile' ? '#2196F3' : '#eee', color: view === 'profile' ? '#fff' : '#333', border: 'none', borderRadius: 6, cursor: 'pointer' }}>👤 Profile</button>
        )}
        {token ? (
          <div style={{ marginLeft: 20, display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#2e7d32' }}>● Đã đăng nhập</span>
            <button onClick={handleLogout} style={{ padding: '6px 10px', background: '#f44336', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Đăng xuất</button>
          </div>
        ) : null}
      </div>

      <div style={{ maxWidth: 820, margin: '0 auto 30px' }}>
        {view === 'signup' ? (
          <SignUp onSuccess={() => setView('login')} />
        ) : view === 'profile' ? (
          <Profile token={token} />
        ) : (
          <Login onLogin={handleLogin} />
        )}
      </div>
      
  <AddUser />
      
      <hr style={{ 
        margin: "30px 0", 
        border: "none", 
        borderTop: "2px dashed #ddd" 
      }} />
      
      <UserList />
      
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
