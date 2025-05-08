'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, AuthResponse, LoginCredentials, RegisterCredentials } from '@/types/auth';
import { authApi } from '@/utils/api';
import { setToken, setUser, getUser, clearAuth, syncAuthState } from '@/utils/auth';
import { toast } from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state from storage
  useEffect(() => {
    const validateAuth = async () => {
      try {
        syncAuthState();
        const storedUser = getUser();
        const token = localStorage.getItem('token');

        if (storedUser && token) {
          // Check server availability first
          try {
            const healthCheck = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`, {
              method: 'GET',
              headers: { 'Content-Type': 'application/json' }
            });

            if (!healthCheck.ok) {
              console.warn('Server health check failed');
              // Don't clear auth yet, server might be temporarily down
              setIsLoading(false);
              return;
            }
          } catch (error) {
            console.warn('Server unreachable:', error);
            // Don't clear auth yet, server might be temporarily down
            setIsLoading(false);
            return;
          }

          // Validate token with backend with retries
          let attempts = 3;
          while (attempts > 0) {
            try {
              const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              });

              if (!response.ok) {
                if (response.status === 401) {
                  console.log('Invalid token, clearing auth state');
                  clearAuth();
                  break;
                }
                throw new Error('Profile validation failed');
              }

              setCurrentUser(storedUser);
              break;
            } catch (error) {
              attempts--;
              if (attempts === 0) {
                console.error('Auth validation failed after retries');
                clearAuth();
              } else {
                await new Promise(resolve => setTimeout(resolve, 1000));
                console.log('Retrying auth validation...');
              }
            }
          }
        }
      } catch (error) {
        console.error('Auth validation error:', error);
        clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    validateAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const response = await authApi.login(credentials);
      setToken(response.access_token);
      setUser(response.user);
      setCurrentUser(response.user);
      toast.success('Successfully logged in');
      router.replace('/dashboard');
    } catch (error: any) {
      console.error('Login error details:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    try {
      setIsLoading(true);
      const response = await authApi.register(credentials);
      setToken(response.access_token);
      setUser(response.user);
      setCurrentUser(response.user);
      toast.success('Account created successfully');
      router.replace('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const logout = useCallback(() => {
    clearAuth();
    setCurrentUser(null);
    toast.success('Logged out successfully');
    router.replace('/auth/login');
  }, [router]);

  const contextValue = {
    user,
    isLoading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}