import { store } from '@/lib/store';
import { logout } from '@/lib/store/authSlice';
import { API_BASE_URL } from '@/config/enpoints';
import { tokenRefreshService } from './tokenRefresh';

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

  private async handleResponse<T>(response: Response, url?: string): Promise<T> {
    // Check for new access token in response headers
    const newAccessToken = response.headers.get('X-New-Access-Token');
    if (newAccessToken) {
      // Token refresh sẽ được handle bởi server via Set-Cookie header
      // Client không cần làm gì cả, cookie sẽ được update tự động
      console.log('🔄 Access token refreshed automatically via HTTP-only cookie');
    }

    if (!response.ok) {
      // Read response text once
      const errorText = await response.text();
      
      // Handle unauthorized errors
      if (response.status === 401) {
        console.log('🔐 Unauthorized request - token expired or invalid');
        
        // Check if we're trying to refresh token
        const isRefreshEndpoint = url ? (url.includes('/auth/refresh') || url.includes('/auth/token-status')) : false;
        
        if (isRefreshEndpoint || errorText.includes('Phiên đăng nhập đã hết hạn')) {
          // Only clear state for refresh endpoints or explicit session expiry
          console.log('🔐 Session expired, clearing user state...');
          store.dispatch(logout());
          
          // Redirect to login page if in browser
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        
        // For other 401 errors, just throw the error and let the component handle it
      }
      
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    // Check if response has content
    const contentLength = response.headers.get('content-length');
    const contentType = response.headers.get('content-type');
    
    // If no content or content-length is 0, return undefined for void responses
    if (contentLength === '0' || !contentType || !contentType.includes('application/json')) {
      return undefined as T;
    }

    // Try to get response text first to check if it's empty
    const responseText = await response.text();
    
    // If response is empty, return undefined
    if (!responseText) {
      return undefined as T;
    }

    // Parse JSON if we have content
    try {
      return JSON.parse(responseText);
    } catch (error) {
      console.warn('Failed to parse JSON response:', responseText);
      return undefined as T;
    }
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

      // Nếu response OK thì trả về kết quả
      if (response.ok) {
        return await this.handleResponse<T>(response, url);
      }

      // Nếu là 401 và requiresAuth = true, thử refresh token
      if (response.status === 401 && requiresAuth && !endpoint.includes('/auth/')) {
        console.log('🔄 Got 401, attempting token refresh...');
        
        // Thử refresh token
        const refreshSuccess = await tokenRefreshService.manualRefresh();
        
        if (refreshSuccess) {
          console.log('✅ Token refreshed, retrying original request...');
          
          // Retry original request với token mới
          const retryResponse = await fetch(url, {
            method,
            headers: requestHeaders,
            body: requestBody,
            credentials: 'include',
          });
          
          return await this.handleResponse<T>(retryResponse, url);
        } else {
          // Refresh thất bại, handle như bình thường
          return await this.handleResponse<T>(response, url);
        }
      } else {
        // Không phải lỗi auth hoặc không cần auth
        return await this.handleResponse<T>(response, url);
      }
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