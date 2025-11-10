// services/tokenRefresh.ts
import { API_BASE_URL } from '@/config/enpoints';

class TokenRefreshService {
  private refreshTimer: NodeJS.Timeout | null = null;
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;

  // Bắt đầu theo dõi và tự động refresh token
  startAutoRefresh() {
    this.scheduleNextCheck();
  }

  // Dừng auto refresh
  stopAutoRefresh() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  // Lên lịch kiểm tra token tiếp theo
  private scheduleNextCheck() {
    // Kiểm tra token status mỗi 10 giây cho access token 1 phút
    this.refreshTimer = setTimeout(async () => {
      try {
        await this.checkAndRefreshToken();
      } catch (error) {
        console.error('Error checking token:', error);
      }
      // Lên lịch kiểm tra tiếp theo
      this.scheduleNextCheck();
    }, 10 * 1000); // 10 giây
  }

  // Kiểm tra và refresh token nếu cần
  private async checkAndRefreshToken(): Promise<boolean> {
    try {
      // Nếu đang refresh thì đợi
      if (this.isRefreshing && this.refreshPromise) {
        return await this.refreshPromise;
      }

      const response = await fetch(`${API_BASE_URL}/auth/token-status`, {
        method: 'GET',
        credentials: 'include', // Để gửi cookies
      });

      if (!response.ok) {
        throw new Error('Failed to check token status');
      }

      const tokenStatus = await response.json();

      // Nếu không có token hoặc không hợp lệ
      if (!tokenStatus.hasToken || !tokenStatus.isValid) {
        this.handleTokenExpired();
        return false;
      }

      // Nếu cần refresh token (còn ít hơn 5 phút)
      if (tokenStatus.shouldRefresh) {
        console.log(`Token will expire in ${Math.floor(tokenStatus.timeUntilExpiry / 60)} minutes, refreshing...`);
        return await this.refreshToken();
      }

      return true;
    } catch (error) {
      console.error('Error checking token status:', error);
      return false;
    }
  }

  // Refresh token
  private async refreshToken(): Promise<boolean> {
    // Tránh multiple refresh cùng lúc
    if (this.isRefreshing && this.refreshPromise) {
      return await this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.doRefreshToken();

    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private async doRefreshToken(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include', // Để gửi cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Refresh token failed');
      }

      const result = await response.json();

      if (result.success) {
        console.log('Token refreshed successfully');
        return true;
      } else {
        throw new Error(result.message || 'Token refresh failed');
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      this.handleTokenExpired();
      return false;
    }
  }

  // Xử lý khi token hết hạn
  private handleTokenExpired() {
    console.log('Token expired, redirecting to login...');
    
    // Dừng auto refresh
    this.stopAutoRefresh();
    
    // Xóa cookies (nếu cần)
    this.clearTokens();
    
    // Redirect về login page
    if (typeof window !== 'undefined') {
      // Kiểm tra nếu không phải đang ở login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
  }

  private async clearTokens() {
    try {
      await fetch(`${API_BASE_URL}/auth/clear-cookie`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }

  // Method để manual refresh (sử dụng khi cần thiết)
  async manualRefresh(): Promise<boolean> {
    return await this.refreshToken();
  }

  // Kiểm tra xem có đang refresh không
  get isCurrentlyRefreshing(): boolean {
    return this.isRefreshing;
  }
}

// Export singleton instance
export const tokenRefreshService = new TokenRefreshService();
export default tokenRefreshService;