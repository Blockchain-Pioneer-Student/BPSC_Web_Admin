// services/tokenRefresh.ts - SIMPLE MANUAL REFRESH ONLY
import { API_BASE_URL } from '@/config/enpoints';
import { store } from '@/lib/store';
import { logout } from '@/lib/store/authSlice';

class TokenRefreshService {
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;

  /**
   * 🔄 MANUAL REFRESH - Called by interceptor when 401 error occurs
   */
  async manualRefresh(): Promise<boolean> {
    try {
      console.log('🔄 Manual token refresh requested...');
      
      // Tránh multiple refresh cùng lúc
      if (this.isRefreshing && this.refreshPromise) {
        console.log('⏳ Already refreshing, waiting...');
        return await this.refreshPromise;
      }

      this.isRefreshing = true;
      this.refreshPromise = this.doRefreshToken();

      try {
        const result = await this.refreshPromise;
        console.log(result ? '✅ Manual refresh successful' : '❌ Manual refresh failed');
        return result;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    } catch (error) {
      console.error('❌ Manual refresh error:', error);
      return false;
    }
  }

  /**
   * 🚀 Execute refresh token request
   */
  private async doRefreshToken(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/core/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.success) {
          console.log('✅ Token refreshed successfully');
          return true;
        } else {
          console.log('❌ Refresh failed - invalid response');
          this.handleRefreshFailure('Invalid refresh response');
          return false;
        }
      } else {
        console.log(`❌ Refresh failed - HTTP ${response.status}`);
        if (response.status === 401) {
          this.handleRefreshFailure('Refresh token expired');
        } else {
          this.handleRefreshFailure(`HTTP ${response.status}`);
        }
        return false;
      }
    } catch (error) {
      console.error('❌ Network error during refresh:', error);
      this.handleRefreshFailure('Network error');
      return false;
    }
  }

  /**
   * 🔐 Handle refresh failure - logout user
   */
  private handleRefreshFailure(reason: string) {
    console.log(`🔐 Refresh failed: ${reason}, logging out...`);
    
    // 1️⃣ CLEAR REDUX STATE
    store.dispatch(logout());
    
    // 2️⃣ CLEAR COOKIES
    this.clearTokens();
    
    // 3️⃣ REDIRECT TO LOGIN (only if not already there)
    if (typeof window !== 'undefined') {
      if (!window.location.pathname.includes('/login')) {
        console.log('🔄 Redirecting to login page...');
        setTimeout(() => {
          window.location.href = '/login';
        }, 500);
      }
    }
  }

  /**
   * 🧹 Clear cookies on server
   */
  private async clearTokens() {
    try {
      await fetch(`${API_BASE_URL}/core/auth/clear-cookie`, {
        method: 'POST',
        credentials: 'include',
      });
      console.log('🧹 Cookies cleared');
    } catch (error) {
      console.error('❌ Error clearing tokens:', error);
    }
  }

  /**
   * 🔍 Check if currently refreshing
   */
  get isCurrentlyRefreshing(): boolean {
    return this.isRefreshing;
  }

  /**
   * 🛑 Reset refresh state (for cleanup)
   */
  reset() {
    this.isRefreshing = false;
    this.refreshPromise = null;
    console.log('🛑 Token refresh service reset');
  }
}

// Export singleton instance
export const tokenRefreshService = new TokenRefreshService();
export default tokenRefreshService;