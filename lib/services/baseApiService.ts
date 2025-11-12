import { store } from '@/lib/store';
import { logout } from '@/lib/store/authSlice';
import { API_BASE_URL } from '@/config/enpoints';
import { tokenRefreshService } from './tokenRefresh';
import { notificationService } from './notificationService';

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
      console.log('🔄 Access token refreshed automatically via HTTP-only cookie');
    }

    if (!response.ok) {
      // Read response text once
      const errorText = await response.text();
      
      // Handle unauthorized errors
      if (response.status === 401) {
        console.log('🔐 Got 401 Unauthorized');
        
        // Always throw for 401 to be handled by interceptor logic
        const error = new Error(errorText || 'Unauthorized');
        (error as any).status = 401;
        (error as any).url = url;
        throw error;
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

    // 🔄 INTERCEPTOR: AUTO RETRY LOGIC WITH REFRESH TOKEN
    return await this.executeRequestWithRetry({
      url,
      method,
      headers: requestHeaders,
      body: requestBody,
      endpoint,
      requiresAuth,
      retryCount: 0,
      maxRetries: 1 // Chỉ retry 1 lần
    });
  }

  /**
   * 🚀 INTERCEPTOR: Execute request with automatic 401 retry logic
   */
  private async executeRequestWithRetry<T>(params: {
    url: string;
    method: string;
    headers: Record<string, string>;
    body?: BodyInit;
    endpoint: string;
    requiresAuth: boolean;
    retryCount: number;
    maxRetries: number;
  }): Promise<T> {
    try {
      console.log(`🚀 Making request: ${params.method} ${params.endpoint} (attempt ${params.retryCount + 1})`);

      const response = await fetch(params.url, {
        method: params.method,
        headers: params.headers,
        body: params.body,
        credentials: 'include', // Important: Include HTTP-only cookies
      });

      return await this.handleResponse<T>(response, params.url);

    } catch (error: any) {
      // 🔍 CHECK IF IT'S A 401 ERROR
      if (error.status === 401 && params.requiresAuth) {
        console.log(`⚠️ Got 401 Unauthorized on ${params.endpoint}`);

        // 🚫 DON'T RETRY AUTH ENDPOINTS
        const isAuthEndpoint = params.endpoint.includes('/auth/');
        if (isAuthEndpoint) {
          console.log('� Auth endpoint failed, not retrying');
          this.handleAuthenticationFailure(error.message || 'Authentication failed');
          throw error;
        }

        // 🔄 RETRY LOGIC
        if (params.retryCount < params.maxRetries) {
          console.log(`🔄 Attempting to refresh token... (retry ${params.retryCount + 1}/${params.maxRetries + 1})`);

          try {
            // 1️⃣ ATTEMPT TOKEN REFRESH
            const refreshSuccess = await tokenRefreshService.manualRefresh();

            if (refreshSuccess) {
              console.log('✅ Token refreshed successfully, retrying original request...');
              
              // Show success notification
              notificationService.info('Token làm mới thành công', 'Đang thử lại yêu cầu...');

              // 2️⃣ RETRY ORIGINAL REQUEST
              return await this.executeRequestWithRetry<T>({
                ...params,
                retryCount: params.retryCount + 1
              });
            } else {
              // 3️⃣ REFRESH FAILED
              console.log('❌ Token refresh failed');
              this.handleAuthenticationFailure('Không thể làm mới token');
              throw error;
            }
          } catch (refreshError) {
            // 4️⃣ REFRESH ERROR
            console.log('❌ Error during token refresh:', refreshError);
            this.handleAuthenticationFailure('Lỗi khi làm mới phiên đăng nhập');
            throw error;
          }
        } else {
          // 5️⃣ MAX RETRIES EXCEEDED
          console.log('❌ Max retries exceeded for 401 error');
          this.handleAuthenticationFailure('Xác thực thất bại sau khi thử lại');
          throw error;
        }
      } else {
        // 6️⃣ NOT A 401 ERROR OR NOT AUTH REQUIRED
        throw error;
      }
    }
  }

  /**
   * 🔐 Handle authentication failure - logout and redirect
   */
  private handleAuthenticationFailure(message: string): void {
    console.log(`🔐 Authentication failure: ${message}`);
    
    // 1️⃣ CLEAR USER STATE
    store.dispatch(logout());
    
    // 2️⃣ RESET TOKEN REFRESH SERVICE
    tokenRefreshService.reset();
    
    // 3️⃣ SHOW TOAST NOTIFICATION
    notificationService.authFailure(message);
    
    // 4️⃣ REDIRECT TO LOGIN (with delay)
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }, 2000); // 2 second delay để user đọc toast
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