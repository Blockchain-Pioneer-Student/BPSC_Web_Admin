// lib/services/notificationService.ts
import { toast as sonnerToast } from 'sonner';

class NotificationService {
  private isClient(): boolean {
    return typeof window !== 'undefined';
  }

  success(message: string, description?: string): void {
    if (!this.isClient()) return;
    
    try {
      sonnerToast.success(message, {
        description,
        duration: 4000,
      });
    } catch (error) {
      console.log('✅', message, description);
    }
  }

  error(message: string, description?: string): void {
    if (!this.isClient()) return;
    
    try {
      sonnerToast.error(message, {
        description,
        duration: 6000,
      });
    } catch (error) {
      console.error('❌', message, description);
      // Fallback to alert if toast fails
      alert(`❌ ${message}\n\n${description || ''}`);
    }
  }

  warning(message: string, description?: string): void {
    if (!this.isClient()) return;
    
    try {
      sonnerToast.warning(message, {
        description,
        duration: 5000,
      });
    } catch (error) {
      console.warn('⚠️', message, description);
    }
  }

  info(message: string, description?: string): void {
    if (!this.isClient()) return;
    
    try {
      sonnerToast.info(message, {
        description,
        duration: 4000,
      });
    } catch (error) {
      console.info('ℹ️', message, description);
    }
  }

  // Special method for authentication failures
  authFailure(message: string): void {
    if (!this.isClient()) return;

    const title = '🔐 Phiên đăng nhập đã hết hạn';
    const description = `${message}\n\nBạn sẽ được chuyển đến trang đăng nhập trong giây lát...`;
    
    try {
      sonnerToast.error(title, {
        description,
        duration: 5000,
        style: {
          border: '1px solid #ef4444',
          backgroundColor: '#fee2e2',
        }
      });
    } catch (error) {
      // Fallback to alert
      alert(`${title}\n\n${description}`);
    }
  }
}

// Export singleton
export const notificationService = new NotificationService();
export default notificationService;