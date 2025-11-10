"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

export function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const router = useRouter();
  const { user, isAuthenticated, isAdmin } = useAuth();

  useEffect(() => {
    // Check if user is not logged in
    if (!user || !isAuthenticated()) {
      toast.error('Bạn cần đăng nhập để truy cập trang này');
      router.push('/login');
      return;
    }

    // Check admin permissions
    if (!isAdmin()) {
      toast.error('Bạn không có quyền truy cập trang admin');
      router.push('/');
      return;
    }
  }, [user, router, isAuthenticated, isAdmin]);

  // Show loading if not authenticated or not admin
  if (!user || !isAuthenticated() || !isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004987]"></div>
          <p className="text-gray-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}