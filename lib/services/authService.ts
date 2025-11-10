import { API_BASE_URL } from '@/config/enpoints';
import { BaseApiService } from './baseApiService';

export interface LoginCredentials {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: {
    id: number;
    username: string;
    email: string;
    role: string;
    is_verified: boolean;
  };
}

export interface AuthUser {
  id: number;
  avatar_url: string;
  email: string;
  is_verified: boolean;
  role: string;
  username: string;
}

class AuthService extends BaseApiService {
  constructor() {
    super();
  }

  async login(credentials: LoginCredentials): Promise<AuthUser> {
    try {
      // Use makeRequest with credentials include để server có thể set HTTP-only cookie
      const response = await this.makeRequest<{ user: AuthUser; expires_in: number }>('/auth/login', {
        method: 'POST',
        body: credentials,
        requiresAuth: false,
        headers: {
          'User-Agent': navigator.userAgent || 'BPSClub-Web-Client/1.0',
        }
      });

      if (!response.user) {
        throw new Error('Đăng nhập thất bại');
      }

      // Kiểm tra quyền admin hoặc root
      if (response.user.role !== 'admin' && response.user.role !== 'root') {
        throw new Error('Bạn không có quyền truy cập trang admin');
      }

      // Trả về user info (tokens đã được set vào HTTP-only cookies tự động bởi backend)
      return response.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async verifyToken(token: string): Promise<AuthUser> {
    try {
      // Manually set Authorization header since this is for token verification
      const response = await this.makeRequest<any>('/auth/verify', {
        method: 'GET',
        requiresAuth: false, // Don't use automatic auth headers
        headers: {
          'Authorization': `Bearer ${token}`,
          'User-Agent': navigator.userAgent || 'BPSClub-Web-Client/1.0',
        }
      });
      
      if (!response.user) {
        throw new Error('Token không hợp lệ');
      }

      return {
        ...response.user,
        access_token: token,
        avatar_url: '', // Default value
      };
    } catch (error) {
      console.error('Token verification error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      // Clear HTTP-only cookies on the server
      await this.makeRequest('/auth/clear-cookie', {
        method: 'POST',
        requiresAuth: false,
      });
      console.log('🔐 Logout: Server cookies cleared successfully');
    } catch (error) {
      // Even if server call fails, we should still clear local state
      console.warn('Failed to clear server cookies:', error);
    }
  }
}

export const authService = new AuthService();
export default authService;