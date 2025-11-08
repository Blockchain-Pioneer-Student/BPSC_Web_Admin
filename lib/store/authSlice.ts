import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, AuthState } from './types';

// Initial state
const initialState: AuthState = {
  user: null,
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
    },
    loginError: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isLoading = false;
      state.error = null;
    },
    updateTokens: (state, action: PayloadAction<{ access_token: string }>) => {
      if (state.user) {
        state.user.access_token = action.payload.access_token;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { loginStart, login, loginError, logout, updateTokens, clearError } = authSlice.actions;
export default authSlice.reducer;