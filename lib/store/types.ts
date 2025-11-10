// Types for User (không bao gồm access_token - token lưu trong cookie)
export interface User {
  id: number;
  avatar_url: string;
  email: string;
  is_verified: boolean;
  role: string;
  username: string;
}

// Auth state interface
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

// Root state type
export interface RootState {
  auth: AuthState;
}