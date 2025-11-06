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
      
      // Save access_token to localStorage
      localStorage.setItem('access_token', userData.access_token);
      
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
  const logoutUser = useCallback(() => {
    dispatch(logout());
    authService.logout();
    toast.success('Đã đăng xuất thành công');
    router.push('/admin/login');
  }, [dispatch, router]);

  // Check if user is authenticated
  const isAuthenticated = useCallback(() => {
    return !!user && !!user.access_token;
  }, [user]);

  // Check if user is admin
  const isAdmin = useCallback(() => {
    return user?.role === 'admin';
  }, [user]);

  // Verify token on app initialization
  const verifyAuth = useCallback(async () => {
    const token = authService.getStoredToken();
    
    if (!token) {
      dispatch(logout());
      return false;
    }

    try {
      const userData = await authService.verifyToken(token);
      dispatch(login(userData));
      return true;
    } catch (error) {
      console.error('Token verification failed:', error);
      dispatch(logout());
      return false;
    }
  }, [dispatch]);

  return {
    // State
    user,
    isLoading,
    error,
    
    // Actions
    loginUser,
    logoutUser,
    verifyAuth,
    
    // Checks
    isAuthenticated,
    isAdmin,
  };
};