import React from "react";
import AddUser from "./AddUser";
import UserList from "./UserList";
import "./App.css";

function App() {
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
