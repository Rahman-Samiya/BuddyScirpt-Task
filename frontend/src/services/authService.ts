import axios from 'axios';
import type { LoginCredentials, RegisterCredentials, AuthResponse, User } from '../types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses (token expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Dispatch custom event for token expiration
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

export type { LoginCredentials, RegisterCredentials, AuthResponse, User };

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    return response.json();
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/user/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    return response.json();
  },

  async logout(token: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/auth/user/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Logout failed');
    }
  },

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('auth_token');
    if (!token || token === 'undefined') return null;
    return token;
  },

  setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('auth_token', token);
  },

  removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('auth_token');
  },

  getUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('auth_user');
    if (!userStr) return null; // nothing stored yet

    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Failed to parse auth_user from localStorage:', error);
      localStorage.removeItem('auth_user'); // remove invalid value
      return null;
    }
  },

  setUser(user: User): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('auth_user', JSON.stringify(user));
  },

  removeUser(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('auth_user');
  },

  async verifyToken(): Promise<boolean> {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Use a protected endpoint to verify token
      await api.get('/posts');
      return true;
    } catch (error) {
      return false;
    }
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
