import React, { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

// Tạo Context
export const UserContext = createContext();

// API URL
const API_URL = "http://localhost:3000/api/users";

// Provider Component
export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch users từ backend
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(API_URL);
      setUsers(response.data);
    } catch (err) {
      setError("Không thể tải danh sách users. Vui lòng thử lại!");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load users khi component mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Thêm user mới
  const addUser = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(API_URL, userData);
      setUsers([...users, response.data]);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Không thể thêm user!";
      setError(errorMsg);
      console.error("Error adding user:", err);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật user
  const updateUser = async (id, userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(`${API_URL}/${id}`, userData);
      setUsers(users.map((user) => (user._id === id ? response.data : user)));
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Không thể cập nhật user!";
      setError(errorMsg);
      console.error("Error updating user:", err);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Xóa user
  const deleteUser = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`${API_URL}/${id}`);
      setUsers(users.filter((user) => user._id !== id));
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Không thể xóa user!";
      setError(errorMsg);
      console.error("Error deleting user:", err);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    users,
    loading,
    error,
    fetchUsers,
    addUser,
    updateUser,
    deleteUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
