import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/redux';
import { loginStart, login, loginError, logout } from '@/lib/store/authSlice';
import { authService, LoginCredentials } from '@/lib/services/authService';
import { toast } from 'sonner';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, isLoading, error } = useAppSelector((state) => state.auth);

  // Login function
  const loginUser = useCallback(async (credentials: LoginCredentials) => {
    try {
      dispatch(loginStart());
      
      const userData = await authService.login(credentials);
      
      // Save to Redux store
      dispatch(login(userData));
      
      toast.success('Đăng nhập thành công');
      
      return userData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Đăng nhập thất bại';
      dispatch(loginError(errorMessage));
      toast.error(errorMessage);
      throw error;
    }
  }, [dispatch]);

  // Logout function
  const logoutUser = useCallback(async () => {
    try {
      dispatch(logout());
      await authService.logout();
      toast.success('Đã đăng xuất thành công');
      router.push('/admin/login');
    } catch (error) {
      // Still logout even if server call fails
      toast.success('Đã đăng xuất thành công');
      router.push('/admin/login');
    }
  }, [dispatch, router]);

  // Check if user is authenticated
  const isAuthenticated = useCallback(() => {
    return !!user && (user.role === 'admin' || user.role === 'root');
  }, [user]);

  // Check if user is admin
  const isAdmin = useCallback(() => {
    return user?.role === 'admin';
  }, [user]);

  return {
    // State
    user,
    isLoading,
    error,
    
    // Actions
    loginUser,
    logoutUser,
    
    // Checks
    isAuthenticated,
    isAdmin,
  };
};