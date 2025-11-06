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
  const { user, isAuthenticated, isAdmin, verifyAuth } = useAuth();

  useEffect(() => {
    const checkAuth = async () => {
      // Check if user is logged in
      if (!user) {
        // Try to verify token from localStorage
        const isValid = await verifyAuth();
        
        if (!isValid) {
          toast.error('You need to login to access this page');
          router.push('/login');
          return;
        }
      }

      // Check admin permissions
      if (user && !isAdmin()) {
        toast.error('You do not have permission to access admin panel');
        router.push('/');
        return;
      }
    };

    checkAuth();
  }, [user, router, isAdmin, verifyAuth]);

  // Show loading if verification is not complete
  if (!user || !isAuthenticated() || !isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004987]"></div>
          <p className="text-gray-600">Verifying access permissions...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}