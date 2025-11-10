'use client';

import { useAuth } from '@/hooks/useAuth';

/**
 * AuthProvider component
 * Khởi tạo useAuth hook và setup callbacks cho API services
 * Component này không render gì cả, chỉ setup logic
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Chỉ cần gọi useAuth để setup callbacks
  useAuth();
  
  return <>{children}</>;
}