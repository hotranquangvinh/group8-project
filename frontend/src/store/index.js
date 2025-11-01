import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';

// Custom middleware để log Redux state changes
const loggerMiddleware = (store) => (next) => (action) => {
  console.group(`🔵 Redux Action: ${action.type}`);
  console.log('📤 Dispatching:', action);
  console.log('📊 State trước:', store.getState());
  
  const result = next(action);
  
  console.log('📊 State sau:', store.getState());
  console.log('🔐 Token hiện tại:', {
    token: store.getState().auth.token ? 
      `${store.getState().auth.token.substring(0, 30)}...` : 
      'Không có',
    isAuthenticated: store.getState().auth.isAuthenticated,
    user: store.getState().auth.user
  });
  console.groupEnd();
  
  return result;
};

export const store = configureStore({
  reducer: {
    auth: authReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['auth/updateToken'],
      },
    }).concat(loggerMiddleware), // Thêm logger middleware
});

// Log initial state khi khởi tạo store
console.log('🏪 Redux Store đã khởi tạo:', {
  initialState: store.getState(),
  token: store.getState().auth.token ? 
    `${store.getState().auth.token.substring(0, 30)}...` : 
    'Không có'
});

export default store;
