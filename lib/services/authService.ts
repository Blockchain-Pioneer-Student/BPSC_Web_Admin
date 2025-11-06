import { API_BASE_URL } from '@/config/enpoints';

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
  access_token: string;
  avatar_url: string;
  email: string;
  is_verified: boolean;
  role: string;
  username: string;
}

class AuthService {
  private readonly baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async login(credentials: LoginCredentials): Promise<AuthUser> {
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': navigator.userAgent || 'BPSClub-Web-Client/1.0',
        },
        body: JSON.stringify(credentials),
      });

      const data: LoginResponse = await response.json();

      if (!response.ok) {
        throw new Error('Đăng nhập thất bại');
      }

      if (!data.user) {
        throw new Error('Đăng nhập thất bại');
      }

      // Kiểm tra quyền admin hoặc root
      if (data.user.role !== 'admin' && data.user.role !== 'root') {
        throw new Error('Bạn không có quyền truy cập trang admin');
      }

      // Trả về user với access_token
      return {
        ...data.user,
        access_token: data.access_token,
        avatar_url: '', // Backend không trả về avatar_url, set default
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async verifyToken(token: string): Promise<AuthUser> {
    try {
      const response = await fetch(`${this.baseURL}/auth/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'User-Agent': navigator.userAgent || 'BPSClub-Web-Client/1.0',
        },
      });

      if (!response.ok) {
        throw new Error('Token không hợp lệ');
      }

      const data = await response.json();
      
      if (!data.user) {
        throw new Error('Token không hợp lệ');
      }

      return {
        ...data.user,
        access_token: token,
        avatar_url: '', // Default value
      };
    } catch (error) {
      console.error('Token verification error:', error);
      throw error;
    }
  }

  logout(): void {
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('access_token');
    }
  }

  getStoredToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  }
}

export const authService = new AuthService();
export default authService;