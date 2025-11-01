import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../axiosConfig';

// Async thunks để gọi API
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password
      });
      
      const { accessToken, refreshToken } = response.data;
      
      // Lưu tokens vào localStorage
      localStorage.setItem('auth_token', accessToken);
      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken);
      }
      
      // Decode JWT để lấy user info
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      
      const userData = {
        token: accessToken,
        refreshToken,
        user: {
          id: payload.id,
          email: payload.email,
          role: payload.role?.toLowerCase() || 'user'
        }
      };
      
      // Log Redux state to console
      console.log('🔐 Redux Auth State - Login Success:', {
        user: userData.user,
        token: accessToken,
        tokenPreview: `${accessToken.substring(0, 30)}...`,
        expiresAt: new Date(payload.exp * 1000).toLocaleString('vi-VN')
      });
      
      return userData;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Đăng nhập thất bại'
      );
    }
  }
);

export const signupUser = createAsyncThunk(
  'auth/signup',
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/signup', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Đăng ký thất bại'
      );
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/profile');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Lỗi tải profile'
      );
    }
  }
);

// Khởi tạo state từ localStorage nếu có
const getInitialState = () => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const initialState = {
        isAuthenticated: true,
        user: {
          id: payload.id,
          email: payload.email,
          role: payload.role?.toLowerCase() || 'user'
        },
        token: token,
        refreshToken: localStorage.getItem('refresh_token'),
        loading: false,
        error: null
      };
      
      // Log Redux initial state từ localStorage
      console.log('🔄 Redux Auth State - Khởi tạo từ localStorage:', {
        user: initialState.user,
        tokenPreview: `${token.substring(0, 30)}...`,
        expiresAt: new Date(payload.exp * 1000).toLocaleString('vi-VN'),
        isAuthenticated: true
      });
      
      return initialState;
    } catch (e) {
      console.warn('⚠️ Token không hợp lệ, đã xóa khỏi localStorage');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
    }
  }
  
  console.log('🚫 Redux Auth State - Chưa đăng nhập');
  return {
    isAuthenticated: false,
    user: null,
    token: null,
    refreshToken: null,
    loading: false,
    error: null
  };
};

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    logout: (state) => {
      console.log('🚪 Redux Auth State - Đăng xuất');
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.error = null;
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
    },
    clearError: (state) => {
      state.error = null;
    },
    updateToken: (state, action) => {
      state.token = action.payload.accessToken;
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      }
      localStorage.setItem('auth_token', action.payload.accessToken);
      if (action.payload.refreshToken) {
        localStorage.setItem('refresh_token', action.payload.refreshToken);
      }
      
      // Log token refresh
      console.log('🔄 Redux Auth State - Token đã refresh:', {
        tokenPreview: `${action.payload.accessToken.substring(0, 30)}...`
      });
    }
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(loginUser.pending, (state) => {
      console.log('⏳ Redux Auth State - Đang đăng nhập...');
      state.loading = true;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      console.log('✅ Redux Auth State - Đăng nhập thành công!', {
        user: action.payload.user,
        isAuthenticated: true
      });
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.error = null;
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      console.error('❌ Redux Auth State - Đăng nhập thất bại:', action.payload);
      state.loading = false;
      state.error = action.payload;
    });
    
    // Signup
    builder.addCase(signupUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(signupUser.fulfilled, (state) => {
      state.loading = false;
      state.error = null;
    });
    builder.addCase(signupUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
    
    // Fetch Profile
    builder.addCase(fetchUserProfile.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchUserProfile.fulfilled, (state, action) => {
      state.loading = false;
      state.user = {
        ...state.user,
        ...action.payload,
        role: action.payload.role?.toLowerCase() || 'user'
      };
    });
    builder.addCase(fetchUserProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  }
});

export const { logout, clearError, updateToken } = authSlice.actions;
export default authSlice.reducer;
