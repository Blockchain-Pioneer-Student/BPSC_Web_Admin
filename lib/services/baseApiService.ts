import { store } from '@/lib/store';
import { logout } from '@/lib/store/authSlice';
import { API_BASE_URL } from '@/config/enpoints';

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  requiresAuth?: boolean;
}

export class BaseApiService {
  private readonly baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private getAuthHeaders(): Record<string, string> {
    // Không cần Authorization header - token sẽ được gửi tự động qua HTTP-only cookie
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    return headers;
  }

  private getAuthHeadersForFormData(): Record<string, string> {
    // Không cần Authorization header - token sẽ được gửi tự động qua HTTP-only cookie
    const headers: Record<string, string> = {};
    
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    // Check for new access token in response headers
    const newAccessToken = response.headers.get('X-New-Access-Token');
    if (newAccessToken) {
      // Token refresh sẽ được handle bởi server via Set-Cookie header
      // Client không cần làm gì cả, cookie sẽ được update tự động
      console.log('🔄 Access token refreshed automatically via HTTP-only cookie');
    }

    if (!response.ok) {
      // Handle unauthorized errors
      if (response.status === 401) {
        const errorText = await response.text();
        if (errorText.includes('Phiên đăng nhập đã hết hạn') || 
            errorText.includes('Invalid or expired token')) {
          console.log('🔐 Session expired, logging out...');
          
          // Clear Redux store (user info)
          store.dispatch(logout());
          
          // HTTP-only cookie sẽ được clear bởi server hoặc expire tự nhiên
          
          // Redirect to login page if in browser
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
      }
      
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    return await response.json();
  }

  public async makeRequest<T>(
    endpoint: string, 
    options: ApiRequestOptions = {}
  ): Promise<T> {
    const {
      method = 'GET',
      headers = {},
      body,
      requiresAuth = true
    } = options;

    const url = `${this.baseURL}${endpoint}`;
    
    let requestHeaders = { ...headers };
    
    // Add auth headers if required
    if (requiresAuth) {
      if (body instanceof FormData) {
        requestHeaders = { ...requestHeaders, ...this.getAuthHeadersForFormData() };
      } else {
        requestHeaders = { ...requestHeaders, ...this.getAuthHeaders() };
      }
    } else if (!(body instanceof FormData)) {
      requestHeaders = { 
        ...requestHeaders, 
        'Content-Type': 'application/json' 
      };
    }

    const requestBody = body instanceof FormData ? body : 
                       body ? JSON.stringify(body) : undefined;

    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: requestBody,
        credentials: 'include', // Important: Include HTTP-only cookies
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      console.error(`API request failed for ${method} ${endpoint}:`, error);
      throw error;
    }
  }

  // Convenience methods
  protected async get<T>(endpoint: string, requiresAuth = true): Promise<T> {
    return this.makeRequest<T>(endpoint, { method: 'GET', requiresAuth });
  }

  protected async post<T>(endpoint: string, body?: any, requiresAuth = true): Promise<T> {
    return this.makeRequest<T>(endpoint, { method: 'POST', body, requiresAuth });
  }

  protected async patch<T>(endpoint: string, body?: any, requiresAuth = true): Promise<T> {
    return this.makeRequest<T>(endpoint, { method: 'PATCH', body, requiresAuth });
  }

  protected async put<T>(endpoint: string, body?: any, requiresAuth = true): Promise<T> {
    return this.makeRequest<T>(endpoint, { method: 'PUT', body, requiresAuth });
  }

  protected async delete<T>(endpoint: string, requiresAuth = true): Promise<T> {
    return this.makeRequest<T>(endpoint, { method: 'DELETE', requiresAuth });
  }
}