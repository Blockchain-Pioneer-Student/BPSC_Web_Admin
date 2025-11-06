import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, AuthState } from './types';

// Get user from localStorage if available
const getUserFromStorage = (): User | null => {
  if (typeof window !== 'undefined') {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  }
  return null;
};

// Initial state
const initialState: AuthState = {
  user: getUserFromStorage(),
  isLoading: false,
  error: null,
};

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    login: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isLoading = false;
      state.error = null;
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(action.payload));
      }
    },
    loginError: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isLoading = false;
      state.error = null;
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { loginStart, login, loginError, logout, clearError } = authSlice.actions;
export default authSlice.reducer;