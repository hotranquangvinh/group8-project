import axios from 'axios';

// Base URL cho API
const API_BASE_URL = 'http://localhost:3000/api';

// Tạo axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// Biến để theo dõi việc refresh token đang diễn ra (tránh gọi nhiều lần)
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Request interceptor - Thêm access token vào mỗi request
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('auth_token');
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Tự động refresh token khi access token hết hạn
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi 401 và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Nếu đang refresh, đợi trong queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return axiosInstance(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');
      
      if (!refreshToken) {
        // Không có refresh token, redirect về login
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/';
        return Promise.reject(error);
      }

      try {
        // Gọi API refresh token
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken: refreshToken
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // Lưu token mới
        localStorage.setItem('auth_token', accessToken);
        if (newRefreshToken) {
          localStorage.setItem('refresh_token', newRefreshToken);
        }

        // Cập nhật header cho request gốc
        originalRequest.headers['Authorization'] = 'Bearer ' + accessToken;
        
        // Xử lý queue
        processQueue(null, accessToken);
        
        isRefreshing = false;

        // Retry request gốc với token mới
        return axiosInstance(originalRequest);
      } catch (err) {
        // Refresh token thất bại, logout user
        processQueue(err, null);
        isRefreshing = false;
        
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        
        // Redirect về trang login
        window.location.href = '/';
        
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
