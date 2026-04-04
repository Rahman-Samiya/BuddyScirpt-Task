"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../services/authService';
import type { User, LoginCredentials, RegisterCredentials } from '../types/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  handleTokenExpired: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      // Check if user is already logged in
      const storedToken = authService.getToken();
      const storedUser = authService.getUser();

      if (storedToken && storedUser) {
        // Verify token is still valid
        const isValid = await authService.verifyToken();
        if (isValid) {
          setToken(storedToken);
          setUser(storedUser);
        } else {
          // Token expired, clear it
          authService.removeToken();
          authService.removeUser();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // Handle token expiration
  const handleTokenExpired = () => {
    setToken(null);
    setUser(null);
    authService.removeToken();
    authService.removeUser();
    router.replace('/login');
  };

  // Setup global error handler for 401 responses
  useEffect(() => {
    const handleUnauthorized = () => {
      handleTokenExpired();
    };

    window.addEventListener('auth:unauthorized' as any, handleUnauthorized);

    return () => {
      window.removeEventListener('auth:unauthorized' as any, handleUnauthorized);
    };
  }, [router]);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authService.login(credentials);
      setToken(response.token);
      setUser(response.user);
      authService.setToken(response.token);
      authService.setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      const response = await authService.register(credentials);
      setToken(response.token);
      setUser(response.user);
      authService.setToken(response.token);
      authService.setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await authService.logout(token);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setToken(null);
      setUser(null);
      authService.removeToken();
      authService.removeUser();
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    isLoading,
    login,
    register,
    logout,
    handleTokenExpired,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
